/*
  Shared "particle text canvas" headline effect — 21st.dev
  @dhiluxui/particle-text-canvas, adapted to vanilla TS.

  The heading's words are re-drawn (at their real DOM rects, so
  wrapping/spans/colors match exactly) onto an offscreen canvas, its
  glyph pixels are sampled into particles, and the cursor repels them
  while a spring pulls each one home. The DOM heading stays for
  SEO/a11y; while active its glyphs are made transparent via inline
  styles (no per-page CSS needed) and the canvas takes over rendering.

  Self-gating: fine-pointer viewports ≥901px without reduced motion,
  reacting to media-query changes (a window that loads narrow still
  gets the effect when widened; shrinking hands back the DOM heading).
*/

const BLEED = 70;        // canvas overhang so repelled particles aren't clipped
const GAP = 3;           // sampling grid (CSS px) — particle density
const RADIUS = 95;       // cursor repel radius
const PUSH = 8;          // repel strength
const RETURN = 0.06;     // spring back to home position
const FRICTION = 0.86;
const DOT = 2;           // particle draw size

type P = { x: number; y: number; vx: number; vy: number; hx: number; hy: number; c: string };

export function particleHeadline(h1: HTMLElement | null) {
  if (!h1) return;
  const fine = window.matchMedia('(pointer: fine) and (min-width: 901px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let started = false;
  const tryStart = () => {
    if (started || !fine.matches || reduce.matches) return;
    started = true;
    const start = () => run(h1, fine);
    'requestIdleCallback' in window
      ? (window as any).requestIdleCallback(start, { timeout: 600 })
      : setTimeout(start, 200);
  };
  tryStart();
  fine.addEventListener('change', tryStart);
}

function run(h1: HTMLElement, fine: MediaQueryList) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: `-${BLEED}px`,
    // canvas is a replaced element: inset alone won't stretch it (it
    // sizes from its width/height attributes), so set CSS size too
    width: `calc(100% + ${BLEED * 2}px)`,
    height: `calc(100% + ${BLEED * 2}px)`,
    pointerEvents: 'none',
    display: 'none',
  });
  h1.style.position = 'relative';
  h1.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let particles: P[] = [];
  let W = 0, H = 0;
  let mx = -9999, my = -9999;
  let raf = 0, visible = true, active = false;

  // on: glyphs transparent, canvas renders. off: full restore (mobile).
  const setActive = (on: boolean) => {
    active = on;
    for (const el of [h1, ...h1.querySelectorAll<HTMLElement>('*')]) {
      if (el === canvas) continue;
      el.style.color = on ? 'transparent' : '';
      el.style.webkitTextStrokeColor = on ? 'transparent' : '';
      el.style.animation = on ? 'none' : '';
      el.style.clipPath = on ? 'none' : '';
    }
    canvas.style.display = on ? 'block' : 'none';
  };

  const build = () => {
    setActive(false); // sample the real computed colors, not 'transparent'
    const box = h1.getBoundingClientRect();
    W = box.width + BLEED * 2;
    H = box.height + BLEED * 2;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Offscreen pass: draw each word where the DOM actually laid it
    // out, with its span's computed color/stroke. A faint outline
    // fill falls under the sampling threshold, so outline-styled
    // words become stroke-only particles — matching their look.
    const off = document.createElement('canvas');
    off.width = Math.ceil(W); off.height = Math.ceil(H);
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return;
    octx.textBaseline = 'middle';

    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      const text = node.textContent || '';
      if (!parent || !text.trim()) continue;
      const cs = getComputedStyle(parent);
      octx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ('letterSpacing' in octx && cs.letterSpacing !== 'normal')
        (octx as any).letterSpacing = cs.letterSpacing;
      const strokeW = parseFloat(cs.webkitTextStrokeWidth || '0');
      for (const m of text.matchAll(/\S+/g)) {
        range.setStart(node, m.index!);
        range.setEnd(node, m.index! + m[0].length);
        const r = range.getBoundingClientRect();
        const x = r.left - box.left + BLEED;
        const y = r.top - box.top + BLEED + r.height / 2;
        octx.fillStyle = cs.color;
        octx.fillText(m[0], x, y);
        if (strokeW > 0) {
          octx.lineWidth = strokeW * 2; // canvas centers strokes; CSS text-stroke reads as ~2x
          octx.strokeStyle = cs.webkitTextStrokeColor;
          octx.strokeText(m[0], x, y);
        }
      }
    }

    const img = octx.getImageData(0, 0, off.width, off.height).data;
    const old = particles;
    particles = [];
    let i = 0;
    for (let py = 0; py < off.height; py += GAP) {
      for (let px = 0; px < off.width; px += GAP) {
        const a = img[(py * off.width + px) * 4 + 3];
        if (a < 40) continue;
        const o = (py * off.width + px) * 4;
        const prev = old[i++];
        particles.push({
          // reuse previous positions on rebuild (resize) so the swarm
          // glides to the new layout instead of re-scattering
          x: prev ? prev.x : Math.random() * W,
          y: prev ? prev.y : Math.random() * H,
          vx: 0, vy: 0,
          hx: px, hy: py,
          // floor the alpha so faint edge/outline pixels still read
          // as solid dots (brighter, more legible than the raw sample)
          c: `rgba(${img[o]},${img[o + 1]},${img[o + 2]},${Math.min(1, a / 255 + 0.35).toFixed(2)})`,
        });
      }
    }
    setActive(true);
  };

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible || !active) return;
    ctx!.clearRect(0, 0, W, H);
    const R2 = RADIUS * RADIUS;
    for (const p of particles) {
      const dx = p.x - mx, dy = p.y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const d = Math.sqrt(d2) || 1;
        const f = (RADIUS - d) / RADIUS;
        p.vx += (dx / d) * f * PUSH;
        p.vy += (dy / d) * f * PUSH;
      }
      p.vx = (p.vx + (p.hx - p.x) * RETURN) * FRICTION;
      p.vy = (p.vy + (p.hy - p.y) * RETURN) * FRICTION;
      p.x += p.vx;
      p.y += p.vy;
      ctx!.fillStyle = p.c;
      ctx!.fillRect(p.x, p.y, DOT, DOT);
    }
  };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  };
  const onLeave = () => { mx = -9999; my = -9999; };

  // below the desktop breakpoint, hand rendering back to the DOM heading
  let resizeT = 0;
  const onResize = () => {
    clearTimeout(resizeT);
    resizeT = window.setTimeout(() => {
      if (fine.matches) build();
      else setActive(false);
    }, 200);
  };

  // pause the loop while the heading is scrolled out of view
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(h1);

  document.fonts.ready.then(() => {
    build();
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(tick);
  });

  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    window.removeEventListener('resize', onResize);
  }, { once: true });
}
