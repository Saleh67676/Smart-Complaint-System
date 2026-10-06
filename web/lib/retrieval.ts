import knowledge from "../knowledge.json";
export type Article = { id: string; problem: string; solution: string; department: string; aliases?: string };
export const articles: Article[] = knowledge;
export function normalize(text: string) {
  return text.toLowerCase().replace(/[إأآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
function grams(text: string) {
  const result = new Map<string, number>();
  for (const word of normalize(text).split(" ")) {
    const padded = ` ${word} `;
    for (let size = 2; size <= 4; size++) for (let i = 0; i <= padded.length - size; i++) {
      const gram = padded.slice(i, i + size); result.set(gram, (result.get(gram) ?? 0) + 1);
    }
  }
  return result;
}
const docs = articles.map(a => grams([a.problem,a.aliases||""].join(" ")));
const frequencies = new Map<string, number>();
for (const doc of docs) for (const key of doc.keys()) frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
function vector(doc: Map<string, number>) {
  const v = new Map<string, number>(); let magnitude = 0;
  for (const [key, count] of doc) {
    if (!frequencies.has(key)) continue;
    const value = (1 + Math.log(count)) * (1 + Math.log((docs.length + 1) / ((frequencies.get(key) ?? 0) + 1)));
    v.set(key, value); magnitude += value * value;
  }
  magnitude = Math.sqrt(magnitude);
  if (magnitude) for (const [key, value] of v) v.set(key, value / magnitude);
  return v;
}
const vectors = docs.map(vector);
export function search(query: string, count = 5) {
  const q = vector(grams(query));
  return articles.map((article, i) => { let score = 0; for (const [key, value] of q) score += value * (vectors[i].get(key) ?? 0); if ([article.problem,...(article.aliases||"").split("؛")].some(v=>normalize(v)===normalize(query))) score=1; return { ...article, score }; }).sort((a,b) => b.score - a.score).slice(0,count);
}
const greetings = new Set(["مرحبا", "اهلا", "هلا", "السلام عليكم", "السلام عليكم ورحمه الله", "صباح الخير", "مساء الخير", "hello", "hi", "hey", "شكرا", "شكراً"].map(normalize));
export const isGreeting = (text: string) => greetings.has(normalize(text));
export const isVague = (text: string) => ["عندي مشكله", "مشكله", "ساعدني", "احتاج مساعده", "i need help", "help"].includes(normalize(text));
export const isExternal = (text: string) => /netflix|نتفليكس|spotify|سبوتيفاي|playstation|بلايستيشن|tiktok|تيك توك|snapchat|سناب شات|instagram|انستقرام|xbox|اكس بوكس/i.test(text) && !/جامع|university|campus/i.test(text);

export function helpIntent(message:string,lastTopic="") {
  const text=normalize(message);
  if(/خدماتك|وش.*(?:خدمات|تقدم|تساعد)|ايش.*(?:خدمات|تقدم|تساعد)|ما هي.*خدمات|ما الخدمات|what.*(?:services|help)|كيف.*تساعد/.test(text))return {topic:"services",text:"أساعدك في مشكلات الشبكة والإنترنت، البريد الجامعي، البوابة الإلكترونية، الأنظمة التعليمية، والأجهزة والطابعات الجامعية. أبحث في دليل الحلول، وأسأل عن تفاصيل عند الحاجة، وأقترح الرجوع إلى الدعم الرسمي إذا لم نجد حلاً. يمكنك حفظ المحادثة من الزر أعلى الصفحة. تقدر تبدأ باسم الخدمة ووصف المشكلة."};
  if(/لقطه|لقطات|سكرين|screenshot|صوره.*شاشه|ارسل.*صوره|ارفع.*صوره/.test(text)||lastTopic==="screenshot"&&/^(هنا|هتا|هناا|هني|اي|ايوه|نعم|here)$/.test(text))return {topic:"screenshot",text:"هذه المحادثة تستقبل النص فقط؛ رفع الصور غير متاح حالياً. اكتب نص رسالة الخطأ هنا، أو صف ما يظهر في الشاشة. إذا احتفظت بلقطة شاشة، أخفِ كلمات المرور والبيانات الشخصية قبل مشاركتها عبر قناة الدعم الرسمية للجامعة."};
  return null;
}
export function isFollowup(message:string){return /ما نفع|ما ضبط|ما انحل|لم يعمل|لم يحل|نفس المشكله|جربت|still|didn.t work/.test(normalize(message));}
