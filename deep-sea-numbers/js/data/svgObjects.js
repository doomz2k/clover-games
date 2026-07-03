// Hand-drawn SVG assets for Deep Sea Numbers: the six counting-object
// species (readable at ~48px) plus game UI (submarine, treasure chest,
// pearl, rating stars, lock, sound icon). Same chunky-outline style as the
// rest of Clover Games: 100x100 viewBox, thick #1e1e46 strokes, flat fills.

export const OBJECT_SVGS = {
  obj_starfish: `
    <path d="M50 8 L62 36 L92 40 L69 60 L76 90 L50 73 L24 90 L31 60 L8 40 L38 36 Z" fill="#ff9d5c"/>
    <circle cx="44" cy="46" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="58" cy="46" r="3" fill="#1e1e46" stroke="none"/>
    <path d="M44 56 q7 6 14 0" fill="none"/>
    <circle cx="30" cy="44" r="2.5" fill="#e07b3a" stroke="none"/>
    <circle cx="70" cy="44" r="2.5" fill="#e07b3a" stroke="none"/>
    <circle cx="50" cy="24" r="2.5" fill="#e07b3a" stroke="none"/>`,

  obj_fish: `
    <path d="M14 50 q14 -20 38 -20 q22 0 30 20 q-8 20 -30 20 q-24 0 -38 -20 z" fill="#4cc9f0"/>
    <path d="M18 50 l-12 -13 v26 z" fill="#2b9cc4"/>
    <path d="M48 32 q8 8 8 18 q0 10 -8 18" fill="none" stroke="#2b9cc4"/>
    <circle cx="68" cy="46" r="3.5" fill="#1e1e46" stroke="none"/>
    <path d="M72 56 q4 3 8 1" fill="none" stroke-width="3.5"/>`,

  obj_shell: `
    <path d="M50 82 L24 50 A30 30 0 0 1 76 50 Z" fill="#f7a1c4"/>
    <path d="M50 82 L37 44 M50 82 L50 36 M50 82 L63 44" fill="none" stroke="#d1699c" stroke-width="3.5"/>
    <path d="M24 50 a30 30 0 0 1 52 0" fill="none"/>`,

  obj_crab: `
    <path d="M28 34 q-12 -4 -14 -14 q12 -2 20 8 M72 34 q12 -4 14 -14 q-12 -2 -20 8" fill="#f25c54"/>
    <circle cx="16" cy="21" r="6" fill="#f25c54"/>
    <circle cx="84" cy="21" r="6" fill="#f25c54"/>
    <ellipse cx="50" cy="58" rx="28" ry="22" fill="#f25c54"/>
    <path d="M26 72 l-9 8 M74 72 l9 8 M32 78 l-5 9 M68 78 l5 9" fill="none" stroke-width="4.5"/>
    <circle cx="41" cy="52" r="4" fill="#f5f5f5"/>
    <circle cx="59" cy="52" r="4" fill="#f5f5f5"/>
    <circle cx="41" cy="53" r="2" fill="#1e1e46" stroke="none"/>
    <circle cx="59" cy="53" r="2" fill="#1e1e46" stroke="none"/>
    <path d="M43 64 q7 5 14 0" fill="none"/>`,

  obj_pearl: `
    <circle cx="50" cy="50" r="30" fill="#f0eafc"/>
    <circle cx="40" cy="40" r="10" fill="#ffffff" stroke="none"/>
    <path d="M62 66 a22 22 0 0 0 8 -20" fill="none" stroke="#c9b8ec" stroke-width="4"/>`,

  obj_jelly: `
    <path d="M20 48 a30 28 0 0 1 60 0 l0 6 q-7 6 -15 0 q-7 6 -15 0 q-7 6 -15 0 q-8 6 -15 0 z" fill="#b07fe0"/>
    <path d="M30 60 q-3 12 3 22 M45 62 q-2 12 2 24 M58 62 q3 12 -2 24 M70 60 q4 10 0 20" fill="none" stroke="#9a63cf" stroke-width="4.5"/>
    <circle cx="41" cy="40" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="59" cy="40" r="3" fill="#1e1e46" stroke="none"/>
    <path d="M44 50 q6 5 12 0" fill="none"/>`,
};

export const UI_SVGS = {
  // Little yellow submarine, side-on, nose to the right.
  submarine: `
    <ellipse cx="48" cy="54" rx="38" ry="24" fill="#ffd75e"/>
    <path d="M10 46 l-6 -6 v28 l6 -6" fill="#e8b64a"/>
    <rect x="38" y="16" width="18" height="16" rx="5" fill="#e8b64a"/>
    <path d="M56 24 h12" fill="none" stroke-width="6"/>
    <circle cx="34" cy="54" r="8" fill="#4cc9f0"/>
    <circle cx="58" cy="54" r="8" fill="#4cc9f0"/>
    <circle cx="34" cy="54" r="8" fill="none" stroke-width="4"/>
    <circle cx="58" cy="54" r="8" fill="none" stroke-width="4"/>
    <path d="M86 50 q6 4 0 8" fill="none" stroke-width="4"/>`,

  // Open treasure chest (pearls get loaded beside it in the rack).
  chest: `
    <path d="M18 42 h64 v34 q0 8 -8 8 h-48 q-8 0 -8 -8 z" fill="#b5793c"/>
    <path d="M14 30 q36 -18 72 0 l-4 12 h-64 z" fill="#8a5a2a"/>
    <path d="M18 56 h64 M34 42 v42 M66 42 v42" fill="none" stroke="#7a4a2b" stroke-width="4"/>
    <rect x="44" y="50" width="12" height="16" rx="3" fill="#ffd75e"/>
    <circle cx="50" cy="56" r="2.5" fill="#1e1e46" stroke="none"/>
    <path d="M22 36 q28 -12 56 0" fill="none" stroke="#ffd75e" stroke-width="3" stroke-opacity="0.5"/>`,

  ui_star: `
    <path d="M50 6 L62 37 L94 39 L69 60 L78 92 L50 74 L22 92 L31 60 L6 39 L38 37 Z" fill="#ffd75e"/>
    <path d="M50 18 L58 39 L44 42 Z" fill="#ffffff" fill-opacity="0.55" stroke="none"/>`,

  ui_star_empty: `
    <path d="M50 6 L62 37 L94 39 L69 60 L78 92 L50 74 L22 92 L31 60 L6 39 L38 37 Z" fill="#0c3560" stroke="#2a6a9e"/>`,

  lock: `
    <path d="M30 44 v-12 a20 20 0 0 1 40 0 v12" fill="none" stroke-width="9"/>
    <rect x="20" y="42" width="60" height="46" rx="12" fill="#ffd75e"/>
    <circle cx="50" cy="60" r="7" fill="#1e1e46" stroke="none"/>
    <rect x="46" y="62" width="8" height="14" rx="4" fill="#1e1e46" stroke="none"/>`,

  sound: `
    <path d="M14 40 h14 l18 -18 v56 l-18 -18 h-14 z" fill="#ffd75e"/>
    <path d="M58 36 q8 14 0 28 M70 26 q14 24 0 48 M82 18 q20 32 0 64" fill="none" stroke-width="7"/>`,
};

export const ALL_SVGS = { ...OBJECT_SVGS, ...UI_SVGS };
