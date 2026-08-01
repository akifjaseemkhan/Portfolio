import { Suspense, lazy, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { experienceRooms } from '../../data/experience';
import { useQualityTier, useSceneVisibility } from '../../hooks/useDevice';
import { usePointer } from '../../hooks/usePointer';
import SectionHeading from '../ui/SectionHeading';
import SceneBoundary from '../ui/SceneBoundary';

const RoomScene = lazy(() => import('../../three/RoomScene'));

/**
 * ── EXPERIENCE ROOM ───────────────────────────────────────────────────
 * Five disciplines, one room. Choosing a discipline transforms the
 * hologram, the lighting and the readouts around it.
 *
 * The selectors are real buttons in a tablist, so the whole room is
 * navigable by keyboard even though its content is WebGL.
 */
export default function ExperienceRoom() {
  const quality = useQualityTier();
  const pointer = usePointer();
  const [activeId, setActiveId] = useState(experienceRooms[0].id);
  const scene = useSceneVisibility();

  const room = experienceRooms.find((r) => r.id === activeId) ?? experienceRooms[0];

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36"
    >
      <div id="experience-title">
        <SectionHeading
          eyebrow="Disciplines"
          title="Experience Room"
          subtitle="Select a discipline — the room reconfigures around it."
          accent={room.color}
        />
      </div>

      {/* ── Discipline selector ──────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Disciplines"
        className="mb-6 flex flex-wrap justify-center gap-2.5"
      >
        {experienceRooms.map((r) => {
          const isActive = r.id === activeId;
          return (
            <button
              key={r.id}
              role="tab"
              aria-selected={isActive}
              aria-controls="room-panel"
              onClick={() => setActiveId(r.id)}
              className="group relative overflow-hidden rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-400"
              style={{
                borderColor: isActive ? `${r.color}88` : 'rgba(255,255,255,0.10)',
                background: isActive ? `${r.color}18` : 'rgba(255,255,255,0.02)',
                color: isActive ? r.color : 'rgba(255,255,255,0.55)',
                boxShadow: isActive ? `0 0 28px ${r.color}33` : 'none',
              }}
            >
              {/* Active underline */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-500"
                style={{
                  background: r.color,
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  boxShadow: `0 0 10px ${r.color}`,
                }}
              />
              <span className="relative flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full transition-transform duration-400 group-hover:scale-150"
                  style={{ background: r.color, boxShadow: isActive ? `0 0 10px ${r.color}` : 'none' }}
                />
                {r.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Room ─────────────────────────────────────────────────── */}
      <div
        id="room-panel"
        role="tabpanel"
        aria-label={`${room.label} details`}
        className="glass glass-edge relative overflow-hidden rounded-3xl"
      >
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          {/* Canvas */}
          <div ref={scene.ref} className="relative h-[380px] sm:h-[460px] lg:h-[560px]">
            <SceneBoundary label="The experience room">
            <Suspense
              fallback={
                <div className="grid h-full place-items-center">
                  <div
                    className="h-24 w-24 animate-spin-slow rounded-full border border-dashed"
                    style={{ borderColor: `${room.color}66` }}
                  />
                </div>
              }
            >
              {scene.mounted && (
                <RoomScene
                  room={room}
                  quality={quality}
                  pointer={pointer}
                  active={scene.visible}
                />
              )}
            </Suspense>
            </SceneBoundary>

            {/* HUD */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-5 space-y-1 font-mono text-[10px]"
              style={{ color: `${room.color}99` }}
            >
              <p>ROOM · {room.label.toUpperCase()}</p>
              <p>EMITTER · ACTIVE</p>
            </div>
          </div>

          {/* Readout — animates on every discipline change */}
          <div className="relative border-t border-white/[0.07] p-7 sm:p-9 lg:border-l lg:border-t-0">
            <div className="hologram-lines pointer-events-none absolute inset-0 opacity-20" />

            {/* No `filter: blur()` here on purpose: animating CSS blur is one
                of the more expensive things a browser can composite, and on
                a strained GPU it's known to visibly stall partway through —
                which looks exactly like low-contrast, washed-out text (small
                body copy shows it far more than a bold heading at the same
                blur radius, which is why only the paragraph looked dim). A
                plain opacity/slide gives the same transition without the risk. */}
            <AnimatePresence mode="wait">
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <p className="label-mono mb-3" style={{ color: room.color }}>
                  {room.label}
                </p>
                <h3 className="mb-4 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {room.headline}
                </h3>
                {/* A solid colour, not text-white/60: that's semi-transparent,
                    so the browser has to blend it with whatever's rendered
                    behind it — and this panel sits on a backdrop-filter glass
                    surface, exactly the kind of compositing that can behave
                    inconsistently across GPU/driver combinations. This has
                    reportedly rendered near-black on at least one device. An
                    opaque colour has nothing to blend with, so it can't. */}
                <p className="mb-8 text-sm leading-relaxed sm:text-base" style={{ color: '#c7ccd9' }}>
                  {room.summary}
                </p>

                {/* Metrics */}
                <ul className="mb-8 grid grid-cols-3 gap-3">
                  {room.metrics.map((m, i) => (
                    <motion.li
                      key={m.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.07, duration: 0.4 }}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center"
                    >
                      <p className="font-mono text-base font-bold sm:text-lg" style={{ color: room.color }}>
                        {m.value}
                      </p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">
                        {m.label}
                      </p>
                    </motion.li>
                  ))}
                </ul>

                {/* Stack */}
                <p className="label-mono mb-3 !text-[0.58rem]">Stack</p>
                <ul className="flex flex-wrap gap-2">
                  {room.stack.map((s, i) => (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}
                      className="rounded-lg border px-3 py-1.5 text-xs text-white/75"
                      style={{ borderColor: `${room.color}33`, background: `${room.color}0f` }}
                    >
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
