// Hand-drawn SVG picture cards, part 1 (words introduced on planets 1-5).
// Every drawing lives in a 100x100 viewBox and is wrapped with the shared
// chunky-outline group by assets.js. Style: thick #1e1e46 outlines, bold flat fills.

export const PICTURES_1 = {
  sun: `
    <circle cx="50" cy="50" r="20" fill="#ffd75e"/>
    <g stroke-width="6">
      <line x1="50" y1="14" x2="50" y2="24"/><line x1="50" y1="76" x2="50" y2="86"/>
      <line x1="14" y1="50" x2="24" y2="50"/><line x1="76" y1="50" x2="86" y2="50"/>
      <line x1="25" y1="25" x2="32" y2="32"/><line x1="68" y1="68" x2="75" y2="75"/>
      <line x1="75" y1="25" x2="68" y2="32"/><line x1="32" y1="68" x2="25" y2="75"/>
    </g>
    <circle cx="43" cy="47" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="57" cy="47" r="2.5" fill="#1e1e46" stroke="none"/>
    <path d="M42 56 Q50 62 58 56" fill="none"/>`,

  sock: `
    <path d="M36 14 h24 v32 c0 5 2 8 6 11 l7 6 c7 6 3 17 -7 17 h-12 c-11 0 -18 -7 -18 -18 z" fill="#f25c54"/>
    <rect x="34" y="10" width="28" height="12" rx="4" fill="#f5f5f5"/>
    <path d="M40 62 q6 6 14 7" fill="none" stroke="#8c2f2a"/>
    <path d="M40 30 h16 M40 40 h16" stroke="#8c2f2a" stroke-width="3.5"/>`,

  ant: `
    <ellipse cx="26" cy="58" rx="12" ry="10" fill="#7a4a2b"/>
    <circle cx="48" cy="56" r="9" fill="#7a4a2b"/>
    <ellipse cx="70" cy="52" rx="12" ry="11" fill="#7a4a2b"/>
    <path d="M74 44 q4 -10 12 -13 M66 43 q-1 -10 4 -16" fill="none"/>
    <circle cx="88" cy="30" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="72" cy="26" r="3" fill="#1e1e46" stroke="none"/>
    <path d="M22 66 l-6 12 M30 67 l0 13 M44 64 l-6 14 M52 64 l2 14" fill="none" stroke-width="4"/>
    <circle cx="74" cy="50" r="2.5" fill="#f5f5f5" stroke="none"/>`,

  apple: `
    <path d="M50 30 C30 22 18 38 22 56 C25 72 38 84 50 84 C62 84 75 72 78 56 C82 38 70 22 50 30 Z" fill="#f25c54"/>
    <path d="M50 28 q-2 -10 4 -16" fill="none" stroke-width="5"/>
    <path d="M54 20 q14 -6 16 6 q-12 6 -16 -6 z" fill="#7ac74f"/>
    <path d="M36 44 q-4 8 -2 16" fill="none" stroke="#ffffff" stroke-opacity="0.6"/>`,

  tap: `
    <circle cx="44" cy="14" r="6" fill="#8b9bb8"/>
    <path d="M32 14 h24 M44 14 v-8 M44 14 v8" fill="none" stroke-width="5"/>
    <rect x="38" y="22" width="12" height="10" fill="#b8c0d0"/>
    <path d="M20 32 h38 q18 0 18 20 v8 h-14 v-6 q0 -8 -8 -8 h-34 q-6 0 -6 -7 q0 -7 6 -7 z" fill="#b8c0d0"/>
    <path d="M20 39 h6" stroke="#8b9bb8" stroke-width="4"/>
    <path d="M65 66 q-2 8 2 12 q5 -4 2 -12 z" fill="#4cc9f0" stroke-width="3.5"/>
    <path d="M60 84 q-2 5 1 8 q4 -3 2 -8 z" fill="#4cc9f0" stroke-width="3"/>
    <path d="M72 86 q-2 4 1 7 q4 -2 2 -7 z" fill="#4cc9f0" stroke-width="3"/>`,

  pig: `
    <circle cx="50" cy="54" r="28" fill="#f7a1c4"/>
    <path d="M28 34 l-4 -14 14 6 z" fill="#f7a1c4"/>
    <path d="M72 34 l4 -14 -14 6 z" fill="#f7a1c4"/>
    <ellipse cx="50" cy="60" rx="13" ry="9" fill="#f27db4"/>
    <circle cx="45" cy="60" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="55" cy="60" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="39" cy="46" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="61" cy="46" r="3" fill="#1e1e46" stroke="none"/>`,

  pan: `
    <ellipse cx="42" cy="58" rx="26" ry="18" fill="#5a5a78"/>
    <ellipse cx="42" cy="52" rx="26" ry="14" fill="#7c7c9c"/>
    <ellipse cx="42" cy="52" rx="18" ry="8" fill="#5a5a78"/>
    <rect x="66" y="46" width="26" height="10" rx="5" fill="#b5793c"/>`,

  igloo: `
    <path d="M14 70 a36 34 0 0 1 72 0 z" fill="#eaf6ff"/>
    <path d="M26 70 v-16 M40 70 v-22 M60 70 v-22 M74 70 v-16 M22 54 h56 M30 40 h40" fill="none" stroke-width="3.5"/>
    <path d="M38 70 a12 14 0 0 1 24 0 z" fill="#4cc9f0"/>
    <line x1="10" y1="70" x2="90" y2="70"/>`,

  net: `
    <line x1="16" y1="90" x2="44" y2="54" stroke="#b5793c" stroke-width="8"/>
    <line x1="16" y1="90" x2="44" y2="54" stroke-width="3" stroke-opacity="0.35"/>
    <circle cx="62" cy="34" r="25" fill="#eaf6ff" fill-opacity="0.35"/>
    <path d="M46 18 q16 14 32 32 M40 30 q20 10 44 8 M56 11 q6 22 2 46" fill="none" stroke-width="2.5"/>
    <path d="M52 55 q4 -22 -4 -34 M72 53 q12 -14 12 -28" fill="none" stroke-width="2.5"/>
    <circle cx="62" cy="34" r="25" fill="none" stroke-width="5.5"/>
    <ellipse cx="24" cy="24" rx="7" ry="10" transform="rotate(-30 24 24)" fill="#f7a1c4"/>
    <ellipse cx="14" cy="30" rx="6" ry="9" transform="rotate(-50 14 30)" fill="#f7a1c4"/>
    <path d="M20 30 l4 -6" fill="none" stroke-width="3"/>`,

  nest: `
    <path d="M20 56 a30 22 0 0 0 60 0 z" fill="#b5793c"/>
    <path d="M22 60 q28 12 56 0 M26 68 q24 10 48 0" fill="none" stroke="#7a4a2b" stroke-width="3.5"/>
    <ellipse cx="40" cy="48" rx="9" ry="11" fill="#eaf6ff"/>
    <ellipse cx="60" cy="48" rx="9" ry="11" fill="#ffe9b8"/>
    <path d="M18 56 h64" fill="none"/>`,

  moon: `
    <path d="M62 12 a40 40 0 1 0 26 62 a34 34 0 0 1 -26 -62 z" fill="#ffe9b8"/>
    <circle cx="46" cy="36" r="5" fill="#ecd39c" stroke-width="3"/>
    <circle cx="38" cy="58" r="7" fill="#ecd39c" stroke-width="3"/>
    <circle cx="54" cy="74" r="4" fill="#ecd39c" stroke-width="3"/>`,

  mouse: `
    <circle cx="34" cy="30" r="12" fill="#c9c9dd"/>
    <circle cx="66" cy="30" r="12" fill="#c9c9dd"/>
    <circle cx="34" cy="30" r="5" fill="#f7a1c4" stroke-width="3"/>
    <circle cx="66" cy="30" r="5" fill="#f7a1c4" stroke-width="3"/>
    <path d="M22 62 a28 24 0 0 1 56 0 a28 18 0 0 1 -56 0 z" fill="#c9c9dd"/>
    <circle cx="40" cy="56" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="60" cy="56" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="50" cy="66" r="4" fill="#f27db4"/>
    <path d="M78 70 q14 4 10 16" fill="none"/>`,

  dog: `
    <circle cx="50" cy="50" r="26" fill="#d9a066"/>
    <path d="M28 34 q-12 2 -10 20 q0 8 8 6 l6 -10 z" fill="#7a4a2b"/>
    <path d="M72 34 q12 2 10 20 q0 8 -8 6 l-6 -10 z" fill="#7a4a2b"/>
    <circle cx="41" cy="45" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="59" cy="45" r="3" fill="#1e1e46" stroke="none"/>
    <ellipse cx="50" cy="58" rx="7" ry="5" fill="#1e1e46"/>
    <path d="M50 63 v6 M50 69 q-6 8 -12 3 M50 69 q6 8 12 3" fill="none"/>
    <path d="M46 76 q4 8 10 2 l-2 -6 z" fill="#f27db4" stroke-width="3.5"/>`,

  duck: `
    <path d="M20 62 q0 20 26 20 q30 0 32 -22 l-12 2 q-4 -6 2 -12 q4 -18 -14 -18 q-16 0 -16 16 q0 8 6 12 q-24 -6 -24 2 z" fill="#ffd75e"/>
    <path d="M54 40 l16 -2 q6 4 0 8 l-14 0 z" fill="#ff9d5c"/>
    <circle cx="48" cy="36" r="3" fill="#1e1e46" stroke="none"/>
    <path d="M30 64 q8 8 18 6" fill="none" stroke="#c9a233"/>
    <path d="M12 88 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 18 0" fill="none" stroke="#4cc9f0"/>`,

  goat: `
    <path d="M34 22 q-10 -8 -8 -18 q10 2 14 12 M66 22 q10 -8 8 -18 q-10 2 -14 12" fill="#d9a066"/>
    <ellipse cx="50" cy="50" rx="24" ry="27" fill="#f0ead8"/>
    <path d="M24 40 l-10 8 6 8 8 -8 M76 40 l10 8 -6 8 -8 -8" fill="#f0ead8"/>
    <circle cx="42" cy="46" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="58" cy="46" r="3" fill="#1e1e46" stroke="none"/>
    <ellipse cx="50" cy="62" rx="10" ry="8" fill="#e3d3b3"/>
    <circle cx="46" cy="61" r="2" fill="#1e1e46" stroke="none"/>
    <circle cx="54" cy="61" r="2" fill="#1e1e46" stroke="none"/>
    <path d="M46 76 q4 10 8 0 q-2 10 -4 12 q-2 -2 -4 -12 z" fill="#f0ead8"/>`,

  octopus: `
    <path d="M26 46 a24 26 0 0 1 48 0 v10 h-48 z" fill="#b07fe0"/>
    <circle cx="41" cy="42" r="5" fill="#ffffff"/>
    <circle cx="59" cy="42" r="5" fill="#ffffff"/>
    <circle cx="41" cy="43" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="59" cy="43" r="2.5" fill="#1e1e46" stroke="none"/>
    <path d="M44 54 q6 5 12 0" fill="none"/>
    <path d="M28 56 q-6 16 -14 18 q10 8 18 -4 M42 58 q-2 16 -10 22 q12 4 16 -12 M58 58 q2 16 10 22 q-12 4 -16 -12 M72 56 q6 16 14 18 q-10 8 -18 -4" fill="#9a63cf"/>`,

  cat: `
    <path d="M28 36 l-4 -18 14 8 M72 36 l4 -18 -14 8" fill="#c9c9dd"/>
    <circle cx="50" cy="52" r="26" fill="#c9c9dd"/>
    <path d="M40 46 l0 2 M60 46 l0 2" stroke-width="6"/>
    <path d="M46 60 l4 3 4 -3 -4 -3 z" fill="#f27db4" stroke-width="3.5"/>
    <path d="M50 63 v4 M50 67 q-5 6 -11 2 M50 67 q5 6 11 2" fill="none"/>
    <path d="M24 56 l-12 -2 M25 62 l-11 3 M76 56 l12 -2 M75 62 l11 3" fill="none" stroke-width="3"/>`,

  car: `
    <path d="M12 62 v-10 q0 -4 6 -5 l8 -2 q6 -12 18 -12 h12 q12 0 18 12 l8 2 q6 1 6 5 v10 q0 4 -4 4 h-68 q-4 0 -4 -4 z" fill="#f25c54"/>
    <path d="M32 45 q5 -8 13 -8 h4 v8 z M55 37 h4 q8 0 12 8 h-16 z" fill="#bfe8f9"/>
    <circle cx="30" cy="68" r="9" fill="#3a3a5e"/>
    <circle cx="70" cy="68" r="9" fill="#3a3a5e"/>
    <circle cx="30" cy="68" r="3.5" fill="#b8c0d0" stroke-width="3"/>
    <circle cx="70" cy="68" r="3.5" fill="#b8c0d0" stroke-width="3"/>`,

  kite: `
    <path d="M50 8 L74 40 L50 66 L26 40 Z" fill="#4cc9f0"/>
    <path d="M50 8 L50 66 M26 40 L74 40" fill="none" stroke-width="3.5"/>
    <path d="M50 66 q-6 10 2 16 q-8 6 -4 14" fill="none" stroke-width="3"/>
    <path d="M46 80 l-6 -4 0 8 z M44 94 l-6 -4 0 8 z" fill="#f25c54" stroke-width="3"/>
    <path d="M50 8 L74 40 L50 40 Z" fill="#8adcf7" stroke="none"/>
    <path d="M50 8 L74 40 L50 66 L26 40 Z" fill="none"/>`,

  key: `
    <circle cx="32" cy="34" r="16" fill="#ffd75e"/>
    <circle cx="32" cy="34" r="6" fill="#0a0a2e" fill-opacity="0" stroke-width="4.5"/>
    <path d="M43 45 L74 76 M74 76 l8 -8 M64 66 l8 -8" fill="none" stroke-width="7"/>
    <path d="M43 45 L74 76" fill="none" stroke="#ffd75e" stroke-width="4"/>`,

  rock: `
    <path d="M22 74 l6 -26 16 -14 26 4 12 20 -4 16 z" fill="#9aa3b8"/>
    <path d="M44 34 l8 18 -14 22 M52 52 l22 -14 M52 52 l16 22" fill="none" stroke="#6d7690" stroke-width="3.5"/>
    <line x1="16" y1="74" x2="84" y2="74"/>`,

  egg: `
    <path d="M50 12 C66 12 76 34 76 54 C76 72 65 84 50 84 C35 84 24 72 24 54 C24 34 34 12 50 12 Z" fill="#fdf6e3"/>
    <path d="M38 32 q-6 10 -6 22" fill="none" stroke="#e3d3b3"/>
    <circle cx="58" cy="30" r="2.5" fill="#e3d3b3" stroke="none"/>
    <circle cx="62" cy="48" r="2.5" fill="#e3d3b3" stroke="none"/>
    <circle cx="42" cy="62" r="2.5" fill="#e3d3b3" stroke="none"/>`,

  umbrella: `
    <path d="M12 48 a38 38 0 0 1 76 0 z" fill="#f25c54"/>
    <path d="M12 48 q9 -8 19 0 q9 -8 19 0 q9 -8 19 0 q9 -8 19 0" fill="none"/>
    <path d="M50 10 v-4 M31 48 q9 -38 19 -38 q10 0 19 38" fill="none" stroke-width="3.5"/>
    <path d="M50 48 v34 q0 10 -9 10 q-8 0 -8 -8" fill="none" stroke-width="6"/>`,

  rat: `
    <path d="M14 64 q-12 2 -10 12 q2 8 10 6" fill="none" stroke="#f7a1c4" stroke-width="5"/>
    <path d="M16 62 q0 -24 32 -24 q20 0 32 12 l12 10 q2 3 -2 5 l-14 3 q-10 10 -28 10 h-14 q-18 0 -18 -16 z" fill="#9aa3b8"/>
    <circle cx="60" cy="36" r="9" fill="#9aa3b8"/>
    <circle cx="60" cy="36" r="4" fill="#f7a1c4" stroke-width="2.5"/>
    <circle cx="72" cy="52" r="2.8" fill="#1e1e46" stroke="none"/>
    <circle cx="91" cy="61" r="3.5" fill="#f7a1c4" stroke-width="3"/>
    <path d="M86 64 l8 3 M86 60 l9 -1" fill="none" stroke-width="2.2"/>
    <ellipse cx="36" cy="80" rx="7" ry="4" fill="#8891a8"/>
    <ellipse cx="58" cy="80" rx="7" ry="4" fill="#8891a8"/>`,

  rocket: `
    <path d="M50 6 C62 14 68 30 68 48 L68 66 L32 66 L32 48 C32 30 38 14 50 6 Z" fill="#e8edf5"/>
    <path d="M50 6 C57 11 62 20 65 30 L35 30 C38 20 43 11 50 6 Z" fill="#f25c54"/>
    <circle cx="50" cy="44" r="9" fill="#4cc9f0"/>
    <path d="M32 50 L18 70 L32 66 Z M68 50 L82 70 L68 66 Z" fill="#f25c54"/>
    <path d="M42 66 q8 6 16 0 l-3 10 q-5 4 -10 0 z" fill="#ff9d5c"/>
    <path d="M46 80 q4 10 8 0 q-2 8 -4 12 q-2 -4 -4 -12 z" fill="#ffd75e"/>`,

  hat: `
    <ellipse cx="50" cy="64" rx="36" ry="12" fill="#ffd75e"/>
    <path d="M26 62 q0 -34 24 -34 q24 0 24 34 q-12 6 -24 6 q-12 0 -24 -6 z" fill="#ffd75e"/>
    <path d="M26 58 q24 10 48 0" fill="none" stroke="#f25c54" stroke-width="7"/>`,

  ball: `
    <circle cx="50" cy="50" r="34" fill="#f5f5f5"/>
    <path d="M50 16 a34 34 0 0 1 0 68 a52 52 0 0 0 0 -68 z" fill="#f25c54"/>
    <path d="M50 16 a34 34 0 0 0 0 68 a52 52 0 0 1 0 -68 z" fill="#4cc9f0"/>
    <circle cx="50" cy="50" r="34" fill="none"/>`,

  bus: `
    <rect x="10" y="26" width="80" height="44" rx="8" fill="#ffd75e"/>
    <rect x="18" y="34" width="14" height="14" rx="3" fill="#bfe8f9"/>
    <rect x="38" y="34" width="14" height="14" rx="3" fill="#bfe8f9"/>
    <rect x="58" y="34" width="14" height="14" rx="3" fill="#bfe8f9"/>
    <path d="M10 56 h80" fill="none"/>
    <circle cx="28" cy="72" r="8" fill="#3a3a5e"/>
    <circle cx="72" cy="72" r="8" fill="#3a3a5e"/>
    <circle cx="28" cy="72" r="3" fill="#b8c0d0" stroke-width="3"/>
    <circle cx="72" cy="72" r="3" fill="#b8c0d0" stroke-width="3"/>`,

  fox: `
    <path d="M26 26 l-6 -18 18 10 M74 26 l6 -18 -18 10" fill="#ff9d5c"/>
    <path d="M50 20 q26 0 28 26 q0 22 -28 34 q-28 -12 -28 -34 q2 -26 28 -26 z" fill="#ff9d5c"/>
    <path d="M50 80 q-16 -8 -22 -22 q10 8 22 8 q12 0 22 -8 q-6 14 -22 22 z" fill="#f5f5f5" stroke-width="4"/>
    <circle cx="40" cy="46" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="60" cy="46" r="3" fill="#1e1e46" stroke="none"/>
    <path d="M46 62 l4 4 4 -4 z" fill="#1e1e46"/>`,

  fish: `
    <path d="M18 50 q14 -22 40 -22 q20 0 26 22 q-6 22 -26 22 q-26 0 -40 -22 z" fill="#ff9d5c"/>
    <path d="M22 50 l-12 -14 v28 z" fill="#ffd75e"/>
    <path d="M50 30 q8 10 8 20 q0 10 -8 20 M64 32 q6 8 6 18 q0 10 -6 18" fill="none" stroke="#e07b3a"/>
    <circle cx="72" cy="46" r="3.5" fill="#1e1e46" stroke="none"/>
    <circle cx="90" cy="30" r="3" fill="none" stroke-width="3"/>
    <circle cx="94" cy="20" r="2" fill="none" stroke-width="2.5"/>`,

  leaf: `
    <path d="M50 10 C78 22 82 58 54 86 C26 62 24 26 50 10 Z" fill="#7ac74f"/>
    <path d="M52 20 Q52 55 54 84 M52 34 q-10 4 -14 12 M53 48 q10 2 16 10 M52 60 q-8 4 -12 10" fill="none" stroke="#4d9930"/>
    <path d="M54 86 q-2 6 -6 8" fill="none"/>`,

  bell: `
    <path d="M50 14 q4 0 4 6 q22 6 22 32 v10 l8 10 h-68 l8 -10 v-10 q0 -26 22 -32 q0 -6 4 -6 z" fill="#ffd75e"/>
    <circle cx="50" cy="82" r="7" fill="#c9a233"/>
    <path d="M32 40 q4 -12 14 -14" fill="none" stroke="#ffffff" stroke-opacity="0.7" stroke-width="4"/>`,

  shell: `
    <path d="M50 84 L20 46 A34 34 0 0 1 80 46 Z" fill="#f7a1c4"/>
    <path d="M50 84 L34 38 M50 84 L50 30 M50 84 L66 38" fill="none" stroke="#d1699c" stroke-width="3.5"/>
    <path d="M20 46 a34 34 0 0 1 60 0" fill="none"/>`,

  dress: `
    <path d="M38 12 h24 l-4 16 h-16 z" fill="#b07fe0"/>
    <path d="M38 12 q-8 8 -6 16 l10 0 M62 12 q8 8 6 16 l-10 0" fill="#b07fe0"/>
    <path d="M42 28 h16 l4 14 q14 24 10 44 h-44 q-4 -20 10 -44 z" fill="#b07fe0"/>
    <path d="M40 44 q10 6 20 0" fill="none" stroke="#8b57bd"/>
    <circle cx="50" cy="56" r="2.5" fill="#ffd75e" stroke="none"/>
    <circle cx="46" cy="70" r="2.5" fill="#ffd75e" stroke="none"/>
    <circle cx="54" cy="70" r="2.5" fill="#ffd75e" stroke="none"/>`,

  grass: `
    <path d="M20 84 q-4 -24 -8 -30 q10 4 14 26 M32 84 q-2 -30 -8 -40 q12 6 16 36 M48 84 q0 -34 -4 -44 q10 8 12 44 M62 84 q2 -28 10 -38 q-2 16 -4 38 M76 84 q4 -22 12 -28 q-4 12 -6 28" fill="#7ac74f"/>
    <line x1="10" y1="84" x2="90" y2="84"/>`,

  cliff: `
    <circle cx="82" cy="18" r="8" fill="#ffd75e"/>
    <path d="M10 90 V32 q0 -8 8 -8 h22 l6 10 -5 9 7 10 -4 11 6 11 v15 z" fill="#b5793c"/>
    <path d="M10 32 q0 -8 8 -8 h22 l6 10 -2 4 -34 2 z" fill="#7ac74f"/>
    <path d="M22 22 q0 -6 3 -8 M32 22 q0 -7 4 -9" fill="none" stroke="#4d9930" stroke-width="3.5"/>
    <path d="M16 48 h18 M16 62 h22 M16 76 h20" fill="none" stroke="#7a4a2b" stroke-width="3.5"/>
    <path d="M56 78 q9 -7 18 0 q9 7 18 0 M62 88 q9 -7 18 0 q7 6 14 1" fill="none" stroke="#4cc9f0" stroke-width="4.5"/>`,
};
