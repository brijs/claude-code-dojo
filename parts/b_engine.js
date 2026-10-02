/* ===== ENGINE ===== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const BELTS=[['white','#f2f2f2'],['yellow','#ffd84d'],['orange','#ff9a3c'],['green','#4cd964'],['blue','#4aa3ff'],['brown','#a8693b'],['black','#1b1b1b']];
const SCENES=[];
let cur=-1, soundOn=true, auto=false, started=false;
const seen=new Set();

/* ---- Sensei ---- */
const Sensei=(()=>{
  const eyes=$('#sEyes'), mo=$('#sMo'), head=$('#sHead'), body=$('#sBody');
  const E={
    neutral:'<line x1="84" y1="78" x2="84" y2="92"/><line x1="136" y1="78" x2="136" y2="92"/>',
    happy:'<path d="M74 92 Q84 74 94 92" fill="none"/><path d="M126 92 Q136 74 146 92" fill="none"/>',
    think:'<line x1="84" y1="78" x2="84" y2="92"/><line x1="136" y1="80" x2="136" y2="92"/><line x1="122" y1="68" x2="150" y2="63" stroke-width="3"/>',
    alert:'<circle cx="84" cy="85" r="8"/><circle cx="136" cy="85" r="8"/>',
    sleepy:'<line x1="74" y1="88" x2="94" y2="88"/><line x1="126" y1="88" x2="146" y2="88"/>'
  };
  let m='neutral', talking=false, lvl=0, blinkT=0;
  function mood(x){m=E[x]?x:'neutral';eyes.innerHTML=E[m];}
  mood('neutral');
  function blink(){ if(m==='neutral'||m==='think'){eyes.style.transform='scaleY(.1)';eyes.style.transformOrigin='110px 85px';setTimeout(()=>eyes.style.transform='',110);} setTimeout(blink,2200+Math.random()*2600); }
  setTimeout(blink,1800);
  function setLevel(v){lvl=v;}
  let t0=performance.now();
  function frame(t){
    const idle=Math.sin(t/900)*1.6, h=talking?Math.max(4,Math.min(20,4+lvl*60)):(m==='happy'?7:4);
    const w=m==='happy'&&!talking?36:28;
    mo.setAttribute('height',h.toFixed(1));mo.setAttribute('y',(106-h/2).toFixed(1));mo.setAttribute('width',w);mo.setAttribute('x',(110-w/2));
    head.style.transform=`translateY(${idle*.6+(talking?Math.sin(t/120)*.6:0)}px)`;
    body.style.transform=`translateY(${idle*.3}px)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  function bow(){body.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(8px) rotate(3deg)'},{transform:'translateY(0) rotate(0)'}],{duration:700,easing:'ease-in-out'});}
  function belt(i){const c=BELTS[i][1];['sBelt','sBeltTail','sBandR','sBandT'].forEach(id=>$('#'+id).setAttribute('fill',c));
    const edge=i===6?'#ffd84d':'none';['sBelt','sBandR'].forEach(id=>{$('#'+id).setAttribute('stroke',edge);$('#'+id).setAttribute('stroke-width',1.5)});}
  return {mood,setLevel,bow,belt,talk:v=>talking=v};
})();

/* ---- Toast ---- */
let toastT;function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600);}

/* ---- Audio + captions ---- */
const au=new Audio(); au.preload='auto';
let actx,analyser,buf,wired=false;
function wire(){ if(wired)return; wired=true; try{
  actx=new (window.AudioContext||window.webkitAudioContext)(); const src=actx.createMediaElementSource(au);
  analyser=actx.createAnalyser(); analyser.fftSize=512; buf=new Uint8Array(analyser.fftSize); src.connect(analyser); analyser.connect(actx.destination);
  (function lv(){ if(analyser&&!au.paused){analyser.getByteTimeDomainData(buf);let s=0;for(const b of buf){const d=(b-128)/128;s+=d*d}Sensei.setLevel(Math.sqrt(s/buf.length));}else Sensei.setLevel(0); requestAnimationFrame(lv);})();
 }catch(e){analyser=null;} }
let words=[],cum=[];
const HI=/^(\/\w+|[A-Za-z]+\+\w+|CLAUDE\.md|\.claude\/rules|Esc|@|Claude|-p)$/;
function renderCaption(id){
  const txt=NARR[id]||''; const ws=txt.split(/\s+/); let tot=0; cum=[];
  ws.forEach(w=>{tot+=w.length+1;cum.push(tot);}); cum=cum.map(c=>c/tot);
  $('#bubble').innerHTML='<div class="cap">'+ws.map(w=>`<span class="w${HI.test(w.replace(/[.,:;]$/,''))?' hl':''}">${esc(w)}</span>`).join(' ')+'</div><div class="react" style="margin-top:8px;color:var(--amber)"></div>';
  words=$$('#bubble .w');
  if(!soundOn||!AUDIO[id]) words.forEach(w=>w.classList.add('on'));
}
function light(p){ words.forEach((w,i)=>w.classList.toggle('on',(i===0?0:cum[i-1])<=p)); }
au.addEventListener('timeupdate',()=>{ if(au.duration) light(au.currentTime/au.duration+.02); });
au.addEventListener('ended',()=>{Sensei.talk(false);words.forEach(w=>w.classList.add('on'));$('#bNext').classList.add('pulse');if(auto&&cur<SCENES.length-1)setTimeout(()=>{if(!au.paused||au.ended)go(cur+1)},1400);});
au.addEventListener('play',()=>Sensei.talk(true)); au.addEventListener('pause',()=>Sensei.talk(false));
function speak(id){
  stopAudio(); renderCaption(id); $('#bNext').classList.remove('pulse');
  if(!soundOn||!AUDIO[id]||!started){$('#bNext').classList.add('pulse');return;}
  wire(); if(actx&&actx.state==='suspended')actx.resume();
  au.src=AUDIO[id]; au.currentTime=0; au.play().catch(()=>{words.forEach(w=>w.classList.add('on'));});
}
function stopAudio(){ au.pause(); Sensei.talk(false); }
function react(text,mood='happy'){ const r=$('#bubble .react'); if(r) r.textContent=text; Sensei.mood(mood); clearTimeout(react.t); react.t=setTimeout(()=>{Sensei.mood(SCENES[cur]?.mood||'neutral');},2600); }

/* ---- Navigation ---- */
function build(){
  const st=$('#stage'); SCENES.forEach((s,i)=>{
    const sec=document.createElement('div'); sec.className='scene'; sec.id='sc-'+s.id;
    sec.innerHTML=`<div class="kick">lesson ${i} of ${SCENES.length-1} &middot; ${BELTS[s.belt][0]} belt</div><h2>${s.title}</h2>`+s.html; st.appendChild(sec);
  });
  const dots=$('#dots'); SCENES.forEach((s,i)=>{const d=document.createElement('button');d.className='dot';d.title=i+'. '+s.title;d.setAttribute('aria-label','Lesson '+i+': '+s.title);d.onclick=()=>go(i);dots.appendChild(d);});
  const bl=$('#belts'); BELTS.forEach(([n,c])=>{const b=document.createElement('div');b.className='belt';b.style.background=c;b.style.color=c;b.title=n+' belt';bl.appendChild(b);});
  SCENES.forEach(s=>s.init&&s.init($('#sc-'+s.id)));
}
function go(i){
  if(i<0||i>=SCENES.length)return; const prev=cur; const s=SCENES[i];
  if(prev>=0){SCENES[prev].leave&&SCENES[prev].leave(); }
  cur=i; seen.add(i);
  $$('.scene').forEach((e,k)=>e.classList.toggle('cur',k===i));
  $$('.dot').forEach((d,k)=>{d.classList.toggle('cur',k===i);d.classList.toggle('seen',seen.has(k)&&k!==i);});
  const bi=s.belt; $$('.belt').forEach((b,k)=>b.classList.toggle('on',k<=bi));
  const oldBelt=prev>=0?SCENES[prev].belt:-1; Sensei.belt(bi); if(bi>oldBelt&&prev>=0){toast('Belt up: '+BELTS[bi][0]+' belt'); Sensei.bow();}
  Sensei.mood(s.mood||'neutral'); $('#stage').scrollTop=0;
  $('#bPrev').disabled=i===0; $('#bNext').disabled=i===SCENES.length-1; $('#bNext').textContent=i===SCENES.length-2?'final trial →':'next →';
  s.enter&&s.enter($('#sc-'+s.id)); speak(s.id);
}
$('#bNext').onclick=()=>go(cur+1); $('#bPrev').onclick=()=>go(cur-1);
$('#bPlay').onclick=()=>{ if(!started)return; const was=soundOn; soundOn=true; $('#bMute').textContent='sound: on'; $('#bMute').setAttribute('aria-pressed','false'); speak(SCENES[cur].id); };
$('#bStop').onclick=stopAudio;
$('#bAuto').onclick=e=>{auto=!auto;e.target.textContent='auto-next: '+(auto?'on':'off');e.target.setAttribute('aria-pressed',auto)};
$('#bMute').onclick=e=>{soundOn=!soundOn;e.target.textContent='sound: '+(soundOn?'on':'off');e.target.setAttribute('aria-pressed',!soundOn);if(!soundOn){stopAudio();words.forEach(w=>w.classList.add('on'));}};
$('#bScan').onclick=e=>{const on=document.body.classList.toggle('noscan');e.target.setAttribute('aria-pressed',!on)};
function enter(snd){ soundOn=snd; started=true; if(!snd){$('#bMute').textContent='sound: off';$('#bMute').setAttribute('aria-pressed','true');}
  $('#intro').classList.add('hidden'); go(0); Sensei.bow(); }
$('#bEnter').onclick=()=>enter(true); $('#bEnterQuiet').onclick=()=>enter(false);
window.addEventListener('keydown',e=>{
  const s=SCENES[cur]; if(!s||$('#intro:not(.hidden)'))return;
  if(s.onKey&&s.onKey(e))return;
  const tag=(document.activeElement&&document.activeElement.tagName)||'';
  if(tag==='INPUT'||tag==='TEXTAREA')return;
  if(e.key==='ArrowRight'&&!e.ctrlKey&&!e.altKey&&!e.shiftKey&&!s.captureArrows){go(cur+1);}
  if(e.key==='ArrowLeft'&&!s.captureArrows){go(cur-1);}
});

/* shared helpers for scenes */
function quiz(root,qs,onDone){ /* qs:[{q,opts:[..],a:idx,why}] */
  let i=0,score=0; const box=root; function draw(){
    if(i>=qs.length){box.innerHTML=`<div class="fb ok">Score: ${score}/${qs.length}</div>`;onDone&&onDone(score);return;}
    const q=qs[i]; box.innerHTML=`<h3>Q${i+1}/${qs.length}</h3><p style="margin:.2em 0 .6em">${q.q}</p>`+q.opts.map((o,k)=>`<button class="pick" data-k="${k}" style="margin-bottom:6px">${o}</button>`).join('')+'<div class="fb"></div>';
    $$('.pick',box).forEach(b=>b.onclick=()=>{ if(b.dataset.done)return; const k=+b.dataset.k; $$('.pick',box).forEach(x=>x.dataset.done=1);
      const ok=k===q.a; if(ok)score++; b.classList.add(ok?'right':'wrong'); if(!ok)$$('.pick',box)[q.a].classList.add('right');
      $('.fb',box).innerHTML=(ok?'<span class="ok">Correct.</span> ':'<span class="bad">Not quite.</span> ')+q.why+` <button class="btn" style="margin-left:8px" id="qn">${i===qs.length-1?'finish':'next'}</button>`;
      react(ok?'Well trained.':'Remember this one.',ok?'happy':'think'); $('#qn',box).onclick=()=>{i++;draw();};});
  } draw();
}
