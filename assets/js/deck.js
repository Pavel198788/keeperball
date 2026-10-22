/* Презентация «Клубам»: стрелки, кнопки, свайп, счётчик «N / M», ссылка #N. */
(function () {
  "use strict";

  function init() {
    var deck = document.querySelector("[data-deck]");
    if (!deck) return;
    var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
    var counter = deck.querySelector("[data-deck-counter]");
    var prev = deck.querySelector("[data-deck-prev]");
    var next = deck.querySelector("[data-deck-next]");
    var total = slides.length;
    var current = 0;

    function fromHash() {
      var n = parseInt((location.hash || "").replace("#", ""), 10);
      return n >= 1 && n <= total ? n - 1 : 0;
    }

    function show(index, updateHash) {
      current = Math.max(0, Math.min(total - 1, index));
      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle("is-active", active);
        slide.classList.toggle("is-before", i < current);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        slide.setAttribute("aria-label", (i + 1) + " из " + total);
        if (active) slide.removeAttribute("inert"); else slide.setAttribute("inert", "");
        if (active) slide.scrollTop = 0;
      });
      if (counter) counter.textContent = (current + 1) + " / " + total;
      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current === total - 1;
      if (updateHash && window.history && history.replaceState) {
        try { history.replaceState(null, "", "#" + (current + 1)); } catch (e) { /* file:// */ }
      }
    }

    if (prev) prev.addEventListener("click", function () { show(current - 1, true); });
    if (next) next.addEventListener("click", function () { show(current + 1, true); });

    document.addEventListener("keydown", function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      var tag = event.target && event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      var key = event.key;
      if (key === "ArrowRight" || key === "PageDown") { event.preventDefault(); show(current + 1, true); }
      else if (key === "ArrowLeft" || key === "PageUp") { event.preventDefault(); show(current - 1, true); }
      else if (key === "Home") { event.preventDefault(); show(0, true); }
      else if (key === "End") { event.preventDefault(); show(total - 1, true); }
    });

    var startX = 0, startY = 0, tracking = false;
    deck.addEventListener("touchstart", function (event) {
      if (event.touches.length !== 1) { tracking = false; return; }
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      tracking = true;
    }, { passive: true });
    deck.addEventListener("touchend", function (event) {
      if (!tracking) return;
      tracking = false;
      var t = event.changedTouches[0];
      var dx = t.clientX - startX, dy = t.clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    window.addEventListener("hashchange", function () { show(fromHash(), false); });
    show(fromHash(), false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
