(function() {
  'use strict';

  var CONVEX_SITE_URL = 'https://valiant-crab-320.convex.site';
  var params = new URLSearchParams(window.location.search);
  var isPreview = params.has('preview') || params.has('lead');
  if (!isPreview) return;

  var templateSlug = params.get('slug') || slugify(document.title || 'template');
  var leadId = params.get('leadId') || '';

  if (leadId) {
    try { sessionStorage.setItem('lead_id_' + templateSlug, leadId); } catch(e) {}
  } else {
    var storedId = null;
    try { storedId = sessionStorage.getItem('lead_id_' + templateSlug); } catch(e) {}
    if (storedId) leadId = storedId;
  }

  // Try sessionStorage first
  var storageKey = 'lead_' + templateSlug;
  var dataStr = sessionStorage.getItem(storageKey);
  if (!dataStr) dataStr = sessionStorage.getItem('lead_default');
  if (!dataStr && params.has('data')) {
    try { dataStr = atob(params.get('data')); } catch(e) {}
  }

  if (dataStr) {
    try {
      var d = JSON.parse(dataStr);
      if (d.names || d.date) { injectData(d); return; }
    } catch(e) {}
  }

  // Fallback: fetch from Convex
  if (leadId) {
    fetch(CONVEX_SITE_URL + '/getLead?leadId=' + encodeURIComponent(leadId))
      .then(function(r) { return r.json(); })
      .then(function(result) {
        if (result.success && result.data) {
          var rd = result.data;
          injectData({
            names: rd['Couple Names'] || rd.names || '',
            date: rd['Wedding Date'] || rd.date || '',
            email: rd.Email || rd.email || '',
            phone: rd.Phone || rd.phone || '',
            guests: rd['Guest Count'] || rd.guests || '',
            location: rd.Venue || rd.location || '',
          });
        }
      })
      .catch(function(err) {
        console.warn('LeadInject: Convex fetch failed', err);
      });
  }

  // ── Utils ──
  function slugify(str) {
    return String(str || '').toLowerCase().replace(/&amp;/g, 'and')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48) || 'template';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      var d = new Date(dateStr + 'T12:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch(e) { return dateStr; }
  }

  function getInitials(name) {
    if (!name) return '';
    return name.split(/[&\s]+/).filter(Boolean).map(function(w) { return w.charAt(0).toUpperCase(); }).slice(0, 2).join(' & ');
  }

  function getFirstName(name) { return name.split(/[&\s]+/)[0] || ''; }

  function walkTextNodes(root, callback) {
    var iter = document.createNodeIterator(root, NodeFilter.SHOW_TEXT, null, false);
    var node, changes = [];
    while (node = iter.nextNode()) {
      if (node.parentNode && !/script|style|svg/.test(node.parentNode.nodeName)) {
        var result = callback(node.textContent);
        if (result !== node.textContent) changes.push({ node: node, newText: result });
      }
    }
    changes.forEach(function(c) { c.node.textContent = c.newText; });
  }

  function replacePatterns(list, replacement) {
    walkTextNodes(document.body, function(text) {
      var result = text;
      list.forEach(function(pattern) {
        result = result.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replacement);
      });
      return result;
    });
  }

  // ── Main injection ──
  function injectData(data) {
    var COUPLES = [
      'Evelyn & James', 'Evelyn & Julian', 'Eleanor & Julian', 'Sarah & Michael',
      'Elizabeth & James', 'Alexander & Beatrice', 'Evelyn Rose & Julian Vance',
      'Evelyn and James', 'Evelyn and Julian', 'Eleanor and Julian', 'Sarah and Michael',
      'Elizabeth and James', 'Alexander and Beatrice', 'Evelyn Rose and Julian Vance',
      'Evelyn &amp; James', 'Evelyn &amp; Julian', 'Eleanor &amp; Julian',
      'Sarah &amp; Michael', 'Elizabeth &amp; James', 'Alexander &amp; Beatrice',
      'Evelyn Rose &amp; Julian Vance', 'Evelyn and James', 'Evelyn and Julian',
      'Evelyn & James 2024', 'Evelyn and James 2024', 'Evelyn, James', 'Evelyn &amp; James &amp;'
    ];
    var DATES = [
      'Saturday, September 14, 2024', 'September 14, 2024', 'September 24, 2024',
      'September 24, Two Thousand Twenty-Four', 'October 24th, 2024',
      'Saturday, the Twelfth of October, Two Thousand and Twenty Four',
      'Saturday, October 24, 2024', 'August 15, 2026', 'October 24, 2025',
      'September 28, 2024', '09.28.24', 'Est. Oct 2024', 'OCTOBER 2019',
      'August Fifteenth \u00b7 Twenty Twenty-Six', 'October 24th, 2024 \u2022 San Pedro'
    ];

    if (data.names) {
      replacePatterns(COUPLES, data.names);
      var initials = getInitials(data.names);
      if (initials) {
        walkTextNodes(document.body, function(text) {
          return text.replace(/\b([A-Z])\s*[&]\s*([A-Z])\b/g, initials);
        });
      }
      var firstName = getFirstName(data.names);
      var commonNames = ['Evelyn', 'James', 'Julian', 'Eleanor', 'Sarah', 'Michael', 'Elizabeth', 'Alexander', 'Beatrice'];
      if (firstName && commonNames.indexOf(firstName) === -1) {
        commonNames.forEach(function(ph) {
          walkTextNodes(document.body, function(text) {
            return text.replace(new RegExp('\\b' + ph + '\\b', 'g'), firstName);
          });
        });
      }
    }

    if (data.date) {
      replacePatterns(DATES, formatDate(data.date));
    }

    // Disable interactive UI
    document.querySelectorAll(
      '.interactive-tour-button, .editable-field, .editable-indicator, .editable-tooltip, ' +
      '.photo-zone, .photo-zone-placeholder, .tour-overlay, .tour-bubble, #tour-overlay, #tour-spotlight, ' +
      '.editable-input, .editable-input-wrapper, .editable-controls, .editable-btn'
    ).forEach(function(el) { if (el.parentNode) el.parentNode.removeChild(el); });

    var s1 = document.getElementById('template-interactive-theme');
    if (s1) s1.parentNode.removeChild(s1);
    var s2 = document.getElementById('editable-fields-styles');
    if (s2) s2.parentNode.removeChild(s2);

    document.querySelectorAll('[data-field-id], [data-photo-zone-wrapper], [data-photo-experience]')
      .forEach(function(el) { el.removeAttribute('data-field-id'); el.removeAttribute('data-photo-zone-wrapper'); });

    // Preview banner
    var banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#1a1a1a;color:#fdfcf8;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;font-family:"Plus Jakarta Sans",sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase';
    banner.innerHTML = '<span>Preview' + (leadId ? ' <span style="opacity:0.4;font-weight:400;letter-spacing:0">#' + leadId + '</span>' : '') + '</span><a href="../intake.html?template=' + (params.get('slug') || templateSlug) + (leadId ? '&leadId=' + leadId : '') + '" style="color:#b88e44;text-decoration:none;border-bottom:1px solid rgba(184,142,68,.35)">Edit Details</a>';
    document.body.prepend(banner);
    document.body.style.paddingTop = '36px';

    console.log('LeadInject: Preview active for', data.names || 'unnamed couple');
  }
})();
