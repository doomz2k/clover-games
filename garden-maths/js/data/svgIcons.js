// Small SVG icon set for Garden Maths: plant-need indicators, stars, lock
// and the sound icon. Same chunky style as the other Clover Games.

export const ICON_SVGS = {
  icon_sun: `
    <circle cx="50" cy="50" r="22" fill="#ffd75e"/>
    <g stroke-width="7">
      <line x1="50" y1="12" x2="50" y2="24"/><line x1="50" y1="76" x2="50" y2="88"/>
      <line x1="12" y1="50" x2="24" y2="50"/><line x1="76" y1="50" x2="88" y2="50"/>
      <line x1="23" y1="23" x2="31" y2="31"/><line x1="69" y1="69" x2="77" y2="77"/>
      <line x1="77" y1="23" x2="69" y2="31"/><line x1="31" y1="69" x2="23" y2="77"/>
    </g>`,

  icon_drop: `
    <path d="M50 10 C64 34 76 48 76 64 A26 26 0 0 1 24 64 C24 48 36 34 50 10 Z" fill="#4cc9f0"/>
    <path d="M36 62 a14 14 0 0 0 10 16" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="5"/>`,

  icon_orb: `
    <circle cx="50" cy="54" r="26" fill="#7ac74f"/>
    <path d="M50 28 q-4 -12 4 -18 q8 8 -1 18 z" fill="#4d9930"/>
    <circle cx="42" cy="48" r="6" fill="#a9e084" stroke="none"/>
    <path d="M56 66 a18 18 0 0 0 10 -14" fill="none" stroke="#4d9930" stroke-width="4"/>`,

  icon_bug: `
    <circle cx="50" cy="34" r="12" fill="#5a5a78"/>
    <path d="M42 26 q-6 -6 -4 -12 M58 26 q6 -6 4 -12" fill="none" stroke-width="4"/>
    <ellipse cx="50" cy="62" rx="24" ry="22" fill="#b07fe0"/>
    <line x1="50" y1="42" x2="50" y2="82"/>
    <circle cx="40" cy="56" r="4" fill="#1e1e46" stroke="none"/>
    <circle cx="60" cy="56" r="4" fill="#1e1e46" stroke="none"/>
    <circle cx="45" cy="31" r="2.5" fill="#f5f5f5" stroke="none"/>
    <circle cx="55" cy="31" r="2.5" fill="#f5f5f5" stroke="none"/>
    <path d="M28 52 l-10 -4 M28 64 l-10 2 M72 52 l10 -4 M72 64 l10 2" fill="none" stroke-width="4"/>`,

  ui_star: `
    <path d="M50 6 L62 37 L94 39 L69 60 L78 92 L50 74 L22 92 L31 60 L6 39 L38 37 Z" fill="#ffd75e"/>
    <path d="M50 18 L58 39 L44 42 Z" fill="#ffffff" fill-opacity="0.55" stroke="none"/>`,

  ui_star_empty: `
    <path d="M50 6 L62 37 L94 39 L69 60 L78 92 L50 74 L22 92 L31 60 L6 39 L38 37 Z" fill="#2e4d28" stroke="#4a7c3f"/>`,

  lock: `
    <path d="M30 44 v-12 a20 20 0 0 1 40 0 v12" fill="none" stroke-width="9"/>
    <rect x="20" y="42" width="60" height="46" rx="12" fill="#ffd75e"/>
    <circle cx="50" cy="60" r="7" fill="#1e1e46" stroke="none"/>
    <rect x="46" y="62" width="8" height="14" rx="4" fill="#1e1e46" stroke="none"/>`,

  sound: `
    <path d="M14 40 h14 l18 -18 v56 l-18 -18 h-14 z" fill="#ffd75e"/>
    <path d="M58 36 q8 14 0 28 M70 26 q14 24 0 48 M82 18 q20 32 0 64" fill="none" stroke-width="7"/>`,
};
