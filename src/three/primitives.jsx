import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { dotTexture, glowTexture, hologramTexture, labelTexture } from './textures';

/**
 * Fires `onReady` once a scene has actually rendered a few real frames,
 * not just once its WebGL context exists.
 *
 * Every scene on this site generates a batch of canvas textures on mount
 * (skill labels, project titles, glyph icons) and compiles a batch of
 * shaders — real synchronous work that keeps happening for a moment after
 * the scene first appears. Revealing the scene immediately means a visitor
 * sees it build itself: spheres or cubes popping in one at a time as
 * textures finish generating. Every scene that swaps a loading spinner for
 * its canvas should gate that swap on this, not on "did the component
 * mount" — mounting happens before any of the expensive part runs.
 */
export function WarmupSignal({ onReady, frames = 8 }) {
  const count = useRef(0);
  const fired = useRef(false);

  useFrame(() => {
    if (fired.current) return;
    count.current += 1;
    if (count.current >= frames) {
      fired.current = true;
      onReady?.();
    }
  });

  return null;
}

/**
 * Shared 3D building blocks used across the hero, galaxy, projects and
 * experience scenes. Keeping them here means one implementation (and one
 * material) per effect instead of a copy in every scene.
 */

/**
 * Additive sprite that fakes a bloom halo.
 * Far cheaper than a real post-processing pass and it composites correctly
 * against the transparent canvas.
 */
export function Glow({ color = '#00E5FF', scale = 1, opacity = 0.8, ...props }) {
  const map = useMemo(() => glowTexture(color), [color]);
  return (
    <sprite scale={[scale, scale, scale]} {...props}>
      <spriteMaterial
        map={map}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}

/**
 * Billboarded text label drawn from a canvas texture.
 *
 * A sprite always faces the camera for free, so this needs no Billboard
 * wrapper and no per-frame orientation work.
 *
 * @param {number} height - world height of the text; width follows the aspect.
 */
export function Label({ text, color = '#ffffff', height = 0.22, opacity = 1, ...props }) {
  const map = useMemo(() => labelTexture(text, { color }), [text, color]);
  const aspect = map.aspect ?? 4;

  return (
    <sprite scale={[height * aspect, height, 1]} {...props}>
      <spriteMaterial
        map={map}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}

/**
 * An icon glyph that sits on the face of a sphere.
 *
 * Each frame it slides to the point on the sphere nearest the camera, so it
 * always reads as painted on the front surface. Parking it at the centre
 * instead would bury it inside the mesh, and disabling depth testing would
 * make it punch through spheres in front of it.
 */
export function SphereIcon({ glyph, radius = 0.4, color = '#ffffff', opacity = 1 }) {
  const ref = useRef(null);
  const map = useMemo(() => labelTexture(glyph, { color, size: 150, weight: 700 }), [glyph, color]);
  const aspect = map.aspect ?? 1;
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const sprite = ref.current;
    if (!sprite) return;
    // Direction from this sprite's parent origin toward the camera, in local space.
    sprite.parent.worldToLocal(dir.copy(camera.position));
    dir.normalize().multiplyScalar(radius * 1.02);
    sprite.position.copy(dir);
  });

  // Sized to sit comfortably within the sphere's silhouette.
  const h = radius * 0.95;

  return (
    <sprite ref={ref} scale={[h * aspect, h, 1]}>
      <spriteMaterial
        map={map}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}

/**
 * Drifting particle field.
 *
 * Positions live in one Float32Array updated in place each frame — no
 * per-particle objects, no garbage, so this scales to thousands of points
 * without touching the GC.
 */
export function ParticleField({
  count = 1200,
  radius = 14,
  color = '#00E5FF',
  size = 0.06,
  speed = 0.06,
  opacity = 0.7,
}) {
  const pointsRef = useRef(null);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      // Rejection-free spherical distribution, biased outward for depth.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.35 + 0.65 * Math.cbrt(Math.random()));
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      spd[i] = 0.4 + Math.random();
    }
    return { positions: pos, speeds: spd };
  }, [count, radius]);

  useFrame((state, delta) => {
    const geo = pointsRef.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array;
    const dt = Math.min(delta, 0.05); // clamp so a stutter can't teleport particles

    for (let i = 0; i < count; i += 1) {
      const y = i * 3 + 1;
      arr[y] += speeds[i] * speed * dt * 10;
      // Recycle from the top back to the bottom of the volume.
      if (arr[y] > radius * 0.6) arr[y] = -radius * 0.6;
    }
    geo.attributes.position.needsUpdate = true;

    // Whole field rotates slowly for parallax against the camera drift.
    if (pointsRef.current) pointsRef.current.rotation.y = state.clock.elapsedTime * 0.012;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={dotTexture()}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/**
 * A floating holographic UI panel: generated texture, scanline sweep and
 * a slow bob. Used around the desk and in the experience room.
 */
export function HoloPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = '#00E5FF',
  seed = 0,
  bob = 0.12,
}) {
  const group = useRef(null);
  const scan = useRef(null);
  const map = useMemo(() => hologramTexture(color, seed), [color, seed]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 0.7 + seed) * bob;
      group.current.rotation.z = rotation[2] + Math.sin(t * 0.4 + seed) * 0.02;
    }
    // Scanline runs top→bottom on a loop.
    if (scan.current) {
      scan.current.position.y = (((t * 0.42 + seed * 0.3) % 1) - 0.5) * 0.62;
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      {/* Panel face */}
      <mesh>
        <planeGeometry args={[1.6, 1]} />
        <meshBasicMaterial
          map={map}
          transparent
          opacity={0.62}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Scanline */}
      <mesh ref={scan} position={[0, 0, 0.01]}>
        <planeGeometry args={[1.58, 0.05]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Backing haze so the panel reads as a volume, not a decal */}
      <Glow color={color} scale={2.2} opacity={0.12} position={[0, 0, -0.05]} />
    </group>
  );
}

/**
 * Thin emissive tube used for RGB accent lighting under the desk and
 * behind the monitor.
 */
export function LightStrip({ length = 1, color = '#00E5FF', intensity = 2.4, ...props }) {
  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[length, 0.025, 0.025]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity}
          toneMapped={false}
        />
      </mesh>
      <Glow color={color} scale={length * 0.55} opacity={0.35} />
    </group>
  );
}

/**
 * Reusable "hover me" ripple: expanding rings that fade out.
 * `active` drives whether the rings animate or sit dormant.
 */
export function Ripple({ active, color = '#00E5FF', radius = 1, rings = 3 }) {
  const refs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const phase = (t * 0.8 + i / rings) % 1;
      const s = radius * (1 + phase * 1.6);
      mesh.scale.setScalar(active ? s : 0.0001);
      mesh.material.opacity = active ? (1 - phase) * 0.45 : 0;
    });
  });

  return (
    <group>
      {Array.from({ length: rings }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.94, 1, 48]} />
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
    </group>
  );
}

const SHARD_COLORS = ['#00E5FF', '#7C3AED', '#14F195'];
const SHARD_GEOMETRIES = [
  () => new THREE.OctahedronGeometry(1, 0),
  () => new THREE.TetrahedronGeometry(1, 0),
  () => new THREE.IcosahedronGeometry(1, 0),
];

/**
 * ⚠️ NOT CURRENTLY USED — removed from HeroScene in the same pass that cut
 * PostFX, as part of clearing out every purely-decorative cost after
 * repeated confirmed lag reports. Left here as an option; costs nothing
 * unused. To bring it back: `import { FloatingShards } from './primitives'`
 * and render it inside a scene's contents.
 *
 * Slow-tumbling faceted glass fragments drifting through the foreground.
 *
 * This is the detail that separates "here's a particle system" from "this
 * was art directed" — a handful of large, deliberate shapes catching light
 * as they rotate, rather than more small uniform points. Deliberately NOT
 * `meshPhysicalMaterial` with `transmission`: that forces an extra render
 * pass per material, which is exactly what made the project cubes too
 * expensive earlier in this build. `clearcoat` gives a glassy sheen from
 * the same material family without triggering that extra pass, and the
 * backside-shell trick already used on the project cubes fakes the rest.
 */
export function FloatingShards({ count = 6, radius = 7 }) {
  const groupRef = useRef(null);

  const shards = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const theta = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const r = radius * (0.55 + Math.random() * 0.45);
        return {
          id: i,
          color: SHARD_COLORS[i % SHARD_COLORS.length],
          geometry: SHARD_GEOMETRIES[i % SHARD_GEOMETRIES.length](),
          position: [
            Math.cos(theta) * r,
            (Math.random() - 0.3) * 3.5,
            Math.sin(theta) * r * 0.6 - 1,
          ],
          scale: 0.14 + Math.random() * 0.16,
          spin: new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
          ),
          phase: Math.random() * Math.PI * 2,
          bobSpeed: 0.25 + Math.random() * 0.2,
        };
      }),
    [count, radius],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const group = groupRef.current;
    if (!group) return;
    // Each child here is the wrapper <group> for one shard (mesh + edge
    // lines + glow together), not the mesh itself — rotating/moving it
    // moves all three in lockstep.
    group.children.forEach((shardGroup, i) => {
      const s = shards[i];
      if (!s) return;
      shardGroup.rotation.x += s.spin.x * 0.01;
      shardGroup.rotation.y += s.spin.y * 0.01;
      shardGroup.rotation.z += s.spin.z * 0.01;
      shardGroup.position.y = s.position[1] + Math.sin(t * s.bobSpeed + s.phase) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {shards.map((s) => (
        <group key={s.id} position={s.position} scale={s.scale}>
          <mesh geometry={s.geometry}>
            <meshPhysicalMaterial
              color={s.color}
              transparent
              opacity={0.22}
              roughness={0.05}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.1}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          {/* Wireframe facet lines — the "cut glass" read */}
          <lineSegments>
            <edgesGeometry args={[s.geometry]} />
            <lineBasicMaterial
              color={s.color}
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </lineSegments>
          <Glow color={s.color} scale={4} opacity={0.14} />
        </group>
      ))}
    </group>
  );
}
