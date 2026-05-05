/* ══════════════════════════════════════════════════
   MORT-O-MÈTRE — 4 Formes | ZÉRO FOND | JS
   Formes : 0=ange  1=crâne calme  2=crâne agité  3+=démon
   Toggles : fumée orange, pluie de sang
   Commandes : !mort N/+N/-N/reset | !deaths
   Persistance : SE Store
══════════════════════════════════════════════════ */
'use strict';

let deaths     = 0;
let record     = 0;
let FD         = {};
let visible    = false;
let hideTimer  = null;
let showTimer  = null;
let smokeTimer = null;
let bloodTimer = null;
let vortexInt  = null;
let ltTimer    = null;
let vortexAngle= 0;

const fd    = k => FD[k];
const $     = id => document.getElementById(id);
const rand   = (a,b) => Math.random()*(b-a)+a;
const rint   = (a,b) => Math.floor(rand(a,b+1));
const clamp  = (v,lo,hi) => Math.min(Math.max(v,lo),hi);
const num    = (v,d) => { const n=parseInt(v); return isNaN(n)?d:n; };
const SHOW_DUR  = () => num(fd('showDuration'),  8) * 1000;
const CYCLE_INT = () => num(fd('cycleInterval'), 30) * 1000;

/* ══════════════════════════════════════════════════
   TIER (0=ange 1=calme 2=agité 3+=démon)
══════════════════════════════════════════════════ */
function getTier() {
  if (deaths === 0) return 0;
  if (deaths === 1) return 1;
  if (deaths === 2) return 2;
  return 3;
}

function applyTier() {
  const root = $('dc-root');
  root.classList.remove('tier0','tier1','tier2','tier3');
  root.classList.add('tier' + getTier());
}

/* ══════════════════════════════════════════════════
   FORMES SVG
══════════════════════════════════════════════════ */
function showFace(tier) {
  // Retire active de tout le monde
  ['face-0','face-1','face-2','face-3'].forEach(id => {
    $( id)?.classList.remove('active');
  });
  const faceId = tier >= 3 ? 'face-3' : 'face-' + tier;
  $( faceId)?.classList.add('active');
}

/* ══════════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════════ */
function render() {
  const numEl    = $('dc-number');
  const shadowEl = $('dc-number-shadow');
  if (numEl)    numEl.textContent    = deaths;
  if (shadowEl) shadowEl.textContent = deaths;
  applyTier();
  showFace(getTier());
  restartAmbient();
}

/* ══════════════════════════════════════════════════
   SHOW / HIDE
══════════════════════════════════════════════════ */
function show(duration) {
  const root = $('dc-root');
  clearTimeout(hideTimer);
  root.classList.remove('disappearing','appearing','visible');
  void root.offsetWidth;
  root.classList.add('visible','appearing');
  visible = true;
  setTimeout(() => root.classList.remove('appearing'), 1100);
  const dur = duration || SHOW_DUR();
  hideTimer = setTimeout(hide, dur);
  scheduleNext();
  restartAmbient();
}

function hide() {
  const root = $('dc-root');
  clearTimeout(hideTimer);
  stopAmbient();
  root.classList.remove('appearing');
  root.classList.add('disappearing');
  setTimeout(() => {
    root.classList.remove('visible','disappearing');
    visible = false;
  }, 700);
}

function scheduleNext() {
  clearTimeout(showTimer);
  showTimer = setTimeout(() => show(), CYCLE_INT());
}

/* ══════════════════════════════════════════════════
   FUMÉE ORANGE
══════════════════════════════════════════════════ */
function spawnSmoke() {
  if (fd('smokeEnabled') === false || fd('smokeEnabled') === 'false') return;
  const tier = getTier();
  if (tier === 0) return;
  const cont = $('dc-smoke'); if (!cont) return;
  const el  = document.createElement('div'); el.className = 'sm';
  // Spawn concentré autour du crâne, pas sur tout le canvas
  const x   = rand(90, 230);
  const y   = rand(200, 310);
  const sz  = rand(40, 90);  // grand pour rester visible après blur
  const dur = rand(3, 6);
  const dx  = rand(-40, 40);
  const cols   = ['','rgba(255,130,40,','rgba(210,50,0,','rgba(160,10,0,'];
  const alphas = [0, .6, .7, .75];
  const col    = cols[tier];
  const alpha  = alphas[tier] || .6;
  const blurPx = 8; // blur fixe modéré
  el.style.left             = x + 'px';
  el.style.top              = y + 'px';
  el.style.width            = sz + 'px';
  el.style.height           = sz + 'px';
  el.style.background       = `radial-gradient(circle,${col}${alpha}) 0%,${col}0) 75%)`;
  el.style.filter           = `blur(${blurPx}px)`;
  el.style.animationDuration= dur + 's';
  el.style.animationDelay   = rand(0,.3) + 's';
  el.style.setProperty('--sdx', dx + 'px'); // CSS var via setProperty (cssText l'ignore)
  cont.appendChild(el);
  el.addEventListener('animationend', ()=>{ try{el.remove();}catch(e){} });
}

/* ══════════════════════════════════════════════════
   PLUIE DE SANG
══════════════════════════════════════════════════ */
function spawnBloodDrop() {
  if (fd('bloodRainEnabled') === false || fd('bloodRainEnabled') === 'false') return;
  const c = $('dc-blood-rain'); if (!c) return;
  const el  = document.createElement('div'); el.className = 'br';
  const x   = rand(80, 240);  // zone étroite autour du crâne
  const h   = rand(18, 45);
  const dur = rand(0.8, 2.2);
  const tier = getTier();
  const alpha = [0, .5, .75, 1][tier] || .5;
  el.style.cssText = `left:${x}px; top:-30px; height:${h}px; opacity:${alpha}; animation-duration:${dur}s; animation-delay:${rand(0,.4)}s;`;
  c.appendChild(el);
  el.addEventListener('animationend', ()=>{ try{el.remove();}catch(e){} });
}

/* ══════════════════════════════════════════════════
   VORTEX DE PARTICULES
══════════════════════════════════════════════════ */
function spawnVortex() {
  const tier = getTier();
  if (tier === 0) return;
  const c = $('dc-vortex'); if (!c) return;
  const radii = [0, 55, 65, 78][tier] || 55;
  const speed = [0, 11, 7, 3.5][tier] || 8;
  const cols  = [
    [],
    ['#c8922a','#ff6b00','#f0c060'],
    ['#ff4400','#ff8800','#cc0000'],
    ['#ff0000','#ff4400','#ff8800','#ffcc00'],
  ][tier] || [];

  const count = [0, 2, 4, 8][tier] || 2;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div'); el.className = 'vp';
    const angle = (vortexAngle + i * (360 / count)) % 360;
    const a0    = angle;
    const a50   = (angle + 180) % 360;
    const a100  = (angle + 360) % 360;
    const sz    = rand(3, 7);
    const col   = cols[rint(0, cols.length-1)];
    el.style.cssText = `
      left:calc(50% - ${sz/2}px); top:calc(42% - ${sz/2}px);
      width:${sz}px; height:${sz}px;
      background-color:${col}; border-radius:50%;
      box-shadow:0 0 ${sz*2.5}px ${col};
      --rad:${radii + rand(-5,5)}px;
      --a0:${a0}deg; --a50:${a50}deg; --a100:${a100}deg;
      animation-duration:${speed + rand(-1,1)}s;
      animation-delay:${rand(0, speed*.5)}s;
      opacity:${rand(.55,.9)};
    `;
    c.appendChild(el);
  }
  vortexAngle = (vortexAngle + 18) % 360;
  // Nettoyer si trop
  while (c.children.length > 80) c.removeChild(c.firstChild);
}

/* ══════════════════════════════════════════════════
   ÉCLAIRS
══════════════════════════════════════════════════ */
function spawnLightning() {
  const tier = getTier();
  if (tier < 2) return;
  const c = $('dc-lightning'); if (!c) return;
  const count = tier === 3 ? 4 : 2;
  for (let i = 0; i < count; i++) setTimeout(() => {
    const el = document.createElement('div'); el.className = 'lt';
    const side = Math.random() > .5 ? 'left' : 'right';
    const x    = side === 'left' ? rand(15, 100) : rand(220, 305);
    const rot  = side === 'left' ? rand(8, 22) : rand(-22, -8);
    const col  = tier === 3 ? '#ff0000' : '#ff6600';
    el.style.cssText = `top:0; left:${x}px; transform:rotate(${rot}deg);
      background:linear-gradient(${col},transparent);
      box-shadow:0 0 10px ${col},0 0 20px rgba(255,100,0,.4);
      animation-duration:.5s;`;
    c.appendChild(el);
    el.addEventListener('animationend', ()=>{ try{el.remove();}catch(e){} });
  }, i * rand(40, 100));
}

/* ══════════════════════════════════════════════════
   GESTION AMBIANTS
══════════════════════════════════════════════════ */
function stopAmbient() {
  clearInterval(smokeTimer);
  clearInterval(bloodTimer);
  clearInterval(vortexInt);
  clearInterval(ltTimer);
}

function restartAmbient() {
  stopAmbient();
  if (!visible) return;
  const tier = getTier();

  // Fumée
  const smIntervals = [0, 900, 550, 280][tier] || 0;
  if (smIntervals > 0) {
    smokeTimer = setInterval(spawnSmoke, smIntervals);
    spawnSmoke(); spawnSmoke();
  }

  // Pluie de sang
  const brIntervals = [0, 400, 180, 80][tier] || 0;
  if (brIntervals > 0) {
    bloodTimer = setInterval(spawnBloodDrop, brIntervals);
    spawnBloodDrop(); spawnBloodDrop(); spawnBloodDrop(); spawnBloodDrop(); spawnBloodDrop();
  }

  // Vortex
  if (tier > 0) {
    vortexInt = setInterval(spawnVortex, 400);
    spawnVortex();
  }

  // Éclairs
  const ltIntervals = [0, 0, 5000, 1800][tier] || 0;
  if (ltIntervals > 0) {
    ltTimer = setInterval(spawnLightning, ltIntervals);
    spawnLightning();
  }
}

/* ══════════════════════════════════════════════════
   ANIMATIONS EVENT
══════════════════════════════════════════════════ */
function animateEvent(delta) {
  const tier    = getTier();
  const faceId  = tier >= 3 ? 'face-3' : 'face-' + tier;
  const faceEl  = $(faceId);
  const numEl   = $('dc-number');
  const shEl    = $('dc-number-shadow');

  // Flash visage
  if (faceEl) {
    faceEl.classList.remove('hit','revive');
    void faceEl.offsetWidth;
    faceEl.className = faceEl.className.replace('hit','').replace('revive','').trim();
    faceEl.classList.add(delta >= 0 ? 'hit' : 'revive');
    setTimeout(() => { faceEl.classList.remove('hit','revive'); }, 520);
  }

  // Compteur
  if (numEl) {
    numEl.classList.remove('bump','drop','distort');
    void numEl.offsetWidth;
    numEl.classList.add(delta >= 0 ? 'bump' : 'drop', 'distort');
    if (shEl) { shEl.classList.remove('bump','drop'); void shEl.offsetWidth; shEl.classList.add(delta >= 0 ? 'bump' : 'drop'); }
    setTimeout(() => { numEl.classList.remove('bump','drop','distort'); if(shEl)shEl.classList.remove('bump','drop'); }, 650);
  }

  // Flash lumineux global
  const root = $('dc-root');
  root.style.filter = delta >= 0 ? 'brightness(2.5) saturate(2.5)' : 'brightness(2) hue-rotate(120deg)';
  setTimeout(() => root.style.filter = '', 100);

  // Burst particules
  burstParticles(delta);

  // Éclairs immédiats (tier 2+)
  if (tier >= 2) { for(let i=0;i<3;i++) setTimeout(spawnLightning, i*70); }


}

function burstParticles(delta) {
  const c    = $('dc-burst'); if (!c) return;
  const tier = getTier();
  const n    = [5, 12, 22, 45][tier] || 10;
  const col  = delta >= 0
    ? ['#ffcc00','#cc0000','#ff4400','#ff0000'][tier]
    : '#9900ff';
  const col2 = delta >= 0
    ? ['#ffaa00','#ff6600','#ff8800','#ff6600'][tier]
    : '#cc44ff';
  const chars = delta >= 0 ? ['💀','🦴','★','◆','⚡','✦','🔥'] : ['✦','★','◆','⬟','☽'];

  for (let i=0; i<n; i++) setTimeout(() => {
    const el = document.createElement('div'); el.className = 'bp';
    const ch  = chars[rint(0, chars.length-1)];
    const c2  = Math.random() > .5 ? col : col2;
    const x   = rand(20, 300), y = rand(50, 320);
    const dx  = rand(-180, 180), dy = rand(-240, -20);
    const dx2 = rand(-70, 70),   dy2 = rand(-100, -10);
    const r   = rand(-720, 720), r2  = rand(-360, 360);
    const dur = rand(.6, 2.8),   sz  = rand(14, 42);
    el.textContent = ch;
    el.style.cssText = `left:${x}px;top:${y}px;font-size:${sz}px;color:${c2};
      text-shadow:0 0 12px ${c2},0 0 28px ${c2};opacity:1;
      --dx:${dx}px;--dy:${dy}px;--dx2:${dx2}px;--dy2:${dy2}px;
      --r:${r}deg;--r2:${r2}deg;animation-duration:${dur}s;`;
    c.appendChild(el);
    el.addEventListener('animationend', ()=>{ try{el.remove();}catch(e){} });
  }, i * 22);
}

function milestone(text) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);
    z-index:20;pointer-events:none;
    font-family:'Cinzel',serif;font-weight:900;font-size:32px;
    color:#ff2200;letter-spacing:.12em;text-transform:uppercase;
    text-shadow:0 0 20px #ff0000,0 0 45px #ff4400;
    -webkit-text-stroke:2px #000;
    white-space:nowrap;
    animation:mileAnim 2.8s ease forwards;
  `;
  el.textContent = '☠ ' + text + ' ☠';
  const style = document.createElement('style');
  style.textContent = '@keyframes mileAnim{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}30%{transform:translate(-50%,-50%) scale(1)}65%{opacity:1}100%{opacity:0;transform:translate(-50%,-60%) scale(1.08)}}';
  document.head.appendChild(style);
  $('dc-root').appendChild(el);
  setTimeout(() => { try{el.remove();style.remove();}catch(e){} }, 2900);
}

/* ══════════════════════════════════════════════════
   SE STORE
══════════════════════════════════════════════════ */
function save() {
  try { SE_API.store.set('mort_o_metre_4f', JSON.stringify({ deaths, record })); } catch(e) {}
}
function load() {
  try {
    SE_API.store.get('mort_o_metre_4f').then(data => {
      if (!data) return;
      const p = JSON.parse(data);
      deaths = parseInt(p.deaths) || 0;
      record = parseInt(p.record) || 0;
      render();
    });
  } catch(e) {}
}

/* ══════════════════════════════════════════════════
   COMMANDES CHAT
══════════════════════════════════════════════════ */
function parseMort(args) {
  if (!args?.trim()) return { action:'add', value:1 };
  const a = args.trim().toLowerCase();
  if (a === 'reset') return { action:'reset' };
  const signed = a.match(/^([+-])(\d+)$/);
  if (signed) return { action: signed[1]==='+'?'add':'sub', value:parseInt(signed[2]) };
  const abs = a.match(/^(\d+)$/);
  if (abs)    return { action:'set', value:parseInt(abs[1]) };
  return null;
}
function isMod(tags) {
  return tags?.broadcaster==='1'||tags?.mod==='1'||tags?.moderator==='1'
    ||(tags?.badges||'').includes('broadcaster')||(tags?.badges||'').includes('moderator');
}

function applyDeath(newVal) {
  const prev = deaths;
  deaths = clamp(newVal, 0, 9999);
  if (deaths > record) record = deaths;
  render();
  save();
  const delta = deaths - prev;
  if (!visible) {
    show(Math.max(SHOW_DUR(), 6000));
    setTimeout(() => animateEvent(delta), 500);
  } else {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, SHOW_DUR());
    animateEvent(delta);
  }
}

/* ══════════════════════════════════════════════════
   SE LISTENERS
══════════════════════════════════════════════════ */
window.addEventListener('onWidgetLoad', function(obj) {
  FD = obj?.detail?.fieldData || {};
  load();

  // Compteur manuel dans FIELDS
  setTimeout(() => {
    const manual = num(fd('deathCount'), -1);
    if (manual >= 0 && manual !== deaths) applyDeath(manual);
    else render();
  }, 700);

  // Première apparition
  setTimeout(() => show(), 2000);
});

window.addEventListener('onEventReceived', function(obj) {
  if (!obj?.detail) return;
  const { listener, event } = obj.detail;
  if (listener !== 'message' || !event?.data?.text) return;

  const text  = event.data.text.trim();
  const tags  = event.data.tags || event.data;
  const lower = text.toLowerCase();

  if (lower === '!deaths') { show(Math.max(SHOW_DUR(), 5000)); return; }
  if (!lower.startsWith('!mort')) return;
  if (!isMod(tags)) return;

  const parsed = parseMort(text.slice(5).trim());
  if (!parsed) return;

  if (parsed.action === 'reset')  applyDeath(0);
  else if (parsed.action === 'set')  applyDeath(parsed.value);
  else if (parsed.action === 'add')  applyDeath(deaths + parsed.value);
  else if (parsed.action === 'sub')  applyDeath(deaths - parsed.value);
});
