import { database, json, sameOrigin, sessionCookie, allowRequest, groqDecision } from "../../../lib/server";
import { search, isGreeting, isVague, isExternal, helpIntent, isFollowup, normalize } from "../../../lib/retrieval";
export async function POST(request: Request) {
  const traceId = crypto.randomUUID(); const started = Date.now();
  console.log({event:"chat.request",traceId,method:request.method,path:new URL(request.url).pathname});
  const response = await handleChat(request,traceId);
  const result = await response.clone().json().catch(()=>({})) as Record<string,unknown>;
  console.log({event:"chat.response",traceId,status:response.status,durationMs:Date.now()-started,kind:result.kind ?? "error",aiAvailable:result.aiAvailable ?? null});
  response.headers.set("X-Request-ID",traceId);
  return response;
}
async function handleChat(request: Request, traceId: string) {
  if (!sameOrigin(request)) return json({error:"طلب غير مسموح."},403);
  if (Number(request.headers.get("content-length")) > 12000) return json({error:"الرسالة طويلة جداً."},413);
  const session = sessionCookie(request); const headers = { "Set-Cookie":session.header }; let locked = false;
  try {
    const input = await request.json() as {message?:unknown; requestId?:unknown; reset?:boolean; escalate?:boolean};
    if (typeof input.message !== "string" || !input.message.trim() || input.message.length > 2000 || typeof input.requestId !== "string" || !/^[a-f0-9-]{36}$/.test(input.requestId)) return json({error:"أدخل رسالة من 1 إلى 2000 حرف."},400,headers);
    const db = database(); const key = `${session.id}:${input.requestId}`;
    const previous = await db.prepare("SELECT reply FROM exchanges WHERE id=?").bind(key).first<{reply:string}>();
    if (previous) { console.log({event:"chat.retry",traceId,cached:true}); return json(JSON.parse(previous.reply),200,headers); }
    if (!(await allowRequest(request))) return json({error:"وصلنا إلى حد الطلبات. حاول بعد قليل."},429,{...headers,"Retry-After":"60"});
    const now = Date.now();
    await db.prepare("INSERT OR IGNORE INTO sessions (id,updated_at) VALUES (?,?)").bind(session.id,now).run();
    const state = await db.prepare("UPDATE sessions SET busy_until=? WHERE id=? AND busy_until < ? RETURNING context,attempt,updated_at,last_problem,last_topic").bind(now+45000,session.id,now).first<{context:string;attempt:number;updated_at:number;last_problem:string;last_topic:string}>();
    if (!state) return json({error:"انتظر حتى ينتهي الطلب السابق."},409,headers);
    locked = true;
    const message = input.message.trim();
    const expired = input.reset || now-state.updated_at>3600000;
    let lastProblem=expired ? "" : state.last_problem; let lastTopic=expired ? "" : state.last_topic;
    const context: string[] = expired ? [] : JSON.parse(state.context);
    let attempt = context.length ? state.attempt : 0; let reply: Record<string,unknown>; let nextContext: string[] = [];
    const operations: D1PreparedStatement[] = [];
    const intent = helpIntent(message,lastTopic);
    if (intent) { reply={kind:"general",text:intent.text}; nextContext=context; lastTopic=intent.topic; } else if (isGreeting(message)) {
      reply = {kind:"general",text:"مرحباً بك! صف المشكلة والخدمة المتأثرة، وسأبحث في دليل الدعم الفني للجامعة.",aiAvailable:true}; nextContext = context;
    } else if (isExternal(message)) {
      reply = {kind:"external",text:"أساعد في خدمات الجامعة التقنية. اكتب مشكلة تتعلق بالشبكة، البريد، البوابة، الأنظمة أو الأجهزة الجامعية."}; nextContext = context;
    } else {
      const previousContext=context.length?context:(!expired&&lastProblem&&isFollowup(message)?[lastProblem]:[]);
      const details = [...previousContext,message].slice(-3); const combined = details.join("\n"); const candidates = search(combined); const best = candidates[0];
      const decision = input.escalate ? null : await groqDecision(combined,candidates.map(({score,...article})=>({...article,similarity:Number(score.toFixed(3))})),traceId);
      const chosen = decision?.type === "solution" ? candidates.find(a=>a.id===String(decision.id)) : undefined;
      const exact = candidates.find(a=>[a.problem,...(a.aliases||"").split("؛")].some(v=>normalize(v)===normalize(message)));
      const safeFallback = !decision && !isFollowup(message) && best.score>=0.72 && best.score-candidates[1].score>=0.12 ? best : undefined;
      const article = input.escalate ? undefined : chosen ?? exact ?? safeFallback;
      if (article && !(isFollowup(message) && lastTopic==="solution:"+article.id) && (!decision || decision.type==="solution" || exact)) {
        lastProblem=combined;lastTopic="solution:"+article.id;
        reply = {kind:"solution",text:article.solution,department:article.department,source:article.problem,aiAvailable:!!decision};
      } else if (decision?.type === "external") {
        reply = {kind:"external",text:"هذا الموضوع خارج نطاق الدعم الفني للجامعة. يمكنني مساعدتك في الخدمات التقنية الجامعية."};
      } else if (decision?.type === "general") {
        reply = {kind:"general",text:"اكتب اسم الخدمة المتأثرة وما الذي يحدث عند استخدامها."};
      } else if (!input.escalate && attempt<2 && (decision?.type==="clarify" || best.score>=0.25 || isVague(message))) {
        nextContext = details; attempt++;
        const question = typeof decision?.question==="string" && decision.question.trim() && decision.question.length<=400 ? decision.question : attempt===1 ? (isFollowup(message) ? "هل تظهر رسالة خطأ؟ اكتب نصها واذكر المتصفح أو البرنامج الذي تستخدمه." : "ما الخدمة التي تواجه فيها المشكلة، وما رسالة الخطأ التي تظهر؟") : "ما الذي يحدث تحديداً بعد المحاولة؟ اكتب التفاصيل دون مشاركة كلمة المرور.";
        reply = {kind:"clarify",text:question,aiAvailable:!!decision};
      } else {
        lastProblem="";lastTopic="unresolved";
        reply = {kind:"unresolved",text:"لم أجد حلاً مناسباً في دليل المشروع لهذه المشكلة. يمكنك مراجعة الدعم الفني في الجامعة مع وصف المشكلة والخطوات التي جرّبتها.",aiAvailable:!!decision};
      }
    }
    console.log({event:"chat.result",traceId,kind:reply.kind,articleId:lastTopic.startsWith("solution:") && reply.kind==="solution" ? lastTopic.slice(9) : null,clarificationAttempt:nextContext.length?attempt:0});
    operations.push(db.prepare("INSERT INTO exchanges (id,session_id,reply,created_at) VALUES (?,?,?,?)").bind(key,session.id,JSON.stringify(reply),now));
    operations.push(db.prepare("UPDATE sessions SET context=?,attempt=?,busy_until=0,updated_at=?,last_problem=?,last_topic=? WHERE id=?").bind(JSON.stringify(nextContext),nextContext.length?attempt:0,now,lastProblem,lastTopic,session.id));
    await db.batch(operations); locked = false;
    return json(reply,200,headers);
  } catch (error) { console.error({event:"chat.error",traceId,errorType:error instanceof Error ? error.name : "UnknownError",stage:"processing_or_storage"}); return json({error:"تعذر حفظ أو معالجة الطلب. رسالتك ما زالت متاحة، حاول مرة أخرى."},503,headers); }
  finally { if (locked) await database().prepare("UPDATE sessions SET busy_until=0 WHERE id=?").bind(session.id).run().catch(()=>{console.error({event:"chat.unlock_error",traceId});}); }
}
