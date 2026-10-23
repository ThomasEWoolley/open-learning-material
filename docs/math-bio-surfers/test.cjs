// Development checks: npm install --no-save jsdom, then node test.cjs.
// The distributed game has no runtime package dependencies.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {JSDOM, VirtualConsole} = require('jsdom');
const html = fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const data = JSON.parse(fs.readFileSync(path.join(__dirname,'questions.json'),'utf8'));
let checks = 0;
const ok = (value, message) => { assert.ok(value, message); checks++; };
const eq = (a,b,message) => { assert.equal(a,b,message); checks++; };

function setup({width=1280,height=900,storage={},storageBlocked=false}={}) {
  let now=1000; const errors=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>errors.push(e));
  // Expose the engine in memory for tests only; the built game has no test API.
  const instrumented=html.replace('boot({});',`window.__test={get G(){return G;},get Q(){return Q;},get player(){return player;},get progress(){return chapterProgress;},get selected(){return [...selectedLevels];},sampleQuestions,askQuestion,answerQ,continueQ,gameOver,startRun,spawnChallenge,spawnAhead,render,update,move,jump,pause,resume,resolveRow,crash,continueFromCard,updateHud,toMenu,introSequence}; boot({});`);
  const dom=new JSDOM(instrumented,{url:'https://mathbio.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
    w.matchMedia=()=>({matches:false,addEventListener(){}});
    w.requestAnimationFrame=()=>1;
    w.setTimeout=()=>1; w.clearTimeout=()=>{};
    Object.defineProperty(w.performance,'now',{value:()=>now});
    w.HTMLElement.prototype.getBoundingClientRect=function(){return {x:0,y:0,left:0,top:0,width,height,right:width,bottom:height};};
    const context=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(t,k)=>k in t?t[k]:(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
    w.HTMLCanvasElement.prototype.getContext=()=>context;
    if(storageBlocked) Object.defineProperty(w,'localStorage',{get(){throw new Error('Storage unavailable');}});
    else for(const [k,v] of Object.entries(storage)) w.localStorage.setItem(k,v);
  }});
  const w=dom.window, d=w.document, t=w.__test;
  ok(Boolean(t),'App boots'); eq(errors.length,0,'No script errors on boot');
  const click=id=>d.getElementById(id).click();
  const mode=v=>{d.getElementById('modeSelect').value=v; d.getElementById('modeSelect').dispatchEvent(new w.Event('change'));};
  return {dom,w,d,t,click,mode,advance:()=>now+=500,errors};
}
function answer(env,correct=true){
  const {t,d,advance}=env; advance();
  const right=t.Q.gate.order.indexOf(t.Q.gate.item.answer);
  d.querySelectorAll('.q-opt')[correct?right:(right+1)%3].click();
  advance(); d.getElementById('qGo').click();
}
function complete(env,level,numCorrect=12){
  env.click('level-'+level);env.mode('study');env.click('startBtn');
  const seen=new Set();
  for(let i=0;i<12;i++){
    eq(env.t.Q.gate.item.level,level,'Chapter isolation');
    ok(!seen.has(env.t.Q.gate.item.id),'No repeated questions in a session');seen.add(env.t.Q.gate.item.id);
    answer(env,i<numCorrect);
  }
  eq(env.t.G.state,'over','Finite session ends');eq(env.t.G.asked,12,'Twelve answers counted');eq(env.t.G.correct,numCorrect,'Accuracy counted');
}

const env=setup();
eq(env.d.querySelectorAll('.level').length,4,'Four levels displayed');
eq(env.d.querySelectorAll('.level[aria-pressed="true"]').length,1,'One chapter selected');
eq(env.d.getElementById('menuSoundBtn').textContent,'Sound and music: off','Sound starts off');
for(let l=1;l<=4;l++){
  for(let j=0;j<50;j++){
    const sample=env.t.sampleQuestions(l);eq(sample.length,12,'Sample size');eq(new Set(sample.map(q=>q.id)).size,12,'Distinct sample');
    for(let difficulty=1;difficulty<=3;difficulty++)eq(sample.filter(q=>q.difficulty===difficulty).length,4,'Difficulty balance');
  }
  complete(env,l);
  ok(env.t.progress[l].completed,'Chapter badge earned');eq(env.t.progress[l].bestPercent,100,'Best accuracy saved');
  env.click('menuBtn');ok(env.d.getElementById('level-'+l).textContent.includes('Completed'),'Badge shown in menu');
}
const stored={};for(let i=0;i<env.w.localStorage.length;i++){const k=env.w.localStorage.key(i);stored[k]=env.w.localStorage.getItem(k);}
const restored=setup({width:390,height:844,storage:stored});
for(let l=1;l<=4;l++)ok(restored.d.getElementById('level-'+l).textContent.includes('Completed'),'Progress restored');
restored.click('level-2');eq(restored.t.selected[0],2,'Selection updates');
restored.click('startBtn');restored.t.render(1);ok(true,'Render functions execute at mobile dimensions');
restored.click('qExit');eq(restored.t.G.state,'over','End session exits question');
eq(restored.t.progress[2].sessions,1,'Early exit does not add completed session');

const fail=setup();complete(fail,1,8);ok(!fail.t.progress[1].completed,'Eight of twelve is below threshold');
eq(fail.d.getElementById('resultHeading').textContent,'Keep practising','Failed session has helpful label');
eq(fail.d.querySelectorAll('#reviewList li').length,4,'All missed questions reviewed');
ok(fail.d.getElementById('reviewList').textContent.includes('Course notes §'),'Review has section references');
fail.click('menuBtn');complete(fail,1,9);ok(fail.t.progress[1].completed,'Nine of twelve meets threshold');
fail.click('menuBtn');complete(fail,1,0);ok(fail.t.progress[1].completed,'A poorer run does not remove badge');eq(fail.t.progress[1].bestPercent,75,'A poorer run does not lower best accuracy');

const single=setup();single.mode('study');single.click('startBtn');single.advance();
const right=single.t.Q.gate.order.indexOf(0);single.t.answerQ(right);single.t.answerQ(right);
eq(single.t.G.asked,1,'Duplicate answer does not double-count');eq(single.t.G.lives,3,'Study answers do not consume lives');
ok(single.d.getElementById('qWhy').textContent.includes('Course notes §'),'Immediate feedback has source');
const frozen=single.t.G.dist;single.t.update(0.05);eq(single.t.G.dist,frozen,'No movement while question open');

const runner=setup();runner.click('level-3');runner.click('startBtn');eq(runner.t.G.mode,'runner','Runner mode starts');
runner.t.move(-1);eq(runner.t.player.lane,0,'Left control works');runner.t.jump();runner.t.update(0.05);ok(runner.t.player.y>0,'Jump moves player');
runner.t.pause();eq(runner.t.G.state,'paused','Pause works');runner.t.resume();eq(runner.t.G.state,'run','Resume works');
runner.t.G.objs=[];runner.t.G.seq=null;runner.t.G.challengeN=2;runner.t.spawnChallenge();
ok(runner.t.G.seq,'Procedure challenge spawned');eq(runner.t.G.seq.item.level,3,'Procedure is chapter-specific');
const sequence=runner.t.G.seq;runner.t.introSequence(sequence);runner.advance();runner.t.continueQ();
for(const row of sequence.rows){row.done=true;runner.t.resolveRow(row,row.correctLane);}
eq(runner.t.G.seqDone,1,'Correct procedure completes');eq(runner.t.G.seq,null,'Completed procedure clears');
runner.t.crash({bug:data.bugs.find(b=>b.level===3)});eq(runner.t.G.lives,2,'Collision costs one life');
ok(runner.d.getElementById('fbWhy').textContent.includes('Course notes §'),'Misconception feedback has source');runner.advance();runner.t.continueFromCard();
eq(runner.t.G.state,'run','Continue after collision');
for(let i=0;i<2;i++){runner.t.crash({bug:data.bugs.find(b=>b.level===3)});runner.advance();runner.t.continueFromCard();}
eq(runner.t.G.state,'over','Three collisions end run');ok(!runner.t.progress[3],'Early runner defeat earns no badge');

const blocked=setup({storageBlocked:true});blocked.mode('study');blocked.click('startBtn');blocked.t.render(2);blocked.click('qExit');eq(blocked.t.G.state,'over','App works without local storage');
const uniqueIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);eq(new Set(uniqueIds).size,uniqueIds.length,'No duplicate DOM IDs');
ok(!/<script[^>]+src=|fonts\.google|window\.claude|ENGSCI 205|torch\./i.test(html),'No external runtime, original course bank or host dependency');
for(const e of [env,restored,fail,single,runner,blocked]){eq(e.errors.length,0,'No script exceptions during session checks');e.dom.window.close();}
console.log(`PASS: ${checks} checks. DOM/session tests use jsdom with a stubbed canvas; pixel layout and live browser behaviour are not covered.`);
