import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '../../data/profile';

/**
 * Boot sequence shown before the experience is revealed.
 *
 * The progress bar blends two signals so it never lies to the visitor:
 *   • a scripted floor, so the bar always feels alive, and
 *   • `onReady` from the app, which gates the final jump to 100%.
 * It parks just below 100 until the app reports ready, then completes.
 */
const PHASES = [
  { label: 'Initializing Portfolio...', until: 26 },
  { label: 'Loading 3D Environment...', until: 58 },
  { label: 'Compiling Experience...', until: 82 },
  { label: 'Loading Projects...', until: 97 },
];

export default function LoadingScreen({ ready = false, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState([]);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  const phase = PHASES.find((p) => progress < p.until) ?? PHASES[PHASES.length - 1];

  useEffect(() => {
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      setProgress((prev) => {
        // Ceiling stays at 97% until the app signals ready.
        const ceiling = readyRef.current ? 100 : 97;
        if (prev >= ceiling) return ceiling;
        // Ease out as we approach the ceiling so it decelerates naturally.
        const remaining = ceiling - prev;
        const speed = Math.max(6, remaining * 1.15);
        return Math.min(ceiling, prev + speed * dt);
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Append each phase label to the boot log exactly once.
  useEffect(() => {
    setLog((prev) => (prev.includes(phase.label) ? prev : [...prev, phase.label]));
  }, [phase.label]);

  // Hold on a completed bar for a beat, then hand off to the site.
  useEffect(() => {
    if (progress < 100 || done) return undefined;
    const t = setTimeout(() => {
      setDone(true);
      onComplete?.();
    }, 620);
    return () => clearTimeout(t);
  }, [progress, done, onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          exit={{ opacity: 0, filter: 'blur(14px)', scale: 1.06 }}
          transition={{ duration: 0.9, ease: [0.83, 0, 0.17, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-base"
          role="status"
          aria-live="polite"
          aria-label={`Loading, ${Math.round(progress)} percent`}
        >
          {/* Ambient bloom */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.12),transparent_60%)]" />
          <div className="cyber-grid pointer-events-none absolute inset-0 opacity-[0.18]" />

          {/* ── Animated logo mark ─────────────────────────────────── */}
          <div className="relative mb-12 h-32 w-32">
            {/* Counter-rotating orbital rings */}
            <motion.span
              className="absolute inset-0 rounded-full border border-primary/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ borderStyle: 'dashed' }}
            />
            <motion.span
              className="absolute inset-3 rounded-full border border-secondary/50"
              animate={{ rotate: -360 }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
              style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
            />
            <motion.span
              className="absolute inset-6 rounded-full border-2 border-accent/60"
              animate={{ rotate: 360, scale: [1, 1.08, 1] }}
              transition={{
                rotate: { duration: 3.4, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
            />

            {/* Monogram */}
            <div className="absolute inset-0 grid place-items-center">
              <motion.svg
                viewBox="0 0 64 64"
                className="h-14 w-14"
                animate={{ filter: ['drop-shadow(0 0 6px #00E5FF)', 'drop-shadow(0 0 20px #7C3AED)', 'drop-shadow(0 0 6px #00E5FF)'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <defs>
                  <linearGradient id="loaderGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="55%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#14F195" />
                  </linearGradient>
                </defs>
                {/* Matches the coordinates in Logo.jsx / favicon.svg — the
                    orbiting rings above already act as the mark's frame, so
                    the hex outline itself is skipped here. */}
                <motion.path
                  d="M20 47 L32 16.5 L44 47 M25 37.5 H39"
                  fill="none"
                  stroke="url(#loaderGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                />
              </motion.svg>
            </div>
          </div>

          {/* ── Brand ──────────────────────────────────────────────── */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-2 px-6 text-center text-2xl font-bold tracking-[0.28em] text-white sm:text-3xl"
          >
            AJK<span className="text-primary">.</span>DEV
          </motion.h1>
          <p className="label-mono mb-1">{profile.name}</p>
          <p className="label-mono mb-10 !text-white/35">Software Engineer</p>

          {/* ── Progress ───────────────────────────────────────────── */}
          <div className="w-[min(78vw,26rem)]">
            <div className="mb-3 flex items-baseline justify-between font-mono text-xs">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phase.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32 }}
                  className="text-primary"
                >
                  {progress >= 100 ? 'Entering Experience...' : phase.label}
                </motion.span>
              </AnimatePresence>
              <span className="tabular-nums text-white/50">{Math.round(progress)}%</span>
            </div>

            <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg,#00E5FF,#7C3AED,#14F195)',
                  boxShadow: '0 0 16px rgba(0,229,255,.75)',
                }}
              />
              {/* Leading spark */}
              <motion.div
                className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white"
                style={{ left: `calc(${progress}% - 4px)`, boxShadow: '0 0 14px #fff' }}
              />
            </div>

            {/* Boot log */}
            <ul className="mt-6 space-y-1 font-mono text-[10px] text-white/30">
              {log.map((line) => (
                <motion.li
                  key={line}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-accent">✓</span>
                  {line}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
