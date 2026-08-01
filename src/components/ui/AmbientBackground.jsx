import { useEffect, useRef } from 'react';
import { useQualityTier, QUALITY_PRESETS, useReducedMotion } from '../../hooks/useDevice';

/**
 * The fixed atmosphere behind every section: drifting particles + stars on
 * a canvas, plus CSS layers for aurora, moving grid, fog and vignette.
 *
 * Deliberately 2D — it costs a fraction of a WebGL pass, which keeps the
 * frame budget free for the actual 3D scenes.
 */
export default function AmbientBackground() {
  const canvasRef = useRef(null);
  const tier = useQualityTier();
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    const preset = QUALITY_PRESETS[tier];

    let width = 0;
    let height = 0;
    let particles = [];
    /** Offscreen canvas holding the pre-rendered star field. */
    let stars = null;
    let raf;
    const pointer = { x: -9999, y: -9999 };

    // Cap DPR at 1.5 — a full-screen particle canvas at DPR 3 is pure waste.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const COLORS = ['#00E5FF', '#7C3AED', '#14F195'];

    // Just updates the backing store / transform — used for the common case
    // of a mobile browser's address bar collapsing while scrolling, which
    // changes innerHeight by 50-100px many times a second but doesn't
    // warrant reallocating every particle and repainting the star field.
    const resizeCanvasOnly = () => {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      resizeCanvasOnly();
      build();
    };

    const build = () => {
      // Scale counts to viewport area so a phone doesn't draw desktop density.
      const areaScale = Math.min(1, (width * height) / (1920 * 1080));
      const pCount = Math.round(preset.particles * 0.16 * Math.max(0.3, areaScale));
      const sCount = Math.round(preset.stars * 0.4 * Math.max(0.35, areaScale));

      particles = Array.from({ length: pCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.7 + 0.4,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -Math.random() * 0.22 - 0.04, // gentle upward drift
        a: Math.random() * 0.5 + 0.12,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        tw: Math.random() * Math.PI * 2,
      }));

      // Stars are static, so they are painted once into an offscreen canvas
      // and blitted as a single drawImage each frame. Re-drawing a thousand
      // arcs per frame for a field that never moves was the most expensive
      // thing on the page's main thread.
      stars = document.createElement('canvas');
      stars.width = width;
      stars.height = height;
      const sctx = stars.getContext('2d');
      sctx.fillStyle = '#ffffff';
      for (let i = 0; i < sCount; i += 1) {
        const r = Math.random() * 0.9 + 0.2;
        sctx.globalAlpha = Math.random() * 0.5 + 0.12;
        // fillRect beats arc() for sub-pixel dots and looks identical here.
        sctx.fillRect(Math.random() * width, Math.random() * height, r * 2, r * 2);
      }
      sctx.globalAlpha = 1;
    };

    /** Renders exactly one frame. Kept separate from the loop so that
     *  reduced-motion users get a single static draw, not a rAF chain. */
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // ── Stars: one blit of the pre-rendered field ────────────────
      if (stars) ctx.drawImage(stars, 0, 0);

      // ── Particles: drift, wrap, and repel from the cursor ────────
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.02;

        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 18000) {
          const f = (1 - d2 / 18000) * 0.9;
          const d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.globalAlpha = p.a * (0.6 + Math.sin(p.tw) * 0.4);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    // Capped to ~40fps. This canvas is purely decorative, and rAF runs at
    // the display's native refresh rate — on a 90/120Hz phone that's 1.5-2x
    // the draw work of a 60Hz screen for a background nobody is scrutinizing
    // frame-by-frame. Capping it is free smoothness headroom elsewhere.
    const FRAME_INTERVAL = 1000 / 40;
    let lastFrameTime = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (now - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = now;
      draw();
    };

    const onPointer = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    // Pause the loop when the tab is hidden — no point burning cycles.
    const onVisibility = () => {
      if (reduced) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduced) draw();
    else raf = requestAnimationFrame(frame);

    // Debounced, and skips the expensive rebuild for height-only changes
    // (mobile address-bar collapse/expand) — only the canvas backing store
    // is resized in that case, which is enough to avoid any visual artifact.
    let resizeTimer;
    const HEIGHT_ONLY_THRESHOLD = 150;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        const widthChanged = newWidth !== width;
        const heightJump = Math.abs(newHeight - height) > HEIGHT_ONLY_THRESHOLD;

        width = newWidth;
        height = newHeight;

        if (widthChanged || heightJump) {
          resize(); // real resize: reallocate particles and repaint stars
        } else {
          resizeCanvasOnly(); // just the address-bar wobble: cheap path
        }
        if (reduced) draw(); // the loop isn't running to repaint for us
      }, 120);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [tier, reduced]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base wash */}
      <div className="absolute inset-0 bg-base" />

      {/* Aurora glow — two soft colour blooms.
          This used to be a hard-edged conic-gradient shape smoothed out
          with `filter: blur(120-130px)`, continuously rotated. That's about
          as expensive as a CSS effect gets: blurring a shape that large
          means re-compositing a bitmap roughly the size of the viewport,
          and doing it on every single animation frame because the shape
          was also rotating — forever, on every page, the whole time this
          site is open, regardless of what else is happening. A radial-
          gradient fades to transparent on its own with no separate blur
          pass needed, and is static — same soft ambient-glow read, close
          to zero ongoing cost. */}
      <div
        className="absolute -left-1/3 top-[-20%] h-[70vmax] w-[70vmax] rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle, #00E5FF 0%, #7C3AED 45%, transparent 72%)',
        }}
      />
      <div
        className="absolute -right-1/4 bottom-[-25%] h-[60vmax] w-[60vmax] rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(circle, #14F195 0%, #00E5FF 45%, transparent 72%)',
        }}
      />

      {/* Moving perspective grid */}
      <div className="absolute inset-0 [perspective:600px]">
        <div
          className="cyber-grid absolute inset-x-[-50%] bottom-0 h-[120%] opacity-[0.28]"
          style={{ transform: 'rotateX(72deg)', maskImage: 'linear-gradient(to top, #000, transparent 65%)' }}
        />
      </div>

      {/* Particles + stars */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Fog + vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,229,255,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(124,58,237,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-grid-fade" />

      {/* Faint scanline film */}
      <div className="hologram-lines absolute inset-0 opacity-[0.35] mix-blend-overlay" />
    </div>
  );
}
