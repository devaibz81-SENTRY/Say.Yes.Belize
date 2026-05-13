/**
 * said-yes-setup.js v2 — Said Yes Belize
 * Guided 3-step tour: Names+Font+Size → Date → Hero Photo
 * Locked by default. Only tour unlocks editing.
 * Usage: SaidYes.init({ slug:'analog', accent:'#bc4637', dark:true })
 */
(function(global){'use strict';

const FONTS=[
  {label:'Script',  value:"'Bridal Routine',cursive"},
  {label:'Serif',   value:"'Cormorant Garamond',serif"},
  {label:'Modern',  value:"'Plus Jakarta Sans',sans-serif"}
];

function $(s,c){return(c||document).querySelector(s)}
function store(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

function detectName(){
  return ['h1','h2','[class*="headline-xl"],[class*="gold-foil"]'].reduce((f,s)=>{
    if(f)return f;
    return Array.from(document.querySelectorAll(s)).find(el=>{
      const t=(el.textContent||'').trim();
      return t.length>2&&t.length<80&&!el.closest('button,a,nav');
    });
  },null);
}
function detectDate(){
  return Array.from(document.querySelectorAll('p,span,h3,h4,time')).find(el=>{
    const t=(el.textContent||'').trim();
    return /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{4})\b/i.test(t)&&t.length<140&&!el.closest('button,a,nav,script');
  });
}
function detectHero(){
  return Array.from(document.querySelectorAll('img')).find(img=>{
    const cl=img.className||'';
    return /w-full|h-full|h-screen|object-cover|inset-0/.test(cl)||img.getAttribute('data-alt');
  })||Array.from(document.querySelectorAll('img')).find(img=>img.getBoundingClientRect().width>300);
}

function autoFit(el){
  if(!el)return;
  const p=el.parentElement;if(!p)return;
  el.style.fontSize='';el.style.whiteSpace='nowrap';
  const maxW=p.offsetWidth||window.innerWidth;
  let s=parseInt(getComputedStyle(el).fontSize)||48;
  while(el.scrollWidth>maxW&&s>14){s--;el.style.fontSize=s+'px';}
  el.style.whiteSpace='';
}

/* ── Countdown timer ── */
function parseWeddingDate(str){
  if(!str)return null;
  // Try direct parse first
  let d=new Date(str);
  if(!isNaN(d))return d;
  // Try "October 18th, 2025" style
  const clean=str.replace(/(\d+)(st|nd|rd|th)/,'$1').replace(/·|•|@/,',');
  d=new Date(clean);
  return isNaN(d)?null:d;
}

function injectCountdown(dateStr, accent){
  const target=detectDate();
  if(!target||document.getElementById('sy-countdown'))return;
  const weddingDate=parseWeddingDate(dateStr);
  if(!weddingDate)return;

  const wrap=document.createElement('div');
  wrap.id='sy-countdown';
  wrap.style.cssText=`
    display:flex;gap:12px;align-items:center;margin:14px 0 0;
    font-family:'Plus Jakarta Sans',sans-serif;
  `;
  wrap.innerHTML=['days','hrs','min','sec'].map(u=>`
    <div style="text-align:center;min-width:44px">
      <div id="sy-cd-${u}" style="font-size:28px;font-weight:700;line-height:1;color:${accent};font-family:'Cormorant Garamond',serif">--</div>
      <div style="font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;opacity:.5;margin-top:3px">${u}</div>
    </div>
    ${u!=='sec'?`<div style="font-size:18px;color:${accent};opacity:.3;margin-bottom:8px">·</div>`:''}
  `).join('');

  target.insertAdjacentElement('afterend',wrap);

  function tick(){
    const now=new Date();
    const diff=weddingDate-now;
    if(diff<=0){wrap.innerHTML=`<span style="color:${accent};font-size:14px;letter-spacing:.1em">🎉 Today!</span>`;return;}
    const d=Math.floor(diff/864e5);
    const h=Math.floor((diff%864e5)/36e5);
    const m=Math.floor((diff%36e5)/6e4);
    const s=Math.floor((diff%6e4)/1e3);
    ['days','hrs','min','sec'].forEach((u,i)=>{
      const el=document.getElementById('sy-cd-'+u);
      if(el)el.textContent=String([d,h,m,s][i]).padStart(2,'0');
    });
  }
  tick();
  setInterval(tick,1000);
}

/* ── Styles ── */
function injectStyles(accent){
  if($('#sy-styles'))return;
  const s=document.createElement('style');
  s.id='sy-styles';
  s.textContent=`
    #sy-overlay{
      position:fixed;inset:0;z-index:9000;
      background:rgba(0,0,0,0);pointer-events:none;
      transition:background .3s ease;
    }
    #sy-overlay.sy-on{background:rgba(0,0,0,.22);pointer-events:auto;}

    /* Element glow highlight — no bounding box */
    .sy-focus{
      outline:2px solid ${accent} !important;
      outline-offset:6px;
      box-shadow:0 0 0 8px ${accent}22,0 0 28px ${accent}33 !important;
      border-radius:6px;
      position:relative;z-index:9500;
      transition:outline .3s,box-shadow .3s;
    }

    #sy-card{
      position:fixed;bottom:24px;right:20px;
      width:min(360px,calc(100vw - 24px));
      background:rgba(12,10,8,.72);
      border:1px solid rgba(255,255,255,.12);
      border-radius:18px;padding:22px;
      z-index:9100;
      opacity:0;transform:translateY(14px) scale(.98);
      pointer-events:none;
      transition:opacity .28s ease,transform .28s cubic-bezier(.22,1,.36,1);
      backdrop-filter:blur(32px) saturate(160%);
      -webkit-backdrop-filter:blur(32px) saturate(160%);
      box-shadow:0 24px 64px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.08);
      font-family:'Plus Jakarta Sans',sans-serif;color:#f0e8d8;
    }
    #sy-card.sy-on{opacity:1;transform:none;pointer-events:auto;}
    .sy-step-lbl{font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:${accent};margin:0 0 8px;}
    .sy-title{font-size:19px;font-weight:600;margin:0 0 5px;color:#fff;line-height:1.2;}
    .sy-desc{font-size:12px;line-height:1.55;color:rgba(240,232,216,.58);margin:0 0 14px;}
    .sy-pips{display:flex;gap:4px;margin-bottom:16px;}
    .sy-pip{height:2px;border-radius:2px;background:rgba(255,255,255,.12);flex:1;transition:background .3s;}
    .sy-pip.on{background:${accent};}
    .sy-inp{
      width:100%;background:rgba(255,255,255,.07);
      border:1px solid ${accent}55;border-radius:8px;
      padding:9px 12px;color:#fff;font-size:15px;
      font-family:inherit;outline:none;margin-bottom:10px;
      transition:border-color .2s;box-sizing:border-box;
    }
    .sy-inp:focus{border-color:${accent};}
    .sy-ctrls{display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;}
    .sy-fsel{
      flex:1;min-width:110px;background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.14);border-radius:8px;
      color:#f0e8d8;font-size:11px;padding:6px 9px;outline:none;cursor:pointer;
    }
    .sy-szwrap{display:flex;align-items:center;gap:3px;}
    .sy-szbtn{
      width:26px;height:26px;border-radius:50%;
      background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);
      color:#f0e8d8;font-size:13px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;transition:background .2s;
      font-family:inherit;
    }
    .sy-szbtn:hover{background:rgba(255,255,255,.15);}
    .sy-szval{font-size:11px;color:rgba(240,232,216,.45);min-width:26px;text-align:center;}
    .sy-btns{display:flex;gap:8px;}
    .sy-btn{
      flex:1;min-height:40px;border-radius:999px;
      font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
      cursor:pointer;border:1px solid rgba(255,255,255,.14);
      background:rgba(255,255,255,.07);color:rgba(240,232,216,.7);
      transition:background .2s;font-family:inherit;
    }
    .sy-btn:hover{background:rgba(255,255,255,.14);}
    .sy-btnp{background:${accent}!important;border-color:${accent}!important;color:#1a1410!important;font-weight:800!important;}
    .sy-btnp:hover{filter:brightness(1.1);}
    .sy-hero-zone{
      position:absolute;inset:0;z-index:10;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:rgba(0,0,0,.35);cursor:pointer;
      opacity:0;transition:opacity .3s;pointer-events:none;
    }
    .sy-hero-zone.on{opacity:1;pointer-events:auto;}
    .sy-pulse{
      width:60px;height:60px;border-radius:50%;
      border:2px solid ${accent};
      display:flex;align-items:center;justify-content:center;
      font-size:24px;margin-bottom:10px;
      animation:syP 1.8s ease-in-out infinite;
    }
    @keyframes syP{0%,100%{box-shadow:0 0 0 0 ${accent}66}50%{box-shadow:0 0 0 12px ${accent}00}}
    .sy-hlbl{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;
      letter-spacing:.1em;text-transform:uppercase;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.5);}
    #sy-fab{
      position:fixed;bottom:22px;right:20px;z-index:8500;
      min-width:64px;height:38px;border-radius:999px;padding:0 14px;
      background:${accent};border:none;
      color:#1a1410;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;
      cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;
      box-shadow:0 6px 24px rgba(0,0,0,.26);
      transition:transform .2s,filter .2s;display:none;
    }
    #sy-fab:hover{transform:scale(1.06);filter:brightness(1.1);}
    @media(max-width:480px){
      #sy-card{bottom:0;right:0;width:100%;border-radius:18px 18px 0 0;padding:18px 16px 28px;}
    }
  `;
  document.head.appendChild(s);
}

/* ── Main class ── */
class SaidYesSetup{
  constructor(cfg){
    this.slug=cfg.slug||'template';
    this.accent=cfg.accent||'#b88e44';
    this.dark=cfg.dark||false;
    this.key='sy_'+this.slug;
    this.step=0;
    this.data=store(this.key)||{};
    this._seen=store(this.key+'_seen');
    this._font=this.data.font||FONTS[0].value;
    this._fontSize=this.data.fontSize||null;
  }

  init(){
    injectStyles(this.accent);
    this._buildUI();
    this._applyData();
    this._fab.style.display='flex';
    if(!this._seen) setTimeout(()=>this.start(),900);
  }

  _buildUI(){
    const ov=document.createElement('div');ov.id='sy-overlay';document.body.appendChild(ov);this._ov=ov;
    const card=document.createElement('div');card.id='sy-card';document.body.appendChild(card);this._card=card;
    const fab=document.createElement('button');fab.id='sy-fab';fab.textContent='Edit';
    fab.addEventListener('click',()=>this.start());
    document.body.appendChild(fab);this._fab=fab;
  }

  _focus(el){
    document.querySelectorAll('.sy-focus').forEach(e=>e.classList.remove('sy-focus'));
    if(!el)return;
    el.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>el.classList.add('sy-focus'),350);
  }

  _blur(){document.querySelectorAll('.sy-focus').forEach(e=>e.classList.remove('sy-focus'));}

  _pips(cur,tot){
    return `<div class="sy-pips">${Array.from({length:tot},(_,i)=>`<div class="sy-pip ${i<cur?'on':''}"></div>`).join('')}</div>`;
  }

  _show(html){
    this._card.innerHTML=html;
    this._card.classList.add('sy-on');
    this._ov.classList.add('sy-on');
  }

  start(){
    this._fab.style.display='none';
    this._step1();
  }

  /* Step 1 — Names */
  _step1(){
    this.step=1;
    const el=detectName();
    const cur=this.data.name||(el?(el.textContent||'').trim():'');
    const sz=this._fontSize||(el?parseInt(getComputedStyle(el).fontSize):48)||48;
    const fopts=FONTS.map(f=>`<option value="${f.value}" ${f.value===this._font?'selected':''}>${f.label}</option>`).join('');
    this._show(`
      ${this._pips(1,3)}
      <div class="sy-step-lbl">Step 1 of 3</div>
      <h3 class="sy-title">Your names</h3>
      <p class="sy-desc">Enter the couple's names as they should appear on the site.</p>
      <input class="sy-inp" id="sy-ni" type="text" value="${cur.replace(/"/g,'&quot;')}" placeholder="Sofia & Marcus" autocomplete="off"/>
      <div class="sy-ctrls">
        <select class="sy-fsel" id="sy-fs">${fopts}</select>
        <div class="sy-szwrap">
          <button class="sy-szbtn" id="sy-sd">−</button>
          <span class="sy-szval" id="sy-sv">${sz}</span>
          <button class="sy-szbtn" id="sy-su">+</button>
          <button class="sy-szbtn" id="sy-sa" title="Auto-fit" style="font-size:9px;font-weight:800">A</button>
        </div>
      </div>
      <div class="sy-btns">
        <button class="sy-btn" id="sy-sk1">Skip</button>
        <button class="sy-btn sy-btnp" id="sy-sv1">Save & Next →</button>
      </div>
    `);
    this._focus(el);
    let size=sz;
    const ni=$('#sy-ni'),fs=$('#sy-fs'),sd=$('#sy-sd'),su=$('#sy-su'),sa=$('#sy-sa'),sv=$('#sy-sv');
    const applyN=()=>{if(el){el.textContent=ni.value;el.style.fontFamily=this._font;if(this._fontSize)el.style.fontSize=this._fontSize+'px';}};
    const applyS=s=>{size=Math.max(12,Math.min(120,s));this._fontSize=size;sv.textContent=size;if(el)el.style.fontSize=size+'px';};
    ni.addEventListener('input',applyN);
    fs.addEventListener('change',e=>{this._font=e.target.value;applyN();});
    sd.addEventListener('click',()=>applyS(size-2));
    su.addEventListener('click',()=>applyS(size+2));
    sa.addEventListener('click',()=>{this._fontSize=null;if(el){el.style.fontSize='';autoFit(el);}sv.textContent='A';});
    $('#sy-sv1').addEventListener('click',()=>{
      this.data.name=ni.value.trim();this.data.font=this._font;this.data.fontSize=this._fontSize;
      if(el){el.textContent=this.data.name||el.textContent;el.style.fontFamily=this._font;if(this._fontSize)el.style.fontSize=this._fontSize+'px';}
      save(this.key,this.data);this._step2();
    });
    $('#sy-sk1').addEventListener('click',()=>this._step2());
  }

  /* Step 2 — Date */
  _step2(){
    this.step=2;
    const el=detectDate();
    const cur=this.data.date||(el?(el.textContent||'').trim():'');
    this._show(`
      ${this._pips(2,3)}
      <div class="sy-step-lbl">Step 2 of 3</div>
      <h3 class="sy-title">The wedding date</h3>
      <p class="sy-desc">Set the date and location. A live countdown will appear on the page.</p>
      <input class="sy-inp" id="sy-di" type="text" value="${cur.replace(/"/g,'&quot;')}" placeholder="October 18, 2025 · San Pedro, Belize" autocomplete="off"/>
      <div class="sy-btns">
        <button class="sy-btn" id="sy-sk2">Skip</button>
        <button class="sy-btn sy-btnp" id="sy-sv2">Save & Next →</button>
      </div>
    `);
    this._focus(el);
    const di=$('#sy-di');
    if(el) di.addEventListener('input',()=>{el.textContent=di.value;});
    $('#sy-sv2').addEventListener('click',()=>{
      this.data.date=di.value.trim();
      if(el&&this.data.date)el.textContent=this.data.date;
      save(this.key,this.data);
      injectCountdown(this.data.date,this.accent);
      this._step3();
    });
    $('#sy-sk2').addEventListener('click',()=>this._step3());
  }

  /* Step 3 — Hero Photo */
  _step3(){
    this.step=3;
    const el=detectHero();
    this._show(`
      ${this._pips(3,3)}
      <div class="sy-step-lbl">Step 3 of 3</div>
      <h3 class="sy-title">Your hero photo</h3>
      <p class="sy-desc">Upload the main photo — first thing guests see. Tap the glowing area or the button below.</p>
      <div class="sy-btns">
        <button class="sy-btn" id="sy-sk3">Skip</button>
        <button class="sy-btn sy-btnp" id="sy-up3">Upload Photo 📷</button>
      </div>
    `);
    this._focus(el);
    this._attachZone(el);
    $('#sy-up3').addEventListener('click',()=>this._upload(el));
    $('#sy-sk3').addEventListener('click',()=>this.end());
  }

  _attachZone(img){
    if(!img)return;
    const p=img.parentElement;
    if(!p||p.querySelector('.sy-hero-zone'))return;
    p.style.position='relative';
    const z=document.createElement('div');
    z.className='sy-hero-zone on';
    z.innerHTML=`<div class="sy-pulse">📷</div><div class="sy-hlbl">Tap to upload</div>`;
    z.addEventListener('click',()=>this._upload(img));
    p.appendChild(z);this._zone=z;
  }

  _upload(img){
    const input=document.createElement('input');
    input.type='file';input.accept='image/jpeg,image/png,image/webp';
    input.addEventListener('change',e=>{
      const file=e.target.files[0];if(!file)return;
      const r=new FileReader();
      r.onload=ev=>{
        if(img)img.src=ev.target.result;
        this.data.hero=ev.target.result;
        save(this.key,this.data);
        if(this._zone)this._zone.classList.remove('on');
        setTimeout(()=>this.end(),600);
      };
      r.readAsDataURL(file);
    });
    input.click();
  }

  end(){
    this.step=0;
    this._blur();
    this._ov.classList.remove('sy-on');
    this._card.classList.remove('sy-on');
    if(this._zone)this._zone.classList.remove('on');
    save(this.key+'_seen',true);
    this._fab.style.display='flex';
  }

  _applyData(){
    const d=this.data;
    if(d.name||d.font||d.fontSize){
      const el=detectName();
      if(el){
        if(d.name)el.textContent=d.name;
        if(d.font)el.style.fontFamily=d.font;
        if(d.fontSize)el.style.fontSize=d.fontSize+'px';
      }
    }
    if(d.date){const el=detectDate();if(el)el.textContent=d.date;}
    if(d.hero){const el=detectHero();if(el)el.src=d.hero;}
    // Inject countdown if date saved
    if(d.date) setTimeout(()=>injectCountdown(d.date,this.accent),500);
  }
}

global.SaidYes={
  init:function(cfg){
    const run=()=>{const s=new SaidYesSetup(cfg||{});s.init();global._SaidYes=s;};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);
    else run();
  }
};
})(window);
