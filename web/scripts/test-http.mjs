import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN || 'http://127.0.0.1:5173';let cookie='';
async function chat(message,extra={},id=crypto.randomUUID()){
 const r=await fetch(origin+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify({message,requestId:id,...extra})});
 const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return {status:r.status,body:await r.json()};
}
let r=await fetch(origin+'/api/health');assert.equal(r.status,200);assert.equal((await r.json()).aiConfigured,true);
assert.equal((await chat('أهلاً!',{reset:true})).body.kind,'general');
const id=crypto.randomUUID();let solution=await chat('الإنترنت بطيء جداً',{},id);assert.equal(solution.body.kind,'solution');assert.ok(solution.body.source);console.log('Groq live request:',solution.body.aiAvailable?'successful':'local fallback');assert.deepEqual((await chat('الإنترنت بطيء جداً',{},id)).body,solution.body);
let services=await chat('وش الخدمات الي تقدمها');assert.ok(services.body.text.includes('البريد الجامعي'));
let screenshot=await chat('وين ارسلك لقطه الشاشه');assert.ok(screenshot.body.text.includes('رفع الصور غير متاح'));
let typo=await chat('هتا');assert.ok(typo.body.text.includes('تستقبل النص فقط'));
let vague=await chat('عندي مشكلة',{reset:true});assert.equal(vague.body.kind,'clarify');
let unresolved=await chat('مشكلة غير معروفة',{escalate:true});assert.equal(unresolved.body.kind,'unresolved');assert.ok(!unresolved.body.ticket);
assert.equal((await chat('x'.repeat(2001))).status,400);
r=await fetch(origin+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://attacker.example'},body:JSON.stringify({message:'hello',requestId:crypto.randomUUID()})});assert.equal(r.status,403);
console.log('Passed: health, greeting, grounded solution, idempotent retry, services, screenshot and typo follow-up, clarification, unresolved response, validation and cross-origin rejection.');
