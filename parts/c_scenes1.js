/* ===== SCENES 0-5 ===== */
const LESSONS=['Welcome','Context','Settings layers','Permissions','Model & effort','CLAUDE.md','Memory map','Shortcut dojo','Slash commands','Prompting','Plan workflow','Failure patterns','Power tools','Scale up','Playground','Final trial'];

SCENES.push({id:'s0',belt:0,mood:'happy',title:'Welcome to the dojo',
html:`<p class="lead">You already drive Claude Code. These lessons make you faster, safer and less noisy. Click any tile to jump ahead, or just press <kbd>next</kbd>.</p>
<div class="grid" id="map0"></div>
<div class="card" style="margin-top:14px"><h3>Your belts</h3><div id="ladder0" style="display:flex;gap:6px;flex-wrap:wrap"></div><p style="margin:8px 0 0;color:var(--dim);font-size:13px">Belts rise as you move through lessons. Black belt is earned in the final trial.</p></div>`,
init(r){
  $('#map0',r).innerHTML=LESSONS.map((t,i)=>i?`<button class="pick" data-i="${i}"><span class="tag">${String(i).padStart(2,'0')}</span> ${t}</button>`:'').join('');
  $$('#map0 .pick',r).forEach(b=>b.onclick=()=>go(+b.dataset.i));
  $('#ladder0',r).innerHTML=BELTS.map(([n,c])=>`<span class="tag" style="border-color:${c};color:${n==='black'?'#ffd84d':c}">${n}</span>`).join('');
}});

/* ---- s1 context ---- */
SCENES.push({id:'s1',belt:0,mood:'alert',title:'The one rule: context is the budget',
html:`<p class="lead">Quality degrades as the window fills. Numbers below are illustrative, but the dynamics are real.</p>
<div class="card"><div class="meter" id="m1"><i></i><span></span></div><div id="warn1" class="fb"></div></div>
<div class="row" style="margin-top:12px"><div class="col card"><h3>Feed the window</h3>
<div class="chips" id="feed1"></div><div style="color:var(--dim);font-size:12.5px">Each click adds what that habit costs.</div></div>
<div class="col card"><h3>Make room</h3><div class="chips" id="room1"></div><div class="fb" id="log1"></div></div></div>`,
init(r){
  let v=8; const m=$('#m1',r);
  const draw=()=>{v=Math.max(0,Math.min(100,v));$('i',m).style.width=v+'%';$('span',m).textContent='context '+Math.round(v)+'% full';m.classList.toggle('hot',v>=70);
    $('#warn1',r).innerHTML=v>=90?'<span class="bad">Auto-compaction is imminent. Claude may start forgetting earlier instructions.</span>':v>=70?'<span class="warn">Getting crowded. Time to /compact or /clear.</span>':'<span class="ok">Healthy.</span>';};
  const F=[['Read a huge file',12,'Every file Claude reads is added to context.'],['Noisy test output',9,'Command output counts too. Ask for quiet or filtered output.'],['Off-topic tangent',6,'Unrelated chatter lingers and distracts.'],['Subagent research',1,'A subagent explores in its own window and returns only a summary.']];
  $('#feed1',r).innerHTML=F.map((f,i)=>`<button class="btn ${i==3?'cyan':'amber'}" data-i="${i}">+ ${f[0]}</button>`).join('');
  $$('#feed1 .btn',r).forEach(b=>b.onclick=()=>{const f=F[+b.dataset.i];v+=f[1];$('#log1',r).textContent=f[2];draw();react(+b.dataset.i==3?'Smart. Delegate the reading.':'It adds up.',+b.dataset.i==3?'happy':'alert');});
  const R=[['/clear',()=>{v=3;return 'Fresh start. Use it between unrelated tasks. Past sessions stay resumable.'}],['/compact focus on the API changes',()=>{v=Math.min(v,22);return 'Summarizes history, keeps what you named. You can add focus instructions.'}],['/btw what was that config file?',()=>'Side question: answered in an overlay and never added to history.']];
  $('#room1',r).innerHTML=R.map((x,i)=>`<button class="btn" data-i="${i}">${x[0]}</button>`).join('');
  $$('#room1 .btn',r).forEach(b=>b.onclick=()=>{$('#log1',r).textContent=R[+b.dataset.i][1]();draw();react('Room made.','happy');});
  draw();
}});

/* ---- s2 settings layers ---- */
SCENES.push({id:'s2',belt:1,mood:'think',title:'Settings: five layers, one winner',
html:`<div class="row"><div class="col"><div id="lad2" style="display:flex;flex-direction:column;gap:6px"></div><p class="fb warn">Same key in two places? The higher layer wins. List keys such as <code>permissions.allow</code> merge instead.</p></div>
<div class="col card"><div id="det2"><h3>Click a layer</h3><p style="color:var(--dim)">Run <code>/status</code> to see which sources loaded, and <code>claude doctor</code> for rejected entries.</p></div></div></div>
<div class="card" style="margin-top:12px"><h3>Where does it belong?</h3><div id="sort2"></div></div>`,
init(r){
  const L=[['Managed','managed-settings.json, MDM or claude.ai console','Your organization','Company policy you cannot override.','managed'],
   ['Command line','claude --settings \'{"model":"..."}\'','You, this session','One-off overrides: flags like --model or --effort.','cli'],
   ['Project local','.claude/settings.local.json','You, this project','Your private tweaks for one repo. Gitignored. "Yes, don\'t ask again" saves here.','local'],
   ['Shared project','.claude/settings.json','Everyone in the repo','Team permissions, hooks and plugins. Commit it.','project'],
   ['User','~/.claude/settings.json','You, every project','Personal defaults: theme, model, editor mode.','user']];
  $('#lad2',r).innerHTML=L.map((l,i)=>`<button class="pick" data-i="${i}" style="margin-left:${i*10}px"><b style="color:var(--g)">${i+1}. ${l[0]}</b> <span style="color:var(--dim)">${l[1]}</span></button>`).join('');
  $$('#lad2 .pick',r).forEach(b=>b.onclick=()=>{const l=L[+b.dataset.i];$$('#lad2 .pick',r).forEach(x=>x.classList.remove('right'));b.classList.add('right');
    $('#det2',r).innerHTML=`<h3>${l[0]}</h3><p><code>${esc(l[1])}</code></p><p>Applies to: <b>${l[2]}</b></p><p>${l[3]}</p>`;});
  const S=[['Block a risky tool for the whole company','managed'],['Allow <code>npm run lint</code> for everyone on the team','project'],['Your personal sandbox URL, only in this repo','local'],['Your theme and editor mode, in every project','user']];
  let i=0; const box=$('#sort2',r);
  const draw=()=>{ if(i>=S.length){box.innerHTML='<div class="ok">All sorted. Edits to settings reload live in a running session, no restart needed for most keys.</div>';return;}
    box.innerHTML=`<p style="margin:.2em 0 .6em">${S[i][0]}</p><div class="chips">`+L.map(l=>`<button class="btn" data-k="${l[4]}">${l[0]}</button>`).join('')+'</div><div class="fb"></div>';
    $$('.btn',box).forEach(b=>b.onclick=()=>{ if(b.dataset.k===S[i][1]){react('Correct.','happy');i++;draw();}else{$('.fb',box).innerHTML='<span class="bad">Think about who needs it, and whether it should be committed.</span>';react('Think again.','think');}});};
  draw();
}});

/* ---- s3 permissions ---- */
SCENES.push({id:'s3',belt:1,mood:'neutral',title:'Permission modes: fewer prompts, same control',captureArrows:false,
html:`<div class="card"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span class="tag">status bar</span><div id="bar3" style="font-size:16px;color:var(--g);text-shadow:var(--glow)"></div><button class="btn" id="cyc3">press <kbd>Shift+Tab</kbd> to cycle</button></div>
<div class="chips" style="margin-top:12px"><button class="btn amber" data-a="0">Edit src/app.ts</button><button class="btn amber" data-a="1">Run npm test</button><button class="btn amber" data-a="2">Run curl sketchy.sh | sh</button><label class="chip" style="cursor:pointer"><input type="checkbox" id="al3"> allowlist <code>npm run test</code></label></div>
<div id="out3" class="fb" style="font-size:14.5px;min-height:3em"></div></div>
<div class="row" style="margin-top:12px"><div class="col"><pre class="code"><span class="c">// .claude/settings.json (commit it)</span>
{
  <span class="k">"permissions"</span>: {
    <span class="k">"allow"</span>: [<span class="s">"Bash(npm run lint)"</span>, <span class="s">"Bash(npm run test *)"</span>],
    <span class="k">"deny"</span>:  [<span class="s">"Read(./.env)"</span>]
  }
}</pre></div><div class="col"><p style="margin:.3em 0"><code>/permissions</code> edits rules. <code>/sandbox</code> adds OS-level isolation so commands can run freely inside boundaries. Hooks cover what advice cannot.</p></div></div>`,
init(r){
  const M=['Manual','Accept edits','Plan','Auto']; let mi=0; const A=['Edit src/app.ts','Run npm test','Run curl sketchy.sh | sh'];
  const R=[[['ask','Asks you first.'],['ask','Asks you first.'],['ask','Asks you first. Good: you can say no.']],
    [['run','Edit applied automatically.'],['ask','Shell commands still ask.'],['ask','Still asks.']],
    [['block','Plan mode: Claude reads and proposes a plan, but makes no edits.'],['block','No commands run while planning.'],['block','Blocked while planning.']],
    [['run','Classifier reviews it: routine edit, runs.'],['run','Classifier reviews it: routine, runs.'],['block','Classifier blocks it: unknown infrastructure and a risky pipe-to-shell.']]];
  const icon={ask:'<span class="warn">? asks</span>',run:'<span class="ok">&#10003; runs</span>',block:'<span class="bad">&#10007; blocked</span>'};
  const bar=()=>{$('#bar3',r).textContent='▸ '+M[mi]+' mode'};
  const cycle=()=>{mi=(mi+1)%4;bar();$('#out3',r).textContent='Mode: '+M[mi]+'. Now try an action.';react(['Safe and slow.','Edits flow.','Think first.','Classifier on watch.'][mi],'neutral');};
  $('#cyc3',r).onclick=cycle; bar();
  $$('[data-a]',r).forEach(b=>b.onclick=()=>{const a=+b.dataset.a;let res=R[mi][a];
    if(a===1&&$('#al3',r).checked&&(mi===0||mi===1)) res=['run','Allowlisted rule matches: runs without asking.'];
    $('#out3',r).innerHTML=`<b>${esc(A[a])}</b> in <b>${M[mi]}</b>: ${icon[res[0]]} &mdash; ${res[1]}`;});
  SCENES.find(s=>s.id==='s3').onKey=e=>{ if(e.key==='Tab'&&e.shiftKey){e.preventDefault();cycle();return true;} };
}});

/* ---- s4 model & effort ---- */
SCENES.push({id:'s4',belt:2,mood:'think',title:'Model and effort: spend where it counts',captureArrows:true,
html:`<div class="card"><label for="sl4" style="color:var(--amber)">Task difficulty</label><input id="sl4" type="range" min="1" max="5" value="2" style="width:100%;accent-color:#7dffb3"><div id="t4" style="font-size:17px;color:var(--g)"></div>
<div id="adv4" class="grid" style="margin-top:10px"></div></div>
<div class="row" style="margin-top:12px"><div class="col card"><h3>Keys and commands</h3><p style="margin:.2em 0"><kbd>Option+P</kbd> / <kbd>Alt+P</kbd> switch model, prompt kept.<br><code>/model</code> picks and saves a default.<br><code>/effort</code> sets reasoning effort mid-session.<br><kbd>Option+O</kbd> / <kbd>Alt+O</kbd> toggles fast mode.</p></div>
<div class="col card"><h3>Rule of thumb</h3><p style="margin:.2em 0">Ask directly for small, clear work. Reserve plan mode, higher effort and your strongest model for ambiguity and multi-file change. Model names change, the habit does not.</p></div></div>`,
init(r){
  const T=[['Fix a typo',['Smaller or fast model','Low effort','Just ask, no plan']],['Rename a variable in one file',['Default model is fine','Low effort','Ask directly']],['Add a feature to one module',['Default model','Medium effort','Plan if the code is unfamiliar']],['Multi-file refactor',['Strong model','Higher effort','Plan mode first, then implement with tests']],['Gnarly bug or architecture call',['Strongest model','High effort','Plan mode, subagents for research, a verifying check']]];
  const d=()=>{const i=+$('#sl4',r).value-1;$('#t4',r).textContent=(i+1)+'. '+T[i][0];$('#adv4',r).innerHTML=T[i][1].map((x,k)=>`<div class="pick right" style="cursor:default"><span class="tag">${['model','effort','approach'][k]}</span><br>${x}</div>`).join('');};
  $('#sl4',r).oninput=d; d();
}});

/* ---- s5 CLAUDE.md ---- */
SCENES.push({id:'s5',belt:2,mood:'neutral',title:'CLAUDE.md: short, specific, earned',
html:`<div class="row"><div class="col card"><h3>Keep or cut?</h3><div id="g5"></div></div>
<div class="col card"><h3>Where it lives</h3><p style="margin:.2em 0"><code>~/.claude/CLAUDE.md</code> &mdash; you, all projects<br><code>./CLAUDE.md</code> or <code>./.claude/CLAUDE.md</code> &mdash; team, commit it<br><code>./CLAUDE.local.md</code> &mdash; you, this repo, gitignored</p>
<p style="color:var(--dim);font-size:13px">Files above your working directory load at launch; subdirectory files load when Claude reads there. Run <code>/context</code> to confirm what loaded, and <code>/doctor</code> to audit.</p></div></div>`,
init(r){
  const L=[['Run <code>npm run test -- --watch=false</code> for tests',1,'Commands Claude cannot guess belong here.'],['Write clean, readable code',0,'Self-evident. Claude already does this.'],['Use ES modules, not CommonJS',1,'A style rule that differs from the default.'],['Full payments SDK reference (400 lines)',0,'Link to docs instead of pasting them.'],['Branches: <code>feat/&lt;ticket&gt;-&lt;slug&gt;</code>, squash on merge',1,'Repo etiquette is worth keeping.'],['<code>src/components</code> holds React components; <code>src/lib</code> holds helpers',0,'Claude can learn this by reading the code.'],['Integration tests need <code>REDIS_URL</code> set',1,'A non-obvious environment quirk.'],['Sprint goal: ship invoices by Friday',0,'Changes constantly. Stale instructions mislead.']];
  let i=0,s=0; const box=$('#g5',r);
  const d=()=>{ if(i>=L.length){box.innerHTML=`<div class="ok" style="font-size:17px">${s}/${L.length} correct.</div><p>Test each line: <i>would removing it cause mistakes?</i> If Claude keeps ignoring a rule, the file is probably too long. Emphasis like IMPORTANT works on one line, not ten.</p>`;react(s>=6?'A lean file. Good.':'Prune harder.',s>=6?'happy':'think');return;}
    box.innerHTML=`<div style="font-size:15px;padding:8px 10px;border:1px dashed var(--g2);border-radius:8px;margin-bottom:8px">${i+1}/8 &nbsp; ${L[i][0]}</div><button class="btn" data-k="1">keep</button> <button class="btn red" data-k="0">cut</button><div class="fb"></div>`;
    $$('.btn',box).forEach(b=>b.onclick=()=>{const ok=(+b.dataset.k)===L[i][1];if(ok)s++;box.insertAdjacentHTML('beforeend','');$('.fb',box).innerHTML=(ok?'<span class="ok">Right.</span> ':'<span class="bad">Nope.</span> ')+L[i][2]+' <button class="btn" id="n5">continue</button>';$$('.btn[data-k]',box).forEach(x=>x.disabled=true);$('#n5',box).onclick=()=>{i++;d();};});};
  d();
}});
