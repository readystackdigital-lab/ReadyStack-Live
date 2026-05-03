/* ═══════════════════════════════════════════════════════════
   dashboard.js — Lightweight website care preview helpers
   ReadyStack Digital

   Removed old network topology, endpoint simulation, ACSC/E8 radar,
   threat feed and managed-IT dashboard logic. This file now only
   supports the simple secure website care preview used on the page.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Dashboard Clock ────────────────────────────────────── */
(function initCareClock() {
  const el = document.getElementById('dash-clock');
  if (!el) return;

  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  tick();
  setInterval(tick, 1000);
})();

/* ─── Care Checklist Soft Pulse ──────────────────────────── */
(function initCareChecklistPulse() {
  const items = [...document.querySelectorAll('.alert-feed-list .alert-item')];
  if (!items.length) return;

  let active = 0;

  function update() {
    items.forEach((item, i) => item.classList.toggle('is-active', i === active));
    active = (active + 1) % items.length;
  }

  update();
  setInterval(update, 2400);
})();
