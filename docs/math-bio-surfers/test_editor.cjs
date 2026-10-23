// Development-only checks: npm install --no-save jsdom; node test_editor.cjs.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const tools=require('./bank-tools.js');
const root=__dirname,read=name=>fs.readFileSync(path.join(root,name),'utf8');
const original=JSON.parse(read('questions.json')),copy=x=>JSON.parse(JSON.stringify(x));
let checks=0;
function eq(a,b,m){assert.equal(a,b,m);checks++;}
function ok(a,m){assert.ok(a,m);checks++;}
const delay=ms=>new Promise(r=>setTimeout(r,ms));

async function setup({bank=original,storage={},fail=false}={}){
  const errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
  const dom=new JSDOM(read('editor.html'),{url:'https://mathbio.test/editor.html',runScripts:'outside-only',virtualConsole:vc});
  const w=dom.window,d=w.document;
  for(const [k,v]of Object.entries(storage))w.localStorage.setItem(k,v);
  w.confirm=()=>true;
  w.fetch=async url=>{if(fail&&url==='questions.json')throw Error('Offline');return {ok:true,status:200,json:async()=>copy(bank),text:async()=>url==='questions.json'?JSON.stringify(bank):read(url)};};
  w.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:test';};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
  w.eval(read('bank-tools.js'));w.eval(read('editor.js'));await delay(20);
  const click=id=>d.getElementById(id).click();
  function select(id,value){d.getElementById(id).value=String(value);d.getElementById(id).dispatchEvent(new w.Event('change'));}
  function field(name){const label=[...d.querySelectorAll('#itemForm label.field')].find(e=>e.firstChild?.textContent===name);assert.ok(label,'Field exists: '+name);return label.querySelector('input,textarea,select');}
  function fill(name,value){const e=field(name);e.value=value;e.dispatchEvent(new w.Event('input'));}
  const blobText=blob=>new Promise((resolve,reject)=>{const reader=new w.FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsText(blob);});
  return {dom,w,d,errors,downloads,click,select,field,fill,blobText};
}

(async()=>{
  eq(tools.validateBank(original).length,0,'Original bank validates');
  for(const mutation of [b=>b.gates[0].options=['A','A','B'],b=>b.gates[0].answer=3,b=>b.gates[0].why='',b=>b.gates[0].level=99,b=>b.gates[1].id=b.gates[0].id,b=>b.sequences[0].steps=['Only one'],b=>b.bugs[0].tip='',b=>b.runQuestions=4,b=>b.levels[0].colour='url(evil)',b=>b.gates=b.gates.filter(q=>q.level!==4)]){
    const b=copy(original);mutation(b);ok(tools.validateBank(b).length>0,'Malformed bank is rejected');
  }
  const e=await setup();ok(!e.d.getElementById('workspace').hidden,'Editor loads bank');eq(e.d.querySelectorAll('.item').length,24,'Lists chapter questions');
  e.fill('Question','Revised population question?');e.fill('Explanation shown after answering','A new worked explanation.');
  e.d.querySelector('input[name="correct"][value="2"]').click();
  e.click('downloadBtn');let bank=JSON.parse(await e.blobText(e.downloads.at(-1)));
  eq(bank.gates[0].prompt,'Revised population question?','Wording exported');eq(bank.gates[0].answer,2,'Correct answer exported');eq(bank.gates[0].why,'A new worked explanation.','Explanation exported');
  eq(original.gates[0].prompt.startsWith('What makes'),true,'Published fixture unchanged');
  e.d.querySelectorAll('.preview-answer')[2].click();ok(e.d.getElementById('preview').textContent.includes('✓ Correct'),'Interactive preview scores answer');
  e.fill('Answer 2',e.field('Answer 1').value);ok(e.d.getElementById('downloadBtn').disabled,'Duplicate answers block export');
  e.fill('Answer 2','A distinct alternative');ok(!e.d.getElementById('downloadBtn').disabled,'Repair restores export');
  e.fill('Question','</script><script>alert(1)</script>');eq(e.d.getElementById('preview').querySelectorAll('script').length,0,'Preview treats markup as text');
  e.click('gameDownloadBtn');await delay(20);const html=await e.blobText(e.downloads.at(-1));
  ok(!html.includes('__QUESTION_BANK__')&&!html.includes('__BANK_TOOLS__'),'Offline game placeholders filled');
  const embedded=JSON.parse(html.match(/<script type="application\/json" id="bank">\s*([\s\S]*?)<\/script>/)[1]);
  eq(embedded.gates[0].prompt,'</script><script>alert(1)</script>','HTML export safely round-trips markup');
  for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(match[1]);ok(true,'Exported game scripts have valid syntax');
  e.fill('Question','Revised population question?');
  [...e.d.querySelectorAll('#itemForm .form-actions button')].find(b=>b.textContent.startsWith('Duplicate')).click();eq(e.d.querySelectorAll('.item').length,25,'Duplicate adds item');
  e.click('downloadBtn');bank=JSON.parse(await e.blobText(e.downloads.at(-1)));eq(new Set(bank.gates.map(q=>q.id)).size,97,'Duplicate receives unique ID');
  [...e.d.querySelectorAll('#itemForm .form-actions button')].find(b=>b.textContent.startsWith('Delete')).click();eq(e.d.querySelectorAll('.item').length,24,'Delete removes item');e.fill('Answer 3','Changed after deletion');e.click('undoBtn');eq(e.d.querySelectorAll('.item').length,25,'Undo restores deletion');e.click('downloadBtn');bank=JSON.parse(await e.blobText(e.downloads.at(-1)));eq(bank.gates[0].options[2],'Changed after deletion','Undo preserves subsequent edits');
  e.click('addBtn');ok(e.d.getElementById('downloadBtn').disabled,'Incomplete new item blocks export');
  e.fill('Question','New mathematical question?');e.fill('Answer 1','Correct');e.fill('Answer 2','Alternative');e.fill('Answer 3','Other');e.fill('Explanation shown after answering','Worked explanation.');ok(!e.d.getElementById('downloadBtn').disabled,'Completed new item validates');
  e.select('kindFilter','sequences');eq(e.d.querySelectorAll('.item').length,3,'Procedures listed');
  const before=[...e.d.querySelectorAll('.step-row input')].map(i=>i.value);e.d.getElementsByTagName('form')[0].querySelector('[aria-label="Move step 1 down"]').click();
  const after=[...e.d.querySelectorAll('.step-row input')].map(i=>i.value);eq(after[0],before[1],'Reordering moves second step first');eq(after[1],before[0],'Reordering moves first step second');
  e.fill('Procedure title','Updated procedure');e.select('kindFilter','bugs');e.fill('Short obstacle name','Updated misconception');e.fill('Corrective feedback','Explain the correct method.');
  e.click('downloadBtn');bank=JSON.parse(await e.blobText(e.downloads.at(-1)));eq(bank.sequences[0].title,'Updated procedure','Procedure export');eq(bank.bugs[0].tip,'Explain the correct method.','Misconception export');
  await delay(420);const storage={};for(let i=0;i<e.w.localStorage.length;i++){const k=e.w.localStorage.key(i);storage[k]=e.w.localStorage.getItem(k);}
  const restored=await setup({storage});ok(!restored.d.getElementById('draftNotice').hidden,'Saved draft offered');eq(restored.field('Question').value,original.gates[0].prompt,'Draft does not silently replace published bank');restored.click('restoreDraft');eq(restored.field('Question').value,'Revised population question?','Explicit restore works');
  const newer=copy(original);newer.gates[0].why='Changed on server';const conflict=await setup({bank:newer,storage});ok(conflict.d.getElementById('draftText').textContent.includes('published bank has changed'),'Stale draft warning shown');
  const bad=copy(original);bad.gates[0].options=['','',''];Object.defineProperty(e.d.getElementById('importFile'),'files',{configurable:true,value:[{name:'bad.json',text:async()=>JSON.stringify(bad)}]});e.d.getElementById('importFile').dispatchEvent(new e.w.Event('change'));await delay(20);ok(!e.d.getElementById('loadError').hidden,'Invalid import reports errors');
  const minimum=copy(original);minimum.gates=minimum.gates.filter((q,i)=>i%24<12);const m=await setup({bank:minimum});[...m.d.querySelectorAll('#itemForm .form-actions button')].find(b=>b.textContent.startsWith('Delete')).click();ok(m.d.getElementById('downloadBtn').disabled,'Too few chapter questions blocks export');m.click('undoBtn');ok(!m.d.getElementById('downloadBtn').disabled,'Undo repairs minimum count');
  const offline=await setup({fail:true});ok(!offline.d.getElementById('loadError').hidden,'Load failure is visible');Object.defineProperty(offline.d.getElementById('importFile'),'files',{configurable:true,value:[{name:'questions.json',text:async()=>JSON.stringify(original)}]});offline.d.getElementById('importFile').dispatchEvent(new offline.w.Event('change'));await delay(20);ok(!offline.d.getElementById('workspace').hidden,'Import works after network failure');
  for(const instance of [e,restored,conflict,m,offline]){eq(instance.errors.length,0,'No editor script exceptions');instance.dom.window.close();}
  console.log(`PASS: ${checks} editor checks, including exports, validation, previews, CRUD, procedures, drafts, stale-draft warning and failed-load recovery.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
