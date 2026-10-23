// Check live-bank loading and offline fallback without a browser binary.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const original=JSON.parse(fs.readFileSync(__dirname+'/questions.json','utf8'));
const html=fs.readFileSync(__dirname+'/index.html','utf8').replace('boot({});','window.__loadTest={bank:()=>BANK,askQuestion}; boot({});');
const clone=x=>JSON.parse(JSON.stringify(x));
let checks=0;
const eq=(a,b,m)=>{assert.equal(a,b,m);checks++;};
const wait=()=>new Promise(r=>setTimeout(r,20));
async function run(response,{offline=false,pending=false}={}){
  const calls=[],errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));let release;
  const dom=new JSDOM(html,{url:offline?'file:///game.html':'https://mathbio.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
    w.matchMedia=()=>({matches:false});w.requestAnimationFrame=()=>1;w.setTimeout=()=>1;w.clearTimeout=()=>{};
    w.HTMLElement.prototype.getBoundingClientRect=()=>({width:1200,height:850,left:0,top:0,right:1200,bottom:850});
    w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{}});
    w.fetch=async(url,options)=>{calls.push({url,options});if(pending)await new Promise(r=>release=r);if(response instanceof Error)throw response;return response;};
  }});
  if(pending){eq(dom.window.document.getElementById('startBtn').disabled,true,'Start disabled while bank is loading');release();}
  await wait();return {dom,w:dom.window,d:dom.window.document,calls,errors};
}
(async()=>{
  const latest=clone(original);latest.gates[0].prompt='Changed on the server';const copy=clone(latest.gates[0]);copy.id='L1-Q25';latest.gates.push(copy);
  const loaded=await run({ok:true,json:async()=>latest},{pending:true});
  eq(loaded.w.__loadTest.bank().gates[0].prompt,'Changed on the server','Live bank replaces embedded content');eq(loaded.w.__loadTest.bank().gates.length,97,'Added questions are loaded');
  eq(loaded.calls[0].options.cache,'no-store','Browser caching is bypassed');eq(loaded.d.getElementById('bankLoadStatus').hidden,true,'No fallback warning for valid bank');eq(loaded.d.getElementById('startBtn').disabled,false,'Start enabled after loading');eq(loaded.d.getElementById('level-1').textContent.includes('25 questions'),true,'Menu count comes from live bank');
  const invalid=clone(original);invalid.gates[0].answer=10;
  const all=[loaded];
  for(const response of [{ok:true,json:async()=>invalid},new Error('Network failed'),{ok:false,status:404},{ok:true,json:async()=>{throw Error('Bad JSON');}}]){
    const r=await run(response);all.push(r);eq(r.w.__loadTest.bank().gates[0].prompt,original.gates[0].prompt,'Failed bank load retains embedded backup');eq(r.d.getElementById('bankLoadStatus').hidden,false,'Fallback is visible');eq(r.d.getElementById('startBtn').disabled,false,'Backup remains playable');
  }
  const offline=await run(new Error('Do not fetch'),{offline:true});all.push(offline);eq(offline.calls.length,0,'Downloaded offline game does not fetch');eq(offline.d.getElementById('startBtn').disabled,false,'Offline game boots');
  for(const r of all){eq(r.errors.length,0,'No loading script exceptions');r.dom.window.close();}
  console.log(`PASS: ${checks} live question-bank loading and fallback checks.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
