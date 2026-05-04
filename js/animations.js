/* ═══════════════════════════════════════════════════════════
   animations.js — Scroll reveal · Counters · Hero particles ·
   Online presence typewriter · Section entrance · Scroll progress
   ReadyStack Digital
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Scroll Reveal ──────────────────────────────────────── */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  targets.forEach(el => observer.observe(el));
})();

/* ─── Stat Counters ──────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      el.classList.add('counting');
      if (progress < 1) requestAnimationFrame(tick);
      else el.classList.remove('counting');
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ─── Hero Particle System ───────────────────────────────── */
(function initHeroParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let particles = [];
  let paused = false;

  // Three depth tiers: small/fast/near · medium · large/slow/far
  const TIERS = [
    { count: 22, rMin: 0.7,  rMax: 1.2,  speed: 0.55, opMin: 0.35, opMax: 0.65 },
    { count: 18, rMin: 1.3,  rMax: 2.1,  speed: 0.28, opMin: 0.16, opMax: 0.40 },
    { count:  8, rMin: 2.4,  rMax: 3.5,  speed: 0.12, opMin: 0.05, opMax: 0.14 },
  ];
  const MAX_DIST       = 140;
  const PARTICLE_COLOR = '245,158,11';
  const LINE_COLOR     = '180,140,60';

  class Particle {
    constructor(tier) { this.tier = tier; this.reset(true); }

    reset(random = false) {
      const t = this.tier;
      this.x  = random ? Math.random() * W : (Math.random() > 0.5 ? -4 : W + 4);
      this.y  = Math.random() * H;
      this.r  = t.rMin + Math.random() * (t.rMax - t.rMin);
      this.vx = (Math.random() - 0.5) * t.speed;
      this.vy = (Math.random() - 0.5) * t.speed;
      this.opacity = t.opMin + Math.random() * (t.opMax - t.opMin);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${PARTICLE_COLOR},${this.opacity})`;
      ctx.fill();
    }
  }

  function resize() {
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function init() {
    resize();
    particles = [];
    TIERS.forEach(tier => {
      for (let i = 0; i < tier.count; i++) particles.push(new Particle(tier));
    });
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAX_DIST) continue;
        const alpha = (1 - dist / MAX_DIST) * 0.13;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(${LINE_COLOR},${alpha})`;
        ctx.lineWidth   = 0.7;
        ctx.stroke();
      }
    }
  }

  function render() {
    if (!paused) {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
    }
    requestAnimationFrame(render);
  }

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const visObs = new IntersectionObserver(entries => {
      paused = !entries[0].isIntersecting;
    }, { threshold: 0 });
    visObs.observe(heroSection);
  }

  init();
  render();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  }, { passive: true });
})();

/* ─── Online Presence Typewriter ─────────────────────────── */
(function initTerminal() {
  const output = document.getElementById('terminal-output');
  if (!output) return;

  const LINES = [
    { type: 'cmd',  text: './readystack-presence-check --local-business' },
    { type: 'ok',   text: '✓ Website structure: SEO-ready and mobile-friendly' },
    { type: 'ok',   text: '✓ HTTPS: secure site connection prepared' },
    { type: 'ok',   text: '✓ Domain/DNS: records ready for launch' },
    { type: 'ok',   text: '✓ Business email: MX, SPF, DKIM and DMARC supported' },
    { type: 'ok',   text: '✓ Contact form: enquiry delivery checked' },
    { type: 'ok',   text: '✓ WhatsApp, phone and email CTAs connected' },
    { type: 'info', text: '→ Google Search Console and sitemap prepared' },
    { type: 'info', text: '→ Monthly care: SSL, DNS, forms and SEO checks scheduled' },
    { type: 'ok',   text: '✓ Client can focus on business. Technical setup managed.' },
  ];

  const COLOR_MAP = {
    cmd:  'terminal-cmd',
    ok:   'terminal-out-ok',
    warn: 'terminal-out-warn',
    info: 'terminal-out-info',
  };

  let lineIdx = 0;
  let charIdx = 0;
  let currentEl = null;
  let timerId = null;

  function reset() {
    if (timerId) { clearTimeout(timerId); timerId = null; }
    output.innerHTML = '';
    lineIdx = 0;
    charIdx = 0;
    currentEl = null;
  }

  function buildLine(line) {
    const row = document.createElement('div');
    row.className = 'terminal-line';

    if (line.type === 'cmd') {
      const prompt = document.createElement('span');
      prompt.className = 'terminal-prompt';
      prompt.textContent = '→';
      row.appendChild(prompt);
    }

    const text = document.createElement('span');
    text.className = COLOR_MAP[line.type] || 'terminal-cmd';
    row.appendChild(text);
    output.appendChild(row);
    return text;
  }

  function typeChar() {
    if (lineIdx >= LINES.length) {
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';
      output.appendChild(cursor);
      return;
    }

    const line = LINES[lineIdx];
    if (charIdx === 0) currentEl = buildLine(line);

    if (charIdx < line.text.length) {
      currentEl.textContent += line.text[charIdx];
      charIdx++;
      output.scrollTop = output.scrollHeight;
      timerId = setTimeout(typeChar, line.type === 'cmd' ? 34 : 7);
    } else {
      charIdx = 0;
      lineIdx++;
      timerId = setTimeout(typeChar, line.type === 'cmd' ? 240 : 55);
    }
  }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      reset();
      timerId = setTimeout(typeChar, 500);
    } else {
      reset();
    }
  }, { threshold: 0.4 });

  obs.observe(output);
})();

/* ─── Section Head Entrance ──────────────────────────────── */
(function initSectionHeads() {
  const heads = document.querySelectorAll('.section-head');
  if (!heads.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const nodes = [
        el.querySelector('.eyebrow'),
        el.querySelector('.section-h2'),
        el.querySelector('.section-subline'),
      ];

      nodes.forEach((node, i) => {
        if (!node) return;
        node.style.transitionDelay = `${i * 80}ms`;
        node.classList.add('revealed');
      });

      obs.unobserve(el);
    });
  }, { threshold: 0.25 });

  heads.forEach(h => {
    [...h.children].forEach(c => {
      if (!c.classList.contains('reveal')) c.classList.add('reveal');
    });
    obs.observe(h);
  });
})();

/* ─── Ambient Orbs ───────────────────────────────────────── */
(function initOrbs() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  ['orb orb-1', 'orb orb-2'].forEach(cls => {
    const div = document.createElement('div');
    div.className = cls;
    div.setAttribute('aria-hidden', 'true');
    hero.appendChild(div);
  });
})();

/* ─── Hero Visual Parallax ──────────────────────────────── */
(function initHeroParallax() {
  const visual = document.querySelector('.hero-visual');
  if (!visual) return;

  // Wait for entrance animation to finish before taking over transform
  let ready = false;
  setTimeout(() => { ready = true; }, 1500);

  window.addEventListener('scroll', () => {
    if (!ready) return;
    const sy = window.scrollY;
    if (sy > window.innerHeight) return;
    // Image drifts at 8% of scroll speed — text stays fixed, creating depth
    visual.style.transform = sy > 0 ? `scale(1) translateY(${sy * 0.08}px)` : '';
  }, { passive: true });
})();

/* ─── Scroll Progress Bar ───────────────────────────────── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    background: var(--amber);
    z-index: 9999;
    width: 0%;
    transition: width 60ms linear;
    pointer-events: none;
    transform-origin: left;
  `;
  document.body.appendChild(bar);

  function update() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = Math.min(pct, 100) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
