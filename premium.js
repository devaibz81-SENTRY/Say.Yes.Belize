(function () {
  "use strict";

  // ── Attach premium classes to elements ──
  function enhance() {
    // Entry animations on sections and cards
    document.querySelectorAll(
      "section, .card, [class*='section-'], article, .gallery-grid, .story-content, .event-card"
    ).forEach(function (el, i) {
      if (!el.classList.contains("premium-section")) {
        el.classList.add("premium-section");
        el.style.transitionDelay = (i % 8) * 0.07 + "s";
      }
    });

    // Fade-up for headings
    document.querySelectorAll("h1, h2, h3, .hero-title, .section-title").forEach(function (el, i) {
      if (!el.classList.contains("premium-fade-up")) {
        el.classList.add("premium-fade-up");
        el.classList.add("premium-stagger-" + Math.min((i % 8) + 1, 8));
      }
    });

    // Image zoom frames
    document.querySelectorAll("img:not(.no-premium)").forEach(function (img) {
      var parent = img.parentElement;
      if (parent && !parent.classList.contains("premium-img-frame") && parent.tagName !== "A") {
        parent.classList.add("premium-img-frame");
      }
    });

    // Glass for cards with dark/translucent backgrounds
    document.querySelectorAll(
      ".bg-white\\/10, .bg-black\\/20, .bg-black\\/30, .bg-white\\/5, [class*='backdrop-blur']"
    ).forEach(function (el) {
      if (!el.classList.contains("premium-glass") && !el.classList.contains("premium-glass-dark")) {
        var isDark = el.matches("[class*='bg-black']");
        el.classList.add(isDark ? "premium-glass-dark" : "premium-glass");
      }
    });
  }

  // ── Intersection Observer for scroll reveals ──
  function observeSections() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("premium-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".premium-section").forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      enhance();
      observeSections();
    });
  } else {
    enhance();
    observeSections();
  }
})();
