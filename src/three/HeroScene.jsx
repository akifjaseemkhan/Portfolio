import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Lightformer,
  PerformanceMonitor,
  Preload,
} from '@react-three/drei';
import * as THREE from 'three';
import Workspace from './Workspace';
import { ParticleField, WarmupSignal } from './primitives';
import { QUALITY_PRESETS } from '../hooks/useDevice';

/**
 * ── HERO 3D SCENE ─────────────────────────────────────────────────────
 * The camera never sits still: it orbits on a slow cinematic path and
 * leans toward the pointer, so the workspace always feels inhabited.
 *
 * Quality is chosen from device capability and then adapts at runtime —
 * `PerformanceMonitor` drops DPR if frames start slipping, which is what
 * actually protects the 60 FPS target on unpredictable hardware.
 */

/** Cinematic camera rig — slow dolly + pointer parallax. */
function CameraRig({ pointer, reduced }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.35, 0));

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    // Pointer is smoothed here rather than at the event, so the camera
    // glides instead of snapping to every mouse sample.
    pointer.current.x += (pointer.current.tx - pointer.current.x) * dt * 2.6;
    pointer.current.y += (pointer.current.ty - pointer.current.y) * dt * 2.6;

    // Base orbit: a shallow lissajous so the path never visibly repeats.
    const orbitX = Math.sin(t * 0.11) * 1.5 + Math.sin(t * 0.047) * 0.5;
    const orbitY = 1.55 + Math.sin(t * 0.083) * 0.28;
    const orbitZ = 6.4 + Math.cos(t * 0.09) * 0.55;

    const parallax = reduced ? 0 : 1;
    const desiredX = orbitX + pointer.current.x * 1.15 * parallax;
    const desiredY = orbitY + pointer.current.y * 0.55 * parallax;

    // Slower follow than before: the camera body now trails a beat behind
    // where it's heading, while the look-at target (below) tracks the
    // pointer at full speed. That split — a heavy rig, an alert gaze — is
    // a standard cinematography trick, and it's what separates "the camera
    // is glued to the mouse" from "an operator is holding this."
    camera.position.x += (desiredX - camera.position.x) * dt * 1.4;
    camera.position.y += (desiredY - camera.position.y) * dt * 1.4;
    camera.position.z += (orbitZ - camera.position.z) * dt * 1.05;

    // Look slightly ahead of the pointer for a "following the eye" feel.
    target.current.x = pointer.current.x * 0.28 * parallax;
    target.current.y = 0.35 + pointer.current.y * 0.12 * parallax;
    camera.lookAt(target.current);
  });

  return null;
}

/** Scene lighting — cool key, violet rim, warm fill, plus a breathing pulse. */
function Lighting({ shadows }) {
  const keyRef = useRef(null);
  // Two colours the key light drifts between — reused each frame rather
  // than allocated, and only the lerp target changes, not the objects.
  const coolTone = useRef(new THREE.Color('#cfe9ff'));
  const warmTone = useRef(new THREE.Color('#e8f0ff'));
  const mixedTone = useRef(new THREE.Color());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Slow intensity drift so the lighting reads as "subtly changing".
    if (keyRef.current) {
      keyRef.current.intensity = 1.55 + Math.sin(t * 0.35) * 0.4;
      // A faint colour-temperature drift alongside the intensity breathing —
      // barely perceptible frame to frame, but it's what keeps a static-
      // looking key light from reading as static over a 30-second visit.
      const mix = (Math.sin(t * 0.35) + 1) / 2;
      mixedTone.current.copy(coolTone.current).lerp(warmTone.current, mix * 0.4);
      keyRef.current.color.copy(mixedTone.current);
    }
  });

  return (
    <>
      {/* Ambient alone — a hemisphere light on top was a third global term
          for a scene that is mostly lit by emissive surfaces anyway. */}
      <ambientLight intensity={0.34} color="#5a6bff" />

      {/* Key */}
      <directionalLight
        ref={keyRef}
        position={[4, 6, 4]}
        intensity={1.6}
        color="#cfe9ff"
        castShadow={shadows}
        // 512 is plenty: the desk is small on screen and the shadows are soft
        // and low-contrast, so the extra resolution was invisible but not free.
        shadow-mapSize={[512, 512]}
        shadow-camera-far={22}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0008}
      />

      {/* Violet rim from behind-left — pushed a bit hotter than before so
          the desk's silhouette separates from the background more clearly,
          the classic three-point-lighting "rim" read. */}
      <spotLight
        position={[-6, 4.5, -4]}
        angle={0.65}
        penumbra={0.9}
        intensity={46}
        color="#7C3AED"
        distance={22}
      />
      {/* Cyan rim from behind-right */}
      <spotLight
        position={[6, 3.5, -4]}
        angle={0.7}
        penumbra={0.9}
        intensity={34}
        color="#00E5FF"
        distance={22}
      />
      {/* Warm bounce so the desk isn't uniformly cold */}
      <pointLight position={[0, 1.2, 3.5]} intensity={9} color="#ffb37a" distance={9} decay={2} />
    </>
  );
}

function SceneContents({ quality, pointer, reduced, onWarm }) {
  const preset = QUALITY_PRESETS[quality];

  return (
    <>
      <CameraRig pointer={pointer} reduced={reduced} />
      <Lighting shadows={preset.shadows} />
      {/* onCreated (further down) fires the moment the renderer exists —
          before a single triangle has gone through a draw call. This waits
          for the extra work (shader compilation, texture uploads) that
          follows on the first real frames instead. */}
      <WarmupSignal onReady={onWarm} frames={10} />

      {/* Volumetric haze — sells depth for almost no cost */}
      <fog attach="fog" args={['#050816', 8, 24]} />

      <Workspace quality={quality} />

      {/* One field, not two: each one walks its whole position buffer on the
          CPU every frame, so a second layer doubled that for a subtle tint. */}
      <ParticleField count={preset.particles} radius={16} color="#00E5FF" size={0.06} opacity={0.55} />

      {/* Image-based lighting so the metal surfaces have something to
          reflect. Built from Lightformers rather than a `preset`, because
          presets fetch an HDR from a CDN — this renders to an offscreen
          cubemap once and ships nothing over the network. */}
      <Environment resolution={128} frames={1} background={false}>
        <Lightformer form="rect" intensity={2.4} color="#00E5FF" scale={[10, 6, 1]} position={[-6, 3, -6]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.0} color="#7C3AED" scale={[10, 6, 1]} position={[6, 2, -6]} target={[0, 0, 0]} />
        <Lightformer form="circle" intensity={1.6} color="#ffffff" scale={[6, 6, 1]} position={[0, 8, 2]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.1} color="#14F195" scale={[8, 2, 1]} position={[0, -2, 4]} target={[0, 0, 0]} />
      </Environment>

      <Preload all />
    </>
  );
}

export default function HeroScene({
  quality = 'high',
  pointer,
  reduced = false,
  active = true,
  onReady,
}) {
  const preset = QUALITY_PRESETS[quality];
  const dprRef = useRef(preset.dpr);

  return (
    <Canvas
      shadows={preset.shadows}
      dpr={dprRef.current}
      // Stops rendering the moment the hero scrolls off screen.
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 1.6, 7], fov: 42, near: 0.1, far: 60 }}
      gl={{
        antialias: preset.antialias,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        // A touch more exposure than a neutral 1.0: with ACES filmic toning
        // this pushes the highlights (the RGB strips, the glow sprites)
        // just enough to feel punchy without blowing out to flat white.
        gl.toneMappingExposure = 1.15;
        // `onReady` is no longer fired from here — see WarmupSignal above
        // for why "context exists" was firing this too early.
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          // Shed resolution before anything else — it is the cheapest win
          // and the least visible loss at these glow levels.
          dprRef.current = [1, 1.2];
        }}
      >
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
        <Suspense fallback={null}>
          <SceneContents quality={quality} pointer={pointer} reduced={reduced} onWarm={onReady} />
        </Suspense>
      </PerformanceMonitor>
    </Canvas>
  );
}
