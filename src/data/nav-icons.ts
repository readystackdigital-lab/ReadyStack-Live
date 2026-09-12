/* ═══════════════════════════════════════════════════════════
   nav-icons.ts — one line-icon set for every nav surface: the
   header links, the hamburger drawer and the mobile tab bar.
   24 grid, 1.7 stroke, currentColor, so a drawing serves any
   size and any tint.

   hue is the colour the header gives that destination: [dark
   theme, light theme]. The light values are 700-weight so they
   still read on the white nav; the dark ones are 400-weight so
   they glow rather than shout on the dark glass.
═══════════════════════════════════════════════════════════ */

export type NavIcon = { paths: string; hue: [dark: string, light: string] };

export const NAV_ICONS = {
  home: {
    paths: `<path d="M3.5 10.6 12 3.8l8.5 6.8V20a1 1 0 0 1-1 1h-4.6v-6H9.1v6H4.5a1 1 0 0 1-1-1v-9.4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="none"/>`,
    hue: ['#F59E0B', '#A0480A'],
  },
  services: {
    paths: `<path d="M12 3 3.2 7.4 12 11.8l8.8-4.4L12 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="none"/><path d="M3.2 12.2 12 16.6l8.8-4.4M3.2 16.8 12 21.2l8.8-4.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`,
    hue: ['#F59E0B', '#A0480A'],
  },
  industries: {
    paths: `<path d="M2.8 21h18.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M6 21V6.6a1 1 0 0 1 .62-.93l5-2a1 1 0 0 1 1.38.93V21" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="none"/><path d="M13 11.4l4.4 1.76a1 1 0 0 1 .6.93V21" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="none"/>`,
    hue: ['#34D399', '#047857'],
  },
  pricing: {
    paths: `<path d="M20.4 12.6 12.6 20.4a1.8 1.8 0 0 1-2.55 0l-6.45-6.45a1.8 1.8 0 0 1-.52-1.4l.38-5.72a1.8 1.8 0 0 1 1.68-1.68l5.72-.38a1.8 1.8 0 0 1 1.4.52l6.45 6.45a1.8 1.8 0 0 1 0 2.55Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="none"/><circle cx="8.7" cy="8.7" r="1.55" stroke="currentColor" stroke-width="1.6" fill="none"/>`,
    hue: ['#A78BFA', '#6D28D9'],
  },
  howItWorks: {
    paths: `<circle cx="5" cy="6" r="2.2" stroke="currentColor" stroke-width="1.7" fill="none"/><circle cx="19" cy="18" r="2.2" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M7.2 6h6.3a3 3 0 0 1 0 6h-3a3 3 0 0 0 0 6h6.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/>`,
    hue: ['#38BDF8', '#0369A1'],
  },
  faqs: {
    paths: `<circle cx="12" cy="12" r="8.6" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M9.6 9.7a2.4 2.4 0 1 1 3.4 2.2c-.7.35-1 .9-1 1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/><circle cx="12" cy="16.6" r=".95" fill="currentColor"/>`,
    hue: ['#FB923C', '#C2410C'],
  },
  contact: {
    paths: `<path d="M20.8 11.6a7.9 7.9 0 0 1-8.4 7.9 8.6 8.6 0 0 1-3.55-.72L4.2 20.4l1.42-4.15A7.9 7.9 0 0 1 4.6 11.6 7.9 7.9 0 0 1 12.7 3.7a7.9 7.9 0 0 1 8.1 7.9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="none"/>`,
    hue: ['#FB7185', '#BE123C'],
  },
  social: {
    paths: `<path d="M4 10.5v3A1.5 1.5 0 0 0 5.5 15H8l7 4V5L8 9H5.5A1.5 1.5 0 0 0 4 10.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" fill="none"/><path d="M18.4 9.4a3.6 3.6 0 0 1 0 5.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/><path d="M8.5 15.2v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    hue: ['#F472B6', '#BE185D'],
  },
  blog: {
    paths: `<rect x="4" y="3.5" width="16" height="17" rx="2.4" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M8 8.5h8M8 12h8M8 15.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
    hue: ['#2DD4BF', '#0F766E'],
  },
} satisfies Record<string, NavIcon>;

export type NavIconKey = keyof typeof NAV_ICONS;
