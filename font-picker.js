(function () {
  var FONTS = [
    "Angelica","Brenda Harmony","Bridal Routine","Brigovin","Cinta",
    "Dh Finola","Eleanor","Elmira","Elysian Italic","Gettins",
    "Glossily Enigmatic","Marlyna","Married Typefaces","Married Alternates",
    "Married Swashes A","Married Swashes B","Newly Bridal","Nikahan Script",
    "Rapodhite","Reivant Grunge","Sweater Script","Sweater Script Italic",
    "SweetNote","Wedding Script Font"
  ];
  var STORAGE_KEY = "vows_font_family";
  var TARGET_SELECTOR = "h1, h2, h3, .script-heading, .heading-script, [data-script]";

  function loadFont() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && FONTS.indexOf(saved) > -1) {
      applyFont(saved);
      return saved;
    }
    return null;
  }

  function applyFont(name) {
    document.querySelectorAll(TARGET_SELECTOR).forEach(function (el) {
      el.style.setProperty("font-family", "'" + name + "', cursive, serif", "important");
    });
  }

  function buildPicker() {
    var saved = localStorage.getItem(STORAGE_KEY);

    var container = document.createElement("div");
    container.id = "vows-font-picker";
    container.style.cssText =
      "position:fixed;bottom:80px;right:20px;z-index:99999;" +
      "font-family:system-ui,sans-serif;";

    var toggle = document.createElement("button");
    toggle.id = "vows-font-toggle";
    toggle.textContent = "Aa";
    toggle.setAttribute("aria-label", "Change heading font");
    toggle.style.cssText =
      "width:48px;height:48px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);" +
      "background:rgba(0,0,0,0.75);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);" +
      "color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;" +
      "transition:all 0.3s ease;box-shadow:0 4px 20px rgba(0,0,0,0.3);" +
      "font-family:Georgia,serif;font-style:italic;font-weight:700;";

    var panel = document.createElement("div");
    panel.id = "vows-font-panel";
    panel.style.cssText =
      "position:absolute;bottom:60px;right:0;width:280px;max-height:400px;overflow-y:auto;" +
      "background:rgba(15,15,15,0.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);" +
      "border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:12px;" +
      "box-shadow:0 20px 60px rgba(0,0,0,0.5);display:none;";

    var title = document.createElement("div");
    title.textContent = "Script Font";
    title.style.cssText =
      "font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.4);" +
      "padding:4px 8px 8px;font-family:system-ui,sans-serif;";
    panel.appendChild(title);

    FONTS.forEach(function (name) {
      var btn = document.createElement("button");
      btn.textContent = name;
      btn.dataset.font = name;
      btn.style.cssText =
        "display:block;width:100%;text-align:left;padding:10px 12px;border:none;" +
        "background:none;color:#fff;cursor:pointer;border-radius:8px;" +
        "font-size:16px;transition:all 0.2s ease;font-family:'" + name + "',cursive,serif;";
      btn.style.cssText += name === saved ? "background:rgba(255,255,255,0.12);" : "";

      var sub = document.createElement("div");
      sub.textContent = name;
      sub.style.cssText =
        "font-size:10px;font-family:system-ui,sans-serif;color:rgba(255,255,255,0.35);" +
        "margin-top:2px;letter-spacing:0.3px;text-transform:uppercase;";
      btn.appendChild(sub);

      btn.addEventListener("mouseenter", function () {
        this.style.background = "rgba(255,255,255,0.1)";
      });
      btn.addEventListener("mouseleave", function () {
        this.style.background = this.dataset.font === localStorage.getItem(STORAGE_KEY)
          ? "rgba(255,255,255,0.12)" : "none";
      });
      btn.addEventListener("click", function () {
        var font = this.dataset.font;
        localStorage.setItem(STORAGE_KEY, font);
        applyFont(font);
        panel.style.display = "none";
        panel.querySelectorAll("button").forEach(function (b) {
          b.style.background = b.dataset.font === font ? "rgba(255,255,255,0.12)" : "none";
        });
      });
      panel.appendChild(btn);
    });

    container.appendChild(panel);
    container.appendChild(toggle);
    document.body.appendChild(container);

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) {
        panel.style.display = "none";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      loadFont();
      buildPicker();
    });
  } else {
    loadFont();
    buildPicker();
  }
})();
