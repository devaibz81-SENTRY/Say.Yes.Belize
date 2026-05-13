(function () {
  'use strict';

  var STORAGE_KEY = 'vows_wedding_countdown';

  var BASE_STYLES = [
    '.vows-countdown{display:inline-block;cursor:pointer;position:relative;text-align:center}',
    '.vows-countdown-inner{display:flex;flex-direction:column;align-items:center;gap:12px}',
    '.vows-cd-display{display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap;transition:opacity .2s}',
    '.vows-countdown:hover .vows-cd-display{opacity:.85}',
    '.vows-cd-digits{font-size:2.5rem;font-weight:700;letter-spacing:.08em;font-family:Georgia,"Times New Roman",serif;width:100%}',
    '.vows-cd-hint{font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.5;width:100%;margin-top:2px}',
    '.vows-cd-block{display:inline-flex;flex-direction:column;align-items:center;min-width:48px}',
    '.vows-cd-num{font-size:2rem;font-weight:700;line-height:1;letter-spacing:.04em;font-family:Georgia,"Times New Roman",serif}',
    '.vows-cd-label{font-size:9px;letter-spacing:.18em;text-transform:uppercase;opacity:.55;margin-top:2px}',
    '.vows-cd-sep{font-size:1.6rem;font-weight:300;opacity:.3;margin:0 2px;padding-top:4px}',
    '.vows-cd-celebrate{font-size:1.2rem;font-style:italic;letter-spacing:.06em}',
    '.vows-cd-picker{display:none;width:100%;animation:vows-picker-in .25s ease}',
    '@keyframes vows-picker-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}',
    '.vows-picker-wrap{padding:16px;border-radius:12px;background:inherit;border:1px solid;backdrop-filter:blur(12px)}',
    '.vows-picker-row{display:flex;gap:12px;margin-bottom:12px}',
    '.vows-picker-field{flex:1;display:flex;flex-direction:column;gap:4px}',
    '.vows-picker-field-label{font-size:10px;letter-spacing:.14em;text-transform:uppercase;opacity:.6}',
    '.vows-picker-input{padding:8px 10px;border-radius:6px;border:1px solid;font-family:inherit;font-size:14px;background:transparent;color:inherit;outline:none;transition:border-color .2s}',
    '.vows-picker-input:focus{border-color:currentColor;opacity:.8}',
    '.vows-picker-actions{display:flex;gap:8px;justify-content:flex-end}',
    '.vows-picker-btn{padding:6px 16px;border-radius:6px;border:1px solid;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s;background:transparent;color:inherit;opacity:.7}',
    '.vows-picker-btn:hover{opacity:1}',
    '.vows-picker-save{font-weight:600;opacity:1}'
  ].join('\n');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function getStored() {
    try {
      var d = localStorage.getItem(STORAGE_KEY);
      return d ? JSON.parse(d) : null;
    } catch (e) { return null; }
  }

  function storeDate(val) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: val, updated: new Date().toISOString() }));
  }

  function createCountdownHTML(data) {
    var wrap = document.createElement('div');
    wrap.className = 'vows-countdown-inner';

    var display = document.createElement('div');
    display.className = 'vows-cd-display';
    wrap.appendChild(display);

    var picker = document.createElement('div');
    picker.className = 'vows-cd-picker';
    picker.style.display = 'none';
    wrap.appendChild(picker);

    wrap.cdDisplay = display;
    wrap.cdPicker = picker;
    return wrap;
  }

  function renderPlaceholder(display) {
    display.innerHTML =
      '<span class="vows-cd-digits">00:00:00</span>' +
      '<span class="vows-cd-hint">Click to set date</span>';
  }

  function startTimer(display, target) {
    if (display._vowsTimer) clearTimeout(display._vowsTimer);

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        display.innerHTML = '<span class="vows-cd-celebrate">♡ Today is the day!</span>';
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);

      var parts = [];
      if (d > 0) parts.push('<span class="vows-cd-block"><span class="vows-cd-num">' + d + '</span><span class="vows-cd-label">' + (d === 1 ? 'Day' : 'Days') + '</span></span>');
      parts.push('<span class="vows-cd-block"><span class="vows-cd-num">' + pad(h) + '</span><span class="vows-cd-label">Hrs</span></span>');
      parts.push('<span class="vows-cd-sep">:</span>');
      parts.push('<span class="vows-cd-block"><span class="vows-cd-num">' + pad(m) + '</span><span class="vows-cd-label">Min</span></span>');
      parts.push('<span class="vows-cd-sep">:</span>');
      parts.push('<span class="vows-cd-block"><span class="vows-cd-num">' + pad(s) + '</span><span class="vows-cd-label">Sec</span></span>');

      display.innerHTML = parts.join('');
      display._vowsTimer = setTimeout(tick, 1000);
    }
    tick();
  }

  function buildPicker(pickerEl, currentVal, onSave) {
    var now = new Date();
    var defaultDate = currentVal ? currentVal.split('T')[0] : now.toISOString().split('T')[0];
    var defaultTime = currentVal ? currentVal.split('T')[1].slice(0, 5) : '16:00';

    pickerEl.innerHTML =
      '<div class="vows-picker-wrap">' +
        '<div class="vows-picker-row">' +
          '<div class="vows-picker-field">' +
            '<label class="vows-picker-field-label">Date</label>' +
            '<input type="date" class="vows-picker-input vows-picker-date" value="' + defaultDate + '" />' +
          '</div>' +
          '<div class="vows-picker-field">' +
            '<label class="vows-picker-field-label">Time</label>' +
            '<input type="time" class="vows-picker-input vows-picker-time" value="' + defaultTime + '" />' +
          '</div>' +
        '</div>' +
        '<div class="vows-picker-actions">' +
          '<button class="vows-picker-btn vows-picker-cancel">Cancel</button>' +
          '<button class="vows-picker-btn vows-picker-save">Set Date</button>' +
        '</div>' +
      '</div>';

    var saveBtn = pickerEl.querySelector('.vows-picker-save');
    var cancelBtn = pickerEl.querySelector('.vows-picker-cancel');

    saveBtn.addEventListener('click', function () {
      var dateVal = pickerEl.querySelector('.vows-picker-date').value;
      var timeVal = pickerEl.querySelector('.vows-picker-time').value;
      if (!dateVal) return;
      var fullDate = dateVal + 'T' + (timeVal || '16:00') + ':00';
      storeDate(fullDate);
      onSave(fullDate);
      pickerEl.style.display = 'none';
    });

    cancelBtn.addEventListener('click', function () {
      pickerEl.style.display = 'none';
    });

    pickerEl.style.display = 'block';
  }

  function injectStyles() {
    if (document.getElementById('vows-countdown-styles')) return;
    var style = document.createElement('style');
    style.id = 'vows-countdown-styles';
    style.textContent = BASE_STYLES;
    document.head.appendChild(style);
  }

  function initCountdown(container) {
    var wrap = createCountdownHTML(container);
    container.appendChild(wrap);

    var display = wrap.cdDisplay;
    var picker = wrap.cdPicker;
    var stored = getStored();

    if (stored && stored.date) {
      startTimer(display, new Date(stored.date));
    } else {
      renderPlaceholder(display);
    }

    container.addEventListener('click', function (e) {
      if (e.target.closest('.vows-picker-wrap')) return;
      var stored = getStored();
      var currentVal = stored && stored.date ? stored.date : null;
      buildPicker(picker, currentVal, function (val) {
        startTimer(display, new Date(val));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectStyles();
      document.querySelectorAll('.vows-countdown').forEach(initCountdown);
    });
  } else {
    injectStyles();
    document.querySelectorAll('.vows-countdown').forEach(initCountdown);
  }
})();
