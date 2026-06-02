(function () {
  // ── Slide transitions + breadcrumb sync ──
  var SLIDE_DURATION = 400; // ms

  // Animate current page out, then navigate
  function slideTo(url, direction) {
    direction = direction || "left";
    if (document.querySelector(".page-sliding")) return;
    document.documentElement.classList.add("page-sliding");

    var html = document.documentElement;
    var slideOut = direction === "left" ? "page-slide-out-left" : "page-slide-out-right";
    html.classList.add(slideOut);

    setTimeout(function () {
      window.location.href = url;
    }, SLIDE_DURATION);
  }

  // Animate in on page load
  function slideIn() {
    var html = document.documentElement;
    // Detect direction from referrer or a data attribute
    var from = sessionStorage.getItem("vows_from_page") || "";
    var direction = "right";
    if (from === "rsvp") direction = "left";

    html.classList.add("page-slide-in-" + direction);
    setTimeout(function () {
      html.classList.remove("page-slide-in-left", "page-slide-in-right");
    }, SLIDE_DURATION + 50);
  }

  // Mark current page as the source before navigating
  function setupNav() {
    document.querySelectorAll("[data-slide]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var url = this.getAttribute("href") || this.dataset.slide;
        var dir = this.dataset.direction || "left";
        sessionStorage.setItem("vows_from_page", window.location.pathname.split("/").pop().replace(".html", ""));
        slideTo(url, dir);
      });
    });
  }

  // Breadcrumb active step
  function setBreadcrumb() {
    var current = window.location.pathname.split("/").pop().replace(".html", "");
    document.querySelectorAll("[data-step]").forEach(function (el) {
      var step = el.dataset.step;
      if (step === "1" && (current === "index" || current === "")) {
        el.classList.add("active");
      } else if (step === "2" && current === "rsvp") {
        el.classList.add("active");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      slideIn();
      setupNav();
      setBreadcrumb();
    });
  } else {
    slideIn();
    setupNav();
    setBreadcrumb();
  }

  // Expose for manual calls
  window.slideTo = slideTo;
})();
