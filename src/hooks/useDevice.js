import { useEffect, useRef, useState } from 'react';

/** Generic matchMedia hook with SSR-safe initial state. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
export const useIsTouch = () => useMediaQuery('(hover: none), (pointer: coarse)');
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * Best-effort GPU capability read via the WEBGL_debug_renderer_info
 * extension. Browsers increasingly restrict this for fingerprinting
 * reasons, so it can return null — callers must treat that as "unknown",
 * not "weak".
 *
 * This exists because CPU core count and RAM (what the tier heuristic
 * below otherwise relies on) say nothing about the GPU. A laptop can
 * easily have 8 cores and 16GB of RAM — landing it in 'medium' or 'high'
 * — while running integrated graphics that struggle with a WebGL scene
 * the CPU numbers say it should handle fine. That mismatch is a very
 * plausible explanation for lag persisting despite the tier system saying
 * the device should be capable.
 */
function detectGPURenderer() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return null;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return null;
    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || null;
  } catch {
    return null;
  }
}

/** Known-weak or software-only renderer signatures — always forced to 'low'. */
const SOFTWARE_RENDERER_PATTERNS = [/swiftshader/i, /llvmpipe/i, /basic render/i, /software/i];

/**
 * Integrated GPU signatures capable enough to run *something*, but not the
 * "high" tier's extra work (post-processing, depth of field, shadows at
 * full resolution). Apple's own integrated GPUs (M-series) are excluded —
 * unlike most integrated graphics they're genuinely capable.
 */
const WEAK_INTEGRATED_PATTERNS = [/intel/i, /uhd graphics/i, /hd graphics/i, /vega \d/i];

/** @returns {'low'|'medium'|null} a tier ceiling, or null if unknown/capable. */
function gpuTierCeiling(renderer) {
  if (!renderer) return null;
  if (SOFTWARE_RENDERER_PATTERNS.some((p) => p.test(renderer))) return 'low';
  if (/apple/i.test(renderer)) return null; // Apple Silicon: no ceiling
  if (WEAK_INTEGRATED_PATTERNS.some((p) => p.test(renderer))) return 'medium';
  return null;
}

const TIER_RANK = { low: 0, medium: 1, high: 2 };

/**
 * Picks a rendering quality tier once, from device signals. Everything
 * expensive in the 3D scenes (particle counts, shadows, DPR, post-effects)
 * is scaled off this so low-end hardware still holds a smooth frame rate.
 *
 * @returns {'low'|'medium'|'high'}
 */
export function useQualityTier() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const reduced = useReducedMotion();

  const [hardware] = useState(() => {
    if (typeof navigator === 'undefined') return 'high';
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = navigator.deviceMemory ?? 4;
    let tier = 'high';
    if (cores <= 4 || memory <= 4) tier = 'low';
    else if (cores <= 8 || memory <= 8) tier = 'medium';

    // The GPU check can only ever pull the tier down, never push it up —
    // it's a ceiling on an otherwise-capable-looking machine, not a
    // reason to trust hardware we can't actually identify.
    const ceiling = gpuTierCeiling(detectGPURenderer());
    if (ceiling && TIER_RANK[ceiling] < TIER_RANK[tier]) tier = ceiling;
    return tier;
  });

  if (reduced || isMobile) return 'low';
  if (isTablet) return hardware === 'high' ? 'medium' : 'low';
  return hardware;
}

/**
 * Viewport gate for the 3D sections.
 *
 * This page hosts four separate WebGL canvases. Letting them all render
 * continuously would burn four render loops at once and make 60 FPS
 * impossible, so each scene uses this to know when it matters:
 *
 *   `mounted`  – should the scene exist in the DOM right now?
 *   `visible`  – is it on screen right now? Drives `frameloop`, so an
 *                off-screen-but-still-mounted canvas costs nothing per frame.
 *
 * `mounted` used to latch true forever on the theory that rebuilding a
 * context mid-scroll costs more than just keeping it. That's true in
 * isolation, but it means every scene a visitor has ever scrolled past
 * stays alive — on a page with four of them, nothing ever gives the GPU
 * memory back. On a constrained device (integrated graphics, a phone, a
 * browser under memory pressure) that's enough to exhaust the browser's
 * WebGL context budget, and whichever scene happens to mount when the
 * ceiling is hit fails — not always the same one, which is exactly the
 * "it broke somewhere different this time" symptom that gave this away.
 *
 * The fix is two thresholds instead of one, so a scene mounts early (same
 * as before, to avoid a stutter) but also *unmounts* — freeing its context —
 * once it's genuinely far from the viewport, not just off-screen. The gap
 * between the two is wide on purpose: normal back-and-forth scrolling near
 * a section should never toggle it on and off, only actually moving on to
 * a much later part of the page should.
 *
 * @param {string} mountMargin - how far ahead of the viewport to pre-mount.
 *   700px was tuned back when `mounted` still latched forever, and mounting
 *   earlier directly meant contexts stayed alive longer — a real risk on a
 *   constrained GPU. Now that teardown is handled separately by
 *   `keepAliveMargin`, that tradeoff no longer applies, so this can afford
 *   to be more generous: 1100px gives a scene meaningfully more real wall-
 *   clock time to finish compiling shaders and uploading textures before a
 *   fast scroll actually reaches it — the fix for a visible stutter right
 *   as a new section's canvas comes into view.
 * @param {string} keepAliveMargin - how far a section can be before its
 *   context is released. Deliberately much larger than `mountMargin`.
 */
export function useSceneVisibility(mountMargin = '1100px', keepAliveMargin = '2500px') {
  const ref = useRef(null);
  const [state, setState] = useState({ mounted: false, visible: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // Mounts once the section is getting close.
    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setState((s) => (s.mounted ? s : { ...s, mounted: true }));
      },
      { rootMargin: mountMargin },
    );

    // Unmounts (and so tears down the WebGL context) once the section is
    // well outside this much wider region — the actual fix for unbounded
    // context growth.
    const keepAliveObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setState((s) => (s.mounted ? { mounted: false, visible: false } : s));
        }
      },
      { rootMargin: keepAliveMargin },
    );

    const onScreen = new IntersectionObserver(
      ([entry]) => setState((s) => ({ ...s, visible: entry.isIntersecting })),
      { threshold: 0 },
    );

    mountObserver.observe(el);
    keepAliveObserver.observe(el);
    onScreen.observe(el);

    return () => {
      mountObserver.disconnect();
      keepAliveObserver.disconnect();
      onScreen.disconnect();
    };
  }, [mountMargin, keepAliveMargin]);

  return { ref, ...state };
}

/**
 * Per-tier 3D budget. Read this instead of hard-coding counts so a single
 * edit here rebalances performance across every scene.
 */
export const QUALITY_PRESETS = {
  // Every phone lands on 'low' regardless of refresh rate (see isMobile
  // check above) — mid-range Android GPUs are the real floor this has to
  // hold up on, so it stays deliberately conservative.
  // Shadows off for 'medium' now too, not just 'low': real-time shadow
  // mapping means rendering the scene a second time from the light's point
  // of view, every frame, just to compute where shadows fall — real,
  // substantial GPU cost. This matters more now than when these presets
  // were first written: 'medium' used to be reached only through CPU/RAM,
  // but now that a weak-GPU ceiling (see gpuTierCeiling above) can also
  // place a device here, 'medium' includes exactly the kind of machine —
  // strong CPU, weak integrated GPU — that shadow mapping hits hardest.
  low: { dpr: [1, 1.15], particles: 380, shadows: false, stars: 600, holograms: 3, antialias: false },
  medium: { dpr: [1, 1.5], particles: 900, shadows: false, stars: 1400, holograms: 5, antialias: true },
  high: { dpr: [1, 1.75], particles: 1500, shadows: true, stars: 2200, holograms: 6, antialias: true },
};
