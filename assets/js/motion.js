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
      // Split into words, keeping any <br> the markup uses to force a line break
      var tokens = [];
      Array.prototype.forEach.call(el.childNodes, function (n) {
        if (n.nodeType === 3) { n.textContent.trim().split(/\s+/).forEach(function (w) { if (w) { tokens.push(w); } }); }
        else if (n.nodeName === 'BR') { tokens.push('\n'); }
        else if (n.textContent) { n.textContent.trim().split(/\s+/).forEach(function (w) { if (w) { tokens.push(w); } }); }
      });
      el.textContent = '';
      var wi = 0;
      tokens.forEach(function (t, i) {
        if (t === '\n') { el.appendChild(document.createElement('br')); return; }
        var outer = document.createElement('span'); outer.className = 'w';
        var inner = document.createElement('span'); inner.textContent = t; inner.style.setProperty('--i', wi++);
        outer.appendChild(inner); el.appendChild(outer);
        if (i < tokens.length - 1 && tokens[i + 1] !== '\n') { el.appendChild(document.createTextNode(' ')); }
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

  /* ---- 4b. Fit the intro copy to the collage height (desktop) ---- */
  var introGrid = document.querySelector('.intro__grid');
  if (introGrid) {
    var introMedia = introGrid.querySelector('.intro__media');
    var introCopy = introGrid.querySelector('.intro__copy');
    var introImg = introMedia && introMedia.querySelector('img');
    var fitTimer = 0;
    function fitIntro() {
      if (!introMedia || !introCopy) { return; }
      if (window.innerWidth <= 1024) { introCopy.style.removeProperty('--intro-fs'); return; }
      var target = introMedia.offsetHeight;
      if (target < 100) { return; }
      var lo = 12, hi = 17, best = lo;
      for (var i = 0; i < 9; i++) {
        var mid = (lo + hi) / 2;
        introCopy.style.setProperty('--intro-fs', mid.toFixed(2) + 'px');
        if (introCopy.scrollHeight <= target) { best = mid; lo = mid; } else { hi = mid; }
      }
      introCopy.style.setProperty('--intro-fs', best.toFixed(2) + 'px');
    }
    function scheduleFit() { clearTimeout(fitTimer); fitTimer = setTimeout(fitIntro, 60); }
    if (introImg) {
      if (introImg.complete) { fitIntro(); } else { introImg.addEventListener('load', fitIntro, { once: true }); }
    }
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fitIntro); }
    window.addEventListener('resize', scheduleFit, { passive: true });
    if ('ResizeObserver' in window && introMedia) { new ResizeObserver(scheduleFit).observe(introMedia); }
    fitIntro();
  }

  /* ---- 4c. Hero pointer drift (lockup and bottles move against each other) ---- */
  var hero = document.querySelector('.hero');
  if (hero && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var hraf = 0, hx = 0, hy = 0;
    function applyHero() { hraf = 0; hero.style.setProperty('--px', hx.toFixed(3)); hero.style.setProperty('--py', hy.toFixed(3)); }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      hy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!hraf) { hraf = requestAnimationFrame(applyHero); }
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { hx = 0; hy = 0; if (!hraf) { hraf = requestAnimationFrame(applyHero); } });
  }

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
