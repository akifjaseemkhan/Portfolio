import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Boots Lenis smooth scrolling and drives it from GSAP's ticker, so
 * Lenis and every ScrollTrigger stay on the exact same frame clock.
 *
 * Returns a ref holding the Lenis instance (used to lock scroll during
 * the loading screen and project case-study overlay).
 *
 * @param {boolean} enabled - false disables smooth scroll entirely
 *                            (reduced-motion users and touch devices).
 */
export function useSmoothScroll(enabled = true) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const lenis = new Lenis({
      // 1.15s was long enough that the page kept gliding well after the
      // wheel stopped, which reads as "delayed" rather than smooth. Shorter
      // duration + a quicker-settling curve keeps the eased feel but tracks
      // the input much more closely.
      duration: 0.75,
      easing: (t) => 1 - Math.pow(1 - t, 3), // cubic-out: quick, no long tail
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    // Keep ScrollTrigger in sync with Lenis' virtual scroll position.
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}

/** Scrolls to an element id through Lenis when available, else natively. */
export function scrollToSection(id, lenis) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
