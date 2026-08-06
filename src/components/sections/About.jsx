import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { profile } from '../../data/profile';
import { useIsMobile, useIsTouch } from '../../hooks/useDevice';
import { useSwipeLock } from '../../hooks/useSwipeLock';
import SectionHeading from '../ui/SectionHeading';

const ACCENTS = ['#00E5FF', '#7C3AED', '#14F195'];

/**
 * Floating glass panels instead of a paragraph of biography.
 *
 * Each panel tilts toward the pointer in 3D (CSS perspective, not WebGL —
 * a full canvas here would be a waste of the frame budget) and drifts on
 * its own parallax track as the section scrolls.
 *
 * The tilt is desktop-only (gated on `!isTouch` below): `perspective` +
 * `transform-style: preserve-3d` + a child `translateZ()`, combined with
 * this card's `overflow-hidden` and rounded corners, is a known-bad
 * combination on mobile browsers — confirmed on a real device as cards
 * rendering completely blank (the 3D-transformed content compositing
 * failed) and overlapping their neighbours (the same compositing failure,
 * but painting in the wrong place instead of not at all). There's also no
 * mouse to tilt toward on a touch device, so the effect was never doing
 * anything there besides risking exactly this.
 */
function Panel({ item, index, scrollYProgress, carousel = false }) {
  const ref = useRef(null);
  const isTouch = useIsTouch();
  const accent = ACCENTS[index % ACCENTS.length];

  // Alternate parallax direction per column so the grid feels layered.
  // In carousel mode the cards sit in a single swipeable row instead of a
  // multi-column grid, so a "per column" bob has nothing to alternate
  // against and just reads as cards jittering vertically while you swipe
  // — skipped there.
  const dir = index % 3 === 1 ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [60 * dir, -60 * dir]);

  const onMove = (e) => {
    if (isTouch) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${-py * 12}deg`);
    el.style.setProperty('--ry', `${px * 14}deg`);
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <motion.li
      style={carousel ? undefined : { y }}
      // The entrance rotateX is dropped on touch too — same 3D-transform
      // risk as the hover tilt, just for a one-off animation instead of a
      // persistent state. Not worth it for a transform mobile can't use anyway.
      initial={isTouch ? { opacity: 0, y: 50 } : { opacity: 0, y: 50, rotateX: -12 }}
      whileInView={isTouch ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={carousel ? 'w-[82vw] shrink-0 snap-center' : isTouch ? undefined : 'perspective-1000'}
    >
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="glass glass-edge neon-frame group relative h-full overflow-hidden rounded-2xl p-6 transition-[transform,box-shadow] duration-300 ease-out will-transform sm:p-7"
        style={
          isTouch
            ? { color: accent }
            : {
                color: accent,
                transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))',
                transformStyle: 'preserve-3d',
              }
        }
      >
        {/* Pointer-tracking sheen — desktop only; there's no pointer to
            track on a touch device, so --mx/--my never move on mobile. */}
        {!isTouch && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(220px circle at var(--mx,50%) var(--my,50%), ${accent}1f, transparent 70%)`,
            }}
          />
        )}

        <div className="relative z-10" style={isTouch ? undefined : { transform: 'translateZ(28px)' }}>
          <span
            className="mb-5 grid h-11 w-11 place-items-center rounded-xl border text-lg"
            style={{
              borderColor: `${accent}55`,
              background: `${accent}14`,
              boxShadow: `0 0 22px ${accent}33`,
            }}
            aria-hidden="true"
          >
            {item.icon}
          </span>

          <h3 className="mb-2.5 text-lg font-semibold text-white">{item.title}</h3>
          <p className="text-sm leading-relaxed text-white/55">{item.text}</p>
        </div>

        {/* Corner tick */}
        <span
          aria-hidden="true"
          className="absolute right-5 top-5 h-2 w-2 rounded-full transition-transform duration-500 group-hover:scale-[2.2]"
          style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
        />
      </div>
    </motion.li>
  );
}

/**
 * ── MOBILE ABOUT CAROUSEL ────────────────────────────────────────────
 * On desktop the eight facets sit in a grid, discoverable at a glance.
 * On a phone that grid collapses to one column and becomes eight stacked
 * cards of vertical scrolling before you reach the next section — same
 * "everything is here, just keep scrolling down" problem the project
 * grid had. Same fix as ProjectCarousel: a full-bleed, swipeable,
 * snap-scrolling row, with dot pagination as a tap-target fallback for
 * anyone who'd rather not swipe.
 */
function AboutCarousel({ items, scrollYProgress }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  useSwipeLock(trackRef, { snapChildren: true });

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
      <ul
        ref={trackRef}
        // touch-action: pan-x stops an imprecise diagonal swipe from also
        // dragging the page vertically — without it, a swipe meant for the
        // carousel can bleed into a page scroll mid-gesture.
        // overflow-x-auto alone leaves overflow-y computed as 'auto' too
        // (a CSS quirk: setting one axis forces the other off 'visible'),
        // and the entrance-animated cards' transform briefly extends their
        // visual bounds past the track's own height — enough scrollable
        // overflow that a swipe could drag the track vertically by itself,
        // independent of the page. overflow-y-hidden shuts that off for
        // good: this track should never scroll on Y, only X.
        className="mask-fade-x -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-6 pb-2 [scrollbar-width:none] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <Panel key={item.title} item={item} index={i} scrollYProgress={scrollYProgress} carousel />
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="About">
        {items.map((item, i) => (
          <button
            key={item.title}
            role="tab"
            aria-selected={i === active}
            aria-label={item.title}
            onClick={() => scrollToCard(i)}
            className="h-1.5 rounded-full transition-all duration-400"
            style={{
              width: i === active ? 22 : 7,
              background: i === active ? ACCENTS[i % ACCENTS.length] : 'rgba(255,255,255,0.2)',
              boxShadow: i === active ? `0 0 10px ${ACCENTS[i % ACCENTS.length]}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function About() {
  const sectionRef = useRef(null);
  const isTouch = useIsTouch();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-title"
      className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36"
    >
      <div id="about-title">
        <SectionHeading
          eyebrow="Who I am"
          title="Engineer. Designer. Builder."
          subtitle={
            isMobile
              ? 'Eight facets of how I work — swipe to see them all.'
              : isTouch
                ? 'Eight facets of how I work.'
                : 'Eight facets of how I work — hover any panel to bring it forward.'
          }
        />
      </div>

      {isMobile ? (
        <AboutCarousel items={profile.about} scrollYProgress={scrollYProgress} />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profile.about.map((item, i) => (
            <Panel key={item.title} item={item} index={i} scrollYProgress={scrollYProgress} />
          ))}
        </ul>
      )}
    </section>
  );
}
