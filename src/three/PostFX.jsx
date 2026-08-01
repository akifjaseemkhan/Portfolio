import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing';

/**
 * ⚠️ NOT CURRENTLY USED. Removed from HeroScene and ProjectsScene after
 * repeated, confirmed reports of lag tied directly to this being added —
 * even restricted to the 'high' tier, it was one of the most expensive
 * things running on the page. Left in place as an option, not deleted: if
 * you want it back on a scene, `import PostFX from './PostFX'` and render
 * `<PostFX tier={quality} />` inside that scene's contents again. Since
 * nothing currently imports this file, it costs nothing sitting here —
 * unused code isn't bundled.
 *
 * ── CINEMATIC POST-PROCESSING ─────────────────────────────────────────
 * The single biggest lever for "this looks like an Awwwards site" rather
 * than "this looks like a Three.js demo": bloom on bright edges, a soft
 * vignette for framing, and — on capable devices — depth-of-field so the
 * background actually recedes instead of staying uniformly sharp.
 *
 * Every effect here runs as one shared post-process pass per frame, which
 * is real, non-optional GPU cost on top of the scene itself — even with
 * everything inside it turned off, `EffectComposer` alone means rendering
 * the scene to a texture instead of straight to the screen, then a second
 * full-screen pass to composite it back. That's why this is restricted to
 * the 'high' tier only: it was briefly enabled on 'medium' too, and given
 * that our tier heuristic (CPU cores + RAM, see useQualityTier) has no way
 * to see actual GPU strength, 'medium' very plausibly includes laptops
 * with plenty of CPU/RAM but weak integrated graphics — exactly where an
 * extra render pass would be felt hardest. Better to under-apply this than
 * risk it being the reason the site feels slow again.
 *
 * @param {'low'|'medium'|'high'} tier
 * @param {number} focusDistance - normalized 0–1 distance from the camera's
 *   near to far plane where the image is sharpest. Tune per-scene to land
 *   on the actual subject (the desk, the cube array, …).
 * @param {boolean} depthOfField - set false to keep bloom + vignette but
 *   drop DoF even on the high tier. Needed for scenes whose camera moves
 *   between very different distances (e.g. Projects flying into a cube):
 *   a single fixed focus distance would look right at one distance and
 *   wrong at the other, so it's safer to skip DoF there entirely rather
 *   than guess at a compromise value.
 */
export default function PostFX({ tier, focusDistance = 0.12, depthOfField = true }) {
  if (tier !== 'high') return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.32}
        luminanceSmoothing={0.3}
        mipmapBlur
        radius={0.6}
      />
      {tier === 'high' && depthOfField && (
        <DepthOfField focusDistance={focusDistance} focalLength={0.028} bokehScale={2.6} height={480} />
      )}
      <Vignette eskil={false} offset={0.18} darkness={0.65} />
    </EffectComposer>
  );
}
