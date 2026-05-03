/* ═══════════════════════════════════════════════════════════
   main.js — Core controller
   Page loader · Cursor · Navigation · Smooth scroll · FAQ ·
   Contact form · Enquiry chat · Small UX helpers
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
      updateActiveLink();
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

  const navLinks = $$('.nav-link[data-nav]');
  const sections = $$('section[id]');

  function updateActiveLink() {
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
    const y = window.scrollY + navH + 48;
    let active = 'hero';

    sections.forEach(sec => {
      if (sec.offsetTop <= y) active = sec.id;
    });

    navLinks.forEach(link => {
      const target = link.dataset.nav;
      link.classList.toggle('active', target === active);
    });
  }

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

/* ─── Contact Form ───────────────────────────────────────── */
(function initContactForm() {
  const form    = $('#contact-form');
  const success = $('#form-success');
  const submit  = $('#form-submit');
  if (!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(field) {
    const val = field.value.trim();
    let ok = true;

    if (field.required && !val) ok = false;
    if (field.type === 'email' && val && !EMAIL_RE.test(val)) ok = false;
    if (field.type === 'url' && val) {
      try { new URL(val); } catch { ok = false; }
    }

    field.classList.toggle('invalid', !ok);
    field.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  $$('input, select, textarea', form).forEach(field => {
    on(field, 'blur', () => validateField(field));
    on(field, 'input', () => {
      field.classList.remove('invalid');
      field.removeAttribute('aria-invalid');
    });
  });

  async function submitForm() {
    const action = form.getAttribute('action');
    const method = (form.getAttribute('method') || 'POST').toUpperCase();

    if (!action || action === '#') {
      await new Promise(r => setTimeout(r, 900));
      return { success: true };
    }

    const res = await fetch(action, {
      method,
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Form submission failed');
    }

    return data;
  }

  on(form, 'submit', async e => {
    e.preventDefault();

    const fields = $$('input[required], select[required], textarea[required]', form);
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      fields.find(f => f.classList.contains('invalid'))?.focus();
      return;
    }

    if (submit) {
      submit.classList.add('loading');
      submit.disabled = true;
    }

    try {
      await submitForm();

      if (submit) {
        submit.classList.remove('loading');
        submit.disabled = false;
      }

      form.style.transition = 'opacity .3s';
      form.style.opacity = '0';

      setTimeout(() => {
        form.hidden = true;
        form.style.opacity = '';
        form.style.transition = '';

        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 280);
    } catch (err) {
      if (submit) {
        submit.classList.remove('loading');
        submit.disabled = false;
      }

      alert('Something went wrong sending the enquiry. Please email us directly or try again.');
    }
  });
})();

/* ─── Enquiry Chat Widget ────────────────────────────────── */
(function initChat() {
  const widget  = $('#chat-widget');
  const toggle  = $('#chat-toggle');
  const panel   = $('#chat-panel');
  const close   = $('#chat-close');
  const msgs    = $('#chat-messages');
  const replies = $('#chat-quick-replies');
  const badge   = $('#chat-unread');
  if (!widget || !toggle || !panel || !msgs || !replies) return;

  const brandName = $('.chat-agent-name')?.textContent?.trim() || 'ReadyStack Digital';
  let isOpen = false;
  const BOT_DELAY = 520;

  const TREE = {
    start: {
      msg: `Hi. I am the ${brandName} assistant. What do you need help with?`,
      opts: [
        { label: 'Website build', next: 'website' },
        { label: 'Business email', next: 'email' },
        { label: 'Domain and hosting', next: 'domain' },
        { label: 'Monthly care', next: 'care' },
        { label: 'SEO basics', next: 'seo' },
        { label: 'Security basics', next: 'security' },
        { label: 'Request a quote', next: 'quote' },
      ],
    },
    website: {
      msg: `**Website build** starts from $1,000 for a clean landing page website. It includes mobile-friendly design, contact form, WhatsApp/call/email buttons, basic SEO setup, hosting setup and domain connection.`,
      opts: [
        { label: 'View packages', next: '_pricing' },
        { label: 'Request website quote', next: 'quote' },
        { label: 'Back', next: 'start' },
      ],
    },
    email: {
      msg: `**Professional business email** can be added as an option. We help connect email such as info@yourdomain.com and configure MX, SPF, DKIM and DMARC records so your domain and email are set up properly.`,
      opts: [
        { label: 'Ask about email setup', next: 'quote' },
        { label: 'View services', next: '_services' },
        { label: 'Back', next: 'start' },
      ],
    },
    domain: {
      msg: `**Domain and hosting setup** covers domain connection, DNS records, secure HTTPS setup, hosting configuration and launch checks. Monthly care can keep those basics monitored after launch.`,
      opts: [
        { label: 'View monthly care', next: '_pricing' },
        { label: 'Request setup help', next: 'quote' },
        { label: 'Back', next: 'start' },
      ],
    },
    care: {
      msg: `**Monthly care** starts from $100/month. It covers hosting management, domain and DNS checks, SSL monitoring, form testing, basic SEO monitoring and small updates based on the plan.`,
      opts: [
        { label: 'View care packages', next: '_pricing' },
        { label: 'Ask about care', next: 'quote' },
        { label: 'Back', next: 'start' },
      ],
    },
    seo: {
      msg: `**SEO basics** are included with every website: page titles, meta descriptions, heading structure, sitemap, robots file, image alt text and Google Search Console setup. Ongoing SEO and blog writing are quoted separately.`,
      opts: [
        { label: 'View services', next: '_services' },
        { label: 'Request quote', next: 'quote' },
        { label: 'Back', next: 'start' },
      ],
    },
    security: {
      msg: `**Security basics** include HTTPS, SSL checks, DNS review, trusted form handling, email authentication records and a lean static-first setup where suitable to avoid unnecessary plugin and login risks.`,
      opts: [
        { label: 'View security section', next: '_security' },
        { label: 'Request quote', next: 'quote' },
        { label: 'Back', next: 'start' },
      ],
    },
    quote: {
      msg: `Use the contact form and include your business name, current website if any, whether you own a domain, and whether you need professional email. We will recommend the simplest setup.`,
      opts: [
        { label: 'Open contact form', next: '_contact' },
        { label: 'View packages', next: '_pricing' },
        { label: 'Back', next: 'start' },
      ],
    },
  };

  function openChat() {
    isOpen = true;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('open');
    badge?.classList.add('hidden');

    if (msgs.children.length === 0) {
      setTimeout(() => sendBotMsg(TREE.start.msg, TREE.start.opts), 260);
    }
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('open');
  }

  on(toggle, 'click', () => isOpen ? closeChat() : openChat());
  on(close, 'click', closeChat);
  on(document, 'keydown', e => { if (e.key === 'Escape' && isOpen) closeChat(); });

  function scrollToSection(id) {
    closeChat();
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = `#${id}`;
  }

  function addMsg(text, role) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg';

    const bubble = document.createElement('div');
    bubble.className = `chat-msg-bubble from-${role}`;
    bubble.innerHTML = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    wrap.appendChild(bubble);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function clearReplies() {
    replies.innerHTML = '';
  }

  function renderOptions(opts) {
    clearReplies();
    if (!opts?.length) return;

    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply';
      btn.type = 'button';
      btn.textContent = opt.label;

      on(btn, 'click', () => {
        addMsg(opt.label, 'user');
        clearReplies();

        const sectionRoutes = {
          _contact: 'contact',
          _pricing: 'pricing',
          _services: 'services',
          _security: 'security',
        };

        if (sectionRoutes[opt.next]) {
          scrollToSection(sectionRoutes[opt.next]);
          return;
        }

        const node = TREE[opt.next];
        if (!node) return;

        setTimeout(() => sendBotMsg(node.msg, node.opts), BOT_DELAY);
      });

      replies.appendChild(btn);
    });
  }

  function sendBotMsg(text, opts) {
    addMsg(text, 'agent');
    setTimeout(() => renderOptions(opts), 180);
  }
})();

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
  const process = $('#process');
  if (!fill || !process) return;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      fill.style.width = '100%';
      obs.disconnect();
    }
  }, { threshold: 0.3 });

  obs.observe(process);
})();

/* ─── Stagger .stagger-children ─────────────────────────── */
(function initStagger() {
  $$('.stagger-children').forEach(parent => {
    [...parent.children].forEach((child, i) => child.style.setProperty('--i', i));
  });
})();

/* ─── Hero date and time strip ──────────────────────────── */
(function initHeroDateTime() {
  const dateEl = $('#live-date');
  const timeEl = $('#live-time');
  if (!dateEl || !timeEl) return;

  function update() {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    timeEl.textContent = now.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  update();
  setInterval(update, 1000);
})();
