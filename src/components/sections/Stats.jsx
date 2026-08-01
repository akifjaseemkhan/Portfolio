import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { statistics } from '../../data/profile';
import { useCountUp } from '../../hooks/usePointer';

const ACCENTS = ['#00E5FF', '#7C3AED', '#14F195', '#F472B6', '#FBBF24'];

/** One animated counter. Counting starts the first time it scrolls in. */
function Counter({ stat, index, started }) {
  const numberRef = useCountUp(stat.value, 2000 + index * 180, started);
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.li
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative text-center"
    >
      {/* Radial bloom behind each figure */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: accent }}
      />

      <div className="mb-2 font-mono text-4xl font-bold tabular-nums sm:text-5xl lg:text-6xl">
        <span
          ref={numberRef}
          style={{ color: accent, textShadow: `0 0 24px ${accent}66` }}
          className="transition-all duration-300"
        >
          0
        </span>
        <span className="text-white/30">{stat.suffix}</span>
      </div>

      <p className="label-mono !text-[0.6rem] !tracking-[0.22em] sm:!text-[0.66rem]">{stat.label}</p>

      <span
        aria-hidden="true"
        className="mx-auto mt-4 block h-px w-8 origin-center scale-x-0 transition-transform duration-500 group-hover:scale-x-[3]"
        style={{ background: accent }}
      />
    </motion.li>
  );
}

/**
 * Statistics band. A single IntersectionObserver gates every counter so
 * they animate together as one event rather than firing independently.
 */
export default function Stats() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  return (
    <section ref={ref} aria-label="Statistics" className="relative px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="glass glass-edge relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-14">
          {/* Sweeping highlight across the band */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 6s linear infinite',
            }}
          />
          <div className="cyber-grid pointer-events-none absolute inset-0 opacity-[0.12]" />

          <ul className="relative grid grid-cols-2 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            {statistics.map((stat, i) => (
              <Counter key={stat.label} stat={stat} index={i} started={started} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
