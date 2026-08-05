import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { STATUS_STYLES, layoutCubes, projects } from '../../data/projects';
import { useIsMobile, useIsTouch, useQualityTier, useSceneVisibility } from '../../hooks/useDevice';
import { usePointer } from '../../hooks/usePointer';
import SectionHeading from '../ui/SectionHeading';
import SceneBoundary from '../ui/SceneBoundary';
import ProjectCarousel from './ProjectCarousel';

const ProjectsScene = lazy(() => import('../../three/ProjectsScene'));

/* ══════════════════════════════════════════════════════════════════════
   IN-PROGRESS POPUP
   ══════════════════════════════════════════════════════════════════════ */

/**
 * A live project's card opens its real link directly — no reason to make
 * a visitor click through a preview of something they can just go look at.
 * A project with no live link yet has nowhere to send them, so this small
 * status card explains that instead, rather than opening a whole page of
 * placeholder screenshots for something that isn't out yet.
 */
function InProgressPopup({ project, onClose }) {
  const status = STATUS_STYLES[project.status];

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} status`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-base/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        role="document"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass glass-edge neon-frame relative w-full max-w-sm overflow-hidden rounded-2xl p-6"
      >
        <button
          onClick={onClose}
          autoFocus
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-white/50 transition-colors duration-300 hover:text-white"
        >
          ✕
        </button>

        <span
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ borderColor: `${status.color}66`, color: status.color, background: `${status.color}14` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color, boxShadow: `0 0 8px ${status.color}` }} />
          {status.label}
        </span>

        <h3 className="mb-2 text-xl font-bold text-white">{project.title}</h3>
        <p className="text-sm leading-relaxed text-white/60">{project.subtitle}</p>
        <p className="mt-4 text-xs text-white/40">
          {project.statusNote
            ? project.statusNote
            : project.status === 'planned'
              ? "Not started yet — no link to share until it's underway."
              : project.status === 'building'
                ? 'Still in progress — no public link yet. Check back soon.'
                : 'Built and shipped, just not published anywhere public yet.'}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SECTION
   ══════════════════════════════════════════════════════════════════════ */
export default function Projects({ lenis }) {
  const quality = useQualityTier();
  const isTouch = useIsTouch();
  const isMobile = useIsMobile();
  const pointer = usePointer();
  const [focused, setFocused] = useState(null); // camera target
  const [popup, setPopup] = useState(null); // small "not live yet" card
  const [hovered, setHovered] = useState(null);
  const [warm, setWarm] = useState(false);
  const scene = useSceneVisibility();

  const cubes = useMemo(() => layoutCubes(projects), []);

  // Camera zooms to the cube first, then — once it's committed — either
  // hands off to the real live link or, if there isn't one yet, shows the
  // small status card. Nothing about a project that's still in progress
  // deserves a full-page takeover; that's reserved for actually leaving
  // the site to go look at the real thing.
  //
  // The portfolio card is special-cased: its "live" link is this very
  // site, so opening it in a new tab just shows the same page again in
  // another window. A reload is the honest version of "here's the live
  // thing" when the live thing is what you're already looking at.
  const openProject = useCallback((project) => {
    setFocused(project);
    setTimeout(() => {
      if (project.id === 'portfolio') {
        window.location.reload();
      } else if (project.links.live) {
        window.open(project.links.live, '_blank', 'noopener,noreferrer');
        setFocused(null);
      } else {
        setPopup(project);
      }
    }, 620);
  }, []);

  const closePopup = useCallback(() => {
    setPopup(null);
    setFocused(null);
  }, []);

  // Lock page scroll behind the popup.
  useEffect(() => {
    const l = lenis?.current;
    if (popup) {
      l?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      l?.start();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [popup, lenis]);

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative mx-auto max-w-7xl px-6 py-28 sm:py-36"
    >
      <div id="projects-title">
        <SectionHeading
          eyebrow="Selected work"
          title="Project Array"
          subtitle={
            isMobile
              ? 'Swipe through — live projects open directly, others show their status.'
              : isTouch
                ? 'Tap a cube — live projects open directly, others show their status.'
                : 'Hover a cube to charge it. Click a live one to open it, or peek at what’s still in progress.'
          }
        />
      </div>

      {/* On phones the cube array's wide fan compresses until every title
          overlaps the next — see ProjectCarousel for why this gets a
          purpose-built flat layout instead of a scaled-down 3D scene. */}
      {isMobile && <ProjectCarousel projects={projects} onOpen={openProject} />}

      {/* ── 3D cube array ───────────────────────────────────────── */}
      {!isMobile && (
      <div className="glass glass-edge relative h-[480px] overflow-hidden rounded-3xl sm:h-[560px]">
        {/* Opacity 0 until warm (see WarmupSignal): the canvas still renders
            while hidden, so generating a label texture for all 12 project
            cubes happens out of sight instead of the array visibly
            assembling itself cube by cube. */}
        <div
          ref={scene.ref}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: warm ? 1 : 0 }}
        >
          <SceneBoundary label="The project array">
          <Suspense fallback={null}>
            {scene.mounted && (
              <ProjectsScene
                cubes={cubes}
                quality={quality}
                focused={focused}
                pointer={pointer}
                // Keep rendering while a cube is focused — the camera is
                // still flying in, whether that ends in a new tab opening
                // or the status popup appearing.
                active={scene.visible || !!focused}
                onOpen={openProject}
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
              <div className="h-24 w-24 animate-spin-slow rounded-2xl border border-dashed border-primary/40" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-5 space-y-1 font-mono text-[10px] text-white/30"
        >
          <p>ARRAY · {cubes.length} NODES</p>
          <p>MODE · HOLOGRAPHIC</p>
        </div>

        {/* Hovered project readout */}
        <AnimatePresence>
          {hovered && !popup && (
            <motion.div
              key={hovered.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none absolute inset-x-4 bottom-4 sm:left-1/2 sm:right-auto sm:w-[26rem] sm:-translate-x-1/2"
            >
              <div className="glass rounded-2xl px-5 py-4" style={{ color: hovered.accent }}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{hovered.title}</p>
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    {STATUS_STYLES[hovered.status].label}
                  </span>
                </div>
                <p className="text-xs text-white/50">{hovered.subtitle}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* ── Keyboard / no-WebGL access to every project ──────────
           The cubes are canvas contents and cannot be focused, so this
           row is the real navigation path on desktop — not a fallback
           afterthought. Skipped on mobile: ProjectCarousel above is
           already built entirely from real, focusable buttons, so this
           would just be a duplicate list of the same 8+ projects. */}
      {!isMobile && (
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => {
          const status = STATUS_STYLES[p.status];
          return (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.07 }}
            >
              <button
                onClick={() => openProject(p)}
                className="glass neon-frame group h-full w-full overflow-hidden rounded-2xl p-5 text-left transition-transform duration-400 hover:-translate-y-1"
                style={{ color: p.accent }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: status.color }}>
                    {status.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-white/30 transition-all duration-400 group-hover:translate-x-1 group-hover:text-white/80"
                  >
                    →
                  </span>
                </div>
                <p className="mb-1.5 text-base font-semibold text-white">{p.title}</p>
                <p className="mb-4 text-xs leading-relaxed text-white/45">{p.subtitle}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {p.technologies.slice(0, 4).map((t) => (
                    <li
                      key={t}
                      className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/55"
                    >
                      {t}
                    </li>
                  ))}
                  {p.technologies.length > 4 && (
                    <li className="px-1 py-0.5 text-[10px] text-white/35">
                      +{p.technologies.length - 4}
                    </li>
                  )}
                </ul>
              </button>
            </motion.li>
          );
        })}
      </ul>
      )}

      {/* ── In-progress status popup ────────────────────────────── */}
      <AnimatePresence>
        {popup && <InProgressPopup key={popup.id} project={popup} onClose={closePopup} />}
      </AnimatePresence>
    </section>
  );
}
