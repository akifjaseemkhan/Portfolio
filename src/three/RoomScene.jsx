import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { Glow, ParticleField } from './primitives';
import { QUALITY_PRESETS } from '../hooks/useDevice';

/**
 * ── EXPERIENCE ROOM ───────────────────────────────────────────────────
 * A dark room containing one large hologram. Selecting a discipline in the
 * parent section morphs the hologram's geometry, recolours every light and
 * swaps the particle field — so the room itself transforms rather than the
 * content merely swapping out.
 *
 * `shape` comes from src/data/experience.js.
 */

/** Geometry generators, one per discipline. */
function useShapeGeometry(shape) {
  return useMemo(() => {
    switch (shape) {
      // Frontend — a lattice of nested boxes, like a layout grid in space.
      case 'grid': {
        const geos = [];
        for (let x = -1; x <= 1; x += 1) {
          for (let y = -1; y <= 1; y += 1) {
            const g = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            g.translate(x * 0.62, y * 0.62, 0);
            geos.push(g);
          }
        }
        return geos;
      }
      // Android — a phone slab with a camera bump.
      case 'device': {
        const body = new THREE.BoxGeometry(0.95, 1.85, 0.11);
        const cam = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
        cam.rotateX(Math.PI / 2);
        cam.translate(0.28, 0.62, 0.08);
        return [body, cam];
      }
      // UI Design — concentric rings, an orbiting design system.
      case 'orbit': {
        return [0.55, 0.85, 1.15, 1.45].map((r, i) => {
          const g = new THREE.TorusGeometry(r, 0.014, 8, 72);
          g.rotateX(Math.PI / 2 + i * 0.32);
          g.rotateZ(i * 0.4);
          return g;
        });
      }
      // AI — a layered neural lattice.
      case 'neural': {
        const geos = [];
        for (let layer = 0; layer < 3; layer += 1) {
          for (let n = 0; n < 4; n += 1) {
            const g = new THREE.SphereGeometry(0.1, 12, 10);
            g.translate((layer - 1) * 0.85, (n - 1.5) * 0.5, 0);
            geos.push(g);
          }
        }
        return geos;
      }
      // Web apps — an icosahedral network mesh.
      case 'network':
      default: {
        return [new THREE.IcosahedronGeometry(1.15, 1)];
      }
    }
  }, [shape]);
}

/** The hologram: wireframe geometry + translucent shell + scanline sweep. */
function Hologram({ room }) {
  const group = useRef(null);
  const scan = useRef(null);
  const geometries = useShapeGeometry(room.shape);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (group.current) {
      group.current.rotation.y += dt * 0.28;
      group.current.position.y = Math.sin(t * 0.7) * 0.09;
      // Ease up from zero on mount / after a switch.
      const s = group.current.scale.x + (1 - group.current.scale.x) * Math.min(1, dt * 5);
      group.current.scale.setScalar(s);
    }

    // Scanline plane travels up through the hologram on a loop.
    if (scan.current) {
      scan.current.position.y = (((t * 0.3) % 1) - 0.5) * 3.4;
    }
  });

  return (
    <group ref={group} scale={0.001}>
      {geometries.map((geo, i) => (
        <group key={i}>
          {/* Solid translucent body */}
          <mesh geometry={geo}>
            <meshStandardMaterial
              color={room.color}
              emissive={room.color}
              emissiveIntensity={0.7}
              transparent
              opacity={0.14}
              roughness={0.2}
              metalness={0.3}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          {/* Wireframe overlay — the actual "hologram" read */}
          <lineSegments>
            <wireframeGeometry args={[geo]} />
            <lineBasicMaterial
              color={room.color}
              transparent
              opacity={0.5}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </lineSegments>
        </group>
      ))}

      {/* Scanline */}
      <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 1.9, 48]} />
        <meshBasicMaterial
          color={room.color}
          transparent
          opacity={0.09}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <Glow color={room.color} scale={5.5} opacity={0.22} />
    </group>
  );
}

/** Emitter pad beneath the hologram, with expanding rings. */
function Emitter({ color }) {
  const ringRefs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = (t * 0.45 + i / 3) % 1;
      ring.scale.setScalar(0.6 + phase * 2.6);
      ring.material.opacity = (1 - phase) * 0.35;
    });
  });

  return (
    <group position={[0, -1.9, 0]}>
      {/* Base disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 48]} />
        <meshStandardMaterial
          color="#0a0f22"
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>

      {/* Pulsing rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
        >
          <ringGeometry args={[0.92, 1, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}

      <pointLight position={[0, 0.4, 0]} color={color} intensity={12} distance={7} decay={2} />
      <Glow color={color} scale={4} opacity={0.2} position={[0, 0.2, 0]} />
    </group>
  );
}

/** Room shell — walls implied by a grid box and coloured rim lights. */
function RoomShell({ color }) {
  return (
    <>
      {/* Floor grid */}
      <gridHelper args={[24, 24, color, '#0a1020']} position={[0, -1.95, 0]} />

      {/* Back wall grid */}
      <gridHelper
        args={[24, 24, color, '#0a1020']}
        position={[0, 4, -7]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Slightly tighter cones and more contrast between the two lights
          than before — the discipline colour reads as the dominant light
          source with the white spot doing quieter fill work, rather than
          the two competing at similar strength. */}
      <ambientLight intensity={0.14} />
      <spotLight position={[-5, 5, 4]} angle={0.62} penumbra={0.9} intensity={27} color={color} />
      <spotLight position={[5, 4, -3]} angle={0.75} penumbra={1} intensity={13} color="#ffffff" />
      <fog attach="fog" args={['#050816', 6, 22]} />
    </>
  );
}

/** Slow drift so the room feels handheld rather than locked off. */
function RoomCamera({ pointer }) {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const { camera } = state;

    const tx = Math.sin(t * 0.14) * 0.7 + (pointer?.current.x ?? 0) * 1.1;
    const ty = 0.4 + (pointer?.current.y ?? 0) * 0.45;

    camera.position.x += (tx - camera.position.x) * dt * 2;
    camera.position.y += (ty - camera.position.y) * dt * 2;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function RoomScene({ room, quality, pointer, active = true }) {
  const preset = QUALITY_PRESETS[quality];

  return (
    <Canvas
      dpr={preset.dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.4, 6.4], fov: 46, near: 0.1, far: 40 }}
      gl={{ antialias: preset.antialias, alpha: true, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor>
        <AdaptiveDpr pixelated={false} />
        <RoomCamera pointer={pointer} />
        <RoomShell color={room.color} />

        {/* Keyed on the room id so switching rebuilds and re-animates in */}
        <Hologram key={room.id} room={room} />
        <Emitter color={room.color} />

        <ParticleField
          key={`p-${room.id}`}
          count={Math.round(preset.particles * 0.35)}
          radius={10}
          color={room.color}
          size={0.05}
          opacity={0.45}
        />
      </PerformanceMonitor>
    </Canvas>
  );
}
