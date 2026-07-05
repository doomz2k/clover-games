// Sticker book for the Clover Games hub. One sticker per perfect (3-star)
// level across all three games, drawn as procedural SVG in each game's
// style. Reads the games' own localStorage saves; stores which stickers
// the child has already been shown under 'cloverStickersSeen'.

const GAMES = [
  {
    key: 'space',
    title: 'Space Phonics',
    emoji: '\u{1F680}',
    store: 'spacephonics_progress',
    list: 'planets',
    levels: ['Planet Zim', 'The Wobbly Moon', 'Bopstar', 'Frizz Minor',
      'Noodle Nebula', 'The Grumble Ring', 'Planet Whumble', 'Asteroid Vex',
      'The Glitter Belt', "Zog's Crater", 'Twin Moons of Pip',
      'The Ice Rings', "Galaxy's Edge"],
  },
  {
    key: 'sea',
    title: 'Deep Sea Numbers',
    emoji: '\u{1F41F}',
    store: 'deepseanumbers_progress',
    list: 'levels',
    levels: ['Rock Pool Shallows', 'Seagrass Meadow', 'Bubble Reef',
      'The Kelp Forest', 'Coral Gardens', 'The Shimmer Caves',
      'Starfish Point', 'The Twilight Zone', 'Pearl Valley',
      'The Sunken Ship', 'Ink Deep', 'The Midnight Trench'],
  },
  {
    key: 'garden',
    title: 'Garden Maths',
    emoji: '\u{1F33B}',
    store: 'gardenMaths_progress',
    list: 'seasons',
    levels: ['Spring', 'Early Summer', 'High Summer', 'Late Summer',
      'Autumn', 'Harvest'],
  },
];

const SEEN_KEY = 'cloverStickersSeen';

// deterministic per-sticker randomness
function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ---------------------------------------------------------------------------
// Sticker art (140x140 viewBox, die-cut white ring like a real sticker)
// ---------------------------------------------------------------------------

function planetArt(i) {
  const r = rng(101 + i * 97);
  const hue = (i * 47 + 15) % 360;
  const base = `hsl(${hue} 62% 58%)`;
  const dark = `hsl(${hue} 62% 42%)`;
  const light = `hsl(${hue} 70% 72%)`;
  let s = `<circle cx="70" cy="70" r="34" fill="${base}"/>`;
  s += '<clipPath id="pl' + i + '"><circle cx="70" cy="70" r="34"/></clipPath>';
  s += `<g clip-path="url(#pl${i})">`;
  for (let b = 0; b < 3; b++) {
    const y = 48 + b * 20 + r() * 8;
    s += `<ellipse cx="${64 + r() * 14}" cy="${y}" rx="40" ry="${5 + r() * 5}"
      fill="${b % 2 ? dark : light}" opacity="0.55"/>`;
  }
  s += `<circle cx="${56 + r() * 10}" cy="${58 + r() * 8}" r="6" fill="${light}" opacity="0.8"/></g>`;
  if (i % 2 === 1) {
    s += `<ellipse cx="70" cy="72" rx="52" ry="13" fill="none"
      stroke="hsl(${(hue + 60) % 360} 70% 65%)" stroke-width="6" opacity="0.9"
      transform="rotate(-14 70 72)"/>`;
  }
  if (i % 3 === 2) s += `<circle cx="106" cy="42" r="7" fill="${light}"/>`;
  for (let t = 0; t < 4; t++) {
    s += `<circle cx="${20 + r() * 100}" cy="${16 + r() * 24}" r="1.8" fill="#fff" opacity="0.9"/>`;
  }
  return { bg: '#181848', art: s };
}

function seaArt(i) {
  const r = rng(202 + i * 71);
  const hue = (i * 53 + 180) % 360;
  const c = `hsl(${hue} 65% 60%)`;
  const cd = `hsl(${hue} 65% 45%)`;
  const kind = ['fish', 'jelly', 'star', 'octo', 'shell', 'seahorse'][i % 6];
  const eye = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/>
    <circle cx="${x + 1.4}" cy="${y}" r="2.4" fill="#222"/>`;
  let s = '';
  if (kind === 'fish') {
    s = `<ellipse cx="66" cy="70" rx="30" ry="20" fill="${c}"/>
      <path d="M92 70 L112 56 L112 84 Z" fill="${cd}"/>
      <path d="M56 52 Q66 42 74 52 L66 62 Z" fill="${cd}"/>
      <circle cx="52" cy="66" r="10" fill="hsl(${hue} 65% 70%)" opacity="0.6"/>
      ${eye(50, 66)}<path d="M40 76 q4 4 8 0" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  } else if (kind === 'jelly') {
    s = `<path d="M42 72 a28 26 0 0 1 56 0 Z" fill="${c}"/>
      <path d="M42 72 a28 26 0 0 1 56 0 Z" fill="hsl(${hue} 75% 75%)" opacity="0.5" transform="translate(-4 -3) scale(0.94)"/>`;
    for (let t = 0; t < 4; t++) {
      const x = 48 + t * 15;
      s += `<path d="M${x} 74 q${(r() - 0.5) * 14} 14 0 26 q${(r() - 0.5) * 14} 10 2 18"
        stroke="${cd}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    s += eye(60, 60) + eye(80, 60) +
      `<path d="M62 70 q8 6 16 0" stroke="#222" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  } else if (kind === 'star') {
    let pts = '';
    for (let k = 0; k < 10; k++) {
      const ang = -Math.PI / 2 + (k * Math.PI) / 5;
      const rad = k % 2 ? 16 : 34;
      pts += `${70 + Math.cos(ang) * rad},${72 + Math.sin(ang) * rad} `;
    }
    s = `<polygon points="${pts}" fill="${c}" stroke="${cd}" stroke-width="4" stroke-linejoin="round"/>
      ${eye(62, 68)}${eye(78, 68)}
      <path d="M64 80 q6 5 12 0" stroke="#222" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  } else if (kind === 'octo') {
    s = `<circle cx="70" cy="60" r="24" fill="${c}"/>`;
    for (let t = 0; t < 5; t++) {
      const x = 50 + t * 10;
      s += `<path d="M${x} 78 q${(t % 2 ? 8 : -8)} 16 ${(t % 2 ? -4 : 4)} 26"
        stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }
    s += eye(62, 58) + eye(78, 58) +
      `<path d="M64 70 q6 5 12 0" stroke="#222" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  } else if (kind === 'shell') {
    s = `<path d="M44 84 a26 26 0 0 1 52 0 Z" fill="${c}" stroke="${cd}" stroke-width="4"/>`;
    for (let t = 1; t < 4; t++) {
      s += `<path d="M${44 + t * 13} 84 Q70 ${84 - t * 16} ${96 - t * 13} 84" stroke="${cd}" stroke-width="3" fill="none"/>`;
    }
    s += `<circle cx="70" cy="92" r="8" fill="#fce9f2" stroke="${cd}" stroke-width="3"/>`;
  } else {
    s = `<path d="M74 40 q18 4 12 22 q-4 12 -14 16 l0 14 q0 12 -12 12 q10 2 16 -4"
        stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M72 44 l10 -8 M74 52 l12 -6" stroke="${cd}" stroke-width="4" stroke-linecap="round"/>
      ${eye(76, 48)}`;
  }
  for (let b = 0; b < 3; b++) {
    s += `<circle cx="${18 + r() * 104}" cy="${18 + r() * 20}" r="${2 + r() * 2.5}"
      fill="none" stroke="#fff" stroke-width="1.6" opacity="0.7"/>`;
  }
  return { bg: '#0b4f8f', art: s };
}

function gardenArt(i) {
  const r = rng(303 + i * 59);
  const hue = [330, 45, 0, 270, 25, 50][i % 6];
  const petals = 5 + (i % 4);
  const c = `hsl(${hue} 80% 62%)`;
  const cd = `hsl(${hue} 80% 48%)`;
  let s = `<path d="M70 96 L70 66" stroke="#3f7f3a" stroke-width="6" stroke-linecap="round"/>
    <path d="M70 86 q-14 -2 -16 -12 q14 0 16 12 M70 92 q14 -2 16 -12 q-14 0 -16 12" fill="#5aa653"/>`;
  for (let k = 0; k < petals; k++) {
    const ang = (k / petals) * Math.PI * 2;
    s += `<ellipse cx="${70 + Math.cos(ang) * 17}" cy="${52 + Math.sin(ang) * 17}"
      rx="12" ry="9" fill="${c}" stroke="${cd}" stroke-width="2"
      transform="rotate(${(ang * 180) / Math.PI} ${70 + Math.cos(ang) * 17} ${52 + Math.sin(ang) * 17})"/>`;
  }
  s += `<circle cx="70" cy="52" r="11" fill="#f7c948" stroke="#c99b1f" stroke-width="3"/>
    <circle cx="66" cy="49" r="3" fill="#fff" opacity="0.7"/>`;
  for (let b = 0; b < 2; b++) {
    s += `<circle cx="${24 + r() * 92}" cy="${100 + r() * 10}" r="2.2" fill="#f7c948"/>`;
  }
  return { bg: `hsl(${105 + i * 6} 45% ${78 - i * 3}%)`, art: s };
}

const ART = { space: planetArt, sea: seaArt, garden: gardenArt };

export function stickerSVG(gameKey, i, earned) {
  if (!earned) {
    return `<svg viewBox="0 0 140 140" role="img" aria-label="Locked sticker">
      <circle cx="70" cy="70" r="58" fill="#e9e2d2" stroke="#c9bfa8"
        stroke-width="4" stroke-dasharray="10 8"/>
      <text x="70" y="88" text-anchor="middle" font-size="52"
        font-family="'Fredoka One',sans-serif" fill="#c9bfa8">?</text></svg>`;
  }
  const { bg, art } = ART[gameKey](i);
  return `<svg viewBox="0 0 140 140" role="img" aria-label="Sticker">
    <circle cx="70" cy="70" r="64" fill="#fff"/>
    <circle cx="70" cy="70" r="57" fill="${bg}"/>
    ${art}
    <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(74,59,42,0.18)" stroke-width="2"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

function readStars(game) {
  try {
    const data = JSON.parse(localStorage.getItem(game.store) || 'null');
    const list = data && data[game.list];
    return game.levels.map((_, i) =>
      (Array.isArray(list) ? (list.find((l) => l.id === i + 1)?.stars | 0) : 0));
  } catch {
    return game.levels.map(() => 0);
  }
}

export function stickerState() {
  const seen = new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
  return GAMES.map((game) => {
    const stars = readStars(game);
    return {
      ...game,
      stickers: game.levels.map((name, i) => ({
        name,
        earned: stars[i] === 3,
        isNew: stars[i] === 3 && !seen.has(`${game.key}${i}`),
      })),
      complete: stars.every((s) => s === 3),
    };
  });
}

export function markAllSeen() {
  const keys = [];
  for (const g of stickerState()) {
    g.stickers.forEach((st, i) => { if (st.earned) keys.push(`${g.key}${i}`); });
  }
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(keys)); } catch { /* blocked */ }
}

export function counts() {
  let earned = 0, total = 0, fresh = 0;
  for (const g of stickerState()) {
    for (const st of g.stickers) {
      total += 1;
      if (st.earned) earned += 1;
      if (st.isNew) fresh += 1;
    }
  }
  return { earned, total, fresh };
}

// ---------------------------------------------------------------------------
// Album overlay
// ---------------------------------------------------------------------------

export function openAlbum() {
  const state = stickerState();
  const overlay = document.createElement('div');
  overlay.className = 'album-overlay';
  const { earned, total } = counts();

  let html = `<div class="album">
    <button class="album-close" aria-label="Close sticker book">&#10005;</button>
    <h2>&#128214; Sticker Book <span class="album-count">${earned} / ${total}</span></h2>
    <p class="album-hint">Earn a sticker for every world you finish with three stars!</p>`;

  for (const g of state) {
    html += `<section><h3>${g.emoji} ${g.title}`;
    if (g.complete) {
      html += ` <a class="cert-link" href="certificate.html?game=${g.key}">&#127942; Print certificate</a>`;
    }
    html += '</h3><div class="sticker-grid">';
    g.stickers.forEach((st, i) => {
      html += `<figure class="sticker ${st.earned ? 'earned' : 'locked'} ${st.isNew ? 'fresh' : ''}">
        ${st.isNew ? '<span class="new-pill">NEW!</span>' : ''}
        ${stickerSVG(g.key, i, st.earned)}
        <figcaption>${st.earned ? st.name : '???'}</figcaption>
      </figure>`;
    });
    html += '</div></section>';
  }
  html += '</div>';
  overlay.innerHTML = html;

  const close = () => { overlay.remove(); markAllSeen(); refreshButton(); };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.album-close').addEventListener('click', close);
  document.body.appendChild(overlay);
}

function refreshButton() {
  const btn = document.getElementById('sticker-book-btn');
  if (!btn) return;
  const { earned, total, fresh } = counts();
  btn.innerHTML = `&#128214; Sticker Book <span class="count">${earned}/${total}</span>` +
    (fresh ? ` <span class="fresh-burst">${fresh} new!</span>` : '');
  btn.classList.toggle('has-new', fresh > 0);
}

export function initStickerBook() {
  const btn = document.getElementById('sticker-book-btn');
  if (!btn) return;
  refreshButton();
  btn.addEventListener('click', openAlbum);
}
