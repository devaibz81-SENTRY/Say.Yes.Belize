(function() {
  if (document.getElementById('cta-form-injected')) return;

  var CONVEX_SITE = 'https://outstanding-guanaco-830.convex.site';

  var templates = [
    { id:'analog', name:'Analog Indie Nuptials', folder:'Analog Indie Nuptials UI' },
    { id:'bloom', name:'Bloom', folder:'Bloom' },
    { id:'editorial', name:'Editorial Luxury', folder:'Editorial Luxury' },
    { id:'garden', name:'Eternal Garden', folder:'Eternal Garden' },
    { id:'film', name:'Forever Film', folder:'Forever Film' },
    { id:'boho', name:'Organic Boho', folder:'Organic Boho' },
    { id:'sensual', name:'Sensual', folder:'Sensual' },
    { id:'soft', name:'Soft Luxury', folder:'soft luxury' },
    { id:'timeless', name:'Timeless', folder:'Timeless' },
    { id:'romantic', name:'Ultra Romantic', folder:'Ultra Romantic' }
  ];

  var style = document.createElement('style');
  style.textContent = `
#cta-form-injected {
  --cta-red:#8b1a1a;
  --cta-gold:#c9a84c;
  --cta-cream:#faf5ed;
  font-family:"Plus Jakarta Sans",system-ui,sans-serif;
}
.cta-bar {
  background:var(--cta-red);
  color:#fff;
  padding:18px 28px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  cursor:pointer;
  border-radius:12px;
  margin:40px auto 20px;
  max-width:900px;
  transition:border-radius .3s;
  user-select:none;
}
.cta-bar.open{border-radius:12px 12px 0 0}
.cta-bar .label{display:flex;align-items:center;gap:12px}
.cta-bar .label .icon{font-size:22px}
.cta-bar .label h3{font-family:"Cormorant Garamond",serif;font-weight:400;font-size:20px;margin:0;letter-spacing:.02em}
.cta-bar .toggle{font-size:24px;font-weight:300;transition:transform .3s;line-height:1}
.cta-bar.open .toggle{transform:rotate(45deg)}
.cta-body {
  background:var(--cta-cream);
  border:2px solid var(--cta-red);
  border-top:none;
  border-radius:0 0 12px 12px;
  max-width:900px;
  margin:-20px auto 0;
  padding:0 28px;
  max-height:0;
  overflow:hidden;
  transition:max-height .5s ease,padding .3s ease;
}
.cta-body.open{max-height:600px;padding:28px}
.cta-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.cta-left{}
.cta-left label{display:block;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--cta-red);margin-bottom:4px}
.cta-left input,.cta-left select{width:100%;padding:10px 14px;border:1px solid rgba(0,0,0,.12);border-radius:6px;font-family:inherit;font-size:14px;background:#fff;outline:none;box-sizing:border-box}
.cta-left input:focus,.cta-left select:focus{border-color:var(--cta-gold)}
.cta-left .field{margin-bottom:12px}
.cta-right{}
.cta-right p{font-size:12px;color:#666;margin:0 0 10px;font-weight:600;letter-spacing:.05em}
.template-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.tmpl-card{
  padding:8px 10px;
  border:1px solid rgba(0,0,0,.08);
  border-radius:6px;
  cursor:pointer;
  font-size:11px;
  text-align:center;
  transition:all .15s;
  background:#fff;
  font-weight:500;
}
.tmpl-card:hover{border-color:var(--cta-gold)}
.tmpl-card.selected{border-color:var(--cta-red);background:var(--cta-red);color:#fff}
.cta-submit{
  margin-top:16px;
  width:100%;
  padding:14px;
  background:var(--cta-red);
  color:#fff;
  border:none;
  border-radius:8px;
  font-size:12px;
  font-weight:700;
  letter-spacing:.15em;
  text-transform:uppercase;
  cursor:pointer;
  transition:background .2s,transform .2s;
}
.cta-submit:hover{background:#5c0e0e;transform:translateY(-1px)}
.cta-submit.loading{pointer-events:none;opacity:.6}
.cta-note{font-size:10px;color:#999;text-align:center;margin-top:10px}
@media(max-width:600px){
  .cta-grid{grid-template-columns:1fr}
  .cta-body.open{padding:20px}
  .template-grid{grid-template-columns:1fr 1fr}
}
`;
  document.head.appendChild(style);

  var wrapper = document.createElement('div');
  wrapper.id = 'cta-form-injected';

  var selectedTemplate = 'bloom';

  wrapper.innerHTML =
    '<div class="cta-bar" id="ctaBar">' +
      '<div class="label">' +
        '<span class="icon">📖</span>' +
        '<h3>Start Your Wedding Site</h3>' +
      '</div>' +
      '<span class="toggle" id="ctaToggle">+</span>' +
    '</div>' +
    '<div class="cta-body" id="ctaBody">' +
      '<div class="cta-grid">' +
        '<div class="cta-left">' +
          '<div class="field"><label>Your names</label><input type="text" id="ctaNames" placeholder="Evelyn & James"></div>' +
          '<div class="field"><label>Email</label><input type="email" id="ctaEmail" placeholder="you@example.com"></div>' +
          '<div class="field"><label>Wedding date</label><input type="date" id="ctaDate"></div>' +
          '<div class="field"><label>Phone (optional)</label><input type="tel" id="ctaPhone" placeholder="+501 555-0000"></div>' +
        '</div>' +
        '<div class="cta-right">' +
          '<p>Choose your template</p>' +
          '<div class="template-grid" id="tmplGrid"></div>' +
        '</div>' +
      '</div>' +
      '<button class="cta-submit" id="ctaSubmit">Create My Preview →</button>' +
      '<p class="cta-note">Your details are safe. We\'ll use them to build your preview.</p>' +
    '</div>';

  // Insert before footer
  function insertCTA() {
    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(wrapper, footer);
    } else {
      document.body.appendChild(wrapper);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertCTA);
  } else {
    insertCTA();
  }

  // Wait for DOM then initialize
  function init() {
    var bar = document.getElementById('ctaBar');
    var body = document.getElementById('ctaBody');
    var toggle = document.getElementById('ctaToggle');
    var grid = document.getElementById('tmplGrid');
    var submit = document.getElementById('ctaSubmit');
    if (!bar || !body) return;

    bar.addEventListener('click', function() {
      var isOpen = body.classList.contains('open');
      body.classList.toggle('open');
      bar.classList.toggle('open');
      toggle.textContent = isOpen ? '+' : '×';
    });

    // Template picker
    templates.forEach(function(t) {
      var card = document.createElement('div');
      card.className = 'tmpl-card' + (t.id === selectedTemplate ? ' selected' : '');
      card.textContent = t.name;
      card.dataset.id = t.id;
      card.dataset.folder = t.folder;
      card.addEventListener('click', function() {
        grid.querySelectorAll('.tmpl-card').forEach(function(c) { c.classList.remove('selected'); });
        card.classList.add('selected');
        selectedTemplate = t.id;
      });
      grid.appendChild(card);
    });

    // Form submit
    submit.addEventListener('click', function() {
      var names = document.getElementById('ctaNames').value.trim();
      var email = document.getElementById('ctaEmail').value.trim();
      var date = document.getElementById('ctaDate').value;
      if (!names || !email || !date) return;

      submit.classList.add('loading');
      submit.disabled = true;

      var tmpl = templates.find(function(t) { return t.id === selectedTemplate; }) || templates[0];
      var data = {
        templateId: selectedTemplate,
        names: names,
        email: email,
        date: date,
        phone: document.getElementById('ctaPhone').value.trim(),
        guests: 0,
        location: '',
        message: ''
      };

      fetch(CONVEX_SITE + '/createLead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function(r) { return r.json(); })
      .then(function(result) {
        var leadId = (result && result.leadId) ? result.leadId : '';
        try { sessionStorage.setItem('lead_' + selectedTemplate, JSON.stringify(data)); } catch(e) {}
        var url = encodeURI(tmpl.folder) + '/index.html?preview=1&slug=' + selectedTemplate;
        if (leadId) url += '&leadId=' + leadId;
        window.location.href = url;
      })
      .catch(function(err) {
        console.warn('Convex unavailable, using local storage', err);
        try { sessionStorage.setItem('lead_' + selectedTemplate, JSON.stringify(data)); } catch(e) {}
        var url = encodeURI(tmpl.folder) + '/index.html?preview=1&slug=' + selectedTemplate;
        window.location.href = url;
      });
    });
  }

  // Initialize after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
