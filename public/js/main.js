/* ═══════════════════════════════════════════════════════════
   main.js — Core controller
   Page loader · Cursor · Navigation · Smooth scroll · FAQ ·
   Contact form · Small UX helpers
   ReadyStack Digital
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utilities ──────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el?.addEventListener(ev, fn, opts);

function lerp(a, b, t) { return a + (b - a) * t; }

/* ─── Page Loader ────────────────────────────────────────── */
(function initLoader() {
  const loader = $('#page-loader');
  const bar    = $('#loader-bar');
  const label  = $('#loader-label');
  if (!loader) return;

  const steps = [
    { pct: 25,  text: 'Preparing website setup…' },
    { pct: 55,  text: 'Checking domain, email and SEO basics…' },
    { pct: 82,  text: 'Loading secure website care…' },
    { pct: 100, text: 'Ready.' },
  ];

  let step = 0;

  function advance() {
    if (step >= steps.length) return done();
    const { pct, text } = steps[step++];
    if (bar)   bar.style.width = pct + '%';
    if (label) label.textContent = text;
    const delay = step === steps.length ? 220 : 260 + Math.random() * 180;
    setTimeout(advance, delay);
  }

  function done() {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.add('loaded');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, 260);
  }

  setTimeout(advance, 160);
})();

/* ─── Custom Cursor ──────────────────────────────────────── */
(function initCursor() {
  const cursor = $('#cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  const dot  = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  on(document, 'mousemove', e => { mx = e.clientX; my = e.clientY; });
  on(document, 'mousedown', () => cursor.classList.add('cursor-click'));
  on(document, 'mouseup',   () => cursor.classList.remove('cursor-click'));

  const interactive = 'a, button, input, textarea, select, .svc-card, .pricing-card, .presence-card, .faq-q, .contact-card';

  on(document, 'mouseover', e => {
    if (e.target.closest(interactive)) cursor.classList.add('cursor-hover');
  });

  on(document, 'mouseout', e => {
    if (e.target.closest(interactive)) cursor.classList.remove('cursor-hover');
  });

  function tick() {
    if (dot) dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;

    rx = lerp(rx, mx, 0.14);
    ry = lerp(ry, my, 0.14);
    if (ring) ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

/* ─── Navigation ─────────────────────────────────────────── */
(function initNav() {
  const nav    = $('#nav');
  const toggle = $('#nav-toggle');
  const menu   = $('#mobile-menu');
  if (!nav) return;

  let ticking = false;

  function updateScrollState() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('nav-scrolled', window.scrollY > 20);
      ticking = false;
    });
  }

  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menu?.classList.add('open');
    toggle?.classList.add('open');
    toggle?.setAttribute('aria-expanded', 'true');
    menu?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    menu?.classList.remove('open');
    toggle?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  on(toggle, 'click', () => menuOpen ? closeMenu() : openMenu());
  $$('.mobile-link').forEach(link => on(link, 'click', closeMenu));

  on(document, 'click', e => {
    if (menuOpen && !menu?.contains(e.target) && !toggle?.contains(e.target)) closeMenu();
  });

  on(document, 'keydown', e => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  on(window, 'scroll', updateScrollState, { passive: true });
  updateScrollState();
})();

/* ─── Smooth Scroll ──────────────────────────────────────── */
(function initSmoothScroll() {
  on(document, 'click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const id = anchor.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : document.documentElement;
    if (!target) return;

    e.preventDefault();

    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
    const top = target === document.documentElement
      ? 0
      : target.getBoundingClientRect().top + window.scrollY - navH;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ─── Magnetic Buttons ───────────────────────────────────── */
(function initMagnetic() {
  const magnets = $$('.magnetic');
  if (!magnets.length || window.matchMedia('(hover: none)').matches) return;

  magnets.forEach(el => {
    on(el, 'mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.24;
      const dy = (e.clientY - cy) * 0.24;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    on(el, 'mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ─── FAQ Accordion ──────────────────────────────────────── */
(function initFAQ() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.faq-q');
    const answer  = item.querySelector('.faq-a');
    if (!trigger || !answer) return;

    on(trigger, 'click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      items.forEach(other => {
        if (other === item) return;
        other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-a')?.classList.remove('open');
      });

      trigger.setAttribute('aria-expanded', String(!isOpen));
      answer.classList.toggle('open', !isOpen);
    });
  });
})();

/* ─── FAQ Category Filter ────────────────────────────────── */
(function initFaqFilter() {
  const buttons = $$('.faq-filter-btn');
  const items   = $$('.faq-item[data-cat]');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach(b => b.classList.toggle('active', b === btn));
      items.forEach(item => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.style.display = show ? '' : 'none';
        if (!show) {
          item.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
          item.querySelector('.faq-a')?.classList.remove('open');
        }
      });
    });
  });
})();

/* Multi-step + web3forms contact form modules removed — their #contact-form
   markup was only in the unused Contact.astro component. */

/* ─── Hover tilt on current cards ────────────────────────── */
(function initTilt() {
  const cards = $$('.pricing-card, .presence-card');
  if (!cards.length || window.matchMedia('(hover: none)').matches) return;

  const STRENGTH = 5;

  cards.forEach(card => {
    on(card, 'mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${-y * STRENGTH}deg) rotateY(${x * STRENGTH}deg) translateY(-3px)`;
    });

    on(card, 'mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ─── Process connector ─────────────────────────────────── */
(function initConnector() {
  const fill = $('#connector-fill');
  const steps = $('.process-steps');
  if (!fill || !steps) return;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      fill.style.width = '100%';
      obs.disconnect();
    }
  }, { threshold: 0.15 });

  obs.observe(steps);
})();

/* ─── Service Filter Tabs ────────────────────────────────── */
(function initServiceFilter() {
  const buttons = $$('.svc-filter-btn');
  const cards   = $$('.svc-card[data-cat]');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      buttons.forEach(b => b.classList.toggle('active', b === btn));
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();

/* ─── Stagger .stagger-children ─────────────────────────── */
(function initStagger() {
  $$('.stagger-children').forEach(parent => {
    [...parent.children].forEach((child, i) => child.style.setProperty('--i', i));
  });
})();

/* ─── Hero date and time strip ──────────────────────────── */
(function initHeroDateTime() {
  const dateEl    = $('#live-date');
  const timeEl    = $('#live-time');
  const dashTimeEl = $('.dash-time');

  function update() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    if (timeEl)     timeEl.textContent     = time;
    if (dashTimeEl) dashTimeEl.textContent = time;
  }

  update();
  setInterval(update, 1000);
})();

/* ─── Hero video: pause on reduced motion ───────────────── */
(function initHeroVideo() {
  const video = document.querySelector('.hero-video');
  if (!video) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause();
  }
})();

/* ─── Back to top ────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
