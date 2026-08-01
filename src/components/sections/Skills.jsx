import { Suspense, lazy, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIES, buildGalaxy, skills } from '../../data/skills';
import { useIsMobile, useQualityTier, useIsTouch, useSceneVisibility } from '../../hooks/useDevice';
import SectionHeading from '../ui/SectionHeading';
import SceneBoundary from '../ui/SceneBoundary';
import SkillOrbGrid from './SkillOrbGrid';

const GalaxyScene = lazy(() => import('../../three/GalaxyScene'));

/**
 * ── SKILLS GALAXY SECTION ─────────────────────────────────────────────
 * The 3D galaxy handles exploration; the detail panel and the category
 * filters are plain DOM. Splitting it that way means the content is
 * selectable, screen-reader friendly and keyboard reachable — a canvas
 * alone would lock all of that away.
 */
export default function Skills() {
  const quality = useQualityTier();
  const isTouch = useIsTouch();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [filter, setFilter] = useState('all');
  const [warm, setWarm] = useState(false);
  const scene = useSceneVisibility();

  // Positions are recomputed only when the filter changes.
  const nodes = useMemo(() => {
    const list = filter === 'all' ? skills : skills.filter((s) => s.category === filter);
    return buildGalaxy(list);
  }, [filter]);

  const active = selected ?? hovered;

  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36"
    >
      <div id="skills-title">
        <SectionHeading
          eyebrow="Capabilities"
          title="Skills Galaxy"
          subtitle={
            isMobile
              ? 'Tap a skill to see the details behind it.'
              : isTouch
                ? 'Drag to orbit the galaxy. Tap any sphere to expand it.'
                : 'Drag to orbit. Hover a sphere to preview it, click to expand.'
          }
          accent="#7C3AED"
        />
      </div>

      {/* ── Category filters ─────────────────────────────────────────
           Hidden on mobile: SkillOrbGrid already groups every skill under
           a category heading, so a filter that only ever affected the 3D
           galaxy would just be a dead control down there. */}
      {!isMobile && (
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {[['all', { label: 'All Skills', color: '#FFFFFF' }], ...Object.entries(CATEGORIES)].map(
          ([key, cat]) => {
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setSelected(null);
                }}
                aria-pressed={isActive}
                className="relative rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-300"
                style={{
                  borderColor: isActive ? `${cat.color}88` : 'rgba(255,255,255,0.10)',
                  background: isActive ? `${cat.color}18` : 'transparent',
                  color: isActive ? cat.color : 'rgba(255,255,255,0.5)',
                  boxShadow: isActive ? `0 0 22px ${cat.color}33` : 'none',
                }}
              >
                {cat.label}
                <span className="ml-2 text-white/30">
                  {key === 'all' ? skills.length : skills.filter((s) => s.category === key).length}
                </span>
              </button>
            );
          },
        )}
      </div>
      )}

      {/* On phones the galaxy's wide 3D shell compresses until every label
          overlaps the next — see SkillOrbGrid for why this gets a purpose-
          built flat layout instead of a scaled-down 3D scene. */}
      {isMobile && (
        <div className="glass glass-edge rounded-3xl p-6">
          <SkillOrbGrid skills={skills} selected={selected} onSelect={setSelected} />
        </div>
      )}

      {/* ── Galaxy + detail panel ────────────────────────────────── */}
      {!isMobile && (
      <div className="relative">
        <div className="glass glass-edge relative h-[520px] overflow-hidden rounded-3xl sm:h-[620px]">
          {/* Canvas — built the first time it nears the viewport, and only
              renders frames while it is actually on screen. Kept at opacity
              0 until it reports itself warm (see WarmupSignal): the canvas
              still renders while hidden, so the expensive part — 30+
              spheres each generating their own label texture — happens out
              of sight instead of visibly building itself sphere by sphere. */}
          <div
            ref={scene.ref}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: warm ? 1 : 0 }}
          >
            <SceneBoundary label="The skills galaxy">
            <Suspense fallback={null}>
              {scene.mounted && (
                <GalaxyScene
                  nodes={nodes}
                  quality={quality}
                  selected={selected}
                  active={scene.visible}
                  onSelect={setSelected}
                  onHover={setHovered}
                  onWarm={() => setWarm(true)}
                />
              )}
            </Suspense>
            </SceneBoundary>
          </div>

          {/* Spinner — covers the canvas until it reports warm, and fades
              out rather than snapping away once it does. */}
          <AnimatePresence>
            {!warm && (
              <motion.div
                initial={false}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 grid place-items-center"
              >
                <div className="h-24 w-24 animate-spin-slow rounded-full border border-dashed border-secondary/40" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner HUD */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-5 top-5 space-y-1 font-mono text-[10px] text-white/30"
          >
            <p>NODES · {nodes.length}</p>
            <p>SHELL · FIBONACCI</p>
          </div>

          {/* ── Expanded skill detail ──────────────────────────── */}
          {/* No `filter: blur()` here — same fix as the Experience Room's
              panel transition: animating CSS blur is one of the more
              expensive things a browser can composite, and on a strained
              GPU it can visibly stall mid-transition, which reads as
              washed-out, low-contrast text. Plain opacity/slide instead. */}
          <AnimatePresence>
            {selected && (
              <motion.aside
                key={selected.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-4 bottom-4 z-10 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-6 sm:w-80"
                aria-label={`${selected.name} details`}
              >
                <div
                  className="glass neon-frame relative h-full overflow-hidden rounded-2xl p-6"
                  style={{ color: selected.color }}
                >
                  <div className="hologram-lines pointer-events-none absolute inset-0 opacity-30" />

                  <button
                    onClick={() => setSelected(null)}
                    className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/50 transition-colors hover:border-white/40 hover:text-white"
                    aria-label="Close skill details"
                  >
                    ✕
                  </button>

                  <div className="relative">
                    <span
                      className="mb-4 inline-block h-10 w-10 rounded-xl border"
                      style={{
                        borderColor: `${selected.color}66`,
                        background: `${selected.color}22`,
                        boxShadow: `0 0 26px ${selected.color}55`,
                      }}
                      aria-hidden="true"
                    />

                    <p className="label-mono mb-2 !text-[0.58rem]">
                      {CATEGORIES[selected.category].label}
                    </p>
                    <h3 className="mb-3 text-2xl font-bold text-white">{selected.name}</h3>
                    <p className="mb-6 text-sm leading-relaxed text-white/60">{selected.blurb}</p>

                    {/* Proficiency meter */}
                    <div className="mb-1.5 flex items-baseline justify-between font-mono text-[11px]">
                      <span className="text-white/40">Proficiency</span>
                      <span style={{ color: selected.color }}>{selected.level}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selected.level}%` }}
                        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${selected.color}, #ffffff)`,
                          boxShadow: `0 0 14px ${selected.color}`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Hover preview (only when nothing is pinned open) */}
          <AnimatePresence>
            {hovered && !selected && (
              <motion.div
                key={hovered.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.28 }}
                className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2"
              >
                <div className="glass flex items-center gap-3 rounded-full px-5 py-2.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: hovered.color, boxShadow: `0 0 10px ${hovered.color}` }}
                  />
                  <span className="text-sm font-medium text-white">{hovered.name}</span>
                  <span className="font-mono text-[11px] text-white/40">{hovered.level}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Accessible / no-WebGL equivalent ─────────────────────
             Also the keyboard path into every skill, since canvas
             contents cannot receive focus. */}
        <details className="glass mt-4 rounded-2xl px-5 py-4">
          <summary className="cursor-pointer text-sm font-medium text-white/70 transition-colors hover:text-white">
            View all {skills.length} skills as a list
          </summary>
          <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((s) => (
              <li key={s.name} className="flex items-center gap-3">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-sm text-white/75">{s.name}</span>
                <span className="font-mono text-[11px] text-white/35">{s.level}%</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
      )}

      {/* Live region so hover/selection is announced rather than silent */}
      <p className="sr-only" aria-live="polite">
        {active ? `${active.name}, ${active.level} percent proficiency` : ''}
      </p>
    </section>
  );
}
