/**
 * Generates the placeholder project screenshots in /public/projects.
 *
 * These exist so the carousel has real files to load out of the box.
 * Replace any file with a real PNG/JPG of the same name (and update the
 * extension in src/data/projects.js) once you have actual screenshots.
 *
 *   node scripts/generate-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/projects');
mkdirSync(outDir, { recursive: true });

/** One entry per project: slug, accent colour, and the shots to render. */
const shots = [
  { slug: 'coursetech', tint: '#14F195', frames: ['Course Library', 'Quiz Engine', 'Notes & TTS'] },
  { slug: 'strangermeet', tint: '#00E5FF', frames: ['Landing', 'Live Chat', 'Mobile View'] },
  { slug: 'portfolio', tint: '#7C3AED', frames: ['Hero Workspace', 'Skills Galaxy', 'Project Cubes'] },
  { slug: 'aj-educators', tint: '#14F195', frames: ['Course View', 'Progress Tracking'] },
  { slug: 'bitread', tint: '#7C3AED', frames: ['Reading View', 'Library'] },
  { slug: 'playstore-apps', tint: '#00E5FF', frames: ['App Grid', 'Store Listing'] },
  { slug: 'ecommerce-store', tint: '#F472B6', frames: ['Product Catalogue', 'Checkout Flow'] },
  { slug: 'restaurant-website', tint: '#FBBF24', frames: ['Digital Menu', 'Table Reservations'] },
  { slug: 'admin-dashboard', tint: '#00E5FF', frames: ['Analytics View', 'Data Tables'] },
  { slug: 'ai-design-store', tint: '#7C3AED', frames: ['Storefront', 'Product Page'] },
  { slug: 'etsy-digital', tint: '#14F195', frames: ['Listing Set', 'Mockups'] },
  { slug: 'saas', tint: '#00E5FF', frames: ['Dashboard', 'Billing'] },
];

const svg = (title, subtitle, tint) => `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050816"/><stop offset="100%" stop-color="#0A0F2C"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%">
      <stop offset="0%" stop-color="${tint}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${tint}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0 H0 V40" fill="none" stroke="${tint}" stroke-opacity="0.10" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1280" height="800" fill="url(#bg)"/>
  <rect width="1280" height="800" fill="url(#grid)"/>
  <rect width="1280" height="800" fill="url(#glow)"/>
  <rect x="60" y="60" width="1160" height="680" rx="20" fill="#ffffff" fill-opacity="0.04" stroke="${tint}" stroke-opacity="0.35"/>
  <circle cx="100" cy="100" r="7" fill="#ff5f57"/><circle cx="126" cy="100" r="7" fill="#febc2e"/><circle cx="152" cy="100" r="7" fill="#28c840"/>
  <line x1="60" y1="132" x2="1220" y2="132" stroke="${tint}" stroke-opacity="0.25"/>
  <text x="110" y="330" font-family="Space Grotesk, sans-serif" font-size="62" font-weight="700" fill="#ffffff">${title}</text>
  <text x="112" y="392" font-family="JetBrains Mono, monospace" font-size="30" fill="${tint}">${subtitle}</text>
  <rect x="110" y="450" width="480" height="14" rx="7" fill="#ffffff" fill-opacity="0.12"/>
  <rect x="110" y="486" width="360" height="14" rx="7" fill="#ffffff" fill-opacity="0.09"/>
  <rect x="110" y="522" width="420" height="14" rx="7" fill="#ffffff" fill-opacity="0.06"/>
  <rect x="700" y="440" width="440" height="230" rx="16" fill="${tint}" fill-opacity="0.08" stroke="${tint}" stroke-opacity="0.3"/>
  <text x="1180" y="712" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="18" fill="#ffffff" fill-opacity="0.35">placeholder — replace with a real screenshot</text>
</svg>`;

let count = 0;
for (const { slug, tint, frames } of shots) {
  frames.forEach((frame, i) => {
    writeFileSync(resolve(outDir, `${slug}-${i + 1}.svg`), svg(frame, slug, tint), 'utf8');
    count += 1;
  });
}
console.log(`Generated ${count} placeholder screenshots in public/projects`);
