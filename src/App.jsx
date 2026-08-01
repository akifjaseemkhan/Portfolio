import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import AmbientBackground from './components/ui/AmbientBackground';
import CustomCursor from './components/ui/CustomCursor';
import LoadingScreen from './components/ui/LoadingScreen';
import Navbar from './components/ui/Navbar';
import Hero from './components/sections/Hero';
import { useIsTouch, useReducedMotion } from './hooks/useDevice';
import { useSmoothScroll } from './hooks/useSmoothScroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * Below-the-fold sections are code-split. The hero is the only thing the
 * first paint needs; everything else streams in while the visitor reads it.
 */
const About = lazy(() => import('./components/sections/About'));
const Skills = lazy(() => import('./components/sections/Skills'));
const Services = lazy(() => import('./components/sections/Services'));
const Timeline = lazy(() => import('./components/sections/Timeline'));
const Projects = lazy(() => import('./components/sections/Projects'));
const ExperienceRoom = lazy(() => import('./components/sections/ExperienceRoom'));
const Stats = lazy(() => import('./components/sections/Stats'));
const Certificates = lazy(() => import('./components/sections/Certificates'));
const TechWall = lazy(() => import('./components/sections/TechWall'));
const Contact = lazy(() => import('./components/sections/Contact'));
const Footer = lazy(() => import('./components/sections/Footer'));

/** Placeholder that reserves height so lazy sections don't jolt the scroll. */
function SectionSkeleton() {
  return (
    <div className="grid min-h-[60vh] place-items-center" aria-hidden="true">
      <div className="h-16 w-16 animate-spin-slow rounded-full border border-dashed border-primary/25" />
    </div>
  );
}

/**
 * Sentinel placed inside the Suspense boundary. It can only mount once every
 * lazy section has resolved, which is the signal GSAP needs — a plain effect
 * in App runs while the boundary is still pending, when there is nothing in
 * the DOM to attach ScrollTriggers to.
 */
function SectionsReady({ onReady }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [sectionsReady, setSectionsReady] = useState(false);
  const [heroSceneReady, setHeroSceneReady] = useState(false);
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  // Native scrolling on touch (it already feels right, and Lenis fights the
  // platform's own momentum) and for anyone who asked for reduced motion.
  const lenis = useSmoothScroll(!reduced && !isTouch);

  // Stable identity so the sentinel's effect fires exactly once.
  const handleSectionsReady = useCallback(() => setSectionsReady(true), []);
  const handleHeroSceneReady = useCallback(() => setHeroSceneReady(true), []);

  // Safety net: the loading screen waits for the hero's 3D scene to
  // actually finish warming up (see WarmupSignal in HeroScene.jsx) rather
  // than releasing on a fixed timer, so the site doesn't reveal itself
  // mid-stutter. But that real signal depends on an IntersectionObserver
  // deciding the hero is "near the viewport" and then a few WebGL frames
  // rendering cleanly — if either never happens (an odd browser, reduced
  // motion skipping the canvas, a scene error caught by SceneBoundary),
  // the loader must not wait forever. This forces it through regardless
  // after a generous window.
  useEffect(() => {
    if (heroSceneReady) return undefined;
    const timeout = setTimeout(() => setHeroSceneReady(true), 8000);
    return () => clearTimeout(timeout);
  }, [heroSceneReady]);

  // ── Scroll lock while the loading screen is up ──────────────────────
  useEffect(() => {
    document.body.style.overflow = booted ? '' : 'hidden';
    if (!lenis.current) return;
    if (booted) lenis.current.start();
    else lenis.current.stop();
  }, [booted, lenis]);

  // ── GSAP scroll choreography ────────────────────────────────────────
  useEffect(() => {
    if (!booted || !sectionsReady || reduced) return undefined;

    const ctx = gsap.context(() => {
      // Every section fades and lifts as it enters. Applied here rather than
      // per-component so the timing stays consistent across the whole page.
      gsap.utils.toArray('[data-animate="section"]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 60,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        });
      });
    });

    // Let fonts and the first 3D chunk settle before measuring positions.
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      clearTimeout(refresh);
      ctx.revert();
    };
  }, [booted, sectionsReady, reduced]);

  // Keep ScrollTrigger honest as lazy chunks change document height.
  //
  // This used to observe forever, uncached. On mobile that's a real bug:
  // the address bar collapsing/expanding while scrolling changes the
  // viewport constantly, and any element sized off it re-triggers this
  // observer — each time paying for a full ScrollTrigger.refresh(), which
  // recalculates every trigger's start/end position on the page. That's
  // exactly the kind of unnecessary work that reads as "laggy" scrolling.
  //
  // The observer is only actually needed for the few seconds after boot
  // while lazy chunks are still settling into their final layout height, so
  // it's debounced and torn down once things are quiet.
  useEffect(() => {
    if (!booted) return undefined;

    let debounceTimer;
    let teardownTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(document.body);

    teardownTimer = setTimeout(() => {
      ro.disconnect();
      clearTimeout(debounceTimer);
    }, 4000);

    return () => {
      ro.disconnect();
      clearTimeout(debounceTimer);
      clearTimeout(teardownTimer);
    };
  }, [booted]);

  return (
    <>
      <CustomCursor />
      <AmbientBackground />

      {/* `ready` now waits for the hero's 3D scene to actually finish
          warming up (real GPU work — shader compilation, texture uploads —
          not just "the WebGL context exists"), instead of releasing on a
          fixed timer regardless of whether that work is
          done. That fixed-timer approach was exactly why the site used to
          feel smooth-after-a-few-seconds rather than smooth-on-reveal —
          the loader was disappearing before the heavy part had finished,
          not after. See the safety-timeout effect above for the fallback
          if this signal never arrives. */}
      <LoadingScreen ready={heroSceneReady} onComplete={() => setBooted(true)} />

      {/* Skip link — the first stop for keyboard users, ahead of the canvas */}
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-medium focus:text-base"
      >
        Skip to content
      </a>

      <Navbar lenis={lenis} sectionsReady={sectionsReady} />

      <main className="relative z-10">
        <Hero lenis={lenis} onSceneReady={handleHeroSceneReady} />

        <Suspense fallback={<SectionSkeleton />}>
          <div data-animate="section">
            <About />
          </div>
          <div data-animate="section">
            <Skills />
          </div>
          <div data-animate="section">
            <Services lenis={lenis} />
          </div>
          <div data-animate="section">
            <Timeline />
          </div>
          <div data-animate="section">
            <Projects lenis={lenis} />
          </div>
          <div data-animate="section">
            <ExperienceRoom />
          </div>
          <div data-animate="section">
            <Stats />
          </div>
          <div data-animate="section">
            <Certificates />
          </div>
          <div data-animate="section">
            <TechWall />
          </div>
          <div data-animate="section">
            <Contact />
          </div>
          <SectionsReady onReady={handleSectionsReady} />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer lenis={lenis} />
      </Suspense>
    </>
  );
}
