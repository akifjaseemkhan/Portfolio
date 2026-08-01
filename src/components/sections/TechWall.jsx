import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { techWall } from '../../data/experience';
import { useIsMobile } from '../../hooks/useDevice';
import SectionHeading from '../ui/SectionHeading';

/**
 * A wall of technology tiles that drifts as you scroll.
 *
 * Rows counter-scroll against each other for depth. Each tile spins,
 * glows and emits particles on hover — the particles are pure CSS
 * animations on six spans, spawned only while hovered.
 */
function Tile({ tech, index }) {
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

      {/* Label appears beneath on hover */}
      <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-white/0 transition-colors duration-300 group-hover:text-white/70">
        {tech.name}
      </span>
    </motion.li>
  );
}

/**
 * ── MOBILE TECH ROW ──────────────────────────────────────────────────
 * The desktop rows drift automatically, tied to page scroll position —
 * that's a nice ambient effect, but on a narrow viewport most of the ~30
 * tiles sit off-screen with no way to reach them: the drift range is too
 * small to bring them into view, and the section clips overflow. This is
 * a single flat row instead: every tile once, real swipeable content
 * (native `overflow-x-auto`, no scroll-linked transform to fight the
 * touch scroll), so a finger can just pull the rest into view. Labels
 * are shown under each icon rather than on hover, since "hover" doesn't
 * really exist on a touchscreen.
 */
function MobileTile({ tech }) {
  return (
    <li className="flex shrink-0 snap-center flex-col items-center gap-2">
      <div
        className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.08] bg-[#0d1226]"
        style={{ color: tech.color, boxShadow: `0 0 16px ${tech.color}22` }}
      >
        <span
          className="select-none text-lg font-bold"
          style={{ textShadow: `0 0 14px ${tech.color}88` }}
          aria-hidden="true"
        >
          {tech.glyph}
        </span>
      </div>
      <span className="whitespace-nowrap font-mono text-[10px] text-white/50">{tech.name}</span>
    </li>
  );
}

function MobileWall({ items }) {
  return (
    <ul className="mask-fade-x -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((tech) => (
        <MobileTile key={tech.name} tech={tech} />
      ))}
    </ul>
  );
}

/** One horizontally drifting row. `dir` flips the travel direction. */
function Row({ items, dir, scrollYProgress, offset }) {
  const x = useTransform(scrollYProgress, [0, 1], [offset * dir, -offset * dir]);

  return (
    <motion.ul style={{ x }} className="flex w-max gap-4 sm:gap-5">
      {/* Duplicated so the row stays filled as it slides */}
      {[...items, ...items].map((tech, i) => (
        <Tile key={`${tech.name}-${i}`} tech={tech} index={i} />
      ))}
    </motion.ul>
  );
}

export default function TechWall() {
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Split the stack into three rows.
  const per = Math.ceil(techWall.length / 3);
  const rows = [techWall.slice(0, per), techWall.slice(per, per * 2), techWall.slice(per * 2)];

  return (
    <section
      ref={ref}
      aria-labelledby="techwall-title"
      className="relative overflow-hidden py-28 sm:py-36"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div id="techwall-title">
          <SectionHeading
            eyebrow="Toolbox"
            title="Tech Stack Wall"
            subtitle={isMobile ? 'Every technology I build with — swipe to see them all.' : 'Every technology I build with — hover to bring one to life.'}
            accent="#00E5FF"
          />
        </div>
      </div>

      {isMobile ? (
        <div className="mx-auto max-w-7xl px-6">
          <MobileWall items={techWall} />
        </div>
      ) : (
        <>
          {/* Rows bleed past the viewport edges and fade out at the sides.
              Hidden from assistive tech because tiles are duplicated for the
              scroll effect — the real list is the sr-only one below. */}
          <div aria-hidden="true" className="mask-fade-x flex flex-col gap-8 py-4">
            {rows.map((items, i) => (
              <Row
                key={i}
                items={items}
                dir={i % 2 === 0 ? 1 : -1}
                offset={140 + i * 40}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* Full list for assistive tech, since the visual rows are duplicated */}
          <ul className="sr-only">
            {techWall.map((t) => (
              <li key={t.name}>{t.name}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
