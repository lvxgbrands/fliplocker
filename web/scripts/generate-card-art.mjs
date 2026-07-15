// Generates T206-style (1909-11, public-domain design) front/back card art for
// the demo roster into web/public/cards/{slug}-front.png and {slug}-back.png.
// These are ORIGINAL layered-SVG artworks in a period style — no photo copying,
// no PSA slab/label reproduction. Stable filenames: drop real photos over them
// later with zero code changes. Run: node scripts/generate-card-art.mjs
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "public", "cards");
fs.mkdirSync(OUT, { recursive: true });
const EXE = "/opt/pw-browsers/chromium";

// slug, surname, team, sky[top,bottom], jersey, cap color, skin, accent (back spot), cap?, mustache?, facing
const ROSTER = [
  ["johnson", "JOHNSON", "WASHINGTON", ["#dfe7ea", "#b9a98a"], "#f2f3f4", "#2b3a67", "#e7b48f", "#1d3a6b", true, false, 0],
  ["collins", "COLLINS", "PHILA. ATHLETICS", ["#e7ddc4", "#c4a986"], "#eef0f2", "#12233f", "#eab98f", "#7a1f2b", true, false, -1],
  ["evers", "EVERS", "CHICAGO CUBS", ["#d7e0e6", "#b09a7d"], "#f0efe9", "#2a3f6d", "#e6b088", "#20406e", true, true, 1],
  ["baker", "BAKER", "PHILA. ATHLETICS", ["#e9dcbf", "#b7a67e"], "#eef0f2", "#14284a", "#e8b189", "#14284a", true, false, 0],
  ["bender", "BENDER", "PHILA. ATHLETICS", ["#dcd7c0", "#a89f7f"], "#e9ebec", "#122a4c", "#d69e75", "#14284a", true, false, -1],
  ["huggins", "HUGGINS", "ST. LOUIS", ["#e5d8bd", "#b39a72"], "#efe9dc", "#5a3921", "#e6b48c", "#6b2418", true, true, 1],
  ["chase", "CHASE", "N.Y. HIGHLANDERS", ["#d6dee8", "#a9b0a2"], "#eef1f4", "#1a2f57", "#e9b088", "#16305c", true, false, 0],
  ["seymour", "SEYMOUR", "CINCINNATI", ["#ecdcc0", "#c29a72"], "#f1ece1", "#7a1f22", "#e5ac82", "#8a1f22", false, true, -1],
];
// clean any typo tokens defensively
const fix = (c) => (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) ? c : "#e7b48f");

function grain(n) {
  let d = "";
  // deterministic pseudo-random dots (no Math.random for stable output)
  let s = n * 9973 + 1;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 460; i++) {
    const x = (rnd() * 564 + 18).toFixed(1);
    const y = (rnd() * 700 + 18).toFixed(1);
    const r = (rnd() * 1.1 + 0.2).toFixed(2);
    const o = (rnd() * 0.06 + 0.01).toFixed(3);
    d += `<circle cx="${x}" cy="${y}" r="${r}" fill="#3a2c17" opacity="${o}"/>`;
  }
  return d;
}

function front(i, [, name, team, sky, jersey, cap, skin, , hasCap, mustache, facing]) {
  const sk = fix(skin), jr = fix(jersey), cp = fix(cap);
  const dx = facing * 10; // subtle turn
  return `<svg width="600" height="840" viewBox="0 0 600 840" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sky${i}" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="${sky[0]}"/><stop offset="100%" stop-color="${sky[1]}"/>
    </radialGradient>
    <linearGradient id="shade${i}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.18"/>
    </linearGradient>
    <radialGradient id="vig${i}" cx="50%" cy="46%" r="62%">
      <stop offset="62%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#2a1e0c" stop-opacity="0.34"/>
    </radialGradient>
  </defs>
  <!-- aged paper border -->
  <rect width="600" height="840" fill="#e8dcc0"/>
  <rect x="9" y="9" width="582" height="822" fill="#efe7d4"/>
  <!-- portrait window -->
  <rect x="18" y="18" width="564" height="700" fill="url(#sky${i})"/>
  <g transform="translate(${dx},0)">
    <!-- shoulders / jersey -->
    <path d="M150 718 Q300 560 450 718 Z" fill="${jr}"/>
    <path d="M150 718 Q300 560 450 718 Z" fill="url(#shade${i})"/>
    <!-- collar -->
    <path d="M255 612 L300 660 L345 612 L330 600 L300 636 L270 600 Z" fill="#f7f5ee" opacity="0.9"/>
    <!-- neck -->
    <rect x="278" y="560" width="44" height="70" rx="16" fill="${sk}"/>
    <rect x="300" y="560" width="22" height="70" fill="#000" opacity="0.08"/>
    <!-- head -->
    <ellipse cx="300" cy="500" rx="86" ry="104" fill="${sk}"/>
    <ellipse cx="300" cy="500" rx="86" ry="104" fill="url(#shade${i})"/>
    <!-- ears -->
    <ellipse cx="216" cy="502" rx="15" ry="24" fill="${sk}"/>
    <ellipse cx="384" cy="502" rx="15" ry="24" fill="${sk}"/>
    <!-- brow + eyes (minimal, painterly) -->
    <path d="M250 470 Q272 460 292 470" stroke="#5a4126" stroke-width="4" fill="none" opacity="0.55"/>
    <path d="M308 470 Q330 460 352 470" stroke="#5a4126" stroke-width="4" fill="none" opacity="0.55"/>
    <ellipse cx="270" cy="486" rx="7" ry="5" fill="#3b2a17" opacity="0.7"/>
    <ellipse cx="330" cy="486" rx="7" ry="5" fill="#3b2a17" opacity="0.7"/>
    <!-- nose shadow -->
    <path d="M300 490 L292 528 Q300 534 308 528 Z" fill="#000" opacity="0.10"/>
    <!-- mouth -->
    <path d="M280 548 Q300 ${mustache ? 556 : 560} 320 548" stroke="#6b3b2a" stroke-width="4" fill="none" opacity="0.6"/>
    ${mustache ? `<path d="M276 542 Q300 552 324 542 Q300 560 276 542Z" fill="#4a3320" opacity="0.72"/>` : ``}
    <!-- hair / sideburns -->
    <path d="M214 470 Q220 430 260 416 L262 452 Q236 456 224 486 Z" fill="#3a2717" opacity="0.7"/>
    <path d="M386 470 Q380 430 340 416 L338 452 Q364 456 376 486 Z" fill="#3a2717" opacity="0.7"/>
    ${hasCap ? `
    <!-- cap -->
    <path d="M206 452 Q300 356 394 452 Q300 420 206 452 Z" fill="${cp}"/>
    <path d="M206 452 Q300 356 394 452 Q300 420 206 452 Z" fill="url(#shade${i})"/>
    <ellipse cx="300" cy="360" rx="10" ry="8" fill="${cp}" stroke="#000" stroke-opacity="0.15"/>
    <path d="M196 452 Q300 470 404 452 L410 466 Q300 490 190 466 Z" fill="${cp}" opacity="0.92"/>
    ` : `
    <!-- bare head hair -->
    <path d="M214 452 Q300 380 386 452 Q300 430 214 452 Z" fill="#33231590" opacity="0.85"/>
    `}
  </g>
  <!-- paper grain + aging -->
  <g>${grain(i)}</g>
  <rect x="18" y="18" width="564" height="700" fill="url(#vig${i})"/>
  <!-- nameplate -->
  <rect x="18" y="718" width="564" height="104" fill="#efe7d4"/>
  <text x="300" y="772" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="44" letter-spacing="3" fill="#26333f">${name}</text>
  <text x="300" y="804" text-anchor="middle" font-family="Georgia, serif" font-size="20" letter-spacing="4" fill="#7a6f5c">${team}</text>
</svg>`;
}

function back(i, [, name, team, , , , , accent]) {
  const ac = fix(accent);
  return `<svg width="600" height="840" viewBox="0 0 600 840" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="bg${i}" cx="50%" cy="42%" r="75%"><stop offset="0%" stop-color="${ac}"/><stop offset="100%" stop-color="#0a0a0a" stop-opacity="0.35"/></radialGradient></defs>
  <rect width="600" height="840" fill="${ac}"/>
  <rect width="600" height="840" fill="url(#bg${i})"/>
  <!-- ornate double frame -->
  <rect x="26" y="26" width="548" height="788" fill="none" stroke="#f4ead0" stroke-opacity="0.85" stroke-width="3"/>
  <rect x="38" y="38" width="524" height="764" fill="none" stroke="#f4ead0" stroke-opacity="0.5" stroke-width="1.5"/>
  <g fill="#f4ead0">
    <text x="300" y="150" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="30" letter-spacing="6" opacity="0.95">BASE BALL SERIES</text>
    <text x="300" y="188" text-anchor="middle" font-family="Georgia, serif" font-size="18" letter-spacing="8" opacity="0.75">— 150 SUBJECTS —</text>
  </g>
  <!-- crossed bats + ball emblem -->
  <g transform="translate(300,360)" stroke="#f4ead0" stroke-opacity="0.85" fill="none" stroke-width="7" stroke-linecap="round">
    <line x1="-70" y1="60" x2="70" y2="-60"/><line x1="70" y1="60" x2="-70" y2="-60"/>
    <circle cx="0" cy="0" r="26" fill="#f4ead0" fill-opacity="0.12"/>
    <path d="M-16 -10 Q0 0 16 -10" stroke-width="3"/><path d="M-16 10 Q0 0 16 10" stroke-width="3"/>
  </g>
  <g fill="#f4ead0" text-anchor="middle" font-family="Georgia, serif">
    <text x="300" y="516" font-weight="700" font-size="34" letter-spacing="4">${name}</text>
    <text x="300" y="548" font-size="17" letter-spacing="5" opacity="0.8">${team}</text>
  </g>
  <line x1="150" y1="600" x2="450" y2="600" stroke="#f4ead0" stroke-opacity="0.4" stroke-width="1"/>
  <g fill="#f4ead0" fill-opacity="0.72" text-anchor="middle" font-family="Georgia, serif" font-size="15" letter-spacing="2">
    <text x="300" y="640">A SERIES OF CHAMPION BALL PLAYERS</text>
    <text x="300" y="668">FACTORY No. 25 · DISTRICT No. 2</text>
    <text x="300" y="742" font-size="12" letter-spacing="3" fill-opacity="0.5">FLIPLOCKER · VERIFIED &amp; DOCUMENTED · PLACEHOLDER ART</text>
  </g>
</svg>`;
}

const b = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const page = await b.newPage({ viewport: { width: 600, height: 840 }, deviceScaleFactor: 2 });
for (let i = 0; i < ROSTER.length; i++) {
  const r = ROSTER[i];
  for (const [face, svg] of [["front", front(i, r)], ["back", back(i, r)]]) {
    await page.setContent(`<body style="margin:0">${svg}</body>`);
    await page.locator("svg").screenshot({ path: path.join(OUT, `${r[0]}-${face}.png`) });
  }
  console.log(`✔ ${r[0]}`);
}
await b.close();
console.log(`\nGenerated ${ROSTER.length * 2} card images in public/cards/`);
