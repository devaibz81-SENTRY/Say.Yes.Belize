/**
 * Said Yes Belize — Ambient Music Player Widget
 * Drop this script tag into any template page to get a floating music button.
 *
 * Usage:  <script src="../music-player.js"></script>
 *         or inline at the bottom of any template's <body>
 *
 * No dependencies. Pure vanilla JS + CSS injected at runtime.
 * Uses Web Audio API to generate ambient tones (no external audio required).
 */
(function(){
  if(document.getElementById('vows-music-player')) return; // prevent double-init

  /* ─── Inject Styles ─── */
  const style=document.createElement('style');
  style.textContent=`
    #vows-music-player{
      position:fixed;bottom:5.5rem;right:1.5rem;z-index:8000;
      display:flex;flex-direction:column;align-items:center;gap:.5rem;
    }
    #vmp-btn{
      width:48px;height:48px;border-radius:50%;border:none;cursor:pointer;
      background:rgba(255,255,255,.12);backdrop-filter:blur(16px);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 20px rgba(0,0,0,.25),0 0 0 1px rgba(255,255,255,.15);
      transition:transform .3s cubic-bezier(.34,1.56,.64,1),background .3s,box-shadow .3s;
      font-size:1.2rem;
    }
    #vmp-btn:hover{transform:scale(1.12);background:rgba(255,255,255,.2);box-shadow:0 6px 28px rgba(0,0,0,.3)}
    #vmp-btn.playing{animation:vmpPulse 2.5s ease-in-out infinite;background:rgba(212,175,55,.25)}
    @keyframes vmpPulse{0%,100%{box-shadow:0 4px 20px rgba(0,0,0,.25),0 0 0 1px rgba(212,175,55,.3)}50%{box-shadow:0 4px 20px rgba(0,0,0,.25),0 0 0 8px rgba(212,175,55,.0)}}
    #vmp-label{
      font-family:'Space Grotesk','Be Vietnam Pro',sans-serif;
      font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;
      color:rgba(255,255,255,.5);white-space:nowrap;
      transition:opacity .3s;pointer-events:none;
    }
    #vmp-vol-wrap{
      display:none;background:rgba(20,20,20,.8);backdrop-filter:blur(12px);
      border-radius:2rem;padding:.75rem .5rem;box-shadow:0 4px 20px rgba(0,0,0,.3);
      align-items:center;flex-direction:column;gap:.4rem;
    }
    #vmp-vol-wrap.open{display:flex}
    #vmp-vol{
      writing-mode:vertical-lr;direction:rtl;
      -webkit-appearance:slider-vertical;appearance:slider-vertical;
      width:6px;height:80px;background:rgba(255,255,255,.15);
      border-radius:3px;cursor:pointer;outline:none;border:none;
    }
    #vmp-vol::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#d4af37;cursor:pointer;}
  `;
  document.head.appendChild(style);

  /* ─── DOM ─── */
  const wrap=document.createElement('div');wrap.id='vows-music-player';
  wrap.innerHTML=`
    <div id="vmp-vol-wrap">
      <input type="range" id="vmp-vol" min="0" max="100" value="35" step="1"/>
      <span style="font-size:.6rem;color:rgba(255,255,255,.4);letter-spacing:.1em">VOL</span>
    </div>
    <button id="vmp-btn" title="Toggle ambient music" aria-label="Toggle ambient music">🎵</button>
    <span id="vmp-label">Ambient</span>
  `;
  document.body.appendChild(wrap);

  /* ─── Web Audio Ambient Engine ─── */
  let ctx=null,masterGain=null,nodes=[],playing=false;

  /**
   * Builds a layered ambient soundscape:
   * - Low drone (60 Hz)
   * - Warm pad (A2 + octave)
   * - Subtle high shimmer (filtered noise)
   * - Slow LFO tremolo
   */
  function buildAmbient(){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    masterGain=ctx.createGain();
    masterGain.gain.value=0;
    masterGain.connect(ctx.destination);

    // Helper: oscillator layer
    function osc(freq,type,gainVal,detune=0){
      const o=ctx.createOscillator();
      const g=ctx.createGain();
      o.type=type;o.frequency.value=freq;o.detune.value=detune;
      g.gain.value=gainVal;
      o.connect(g);g.connect(masterGain);
      o.start();nodes.push(o,g);
      return{osc:o,gain:g};
    }

    // Warm drone
    osc(55,'sine',0.35);
    osc(55,'sine',0.12,3);       // slight detune for warmth
    osc(110,'sine',0.18);        // octave
    osc(220,'sine',0.08);        // two octaves

    // Pad chord (A minor feel — A C E)
    osc(220,'sine',0.14);        // A3
    osc(261.63,'sine',0.1);      // C4
    osc(329.63,'sine',0.08);     // E4

    // Subtle noise shimmer
    const bufLen=ctx.sampleRate*2;
    const buf=ctx.createBuffer(1,bufLen,ctx.sampleRate);
    const data=buf.getChannelData(0);
    for(let i=0;i<bufLen;i++) data[i]=(Math.random()*2-1)*0.004;
    const noise=ctx.createBufferSource();
    noise.buffer=buf;noise.loop=true;
    const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=4000;
    const ngain=ctx.createGain();ngain.gain.value=0.3;
    noise.connect(hp);hp.connect(ngain);ngain.connect(masterGain);
    noise.start();nodes.push(noise,hp,ngain);

    // Tremolo LFO
    const lfo=ctx.createOscillator();
    const lfoGain=ctx.createGain();
    lfo.type='sine';lfo.frequency.value=0.18;
    lfoGain.gain.value=0.04;
    lfo.connect(lfoGain);lfoGain.connect(masterGain.gain);
    lfo.start();nodes.push(lfo,lfoGain);
  }

  function fadeIn(){
    if(!ctx) buildAmbient();
    if(ctx.state==='suspended') ctx.resume();
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(getVolLevel(),ctx.currentTime+2.5);
  }
  function fadeOut(){
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0,ctx.currentTime+2);
  }
  function getVolLevel(){
    return(parseInt(document.getElementById('vmp-vol').value)/100)*0.8;
  }

  /* ─── Controls ─── */
  const btn=document.getElementById('vmp-btn');
  const volSlider=document.getElementById('vmp-vol');
  const volWrap=document.getElementById('vmp-vol-wrap');

  btn.addEventListener('click',()=>{
    playing=!playing;
    if(playing){fadeIn();btn.textContent='⏸';btn.classList.add('playing');}
    else{fadeOut();btn.textContent='🎵';btn.classList.remove('playing');}
  });

  // Long-press or right-click to show vol
  let pressTimer;
  btn.addEventListener('mousedown',()=>{pressTimer=setTimeout(()=>volWrap.classList.toggle('open'),600);});
  btn.addEventListener('mouseup',()=>clearTimeout(pressTimer));
  btn.addEventListener('contextmenu',e=>{e.preventDefault();volWrap.classList.toggle('open');});
  document.addEventListener('click',e=>{if(!wrap.contains(e.target))volWrap.classList.remove('open');});

  volSlider.addEventListener('input',()=>{
    if(playing&&masterGain){
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(getVolLevel(),ctx.currentTime+0.1);
    }
  });

  // Auto-resume on user interaction (browser policy)
  document.addEventListener('click',()=>{if(ctx&&ctx.state==='suspended'&&playing)ctx.resume();},{once:false});
})();
