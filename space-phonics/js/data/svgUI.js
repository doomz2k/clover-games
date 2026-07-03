// Hand-drawn SVG UI assets: spaceship (body + separate thruster flame layer),
// cargo crate, rating star, lock and sound-preview icon.

export const UI_SVGS = {
  // Side-on delivery ship, nose pointing right. Cargo bays are drawn by the
  // game on top of the hull, so the hull is left clean in the middle.
  ship_body: `
    <path d="M10 50 Q10 30 30 27 L74 27 Q92 34 96 50 Q92 66 74 73 L30 73 Q10 70 10 50 Z" fill="#e8edf5"/>
    <path d="M74 27 Q92 34 96 50 Q92 66 74 73 Z" fill="#f25c54"/>
    <circle cx="80" cy="50" r="7" fill="#4cc9f0"/>
    <path d="M22 27 L10 12 L30 20 Z" fill="#f25c54"/>
    <path d="M22 73 L10 88 L30 80 Z" fill="#f25c54"/>
    <path d="M10 42 h8 M10 58 h8" fill="none" stroke="#9aa3b8" stroke-width="4"/>
    <path d="M30 27 L74 27 M30 73 L74 73" fill="none" stroke-width="4"/>
    <rect x="6" y="40" width="8" height="20" rx="4" fill="#5a5a78"/>`,

  ship_flame: `
    <path d="M88 50 Q60 30 20 42 Q40 50 20 58 Q60 70 88 50 Z" fill="#ff9d5c" stroke="none"/>
    <path d="M80 50 Q60 40 36 46 Q46 50 36 54 Q60 60 80 50 Z" fill="#ffd75e" stroke="none"/>`,

  crate: `
    <rect x="14" y="14" width="72" height="72" rx="10" fill="#b5793c"/>
    <rect x="14" y="14" width="72" height="72" rx="10" fill="none" stroke-width="6"/>
    <path d="M14 36 h72 M14 64 h72 M36 14 v72 M64 14 v72" fill="none" stroke="#7a4a2b" stroke-width="5"/>
    <path d="M20 20 L80 80 M80 20 L20 80" fill="none" stroke="#7a4a2b" stroke-width="5"/>
    <circle cx="50" cy="50" r="13" fill="#ffd75e" stroke-width="5"/>
    <path d="M45 50 l4 4 7 -8" fill="none" stroke-width="4"/>`,

  ui_star: `
    <path d="M50 6 L62 37 L94 39 L69 60 L78 92 L50 74 L22 92 L31 60 L6 39 L38 37 Z" fill="#ffd75e"/>
    <path d="M50 18 L58 39 L44 42 Z" fill="#ffffff" fill-opacity="0.55" stroke="none"/>`,

  ui_star_empty: `
    <path d="M50 6 L62 37 L94 39 L69 60 L78 92 L50 74 L22 92 L31 60 L6 39 L38 37 Z" fill="#2a2a5e" stroke="#4a4a8e"/>`,

  lock: `
    <path d="M30 44 v-12 a20 20 0 0 1 40 0 v12" fill="none" stroke-width="9"/>
    <rect x="20" y="42" width="60" height="46" rx="12" fill="#ffd75e"/>
    <circle cx="50" cy="60" r="7" fill="#1e1e46" stroke="none"/>
    <rect x="46" y="62" width="8" height="14" rx="4" fill="#1e1e46" stroke="none"/>`,

  sound: `
    <path d="M14 40 h14 l18 -18 v56 l-18 -18 h-14 z" fill="#ffd75e"/>
    <path d="M58 36 q8 14 0 28 M70 26 q14 24 0 48 M82 18 q20 32 0 64" fill="none" stroke-width="7"/>`,
};
