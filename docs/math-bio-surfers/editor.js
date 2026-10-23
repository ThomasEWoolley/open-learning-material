(function () {
  'use strict';
  const $=id=>document.getElementById(id), tools=window.MathBioBank, DRAFT_KEY='math-bio-surfers:editor-draft:v1';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const labels={gates:'question',sequences:'procedure',bugs:'misconception'};
  let bank=null, publishedText='', selected=null, dirty=false, draft=null, undo=null, draftTimer=null;
  function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
  function status(text){$('status').textContent=text;}
  function canEdit(){return Boolean(bank);}
  function errors(){return tools.validateBank(bank);}
  function saveDraft(){
    if(!dirty || !bank)return;
    try{localStorage.setItem(DRAFT_KEY,JSON.stringify({bank,base:publishedText,savedAt:new Date().toISOString()}));status('Draft saved in this browser. Download it when you are ready to publish.');}
    catch{status('This browser cannot save drafts. Download a copy before closing the editor.');}
  }
  function changed(){dirty=true;clearTimeout(draftTimer);draftTimer=setTimeout(saveDraft,350);renderList();renderPreview();renderValidation();status('Unpublished changes.');}
  function renderSummary(){if(bank)$('bankSummary').textContent=`${bank.gates.length} questions · ${bank.sequences.length} procedures · ${bank.bugs.length} misconceptions`;}
  function renderValidation(){
    renderSummary();const list=errors(),wrap=$('validation');wrap.replaceChildren();wrap.className='validation '+(list.length?'bad':'good');
    wrap.append(node('b','',list.length?`${list.length} ${list.length===1?'issue':'issues'} to fix before downloading`:'✓ All checks passed. Ready to download.'));
    if(list.length){const ul=node('ul');for(const e of list)ul.append(node('li','',e));wrap.append(ul);}
    $('downloadBtn').disabled=Boolean(list.length);$('gameDownloadBtn').disabled=Boolean(list.length);
  }
  function current(){return selected===null?null:bank[$('kindFilter').value][selected];}
  function title(item){return item.prompt || item.title || item.name || '(New item)';}
  function renderList(){
    if(!bank)return;const kind=$('kindFilter').value,level=Number($('levelFilter').value),query=$('search').value.trim().toLowerCase(),wrap=$('itemList');wrap.replaceChildren();
    bank[kind].forEach((item,index)=>{
      if(item.level!==level || (query && !JSON.stringify(item).toLowerCase().includes(query)))return;
      const b=node('button','item');b.type='button';b.setAttribute('aria-pressed',String(index===selected));
      b.append(node('strong','',item.id || `Misconception ${index+1}`),node('span','',title(item)));
      b.addEventListener('click',()=>{selected=index;renderList();renderForm();renderPreview();});wrap.append(b);
    });
    if(!wrap.children.length)wrap.append(node('p','empty','No matching items. Change the filters or add a new item.'));
    $('addBtn').textContent='Add '+labels[kind];
  }
  function field(label,value,onInput,{tag='input',type='text',tall=false}={}){
    const wrap=node('label','field',label),el=node(tag,tall?'tall':'');if(tag==='input')el.type=type;el.value=value??'';
    el.addEventListener('input',()=>{onInput(el.value);changed();});wrap.append(el);return wrap;
  }
  function select(label,value,options,onChange){
    const wrap=node('label','field',label),el=node('select');for(const [v,t]of options){const o=node('option','',t);o.value=String(v);el.append(o);}el.value=String(value);
    el.addEventListener('change',()=>{onChange(el.value);changed();});wrap.append(el);return wrap;
  }
  function renderForm(){
    const form=$('itemForm'),item=current(),kind=$('kindFilter').value;form.replaceChildren();
    if(!item){form.append(node('p','hint','Select an item on the left to start editing.'));$('formTitle').textContent='Choose an item';$('formHint').textContent='';return;}
    $('formTitle').textContent='Edit '+labels[kind];$('formHint').textContent='Changes remain local until you upload the downloaded file to GitHub.';
    const pair=node('div','pair');pair.append(select('Chapter level',item.level,bank.levels.map(l=>[l.id,`Level ${l.id}: ${l.title}`]),v=>{item.level=Number(v);$('levelFilter').value=v;}));
    if(kind==='gates')pair.append(select('Difficulty',item.difficulty,[[1,'1 · Recall'],[2,'2 · Application'],[3,'3 · Reasoning']],v=>item.difficulty=Number(v)));
    form.append(pair);
    if(kind==='gates'){
      form.append(field('Question',item.prompt,v=>item.prompt=v,{tag:'textarea',tall:true}));
      const fs=node('fieldset'),legend=node('legend','','Answers: select the correct one'),answers=node('div','answers');fs.append(legend,answers);
      for(let i=0;i<3;i++){
        const row=node('div','answer'),radio=node('input');radio.type='radio';radio.name='correct';radio.value=String(i);radio.checked=item.answer===i;radio.setAttribute('aria-label',`Answer ${i+1} is correct`);
        radio.addEventListener('change',()=>{item.answer=i;changed();});
        row.append(radio,field(`Answer ${i+1}`,item.options[i],v=>item.options[i]=v,{tag:'textarea'}));answers.append(row);
      }
      form.append(fs,field('Explanation shown after answering',item.why,v=>item.why=v,{tag:'textarea',tall:true}));
    }else if(kind==='sequences'){
      form.append(field('Procedure title',item.title,v=>item.title=v));
      const stepWrap=node('div','step-list');stepWrap.append(node('h3','','Steps in the correct order'));
      item.steps.forEach((step,i)=>{
        const row=node('div','step-row');row.append(node('b','',String(i+1)));
        const input=node('input');input.type='text';input.value=step;input.setAttribute('aria-label',`Step ${i+1}`);input.addEventListener('input',()=>{item.steps[i]=input.value;changed();});row.append(input);
        const controls=node('div','step-controls');
        for(const [symbol,delta]of [['↑',-1],['↓',1]]){const b=node('button','button small',symbol);b.type='button';b.setAttribute('aria-label',`Move step ${i+1} ${delta<0?'up':'down'}`);b.disabled=i+delta<0||i+delta>=item.steps.length;b.addEventListener('click',()=>{[item.steps[i],item.steps[i+delta]]=[item.steps[i+delta],item.steps[i]];changed();renderForm();});controls.append(b);}
        const remove=node('button','button small','×');remove.type='button';remove.setAttribute('aria-label',`Remove step ${i+1}`);remove.disabled=item.steps.length<=3;remove.addEventListener('click',()=>{item.steps.splice(i,1);changed();renderForm();});controls.append(remove);row.append(controls);stepWrap.append(row);
      });
      const add=node('button','button','Add step');add.type='button';add.disabled=item.steps.length>=6;add.addEventListener('click',()=>{item.steps.push('');changed();renderForm();});stepWrap.append(add);form.append(stepWrap,field('Explanation',item.why,v=>item.why=v,{tag:'textarea',tall:true}));
    }else form.append(field('Short obstacle name',item.name,v=>item.name=v),field('Corrective feedback',item.tip,v=>item.tip=v,{tag:'textarea',tall:true}));
    const refs=node('div','pair');refs.append(field('Notes section',item.section,v=>item.section=v),field('Source reference',item.source,v=>item.source=v));form.append(refs);
    if(kind!=='bugs'){const details=node('details');details.append(node('summary','','Item identifier'),field('Unique identifier',item.id,v=>item.id=v));form.append(details);}
    const actions=node('div','form-actions'),copy=node('button','button','Duplicate '+labels[kind]),remove=node('button','button danger','Delete '+labels[kind]);copy.type=remove.type='button';
    copy.addEventListener('click',()=>{const itemCopy=clone(item);if(kind!=='bugs')itemCopy.id=newId(kind,itemCopy.level);bank[kind].push(itemCopy);selected=bank[kind].length-1;$('search').value='';changed();renderForm();});
    remove.addEventListener('click',()=>{if(!confirm(`Delete this ${labels[kind]} from your draft? You can undo this deletion.`))return;undo={item:clone(item),kind,index:selected};bank[kind].splice(selected,1);selected=firstInLevel();$('undoBtn').hidden=false;changed();renderForm();});actions.append(copy,remove);form.append(actions);
  }
  function renderPreview(){
    const wrap=$('preview'),item=current(),kind=$('kindFilter').value;wrap.replaceChildren();if(!item){wrap.append(node('p','','Select an item to preview.'));return;}
    wrap.append(node('h3','',title(item)));
    if(kind==='gates'){
      const result=node('div','preview-result');
      item.options.forEach((value,i)=>{const b=node('button','preview-answer',`${i+1}. ${value||'(Empty answer)'}`);b.type='button';b.addEventListener('click',()=>{for(const e of wrap.querySelectorAll('.preview-answer'))e.classList.remove('selected');b.classList.add('selected');result.replaceChildren(node('b','',i===item.answer?'✓ Correct':'× Not quite'),node('span','',item.why||'(Add an explanation)'),node('p','',item.source||''));});wrap.append(b);});wrap.append(node('p','hint','Click an answer to try the feedback.'),result);
    }else if(kind==='sequences'){
      const ol=node('ol');for(const step of item.steps)ol.append(node('li','preview-result',step||'(Empty step)'));wrap.append(ol,node('p','preview-result',item.why),node('small','',item.source));
    }else wrap.append(node('p','preview-result',item.tip),node('small','',item.source));
  }
  function firstInLevel(){const i=bank[$('kindFilter').value].findIndex(q=>q.level===Number($('levelFilter').value));return i<0?null:i;}
  function showBank(data){bank=clone(data);$('levelFilter').replaceChildren();for(const l of bank.levels){const option=node('option','',`Level ${l.id}: ${l.title}`);option.value=l.id;$('levelFilter').append(option);}selected=firstInLevel();$('workspace').hidden=false;renderList();renderForm();renderPreview();renderValidation();}
  function newId(kind,level){const prefix=`L${level}-${kind==='gates'?'Q':'S'}`;const ids=new Set([...bank.gates,...bank.sequences].map(q=>q.id));let n=1;while(ids.has(prefix+String(n).padStart(2,'0')))n++;return prefix+String(n).padStart(2,'0');}
  async function loadPublished(){
    const r=await fetch('questions.json',{cache:'no-store'});if(!r.ok)throw Error(`Could not load questions.json (${r.status}).`);const data=await r.json(),issues=tools.validateBank(data);if(issues.length)throw Error('The published bank is invalid: '+issues.slice(0,3).join(' '));
    publishedText=tools.serialise(data);dirty=false;undo=null;$('undoBtn').hidden=true;showBank(data);$('loadError').hidden=true;status('Published question bank loaded.');
  }
  function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  $('itemForm').addEventListener('submit',e=>e.preventDefault());
  for(const id of ['levelFilter','kindFilter'])$(id).addEventListener('change',()=>{if(!bank)return;selected=firstInLevel();renderList();renderForm();renderPreview();});
  $('search').addEventListener('input',renderList);
  $('addBtn').addEventListener('click',()=>{if(!canEdit())return;const kind=$('kindFilter').value,level=Number($('levelFilter').value),section=String(bank.levels.find(l=>l.id===level).chapter);let item={level,section,source:'Course notes §'+section};
    if(kind==='gates')Object.assign(item,{id:newId(kind,level),difficulty:1,prompt:'',options:['','',''],answer:0,why:''});
    else if(kind==='sequences')Object.assign(item,{id:newId(kind,level),title:'',steps:['','',''],why:''});
    else Object.assign(item,{name:'',tip:''});
    bank[kind].push(item);selected=bank[kind].length-1;$('search').value='';changed();renderForm();});
  $('undoBtn').addEventListener('click',()=>{if(!undo)return;const restored=undo.item;if(undo.kind!=='bugs'&&[...bank.gates,...bank.sequences].some(q=>q.id===restored.id))restored.id=newId(undo.kind,restored.level);selected=Math.min(undo.index,bank[undo.kind].length);bank[undo.kind].splice(selected,0,restored);$('kindFilter').value=undo.kind;$('levelFilter').value=restored.level;undo=null;$('undoBtn').hidden=true;changed();renderForm();});
  $('downloadBtn').addEventListener('click',()=>{if(!bank||errors().length)return;saveDraft();download('questions.json',tools.serialise(bank),'application/json');status('Downloaded questions.json. Upload this file to GitHub to update the public game.');});
  $('gameDownloadBtn').addEventListener('click',async()=>{if(!bank||errors().length)return;const b=$('gameDownloadBtn');b.disabled=true;try{const [r,t]=await Promise.all([fetch('game.template.html',{cache:'no-store'}),fetch('bank-tools.js',{cache:'no-store'})]);if(!r.ok||!t.ok)throw Error('Could not load the game template.');const template=await r.text(),toolsText=await t.text();if(!template.includes('__QUESTION_BANK__')||!template.includes('__BANK_TOOLS__'))throw Error('The game template is not compatible with this editor.');download('Math_Bio_Surfers.html',template.replace('__BANK_TOOLS__',()=>toolsText).replace('__QUESTION_BANK__',()=>tools.embed(bank)),'text/html');status('Downloaded the updated game. Open the HTML file in a browser to play it offline.');}catch(e){status(e.message);}finally{renderValidation();}});
  $('importBtn').addEventListener('click',()=>$('importFile').click());
  $('importFile').addEventListener('change',async()=>{const file=$('importFile').files[0];if(!file)return;try{const data=JSON.parse(await file.text()),issues=tools.validateBank(data);if(issues.length)throw Error(issues.slice(0,5).join(' '));if(dirty&&!confirm('Replace the current draft with the imported bank? Download a backup first if you want to keep it.'))return;showBank(data);changed();$('draftNotice').hidden=true;status('Imported '+file.name+'. Changes are still local.');}catch(e){$('loadError').hidden=false;$('loadError').textContent='Import failed. Your current bank has not changed. '+e.message;}finally{$('importFile').value='';}});
  $('reloadBtn').addEventListener('click',async()=>{if(dirty&&!confirm('Discard the current changes and reload the published bank?'))return;try{clearTimeout(draftTimer);await loadPublished();try{localStorage.removeItem(DRAFT_KEY);}catch{}draft=null;$('draftNotice').hidden=true;}catch(e){status(e.message);}});
  $('restoreDraft').addEventListener('click',()=>{if(!draft)return;showBank(draft.bank);$('draftNotice').hidden=true;changed();status('Draft restored. Review it before publishing.');});
  $('discardDraft').addEventListener('click',()=>{try{localStorage.removeItem(DRAFT_KEY);}catch{}draft=null;$('draftNotice').hidden=true;status('Saved draft discarded.');});
  window.addEventListener('beforeunload',e=>{if(dirty){saveDraft();e.preventDefault();e.returnValue='';}});
  window.addEventListener('pagehide',saveDraft);
  (async()=>{try{if(!tools)throw Error('The editor validation script could not be loaded.');await loadPublished();try{draft=JSON.parse(localStorage.getItem(DRAFT_KEY));if(draft&&draft.bank&&Array.isArray(draft.bank.levels)&&Array.isArray(draft.bank.gates)&&Array.isArray(draft.bank.sequences)&&Array.isArray(draft.bank.bugs)){
      if(tools.serialise(draft.bank)===publishedText){localStorage.removeItem(DRAFT_KEY);draft=null;}else{$('draftNotice').hidden=false;$('draftText').textContent=draft.base===publishedText?'An unpublished draft is saved in this browser.':'A saved draft is available, but the published bank has changed since it was started. Restoring it may replace newer questions.';}
    }}catch{draft=null;}}catch(e){$('loadError').hidden=false;$('loadError').textContent=e.message+' You can also import a previously downloaded questions.json file.';status('Question bank not loaded.');}})();
})();
