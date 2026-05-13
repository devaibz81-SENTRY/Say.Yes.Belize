/**
 * said-yes-setup.js
 * Said Yes Belize — Shared Template Setup Engine
 * Locked by default. Guided tour unlocks: Names, Date, Hero Photo ONLY.
 * Usage: SaidYes.init({ slug:'analog', accent:'#bc4637', dark:true })
 */
(function(global){
'use strict';

/* ─── Fonts available ─────────────────────────────────── */
const FONTS = [
  { label:'Script',  value:"'Bridal Routine', cursive",     file:'../fonts/Bridal_Routine.ttf' },
  { label:'Serif',   value:"'Cormorant Garamond', serif",   file:null },
  { label:'Modern',  value:"'Plus Jakarta Sans', sans-serif",file:null }
];

/* ─── Helpers ─────────────────────────────────────────── */
function $(sel, ctx){ return (ctx||document).querySelector(sel); }
function $$(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }
function store(key){ try{ return JSON.parse(localStorage.getItem(key)||'null'); }catch(e){ return null; } }
function save(key,val){ try{ localStorage.setItem(key,JSON.stringify(val)); }catch(e){} }

/* ─── Detect editable targets ─────────────────────────── */
function detectName(){
  // h1 with couple-like text, or largest heading
  return $$('h1,h2').find(el=>{
    const t=(el.textContent||'').trim();
    return t.length>2 && t.length<80;
  });
}
function detectDate(){
  return $$('p,span,h3,h4').find(el=>{
    const t=(el.textContent||'').trim();
    return /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{4})\b/i.test(t)
      && t.length<120;
  });
}
function detectHero(){
  // Full-screen / full-width hero image
  const imgs=$$('img').filter(img=>{
    const cl=img.className||'';
    return /w-full|h-full|h-screen|object-cover|inset-0|hero/.test(cl)
      || img.getAttribute('data-alt')||''
      || img.style.position==='absolute';
  });
  if(imgs.length) return imgs[0];
  // fallback: any img wider than 300px
  return $$('img').find(img=>img.width>300||img.getBoundingClientRect().width>300);
}

/* ─── Auto text-fit ───────────────────────────────────── */
function autoFitText(el){
  if(!el) return;
  el.style.fontSize='';
  const parent=el.parentElement;
  if(!parent) return;
  const maxW=parent.offsetWidth||window.innerWidth;
  let size=parseInt(getComputedStyle(el).fontSize)||48;
  el.style.whiteSpace='nowrap';
  while(el.scrollWidth>maxW && size>16){ size--; el.style.fontSize=size+'px'; }
  el.style.whiteSpace='';
}

/* ─── Inject styles ───────────────────────────────────── */
function injectStyles(accent){
  if($('#sy-styles')) return;
  const s=document.createElement('style');
  s.id='sy-styles';
  s.textContent=`
    /* Locked state */
    .sy-editable-locked { cursor:default !important; pointer-events:none; }

    /* Tour overlay */
    #sy-overlay{
      position:fixed;inset:0;z-index:9000;
      background:rgba(0,0,0,0);
      pointer-events:none;
      transition:background .35s ease;
    }
    #sy-overlay.sy-on{ background:rgba(0,0,0,.54); pointer-events:auto; }

    /* Spotlight */
    #sy-spotlight{
      position:fixed;z-index:9001;
      border-radius:12px;
      box-shadow:0 0 0 9999px rgba(0,0,0,.54), 0 0 0 2px ${accent}88, 0 20px 60px rgba(0,0,0,.4);
      pointer-events:none;
      transition:all .4s cubic-bezier(.22,1,.36,1);
      opacity:0;
    }
    #sy-spotlight.sy-on{ opacity:1; }

    /* Tour card */
    #sy-card{
      position:fixed;bottom:28px;right:24px;
      width:min(380px,calc(100vw - 32px));
      background:rgba(14,12,10,.92);
      border:1px solid rgba(255,255,255,.1);
      border-radius:20px;
      padding:24px;
      z-index:9100;
      opacity:0;transform:translateY(16px) scale(.97);
      pointer-events:none;
      transition:opacity .3s ease,transform .3s cubic-bezier(.22,1,.36,1);
      backdrop-filter:blur(28px);
      box-shadow:0 32px 80px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.07);
      font-family:'Plus Jakarta Sans',sans-serif;
      color:#f0e8d8;
    }
    #sy-card.sy-on{ opacity:1; transform:none; pointer-events:auto; }
    .sy-step-label{
      font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;
      color:${accent};margin:0 0 10px;
    }
    .sy-card-title{
      font-size:20px;font-weight:600;margin:0 0 6px;line-height:1.2;
      color:#fff;
    }
    .sy-card-desc{ font-size:13px;line-height:1.55;color:rgba(240,232,216,.65);margin:0 0 16px; }
    .sy-progress{ display:flex;gap:5px;margin-bottom:20px; }
    .sy-pip{ height:3px;border-radius:3px;background:rgba(255,255,255,.15);flex:1;transition:background .3s; }
    .sy-pip.done{ background:${accent}; }

    /* Inline name editor */
    .sy-name-input{
      width:100%;background:rgba(255,255,255,.07);
      border:1px solid ${accent}66;border-radius:8px;
      padding:10px 14px;color:#fff;font-size:16px;
      font-family:inherit;outline:none;margin-bottom:12px;
      transition:border-color .2s;
    }
    .sy-name-input:focus{ border-color:${accent}; }

    /* Font + size row */
    .sy-controls{ display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap; }
    .sy-font-select{
      flex:1;min-width:120px;background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.14);border-radius:8px;
      color:#f0e8d8;font-size:12px;padding:7px 10px;outline:none;cursor:pointer;
    }
    .sy-size-wrap{ display:flex;align-items:center;gap:4px; }
    .sy-size-btn{
      width:28px;height:28px;border-radius:50%;
      background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);
      color:#f0e8d8;font-size:14px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;transition:background .2s;
    }
    .sy-size-btn:hover{ background:rgba(255,255,255,.16); }
    .sy-size-val{ font-size:12px;color:rgba(240,232,216,.5);min-width:30px;text-align:center; }

    /* Buttons */
    .sy-btn-row{ display:flex;gap:10px; }
    .sy-btn{
      flex:1;min-height:42px;border-radius:999px;
      font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
      cursor:pointer;border:1px solid rgba(255,255,255,.14);
      background:rgba(255,255,255,.07);color:rgba(240,232,216,.7);
      transition:background .2s,transform .15s;font-family:inherit;
    }
    .sy-btn:hover{ background:rgba(255,255,255,.13);transform:translateY(-1px); }
    .sy-btn-primary{
      background:${accent};border-color:${accent};
      color:#1a1410;font-weight:800;
    }
    .sy-btn-primary:hover{ filter:brightness(1.1);transform:translateY(-1px); }

    /* Hero upload zone */
    .sy-hero-zone{
      position:absolute;inset:0;z-index:10;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:rgba(0,0,0,.42);
      cursor:pointer;
      opacity:0;transition:opacity .3s;
    }
    .sy-hero-zone.active{ opacity:1; }
    .sy-hero-pulse{
      width:64px;height:64px;border-radius:50%;
      border:2px solid ${accent};
      display:flex;align-items:center;justify-content:center;
      font-size:28px;margin-bottom:12px;
      animation:syPulse 1.8s ease-in-out infinite;
    }
    @keyframes syPulse{
      0%,100%{ box-shadow:0 0 0 0 ${accent}66; }
      50%{ box-shadow:0 0 0 14px ${accent}00; }
    }
    .sy-hero-label{
      font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;
      font-weight:700;letter-spacing:.1em;text-transform:uppercase;
      color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.6);
    }

    /* FAB */
    #sy-fab{
      position:fixed;bottom:24px;right:24px;z-index:8500;
      min-width:68px;height:40px;border-radius:999px;padding:0 16px;
      background:${accent};border:none;
      color:#1a1410;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;
      cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;
      box-shadow:0 8px 28px rgba(0,0,0,.28);
      transition:transform .2s,filter .2s;
    }
    #sy-fab:hover{ transform:scale(1.06);filter:brightness(1.1); }

    @media(max-width:480px){
      #sy-card{ bottom:0;right:0;width:100%;border-radius:20px 20px 0 0;padding:20px 18px 32px; }
    }
  `;
  document.head.appendChild(s);
}

/* ─── Main Setup Class ────────────────────────────────── */
class SaidYesSetup {
  constructor(cfg){
    this.slug    = cfg.slug || 'template';
    this.accent  = cfg.accent || '#b88e44';
    this.dark    = cfg.dark || false;
    this.storeKey= 'sy_'+this.slug;
    this.step    = 0; // 0=off, 1=name, 2=date, 3=hero
    this.data    = store(this.storeKey) || {};
    this._nameEl = null;
    this._dateEl = null;
    this._heroEl = null;
    this._fontSize= null;
    this._font   = FONTS[0].value;
    this._tourSeen = store(this.storeKey+'_seen');
  }

  init(){
    injectStyles(this.accent);
    this._buildUI();
    this._applyData();

    // Show FAB always (owner can restart tour)
    this._fab.style.display='flex';

    if(!this._tourSeen){
      // First visit — start tour after brief delay
      setTimeout(()=>this.startTour(),900);
    }
  }

  /* ─── Build tour UI ─── */
  _buildUI(){
    // Overlay
    const ov=document.createElement('div'); ov.id='sy-overlay'; document.body.appendChild(ov);
    this._overlay=ov;

    // Spotlight
    const sp=document.createElement('div'); sp.id='sy-spotlight'; document.body.appendChild(sp);
    this._spotlight=sp;

    // Card
    const card=document.createElement('div'); card.id='sy-card'; document.body.appendChild(card);
    this._card=card;

    // FAB
    const fab=document.createElement('button'); fab.id='sy-fab'; fab.textContent='Edit';
    fab.setAttribute('aria-label','Start guided edit');
    fab.style.display='none';
    fab.addEventListener('click',()=>this.startTour());
    document.body.appendChild(fab);
    this._fab=fab;
  }

  /* ─── Spotlight element ─── */
  _spot(el, pad=18){
    if(!el){ this._spotlight.classList.remove('sy-on'); return; }
    el.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>{
      const r=el.getBoundingClientRect();
      const s=this._spotlight;
      s.style.top=(r.top-pad)+'px';
      s.style.left=(r.left-pad)+'px';
      s.style.width=(r.width+pad*2)+'px';
      s.style.height=(r.height+pad*2)+'px';
      s.classList.add('sy-on');
    },320);
  }

  /* ─── Show card content ─── */
  _showCard(html){
    this._card.innerHTML=html;
    this._card.classList.add('sy-on');
    this._overlay.classList.add('sy-on');
  }

  /* ─── Progress pips ─── */
  _pips(current,total){
    return `<div class="sy-progress">`+
      Array.from({length:total},(_,i)=>
        `<div class="sy-pip ${i<current?'done':''}"></div>`
      ).join('')+`</div>`;
  }

  /* ─── Start tour ─── */
  startTour(){
    this._fab.style.display='none';
    this._nameEl = detectName();
    this._dateEl = detectDate();
    this._heroEl = detectHero();
    this._showStep1();
  }

  /* ─── STEP 1: Names ─── */
  _showStep1(){
    this.step=1;
    const el=this._nameEl;
    const current=(this.data.name)||(el?(el.textContent||'').trim():'');

    // Load saved font & size
    if(this.data.font) this._font=this.data.font;
    if(this.data.fontSize) this._fontSize=this.data.fontSize;

    const fontOpts=FONTS.map(f=>`<option value="${f.value}" ${f.value===this._font?'selected':''}>${f.label}</option>`).join('');
    const sizeVal=this._fontSize||(el?parseInt(getComputedStyle(el).fontSize):48);

    this._showCard(`
      ${this._pips(1,3)}
      <div class="sy-step-label">Step 1 of 3</div>
      <h3 class="sy-card-title">Your names</h3>
      <p class="sy-card-desc">Enter the couple's names exactly as you want them to appear.</p>
      <input class="sy-name-input" id="sy-name-inp" type="text" value="${current}" placeholder="e.g. Sofia & Marcus" autocomplete="off"/>
      <div class="sy-controls">
        <select class="sy-font-select" id="sy-font-sel">${fontOpts}</select>
        <div class="sy-size-wrap">
          <button class="sy-size-btn" id="sy-sz-down">−</button>
          <span class="sy-size-val" id="sy-sz-val">${sizeVal}</span>
          <button class="sy-size-btn" id="sy-sz-up">+</button>
          <button class="sy-size-btn" id="sy-sz-auto" title="Auto-fit" style="font-size:10px;font-weight:700">A</button>
        </div>
      </div>
      <div class="sy-btn-row">
        <button class="sy-btn" id="sy-skip1">Skip</button>
        <button class="sy-btn sy-btn-primary" id="sy-save1">Save & Next →</button>
      </div>
    `);

    this._spot(el, 24);
    this._bindStep1(el, sizeVal);
  }

  _bindStep1(el, initSize){
    const inp=document.getElementById('sy-name-inp');
    const fontSel=document.getElementById('sy-font-sel');
    const szDown=document.getElementById('sy-sz-down');
    const szUp=document.getElementById('sy-sz-up');
    const szAuto=document.getElementById('sy-sz-auto');
    const szVal=document.getElementById('sy-sz-val');
    let size=initSize;

    const applyName=()=>{
      if(!el) return;
      el.textContent=inp.value;
      el.style.fontFamily=this._font;
      if(this._fontSize) el.style.fontSize=this._fontSize+'px';
    };

    const applyFont=(f)=>{
      this._font=f;
      if(el){ el.style.fontFamily=f; }
    };

    const applySize=(s)=>{
      size=Math.max(12,Math.min(120,s));
      this._fontSize=size;
      szVal.textContent=size;
      if(el) el.style.fontSize=size+'px';
    };

    inp.addEventListener('input', applyName);
    fontSel.addEventListener('change',e=>{ applyFont(e.target.value); applyName(); });
    szDown.addEventListener('click',()=>applySize(size-2));
    szUp.addEventListener('click',()=>applySize(size+2));
    szAuto.addEventListener('click',()=>{
      this._fontSize=null;
      if(el){ el.style.fontSize=''; autoFitText(el); }
      szVal.textContent='A';
    });

    document.getElementById('sy-save1').addEventListener('click',()=>{
      this.data.name=inp.value.trim();
      this.data.font=this._font;
      this.data.fontSize=this._fontSize;
      if(el){
        el.textContent=this.data.name||el.textContent;
        el.style.fontFamily=this._font;
        if(this._fontSize) el.style.fontSize=this._fontSize+'px';
      }
      save(this.storeKey,this.data);
      this._showStep2();
    });
    document.getElementById('sy-skip1').addEventListener('click',()=>this._showStep2());
  }

  /* ─── STEP 2: Date ─── */
  _showStep2(){
    this.step=2;
    const el=this._dateEl;
    const current=(this.data.date)||(el?(el.textContent||'').trim():'');

    this._showCard(`
      ${this._pips(2,3)}
      <div class="sy-step-label">Step 2 of 3</div>
      <h3 class="sy-card-title">The date</h3>
      <p class="sy-card-desc">Update the wedding date and location exactly as it should appear.</p>
      <input class="sy-name-input" id="sy-date-inp" type="text" value="${current}" placeholder="e.g. October 18th, 2025 · San Pedro, Belize" autocomplete="off"/>
      <div class="sy-btn-row">
        <button class="sy-btn" id="sy-skip2">Skip</button>
        <button class="sy-btn sy-btn-primary" id="sy-save2">Save & Next →</button>
      </div>
    `);

    this._spot(el, 20);

    const inp=document.getElementById('sy-date-inp');
    if(el) inp.addEventListener('input',()=>{ el.textContent=inp.value; });

    document.getElementById('sy-save2').addEventListener('click',()=>{
      this.data.date=inp.value.trim();
      if(el && this.data.date) el.textContent=this.data.date;
      save(this.storeKey,this.data);
      this._showStep3();
    });
    document.getElementById('sy-skip2').addEventListener('click',()=>this._showStep3());
  }

  /* ─── STEP 3: Hero Photo ─── */
  _showStep3(){
    this.step=3;
    const el=this._heroEl;

    this._showCard(`
      ${this._pips(3,3)}
      <div class="sy-step-label">Step 3 of 3</div>
      <h3 class="sy-card-title">Your hero photo</h3>
      <p class="sy-card-desc">Tap the highlighted image to upload your main photo — the first thing guests see.</p>
      <div class="sy-btn-row">
        <button class="sy-btn" id="sy-skip3">Skip</button>
        <button class="sy-btn sy-btn-primary" id="sy-upload3">Upload Photo</button>
      </div>
      <p style="font-size:11px;color:rgba(240,232,216,.35);margin:12px 0 0;text-align:center">You can always tap Edit to change it later.</p>
    `);

    this._spot(el, 8);
    this._attachHeroZone(el);

    document.getElementById('sy-upload3').addEventListener('click',()=>this._triggerUpload(el));
    document.getElementById('sy-skip3').addEventListener('click',()=>this.endTour());
  }

  _attachHeroZone(img){
    if(!img) return;
    const parent=img.parentElement;
    if(!parent || parent.querySelector('.sy-hero-zone')) return;

    parent.style.position='relative';
    const zone=document.createElement('div');
    zone.className='sy-hero-zone active';
    zone.innerHTML=`
      <div class="sy-hero-pulse">📷</div>
      <div class="sy-hero-label">Tap to upload</div>
    `;
    zone.addEventListener('click',()=>this._triggerUpload(img));
    parent.appendChild(zone);
    this._heroZone=zone;
  }

  _triggerUpload(img){
    const input=document.createElement('input');
    input.type='file'; input.accept='image/jpeg,image/png,image/webp';
    input.addEventListener('change',e=>{
      const file=e.target.files[0]; if(!file) return;
      const reader=new FileReader();
      reader.onload=ev=>{
        if(img) img.src=ev.target.result;
        this.data.hero=ev.target.result;
        save(this.storeKey,this.data);
        if(this._heroZone) this._heroZone.classList.remove('active');
        setTimeout(()=>this.endTour(), 600);
      };
      reader.readAsDataURL(file);
    });
    input.click();
  }

  /* ─── End tour ─── */
  endTour(){
    this.step=0;
    this._overlay.classList.remove('sy-on');
    this._spotlight.classList.remove('sy-on');
    this._card.classList.remove('sy-on');
    if(this._heroZone) this._heroZone.classList.remove('active');
    save(this.storeKey+'_seen', true);
    this._fab.style.display='flex';
  }

  /* ─── Apply saved data on load ─── */
  _applyData(){
    const d=this.data;
    if(!d) return;

    // Name
    if(d.name||d.font||d.fontSize){
      const el=detectName();
      if(el){
        if(d.name) el.textContent=d.name;
        if(d.font) el.style.fontFamily=d.font;
        if(d.fontSize) el.style.fontSize=d.fontSize+'px';
      }
    }
    // Date
    if(d.date){
      const el=detectDate();
      if(el) el.textContent=d.date;
    }
    // Hero
    if(d.hero){
      const el=detectHero();
      if(el) el.src=d.hero;
    }
  }
}

/* ─── Public API ──────────────────────────────────────── */
global.SaidYes = {
  init: function(cfg){
    document.addEventListener('DOMContentLoaded',function(){
      const setup=new SaidYesSetup(cfg||{});
      setup.init();
      global._SaidYes=setup;
    });
    // If DOM already ready
    if(document.readyState!=='loading'){
      const setup=new SaidYesSetup(cfg||{});
      setup.init();
      global._SaidYes=setup;
    }
  }
};

})(window);
