/* ===== SCENES 11-15 ===== */

/* ---- s11 failure patterns ---- */
SCENES.push({id:'s11',belt:5,mood:'alert',title:'Five traps and their fixes',
html:`<div class="card" id="q11"></div>`,
init(r){
  quiz($('#q11',r),[
   {q:'You asked about auth, then CSS, then auth again. Answers are getting sloppy. (The kitchen sink session)',opts:['Ask harder, in capital letters','/clear between unrelated tasks','Switch on fast mode'],a:1,why:'Irrelevant history crowds the window. Reset between unrelated tasks.'},
   {q:'Third correction on the same bug and it is still wrong. (Correcting over and over)',opts:['Correct it a fourth time','/clear, then re-prompt with what you learned','Add more IMPORTANT to CLAUDE.md'],a:1,why:'Failed attempts pollute context. After two failed corrections, start clean with a better prompt.'},
   {q:'Your CLAUDE.md is 600 lines and Claude ignores half of it. (The over-specified file)',opts:['Add more rules to be safe','Prune hard; turn must-always rules into hooks','Rename it to RULES.md'],a:1,why:'Long files bury rules. If Claude already does it right, delete the line; if it must always happen, use a hook.'},
   {q:'Claude ships plausible code that misses edge cases. (Trust, then verify)',opts:['Read every line yourself later','Give it tests or a check to run and iterate against','Ask it to be more careful'],a:1,why:'A pass/fail check closes the loop so you stop being the verifier.'},
   {q:'"Investigate the codebase" and Claude read hundreds of files. (Infinite exploration)',opts:['Let it finish','Scope it narrowly, or use a subagent','/compact every minute'],a:1,why:'Subagents explore in their own window and return a summary.'}
  ],s=>react(s>=4?'You see the traps.':'Review and retry later.',s>=4?'happy':'think'));
}});

/* ---- s12 power tools ---- */
SCENES.push({id:'s12',belt:5,mood:'happy',title:'The right tool for each job',
html:`<div class="card"><div id="need12" style="font-size:16px;min-height:2.4em"></div><div class="chips" id="tools12"></div><div class="fb" id="f12"></div></div>
<div class="grid" style="margin-top:12px" id="k12"></div>`,
init(r){
  const T={cm:['CLAUDE.md','Always-on context'],hook:['Hook','Deterministic script at a fixed point'],skill:['Skill','Loaded on demand'],sub:['Subagent','Separate context window'],mcp:['MCP server','Connect external tools and data'],plug:['Plugin','Bundle and share all of the above']};
  const N=[['Run eslint after every single file edit, no exceptions.','hook'],['Domain knowledge needed only for some tasks, without bloating every session.','skill'],['Read dozens of files and report back without filling my context.','sub'],['Let Claude query Notion, a database or an issue tracker.','mcp'],['A short style rule that applies in every session.','cm'],['Package our skills, hooks and servers so teammates can install them in one step.','plug']];
  let i=0,s=0;const need=$('#need12',r),tb=$('#tools12',r);
  $('#k12',r).innerHTML=Object.values(T).map(t=>`<div class="pick" style="cursor:default"><b style="color:var(--g)">${t[0]}</b><br><span style="color:var(--dim)">${t[1]}</span></div>`).join('');
  tb.innerHTML=Object.entries(T).map(([k,t])=>`<button class="btn" data-k="${k}">${t[0]}</button>`).join('');
  const d=()=>{ if(i>=N.length){need.innerHTML=`<span class="ok">${s}/${N.length} on first try.</span>`;tb.innerHTML='';react(s>=5?'Right tool, right job.':'Review the grid below.',s>=5?'happy':'think');return;} need.textContent=N[i][0];};
  $$('.btn',tb).forEach(b=>b.onclick=()=>{ if(i>=N.length)return; if(b.dataset.k===N[i][1]){s++;$('#f12',r).innerHTML='<span class="ok">Yes.</span>';i++;d();}else{$('#f12',r).innerHTML='<span class="bad">Try another.</span> Hint: '+T[N[i][1]][1].toLowerCase()+'.';s=Math.max(0,s-.5);} });
  d();
}});

/* ---- s13 scale ---- */
SCENES.push({id:'s13',belt:5,mood:'neutral',title:'Scale up: parallel and unattended',
html:`<div class="chips" id="tabs13"></div><div class="card"><div id="lanes13"></div><div id="d13" style="margin-top:10px"></div></div>
<style>.lane{height:16px;border:1px solid var(--g2);border-radius:4px;margin:6px 0;overflow:hidden;background:#050906;position:relative}.lane i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--g2),var(--g));animation:ln var(--d,3s) linear infinite}.lane span{position:absolute;left:8px;top:-1px;font-size:11px;color:#fff;text-shadow:0 0 3px #000}@keyframes ln{0%{width:0}85%,100%{width:100%}}</style>`,
init(r){
  const M=[['Worktrees',['session A: feature','session B: bugfix','session C: experiment'],'Separate CLI sessions in isolated git checkouts, so edits never collide. Name sessions with <code>/rename</code>; resume with <code>claude --resume</code>.',''],
   ['Writer / Reviewer',['writer: implements rate limiter','reviewer (fresh context): finds gaps'],'A fresh context reviews without bias toward code it just wrote. Tell the reviewer to flag only correctness or requirement gaps.','Review the rate limiter diff against PLAN.md.\nCheck every requirement is implemented, listed edge\ncases have tests, nothing outside scope changed.\nReport gaps, not style preferences.'],
   ['Headless loop',['claude -p file 1','claude -p file 2','claude -p file 3'],'Non-interactive runs for scripts and CI. Test on 2 or 3 files, refine the prompt, then run all. Scope tools with <code>--allowedTools</code>.','for file in $(cat files.txt); do\n  claude -p "Migrate $file to Python 3. Return OK or FAIL." \\\n    --allowedTools "Edit,Bash(git commit *)"\ndone'],
   ['/batch',['subagent 1 (worktree)','subagent 2 (worktree)','subagent 3 (worktree)','subagent 4 (worktree)','... up to 30'],'One instruction fans out across 5 to 30 subagents, each in its own worktree.','/batch migrate every handler to the new logger'],
   ['Verify unattended',['work','check','work','check'],'For walk-away runs, give it a finish line: a <code>/goal</code> condition re-checked each turn, or a Stop hook that blocks finishing until your script passes. Make Claude show evidence, not claims.','/goal all tests pass and lint is clean']];
  $('#tabs13',r).innerHTML=M.map((m,i)=>`<button class="chip${i===0?' on':''}" data-i="${i}">${m[0]}</button>`).join('');
  const d=i=>{const m=M[i];$$('#tabs13 .chip',r).forEach((c,k)=>c.classList.toggle('on',k===i));
    $('#lanes13',r).innerHTML=m[1].map((l,k)=>`<div class="lane"><i style="--d:${(2.4+Math.random()*2.4).toFixed(1)}s;animation-delay:${k*.3}s"></i><span>${esc(l)}</span></div>`).join('');
    $('#d13',r).innerHTML=`<p>${m[2]}</p>`+(m[3]?`<pre class="code">${esc(m[3])}</pre>`:'');};
  $$('#tabs13 .chip',r).forEach(c=>c.onclick=()=>d(+c.dataset.i)); d(0);
}});

/* ---- s14 playground ---- */
SCENES.push({id:'s14',belt:5,mood:'happy',title:'Playground: a safe pretend terminal',
html:`<div class="card" style="padding:0;overflow:hidden"><div id="out14" style="height:290px;overflow:auto;padding:12px 14px;font-size:13.5px"></div>
<div style="border-top:1px solid var(--line);padding:8px 14px;display:flex;gap:8px;align-items:center"><span style="color:var(--g)">&gt;</span><input id="in14" autocomplete="off" spellcheck="false" style="flex:1;background:transparent;border:0;outline:0;color:var(--txt);font:inherit" placeholder="try /status, /context, !ls, @README.md, or just ask for something"></div>
<div id="sb14" style="border-top:1px solid var(--line);padding:5px 14px;font-size:12px;color:var(--dim);display:flex;gap:16px;flex-wrap:wrap"></div></div>
<div class="chips" id="hint14"></div><div class="fb" id="prog14"></div>`,
init(r){
  const out=$('#out14',r),inp=$('#in14',r); let ctx=8,mode=0,model='default model',effort='medium',hist=[],hi=-1; const tried=new Set(); const MODES=['Manual','Accept edits','Plan','Auto'];
  const sb=()=>{$('#sb14',r).innerHTML=`<span>mode: <b style="color:var(--g)">${MODES[mode]}</b> (Shift+Tab)</span><span>model: ${model}</span><span>effort: ${effort}</span><span class="${ctx>=70?'warn':''}">context: ${ctx}%</span>`;$('#prog14',r).innerHTML=`<span class="${tried.size>=6?'ok':'warn'}">moves tried: ${tried.size}/6${tried.size>=6?' - black-belt ready':''}</span>`;};
  const P=(t,c)=>{out.insertAdjacentHTML('beforeend',`<div style="margin:3px 0;${c?'color:'+c:''}">${t}</div>`);out.scrollTop=out.scrollHeight;};
  const run=v=>{ P('<span style="color:var(--g)">&gt;</span> '+esc(v)); const [c,...a]=v.trim().split(/\s+/); const arg=a.join(' ');
    if(c==='/help'){P('Try: /status /context /compact /clear /model /effort /permissions /init /rewind /btw ... , !ls , @README.md');}
    else if(c==='/status'){tried.add('/status');P('Setting sources: User settings, Project settings (.claude/settings.json)<br>Model: '+model+' &middot; Mode: '+MODES[mode]);}
    else if(c==='/context'){tried.add('/context');P('Context: '+ctx+'% used<br>&bull; system + tools: 6%<br>&bull; CLAUDE.md files: 2%<br>&bull; conversation: '+Math.max(0,ctx-8)+'%');}
    else if(c==='/compact'){tried.add('/compact');ctx=Math.min(ctx,20);P('Conversation compacted'+(arg?' with focus: '+esc(arg):'')+'.','var(--g)');}
    else if(c==='/clear'){tried.add('/clear');ctx=3;P('Context cleared. Previous session remains resumable.','var(--g)');}
    else if(c==='/model'){tried.add('/model');model=model==='default model'?'lighter model':'default model';P('Model now: '+model+' (saved as your default in the real tool).');}
    else if(c==='/effort'){tried.add('/effort');effort=['low','medium','high'].includes(arg)?arg:'high';P('Effort set to '+effort+'.');}
    else if(c==='/permissions'){tried.add('/permissions');P('allow: Bash(npm run lint) &nbsp; deny: Read(./.env) &nbsp; (sample)');}
    else if(c==='/init'){tried.add('/init');ctx+=4;P('Analyzing codebase... drafted CLAUDE.md with build commands and conventions (simulated).');}
    else if(c==='/rewind'){tried.add('/rewind');P('Rewind menu: restore conversation, code, both, or summarize from a message (simulated).');}
    else if(c==='/btw'){tried.add('/btw');P('[side answer, not added to history] '+(arg?'It was <code>.claude/settings.json</code>.':'Usage: /btw your question'),'var(--cyan)');}
    else if(v.startsWith('!')){tried.add('!bash');ctx+=1;P('README.md &nbsp; package.json &nbsp; src/ &nbsp; (shell mode: output joins the session)');}
    else if(/@\S+/.test(v)){tried.add('@file');ctx+=4;P('Reading '+esc(v.match(/@\S+/)[0])+' ... then responding (+4% context).');}
    else if(v.startsWith('/')){P('Not simulated here: '+esc(c)+'. See the slash deck for what it does.','var(--dim)');}
    else {ctx+=5;tried.add('prompt');P('In the real tool, Claude would work on this'+(MODES[mode]==='Plan'?' in plan mode: reading and proposing, no edits.':'.')+' (+5% context)');}
    ctx=Math.min(100,ctx); if(ctx>=70)P('Context is getting full. Try /compact or /clear.','var(--amber)'); sb();};
  inp.onkeydown=e=>{ if(e.key==='Enter'&&inp.value.trim()){hist.unshift(inp.value);hi=-1;run(inp.value);inp.value='';}
    else if(e.key==='Tab'&&e.shiftKey){e.preventDefault();mode=(mode+1)%4;tried.add('shift-tab');P('mode: '+MODES[mode],'var(--g)');sb();}
    else if(e.key==='ArrowUp'){e.preventDefault();if(hi<hist.length-1){hi++;inp.value=hist[hi];}}
    else if(e.key==='ArrowDown'){e.preventDefault();hi=Math.max(-1,hi-1);inp.value=hi<0?'':hist[hi];}
    e.stopPropagation();};
  const H=['/status','/context','/compact focus on the API','/clear','/model','!ls','@README.md summarize this','fix the failing test'];
  $('#hint14',r).innerHTML=H.map(h=>`<button class="chip">${esc(h)}</button>`).join('');
  $$('#hint14 .chip',r).forEach(c=>c.onclick=()=>{run(c.textContent);inp.focus();});
  P('Sensei Shell sandbox. Nothing here touches your machine. Type /help.','var(--dim)'); sb();
}});

/* ---- s15 final ---- */
SCENES.push({id:'s15',belt:5,mood:'happy',title:'Final trial and cheat sheet',
html:`<div class="card" id="q15"></div><div id="res15" class="hidden"><div class="card" style="margin-top:12px"><h3>Cheat sheet</h3><pre class="code" id="cs15" style="white-space:pre-wrap"></pre><button class="btn" id="cp15">copy cheat sheet</button> <span id="cpm" class="ok"></span></div></div>`,
init(r){
  const CS=`CLAUDE CODE CHEAT SHEET (Sensei Shell)
THE RULE   Context is the budget. /clear between tasks, /compact [focus], /btw for side questions.
SETTINGS   managed > CLI flags > .claude/settings.local.json > .claude/settings.json > ~/.claude/settings.json. Lists merge. /status shows loaded sources.
PERMS      Shift+Tab cycles Manual / Accept edits / Plan / Auto. Allow rules via /permissions. /sandbox for isolation. Hooks for guarantees.
MODEL      Option+P / Alt+P switch model. /effort for effort. Option+O / Alt+O fast mode. Light for small tasks, plan + effort for big ones.
CLAUDE.MD  <200 lines. Keep only what removal would break. ~/.claude/CLAUDE.md, ./CLAUDE.md, ./CLAUDE.local.md. @imports, .claude/rules with paths. /init, /doctor.
KEYS       Esc stop. Esc Esc rewind. Ctrl+G edit in editor. Ctrl+R history. Ctrl+B background. Ctrl+O transcript. Ctrl+S stash. ! shell. @ files. Ctrl+V image.
PROMPTS    Give a check to run. Scope it. Point to a pattern. Describe the symptom. Pipe data in.
WORKFLOW   Explore -> Plan (Ctrl+G to edit) -> Implement -> Commit. Skip the plan if the diff fits in one sentence.
TRAPS      Kitchen sink -> /clear. 2 failed corrections -> /clear + better prompt. Bloated CLAUDE.md -> prune/hook. No verification -> add tests. Unscoped exploring -> subagent.
TOOLS      Hook = always. Skill = on demand. Subagent = separate context. MCP = external tools. Plugin = bundle.
SCALE      Worktrees, writer/reviewer, claude -p loops with --allowedTools, /batch, /goal or Stop hook for unattended runs.
SESSIONS   /resume picker: Ctrl+W all worktrees, Ctrl+A all projects, Ctrl+B this branch. Left arrow on an empty prompt = agent view (background sessions, all projects). /rename, claude -n, claude --resume <name>.
PARALLEL   One terminal per feature: claude --worktree <name> (.claude/worktrees/<name>, branch worktree-<name>; clean ones auto-removed on exit). /bg, claude --bg, claude agents. Enter queues a message, Ctrl+Enter sends it now. /tasks, Ctrl+B, Ctrl+T.
DETOURS    /btw (no tools, not in history), /branch (copy and switch), /fork (copy to background), /rewind, /clear.
TERMINAL   Mac: Option as Meta. VS Code/Cursor: /terminal-setup, terminal.integrated.macOptionIsMeta. Alerts: preferredNotifChannel terminal_bell, or a Notification hook (afplay). /diff, Ctrl+O, Ctrl+G, !cmd to look at files.
SUBAGENTS  "Use subagents to research X": only the summary returns. One per module in parallel, implement in main, reviewer subagent on the diff.`;
  $('#cs15',r).textContent=CS;
  $('#cp15',r).onclick=async()=>{try{await navigator.clipboard.writeText(CS);$('#cpm',r).textContent='copied';}catch(e){const ta=document.createElement('textarea');ta.value=CS;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');$('#cpm',r).textContent='copied';}catch(_){$('#cpm',r).textContent='select the text and copy';}ta.remove();}};
  const Q=[{q:'Same key set in managed and user settings. Which wins?',opts:['User','Managed','Whichever loaded last'],a:1,why:'Managed is the strongest layer.'},
   {q:'You need eslint to run after every edit, no exceptions.',opts:['A CLAUDE.md line','A hook','A longer prompt'],a:1,why:'CLAUDE.md is advice; hooks are deterministic.'},
   {q:'Three corrections and the bug persists.',opts:['Correct again','/clear and re-prompt with what you learned','Turn on fast mode'],a:1,why:'Clean context plus a sharper prompt beats an accumulating pile of failed attempts.'},
   {q:'Ask a quick side question without growing history.',opts:['/compact','/btw','/rewind'],a:1,why:'/btw never enters conversation history.'},
   {q:'Which line earns a place in CLAUDE.md?',opts:['Write clean code','Integration tests need REDIS_URL set','Current sprint goal'],a:1,why:'It is a non-obvious, durable quirk Claude cannot infer.'},
   {q:'Where does a private, per-repo tweak go?',opts:['.claude/settings.local.json','~/.claude/settings.json','Managed settings'],a:0,why:'Project local is yours, scoped to this repo, and gitignored.'},
   {q:'Two features in the same repo at the same time, without edits colliding.',opts:['Two terminals in the same folder','claude --worktree <name> in each terminal','/compact in both'],a:1,why:'Each worktree is its own checkout and branch under .claude/worktrees, so sessions cannot touch each other\'s files.'},
   {q:'You need to understand 40 files in a module before editing. How do you protect your context?',opts:['Read them all in the main session','Use a subagent so only its summary returns','Turn on fast mode'],a:1,why:'Subagents explore in their own window and report back a short summary.'}];
  const again=()=>{$('#q15',r).innerHTML='';quiz($('#q15',r),Q,s=>{ if(s>=6){$$('.belt').forEach(b=>b.classList.add('on'));Sensei.belt(6);Sensei.mood('happy');Sensei.bow();toast('BLACK BELT earned');$('#q15',r).innerHTML+=`<p class="ok" style="font-size:18px">Black belt. Score ${s}/${Q.length}. Your cheat sheet is below.</p>`;$('#res15',r).classList.remove('hidden');}
    else{$('#q15',r).innerHTML+=`<p class="warn">${s}/${Q.length}. Six are needed. Revisit a lesson, then try again.</p><button class="btn" id="rt">retry</button>`;$('#rt',r).onclick=again;}});};
  again();
}});
