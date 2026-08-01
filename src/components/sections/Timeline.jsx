import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { timeline } from '../../data/timeline';
import SectionHeading from '../ui/SectionHeading';

/**
 * Futuristic vertical timeline.
 *
 * A single spine runs the full height with a glowing fill that tracks
 * scroll progress; each entry reveals from its own side as it enters view.
 * On mobile the spine moves left and every card stacks beside it.
 */
function Entry({ item, index, total }) {
  const isLeft = index % 2 === 0;

  return (
    <li
      // Was 8 independent useScroll+useTransform pairs (one per entry) that
      // continuously tracked scroll position and recomputed every single
      // scroll tick, even for entries nowhere near the viewport — real,
      // measurable work on every frame while scrolling through this section.
      // whileInView fires once via a single shared IntersectionObserver,
      // matching how every other section on the page already does reveals.
      // Tighter gap/padding at the smallest breakpoint — on a 320px phone
      // (iPhone SE and similar) the default gap-6 + p-6 combination left the
      // card a few pixels wider than the viewport, silently clipped by the
      // page's overflow-hidden safety net rather than actually fitting.
      className={`relative flex items-start gap-3 pb-16 sm:gap-6 md:gap-0 md:pb-24 ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* ── Card ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0.25, x: isLeft ? -40 : 40, scale: 0.94 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`order-2 min-w-0 flex-1 md:order-none ${isLeft ? 'md:pr-14 md:text-right' : 'md:pl-14'}`}
      >
        <div className="glass glass-edge neon-frame group relative overflow-hidden rounded-2xl p-4 sm:p-6" style={{ color: item.color }}>
          {/* Top accent bar that fills on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
            style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
          />

          <div className={`mb-3 flex flex-wrap items-center gap-3 ${isLeft ? 'md:justify-end' : ''}`}>
            <span
              className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ borderColor: `${item.color}55`, color: item.color, background: `${item.color}12` }}
            >
              {item.tag}
            </span>
            <time className="font-mono text-xs text-white/40">{item.period}</time>
          </div>

          <h3 className="mb-3 text-xl font-semibold text-white sm:text-2xl">{item.title}</h3>
          <p className="mb-5 text-sm leading-relaxed text-white/55">{item.description}</p>

          <ul className={`flex flex-wrap gap-2 ${isLeft ? 'md:justify-end' : ''}`}>
            {item.highlights.map((h) => (
              <li
                key={h}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/60"
              >
                {h}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* ── Marker on the spine ──────────────────────────────────── */}
      <div className="relative z-10 order-1 flex w-8 shrink-0 justify-center md:order-none md:w-0">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-7 grid h-5 w-5 place-items-center rounded-full border-2 bg-base"
          style={{ borderColor: item.color, boxShadow: `0 0 18px ${item.color}, 0 0 44px ${item.color}55` }}
        >
          <motion.span
            animate={{ scale: [1, 1.9, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.25 }}
            className="absolute inset-0 rounded-full"
            style={{ background: item.color }}
          />
          <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
        </motion.span>
      </div>

      {/* Spacer that balances the two-column layout on desktop */}
      <div className="hidden flex-1 md:block" aria-hidden="true" />

      {/* Screen-reader-only ordinal, since the visual order is decorative */}
      <span className="sr-only">
        Step {index + 1} of {total}
      </span>
    </li>
  );
}

export default function Timeline() {
  const listRef = useRef(null);

  // Drives the glowing fill down the spine.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 65%', 'end 60%'],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.4 });

  return (
    <section
      id="timeline"
      aria-labelledby="timeline-title"
      className="relative mx-auto max-w-6xl px-6 py-28 sm:py-36"
    >
      <div id="timeline-title">
        <SectionHeading
          eyebrow="The journey"
          title="How I Got Here"
          subtitle="From first HTML tag to founding a live platform — the path so far."
          accent="#7C3AED"
        />
      </div>

      <div ref={listRef} className="relative">
        {/* Spine: dim track + glowing scroll-linked fill */}
        <div
          aria-hidden="true"
          className="absolute left-4 top-0 h-full w-[2px] bg-white/[0.07] md:left-1/2 md:-translate-x-1/2"
        />
        <motion.div
          aria-hidden="true"
          style={{ scaleY: fill }}
          className="absolute left-4 top-0 h-full w-[2px] origin-top md:left-1/2 md:-translate-x-1/2"
        >
          <div
            className="h-full w-full"
            style={{
              background: 'linear-gradient(180deg,#00E5FF,#7C3AED,#14F195)',
              boxShadow: '0 0 14px rgba(0,229,255,.7)',
            }}
          />
        </motion.div>

        <ol className="relative">
          {timeline.map((item, i) => (
            <Entry key={item.id} item={item} index={i} total={timeline.length} />
          ))}
        </ol>
      </div>
    </section>
  );
}
