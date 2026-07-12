/*
  Typewriter text effect — 21st.dev / HextaUI typewriter-text component,
  ported from React to vanilla TS for this Astro (no-React) site.

  Types each string at `speed` ms/char, pauses `delay` ms on completion,
  then (if `loop` or more strings remain) deletes at `deleteSpeed` ms/char
  and types the next. A blinking cursor caret is appended after the text.

  The server-rendered text stays in the DOM (Astro renders it) for SEO;
  this script only takes over the visual content once the element scrolls
  into view, and sets aria-label so assistive tech gets stable text.
*/

const STYLE_ID = 'tw-caret-style';
const DEFAULT_SPEED = 60;
const DEFAULT_DELETE_SPEED = 50;
const DEFAULT_DELAY = 1500;

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .tw-caret {
      display: inline-block;
      margin-left: 1px;
      color: var(--amber, #F59E0B);
      animation: tw-blink 1s steps(1) infinite;
      transition: opacity 0.4s ease;
    }
    .tw-caret::before { content: "|"; }
    .tw-caret.tw-caret-done { opacity: 0; }
    @keyframes tw-blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
  `;
  document.head.appendChild(style);
}

export function typewriter(
  el: HTMLElement | null,
  texts: string[],
  opts: { speed?: number; deleteSpeed?: number; delay?: number; loop?: boolean; startDelay?: number } = {}
) {
  if (!el || texts.length === 0) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const speed = opts.speed ?? DEFAULT_SPEED;
  const deleteSpeed = opts.deleteSpeed ?? DEFAULT_DELETE_SPEED;
  const delay = opts.delay ?? DEFAULT_DELAY;
  const loop = opts.loop ?? false;
  const startDelay = opts.startDelay ?? 0;

  ensureStyle();

  el.setAttribute('aria-label', texts[0]);

  // Prevent layout shift: measure the longest string against the
  // element's own font before swapping in the animated span.
  const longest = texts.reduce((a, b) => (b.length > a.length ? b : a), '');
  const measure = document.createElement('span');
  measure.style.cssText = 'visibility:hidden; white-space:pre; position:absolute;';
  measure.textContent = longest;
  el.appendChild(measure);
  const minWidth = measure.getBoundingClientRect().width;
  el.removeChild(measure);
  if (minWidth > 0) el.style.minWidth = `${minWidth}px`;

  const textSpan = document.createElement('span');
  textSpan.setAttribute('aria-hidden', 'true');
  const caret = document.createElement('span');
  caret.className = 'tw-caret';

  let timer = 0;
  let stopped = false;

  const schedule = (fn: () => void, ms: number) => {
    timer = window.setTimeout(fn, ms);
  };

  const finish = () => {
    caret.classList.add('tw-caret-done');
  };

  const run = (textIndex: number, mode: 'typing' | 'pausing' | 'deleting', charIndex: number) => {
    if (stopped) return;
    const current = texts[textIndex];
    const isLast = textIndex === texts.length - 1;

    if (mode === 'typing') {
      textSpan.textContent = current.slice(0, charIndex);
      if (charIndex < current.length) {
        schedule(() => run(textIndex, 'typing', charIndex + 1), speed);
      } else if (!loop && isLast) {
        schedule(finish, delay);
      } else {
        schedule(() => run(textIndex, 'deleting', current.length), delay);
      }
      return;
    }

    if (mode === 'deleting') {
      textSpan.textContent = current.slice(0, charIndex);
      if (charIndex > 0) {
        schedule(() => run(textIndex, 'deleting', charIndex - 1), deleteSpeed);
      } else {
        const nextIndex = (textIndex + 1) % texts.length;
        schedule(() => run(nextIndex, 'typing', 0), speed);
      }
    }
  };

  const start = () => {
    // Swap in the animated (empty) span only when we're ready to start
    // typing, so the server-rendered text is what shows until then.
    el!.textContent = '';
    el!.append(textSpan, caret);
    schedule(() => run(0, 'typing', 0), 0);
  };

  const begin = () => {
    if (startDelay > 0) schedule(start, startDelay);
    else start();
  };

  const io = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      io.disconnect();
      begin();
    }
  });
  io.observe(el);

  window.addEventListener('pagehide', () => {
    stopped = true;
    clearTimeout(timer);
    io.disconnect();
  }, { once: true });
}
