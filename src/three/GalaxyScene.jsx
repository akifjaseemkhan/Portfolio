import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, OrbitControls, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { Glow, Label, ParticleField, Ripple, SphereIcon, WarmupSignal } from './primitives';
import { QUALITY_PRESETS } from '../hooks/useDevice';

/**
 * ── SKILLS GALAXY ─────────────────────────────────────────────────────
 * Every skill is a glowing sphere on a Fibonacci shell (positions come
 * from `buildGalaxy` in src/data/skills.js).
 *
 * Interaction: hover ripples the sphere, click selects it and the whole
 * galaxy eases back so the selection reads clearly. Selection state lives
 * in the parent section so the detail panel can be plain DOM — much more
 * accessible than text rendered into WebGL.
 */

/** One skill sphere. */
function SkillNode({ skill, selected, dimmed, onSelect, onHover }) {
  const meshRef = useRef(null);
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Target scale is derived, not animated in state — one lerp per frame.
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (groupRef.current) {
      // Gentle orbital bob, desynchronised via the per-skill phase.
      groupRef.current.position.y = skill.position[1] + Math.sin(t * 0.6 + skill.phase) * 0.22;
    }

    if (meshRef.current) {
      const target = selected ? 1.7 : hovered ? 1.35 : 1;
      meshRef.current.scale.lerp(
        { x: target, y: target, z: target },
        Math.min(1, dt * 8),
      );
      meshRef.current.rotation.y += dt * 0.25;

      // Emissive rises with attention so the sphere feels "charged".
      const mat = meshRef.current.material;
      const targetEmissive = selected ? 2.6 : hovered ? 1.8 : 0.85;
      mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * Math.min(1, dt * 7);
      mat.opacity += ((dimmed ? 0.22 : 1) - mat.opacity) * Math.min(1, dt * 6);
    }
  });

  const enter = (e) => {
    e.stopPropagation();
    setHovered(true);
    onHover(skill);
    document.body.style.cursor = 'pointer';
  };
  const leave = (e) => {
    e.stopPropagation();
    setHovered(false);
    onHover(null);
    document.body.style.cursor = '';
  };

  return (
    <group ref={groupRef} position={skill.position}>
      <mesh
        ref={meshRef}
        onPointerOver={enter}
        onPointerOut={leave}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(skill);
        }}
      >
        <icosahedronGeometry args={[skill.size, 3]} />
        <meshStandardMaterial
          color={skill.color}
          emissive={skill.color}
          emissiveIntensity={0.85}
          roughness={0.25}
          metalness={0.4}
          transparent
          opacity={1}
          toneMapped={false}
        />

        {/* Tech icon, nested inside the mesh so it inherits the hover scale
            and stays glued to the sphere's surface as it grows. */}
        <SphereIcon
          glyph={skill.glyph}
          radius={skill.size}
          color="#ffffff"
          opacity={dimmed ? 0.2 : 1}
        />
      </mesh>

      {/* Halo */}
      <Glow
        color={skill.color}
        scale={skill.size * (selected ? 9 : hovered ? 7 : 5)}
        opacity={dimmed ? 0.06 : selected ? 0.45 : 0.25}
      />

      {/* Hover ripple, oriented to face the camera plane */}
      <Ripple active={hovered || selected} color={skill.color} radius={skill.size * 1.5} />

      {/* Label — a sprite, so it faces the camera with no extra work */}
      <Label
        text={skill.name}
        color="#ffffff"
        height={0.27}
        opacity={dimmed ? 0.15 : hovered || selected ? 1 : 0.6}
        position={[0, skill.size + 0.38, 0]}
      />
    </group>
  );
}

/**
 * The galaxy's power source — replaces what used to be a single flat glow
 * sprite at the origin. A pulsing core, a counter-rotating wireframe shell
 * and three orbital rings on different axes read as an actual energy
 * source the skill nodes are orbiting, rather than empty space with a
 * light behind it. Everything here is geometry Three.js already has
 * built in (icosahedron, torus, edges) — no new materials or textures,
 * so it costs a handful of extra draw calls, not a shader.
 */
function GalaxyCore() {
  const core = useRef(null);
  const shell = useRef(null);
  const ringA = useRef(null);
  const ringB = useRef(null);
  const ringC = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 1.4) * 0.08;

    if (core.current) {
      core.current.scale.setScalar(pulse);
      core.current.material.emissiveIntensity = 2.2 + Math.sin(t * 1.4) * 0.6;
      core.current.rotation.y += 0.003;
    }
    if (shell.current) {
      shell.current.rotation.y -= 0.0022;
      shell.current.rotation.x = Math.sin(t * 0.25) * 0.2;
    }
    // Three rings on staggered axes and speeds — reads as an orbital/atom
    // motif without needing three different geometries.
    if (ringA.current) ringA.current.rotation.z = t * 0.4;
    if (ringB.current) {
      ringB.current.rotation.x = Math.PI / 3;
      ringB.current.rotation.z = -t * 0.3;
    }
    if (ringC.current) {
      ringC.current.rotation.x = Math.PI / 2.3;
      ringC.current.rotation.y = t * 0.35;
    }
  });

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={2.2}
          roughness={0.2}
          metalness={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Wireframe shell, counter-rotating against the core */}
      <lineSegments ref={shell}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(0.82, 1)]} />
        <lineBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {/* Orbital rings */}
      {[
        { ref: ringA, radius: 1.3, color: '#00E5FF', opacity: 0.4 },
        { ref: ringB, radius: 1.55, color: '#7C3AED', opacity: 0.32 },
        { ref: ringC, radius: 1.8, color: '#14F195', opacity: 0.26 },
      ].map(({ ref, radius, color, opacity }, i) => (
        <mesh key={i} ref={ref}>
          <torusGeometry args={[radius, 0.008, 8, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Layered glow: a tight bright core plus a much softer, wider bloom */}
      <Glow color="#ffffff" scale={1.6} opacity={0.5} />
      <Glow color="#7C3AED" scale={6.5} opacity={0.2} />
    </group>
  );
}

/** Faint lines linking same-category spheres, drawn as one geometry. */
function Constellations({ nodes }) {
  const geometry = useMemo(() => {
    const points = [];
    const byCategory = nodes.reduce((acc, n) => {
      (acc[n.category] ??= []).push(n);
      return acc;
    }, {});

    // Chain each category's nodes in sequence — O(n) segments, one draw call.
    Object.values(byCategory).forEach((group) => {
      for (let i = 0; i < group.length - 1; i += 1) {
        points.push(new THREE.Vector3(...group[i].position));
        points.push(new THREE.Vector3(...group[i + 1].position));
      }
    });

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [nodes]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#00E5FF"
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/**
 * Rotates the galaxy, and eases it back when a sphere is selected.
 *
 * Note this scales the *group* rather than moving the camera: OrbitControls
 * owns the camera transform, and writing to it here as well would make the
 * two fight for the same values every frame and visibly jitter.
 */
function GalaxyRig({ children, selected, autoRotate }) {
  const group = useRef(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!group.current) return;

    if (autoRotate) group.current.rotation.y += dt * 0.075;

    // Shrink back a little to make room for the detail panel.
    const target = selected ? 0.86 : 1;
    const s = group.current.scale.x + (target - group.current.scale.x) * Math.min(1, dt * 3);
    group.current.scale.setScalar(s);
  });

  return <group ref={group}>{children}</group>;
}

export default function GalaxyScene({ nodes, quality, selected, active = true, onSelect, onHover, onWarm }) {
  const preset = QUALITY_PRESETS[quality];

  return (
    <Canvas
      dpr={preset.dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 13.5], fov: 50, near: 0.1, far: 60 }}
      gl={{ antialias: preset.antialias, alpha: true, powerPreference: 'high-performance' }}
      // Clicking empty space clears the selection.
      onPointerMissed={() => onSelect(null)}
    >
      <PerformanceMonitor>
        <AdaptiveDpr pixelated={false} />
        {/* Every sphere generates its own label + glyph texture on mount —
            with 30+ skills that's real synchronous work. This tells the
            parent section once it's actually finished, so the loading
            spinner can stay up until there's something complete to show
            instead of revealing the galaxy build itself sphere by sphere. */}
        <WarmupSignal onReady={onWarm} frames={8} />

        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={26} color="#7C3AED" distance={20} />
        <directionalLight position={[6, 8, 6]} intensity={0.75} />

        <GalaxyRig selected={selected} autoRotate={!selected}>
          <Constellations nodes={nodes} />
          {nodes.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              selected={selected?.id === skill.id}
              dimmed={!!selected && selected.id !== skill.id}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </GalaxyRig>

        <GalaxyCore />
        <ParticleField count={Math.round(preset.particles * 0.5)} radius={18} color="#7C3AED" size={0.05} opacity={0.35} />

        {/* Drag to look around; zoom is disabled so the page keeps scrolling */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.45}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
        />
      </PerformanceMonitor>
    </Canvas>
  );
}
