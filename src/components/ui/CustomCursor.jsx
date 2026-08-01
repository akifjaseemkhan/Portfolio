import { useEffect, useRef } from 'react';
import { useIsTouch, useReducedMotion } from '../../hooks/useDevice';

// Fewer trail particles: each one is a DOM write every animation frame, for
// the entire time the cursor moves, on every page — trimming this is pure
// upside since the visual difference at 9 vs 14 is negligible.
const TRAIL_COUNT = 9;

/**
 * Glowing custom cursor with a particle trail.
 *
 * Everything runs on a single rAF loop writing directly to `style.transform`
 * — no React state per frame, so the cursor cannot cause re-renders and
 * stays pinned to the pointer even while heavy 3D scenes are drawing.
 *
 * Interactive elements grow the ring automatically: any `a`, `button`,
 * `[role=button]` or `[data-cursor]` element is detected on hover.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRefs = useRef([]);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();

  useEffect(() => {
    // Touch devices have no pointer to follow; reduced-motion users opt out.
    if (isTouch || reduced) return undefined;

    document.body.classList.add('custom-cursor-active');

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: mouse.x, y: mouse.y, scale: 1 };
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({ x: mouse.x, y: mouse.y }));
    let hovering = false;
    let raf;

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
      }
      if (idle) {
        idle = false;
        raf = requestAnimationFrame(loop);
      }
    };

    // Delegated hover detection — works for elements added later.
    const onOver = (e) => {
      const t = e.target;
      hovering = !!(t.closest && t.closest('a, button, [role="button"], [data-cursor="hover"], input, textarea'));
    };

    const onDown = () => {
      ring.scale = 0.72;
      spawnRipple(mouse.x, mouse.y);
    };
    const onUp = () => {
      ring.scale = 1;
    };

    /** One-off expanding ring on click. */
    const spawnRipple = (x, y) => {
      const el = document.createElement('span');
      el.className = 'pointer-events-none fixed z-[9998] rounded-full';
      el.style.cssText = `left:${x}px;top:${y}px;width:14px;height:14px;margin:-7px 0 0 -7px;border:1px solid rgba(0,229,255,.9);transition:transform .6s cubic-bezier(.16,1,.3,1),opacity .6s ease-out;`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = 'scale(7)';
        el.style.opacity = '0';
      });
      setTimeout(() => el.remove(), 650);
    };

    // Idle detection: once the pointer, ring and every trail dot have all
    // settled to within a fraction of a pixel of their target, the loop
    // stops rescheduling itself instead of running forever at full rAF rate
    // for a cursor that isn't visibly moving. It restarts the moment the
    // pointer moves again.
    const SETTLE_EPS = 0.05;
    let idle = false;

    const loop = () => {
      // Ring lags the dot for weight; lerp factor tuned by feel.
      const dxRing = mouse.x - ring.x;
      const dyRing = mouse.y - ring.y;
      ring.x += dxRing * 0.16;
      ring.y += dyRing * 0.16;
      const target = hovering ? 1.9 : ring.scale;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${target})`;
        ringRef.current.style.borderColor = hovering
          ? 'rgba(20,241,149,.9)'
          : 'rgba(0,229,255,.75)';
      }

      // Chain each trail particle toward the one in front of it.
      let px = mouse.x;
      let py = mouse.y;
      let settled = Math.abs(dxRing) < SETTLE_EPS && Math.abs(dyRing) < SETTLE_EPS;
      trail.forEach((p, i) => {
        const dx = px - p.x;
        const dy = py - p.y;
        p.x += dx * 0.34;
        p.y += dy * 0.34;
        if (Math.abs(dx) >= SETTLE_EPS || Math.abs(dy) >= SETTLE_EPS) settled = false;
        px = p.x;
        py = p.y;
        const node = trailRefs.current[i];
        if (node) {
          const s = 1 - i / TRAIL_COUNT;
          node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${s})`;
          node.style.opacity = `${s * 0.5}`;
        }
      });

      if (settled) {
        idle = true; // loop stops; onMove restarts it
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isTouch, reduced]);

  if (isTouch || reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]">
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => {
        const color = i % 2 ? 'var(--c-primary)' : 'var(--c-secondary)';
        return (
          <span
            key={i}
            ref={(el) => {
              trailRefs.current[i] = el;
            }}
            className="fixed left-0 top-0 h-2 w-2 rounded-full"
            style={{
              background: color,
              // A soft glow via box-shadow reads almost identically to the
              // blur(2px) this replaced, but costs far less: `filter: blur`
              // forces the browser to re-rasterize and re-blur this element
              // every single frame it moves, for as long as the cursor is
              // active on the page — with nine of these, permanently, that
              // was real, sitewide cost for a barely-visible softening.
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        );
      })}
      <span
        ref={ringRef}
        className="fixed left-0 top-0 h-8 w-8 rounded-full border transition-[border-color] duration-300"
        style={{ boxShadow: '0 0 18px rgba(0,229,255,.35)' }}
      />
      <span
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-white"
        style={{ boxShadow: '0 0 12px rgba(255,255,255,.9)' }}
      />
    </div>
  );
}
