// Renders the HappyLeafy icon set from SVG. Run from a folder where @resvg/resvg-js is installed:
//   node /path/to/assets/brand/make-icons.js /path/to/assets
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || path.join(__dirname, '..');

/** The plant mark in a 120x120 box: three leaves, stem, smiling terracotta pot. */
function plant({ leaves = ['#A5D6A7', '#C8E6C9', '#E8F5E9'], stem = '#1B5E20', pot = '#D98B5F', rim = '#C9774A', face = '#7A3E1D', mono } = {}) {
  const f = (c) => (mono ? mono : c);
  return `
    <rect x="58" y="44" width="4" height="40" rx="2" fill="${f(stem)}"/>
    <path d="M60 70 C 40 66, 20 52, 22 34 C 40 34, 56 50, 60 70 Z" fill="${f(leaves[0])}"/>
    <path d="M60 64 C 78 60, 98 46, 98 28 C 80 28, 64 44, 60 64 Z" fill="${f(leaves[1])}"/>
    <path d="M60 52 C 51 40, 49 22, 60 8 C 71 22, 69 40, 60 52 Z" fill="${f(leaves[2])}"/>
    <rect x="32" y="78" width="56" height="9" rx="3.5" fill="${f(rim)}"/>
    <path d="M36 87 L 84 87 L 77.5 112 L 42.5 112 Z" fill="${f(pot)}"/>
    ${mono ? '' : `<circle cx="52" cy="96" r="2.2" fill="${face}"/><circle cx="68" cy="96" r="2.2" fill="${face}"/>
    <path d="M53 101.5 Q 60 107 67 101.5" stroke="${face}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`}`;
}

/** Wrap the 120-unit plant, scaled to `scale` of a 1024 canvas and centred (nudged down by `dy`). */
function svg({ bg, scale, dy = 0, ...opts }) {
  const s = (1024 * scale) / 120;
  const off = (1024 - 120 * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${bg || ''}
    <g transform="translate(${off} ${off + dy}) scale(${s})">${plant(opts)}</g>
  </svg>`;
}

const gradientBg = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#43A047"/><stop offset="1" stop-color="#1B5E20"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.38" r="0.55"><stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>
  <rect width="1024" height="1024" fill="url(#g)"/><rect width="1024" height="1024" fill="url(#glow)"/>`;

function render(file, svgText, size = 1024) {
  const png = new Resvg(svgText, { fitTo: { mode: 'width', value: size }, background: undefined }).render().asPng();
  fs.writeFileSync(path.join(out, file), png);
  console.log(file, size, png.length, 'bytes');
}

const iconSvg = svg({ bg: gradientBg, scale: 0.78, dy: -8 });
fs.writeFileSync(path.join(__dirname, 'icon.svg'), iconSvg);

render('icon.png', iconSvg); // iOS/App Store: full-bleed, no transparency
render('favicon.png', iconSvg, 48);
// Android adaptive: keep the mark inside the ~66% safe zone; background is a separate layer.
render('android-icon-foreground.png', svg({ scale: 0.56, dy: -6 }));
render('android-icon-background.png', `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${gradientBg}</svg>`);
render('android-icon-monochrome.png', svg({ scale: 0.56, dy: -6, mono: '#FFFFFF' }));
// Splash: full-colour plant on the app's light background (set in app.json).
render('splash-icon.png', svg({ scale: 0.9, leaves: ['#43A047', '#66BB6A', '#81C784'], stem: '#2E7D32' }));

// Web app (PWA) icons, written to public/ so Expo copies them into the web build.
const pub = path.join(out, '..', 'public');
fs.mkdirSync(pub, { recursive: true });
const renderTo = (dir, file, svgText, size) => {
  const png = new Resvg(svgText, { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(dir, file), png);
  console.log('public/' + file, size);
};
renderTo(pub, 'icon-192.png', iconSvg, 192);
renderTo(pub, 'icon-512.png', iconSvg, 512);
renderTo(pub, 'apple-touch-icon.png', iconSvg, 180);
// Maskable: Android may crop to a circle, so keep the plant inside the central safe zone.
renderTo(pub, 'icon-maskable-512.png', svg({ bg: gradientBg, scale: 0.6, dy: -6 }), 512);
