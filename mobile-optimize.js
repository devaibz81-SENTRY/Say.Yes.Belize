(function () {
  'use strict';

  var STYLES = [
    /* Safe areas for notched phones */
    'nav.fixed.bottom-0,header.fixed.bottom-0,[class*="bottom-"]nav.fixed{padding-bottom:max(8px,env(safe-area-inset-bottom,0px))!important}',
    'nav.fixed.bottom-0 a,nav.fixed.bottom-0 button{min-height:44px;min-width:44px;display:flex;align-items:center;justify-content:center}',
    /* Touch target sizing */
    'button,a.button,.btn,[class*="btn"],[role="button"]{min-height:44px}',
    'a{min-height:44px;display:inline-flex;align-items:center}',
    'nav a,nav button{padding:8px}',
    /* iOS input zoom prevention */
    'input,textarea,select{font-size:16px!important}',
    '@supports(-webkit-touch-callout:none){input,textarea,select{font-size:16px!important}}',
    /* Smooth momentum scroll */
    'html{-webkit-overflow-scrolling:touch;scroll-behavior:smooth}',
    /* Tap highlight cleanup */
    '*{-webkit-tap-highlight-color:transparent}',
    /* Overscroll containment for modals */
    '.modal-open,.lightbox-open{overscroll-behavior:contain;overflow:hidden}',
    /* Respect reduced motion */
    '@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}',
    /* Better mobile typography */
    'body{text-rendering:optimizeSpeed;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}',
    /* Form elements - prevent mobile zoom and ensure touchable */
    'select,input[type="text"],input[type="email"],input[type="tel"],input[type="date"],input[type="time"],textarea{font-size:16px!important;border-radius:8px;padding:12px 14px}',
    /* Bottom sheet style navs */
    'nav.fixed.bottom-0{border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 -4px 30px rgba(0,0,0,.08)}',
    /* Countdown mobile optimization */
    '.vows-countdown .vows-cd-num{font-size:clamp(1.5rem,6vw,2.5rem)}',
    '.vows-countdown .vows-cd-digits{font-size:clamp(1.8rem,7vw,3rem)}',
    '.vows-picker-row{flex-direction:column;gap:8px}',
    '.vows-picker-input{padding:12px 14px;font-size:16px;min-height:48px}',
    /* Photo zone mobile */
    '.photo-zone{min-height:140px}',
    '.photo-zone-placeholder{min-height:140px;padding:20px 16px}',
    /* Scrollbar hide for galleries (keep functionality) */
    '.story-photo-scroll,.gallery-photo-grid{-ms-overflow-style:none;scrollbar-width:none}',
    '.story-photo-scroll::-webkit-scrollbar,.gallery-photo-grid::-webkit-scrollbar{display:none}',
    /* Image optimization prevent layout shift */
    'img{max-width:100%;height:auto}',
    'img[loading="lazy"]{background:rgba(128,128,128,.05)}',
    /* Global Mobile Layout Fixes */
    '@media(max-width:850px){',
    '  .hero-grid{grid-template-columns:1fr!important;gap:20px!important}',
    '  .hero-sidebar,.summary{width:100%!important;position:static!important;grid-template-columns:1fr!important}',
    '  .filters{flex-direction:column!important;align-items:flex-start!important;gap:15px!important}',
    '  .filter-group{width:100%}',
    '  .search-wrap{width:100%!important;max-width:none!important}',
    '  .catalog{grid-template-columns:1fr!important}',
    '  body,html{overflow-x:hidden!important;position:relative}',
    '  h1{font-size:clamp(3.5rem,15vw,6rem)!important;line-height:.9!important}',
    '  .template-card{min-height:auto!important;grid-template-rows:240px 1fr!important}',
    '  .thumb{min-height:240px!important}',
    '  #vows-font-toggle{right:16px!important;bottom:16px!important}',
    '}'
  ].join('\n');

  function injectStyles() {
    if (document.getElementById('vows-mobile-styles')) return;
    var style = document.createElement('style');
    style.id = 'vows-mobile-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function iOSZoomFix() {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
      document.head.appendChild(meta);
    } else if (meta.content.indexOf('maximum-scale') === -1) {
      meta.content = meta.content + ', maximum-scale=1';
    }
  }

  function touchFeedback() {
    document.addEventListener('touchstart', function () {}, { passive: true });
    document.addEventListener('pointerdown', function (e) {
      var target = e.target.closest('button,a,.btn,[class*="btn"],[role="button"],nav a');
      if (target) {
        target.style.transition = 'transform .12s ease';
        target.style.transform = 'scale(.97)';
        clearTimeout(target._vowsScaleTimer);
        target._vowsScaleTimer = setTimeout(function () {
          target.style.transform = '';
        }, 150);
      }
    }, { passive: true });
  }

  function init() {
    iOSZoomFix();
    injectStyles();
    touchFeedback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
