/* ===== SCENES 6-10 ===== */

/* ---- s6 memory map ---- */
SCENES.push({id:'s6',belt:3,mood:'neutral',title:'The memory map: what loads, and when',
html:`<p class="lead">Pick what Claude is doing and watch which files join its context.</p>
<div class="chips" id="sit6"></div>
<div class="row"><div class="col card" id="tree6" style="font-size:13.5px"></div><div class="col card" id="note6"><h3>Reminder</h3><p><code>/init</code> drafts a starter CLAUDE.md from your codebase. In files, <code>@docs/git-workflow.md</code> imports another file. Auto memory holds notes Claude wrote itself; its first 200 lines or 25KB load each session.</p><p class="warn">CLAUDE.md is context, not enforcement. To block or guarantee, use a hook.</p></div></div>`,
init(r){
  const N=[['~/.claude/CLAUDE.md','your preferences, every project','u'],['./CLAUDE.md','team instructions (can @import files)','p'],['./CLAUDE.local.md','your private repo notes (gitignored)','l'],['.claude/rules/testing.md','a rule with no path scope','t'],['.claude/rules/api.md','<code>paths: src/api/**</code> scoped rule','a'],['src/api/CLAUDE.md','nested file, loads when Claude reads there','n'],['auto memory','notes Claude keeps (first 200 lines / 25KB)','m'],['hook in settings.json','deterministic: runs every time','h']];
  const S=[['Start a session at the repo root','u p l t m'],['Claude reads src/api/routes.ts','u p l t m a n'],['Claude reads web/App.tsx','u p l t m']];
  const draw=on=>{$('#tree6',r).innerHTML=N.map(n=>{const act=on.includes(n[2]);const hook=n[2]==='h';return `<div style="padding:5px 8px;border-radius:6px;margin-bottom:4px;border:1px solid ${act?'var(--g)':hook?'var(--cyan)':'var(--line)'};opacity:${act||hook?1:.45};background:${act?'#0d2416':'transparent'}"><code>${n[0]}</code> <span style="color:var(--dim)">&mdash; ${n[1]}</span> ${act?'<span class="ok">&#9679; loaded</span>':hook?'<span style="color:var(--cyan)">always enforced</span>':''}</div>`}).join('');};
  $('#sit6',r).innerHTML=S.map((s,i)=>`<button class="btn" data-i="${i}">${s[0]}</button>`).join('');
  $$('#sit6 .btn',r).forEach(b=>b.onclick=()=>{draw(S[+b.dataset.i][1]);react(['Always-on files first.','Scoped rules join on demand.','Unrelated rules stay out.'][+b.dataset.i],'neutral');});
  draw('');
}});

/* ---- s7 shortcut dojo ---- */
SCENES.push({id:'s7',belt:3,mood:'alert',title:'Shortcut dojo: train your hands',
html:`<div class="card" style="text-align:center"><div id="q7" style="font-size:17px;min-height:2.6em"></div><button class="btn" id="cap7" style="font-size:22px;margin:8px 0"></button><div class="fb" id="f7"></div><div style="color:var(--dim);font-size:12.5px" id="s7">score 0/10</div></div>
<div class="card" style="margin-top:12px"><h3>More moves worth knowing</h3><div class="grid" id="ref7"></div></div>`,
init(r){
  const C=[['Stop Claude mid-action; context is kept.','Esc',e=>e.key==='Escape'],['Rewind menu (empty prompt): press it twice quickly.','Esc Esc',null],['Cycle permission modes.','Shift+Tab',e=>e.key==='Tab'&&e.shiftKey],['Edit your prompt or plan in your own editor.','Ctrl+G',e=>e.ctrlKey&&e.key.toLowerCase()==='g'],['Reverse-search your prompt history.','Ctrl+R',e=>e.ctrlKey&&e.key.toLowerCase()==='r'],['Background a long-running command.','Ctrl+B',e=>e.ctrlKey&&e.key.toLowerCase()==='b'],['Open the transcript viewer with full tool detail.','Ctrl+O',e=>e.ctrlKey&&e.key.toLowerCase()==='o'],['Stash your half-typed prompt; press again to restore.','Ctrl+S',e=>e.ctrlKey&&e.key.toLowerCase()==='s'],['Switch model without losing your prompt (Option on Mac, Alt elsewhere).','Option+P',e=>e.altKey&&e.code==='KeyP'],['Interrupt a running operation.','Ctrl+C',e=>e.ctrlKey&&e.key.toLowerCase()==='c']];
  let order,i,score,lastEsc=0;
  const newRun=()=>{order=[...C.keys()].sort(()=>Math.random()-.5);i=0;score=0;show();};
  const show=()=>{ if(i>=10){$('#q7',r).textContent='Run complete.';$('#cap7',r).textContent='↻ train again';$('#cap7',r).onclick=newRun;$('#f7',r).innerHTML=`<span class="ok">${score}/10</span>`;react(score>=8?'Fast hands.':'Again. Repetition builds skill.',score>=8?'happy':'think');return;}
    const c=C[order[i]];$('#q7',r).textContent=c[0];$('#cap7',r).textContent=c[1];$('#cap7',r).onclick=()=>hit();$('#s7',r).textContent=`move ${i+1}/10 | score ${score}`;};
  const hit=()=>{score++;$('#f7',r).innerHTML='<span class="ok">&#10003; '+esc(C[order[i]][1])+'</span>';i++;show();};
  SCENES.find(s=>s.id==='s7').onKey=e=>{ if(i>=10)return false; const c=C[order[i]]; if(['Shift','Control','Alt','Meta'].includes(e.key))return false;
    if(c[1]==='Esc Esc'){ if(e.key==='Escape'){const t=Date.now();if(t-lastEsc<700){hit();lastEsc=0}else lastEsc=t;e.preventDefault();return true;} return false;}
    if(c[2](e)){e.preventDefault();hit();return true;} if(e.ctrlKey||e.altKey||e.key==='Escape'||(e.key==='Tab')){e.preventDefault();$('#f7',r).innerHTML='<span class="bad">That was a different move.</span>';return true;} return false;};
  const REF=[['Ctrl+T','toggle the task checklist'],['Ctrl+V','paste an image from clipboard'],['Shift+Enter / \\+Enter / Ctrl+J','newline in prompt'],['!','shell mode: run a command, output joins the session'],['@','mention a file with autocomplete'],['Ctrl+U / Ctrl+K / Ctrl+Y','delete to start / end, paste back'],['Up / Ctrl+P','recall previous prompts'],['?','shortcut help (empty prompt)'],['Ctrl+X Ctrl+K','stop all background subagents'],['Ctrl+Enter','send queued messages now'],['\u2190 (empty prompt)','background this session and open agent view']];
  $('#ref7',r).innerHTML=REF.map(x=>`<div class="pick" style="cursor:default"><kbd>${esc(x[0])}</kbd><br><span style="color:var(--dim)">${x[1]}</span></div>`).join('');
  newRun();
}});

/* ---- s8 slash deck ---- */
SCENES.push({id:'s8',belt:4,mood:'happy',title:'Slash commands: your control panel',
html:`<div class="chips" id="f8"></div><div class="grid" id="g8"></div>`,
init(r){
  const D=[['/clear','Session','Reset context. Use between unrelated tasks. Old sessions stay resumable.'],['/compact [focus]','Session','Summarize history, optionally with a focus like "the API changes".'],['/rewind','Session','Restore conversation and/or code to a checkpoint. Same as Esc Esc. Bash side effects are not tracked, so keep using git.'],['/resume','Session','Pick up an earlier session. Also claude --continue and claude --resume.'],['/rename','Session','Name sessions like branches, for example oauth-migration.'],['/btw','Session','Side question that never enters history. It has no tools.'],['/context','Session','See what is loaded and how much space it uses.'],['/diff','Session','Review the changes Claude made, in a diff view.'],['/tasks','Session','See running shells and subagents.'],
   ['/init','Setup','Draft a starter CLAUDE.md from your codebase.'],['/config','Setup','Personal options: theme, editor mode, verbose. Or /config key=value.'],['/status','Setup','Which settings sources loaded, plus version and model.'],['/doctor','Setup','Audit CLAUDE.md, rules and skills; propose cuts.'],['/model','Setup','Choose the model and save it as your default.'],['/effort','Setup','Set reasoning effort mid-session.'],['/permissions','Setup','Edit allow, ask and deny rules.'],['/sandbox','Setup','OS-level isolation so commands run freely inside boundaries.'],
   ['/hooks','Power','Browse configured hooks: scripts that run at fixed points, every time.'],['/batch <task>','Power','Split a change across 5 to 30 subagents, each in its own worktree.'],['/goal <condition>','Power','Keep working until a checkable condition is met.'],['/plugin','Power','Browse and install plugins that bundle skills, hooks, agents and MCP.'],['/mcp','Power','Manage connected MCP servers.']];
  let cat='All';
  const draw=()=>{ $('#g8',r).innerHTML=D.filter(d=>cat==='All'||d[1]===cat).map(d=>`<button class="pick" style="min-height:76px"><code>${esc(d[0])}</code> <span class="tag">${d[1]}</span><div class="more" style="display:none;margin-top:6px;color:var(--txt)">${esc(d[2])}</div><div class="hint" style="color:var(--dim);font-size:12px;margin-top:4px">click to flip</div></button>`).join('');
    $$('#g8 .pick',r).forEach(b=>b.onclick=()=>{const m=$('.more',b);const o=m.style.display==='none';m.style.display=o?'block':'none';$('.hint',b).style.display=o?'none':'block';b.classList.toggle('right',o);});};
  $('#f8',r).innerHTML=['All','Session','Setup','Power'].map(c=>`<button class="chip${c==='All'?' on':''}">${c}</button>`).join('');
  $$('#f8 .chip',r).forEach(b=>b.onclick=()=>{cat=b.textContent;$$('#f8 .chip',r).forEach(x=>x.classList.toggle('on',x===b));draw();});
  draw();
}});

/* ---- s9 prompting ---- */
SCENES.push({id:'s9',belt:4,mood:'happy',title:'Prompting: precise beats polite',
html:`<div class="row"><div class="col card"><h3>Click a vague prompt</h3><div id="v9"></div></div><div class="col card"><h3>Sharpened</h3><div id="s9" style="min-height:130px;color:var(--dim)">Pick one on the left.</div><div id="w9" class="fb"></div></div></div>
<div class="card" style="margin-top:12px"><h3>Rich context beats description</h3><div class="grid"><div class="pick" style="cursor:default"><code>@src/auth/session.ts</code><br>mention files; Claude reads them</div><div class="pick" style="cursor:default"><kbd>Ctrl+V</kbd> a screenshot<br>then ask it to compare its result</div><div class="pick" style="cursor:default"><code>cat err.log | claude -p "explain"</code><br>pipe data in</div><div class="pick" style="cursor:default">"Interview me with AskUserQuestion, then write SPEC.md"<br>for bigger features</div></div></div>`,
init(r){
  const P=[['add tests for foo.py','Write a test for foo.py covering the case where the user is logged out. Avoid mocks. Run the tests after.','Scope + verification'],['fix the login bug','Users report login fails after session timeout. Check token refresh in src/auth/. Write a failing test that reproduces it, then fix it.','Symptom + location + definition of fixed'],['add a calendar widget','Look at how HotDogWidget.php is built on the home page and follow that pattern. Build a calendar widget with month paging, no new libraries.','Point to an existing pattern'],['make the dashboard look better','[screenshot] Implement this design. Screenshot the result, compare it with the original, list the differences and fix them.','Visual verification loop']];
  $('#v9',r).innerHTML=P.map((p,i)=>`<button class="pick" data-i="${i}" style="margin-bottom:6px">"${esc(p[0])}"</button>`).join('');
  $$('#v9 .pick',r).forEach(b=>b.onclick=()=>{const p=P[+b.dataset.i];$$('#v9 .pick',r).forEach(x=>x.classList.remove('right'));b.classList.add('right');$('#s9',r).style.color='var(--g)';$('#s9',r).textContent='"'+p[1]+'"';$('#w9',r).innerHTML='<span class="warn">Why it works:</span> '+p[2];react('Specific wins.','happy');});
}});

/* ---- s10 workflow ---- */
SCENES.push({id:'s10',belt:5,mood:'think',title:'Explore, plan, implement, commit',
html:`<div id="flow10" style="display:flex;gap:8px;flex-wrap:wrap"></div><div class="card" id="d10" style="margin-top:12px"><h3>Click a stage</h3></div>
<div class="card" style="margin-top:12px"><h3>How big is the change?</h3><div class="chips" id="sz10"></div><div class="fb" id="o10"></div></div>`,
init(r){
  const F=[['1 Explore','Shift+Tab until plan mode is on, or start with <code>claude --permission-mode plan</code>.','read /src/auth and understand how we handle sessions. also look at how we manage env vars for secrets.'],['2 Plan','Ask for a plan. Press <kbd>Ctrl+G</kbd> to edit it yourself before Claude proceeds.','I want to add Google OAuth. What files change? What is the session flow? Create a plan.'],['3 Implement','Leave plan mode, then verify against the plan with tests.','implement the OAuth flow from your plan. write tests for the callback handler, run the suite and fix failures.'],['4 Commit','Ask for a descriptive commit and a PR.','commit with a descriptive message and open a PR']];
  $('#flow10',r).innerHTML=F.map((f,i)=>`<button class="btn" data-i="${i}">${f[0]}</button>${i<3?'<span style="align-self:center;color:var(--dim)">&rarr;</span>':''}`).join('');
  $$('#flow10 .btn',r).forEach(b=>b.onclick=()=>{const f=F[+b.dataset.i];$$('#flow10 .btn',r).forEach(x=>x.classList.toggle('amber',x===b));$('#d10',r).innerHTML=`<h3>${f[0]}</h3><p>${f[1]}</p><pre class="code">${esc(f[2])}</pre>`;});
  const Z=[['Fix a typo or add a log line','Skip the plan. Just ask.'],['Touches several files','Plan first. Cheap insurance against solving the wrong problem.'],['Unfamiliar code or unclear approach','Explore in plan mode, ideally with a subagent, then write the plan to a file.'],['I could describe the diff in one sentence','Skip the plan.']];
  $('#sz10',r).innerHTML=Z.map((z,i)=>`<button class="chip" data-i="${i}">${z[0]}</button>`).join('');
  $$('#sz10 .chip',r).forEach(b=>b.onclick=()=>{$$('#sz10 .chip',r).forEach(x=>x.classList.toggle('on',x===b));$('#o10',r).innerHTML='<span class="ok">&rarr; '+Z[+b.dataset.i][1]+'</span>';});
}});
