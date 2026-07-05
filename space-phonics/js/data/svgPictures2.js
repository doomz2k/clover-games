// Hand-drawn SVG picture cards, part 2 (words introduced on planets 6-13).
// Same conventions as part 1: 100x100 viewBox, chunky outlines, flat fills.

export const PICTURES_2 = {
  ship: `
    <path d="M14 62 h72 l-10 20 h-52 z" fill="#b5793c"/>
    <path d="M20 66 h60 M24 72 h52" fill="none" stroke="#7a4a2b" stroke-width="3"/>
    <line x1="50" y1="62" x2="50" y2="10"/>
    <path d="M50 14 q-26 6 -24 30 l24 0 z" fill="#f5f5f5"/>
    <path d="M54 18 q20 6 18 26 l-18 0 z" fill="#f25c54"/>
    <path d="M6 88 q9 -6 18 0 q9 6 18 0 q9 -6 18 0 q9 6 18 0 q9 -6 16 0" fill="none" stroke="#4cc9f0"/>`,

  sheep: `
    <g fill="#f5f5f5">
      <circle cx="34" cy="40" r="12"/><circle cx="50" cy="34" r="13"/><circle cx="66" cy="40" r="12"/>
      <circle cx="30" cy="56" r="12"/><circle cx="70" cy="56" r="12"/><circle cx="50" cy="60" r="16"/>
      <circle cx="40" cy="50" r="13" stroke="none"/><circle cx="60" cy="50" r="13" stroke="none"/>
    </g>
    <path d="M32 78 v12 M44 80 v10 M56 80 v10 M68 78 v12" stroke-width="5"/>
    <ellipse cx="50" cy="46" rx="12" ry="14" fill="#3a3a5e"/>
    <circle cx="45" cy="42" r="2.5" fill="#f5f5f5" stroke="none"/>
    <circle cx="55" cy="42" r="2.5" fill="#f5f5f5" stroke="none"/>
    <path d="M46 52 q4 3 8 0" fill="none" stroke="#f5f5f5" stroke-width="3"/>`,

  chick: `
    <circle cx="50" cy="36" r="18" fill="#ffd75e"/>
    <ellipse cx="50" cy="66" rx="24" ry="20" fill="#ffd75e"/>
    <path d="M62 34 l12 4 -12 5 z" fill="#ff9d5c"/>
    <circle cx="44" cy="32" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="56" cy="32" r="3" fill="#1e1e46" stroke="none"/>
    <path d="M28 62 q-8 4 -6 12 q8 0 12 -6 M72 62 q8 4 6 12 q-8 0 -12 -6" fill="#ffc94d"/>
    <path d="M42 86 v6 M58 86 v6 M38 92 h8 M54 92 h8" fill="none" stroke="#ff9d5c" stroke-width="4"/>
    <path d="M44 10 q6 -6 6 4 q0 -10 6 -4" fill="none" stroke-width="3.5"/>`,

  cheese: `
    <path d="M12 66 L82 34 Q88 44 88 54 L88 66 Q88 72 82 72 L18 72 Q12 72 12 66 Z" fill="#ffd75e"/>
    <circle cx="38" cy="60" r="6" fill="#e8b64a"/>
    <circle cx="60" cy="52" r="5" fill="#e8b64a"/>
    <circle cx="70" cy="64" r="4" fill="#e8b64a"/>
    <circle cx="26" cy="66" r="3" fill="#e8b64a"/>`,

  thumb: `
    <rect x="14" y="48" width="16" height="34" rx="5" fill="#4cc9f0"/>
    <path d="M30 50 h30 q9 0 9 8 q0 6 -5 7 q5 2 4 8 q-1 5 -6 6 q4 2 3 7 q-1 6 -8 6 h-27 z" fill="#f7c59f"/>
    <path d="M64 65 h-12 M62 79 h-11" fill="none" stroke-width="3"/>
    <path d="M30 50 q-2 -18 8 -28 q7 -7 12 -1 q4 5 0 12 l-8 17 z" fill="#f7c59f"/>
    <path d="M36 28 q4 -3 8 -1" fill="none" stroke-width="3"/>`,

  three: `
    <path d="M32 26 Q40 12 56 14 Q74 17 72 34 Q71 43 60 48 Q74 52 74 68 Q72 86 52 86 Q36 86 30 72" fill="none" stroke-width="13"/>
    <path d="M32 26 Q40 12 56 14 Q74 17 72 34 Q71 43 60 48 Q74 52 74 68 Q72 86 52 86 Q36 86 30 72" fill="none" stroke="#4cc9f0" stroke-width="7"/>
    <path d="M14 22 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 z" fill="#ffd75e" stroke-width="3"/>
    <path d="M86 80 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5 z" fill="#ffd75e" stroke-width="3"/>`,

  ring: `
    <circle cx="50" cy="58" r="24" fill="none" stroke="#ffd75e" stroke-width="11"/>
    <circle cx="50" cy="58" r="24" fill="none" stroke-width="4"/>
    <circle cx="50" cy="58" r="14" fill="none" stroke-width="4"/>
    <path d="M50 12 L62 24 L50 36 L38 24 Z" fill="#8adcf7"/>
    <path d="M42 20 l8 -8 M50 36 l-8 -8" fill="none" stroke="#ffffff" stroke-width="3" stroke-opacity="0.8"/>`,

  king: `
    <circle cx="50" cy="62" r="24" fill="#f7c59f"/>
    <path d="M26 44 L26 20 L38 32 L50 16 L62 32 L74 20 L74 44 Z" fill="#ffd75e"/>
    <circle cx="38" cy="26" r="3" fill="#f25c54" stroke-width="3"/>
    <circle cx="50" cy="24" r="3" fill="#4cc9f0" stroke-width="3"/>
    <circle cx="62" cy="26" r="3" fill="#7ac74f" stroke-width="3"/>
    <circle cx="42" cy="60" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="58" cy="60" r="2.5" fill="#1e1e46" stroke="none"/>
    <path d="M42 72 q8 6 16 0" fill="none"/>`,

  sink: `
    <path d="M16 52 h68 v6 q0 22 -34 22 q-34 0 -34 -22 z" fill="#e8edf5"/>
    <circle cx="50" cy="62" r="4" fill="#9aa3b8"/>
    <path d="M30 30 v14 M30 30 q0 -10 10 -10 q10 0 10 10 v6" fill="none" stroke="#9aa3b8" stroke-width="6"/>
    <path d="M50 42 q-3 5 0 8 q4 -3 0 -8 z" fill="#4cc9f0" stroke-width="3"/>
    <rect x="24" y="26" width="12" height="7" rx="3.5" fill="#9aa3b8"/>
    <path d="M28 80 v8 M72 80 v8" stroke-width="5"/>`,

  tank: `
    <path d="M14 66 a12 12 0 0 1 12 -12 h48 a12 12 0 0 1 0 24 h-48 a12 12 0 0 1 -12 -12 z" fill="#5a5a78"/>
    <circle cx="28" cy="66" r="5" fill="#9aa3b8" stroke-width="3"/>
    <circle cx="44" cy="66" r="5" fill="#9aa3b8" stroke-width="3"/>
    <circle cx="60" cy="66" r="5" fill="#9aa3b8" stroke-width="3"/>
    <circle cx="74" cy="66" r="5" fill="#9aa3b8" stroke-width="3"/>
    <path d="M32 54 v-8 q0 -8 10 -8 h12 q10 0 10 8 v8 z" fill="#7ac74f"/>
    <path d="M60 42 l26 -8" fill="none" stroke-width="6"/>`,

  queen: `
    <circle cx="50" cy="62" r="24" fill="#f7c59f"/>
    <path d="M30 52 q-8 20 4 30 M70 52 q8 20 -4 30" fill="#b5793c"/>
    <path d="M28 46 L30 22 L40 32 L50 18 L60 32 L70 22 L72 46 Z" fill="#f7a1c4"/>
    <circle cx="50" cy="28" r="3.5" fill="#8adcf7" stroke-width="3"/>
    <circle cx="42" cy="60" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="58" cy="60" r="2.5" fill="#1e1e46" stroke="none"/>
    <path d="M42 70 q8 7 16 0" fill="none"/>
    <path d="M38 56 q4 -3 8 0 M54 56 q4 -3 8 0" fill="none" stroke-width="3"/>`,

  quilt: `
    <rect x="16" y="16" width="68" height="68" rx="8" fill="#f5f5f5"/>
    <rect x="16" y="16" width="23" height="23" rx="6" fill="#f7a1c4" stroke-width="3.5"/>
    <rect x="39" y="39" width="22" height="22" fill="#ffd75e" stroke-width="3.5"/>
    <rect x="61" y="16" width="23" height="23" rx="6" fill="#4cc9f0" stroke-width="3.5"/>
    <rect x="16" y="61" width="23" height="23" rx="6" fill="#7ac74f" stroke-width="3.5"/>
    <rect x="61" y="61" width="23" height="23" rx="6" fill="#b07fe0" stroke-width="3.5"/>
    <path d="M39 20 v15 M61 20 v15 M20 39 h15 M65 39 h15 M39 65 v15 M61 65 v15 M20 61 h15 M65 61 h15" stroke-dasharray="4 4" stroke-width="2.5" fill="none"/>
    <rect x="16" y="16" width="68" height="68" rx="8" fill="none"/>`,

  rain: `
    <path d="M28 44 a14 14 0 0 1 4 -27 a18 16 0 0 1 34 -2 a13 13 0 0 1 6 29 z" fill="#e8edf5"/>
    <path d="M30 56 l-6 12 M48 56 l-6 12 M66 56 l-6 12 M39 74 l-6 12 M57 74 l-6 12 M75 74 l-6 12" fill="none" stroke="#4cc9f0" stroke-width="6"/>`,

  snail: `
    <circle cx="58" cy="48" r="24" fill="#ff9d5c"/>
    <path d="M58 48 m0 -16 a16 16 0 0 1 0 32 a10 10 0 0 1 0 -20 a4 4 0 0 1 0 8" fill="none" stroke-width="4"/>
    <path d="M34 70 q-16 2 -20 8 q6 8 26 8 h30 q10 0 12 -8 l-24 -6" fill="#ffe9b8"/>
    <path d="M24 72 q-6 -18 -2 -34" fill="none" stroke="#ffe9b8" stroke-width="10"/>
    <path d="M20 38 l-5 -10 M26 38 l4 -11" fill="none" stroke-width="3.5"/>
    <circle cx="15" cy="26" r="3.5" fill="#1e1e46" stroke="none"/>
    <circle cx="31" cy="25" r="3.5" fill="#1e1e46" stroke="none"/>`,

  train: `
    <rect x="14" y="30" width="26" height="30" rx="5" fill="#f25c54"/>
    <rect x="40" y="42" width="40" height="18" rx="4" fill="#f25c54"/>
    <rect x="19" y="36" width="16" height="12" rx="3" fill="#bfe8f9"/>
    <rect x="56" y="24" width="10" height="18" fill="#5a5a78"/>
    <path d="M52 22 q9 -8 18 0" fill="none" stroke="#9aa3b8" stroke-width="5"/>
    <path d="M80 60 l8 -8 v8 z" fill="#ffd75e" stroke-width="3.5"/>
    <circle cx="28" cy="68" r="8" fill="#3a3a5e"/>
    <circle cx="52" cy="68" r="8" fill="#3a3a5e"/>
    <circle cx="70" cy="68" r="8" fill="#3a3a5e"/>
    <path d="M8 80 h84" fill="none" stroke-width="4"/>`,

  bee: `
    <ellipse cx="50" cy="56" rx="26" ry="20" fill="#ffd75e"/>
    <path d="M40 38 q-3 18 0 36 M54 37 q-3 19 0 39 M66 42 q-2 14 0 28" fill="none" stroke="#1e1e46" stroke-width="6"/>
    <ellipse cx="50" cy="56" rx="26" ry="20" fill="none"/>
    <ellipse cx="36" cy="26" rx="12" ry="9" transform="rotate(-25 36 26)" fill="#eaf6ff" fill-opacity="0.85"/>
    <ellipse cx="60" cy="24" rx="12" ry="9" transform="rotate(15 60 24)" fill="#eaf6ff" fill-opacity="0.85"/>
    <circle cx="28" cy="52" r="3" fill="#1e1e46" stroke="none"/>
    <path d="M26 60 q4 4 8 2" fill="none" stroke-width="3"/>
    <path d="M76 56 l12 -2" fill="none" stroke-width="4"/>
    <path d="M88 54 l6 -1 -5 4 z" fill="#1e1e46" stroke-width="2"/>`,

  tree: `
    <path d="M44 60 h12 v26 h-12 z" fill="#b5793c"/>
    <circle cx="50" cy="34" r="24" fill="#7ac74f"/>
    <circle cx="30" cy="46" r="15" fill="#7ac74f"/>
    <circle cx="70" cy="46" r="15" fill="#7ac74f"/>
    <circle cx="50" cy="34" r="24" fill="#7ac74f" stroke="none"/>
    <path d="M15 46 a15 15 0 0 1 21 -13 a24 24 0 0 1 28 0 a15 15 0 0 1 21 13 a15 15 0 0 1 -26 10 a24 24 0 0 1 -18 0 a15 15 0 0 1 -26 -10 z" fill="none"/>
    <circle cx="40" cy="36" r="3" fill="#f25c54" stroke-width="2.5"/>
    <circle cx="60" cy="30" r="3" fill="#f25c54" stroke-width="2.5"/>
    <circle cx="64" cy="48" r="3" fill="#f25c54" stroke-width="2.5"/>
    <line x1="30" y1="86" x2="70" y2="86"/>`,

  light: `
    <circle cx="50" cy="42" r="24" fill="#ffd75e"/>
    <path d="M40 62 q10 6 20 0 l-2 12 h-16 z" fill="#ffd75e"/>
    <rect x="41" y="74" width="18" height="12" rx="4" fill="#9aa3b8"/>
    <path d="M42 48 q-2 -12 8 -16" fill="none" stroke="#ffffff" stroke-opacity="0.8"/>
    <g stroke-width="4">
      <line x1="50" y1="6" x2="50" y2="12"/><line x1="20" y1="18" x2="25" y2="23"/>
      <line x1="80" y1="18" x2="75" y2="23"/><line x1="14" y1="44" x2="20" y2="44"/>
      <line x1="86" y1="44" x2="80" y2="44"/>
    </g>`,

  boat: `
    <path d="M16 64 h68 l-12 18 h-44 z" fill="#f25c54"/>
    <line x1="50" y1="64" x2="50" y2="14"/>
    <path d="M54 18 q24 8 22 38 l-22 0 z" fill="#ffd75e"/>
    <path d="M8 88 q9 -6 18 0 q9 6 18 0 q9 -6 18 0 q9 6 18 0 q7 -5 14 -1" fill="none" stroke="#4cc9f0"/>
    <circle cx="30" cy="72" r="3" fill="#f5f5f5" stroke-width="3"/>
    <circle cx="46" cy="72" r="3" fill="#f5f5f5" stroke-width="3"/>`,

  coat: `
    <path d="M36 14 h28 l12 8 6 26 -10 3 -4 -12 v45 h-36 v-45 l-4 12 -10 -3 6 -26 z" fill="#4cc9f0"/>
    <path d="M50 24 v58" fill="none"/>
    <path d="M36 14 l14 10 14 -10" fill="none"/>
    <circle cx="44" cy="42" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="44" cy="56" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="44" cy="70" r="2.5" fill="#1e1e46" stroke="none"/>
    <path d="M56 52 h8 v10 h-8 z" fill="#2b9cc4" stroke-width="3.5"/>`,

  boot: `
    <path d="M34 12 h22 v40 q0 6 6 10 l14 8 q10 6 6 14 q-2 4 -10 4 h-38 v-76 z" fill="#7ac74f"/>
    <rect x="30" y="8" width="30" height="10" rx="4" fill="#4d9930"/>
    <path d="M34 74 h48" fill="none" stroke="#4d9930"/>
    <path d="M40 30 h10 M40 42 h10" fill="none" stroke="#4d9930" stroke-width="3.5"/>`,

  spoon: `
    <ellipse cx="50" cy="28" rx="17" ry="21" fill="#c9c9dd"/>
    <ellipse cx="46" cy="24" rx="6" ry="9" fill="#e8edf5" stroke="none"/>
    <path d="M46 48 q-2 22 -4 38 q0 8 8 8 q8 0 8 -8 q-2 -16 -4 -38" fill="#c9c9dd"/>`,

  star: `
    <path d="M50 8 L61 36 L90 38 L67 57 L75 86 L50 69 L25 86 L33 57 L10 38 L39 36 Z" fill="#ffd75e"/>
    <circle cx="43" cy="46" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="57" cy="46" r="2.5" fill="#1e1e46" stroke="none"/>
    <path d="M43 55 q7 6 14 0" fill="none"/>`,

  shark: `
    <path d="M12 56 q16 -24 44 -24 q20 0 32 20 q-14 22 -34 22 q-28 0 -42 -18 z" fill="#8b9bb8"/>
    <path d="M46 32 q-2 -16 10 -22 q6 10 2 24 z" fill="#8b9bb8"/>
    <path d="M88 52 l10 -12 -2 24 z" fill="#8b9bb8"/>
    <path d="M30 68 q-8 8 -4 16 q8 -2 12 -12" fill="#8b9bb8"/>
    <circle cx="68" cy="46" r="3.5" fill="#1e1e46" stroke="none"/>
    <path d="M56 62 l5 -6 5 6 5 -6 5 6" fill="#f5f5f5" stroke-width="3.5"/>
    <path d="M14 56 h20" fill="none" stroke="#6d7f9e" stroke-width="3.5"/>`,

  fork: `
    <path d="M38 10 v20 M50 10 v20 M62 10 v20" fill="none" stroke-width="6"/>
    <path d="M34 10 v20 q0 10 10 12 q-2 20 -2 40 q0 8 8 8 q8 0 8 -8 q0 -20 -2 -40 q10 -2 10 -12 v-20" fill="#c9c9dd"/>`,

  corn: `
    <path d="M50 10 C68 18 72 44 66 66 C62 80 56 88 50 88 C44 88 38 80 34 66 C28 44 32 18 50 10 Z" fill="#ffd75e"/>
    <path d="M42 20 q-2 30 4 62 M58 20 q2 30 -4 62 M36 36 q14 6 28 0 M34 52 q16 6 32 0 M38 68 q12 6 24 0" fill="none" stroke="#e8b64a" stroke-width="3"/>
    <path d="M34 66 q-16 -2 -22 -18 q16 -4 26 8 M66 66 q16 -2 22 -18 q-16 -4 -26 8" fill="#7ac74f"/>`,

  purse: `
    <path d="M26 40 q0 -22 24 -22 q24 0 24 22" fill="none" stroke-width="6"/>
    <path d="M16 44 h68 l-6 40 q-1 6 -8 6 h-40 q-7 0 -8 -6 z" fill="#f7a1c4"/>
    <path d="M16 44 h68 l-2 12 h-64 z" fill="#f27db4" stroke-width="4"/>
    <circle cx="50" cy="56" r="6" fill="#ffd75e"/>`,

  cow: `
    <path d="M24 30 q-12 -2 -14 -12 q12 -4 20 6 M76 30 q12 -2 14 -12 q-12 -4 -20 6" fill="#f7c59f"/>
    <ellipse cx="50" cy="50" rx="27" ry="28" fill="#f5f5f5"/>
    <path d="M30 32 q10 -8 20 0 q-4 10 -12 10 q-8 0 -8 -10 z" fill="#3a3a5e" stroke-width="3.5"/>
    <path d="M72 56 q8 8 2 16 q-8 4 -14 -4" fill="#3a3a5e" stroke-width="3.5"/>
    <circle cx="40" cy="46" r="3" fill="#1e1e46" stroke="none"/>
    <circle cx="60" cy="46" r="3" fill="#1e1e46" stroke="none"/>
    <ellipse cx="50" cy="66" rx="14" ry="10" fill="#f7a1c4"/>
    <circle cx="45" cy="65" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="55" cy="65" r="2.5" fill="#1e1e46" stroke="none"/>`,

  owl: `
    <path d="M28 24 q-2 -10 6 -14 q4 6 2 12 M72 24 q2 -10 -6 -14 q-4 6 -2 12" fill="#b5793c"/>
    <ellipse cx="50" cy="50" rx="27" ry="30" fill="#b5793c"/>
    <circle cx="39" cy="42" r="11" fill="#f5f5f5"/>
    <circle cx="61" cy="42" r="11" fill="#f5f5f5"/>
    <circle cx="39" cy="42" r="4.5" fill="#1e1e46" stroke="none"/>
    <circle cx="61" cy="42" r="4.5" fill="#1e1e46" stroke="none"/>
    <path d="M46 52 l4 6 4 -6 z" fill="#ff9d5c"/>
    <path d="M32 62 q6 6 12 3 M56 65 q6 3 12 -3" fill="none" stroke="#7a4a2b" stroke-width="3.5"/>
    <path d="M42 80 l-3 8 M50 81 v8 M58 80 l3 8" fill="none" stroke="#ff9d5c" stroke-width="4"/>
    <line x1="26" y1="88" x2="74" y2="88" stroke="#7a4a2b" stroke-width="5"/>`,

  clown: `
    <circle cx="50" cy="56" r="24" fill="#f7c59f"/>
    <path d="M28 48 q-12 -4 -10 -16 q12 -6 20 6 M72 48 q12 -4 10 -16 q-12 -6 -20 6" fill="#f25c54"/>
    <path d="M34 34 L50 10 L66 34 Z" fill="#4cc9f0"/>
    <circle cx="50" cy="10" r="5" fill="#ffd75e"/>
    <circle cx="42" cy="52" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="58" cy="52" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="50" cy="60" r="6" fill="#f25c54"/>
    <path d="M38 68 q12 12 24 0" fill="none" stroke-width="4.5"/>`,

  bed: `
    <rect x="10" y="46" width="80" height="22" rx="6" fill="#4cc9f0"/>
    <path d="M10 68 v16 M90 68 v16" stroke-width="6"/>
    <path d="M14 46 v-20 q0 -6 6 -6 h8 q6 0 6 6 v20" fill="#b5793c"/>
    <rect x="18" y="34" width="20" height="12" rx="6" fill="#f5f5f5"/>
    <path d="M40 46 h50 v10 h-50 z" fill="#f25c54" stroke-width="4"/>
    <path d="M48 52 q6 -4 12 0 q6 4 12 0 q6 -4 12 0" fill="none" stroke="#c93f38" stroke-width="3"/>`,

  cup: `
    <path d="M26 34 h40 v34 q0 14 -20 14 q-20 0 -20 -14 z" fill="#f25c54"/>
    <path d="M66 40 q16 -2 16 10 q0 12 -17 10" fill="none" stroke-width="6"/>
    <ellipse cx="46" cy="34" rx="20" ry="6" fill="#c93f38"/>
    <path d="M38 24 q-4 -6 0 -10 M50 26 q-4 -8 0 -14" fill="none" stroke="#9aa3b8" stroke-width="4"/>`,

  bug: `
    <circle cx="50" cy="30" r="13" fill="#3a3a5e"/>
    <path d="M42 20 q-6 -6 -4 -12 M58 20 q6 -6 4 -12" fill="none" stroke-width="3.5"/>
    <circle cx="36" cy="8" r="3" fill="#3a3a5e" stroke-width="2.5"/>
    <circle cx="64" cy="8" r="3" fill="#3a3a5e" stroke-width="2.5"/>
    <path d="M24 62 a26 26 0 0 1 52 0 a26 22 0 0 1 -52 0 z" fill="#f25c54"/>
    <line x1="50" y1="40" x2="50" y2="84"/>
    <circle cx="37" cy="56" r="4.5" fill="#1e1e46" stroke="none"/>
    <circle cx="63" cy="56" r="4.5" fill="#1e1e46" stroke="none"/>
    <circle cx="40" cy="72" r="4" fill="#1e1e46" stroke="none"/>
    <circle cx="60" cy="72" r="4" fill="#1e1e46" stroke="none"/>
    <circle cx="45" cy="26" r="2.5" fill="#f5f5f5" stroke="none"/>
    <circle cx="55" cy="26" r="2.5" fill="#f5f5f5" stroke="none"/>`,

  frog: `
    <circle cx="34" cy="26" r="12" fill="#7ac74f"/>
    <circle cx="66" cy="26" r="12" fill="#7ac74f"/>
    <circle cx="34" cy="26" r="5" fill="#f5f5f5"/>
    <circle cx="66" cy="26" r="5" fill="#f5f5f5"/>
    <circle cx="34" cy="27" r="2.5" fill="#1e1e46" stroke="none"/>
    <circle cx="66" cy="27" r="2.5" fill="#1e1e46" stroke="none"/>
    <path d="M20 52 a30 26 0 0 1 60 0 a30 22 0 0 1 -60 0 z" fill="#7ac74f"/>
    <path d="M34 56 q16 12 32 0" fill="none" stroke-width="4.5"/>
    <path d="M22 70 q-10 8 -6 16 q10 2 14 -8 M78 70 q10 8 6 16 q-10 2 -14 -8" fill="#5eab35"/>
    <circle cx="44" cy="44" r="2" fill="#5eab35" stroke="none"/>
    <circle cx="56" cy="44" r="2" fill="#5eab35" stroke="none"/>`,

  crab: `
    <path d="M26 30 q-14 -4 -16 -16 q14 -2 22 8 l4 8 M74 30 q14 -4 16 -16 q-14 -2 -22 8 l-4 8" fill="#f25c54"/>
    <circle cx="18" cy="16" r="7" fill="#f25c54"/>
    <circle cx="82" cy="16" r="7" fill="#f25c54"/>
    <ellipse cx="50" cy="56" rx="30" ry="24" fill="#f25c54"/>
    <path d="M24 70 l-10 8 M30 78 l-6 10 M76 70 l10 8 M70 78 l6 10" fill="none" stroke-width="5"/>
    <circle cx="40" cy="50" r="4.5" fill="#f5f5f5"/>
    <circle cx="60" cy="50" r="4.5" fill="#f5f5f5"/>
    <circle cx="40" cy="51" r="2" fill="#1e1e46" stroke="none"/>
    <circle cx="60" cy="51" r="2" fill="#1e1e46" stroke="none"/>
    <path d="M42 64 q8 6 16 0" fill="none"/>`,

  lamp: `
    <path d="M28 14 h44 l10 28 h-64 z" fill="#ff9d5c"/>
    <line x1="50" y1="42" x2="50" y2="76"/>
    <path d="M30 84 q0 -8 20 -8 q20 0 20 8 z" fill="#5a5a78"/>
    <path d="M20 50 l-8 4 M50 54 v8 M80 50 l8 4" fill="none" stroke="#ffd75e" stroke-width="4"/>
    <path d="M34 20 l-4 16" fill="none" stroke="#e07b3a" stroke-width="3.5"/>`,

  tent: `
    <path d="M50 14 L88 82 H12 Z" fill="#ff9d5c"/>
    <path d="M50 14 L50 82" fill="none"/>
    <path d="M50 82 L38 82 L50 54 L62 82 Z" fill="#e07b3a"/>
    <path d="M50 14 l-8 -8 M50 14 l8 -8" fill="none" stroke-width="4"/>
    <line x1="6" y1="82" x2="94" y2="82"/>`,

  milk: `
    <path d="M34 10 h32 v12 l8 16 v48 q0 6 -6 6 h-36 q-6 0 -6 -6 v-48 l8 -16 z" fill="#f5f5f5"/>
    <path d="M34 22 h32 l8 16 h-48 z" fill="#4cc9f0"/>
    <path d="M34 10 h32 v12 h-32 z" fill="#e8edf5"/>
    <circle cx="50" cy="62" r="12" fill="#4cc9f0" stroke-width="4"/>
    <path d="M44 62 q3 -6 6 0 q3 6 6 0" fill="none" stroke="#f5f5f5" stroke-width="3.5"/>`,

  flag: `
    <line x1="30" y1="8" x2="30" y2="90" stroke-width="6"/>
    <path d="M34 14 h44 l-10 14 10 14 h-44 z" fill="#f25c54"/>
    <path d="M42 22 l4 6 6 1 -4 5 1 6 -6 -3 -6 3 1 -6 -4 -5 6 -1 z" fill="#ffd75e" stroke-width="2.5"/>
    <path d="M24 90 h12" stroke-width="5"/>`,

  plant: `
    <path d="M36 62 h28 l-4 24 h-20 z" fill="#e07b3a"/>
    <path d="M32 54 h36 v8 h-36 z" fill="#ff9d5c"/>
    <line x1="50" y1="54" x2="50" y2="26"/>
    <path d="M50 40 q-18 -2 -22 -18 q18 -2 22 14 z" fill="#7ac74f"/>
    <path d="M50 40 q18 -2 22 -18 q-18 -2 -22 14 z" fill="#7ac74f"/>
    <path d="M50 28 q-4 -14 4 -20 q8 8 -1 20 z" fill="#7ac74f"/>`,

  truck: `
    <rect x="8" y="26" width="52" height="36" rx="5" fill="#b07fe0"/>
    <path d="M60 40 h18 l12 14 v8 h-30 z" fill="#4cc9f0"/>
    <path d="M64 44 h12 l8 10 h-20 z" fill="#bfe8f9" stroke-width="3.5"/>
    <circle cx="26" cy="66" r="9" fill="#3a3a5e"/>
    <circle cx="74" cy="66" r="9" fill="#3a3a5e"/>
    <circle cx="26" cy="66" r="3.5" fill="#b8c0d0" stroke-width="3"/>
    <circle cx="74" cy="66" r="3.5" fill="#b8c0d0" stroke-width="3"/>
    <path d="M18 38 h32 M18 48 h32" fill="none" stroke="#8b57bd" stroke-width="3.5"/>`,
};
