import * as THREE from 'three';

/**
 * Procedural textures for the 3D scenes.
 *
 * Everything here is drawn on a canvas at runtime instead of being loaded
 * from disk: zero network requests, zero decode cost, and the palette stays
 * driven by the same tokens as the rest of the site.
 *
 * All builders are memoised — a texture is created once and shared by every
 * mesh that asks for it, so material count stays flat as the scene grows.
 */

const cache = new Map();
const memo = (key, build) => {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
};

/**
 * Supersample factor for screen/panel textures.
 *
 * Most displays report dpr 1, so a 512px texture stretched across a monitor
 * mesh renders roughly 1:1 and any text on it looks soft. Drawing at 2x and
 * letting the GPU minify costs one larger upload and makes the screens crisp.
 */
const SS = 2;

/**
 * Creates a canvas that is `SS` times larger than its logical size, with the
 * 2D context pre-scaled — so all drawing code can use logical coordinates
 * and stays readable.
 */
function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w * SS;
  canvas.height = h * SS;
  const ctx = canvas.getContext('2d');
  ctx.scale(SS, SS);
  return { canvas, ctx };
}

/** Applies the filtering every one of these textures wants. */
function finishTexture(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 16;
  return tex;
}

/** Soft radial glow — used as an additive sprite to fake bloom cheaply. */
export const glowTexture = (color = '#00E5FF') =>
  memo(`glow:${color}`, () => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, color);
    g.addColorStop(0.25, `${color}aa`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });

/** Round soft dot for particle systems. */
export const dotTexture = () =>
  memo('dot', () => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  });

/**
 * Text rendered to a transparent canvas, for use as a billboard sprite.
 *
 * This exists instead of drei's <Text>: troika-three-text fetches Roboto
 * from a CDN and adds a sizeable chunk to the bundle, whereas this reuses
 * the fonts the page has already loaded and costs one small texture.
 *
 * Returns `{ texture, aspect }` — multiply your sprite's width by `aspect`
 * to keep the glyphs from stretching.
 */
export const labelTexture = (text, { color = '#ffffff', size = 112, weight = 600 } = {}) =>
  memo(`label:${text}:${color}:${size}:${weight}`, () => {
    // Rendered at a high glyph size and minified by the GPU through mipmaps.
    // Displays are commonly dpr 1, so a label only covers ~10-15 screen pixels
    // tall — drawing it small and scaling up is what makes 3D text look mushy.
    const font = `${weight} ${size}px "Space Grotesk", system-ui, sans-serif`;
    const pad = Math.round(size * 0.28);

    // Measure first on a throwaway context, then size the real canvas to fit.
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = font;
    const textWidth = Math.ceil(probe.measureText(text).width);

    // Sized exactly to the text. Rounding up to a power of two would pad the
    // canvas by an arbitrary amount, and since the sprite is scaled from the
    // canvas aspect that padding would shrink the glyphs unpredictably.
    // NPOT mipmaps are fully supported under WebGL2, which three uses.
    const w = textWidth + pad * 2;
    const h = Math.ceil(size * 1.5);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // A thin outline is enough to hold the text against bright glows. The
    // previous heavy stroke + large shadow blur bled into the glyph interiors
    // and read as blur once minified.
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(2, size * 0.055);
    ctx.strokeStyle = 'rgba(5,8,22,0.95)';
    ctx.strokeText(text, w / 2, h / 2);

    ctx.fillStyle = color;
    ctx.fillText(text, w / 2, h / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    // Keeps labels sharp when viewed at a glancing angle.
    tex.anisotropy = 16;
    // The whole canvas maps onto the sprite, so the sprite must use the
    // canvas aspect to keep the glyphs from stretching.
    tex.aspect = w / h;
    return tex;
  });

/** Brushed-metal-ish normal noise for the desk and hardware surfaces. */
export const noiseTexture = () =>
  memo('noise', () => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 118 + Math.random() * 20;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  });

/**
 * Holographic UI panel: grid, header bar, bar chart and readout lines.
 * `seed` varies the generated content so panels don't look cloned.
 */
export const hologramTexture = (color = '#00E5FF', seed = 0) =>
  memo(`holo:${color}:${seed}`, () => {
    const w = 512;
    const h = 320;
    const { canvas, ctx } = makeCanvas(w, h);
    const rand = mulberry32(seed + 1);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,10,30,0.35)';
    ctx.fillRect(0, 0, w, h);

    // Border + corner brackets
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.lineWidth = 5;
    const c = 34;
    [[8, 8, 1, 1], [w - 8, 8, -1, 1], [8, h - 8, 1, -1], [w - 8, h - 8, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x + sx * c, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + sy * c);
      ctx.stroke();
    });

    // Inner grid
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 1;
    for (let x = 28; x < w - 20; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x, h - 24);
      ctx.stroke();
    }
    for (let y = 28; y < h - 20; y += 26) {
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(w - 24, y);
      ctx.stroke();
    }

    // Header
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = color;
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText(['SYS.MONITOR', 'NET.TRACE', 'BUILD.LOG', 'GPU.STATS', 'DEPLOY.EDGE', 'AI.PIPELINE'][seed % 6], 28, 52);
    ctx.fillRect(28, 62, w - 56, 2);

    // Bar chart
    for (let i = 0; i < 14; i += 1) {
      const bh = 20 + rand() * 92;
      ctx.globalAlpha = 0.28 + rand() * 0.5;
      ctx.fillRect(30 + i * 24, h - 60 - bh, 14, bh);
    }

    // Readout lines
    ctx.globalAlpha = 0.55;
    ctx.font = '14px "JetBrains Mono", monospace';
    for (let i = 0; i < 4; i += 1) {
      ctx.fillText(
        `${['LAT', 'MEM', 'CPU', 'FPS'][i]} ${(rand() * 100).toFixed(1)}%`,
        300,
        104 + i * 22,
      );
    }

    ctx.globalAlpha = 1;
    return finishTexture(canvas);
  });

/**
 * The monitor's animated code editor.
 *
 * Returns `{ texture, update }`. Call `update(elapsed)` from a frame loop —
 * it redraws only when a new character or line is due, so a full canvas
 * repaint does not happen every single frame.
 */
export function createCodeTexture() {
  const w = 512;
  const h = 320;
  const { canvas, ctx } = makeCanvas(w, h);
  const texture = finishTexture(canvas);

  const LINES = [
    ['const ', 'workspace', ' = useRef(null)'],
    ['', '', ''],
    ['function ', 'Portfolio', '() {'],
    ['  const ', '{ camera }', ' = useThree()'],
    ['', '', ''],
    ['  useFrame((state) => {'],
    ['    const t = state.clock.elapsedTime'],
    ['    camera.position.x = Math.sin(t) * 2'],
    ['    camera.lookAt(0, 0.6, 0)'],
    ['  })'],
    ['', '', ''],
    ['  return <Workspace ref={workspace} />'],
    ['}'],
    ['', '', ''],
    ['export default ', 'Portfolio'],
  ];
  const COLORS = ['#7C3AED', '#00E5FF', '#E6EDF3'];

  let typed = 0; // characters revealed
  let lastDraw = -1;
  const total = LINES.reduce((n, l) => n + l.join('').length + 1, 0);

  const draw = (chars) => {
    ctx.fillStyle = '#0A0F1E';
    ctx.fillRect(0, 0, w, h);

    // Window chrome
    ctx.fillStyle = '#141B2E';
    ctx.fillRect(0, 0, w, 26);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(18 + i * 18, 13, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#7d8590';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Portfolio.jsx', 86, 17);

    ctx.font = '13px "JetBrains Mono", monospace';
    let budget = chars;
    let y = 48;

    for (let i = 0; i < LINES.length && budget > 0; i += 1) {
      // Gutter
      ctx.fillStyle = '#30363D';
      ctx.fillText(String(i + 1).padStart(2, ' '), 10, y);

      let x = 38;
      for (let s = 0; s < LINES[i].length && budget > 0; s += 1) {
        const seg = LINES[i][s];
        const shown = seg.slice(0, budget);
        ctx.fillStyle = COLORS[s] ?? '#E6EDF3';
        ctx.fillText(shown, x, y);
        x += ctx.measureText(shown).width;
        budget -= seg.length;
      }
      budget -= 1; // newline

      // Blinking caret on the line currently being typed
      if (budget <= 0) {
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(x + 1, y - 11, 7, 14);
      }
      y += 18;
    }
  };

  draw(0);

  return {
    texture,
    /** @param {number} elapsed seconds since scene start */
    update(elapsed) {
      // ~34 chars/sec, looping with a pause at the end of the file.
      const cycle = total / 34 + 3.5;
      const t = elapsed % cycle;
      typed = Math.min(total, Math.floor(t * 34));
      if (typed === lastDraw) return;
      lastDraw = typed;
      draw(typed);
      texture.needsUpdate = true;
    },
    dispose() {
      texture.dispose();
    },
  };
}

/**
 * The laptop screen: a live, self-drawing miniature of this portfolio.
 *
 * Rendering it to a canvas rather than embedding real DOM in the scene
 * keeps it inside the WebGL pass — no overlay compositing, no occlusion
 * glitches, and it costs one texture upload per changed frame.
 *
 * Returns `{ texture, update(elapsed) }`.
 */
export function createPortfolioTexture() {
  const w = 512;
  const h = 320;
  const { canvas, ctx } = makeCanvas(w, h);
  const texture = finishTexture(canvas);

  const ROLES = ['Full-Stack Developer', 'Android Developer', 'UI/UX Designer', 'AI Design Creator'];
  let lastKey = '';

  const roundRect = (x, y, rw, rh, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + rw, y, x + rw, y + rh, r);
    ctx.arcTo(x + rw, y + rh, x, y + rh, r);
    ctx.arcTo(x, y + rh, x, y, r);
    ctx.arcTo(x, y, x + rw, y, r);
    ctx.closePath();
  };

  const draw = (t) => {
    // Background wash matching the real site
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#050816');
    bg.addColorStop(1, '#0A0F2C');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(0,229,255,0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Aurora bloom, drifting
    const glow = ctx.createRadialGradient(
      w * 0.5 + Math.sin(t * 0.4) * 60,
      70,
      0,
      w * 0.5,
      70,
      240,
    );
    glow.addColorStop(0, 'rgba(0,229,255,0.28)');
    glow.addColorStop(1, 'rgba(0,229,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // ── Nav bar ──────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    roundRect(20, 16, w - 40, 30, 15);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.stroke();

    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.fillText('AJK.DEV', 34, 36);

    ctx.font = '11px "Space Grotesk", sans-serif';
    ['Home', 'Work', 'About', 'Contact'].forEach((item, i) => {
      ctx.fillStyle = i === 0 ? '#ffffff' : 'rgba(255,255,255,0.45)';
      ctx.fillText(item, 300 + i * 50, 36);
    });

    // ── Hero copy ────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('◆  AVAILABLE FOR WORK', 34, 92);

    const grad = ctx.createLinearGradient(34, 0, 380, 0);
    grad.addColorStop(0, '#00E5FF');
    grad.addColorStop(0.55, '#7C3AED');
    grad.addColorStop(1, '#14F195');
    ctx.fillStyle = grad;
    ctx.font = 'bold 40px "Space Grotesk", sans-serif';
    // Abbreviated form of the real name — the full "Akif Jaseem Khan" at
    // this font size would overflow the 512px canvas width.
    ctx.fillText('AKIF J. KHAN', 32, 134);

    // Rotating role with a typewriter caret, mirroring the real hero
    const roleIdx = Math.floor(t / 2.4) % ROLES.length;
    const roleT = (t / 2.4) % 1;
    const role = ROLES[roleIdx];
    // Type in over the first 45% of the slot, hold, then it swaps.
    const shown = role.slice(0, Math.ceil(role.length * Math.min(1, roleT / 0.45)));
    ctx.fillStyle = '#ffffff';
    ctx.font = '15px "JetBrains Mono", monospace';
    ctx.fillText(shown, 34, 160);
    if (Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = '#14F195';
      ctx.fillRect(36 + ctx.measureText(shown).width, 148, 8, 14);
    }

    // ── CTA buttons ──────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0,229,255,0.16)';
    roundRect(32, 178, 104, 28, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,255,0.6)';
    ctx.stroke();
    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    ctx.fillText('View Projects', 48, 196);

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    roundRect(146, 178, 88, 28, 14);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Contact', 170, 196);

    // ── Project cards ────────────────────────────────────────────
    const cards = [
      { label: 'CourseTech', tint: '#14F195' },
      { label: 'StrangerMeet', tint: '#00E5FF' },
      { label: 'Portfolio', tint: '#7C3AED' },
    ];
    cards.forEach((card, i) => {
      const x = 32 + i * 152;
      // Cards breathe out of phase with each other.
      const lift = Math.sin(t * 1.2 + i) * 3;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(x, 228 + lift, 136, 62, 10);
      ctx.fill();
      ctx.strokeStyle = `${card.tint}66`;
      ctx.stroke();

      ctx.fillStyle = card.tint;
      roundRect(x + 12, 240 + lift, 22, 22, 6);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.fillText(card.label, x + 42, 254 + lift);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('View case study →', x + 42, 268 + lift);
    });

    // Scanline sweep
    const sy = ((t * 0.3) % 1) * h;
    const sl = ctx.createLinearGradient(0, sy - 30, 0, sy + 30);
    sl.addColorStop(0, 'rgba(255,255,255,0)');
    sl.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    sl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sl;
    ctx.fillRect(0, sy - 30, w, 60);
  };

  draw(0);

  return {
    texture,
    update(elapsed) {
      // Throttle to ~20fps: the screen is small on-screen and a texture
      // upload every frame is the single most expensive thing here.
      const key = Math.floor(elapsed * 20);
      if (String(key) === lastKey) return;
      lastKey = String(key);
      draw(elapsed);
      texture.needsUpdate = true;
    },
    dispose() {
      texture.dispose();
    },
  };
}

/** Small deterministic PRNG so generated panels are stable across renders. */
function mulberry32(a) {
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Frees every cached texture (called on hard scene teardown). */
export function disposeTextureCache() {
  cache.forEach((tex) => tex.dispose?.());
  cache.clear();
}
