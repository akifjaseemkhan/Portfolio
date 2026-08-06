import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { STATUS_STYLES } from '../../data/projects';
import { useSwipeLock } from '../../hooks/useSwipeLock';

/**
 * ── MOBILE PROJECT CAROUSEL ───────────────────────────────────────────
 * The desktop 3D cube array assumes a wide canvas to fan its cubes across
 * — on a phone-width viewport the whole arc compresses into the centre
 * and every title overlaps the next. Rather than fight 3D camera framing
 * on every possible phone aspect ratio, this is a purpose-built flat
 * design for narrow screens: a full-bleed, swipeable, snap-scrolling
 * carousel of large project cards, one clearly readable card at a time.
 *
 * Real `<button>` elements throughout, so this doubles as the accessible/
 * keyboard path on mobile — nothing extra is needed alongside it.
 */
export default function ProjectCarousel({ projects, onOpen }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  useSwipeLock(trackRef, { snapChildren: true });

  // Tracks which card is centred so the dots and the "charged" card style
  // stay in sync with an ordinary native scroll — no scroll-math needed,
  // IntersectionObserver already knows what's actually in view.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const cards = Array.from(track.children);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setActive(cards.indexOf(entry.target));
          }
        });
      },
      { root: track, threshold: [0.6] },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const scrollToCard = (i) => {
    const track = trackRef.current;
    const card = track?.children[i];
    if (!track || !card) return;
    // Plain scrollLeft math, not scrollIntoView — scrollIntoView considers
    // both axes even when only X is meant to move, and was confirmed to
    // shift scrollTop on this track even with overflow-y locked to
    // hidden (see useSwipeLock.js for the full story). scroll-behavior is
    // set inline just for this one write so it animates without needing
    // Framer Motion or a manual rAF tween, and never touches scrollTop.
    track.style.scrollBehavior = 'smooth';
    track.scrollLeft = card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;
    requestAnimationFrame(() => {
      track.style.scrollBehavior = '';
    });
  };

  return (
    <div className="relative">
      {/* Ambient glow that shifts to the active card's colour */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -top-10 h-40 rounded-full blur-3xl"
        animate={{ backgroundColor: projects[active]?.accent ?? '#00E5FF', opacity: 0.16 }}
        transition={{ duration: 0.6 }}
      />

      <ul
        ref={trackRef}
        // touch-action: pan-x stops an imprecise diagonal swipe from also
        // dragging the page vertically — without it, a swipe meant for the
        // carousel can bleed into a page scroll mid-gesture.
        // overflow-y-hidden closes off a real bug: overflow-x-auto alone
        // leaves overflow-y computed as 'auto' too, and the entrance
        // animation's transform briefly extends cards past the track's own
        // height — enough scrollable overflow that a swipe could drag the
        // track vertically by itself, independent of the page.
        className="mask-fade-x -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-6 pb-2 [scrollbar-width:none] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p, i) => {
          const status = STATUS_STYLES[p.status];
          const isActive = i === active;
          return (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
              className="w-[84vw] shrink-0 snap-center"
            >
              <button
                onClick={() => onOpen(p)}
                className="glass neon-frame relative block w-full overflow-hidden rounded-3xl p-6 text-left transition-transform duration-500"
                style={{
                  color: p.accent,
                  transform: isActive ? 'scale(1)' : 'scale(0.96)',
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {/* Accent top bar */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }}
                />
                <span aria-hidden="true" className="hologram-lines pointer-events-none absolute inset-0 opacity-20" />

                <div className="relative">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span
                      className="flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                      style={{ borderColor: `${status.color}66`, color: status.color, background: `${status.color}14` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color, boxShadow: `0 0 8px ${status.color}` }} />
                      {status.label}
                    </span>
                    <time className="font-mono text-xs text-white/35">{p.year}</time>
                  </div>

                  <h3 className="mb-2 text-2xl font-bold leading-tight text-white">{p.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-white/50">{p.subtitle}</p>

                  <ul className="mb-7 flex flex-wrap gap-1.5">
                    {p.technologies.slice(0, 4).map((t) => (
                      <li
                        key={t}
                        className="rounded-lg border px-2.5 py-1 text-[11px] text-white/70"
                        style={{ borderColor: `${p.accent}33`, background: `${p.accent}0f` }}
                      >
                        {t}
                      </li>
                    ))}
                    {p.technologies.length > 4 && (
                      <li className="px-1 py-1 text-[11px] text-white/35">+{p.technologies.length - 4}</li>
                    )}
                  </ul>

                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium"
                    style={{ borderColor: `${p.accent}55`, background: `${p.accent}14`, color: p.accent }}
                  >
                    View Case Study <span aria-hidden="true">→</span>
                  </span>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>

      {/* Dot pagination — also tap targets, so the carousel is fully
          navigable without a precise swipe gesture. */}
      <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Projects">
        {projects.map((p, i) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={i === active}
            aria-label={p.title}
            onClick={() => scrollToCard(i)}
            className="h-1.5 rounded-full transition-all duration-400"
            style={{
              width: i === active ? 22 : 7,
              background: i === active ? p.accent : 'rgba(255,255,255,0.2)',
              boxShadow: i === active ? `0 0 10px ${p.accent}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
