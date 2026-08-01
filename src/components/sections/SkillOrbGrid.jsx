import { AnimatePresence, motion } from 'framer-motion';
import { CATEGORIES } from '../../data/skills';

/**
 * ── MOBILE SKILLS GRID ────────────────────────────────────────────────
 * The desktop galaxy spreads 32 spheres across a wide 3D shell — on a
 * phone-width canvas that shell compresses until every label overlaps
 * the next. This is a purpose-built flat alternative: skills grouped by
 * category as a grid of glowing orbs, still reading as "a constellation
 * of capabilities" through the glow and grouping, without needing a 3D
 * camera to frame correctly on every phone's aspect ratio.
 *
 * Tapping an orb opens the same detail (blurb + proficiency bar) as the
 * desktop galaxy's expanded sphere — just anchored to the bottom of the
 * screen instead of floating in 3D space.
 */
export default function SkillOrbGrid({ skills, selected, onSelect }) {
  const grouped = Object.keys(CATEGORIES).map((key) => ({
    key,
    ...CATEGORIES[key],
    items: skills.filter((s) => s.category === key),
  }));

  return (
    <div className="relative">
      <div className="space-y-9">
        {grouped.map((group) => (
          <div key={group.key}>
            <p className="label-mono mb-4" style={{ color: group.color }}>
              {group.label}
            </p>
            <ul className="flex flex-wrap gap-4">
              {group.items.map((skill, i) => {
                // Raw skills (unlike the 3D galaxy's processed nodes) have no
                // `id` field, so identity is by name — unique across the list
                // and stable, unlike using the array index.
                const isSelected = selected?.name === skill.name;
                // Size nods at proficiency, same idea as the galaxy's sphere radius.
                const size = 56 + (skill.level / 100) * 22;
                return (
                  <motion.li
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.6 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.4, delay: (i % 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <button
                      onClick={() => onSelect(isSelected ? null : skill)}
                      aria-pressed={isSelected}
                      aria-label={`${skill.name}, ${skill.level} percent`}
                      className="relative grid place-items-center rounded-full transition-transform duration-300 active:scale-90"
                      style={{
                        width: size,
                        height: size,
                        background: `radial-gradient(circle at 35% 30%, ${skill.color}, ${skill.color}55 60%, ${skill.color}22)`,
                        boxShadow: isSelected
                          ? `0 0 0 2px ${skill.color}, 0 0 26px ${skill.color}99`
                          : `0 0 16px ${skill.color}44`,
                      }}
                    >
                      <span className="text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        {skill.glyph}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Detail sheet — slides up from the bottom of the grid, not the
          viewport, so it reads as part of this section rather than a
          global overlay. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass neon-frame relative mt-8 overflow-hidden rounded-2xl p-6"
            style={{ color: selected.color }}
          >
            <div className="hologram-lines pointer-events-none absolute inset-0 opacity-25" />

            <button
              onClick={() => onSelect(null)}
              className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/50 transition-colors hover:border-white/40 hover:text-white"
              aria-label="Close skill details"
            >
              ✕
            </button>

            <div className="relative">
              <span
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border text-lg font-bold"
                style={{ borderColor: `${selected.color}66`, background: `${selected.color}22`, boxShadow: `0 0 26px ${selected.color}55` }}
                aria-hidden="true"
              >
                {selected.glyph}
              </span>

              <p className="label-mono mb-2 !text-[0.58rem]">{CATEGORIES[selected.category].label}</p>
              <h3 className="mb-3 text-2xl font-bold text-white">{selected.name}</h3>
              <p className="mb-6 text-sm leading-relaxed text-white/60">{selected.blurb}</p>

              <div className="mb-1.5 flex items-baseline justify-between font-mono text-[11px]">
                <span className="text-white/40">Proficiency</span>
                <span style={{ color: selected.color }}>{selected.level}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selected.level}%` }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${selected.color}, #ffffff)`, boxShadow: `0 0 14px ${selected.color}` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
