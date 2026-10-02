/* ===== SCENES 16-21: sessions, parallel work, detours, terminal, context, setup ===== */
/* Inserted between s13 and s14 by ORDER at the bottom of the build. Facts: code.claude.com/docs (sessions, worktrees, agent-view, terminal-config, hooks-guide, sub-agents, best-practices). */

async function copyText(t,el){try{await navigator.clipboard.writeText(t);el.textContent='copied';}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');el.textContent='copied';}catch(_){el.textContent='select the text and copy';}ta.remove();}}

/* ---- s16 where are my sessions ---- */
SCENES.push({id:'s16',belt:5,mood:'think',title:'Where are my sessions? Picker vs agent view',
html:`<div class="row"><div class="col card"><h3>/resume picker <span class="tag" id="sc16"></span></h3><div id="pk16" style="font-size:13px;min-height:160px"></div>
<div class="chips"><button class="btn" id="bw16">Ctrl+W all worktrees</button><button class="btn" id="ba16">Ctrl+A all projects</button><button class="btn" id="bb16">Ctrl+B this branch</button></div></div>
<div class="col card"><h3>&larr; agent view <span class="tag">claude agents</span></h3><div id="av16" style="font-size:13px;min-height:160px"></div><button class="btn cyan" id="bl16">press &larr; on an empty prompt</button><div class="fb" id="f16"></div></div></div>
<div class="grid" style="margin-top:12px" id="n16"></div>`,
init(r){
  const S=[{n:'fix-login-timeout',p:'shop-api',w:'main',b:'main'},{n:'oauth-migration',p:'shop-api',w:'oauth',b:'worktree-oauth'},{n:'rate-limiter',p:'shop-api',w:'rate',b:'worktree-rate'},{n:'checkout-polish',p:'shop-api',w:'main',b:'checkout'},{n:'blog-redesign',p:'blog',w:'main',b:'main'},{n:'dotfiles-cleanup',p:'dotfiles',w:'main',b:'main'}];
  let scope=0,br=false,pressed=false;
  const drawPk=()=>{
    const v=S.filter(s=>(scope===2||(s.p==='shop-api'&&(scope===1||s.w==='main')))&&(!br||s.b==='main'));
    $('#sc16',r).textContent=['current worktree','all worktrees of this repo','all projects on this machine'][scope]+(br?' · branch main':'');
    $('#pk16',r).innerHTML=v.length?v.map(s=>`<div style="padding:4px 8px;margin-bottom:4px;border:1px solid var(--line);border-radius:6px"><b style="color:var(--g)">${s.n}</b> <span style="color:var(--dim)">${s.p}/${s.w} &middot; ${s.b}</span></div>`).join(''):'<span class="warn">no sessions match</span>';
    $('#bw16',r).classList.toggle('amber',scope===1);$('#ba16',r).classList.toggle('amber',scope===2);$('#bb16',r).classList.toggle('amber',br);
  };
  $('#bw16',r).onclick=()=>{scope=scope===1?0:1;drawPk();};
  $('#ba16',r).onclick=()=>{scope=scope===2?0:2;drawPk();};
  $('#bb16',r).onclick=()=>{br=!br;drawPk();};
  const drawAv=()=>{
    const B=[{n:'oauth-migration',p:'shop-api',st:'Working'},{n:'blog-redesign',p:'blog',st:'Needs input'},{n:'rate-limiter',p:'shop-api',st:'Completed'}];
    if(pressed)B.push({n:'fix-login-timeout',p:'shop-api',st:'Working',me:1});
    const col={'Needs input':'var(--amber)','Working':'var(--g)','Completed':'var(--dim)'};
    $('#av16',r).innerHTML=['Needs input','Working','Completed'].map(g=>{const rows=B.filter(b=>b.st===g);return rows.length?`<div style="color:${col[g]};font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;margin-top:6px">${g}</div>`+rows.map(b=>`<div style="padding:3px 8px;border-left:3px solid ${col[g]};margin:3px 0;${b.me?'background:#0d2416':''}"><b>${b.n}</b> <span style="color:var(--dim)">${b.p}</span></div>`).join(''):'';}).join('');
    $('#f16',r).innerHTML=pressed?'<span class="ok">Backgrounded.</span> It keeps running. <kbd>Enter</kbd> or <kbd>&rarr;</kbd> attaches; <kbd>&larr;</kbd> on an empty prompt detaches.':'Lists <b>background</b> sessions from <b>all</b> projects. <code>fix-login-timeout</code> is open in a normal terminal, so it is not listed yet.';
  };
  $('#bl16',r).onclick=()=>{pressed=true;$('#bl16',r).disabled=true;drawAv();react('Backgrounded, not stopped.','happy');};
  const N=[['/rename auth-refactor','or <code>claude -n auth-refactor</code>. Names make parallel work findable.'],['claude --resume auth-refactor','resolves across this repo and its worktrees; ambiguous names open the picker'],['claude --continue','most recent session in this directory'],['leftArrowOpensAgents','setting in <code>/config</code> turns the &larr; shortcut off']];
  $('#n16',r).innerHTML=N.map(n=>`<div class="pick" style="cursor:default"><code>${n[0]}</code><br><span style="color:var(--dim)">${n[1]}</span></div>`).join('');
  drawPk();drawAv();
}});

/* ---- s17 worktrees ---- */
SCENES.push({id:'s17',belt:5,mood:'neutral',title:'Parallel features: one worktree each',
html:`<div class="row"><div class="col card"><h3>Your terminals</h3><div id="ac17" style="display:flex;flex-direction:column;gap:6px"></div></div>
<div class="col card"><h3>Your repo on disk</h3><pre class="code" id="tr17" style="min-height:150px;font-size:12px;white-space:pre-wrap"></pre><div class="fb" id="f17"></div></div></div>
<div class="grid" style="margin-top:12px" id="g17"></div>`,
init(r){
  const W={}; let msg='Start two sessions with different names. Each gets its own checkout and branch.';
  const names=['feature-auth','bugfix-cart'];
  const tree=()=>{
    const ks=Object.keys(W);
    let t='shop-api/  (main checkout, branch main)\n';
    t+=ks.length?'`- .claude/worktrees/\n':'   (no worktrees yet)\n';
    ks.forEach((k,i)=>{const w=W[k];t+=`   ${i===ks.length-1?'`-':'|-'} ${esc(k)}/  branch worktree-${esc(k)}  ${w.running?'[running]':'[kept]'}${w.dirty?' [edited]':''}\n`;});
    $('#tr17',r).innerHTML=t;$('#f17',r).innerHTML=msg;
  };
  const act=()=>{
    const b=[];
    names.forEach(n=>{const w=W[n];
      if(!w)b.push([`claude --worktree ${n}`,()=>{W[n]={running:1,dirty:0};msg=`Created <code>.claude/worktrees/${n}</code> on branch <code>worktree-${n}</code>. Claude manages it for you.`;}]);
      else if(!w.running)b.push([`claude --worktree ${n} --resume`,()=>{w.running=1;msg='Back in the kept worktree.';}]);
    });
    names.forEach(n=>{const w=W[n];if(w&&w.running&&!w.dirty)b.push([`edit files in ${n}`,()=>{w.dirty=1;msg=`Edits land only in <code>${n}</code>. The other checkout is untouched.`;}]);});
    names.forEach(n=>{const w=W[n];if(w&&w.running)b.push([`exit ${n}`,()=>{
      if(w.dirty){w.running=0;msg='Work found, so Claude asks: keep or remove? You keep it. Directory and branch stay; resume with the command Claude prints.';}
      else{delete W[n];msg='Nothing changed in an unnamed session, so Claude removes the worktree and branch automatically.';}}]);});
    $('#ac17',r).innerHTML=b.map((x,i)=>`<button class="btn" data-i="${i}" style="text-align:left">${esc(x[0])}</button>`).join('')||'<span class="ok">All done. Reload the scene to replay.</span>';
    $$('#ac17 .btn',r).forEach(el=>el.onclick=()=>{b[+el.dataset.i][1]();act();tree();if(Object.keys(W).length===2)react('Two features, zero collisions.','happy');});
  };
  const G=[['.worktreeinclude','list gitignored files such as <code>.env</code> to copy into every new worktree (gitignore syntax)'],['.gitignore','add <code>.claude/worktrees/</code> so checkouts do not show as untracked'],['worktree.baseRef','<code>fresh</code> (default) branches from the remote default branch; <code>head</code> branches from your current HEAD'],['subagents','say "use worktrees for your agents" or set <code>isolation: worktree</code> in an agent file'],['background sessions','<code>claude --bg</code> sessions move into a worktree before editing files'],['fresh checkout','run installs there. Two sessions in one checkout will collide.']];
  $('#g17',r).innerHTML=G.map(g=>`<div class="pick" style="cursor:default"><code>${g[0]}</code><br><span style="color:var(--dim)">${g[1]}</span></div>`).join('');
  act();tree();
}});

/* ---- s18 detours, forks, in-flight keys ---- */
SCENES.push({id:'s18',belt:5,mood:'alert',title:'Side quests, forks and in-flight keys',
html:`<div class="card"><div id="need18" style="font-size:16px;min-height:2.4em"></div><div class="chips" id="tools18"></div><div class="fb" id="f18"></div></div>
<div class="card" style="margin-top:12px"><h3>Keys while Claude is working</h3><div class="grid" id="k18"></div></div>`,
init(r){
  const T={btw:['/btw','No tools, never enters history'],branch:['/branch','Copy, switch into it; original kept'],fork:['/fork','Copy into a background session; you stay'],rewind:['/rewind','Restore conversation and/or code'],clear:['/clear','Fresh context, old one resumable'],queue:['Just type','Enter queues it for Claude']};
  const N=[['"What was that config file called?" Do not clutter the session.','btw'],['Try a risky refactor, but keep the current path safe.','branch'],['Keep working here while a copy runs the fix-tests loop in the background.','fork'],['Claude took a wrong turn three prompts ago. Undo the code and the talk.','rewind'],['Claude is mid-task and you just remembered one more instruction.','queue'],['A completely unrelated new task.','clear']];
  let i=0,s=0;const need=$('#need18',r),tb=$('#tools18',r);
  tb.innerHTML=Object.entries(T).map(([k,t])=>`<button class="btn" data-k="${k}" title="${esc(t[1])}">${esc(t[0])}</button>`).join('');
  const d=()=>{ if(i>=N.length){need.innerHTML=`<span class="ok">${s}/${N.length} on first try.</span>`;tb.innerHTML='';react(s>=5?'Right detour every time.':'Study the hints and retry.',s>=5?'happy':'think');return;} need.textContent=N[i][0];};
  $$('.btn',tb).forEach(b=>b.onclick=()=>{ if(i>=N.length)return; if(b.dataset.k===N[i][1]){s++;$('#f18',r).innerHTML='<span class="ok">Yes.</span> '+esc(T[N[i][1]][1])+'.';i++;d();}else{$('#f18',r).innerHTML='<span class="bad">Try another.</span> Hint: '+esc(T[N[i][1]][1]).toLowerCase()+'.';s=Math.max(0,s-.5);} });
  const K=[['Esc','stop this turn; queued messages go next'],['Enter','while Claude works: queue your message'],['Ctrl+Enter','send queued messages now'],['Ctrl+B','background a running command or agent (tmux: twice)'],['/tasks','list background shells and subagents'],['Ctrl+T','show or hide Claude\'s task checklist'],['&larr; (empty prompt)','background this session, open agent view'],['Ctrl+X Ctrl+K','stop all background subagents'],['f in /btw','fork the side answer into a subagent']];
  $('#k18',r).innerHTML=K.map(x=>`<div class="pick" style="cursor:default"><kbd>${x[0].replace(/&larr;/,'←')}</kbd><br><span style="color:var(--dim)">${x[1]}</span></div>`).join('');
  d();
}});

/* ---- s19 terminal, notifications, viewing files ---- */
SCENES.push({id:'s19',belt:5,mood:'happy',title:'Terminal setup: keys, alerts and file views',
html:`<div class="chips" id="tab19"></div><div class="grid" id="tg19"></div>
<div class="card" style="margin-top:12px"><h3>Get alerted when Claude needs you</h3><div class="chips" id="opt19"></div><div class="chips" id="mt19"></div>
<pre class="code" id="js19"></pre><button class="btn" id="cp19">copy</button> <span class="ok" id="cm19"></span><div class="fb" id="nt19" style="color:var(--dim)"></div></div>
<div class="card" style="margin-top:12px"><h3>Viewing files and changes</h3><div class="grid" id="vf19"></div></div>`,
init(r){
  const TERM={'Terminal.app':[['Option as Meta','Settings &rarr; Profiles &rarr; Keyboard &rarr; <b>Use Option as Meta Key</b>. Needed for Option+P (model) and Option+O (fast mode).'],['Newline','Shift+Enter works. <kbd>\\</kbd>+<kbd>Enter</kbd> and <kbd>Ctrl+J</kbd> work everywhere.'],['Alerts','No desktop notification by default. Use the bell or a hook below, and keep Profiles &rarr; Advanced &rarr; <b>Audible bell</b> on.']],
   'iTerm2':[['Option as Meta','Settings &rarr; Profiles &rarr; Keys &rarr; General: set Left and Right Option to <b>Esc+</b>.'],['Newline','Shift+Enter works without setup.'],['Alerts','Desktop notifications are built in. Enable Profiles &rarr; Terminal &rarr; <b>Notification Center Alerts</b>, then Filter Alerts &rarr; <b>Send escape sequence-generated alerts</b>.']],
   'VS Code / Cursor':[['Option as Meta','Add <code>"terminal.integrated.macOptionIsMeta": true</code> to the editor settings.'],['Newline','Run <code>/terminal-setup</code> once to install the Shift+Enter binding (it also turns GPU acceleration off in the terminal).'],['Alerts','No desktop notification here. Use <code>preferredNotifChannel</code> or a Notification hook below.']]};
  let tab='Terminal.app';
  const dt=()=>{$('#tab19',r).innerHTML=Object.keys(TERM).map(k=>`<button class="chip${k===tab?' on':''}">${k}</button>`).join('');$$('#tab19 .chip',r).forEach(c=>c.onclick=()=>{tab=c.textContent;dt();});
    $('#tg19',r).innerHTML=TERM[tab].map(x=>`<div class="pick" style="cursor:default"><b style="color:var(--g)">${x[0]}</b><br><span style="color:var(--txt)">${x[1]}</span></div>`).join('');};
  const st={bell:1,snd:1,ban:0,m:''};
  const M=[['any notification',''],['needs approval','permission_prompt'],['finished and waiting','idle_prompt']];
  const dj=()=>{
    $('#opt19',r).innerHTML=[['bell','terminal bell'],['snd','hook: play a sound'],['ban','hook: macOS banner']].map(([k,l])=>`<button class="chip${st[k]?' on':''}" data-k="${k}">${l}</button>`).join('');
    $('#mt19',r).innerHTML='<span style="color:var(--dim)">fire on:</span> '+M.map(([l,v])=>`<button class="chip${st.m===v?' on':''}" data-v="${v}">${l}</button>`).join('');
    const o={};if(st.bell)o.preferredNotifChannel='terminal_bell';
    const h=[];if(st.snd)h.push({type:'command',command:'afplay /System/Library/Sounds/Glass.aiff'});
    if(st.ban)h.push({type:'command',command:'osascript -e \'display notification "Claude Code needs your attention" with title "Claude Code"\''});
    if(h.length)o.hooks={Notification:[{matcher:st.m,hooks:h}]};
    $('#js19',r).textContent=Object.keys(o).length?JSON.stringify(o,null,2):'{}';
    $('#nt19',r).innerHTML='Put this in <code>~/.claude/settings.json</code>; if a <code>hooks</code> key exists, add <code>Notification</code> beside the other events. <code>permission_prompt</code> fires after a prompt waits about 6 s; <code>idle_prompt</code> about 60 s after Claude finishes and you have not typed. Desktop alerts are on by default only in Ghostty, Kitty and iTerm2. In tmux, set <code>allow-passthrough on</code>.';
    $$('#opt19 .chip',r).forEach(c=>c.onclick=()=>{st[c.dataset.k]=st[c.dataset.k]?0:1;dj();});
    $$('#mt19 .chip',r).forEach(c=>c.onclick=()=>{st.m=c.dataset.v;dj();});
  };
  $('#cp19',r).onclick=()=>copyText($('#js19',r).textContent,$('#cm19',r));
  const V=[['/diff','your uncommitted changes, including Claude\'s edits. In <code>/tui fullscreen</code> it opens as a live side panel (110+ columns).'],['Ctrl+O','transcript viewer with full tool detail. In fullscreen, <kbd>v</kbd> opens it in your editor and <kbd>[</kbd> sends it to terminal scrollback for search.'],['Ctrl+G','open the current prompt or plan in your editor'],['@path','mention a file or folder; Tab or Enter accepts the autocomplete'],['!cmd','shell mode, for example <code>!git diff --stat</code> or <code>!code src/app.ts</code> if the code CLI is installed'],['/copy','copy the last reply or a code block; press <kbd>w</kbd> in the picker to write it to a file']];
  $('#vf19',r).innerHTML=V.map(v=>`<div class="pick" style="cursor:default"><code>${v[0]}</code><br><span style="color:var(--dim)">${v[1]}</span></div>`).join('');
  dt();dj();
}});

/* ---- s20 context + subagents worked example ---- */
SCENES.push({id:'s20',belt:5,mood:'think',title:'Context in practice: a feature with subagents',
html:`<p class="lead">Feature: add usage-based billing that touches the billing, notifications and API modules. Toggle which steps you delegate. Numbers are illustrative.</p>
<div class="row"><div class="col card"><h3>Everything in one window</h3><div class="meter" id="ma20"><i></i><span></span></div></div><div class="col card"><h3>Your plan</h3><div class="meter" id="mb20"><i></i><span></span></div></div></div>
<div class="card" style="margin-top:12px"><div id="st20"></div></div>
<div class="card" style="margin-top:12px"><h3>Copy this fan-out prompt</h3><pre class="code" id="pr20" style="white-space:pre-wrap"></pre><button class="btn" id="cp20">copy</button> <span class="ok" id="cm20"></span></div>`,
init(r){
  const BASE=8;
  const ST=[['1. Interview me and write SPEC.md (plan mode, then start fresh from the spec)',10,10,0],['2. Research the billing module (about 25 files)',18,2,1],['3. Research the notifications module',14,2,1],['4. Research the API module',16,2,1],['5. Implement across modules in the main session',20,20,0],['6. Review the diff against SPEC.md in a fresh context',12,3,1]];
  const del=ST.map(()=>false);
  const meter=(el,v)=>{el.classList.toggle('hot',v>=70);$('i',el).style.width=Math.min(100,v)+'%';$('span',el).textContent=v+'%'+(v>=70?' - quality drops, compact or clear':'');};
  const draw=()=>{
    let a=BASE,b=BASE;ST.forEach((s,i)=>{a+=s[1];b+=del[i]?s[2]:s[1];});
    meter($('#ma20',r),a);meter($('#mb20',r),b);
    $('#st20',r).innerHTML=ST.map((s,i)=>`<div style="display:flex;gap:10px;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line)"><span>${esc(s[0])}</span>${s[3]?`<button class="btn ${del[i]?'amber':''}" data-i="${i}" style="white-space:nowrap">${del[i]?'subagent: +'+s[2]+'%':'main: +'+s[1]+'%'}</button>`:`<span class="tag">main: +${s[1]}%</span>`}</div>`).join('');
    $$('#st20 .btn',r).forEach(x=>x.onclick=()=>{del[+x.dataset.i]=!del[+x.dataset.i];draw();if(del.filter(Boolean).length===4)react('Only the summaries came home.','happy');});
  };
  const P='Use three subagents in parallel, one each for billing/, notifications/ and api/.\nEach should report only: the entry points, the interfaces I must change,\nand any gotchas. Under 150 words per module. Do not paste file contents.';
  $('#pr20',r).textContent=P;$('#cp20',r).onclick=()=>copyText(P,$('#cm20',r));
  draw();
}});

/* ---- s21 starter setup ---- */
SCENES.push({id:'s21',belt:5,mood:'happy',title:'A good starter setup',
html:`<p class="lead">Toggle the pieces, pick a file, copy it. Defaults are a starting point; trim what you do not need.</p>
<div class="chips" id="op21"></div><div class="chips" id="tb21"></div>
<pre class="code" id="out21" style="white-space:pre-wrap"></pre><button class="btn" id="cp21">copy</button> <span class="ok" id="cm21"></span>
<div class="card" style="margin-top:12px"><h3>Then run</h3><div class="grid" id="cmd21"></div></div>`,
init(r){
  const O={allow:1,deny:1,bell:1,snd:1,head:0};
  const OL=[['allow','allow safe commands'],['deny','deny reading .env'],['bell','terminal bell'],['snd','sound hook'],['head','worktrees from HEAD']];
  const FILES=['~/.claude/settings.json','~/.claude/CLAUDE.md','./CLAUDE.md','.gitignore + .worktreeinclude'];
  let f=0;
  const settings=()=>{
    const o={};const p={};
    if(O.allow)p.allow=['Bash(git status)','Bash(git diff *)','Bash(git log *)','Bash(npm run lint)','Bash(npm run test *)'];
    if(O.deny)p.deny=['Read(./.env)','Read(./.env.*)'];
    if(Object.keys(p).length)o.permissions=p;
    if(O.bell)o.preferredNotifChannel='terminal_bell';
    if(O.snd)o.hooks={Notification:[{matcher:'permission_prompt',hooks:[{type:'command',command:'afplay /System/Library/Sounds/Glass.aiff'}]}]};
    if(O.head)o.worktree={baseRef:'head'};
    return JSON.stringify(o,null,2);
  };
  const TXT=[settings,()=>`# Working style
- Ask before deleting files or rewriting git history.
- Prefer small, reviewable diffs. Run the project's tests before saying done.
- If two approaches are plausible, ask one question instead of guessing.

# Compaction
- When compacting, always preserve the list of modified files and any test commands.`,()=>`# Commands
- Test one file: npm test -- path/to/file
- Lint and typecheck: npm run lint && npm run typecheck

# Conventions
- ES modules only, named exports.
- API errors use AppError from src/errors.ts.

# Gotchas
- Integration tests need REDIS_URL set.`,()=>`# .gitignore
.claude/worktrees/
CLAUDE.local.md

# .worktreeinclude  (gitignored files to copy into each new worktree)
.env
.env.local`];
  const draw=()=>{
    $('#op21',r).innerHTML='<span style="color:var(--dim)">settings.json:</span> '+OL.map(([k,l])=>`<button class="chip${O[k]?' on':''}" data-k="${k}">${l}</button>`).join('');
    $('#tb21',r).innerHTML=FILES.map((n,i)=>`<button class="chip${i===f?' on':''}" data-i="${i}">${esc(n)}</button>`).join('');
    $('#out21',r).textContent=TXT[f]();
    $$('#op21 .chip',r).forEach(c=>c.onclick=()=>{O[c.dataset.k]=O[c.dataset.k]?0:1;f=0;draw();});
    $$('#tb21 .chip',r).forEach(c=>c.onclick=()=>{f=+c.dataset.i;draw();});
  };
  $('#cp21',r).onclick=()=>copyText($('#out21',r).textContent,$('#cm21',r));
  const C=[['/init','draft the project CLAUDE.md, then prune it'],['/doctor','setup checkup; proposes cuts for CLAUDE.md'],['/statusline','show model, branch and context % at a glance'],['/permissions','review allow, ask and deny rules'],['/hooks','confirm your Notification hook loaded'],['/status','which settings layers are active']];
  $('#cmd21',r).innerHTML=C.map(c=>`<div class="pick" style="cursor:default"><code>${c[0]}</code><br><span style="color:var(--dim)">${c[1]}</span></div>`).join('');
  draw();
}});

/* Lesson order: new scenes follow s13 "Scale up" and precede the playground and final trial. */
(()=>{const ORDER=['s0','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s16','s17','s18','s19','s20','s21','s14','s15'];
  SCENES.sort((a,b)=>ORDER.indexOf(a.id)-ORDER.indexOf(b.id));})();
