import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=path.join(root,'cloudflare/wrangler.json');
const cli=path.join(root,'node_modules/wrangler/bin/wrangler.js');
async function run(args,{input,capture=false}={}) {
 return await new Promise((resolve,reject)=>{
  let output='';const child=spawn(process.execPath,[cli,...args],{cwd:root,stdio:[input===undefined?'inherit':'pipe',capture?'pipe':'inherit','inherit'],env:{...process.env,WRANGLER_SEND_METRICS:'false',WRANGLER_LOG_PATH:path.join(root,'.sites-runtime/wrangler/logs'),CLOUDFLARE_CF_FETCH_ENABLED:'false'}});
  if(capture)child.stdout.on('data',part=>output+=part);if(input!==undefined)child.stdin.end(input);
  child.on('error',reject);child.on('close',code=>code===0?resolve(output):reject(Error('Cloudflare command failed; no paid plan was enabled.')));
 });
}
if(!existsSync(path.join(root,'dist/server/index.js')))throw Error('Build the web app before deployment.');
const identity=await run(['whoami'],{capture:true});
if(identity.includes('not authenticated'))throw Error('Sign in first: node node_modules/wrangler/bin/wrangler.js login');
const variables={};for(const line of readFileSync(path.join(root,'../.env'),'utf8').split(/\r?\n/)){const m=line.match(/^\s*(GROQ_API_KEY|LLM_MODEL_CONVERSATION)\s*=\s*(.*?)\s*$/);if(m)variables[m[1]]=m[2].replace(/^['"]|['"]$/g,'');}
if(!variables.GROQ_API_KEY?.startsWith('gsk_'))throw Error('Set GROQ_API_KEY in the existing project .env first.');
let settings=JSON.parse(readFileSync(config,'utf8').replace(/^\uFEFF/,''));
if(!settings.d1_databases?.length){
 const listed=await run(['d1','list','--json'],{capture:true});const databases=JSON.parse(listed.slice(listed.indexOf('[')));
 const existing=databases.find(db=>db.name==='smart-complaint-db');
 if(existing){settings.d1_databases=[{binding:'DB',database_name:existing.name,database_id:existing.uuid,migrations_dir:'../drizzle'}];writeFileSync(config,JSON.stringify(settings,null,2)+'\n');}
 else {await run(['d1','create','smart-complaint-db','--binding','DB','--update-config','--config',config]);settings=JSON.parse(readFileSync(config,'utf8'));settings.d1_databases[0].migrations_dir='../drizzle';writeFileSync(config,JSON.stringify(settings,null,2)+'\n');}
}
await run(['d1','migrations','apply','smart-complaint-db','--remote','--config',config]);
await run(['deploy','--config',config]);
// Put secrets into the provider by stdin, never shell arguments or source files.
await run(['secret','bulk','--config',config],{input:JSON.stringify({GROQ_API_KEY:variables.GROQ_API_KEY})+'\n'});
console.log('Deployment and server-side Groq secret configured. Keep the Cloudflare account on Workers Free.');
