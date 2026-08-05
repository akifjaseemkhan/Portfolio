import { useRef } from 'react';
import { motion } from 'framer-motion';
import { techWall } from '../../data/experience';
import { useIsMobile } from '../../hooks/useDevice';
import { useSwipeLock } from '../../hooks/useSwipeLock';
import SectionHeading from '../ui/SectionHeading';

/**
 * A wall of technology tiles that drifts on its own, continuously.
 *
 * Rows counter-scroll against each other for depth. Each tile spins,
 * glows and emits particles on hover — the particles are pure CSS
 * animations on six spans, spawned only while hovered.
 */
function Tile({ tech, index, alwaysLabel = false }) {
  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group relative shrink-0"
    >
      {/* Deliberately not `.glass`: that class uses backdrop-filter, and this
          section renders ~50 of these tiles at once, all continuously
          translating on a scroll-linked transform. Blur + constant motion,
          repeated 50 times, is one of the most expensive combinations a
          browser can composite — it was the main source of scroll jank. A
          solid tinted background reads almost identically at this size. */}
      <div
        className="relative grid h-20 w-20 place-items-center rounded-2xl border border-white/[0.08] bg-[#0d1226] transition-transform duration-500 ease-out group-hover:scale-110 sm:h-24 sm:w-24"
        style={{ color: tech.color }}
        title={tech.name}
      >
        {/* Glow bloom */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: `0 0 30px ${tech.color}66, inset 0 0 22px ${tech.color}22` }}
        />
        {/* Rotating ring */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 rounded-2xl border border-dashed opacity-0 transition-opacity duration-500 group-hover:animate-spin-slow group-hover:opacity-60"
          style={{ borderColor: tech.color }}
        />

        {/* Glyph — spins on hover */}
        <span
          className="relative select-none text-xl font-bold transition-transform duration-700 ease-out group-hover:rotate-[360deg] sm:text-2xl"
          style={{ textShadow: `0 0 18px ${tech.color}88` }}
          aria-hidden="true"
        >
          {tech.glyph}
        </span>

        {/* Hover particles */}
        {[0, 1, 2, 3, 4, 5].map((p) => (
          <span
            key={p}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: tech.color,
              boxShadow: `0 0 6px ${tech.color}`,
              // Each particle flies out along its own angle.
              animation: `float ${1.6 + p * 0.22}s ease-in-out ${p * 0.12}s infinite`,
              transform: `translate(-50%,-50%) rotate(${p * 60}deg) translateY(-${26 + p * 3}px)`,
            }}
          />
        ))}
      </div>

      {/* Label appears beneath on hover — except on touch, where there's no
          hover to reveal it, so it's just always on at low opacity. */}
      <span
        className={`pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] transition-colors duration-300 ${
          alwaysLabel ? 'text-white/45' : 'text-white/0 group-hover:text-white/70'
        }`}
      >
        {tech.name}
      </span>
    </motion.li>
  );
}

/**
 * One horizontally drifting row, animating non-stop on its own CSS
 * timeline (see `@keyframes marquee` in index.css) — not tied to page
 * scroll, so it keeps moving whether or not the visitor is scrolling.
 * `reverse` flips the travel direction so neighbouring rows counter-drift
 * for depth; `duration` staggers their speed so they don't sync up.
 *
 * On mobile this same row is used, not a flattened substitute — it just
 * also lives inside a manually swipeable container (see the wrapper in
 * TechWall below), since the auto-drift alone is too slow to bring every
 * tile into view on demand. `mobile` switches the tile label to
 * always-on, since there's no hover to reveal it on touch.
 *
 * The animation itself lives in the `.marquee-row` class in index.css,
 * not inline here — that class is explicitly exempted from the site's
 * prefers-reduced-motion kill-switch, which an inline `animation` style
 * couldn't be (a plain inline style always loses to a `!important`
 * stylesheet rule, no matter how specific). Duration/direction still
 * come from here, just via CSS custom properties instead.
 */
function Row({ items, reverse, duration, mobile = false }) {
  return (
    <ul
      className="marquee-row flex w-max gap-4 sm:gap-5"
      style={{ '--marquee-duration': `${duration}s`, '--marquee-direction': reverse ? 'reverse' : 'normal' }}
    >
      {/* Duplicated so the row stays filled as it slides */}
      {[...items, ...items].map((tech, i) => (
        <Tile key={`${tech.name}-${i}`} tech={tech} index={i} alwaysLabel={mobile} />
      ))}
    </ul>
  );
}

// Staggered so the three rows never fall back into visual sync.
const ROW_DURATIONS = [46, 58, 70];

export default function TechWall() {
  const isMobile = useIsMobile();
  const scrollRef = useRef(null);
  useSwipeLock(scrollRef);

  // Split the stack into three rows.
  const per = Math.ceil(techWall.length / 3);
  const rows = [techWall.slice(0, per), techWall.slice(per, per * 2), techWall.slice(per * 2)];

  return (
    <section aria-labelledby="techwall-title" className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div id="techwall-title">
          <SectionHeading
            eyebrow="Toolbox"
            title="Tech Stack Wall"
            subtitle={
              isMobile
                ? 'Every technology I build with — drifts on its own, or swipe to explore.'
                : 'Every technology I build with — hover to bring one to life.'
            }
            accent="#00E5FF"
          />
        </div>
      </div>

      {/* Rows bleed past the viewport edges and fade out at the sides.
          Hidden from assistive tech because tiles are duplicated for the
          scroll effect — the real list is the sr-only one below.
          On mobile the same three rows get a manual `overflow-x-auto` too:
          the auto-drift alone can't reach every tile on a narrow screen.
          `touch-action: pan-x` keeps a diagonal swipe from also dragging
          the whole page up — without it, the browser treats an imprecise
          horizontal swipe as page scroll too, which reads as the cards
          "jumping" vertically mid-gesture. */}
      <div
        ref={scrollRef}
        aria-hidden="true"
        className={
          isMobile
            ? 'mask-fade-x -mx-6 flex flex-col gap-6 overflow-x-auto px-6 pb-8 [scrollbar-width:none] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden'
            : 'mask-fade-x flex flex-col gap-8 py-4'
        }
      >
        {rows.map((items, i) => (
          <Row key={i} items={items} reverse={i % 2 === 1} duration={ROW_DURATIONS[i]} mobile={isMobile} />
        ))}
      </div>

      {/* Full list for assistive tech, since the visual rows are duplicated */}
      <ul className="sr-only">
        {techWall.map((t) => (
          <li key={t.name}>{t.name}</li>
        ))}
      </ul>
    </section>
  );
}
