import { useEffect, useRef } from 'react';

/**
 * Tracks the pointer in normalised device coordinates (-1 → 1) inside a
 * ref rather than state, so high-frequency mouse movement never triggers
 * a React re-render. 3D scenes read `.current` inside their frame loop.
 */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      pointer.current.tx = 0;
      pointer.current.ty = 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return pointer;
}

/**
 * Counts up to `target` when the returned ref scrolls into view.
 * Uses an easing curve rather than a linear ramp so the number
 * decelerates into its final value.
 */
export function useCountUp(target, duration = 2000, start = false) {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (!start || !nodeRef.current) return undefined;

    const node = nodeRef.current;
    let raf;
    const t0 = performance.now();

    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4); // quart-out
      node.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return nodeRef;
}
