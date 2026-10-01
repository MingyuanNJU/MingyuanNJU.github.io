/* ============================================================
   Mingyuan Chen — homepage scripts
   1. Pixel-particle canvas background (hero)
   2. Typewriter tagline
   3. Nav: mobile toggle + scroll-spy
   4. Scroll-reveal animations
   5. Email obfuscation + click-to-copy
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. Pixel particle canvas ---------- */
  var canvas = document.getElementById('pixel-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var COLORS = ['#5eead4', '#a78bfa', '#f472b6', '#fbbf24'];
    var PX = 4; // pixel block size — the "pixel art" unit

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      var target = Math.min(90, Math.floor(canvas.width * canvas.height / 16000));
      while (particles.length < target) particles.push(spawn());
      particles.length = target;
    }

    function spawn() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: PX * (1 + Math.floor(Math.random() * 3)), // 1-3 pixel blocks
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.08 + Math.random() * 0.3),               // drift slowly upward
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.25 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2               // for twinkling
      };
    }

    function tick(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;

        // gentle repulsion from the mouse
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 14400) { // 120px radius
          var d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * 1.4;
          p.y += (dy / d) * 1.4;
        }

        // wrap around edges
        if (p.y < -12) { p.y = canvas.height + 12; p.x = Math.random() * canvas.width; }
        if (p.x < -12) p.x = canvas.width + 12;
        if (p.x > canvas.width + 12) p.x = -12;

        // snap to the pixel grid for the retro look
        var gx = Math.round(p.x / PX) * PX;
        var gy = Math.round(p.y / PX) * PX;
        ctx.globalAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase));
        ctx.fillStyle = p.color;
        ctx.fillRect(gx, gy, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    document.getElementById('about').addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    document.getElementById('about').addEventListener('mouseleave', function () {
      mouse.x = -9999; mouse.y = -9999;
    });
    resize();
    requestAnimationFrame(tick);
  }

  /* ---------- 2. Typewriter ---------- */
  var LINES = [
    'Postdoc @ RIKEN, Japan (๑˃ᴗ˂)ﻭ',
    'I teach photons to count beyond 0 and 1.',
    'Chiral light–matter interactions enthusiast.',
    'Structured light × quantum emitters.',
    'Currently chasing topology at criticality.'
  ];
  var typedEl = document.getElementById('typed');
  if (typedEl) {
    var li = 0, ci = 0, deleting = false;
    (function type() {
      var line = LINES[li];
      ci += deleting ? -1 : 1;
      typedEl.textContent = line.slice(0, ci);
      var wait = deleting ? 32 : 62;
      if (!deleting && ci === line.length) { wait = 2200; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; li = (li + 1) % LINES.length; wait = 420; }
      setTimeout(type, wait);
    })();
  }

  /* ---------- 2b. Avatar swap: real photo <-> playful pixel ---------- */
  var avatarReal = document.getElementById('avatar-real');
  var avatarPixel = document.getElementById('avatar-pixel');
  if (avatarReal && avatarPixel) {
    var showingReal = true;
    var swapAvatar = function () {
      showingReal = !showingReal;
      avatarReal.classList.toggle('show', showingReal);
      avatarPixel.classList.toggle('show', !showingReal);
      // linger longer on the real photo, brief flash of the pixel one
      setTimeout(swapAvatar, showingReal ? 2600 : 1100);
    };
    setTimeout(swapAvatar, 2600);
  }

  /* ---------- 3. Nav: mobile toggle + scroll-spy ---------- */
  var toggle = document.getElementById('nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  var sections = ['about', 'cv', 'research', 'publications', 'contact'];
  var navAs = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', function () {
    var pos = window.scrollY + 120;
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      var el = document.getElementById(sections[i]);
      if (el && el.offsetTop <= pos) current = sections[i];
    }
    navAs.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  /* ---------- 4. Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    '.tl-item, .work-card, .cv-box, .contact-card, .pub-group-title, .pub-list li'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(function (el) { io.observe(el); });

  /* ---------- 5. Email obfuscation + copy ---------- */
  var emailCard = document.getElementById('email-card');
  var emailText = document.getElementById('email-text');
  var EMAIL = ['mingyuan.chen0812', 'gmail.com'].join('@');
  if (emailCard && emailText) {
    emailCard.addEventListener('click', function (e) {
      e.preventDefault();
      var done = function () {
        emailText.textContent = 'copied!';
        setTimeout(function () { emailText.textContent = EMAIL; }, 1400);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, done);
      else done();
      emailText.textContent = EMAIL;
    });
    emailText.textContent = EMAIL;
  }
})();
