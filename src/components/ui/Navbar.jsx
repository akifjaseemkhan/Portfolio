import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { navLinks } from '../../data/profile';
import { scrollToSection } from '../../hooks/useSmoothScroll';
import Logo from './Logo';

/**
 * Floating glass navigation with a scroll-spy indicator and a full-screen
 * mobile menu. The active pill slides between links via a shared
 * `layoutId`, so the highlight animates rather than jumping.
 */
/**
 * @param {boolean} sectionsReady - true once the lazy sections have mounted.
 *   The scroll spy cannot work before then: on first mount only `#hero` is in
 *   the DOM, so the observer would watch one element and the active pill
 *   would stay pinned to Home forever.
 */
export default function Navbar({ lenis, sectionsReady = false }) {
  const [active, setActive] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.3 });

  // Scroll spy. Re-runs when `sectionsReady` flips so it picks up every
  // lazily-mounted section, not just the hero.
  useEffect(() => {
    // A narrow band across the upper-middle of the viewport: whichever
    // section overlaps it is the one the visitor is reading.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-25% 0px -70% 0px', threshold: 0 },
    );

    const observed = navLinks
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    observed.forEach((el) => observer.observe(el));

    // The band can fall between two sections (large gaps, or the very
    // bottom of the page), which would leave the pill on a stale entry.
    // This fallback picks the closest section to the top of the viewport.
    const syncClosest = () => {
      const bandY = window.innerHeight * 0.25;
      let bestId = null;
      let bestDist = Infinity;
      observed.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const dist = Math.abs(r.top - bandY);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = el.id;
        }
      });
      if (bestId) setActive(bestId);
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      syncClosest();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [sectionsReady]);

  // The mobile sheet locks scroll while open.
  useEffect(() => {
    if (!lenis?.current) return;
    if (menuOpen) lenis.current.stop();
    else lenis.current.start();
  }, [menuOpen, lenis]);

  const go = (id) => {
    setMenuOpen(false);
    // Let the sheet close before the scroll starts, or it fights the lock.
    setTimeout(() => scrollToSection(id, lenis?.current), menuOpen ? 320 : 0);
  };

  return (
    <>
      {/* Reading progress rail */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left"
      >
        <div className="h-full w-full bg-gradient-to-r from-primary via-secondary to-accent shadow-neon" />
      </motion.div>

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-[60] px-4 pt-4 sm:px-6"
      >
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 sm:px-6 ${
            scrolled ? 'glass glass-edge' : 'bg-transparent'
          }`}
        >
          {/* Logo */}
          <button
            onClick={() => go('hero')}
            className="flex items-center gap-2.5 font-mono text-sm font-bold tracking-widest"
            aria-label="Back to top"
          >
            <span className="relative grid h-8 w-8 place-items-center rounded-lg border border-primary/40 bg-primary/10">
              <Logo className="h-5 w-5" />
              <span className="absolute inset-0 animate-pulse-glow rounded-lg shadow-neon" />
            </span>
            <span className="hidden text-white sm:inline">JD<span className="text-primary">.</span>DEV</span>
          </button>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map(({ id, label }) => (
              <li key={id}>
                <button
                  onClick={() => go(id)}
                  aria-current={active === id ? 'true' : undefined}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                    active === id ? 'text-white' : 'text-white/50 hover:text-white/90'
                  }`}
                >
                  {active === id && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full border border-primary/40 bg-primary/10"
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* CTA + burger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => go('contact')}
              className="hidden rounded-full border border-accent/50 bg-accent/10 px-5 py-2 text-sm font-medium text-accent transition-all duration-300 hover:bg-accent/20 hover:shadow-neon-green sm:block"
            >
              Let&apos;s Talk
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 lg:hidden"
            >
              <span className="relative block h-4 w-5">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  className="absolute left-0 top-0 h-[2px] w-full rounded bg-white"
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="absolute left-0 top-[7px] h-[2px] w-full rounded bg-white"
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  className="absolute bottom-0 left-0 h-[2px] w-full rounded bg-white"
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[59] bg-base/90 backdrop-blur-2xl lg:hidden"
          >
            <ul className="flex h-full flex-col items-center justify-center gap-2">
              {navLinks.map(({ id, label }, i) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={() => go(id)}
                    className={`px-6 py-3 text-3xl font-bold tracking-tight transition-colors ${
                      active === id ? 'text-gradient' : 'text-white/60'
                    }`}
                  >
                    {label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
