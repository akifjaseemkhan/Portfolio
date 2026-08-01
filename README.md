# Akif Khan — Interactive 3D Portfolio

A cinematic, dark-cyberpunk portfolio built as a WebGL experience rather than a page:
a fully modelled 3D workspace, a navigable skills galaxy, holographic project cubes
and a transforming experience room.

**Stack** — React 18 · Vite 6 · TailwindCSS 3 · Three.js · React Three Fiber · drei ·
Framer Motion · GSAP (ScrollTrigger) · Lenis

---

## Getting started

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

Then `npm run preview` to serve the production build locally.

---

## Editing content

**All copy lives in `src/data/` — you should never need to touch a component to update the site.**

| File | Controls |
|---|---|
| `src/data/profile.js` | Name, rotating job titles, About panels, contact channels, statistics, nav links |
| `src/data/skills.js` | The skills galaxy + category filters |
| `src/data/projects.js` | Project cubes and their fullscreen case studies |
| `src/data/timeline.js` | The journey timeline |
| `src/data/experience.js` | Experience room, certificates, tech stack wall |

### Adding a project

Append an object to the `projects` array in `src/data/projects.js`. Cube position,
colour, layout and the case-study page are all derived — nothing else changes.

```js
{
  id: 'my-project',
  title: 'My Project',
  subtitle: 'One-line description',
  year: '2026',
  status: 'shipped',            // shipped | live | building | planned
  accent: '#00E5FF',           // cube glow colour
  description: 'Long-form overview…',
  technologies: ['React', 'Node.js'],
  features: ['Feature one', 'Feature two'],
  stats: [{ label: 'Users', value: '10k' }],
  images: ['/projects/my-project-1.svg'],
  links: { live: 'https://…', repo: 'https://…' },  // null hides the button
}
```

### Adding a skill

Append to `skills` in `src/data/skills.js`. Positions come from `buildGalaxy()`,
which spreads everything over a Fibonacci sphere — so the galaxy stays evenly
distributed at any count.

### Screenshots

`public/projects/` ships with generated SVG placeholders. Drop in real PNG/JPGs and
update the `images` paths. To regenerate the placeholders:

```bash
node scripts/generate-placeholders.mjs
```

---

## Changing the colour scheme

Two places, both token-driven:

1. `src/index.css` → the `:root` block (`--c-base`, `--c-primary`, `--c-secondary`, `--c-accent`)
2. `tailwind.config.js` → `theme.extend.colors`

Every component, glow, gradient and 3D material reads from those tokens.

---

## Changing the logo

The brand mark is a hexagonal "chip" frame around a geometric "A", with three
small corner nodes standing in for the three initials (A·J·K). It's defined
in exactly one place — `src/components/ui/Logo.jsx` — and reused in the
navbar, footer and loading screen.

`public/favicon.svg` mirrors the same path coordinates for the browser tab
icon, since a static asset can't render the React component. If you redesign
the mark, update both files with matching geometry, then regenerate
`public/og-image.svg`'s icon group (same paths, scaled up) to keep the share
card in sync.

---

## Architecture

```
src/
├─ data/            all editable content (see table above)
├─ hooks/
│  ├─ useSmoothScroll.js   Lenis, driven off the GSAP ticker
│  ├─ useDevice.js         quality tiers, media queries, scene visibility gating
│  └─ usePointer.js        ref-based pointer tracking + count-up
├─ three/
│  ├─ textures.js          every texture, drawn procedurally on canvas
│  ├─ primitives.jsx       Glow, Label, ParticleField, HoloPanel, Ripple, LightStrip
│  ├─ Workspace.jsx        the desk: monitor, laptop, keyboard, mouse, mug, plants
│  ├─ HeroScene.jsx        hero canvas, cinematic camera rig, lighting
│  ├─ GalaxyScene.jsx      skills galaxy
│  ├─ ProjectsScene.jsx    holographic project cubes
│  └─ RoomScene.jsx        experience room
└─ components/
   ├─ ui/                  cursor, navbar, loading screen, background, buttons, brand mark (Logo.jsx)
   └─ sections/            one file per page section
```

### Performance model

The page hosts four separate WebGL canvases, so a few things are deliberate:

- **Visibility gating.** `useSceneVisibility` mounts a scene the first time it nears
  the viewport and sets `frameloop="never"` whenever it is off screen. Only one
  canvas renders at a time in practice.
- **Quality tiers.** `useQualityTier` picks `low`/`medium`/`high` from CPU cores,
  device memory and viewport, and `QUALITY_PRESETS` scales DPR, particle counts,
  shadows and antialiasing off it. Edit the presets to rebalance globally.
- **Runtime adaptation.** drei's `PerformanceMonitor` + `AdaptiveDpr` shed resolution
  if frames start slipping.
- **Zero downloaded assets.** Every texture is drawn on a canvas at runtime
  (`src/three/textures.js`) and the environment map is built from `Lightformer`s —
  no HDRs, no models, no texture files, nothing to 404. Labels are canvas sprites
  rather than drei `<Text>`, which avoids fetching a CDN font and shipping troika.
- **Code splitting.** `three`, `@react-three/*` and the motion libraries are manual
  chunks; every section below the hero is `React.lazy`.
- **No per-frame React state.** The cursor, pointer tracking and all 3D animation
  write straight to refs and `style.transform`, so nothing re-renders at 60 FPS.

### Accessibility

The 3D scenes are decorative and cannot hold focus, so every one of them has a real
DOM equivalent that is the actual navigation path:

- Skills — a `<details>` list of all skills with proficiencies
- Projects — a keyboard-reachable button grid below the cube array
- Experience room — a proper `tablist` of disciplines
- `prefers-reduced-motion` disables Lenis, the custom cursor, GSAP reveals and the
  typewriter, and pins the particle canvas to a single static frame
- Skip link, semantic landmarks, `aria-live` regions for the typewriter and form status

---

## Deploying

Any static host. Output is `dist/`.

- **Cloudflare Pages** — build `npm run build`, output `dist`
- **Vercel / Netlify** — auto-detected

Before going live, update the absolute URLs in `index.html` (`og:url`, `canonical`,
`og:image`) and the `sameAs` links in the JSON-LD block to your real domain.

---

## Known placeholders

These are stand-ins to replace with real values:

- `public/projects/*.svg` — generated placeholder screenshots
- **The LinkedIn URL** in `contactChannels` (`src/data/profile.js`) is still
  guessed from the `akifjaseemkhan` handle. Replace its `href` with the real
  profile link. Email and GitHub are both real.
- The displayed name is `profile.name` in `src/data/profile.js`. The hero splits it
  automatically via `nameLines()`, so changing it there updates the hero, loading
  screen, footer and page title together.
- `statistics` values in `src/data/profile.js`
- The certificate list in `src/data/experience.js`
- `https://ajk.dev` throughout `index.html` and the portfolio project's `live` link — register the real domain, then swap it in

The contact form opens the visitor's mail client via `mailto:` so it works with no
backend. To use a real endpoint, replace `sendMessage` in
`src/components/sections/Contact.jsx` with a `fetch()` — the transmission animation
and status states already handle success and failure.
