import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { nameLines, profile } from '../../data/profile';
import { useQualityTier, useReducedMotion, useSceneVisibility } from '../../hooks/useDevice';
import { usePointer } from '../../hooks/usePointer';
import { scrollToSection } from '../../hooks/useSmoothScroll';
import MagneticButton from '../ui/MagneticButton';
import SceneBoundary from '../ui/SceneBoundary';

// The 3D stack is the heaviest code in the bundle — load it only when the
// hero actually mounts, so the loading screen paints immediately.
const HeroScene = lazy(() => import('../../three/HeroScene'));

/** Rotating typewriter for the job titles. */
function Typewriter({ words, typeSpeed = 55, deleteSpeed = 28, hold = 1700 }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | holding | deleting
  const reduced = useReducedMotion();

  useEffect(() => {
    // Reduced motion: show the full title, no character animation.
    if (reduced) {
      setText(words[index]);
      const t = setTimeout(() => setIndex((i) => (i + 1) % words.length), 2600);
      return () => clearTimeout(t);
    }

    const word = words[index];
    let timer;

    if (phase === 'typing') {
      if (text.length < word.length) {
        timer = setTimeout(() => setText(word.slice(0, text.length + 1)), typeSpeed);
      } else {
        timer = setTimeout(() => setPhase('deleting'), hold);
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timer = setTimeout(() => setText(word.slice(0, text.length - 1)), deleteSpeed);
      } else {
        setIndex((i) => (i + 1) % words.length);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timer);
  }, [text, phase, index, words, typeSpeed, deleteSpeed, hold, reduced]);

  return (
    <span className="inline-flex items-center">
      {/* aria-live so screen readers hear each title once it settles */}
      <span className="text-gradient font-semibold" aria-live="polite">
        {text || ' '}
      </span>
      <motion.span
        aria-hidden="true"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        className="ml-1 inline-block h-[1.1em] w-[3px] translate-y-[0.12em] bg-accent"
        style={{ boxShadow: '0 0 10px #14F195' }}
      />
    </span>
  );
}

/** Lightweight stand-in while the WebGL bundle streams in. */
function SceneFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-40 w-40">
        <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-primary/30" />
        <div className="absolute inset-6 animate-pulse-glow rounded-full bg-primary/10 blur-xl" />
      </div>
    </div>
  );
}

export default function Hero({ lenis, onSceneReady }) {
  const sectionRef = useRef(null);
  const quality = useQualityTier();
  const reduced = useReducedMotion();
  const pointer = usePointer();
  const [sceneReady, setSceneReady] = useState(false);
  // The hero is above the fold so it mounts immediately; this only gates
  // the frameloop, so scrolling away stops the GPU work.
  const scene = useSceneVisibility();

  // Parallax the copy and fade the whole hero as it scrolls away.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Introduction"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden"
    >
      {/* ── 3D workspace ─────────────────────────────────────────── */}
      <motion.div
        ref={scene.ref}
        style={{ scale: sceneScale, opacity }}
        className="absolute inset-0 z-[1]"
        aria-hidden="true"
      >
        <SceneBoundary label="The 3D workspace">
          <Suspense fallback={<SceneFallback />}>
            {/* Gated on `mounted`, not just rendered unconditionally: this
                lets the hero's WebGL context (the heaviest of the four —
                full desk, instanced keyboard, several lights) actually get
                released once the visitor has scrolled deep into the page,
                instead of sitting alive for the rest of the visit. */}
            {scene.mounted && (
              <HeroScene
                quality={quality}
                pointer={pointer}
                reduced={reduced}
                active={scene.visible}
                onReady={() => {
                  setSceneReady(true);
                  onSceneReady?.();
                }}
              />
            )}
          </Suspense>
        </SceneBoundary>
      </motion.div>

      {/* Readability scrim — the copy has to win against a bright scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(5,8,22,0.75)_0%,rgba(5,8,22,0.25)_35%,rgba(5,8,22,0.55)_75%,#050816_100%)]"
      />

      {/* ── Copy ─────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: copyY, opacity }}
        className="relative z-[3] mx-auto flex h-full max-w-6xl flex-col justify-center px-6 pt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="label-mono !text-accent">Available for work</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          // Fluid size: the name is three words now, so a fixed scale would
          // overflow narrow viewports. clamp() keeps it as large as it fits.
          className="text-[clamp(2.4rem,8.5vw,6.5rem)] font-bold leading-[0.95] tracking-tight"
        >
          <span className="block text-white text-glow">{nameLines()[0].toUpperCase()}</span>
          <span className="block text-gradient">{nameLines()[1].toUpperCase()}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="mt-7 min-h-[2.6em] font-mono text-lg sm:text-2xl lg:text-3xl"
        >
          <span className="mr-2 text-white/35">&gt;</span>
          <Typewriter words={profile.titles} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg"
        >
          {profile.bio}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton
            onClick={() => scrollToSection('projects', lenis?.current)}
            className="border border-primary/50 bg-primary/10 text-primary shadow-neon"
            glow="#00E5FF"
          >
            Explore Projects
            <span aria-hidden="true">→</span>
          </MagneticButton>

          <MagneticButton
            onClick={() => scrollToSection('contact', lenis?.current)}
            className="border border-white/15 text-white/80 hover:text-white"
            glow="#7C3AED"
          >
            Get in Touch
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Scroll cue ───────────────────────────────────────────── */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 z-[3] -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="label-mono !text-[0.6rem]">Scroll</span>
          <span className="h-12 w-[1px] bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </motion.div>

      {/* Corner HUD — reinforces the "digital workspace" framing */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] hidden lg:block">
        <div className="absolute right-8 top-28 space-y-1.5 text-right font-mono text-[10px] text-white/25">
          <p>SYS · {sceneReady ? 'ONLINE' : 'BOOTING'}</p>
          <p>RENDER · {quality.toUpperCase()}</p>
          <p>LOC · {profile.location}</p>
        </div>
        <div className="absolute bottom-10 left-8 space-y-1.5 font-mono text-[10px] text-white/25">
          <p>© {new Date().getFullYear()} AKIF KHAN</p>
          <p>WEBGL · WORKSPACE_01</p>
        </div>
        {/* Framing brackets */}
        <span className="absolute left-6 top-24 h-10 w-10 border-l border-t border-primary/25" />
        <span className="absolute right-6 top-24 h-10 w-10 border-r border-t border-primary/25" />
        <span className="absolute bottom-6 left-6 h-10 w-10 border-b border-l border-primary/25" />
        <span className="absolute bottom-6 right-6 h-10 w-10 border-b border-r border-primary/25" />
      </div>
    </section>
  );
}
