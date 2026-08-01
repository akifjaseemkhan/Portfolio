import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Glow, Label, ParticleField, Ripple, WarmupSignal } from './primitives';
import { QUALITY_PRESETS } from '../hooks/useDevice';

/**
 * ── HOLOGRAPHIC PROJECT CUBES ─────────────────────────────────────────
 * Each project is a rotating glass cube. Hovering enlarges it, lights its
 * edges and spawns particles; clicking flies the camera into the cube and
 * hands off to the fullscreen case study in the parent section.
 */

/** Burst of particles that appears around a hovered cube. */
function CubeParticles({ active, color, count = 40 }) {
  const pointsRef = useRef(null);
  const positions = useRef(null);

  if (!positions.current) {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Seeded on a shell around the cube so they orbit rather than fill it.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.95 + Math.random() * 0.5;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    positions.current = arr;
  }

  useFrame((state, delta) => {
    const p = pointsRef.current;
    if (!p) return;
    const dt = Math.min(delta, 0.05);
    p.rotation.y += dt * 0.9;
    p.rotation.x += dt * 0.35;
    // Fade in/out rather than mounting and unmounting the geometry.
    const target = active ? 0.85 : 0;
    p.material.opacity += (target - p.material.opacity) * Math.min(1, dt * 6);
    const s = active ? 1 : 0.6;
    p.scale.lerp({ x: s, y: s, z: s }, Math.min(1, dt * 5));
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function ProjectCube({ project, index, focused, anyFocused, onOpen, onHover }) {
  const group = useRef(null);
  const cube = useRef(null); // the rotating group: glass + rim + edges + core
  const glassMat = useRef(null); // material ref, set directly — no DOM/scene-graph indexing
  const [hovered, setHovered] = useState(false);

  // Built once. Constructing this inline would hand `args` a fresh object on
  // every render — and this component re-renders on hover, so the old edge
  // geometry would be rebuilt and orphaned on the GPU each time.
  const edges = useMemo(() => new THREE.BoxGeometry(1.27, 1.27, 1.27), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (group.current) {
      // Float, offset per cube so the row never pulses in unison.
      group.current.position.y = project.position[1] + Math.sin(t * 0.7 + project.phase) * 0.16;
      // Dim and shrink cubes that aren't the focused one.
      const dimmed = anyFocused && !focused;
      const targetScale = focused ? 1.35 : hovered ? 1.18 : dimmed ? 0.85 : 1;
      const s = group.current.scale.x + (targetScale - group.current.scale.x) * Math.min(1, dt * 7);
      group.current.scale.setScalar(s);
    }

    if (cube.current) {
      // Held at its fan-facing orientation (see layoutCubes) with a gentle
      // wobble layered on top, rather than spinning freely forever — a full
      // continuous spin would drift every cube out of the fan arrangement
      // within a few seconds and undo the whole composition. Hovering or
      // focusing makes the wobble faster and wider, reading as "charged up"
      // without losing the base orientation.
      const wobbleSpeed = hovered || focused ? 1.3 : 0.45;
      const wobbleAmount = hovered || focused ? 0.16 : 0.05;
      const baseY = project.rotationY ?? 0;
      cube.current.rotation.y = baseY + Math.sin(t * wobbleSpeed + project.phase) * wobbleAmount;
      cube.current.rotation.x = Math.sin(t * 0.4 + project.phase) * 0.1;

      if (glassMat.current) {
        const targetEm = focused ? 1.6 : hovered ? 1.0 : 0.35;
        glassMat.current.emissiveIntensity +=
          (targetEm - glassMat.current.emissiveIntensity) * Math.min(1, dt * 7);
      }
    }
  });

  const enter = (e) => {
    e.stopPropagation();
    setHovered(true);
    onHover(project);
    document.body.style.cursor = 'pointer';
  };
  const leave = (e) => {
    e.stopPropagation();
    setHovered(false);
    onHover(null);
    document.body.style.cursor = '';
  };

  return (
    <group ref={group} position={project.position}>
      {/* Everything that should turn together — the glass body, its fresnel
          rim, the wireframe cage and the inner core — lives inside this one
          rotating group. It used to be that only the glass mesh itself
          spun while the wireframe cage and rim stayed static around it,
          which went unnoticed as a stray tumble but would have been very
          visible once cubes hold a deliberate fan orientation: the cage
          needs to turn with the glass, not sit fixed while it spins inside. */}
      <group ref={cube}>
        {/* ── Glass cube ─────────────────────────────────────────── */}
        <RoundedBox
          args={[1.25, 1.25, 1.25]}
          radius={0.09}
          smoothness={4}
          onPointerOver={enter}
          onPointerOut={leave}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(project);
          }}
        >
          {/* Deliberately NOT meshPhysicalMaterial with `transmission`: real
              transmission makes three render the scene again into a separate
              target, per material, every frame — with six cubes that dominated
              the frame budget. A translucent standard material plus the
              emissive core and additive edges gives the same holographic glass
              read for a fraction of the cost. */}
          <meshStandardMaterial
            ref={glassMat}
            color={project.accent}
            emissive={project.accent}
            emissiveIntensity={0.4}
            transparent
            opacity={0.3}
            roughness={0.08}
            metalness={0.3}
            depthWrite={false}
            toneMapped={false}
          />
        </RoundedBox>

        {/* The fresnel rim shell that used to be here — an extra oversized
            box per cube purely for a subtle edge glow — is gone. It was
            one more draw call × 12 cubes for a refinement most visitors
            would never consciously notice, which isn't a good trade on a
            weak GPU. The wireframe edges below already carry the
            "hologram" read on their own. */}

        {/* Wireframe edges — what makes it read as a hologram */}
        <lineSegments>
          <edgesGeometry args={[edges]} />
          <lineBasicMaterial
            color={project.accent}
            transparent
            opacity={hovered || focused ? 1 : 0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>

        {/* Inner core */}
        <mesh scale={0.42}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshBasicMaterial
            color={project.accent}
            transparent
            opacity={hovered || focused ? 0.55 : 0.22}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Lighting that "activates" on hover.
          This used to add a pointLight per cube — six extra lights that every
          lit fragment in the scene had to pay for. The additive glow plus the
          material's emissive give the same "powered up" read for free. */}
      <Glow
        color={project.accent}
        scale={hovered || focused ? 5.2 : 3}
        opacity={hovered || focused ? 0.5 : 0.16}
      />

      <CubeParticles active={hovered || focused} color={project.accent} />
      <Ripple active={hovered} color={project.accent} radius={1.1} />

      {/* Title + year */}
      <Label
        text={project.title}
        color="#ffffff"
        height={0.26}
        opacity={anyFocused && !focused ? 0.2 : 1}
        position={[0, -1.08, 0]}
      />
      <Label
        text={project.year}
        color={project.accent}
        height={0.18}
        opacity={anyFocused && !focused ? 0.15 : 0.75}
        position={[0, -1.42, 0]}
      />
    </group>
  );
}

/**
 * Flies the camera toward the focused cube, and back out when it closes.
 * Framing the shot in 3D rather than cross-fading DOM is what makes the
 * transition feel like entering the project.
 */
function CameraRig({ focused, pointer }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    let tx;
    let ty;
    let tz;
    let lx;

    if (focused) {
      // Push in close to the selected cube.
      tx = focused.position[0] * 0.85;
      ty = focused.position[1] + 0.35;
      tz = focused.position[2] + 3.1;
      lx = focused.position[0];
    } else {
      // Idle: drift, with pointer parallax.
      tx = Math.sin(t * 0.12) * 0.9 + (pointer?.current.x ?? 0) * 1.4;
      ty = 0.5 + (pointer?.current.y ?? 0) * 0.5;
      tz = 9.2;
      lx = (pointer?.current.x ?? 0) * 0.4;
    }

    // The idle drift got the same "weightier camera" treatment as the hero,
    // but the fly-into-a-cube transition keeps its original, snappier speed
    // on purpose: Projects.jsx times the case-study overlay's appearance
    // against how long this move takes (a 620ms setTimeout) — slowing this
    // down without changing that would desync the two, opening the overlay
    // before the camera has actually arrived.
    const followSpeed = focused ? 2.4 : 1.3;
    camera.position.x += (tx - camera.position.x) * dt * followSpeed;
    camera.position.y += (ty - camera.position.y) * dt * followSpeed;
    camera.position.z += (tz - camera.position.z) * dt * followSpeed;

    look.current.x += (lx - look.current.x) * dt * 3;
    look.current.y += ((focused ? focused.position[1] : 0) - look.current.y) * dt * 3;
    camera.lookAt(look.current);
  });

  return null;
}

export default function ProjectsScene({
  cubes,
  quality,
  focused,
  pointer,
  active = true,
  onOpen,
  onHover,
  onWarm,
}) {
  const preset = QUALITY_PRESETS[quality];

  return (
    <Canvas
      dpr={preset.dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.5, 9.2], fov: 46, near: 0.1, far: 60 }}
      gl={{ antialias: preset.antialias, alpha: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => onHover(null)}
    >
      <PerformanceMonitor>
        <AdaptiveDpr pixelated={false} />
        {/* Every cube generates two label textures (title + year) on mount
            — with a dozen projects that's real synchronous work. Tells the
            parent section once it's actually done, so the loading spinner
            stays up until the array is complete instead of revealing it
            being built cube by cube. */}
        <WarmupSignal onReady={onWarm} frames={8} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 6]} intensity={1.1} color="#cfe9ff" />
        <spotLight position={[-8, 5, 4]} angle={0.8} penumbra={1} intensity={26} color="#7C3AED" />
        <fog attach="fog" args={['#050816', 10, 26]} />

        <CameraRig focused={focused} pointer={pointer} />

        {cubes.map((project, i) => (
          <ProjectCube
            key={project.id}
            project={project}
            index={i}
            focused={focused?.id === project.id}
            anyFocused={!!focused}
            onOpen={onOpen}
            onHover={onHover}
          />
        ))}

        {/* Reflective floor grid under the array */}
        <gridHelper args={[40, 40, '#0d3a4a', '#0a1526']} position={[0, -2.6, 0]} />

        <ParticleField
          count={Math.round(preset.particles * 0.4)}
          radius={16}
          color="#00E5FF"
          size={0.05}
          opacity={0.4}
        />
      </PerformanceMonitor>
    </Canvas>
  );
}
