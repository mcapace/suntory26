/* A New Suntory Time — shared behaviour
   1. Scroll-in reveal for sections
   2. "Drinks for Every Moment" cards: hover on desktop, tap-to-toggle on touch */

(function () {
  'use strict';

  /* ---- 1. Reveal on scroll ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- 2. Drink cards ---- */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.drink'));
  if (!cards.length) { return; }

  var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function closeAll(except) {
    cards.forEach(function (card) {
      if (card !== except && card.classList.contains('is-open')) {
        card.classList.remove('is-open');
        var t = card.querySelector('.drink__toggle');
        if (t) { t.setAttribute('aria-expanded', 'false'); }
      }
    });
  }

  cards.forEach(function (card) {
    var toggle = card.querySelector('.drink__toggle');
    var close = card.querySelector('.drink__close');
    if (!toggle) { return; }

    toggle.addEventListener('click', function () {
      var open = card.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { closeAll(card); }
    });

    if (close) {
      close.addEventListener('click', function (e) {
        e.stopPropagation();
        card.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      });
    }

    // On hover devices, leaving the card with the mouse should also clear a tapped/clicked state.
    if (hoverCapable) {
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Tap outside closes any open card; Escape closes too.
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.drink')) { closeAll(null); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(null); }
  });
})();
