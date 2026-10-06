import assert from 'node:assert/strict';
import { articles, search, isGreeting, isVague, isExternal, helpIntent } from '../.sites-runtime/retrieval.mjs';
assert.equal(articles.length,132);
for(const article of articles){const found=search(article.problem)[0];assert.equal(found.problem,article.problem);assert.ok(found.score>.99);}
assert.ok(isGreeting('أهلاً!'));assert.ok(isGreeting('السلام عليكم'));assert.ok(!isGreeting('السلام عليكم الإنترنت لا يعمل'));
assert.ok(isVague('عندي مشكلة'));assert.ok(isExternal('نتفليكس لا يعمل'));assert.ok(!isExternal('شبكة الجامعة تمنع نتفليكس'));
assert.equal(helpIntent('وش الخدمات الي تقدمها').topic,'services');assert.equal(helpIntent('وين ارسلك لقطه الشاشه').topic,'screenshot');assert.equal(helpIntent('هتا','screenshot').topic,'screenshot');
console.log('Passed: 132 exact retrieval cases, greetings, scope, vague queries, services and screenshot follow-ups.');

const fixtures=[['الواي فاي بالجامعة يفصل كل خمس دقايق','3'],['ما قدرت ارسل مرفق مع الايميل','34'],['البي سي يعلق اذا دخلت موقع الجامعه','111'],['صفحة الجامعة تقول اتصالك ليس خاصا','112'],['نسيت كلمة سر البريد الجامعي','7'],['الفيديو بالمحاضرة ما يسمعني الدكتور','118'],['المتصفح ما يخليني انزل ملف المحاضرة','120'],['الطابعة تسحب ورق ويطلع ابيض','122'],['كيف اتأكد ان واجبي وصل','127'],['موقع الجامعة يقول 403','128'],['البوابة كل شوي تطلب تسجيل دخول','131']];
for(const [query,id] of fixtures) assert.ok(search(query,5).some(v=>v.id===id),`Relevant article ${id} absent for ${query}`);
for(const article of articles)for(const alias of (article.aliases||'').split('؛').filter(Boolean))assert.ok(search(alias,5).some(v=>v.id===article.id),`Missing alias ${alias}`);
console.log('Passed: dialect regression cases and all aliases.');
