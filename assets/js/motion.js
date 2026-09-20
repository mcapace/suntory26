/* A New Suntory Time — motion layer
   1. Intro curtain and "ready" state
   2. Scroll progress bar
   3. Word-split reveals on headings
   4. Scroll parallax on media
   5. Pointer tilt + glare on drink cards
   All of it is skipped when the visitor prefers reduced motion. */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  /* ---- 1. Curtain ---- */
  var curtain = document.querySelector('.curtain');
  function ready() {
    body.classList.add('is-ready');
    if (curtain) {
      curtain.classList.add('is-done');
      setTimeout(function () { curtain.remove(); }, 1400);
    }
  }
  if (reduce || !curtain) {
    if (curtain) { curtain.remove(); }
    body.classList.add('is-ready');
  } else {
    var minDelay = new Promise(function (r) { setTimeout(r, 650); });
    var loaded = new Promise(function (r) {
      if (document.readyState === 'complete') { r(); } else { window.addEventListener('load', r, { once: true }); }
    });
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var cap = new Promise(function (r) { setTimeout(r, 2200); });
    Promise.race([Promise.all([minDelay, loaded, fonts]), cap]).then(ready);
  }

  /* ---- 2. Progress bar ---- */
  var bar = document.querySelector('.progress');
  var ticking = false;
  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      }
      if (!reduce) { updateParallax(); }
    });
  }

  /* ---- 3. Word-split reveals ---- */
  if (!reduce) {
    var heads = document.querySelectorAll('[data-split]');
    Array.prototype.forEach.call(heads, function (el) {
      if (el.querySelector('img')) { return; }
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach(function (w, i) {
        var outer = document.createElement('span'); outer.className = 'w';
        var inner = document.createElement('span'); inner.textContent = w; inner.style.setProperty('--i', i);
        outer.appendChild(inner); el.appendChild(outer);
        if (i < words.length - 1) { el.appendChild(document.createTextNode(' ')); }
      });
      el.classList.add('is-split');
    });
  }
  // Reveal split headings and wipe images on their own, even outside a .reveal block
  var selfReveal = document.querySelectorAll('[data-split], .wipe');
  if ('IntersectionObserver' in window && selfReveal.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); sio.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    Array.prototype.forEach.call(selfReveal, function (el) { sio.observe(el); });
  } else {
    Array.prototype.forEach.call(selfReveal, function (el) { el.classList.add('is-visible'); });
  }

  /* ---- 4. Parallax ---- */
  var px = [];
  if (!reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-parallax]'), function (wrap) {
      var target = wrap.querySelector('img');
      if (!target) { return; }
      var speed = parseFloat(wrap.getAttribute('data-parallax')) || 0.12;
      var scale = wrap.hasAttribute('data-parallax-scale') ? parseFloat(wrap.getAttribute('data-parallax-scale')) : 1 + Math.abs(speed) * 1.6;
      wrap.classList.add('px');
      px.push({ wrap: wrap, target: target, speed: speed, scale: scale });
    });
  }
  function updateParallax() {
    if (!px.length) { return; }
    var vh = window.innerHeight;
    for (var i = 0; i < px.length; i++) {
      var r = px[i].wrap.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) { continue; }
      var center = r.top + r.height / 2 - vh / 2;
      var y = -center * px[i].speed;
      px[i].target.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(' + px[i].scale.toFixed(3) + ')';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---- 5. Tilt on drink cards ---- */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.drink'), function (card) {
      var glare = document.createElement('span');
      glare.className = 'drink__glare'; glare.setAttribute('aria-hidden', 'true');
      card.appendChild(glare);
      var raf = 0, lx = 0, ly = 0;
      function apply() {
        raf = 0;
        card.style.setProperty('--rx', (ly * -7).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (lx * 9).toFixed(2) + 'deg');
        card.style.setProperty('--gx', ((lx + 0.5) * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', ((ly + 0.5) * 100).toFixed(1) + '%');
      }
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        lx = (e.clientX - r.left) / r.width - 0.5;
        ly = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) { raf = requestAnimationFrame(apply); }
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        lx = 0; ly = 0; if (!raf) { raf = requestAnimationFrame(apply); }
      });
    });
  }
})();
