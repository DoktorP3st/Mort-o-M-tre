/* ══════════════════════════════════════════════════
   MORT-O-MÈTRE — MAX EFFECTS | JS
   - 3 thèmes visuels (Diablo / Infernal / Shadow)
   - Compteur manuel dans le panel SE
   - Commandes chat
   - SE Store persistence
   - Tous les effets max par défaut
══════════════════════════════════════════════════ */
'use strict';

let deaths    = 0;
let prevDeaths = 0;
let record    = 0;
let FD        = {};
let visible   = false;
let hideTimer = null;
let showTimer = null;
let ptimer    = null;
let vtimer    = null;
let ltimer    = null;
let ashTimer  = null;

const fd   = k => FD[k];
const $    = id => document.getElementById(id);
const sv   = (k,v) => document.documentElement.style.setProperty(k,v);
const rand  = (a,b) => Math.random()*(b-a)+a;
const rint  = (a,b) => Math.floor(rand(a,b+1));
const clamp = (v,lo,hi) => Math.min(Math.max(v,lo),hi);
const num   = (v,d)   => { const n=parseInt(v); return isNaN(n)?d:n; };

const SHOW_DURATION  = () => num(fd('showDuration'),  8) * 1000;
const CYCLE_INTERVAL = () => num(fd('cycleInterval'), 30) * 1000;

/* ══════════════════════════════════════════════════
   THÈME
══════════════════════════════════════════════════ */
function applyTheme() {
  const root  = $('dc-root');
  const theme = fd('visualTheme') || 'diablo';
  root.classList.remove('theme-infernal','theme-shadow');
  if (theme === 'infernal') root.classList.add('theme-infernal');
  if (theme === 'shadow')   root.classList.add('theme-shadow');
}

/* ══════════════════════════════════════════════════
   TIER
══════════════════════════════════════════════════ */
function getTier() {
  if (deaths >= 20) return 3;
  if (deaths >= 10) return 2;
  if (deaths >= 5)  return 1;
  return 0;
}
function applyTier() {
  const root = $('dc-root');
  root.classList.remove('tier1','tier2','tier3');
  const t = getTier();
  if (t > 0) root.classList.add('tier'+t);
}

/* ══════════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════════ */
function render() {
  const numEl   = $('dc-number');
  const shadowEl= $('dc-number-shadow');
  if (numEl)    numEl.textContent    = deaths;
  if (shadowEl) shadowEl.textContent = deaths;
  applyTier();
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

  const dur = duration || SHOW_DURATION();
  hideTimer = setTimeout(hide, dur);
  scheduleNext();

  // Démarrer effets ambiants
  restartAmbient();
}

function hide() {
  const root = $('dc-root');
  clearTimeout(hideTimer);
  clearInterval(ptimer);
  clearInterval(vtimer);
  clearInterval(ltimer);
  root.classList.remove('appearing');
  root.classList.add('disappearing');
  setTimeout(() => {
    root.classList.remove('visible','disappearing');
    visible = false;
  }, 700);
}

function scheduleNext() {
  clearTimeout(showTimer);
  showTimer = setTimeout(() => show(), CYCLE_INTERVAL());
}

/* ══════════════════════════════════════════════════
   EFFETS AMBIANTS PERMANENTS
══════════════════════════════════════════════════ */

// Pluie de cendres
function spawnAsh() {
  const c = $('dc-ash'); if (!c) return;
  const el = document.createElement('div'); el.className = 'ash';
  const x   = rand(0, 340);
  const dur  = rand(3, 8);
  const ax   = rand(-30, 30);
  const sz   = rand(1, 3);
  el.style.cssText = `left:${x}px;top:-8px;width:${sz}px;height:${sz*3}px;--ax:${ax}px;animation-duration:${dur}s;animation-delay:${rand(0,.5)}s;`;
  c.appendChild(el);
  el.addEventListener('animationend', ()=>{ try{el.remove();}catch(e){} });
}

// Particules montantes
const CHARS = ['💀','🦴','✦','◆','★','⬟'];
function spawnParticle() {
  const c = $('dc-particles'); if (!c) return;
  const tier  = getTier();
  const theme = fd('visualTheme') || 'diablo';
  const cols  = theme === 'shadow'
    ? ['#9900ff','#6600cc','#cc88ff','#4400aa']
    : theme === 'infernal'
      ? ['#ff0000','#ff4400','#ff8800','#ffcc00']
      : ['#c8922a','#8b0000','#ff6b00','#f0c060'];
  const col  = cols[rint(0,cols.length-1)];
  const char = CHARS[rint(0,CHARS.length-1)];
  const el   = document.createElement('div'); el.className = 'dp';
  const x=rand(10,330), y=rand(180,400);
  const dx=rand(-60,60), dy=-rand(80,220);
  const dx2=rand(-30,30), dy2=-rand(40,100);
  const r=rand(-360,360), r2=rand(-180,180);
  const dur=rand(2.5,6), sz=rand(11,20);
  el.textContent = char;
  el.style.cssText=`left:${x}px;top:${y}px;font-size:${sz}px;color:${col};text-shadow:0 0 8px ${col};opacity:.85;--dx:${dx}px;--dy:${dy}px;--dx2:${dx2}px;--dy2:${dy2}px;--r:${r}deg;--r2:${r2}deg;animation-duration:${dur}s;animation-delay:${rand(0,.3)}s;`;
  c.appendChild(el);
  el.addEventListener('animationend',()=>{try{el.remove();}catch(e){}});
}

// Vortex autour du crâne
let vortexAngle = 0;
function spawnVortexParticle() {
  const c = $('dc-vortex'); if (!c) return;
  const tier  = getTier();
  const radii  = [60, 70, 80, 90];
  const rad   = radii[tier] + rand(-10,10);
  const speed = [12,9,6,3][tier] || 12; // secondes par tour
  const theme = fd('visualTheme') || 'diablo';
  const cols  = theme === 'shadow'
    ? ['#9900ff','#cc00ff','#6600cc']
    : theme === 'infernal'
      ? ['#ff0000','#ff4400','#ff8800']
      : ['#c8922a','#ff6b00','#cc0000'];

  for (let i = 0; i < (tier+1)*2; i++) {
    const el = document.createElement('div'); el.className = 'vp';
    const angle = (vortexAngle + i*(360/((tier+1)*4))) % 360;
    const a0    = angle;
    const a50   = (angle + 180) % 360;
    const a100  = (angle + 360) % 360;
    const sz    = rand(3,7);
    const col   = cols[rint(0,cols.length-1)];
    el.style.cssText = [
      `left:calc(50% - ${sz/2}px)`,
      `top:calc(42% - ${sz/2}px)`,
      `width:${sz}px`,`height:${sz}px`,
      `background-color:${col}`,
      `box-shadow:0 0 ${sz*2}px ${col}`,
      `--rad:${rad}px`,
      `--a0:${a0}deg`,`--a50:${a50}deg`,`--a100:${a100}deg`,
      `animation-duration:${speed + rand(-1,1)}s`,
      `animation-delay:${rand(0,speed*.5)}s`,
      `opacity:${rand(.5,.9)}`,
    ].join(';');
    c.appendChild(el);
  }
  vortexAngle = (vortexAngle + 15) % 360;
  // Nettoyer si trop
  while (c.children.length > 60) c.removeChild(c.firstChild);
}

// Éclairs aléatoires
function spawnLightning() {
  const c = $('dc-lightning'); if (!c) return;
  const count = getTier() + 1;
  for (let i = 0; i < count; i++) setTimeout(() => {
    const el = document.createElement('div'); el.className = 'lt';
    const side = Math.random() > .5 ? 'left' : 'right';
    const x = side === 'left' ? rand(20,100) : rand(240,320);
    const rot = side === 'left' ? rand(8,22) : rand(-22,-8);
    el.style.cssText = `top:0;${side}:${x - 170}px;left:${x}px;transform:rotate(${rot}deg);transform-origin:top;animation-duration:.5s;`;
    c.appendChild(el);
    el.addEventListener('animationend',()=>{try{el.remove();}catch(e){}});
  }, i * rand(40,120));
}

function restartAmbient() {
  clearInterval(ptimer); clearInterval(vtimer); clearInterval(ltimer); clearInterval(ashTimer);
  if (!visible) return;
  const tier = getTier();
  const pInterval = [1000, 700, 450, 200][tier] || 1000;
  const ltInterval= [15000, 8000, 4000, 1800][tier] || 15000;
  ptimer   = setInterval(spawnParticle, pInterval);
  vtimer   = setInterval(spawnVortexParticle, 500);
  ltimer   = setInterval(spawnLightning, ltInterval);
  ashTimer = setInterval(spawnAsh, 400);
  // Init immédiat
  spawnParticle(); spawnParticle(); spawnParticle();
  spawnVortexParticle();
  spawnLightning();
  spawnAsh(); spawnAsh(); spawnAsh();
}

/* ══════════════════════════════════════════════════
   ANIMATIONS SUR ÉVÉNEMENT
══════════════════════════════════════════════════ */
function animateEvent(delta) {
  const skull  = $('dc-skull');
  const numEl  = $('dc-number');
  const shEl   = $('dc-number-shadow');
  if (!skull || !numEl) return;

  // Skull
  skull.classList.remove('hit','revive');
  void skull.offsetWidth;
  skull.className = delta >= 0 ? 'hit' : 'revive';
  setTimeout(()=> skull.className = '', 500);

  // Compteur : bump + distorsion
  numEl.classList.remove('bump','drop','distort');
  if(shEl) shEl.classList.remove('bump','drop');
  void numEl.offsetWidth;
  const cls = delta >= 0 ? 'bump' : 'drop';
  numEl.classList.add(cls, 'distort');
  if(shEl) shEl.classList.add(cls);
  setTimeout(()=>{
    numEl.classList.remove('bump','drop','distort');
    if(shEl) shEl.classList.remove('bump','drop');
  }, 650);

  // Burst particules ultra
  burstParticles(delta);

  // Flash global
  flashRoot(delta);

  // Éclairs immédiats
  for (let i = 0; i < 3; i++) setTimeout(spawnLightning, i * 80);

  // Milestone spécial : exactement 10 morts
  if (deaths === 10 && delta > 0) milestoneEffect('DIX MORTS');
  if (deaths === 20 && delta > 0) milestoneEffect('VINGT MORTS');
}

function flashRoot(delta) {
  const root = $('dc-root');
  root.style.filter = delta >= 0
    ? 'brightness(2.2) saturate(2)'
    : 'brightness(1.8) saturate(1.5) hue-rotate(120deg)';
  setTimeout(()=> root.style.filter = '', 120);
}

function burstParticles(delta) {
  const c    = $('dc-burst'); if (!c) return;
  const tier = getTier();
  const n    = [18, 28, 40, 60][tier] || 20;
  const theme= fd('visualTheme') || 'diablo';
  const col  = delta >= 0
    ? (theme === 'shadow' ? '#9900ff' : theme === 'infernal' ? '#ff0000' : '#cc0000')
    : (theme === 'shadow' ? '#00ffcc' : '#9900ff');
  const col2 = delta >= 0
    ? (theme === 'shadow' ? '#cc00ff' : '#ff6600')
    : '#cc44ff';
  const chars= delta >= 0 ? ['💀','🦴','★','◆','⚡','✦'] : ['✦','★','◆','⬟'];

  for (let i=0; i<n; i++) setTimeout(()=>{
    const el = document.createElement('div'); el.className = 'bp';
    const char = chars[rint(0,chars.length-1)];
    const c2   = Math.random() > .5 ? col : col2;
    const x=rand(30,310), y=rand(60,320);
    const dx=rand(-160,160), dy=rand(-220,-20);
    const dx2=rand(-60,60), dy2=rand(-90,-10);
    const r=rand(-720,720), r2=rand(-360,360);
    const dur=rand(.6,2.5), sz=rand(14,38);
    el.textContent = char;
    el.style.cssText=`left:${x}px;top:${y}px;font-size:${sz}px;color:${c2};text-shadow:0 0 12px ${c2},0 0 25px ${c2};opacity:1;--dx:${dx}px;--dy:${dy}px;--dx2:${dx2}px;--dy2:${dy2}px;--r:${r}deg;--r2:${r2}deg;animation-duration:${dur}s;`;
    c.appendChild(el);
    el.addEventListener('animationend',()=>{try{el.remove();}catch(e){}});
  }, i * 25);
}

// Effet milestone (10 morts, 20 morts...)
function milestoneEffect(text) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
    z-index:20;pointer-events:none;
    font-family:'Cinzel',serif;font-weight:900;font-size:36px;
    color:#ff2200;letter-spacing:.15em;text-transform:uppercase;
    text-shadow:0 0 20px #ff0000,0 0 40px #ff4400;
    -webkit-text-stroke:2px #000;
    animation:milestoneAnim 2.5s ease forwards;
    white-space:nowrap;
  `;
  el.textContent = '⚡ ' + text + ' ⚡';
  const style = document.createElement('style');
  style.textContent = '@keyframes milestoneAnim{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}30%{transform:translate(-50%,-50%) scale(1)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-60%) scale(1.1)}}';
  document.head.appendChild(style);
  $('dc-root').appendChild(el);
  setTimeout(()=>{try{el.remove();style.remove();}catch(e){}}, 2600);
}

/* ══════════════════════════════════════════════════
   SE STORE
══════════════════════════════════════════════════ */
function save() {
  try { SE_API.store.set('mort_o_metre_v2', JSON.stringify({ deaths, record })); } catch(e) {}
}
function load() {
  try {
    SE_API.store.get('mort_o_metre_v2').then(data => {
      if (!data) return;
      const p = JSON.parse(data);
      deaths = parseInt(p.deaths) || 0;
      record = parseInt(p.record) || 0;
      render();
    });
  } catch(e) {}
}

/* ══════════════════════════════════════════════════
   PARSE COMMANDE
══════════════════════════════════════════════════ */
function parseMort(args) {
  if (!args || !args.trim()) return { action:'add', value:1 };
  const a = args.trim().toLowerCase();
  if (a === 'reset') return { action:'reset' };
  const signed = a.match(/^([+-])(\d+)$/);
  if (signed) return { action: signed[1]==='+'?'add':'sub', value:parseInt(signed[2]) };
  const abs = a.match(/^(\d+)$/);
  if (abs) return { action:'set', value:parseInt(abs[1]) };
  return null;
}

function isMod(tags) {
  return tags?.broadcaster==='1'||tags?.mod==='1'||tags?.moderator==='1'
    ||(tags?.badges||'').includes('broadcaster')||(tags?.badges||'').includes('moderator');
}

function applyDeath(newVal) {
  prevDeaths = deaths;
  deaths     = clamp(newVal, 0, 9999);
  if (deaths > record) record = deaths;
  render();
  save();
  const delta = deaths - prevDeaths;
  if (!visible) {
    show(Math.max(SHOW_DURATION(), 6000));
    setTimeout(()=> animateEvent(delta), 500);
  } else {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, SHOW_DURATION());
    animateEvent(delta);
  }
}

/* ══════════════════════════════════════════════════
   SE LISTENERS
══════════════════════════════════════════════════ */
window.addEventListener('onWidgetLoad', function(obj) {
  FD = obj?.detail?.fieldData || {};

  // Thème
  applyTheme();

  // Chargement depuis le store
  load();

  // Vérifier si le compteur manuel a changé
  const manualVal = num(fd('deathCount'), -1);
  if (manualVal >= 0 && manualVal !== deaths) {
    // Délai pour laisser le store charger d'abord
    setTimeout(() => {
      if (manualVal !== deaths) applyDeath(manualVal);
    }, 600);
  }

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

  // !deaths — tout le monde
  if (lower === '!deaths') { show(Math.max(SHOW_DURATION(), 5000)); return; }

  // !mort — mods seulement
  if (!lower.startsWith('!mort')) return;
  if (!isMod(tags)) return;

  const parsed = parseMort(text.slice(5).trim());
  if (!parsed) return;

  if (parsed.action === 'reset') {
    applyDeath(0);
  } else if (parsed.action === 'set') {
    applyDeath(parsed.value);
  } else if (parsed.action === 'add') {
    applyDeath(deaths + parsed.value);
  } else if (parsed.action === 'sub') {
    applyDeath(deaths - parsed.value);
  }
});
