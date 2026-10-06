"use client";
import {useState,useEffect,useRef} from "react";
import {Send,Download,Plus,LoaderCircle} from "lucide-react";
type Reply={kind:string;text:string;ticket?:{id:string;token:string};error?:string};
type Message={role:"user"|"assistant";text:string};
const welcome:Message={role:"assistant",text:"أهلاً بك! أنا مساعدك للدعم الفني الجامعي. اكتب المشكلة التي تواجهها وسأساعدك."};
export default function Home(){
 const [messages,setMessages]=useState<Message[]>([welcome]),[draft,setDraft]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[saved,setSaved]=useState(false);
 const bottom=useRef<HTMLDivElement>(null),sending=useRef(false),reset=useRef(true),pending=useRef<{message:string;id:string}|null>(null);
 useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[messages,busy]);
 async function send(){const message=draft.trim();if(!message||sending.current||message.length>2000)return;
  sending.current=true;setBusy(true);setError("");setSaved(false);
  const retry=pending.current?.message===message;const id=retry?pending.current!.id:crypto.randomUUID();
  if(!retry)setMessages(old=>[...old,{role:"user",text:message}]);pending.current={message,id};
  try{const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,requestId:id,reset:reset.current})});const body=await response.json() as Reply;if(!response.ok)throw Error(body.error||"تعذر إرسال الرسالة. حاول مرة أخرى.");
   const text=body.kind==="ticket"?"لم أجد حلاً موثّقاً لهذه المشكلة. يمكنك مراجعة الدعم الفني في الجامعة مع وصف المشكلة والخطوات التي جرّبتها.":body.text;
   setMessages(old=>[...old,{role:"assistant",text}]);setDraft("");pending.current=null;reset.current=false;
  }catch(e){setError(e instanceof Error?e.message:"تعذر الاتصال. حاول مرة أخرى.");}finally{sending.current=false;setBusy(false);}
 }
 function save(){const content=messages.map(m=>`${m.role==="user"?"أنت":"المساعد"}: ${m.text}`).join("\n\n");const url=URL.createObjectURL(new Blob(["\uFEFF"+content],{type:"text/plain;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download="محادثة-الدعم-الفني.txt";link.click();URL.revokeObjectURL(url);setSaved(true);}
 function clear(){setMessages([welcome]);setDraft("");setError("");setSaved(false);reset.current=true;pending.current=null;}
 return <main className="chat-app"><header><div><h1>المساعد الذكي للدعم الفني</h1><p>مشروع طلابي · خدمات الجامعة التقنية</p></div><div className="actions"><button onClick={save} disabled={messages.length<2||busy} title="تنزيل نسخة نصية من المحادثة"><Download size={16}/><span>{saved?"تم تنزيل المحادثة":"حفظ المحادثة"}</span></button><button onClick={clear} disabled={busy} aria-label="محادثة جديدة" title="محادثة جديدة"><Plus size={19}/></button></div></header>
 <section className="messages" aria-label="المحادثة" role="log" aria-live="polite" aria-busy={busy}>{messages.map((m,i)=><div key={i} className={`message ${m.role}`}><small>{m.role==="user"?"أنت":"المساعد"}</small><p>{m.text}</p></div>)}{busy&&<div className="thinking"><LoaderCircle size={15} className="spin"/> جارٍ الرد…</div>}<div ref={bottom}/></section>
 <form onSubmit={e=>{e.preventDefault();void send();}}>{error&&<p className="error" role="alert">{error}</p>}<div className="composer"><textarea aria-label="رسالتك" placeholder="اكتب رسالتك هنا…" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={2000} rows={1} disabled={busy} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send();}}}/><button type="submit" disabled={busy||!draft.trim()} aria-label="إرسال">{busy?<LoaderCircle size={18} className="spin"/>:<Send size={18}/>}</button></div><p className="privacy">لا تشارك بيانات حساسة. قد تُرسل رسالتك إلى Groq لفهم المشكلة.</p></form>
 </main>;
}
