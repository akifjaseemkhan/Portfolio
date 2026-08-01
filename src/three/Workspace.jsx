import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Glow, HoloPanel, LightStrip } from './primitives';
import { createCodeTexture, createPortfolioTexture, noiseTexture } from './textures';

/**
 * ── THE 3D WORKSPACE ──────────────────────────────────────────────────
 * A futuristic desk assembled entirely from primitives — no external
 * models to download, so the hero renders on first paint and nothing
 * can 404. Layout is driven by the constants below; nudge one value to
 * rearrange the desk without hunting through JSX.
 *
 * Everything sits on a desk whose top surface is y = 0.
 */

const DESK = { w: 6.4, d: 2.8, thickness: 0.12, height: 1.0 };
const SURFACE = DESK.thickness / 2; // y of the desk's top face

/** Shared material presets so the whole scene stays visually consistent. */
function useMaterials() {
  return useMemo(() => {
    const normalMap = noiseTexture();
    return {
      // A little glossier and more metallic than before — with the richer
      // rim lighting added to the hero scene, a duller surface was soaking
      // up that light instead of throwing back a visible highlight.
      desk: new THREE.MeshStandardMaterial({
        color: '#12162a',
        roughness: 0.42,
        metalness: 0.5,
        normalMap,
        normalScale: new THREE.Vector2(0.1, 0.1),
      }),
      metal: new THREE.MeshStandardMaterial({ color: '#2a3050', roughness: 0.3, metalness: 0.9 }),
      dark: new THREE.MeshStandardMaterial({ color: '#0b0f1f', roughness: 0.45, metalness: 0.6 }),
      plastic: new THREE.MeshStandardMaterial({ color: '#1a1f38', roughness: 0.7, metalness: 0.15 }),
      ceramic: new THREE.MeshStandardMaterial({ color: '#e8ecf5', roughness: 0.25, metalness: 0.05 }),
    };
  }, []);
}

/* ══════════════════════════════════════════════════════════════════════
   DESK
   ══════════════════════════════════════════════════════════════════════ */
function Desk({ materials }) {
  const legX = DESK.w / 2 - 0.35;
  const legZ = DESK.d / 2 - 0.3;

  return (
    <group>
      {/* Top */}
      <RoundedBox
        args={[DESK.w, DESK.thickness, DESK.d]}
        radius={0.04}
        smoothness={3}
        material={materials.desk}
        castShadow
        receiveShadow
      />

      {/* Legs */}
      {[
        [-legX, -legZ],
        [legX, -legZ],
        [-legX, legZ],
        [legX, legZ],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -DESK.height / 2, z]} material={materials.metal} castShadow>
          <cylinderGeometry args={[0.045, 0.06, DESK.height, 12]} />
        </mesh>
      ))}

      {/* Cross brace */}
      <mesh position={[0, -DESK.height + 0.18, 0]} material={materials.metal}>
        <boxGeometry args={[DESK.w - 0.8, 0.05, 0.08]} />
      </mesh>

      {/* RGB underglow — the strip that makes the desk feel "on" */}
      <LightStrip
        length={DESK.w - 0.6}
        color="#7C3AED"
        intensity={3}
        position={[0, -DESK.thickness - 0.04, DESK.d / 2 - 0.12]}
      />
      <LightStrip
        length={DESK.w - 0.6}
        color="#00E5FF"
        intensity={2.4}
        position={[0, -DESK.thickness - 0.04, -DESK.d / 2 + 0.12]}
      />
      {/* Bounce light cast onto the floor by the strips.
          One light, not two: three.js forward-renders, so every extra light
          multiplies the fragment cost across every lit mesh in the scene.
          The emissive strips and additive glow sprites carry the RGB read;
          this only needs to put some colour on the floor. */}
      <pointLight position={[0, -0.55, 0]} color="#7C3AED" intensity={9} distance={5} decay={2} />
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MONITOR — displays the animated code editor
   ══════════════════════════════════════════════════════════════════════ */
function Monitor({ materials, position = [0, 0, 0] }) {
  const screenRef = useRef(null);
  // Built once; `update` repaints only when a new character is typed.
  const code = useMemo(() => createCodeTexture(), []);
  useEffect(() => () => code.dispose(), [code]);

  useFrame((state) => {
    code.update(state.clock.elapsedTime);
    // Subtle flicker so the panel reads as a live display.
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity =
        0.95 + Math.sin(state.clock.elapsedTime * 9) * 0.04;
    }
  });

  const W = 2.7;
  const H = 1.55;

  return (
    <group position={position}>
      {/* Stand */}
      <mesh position={[0, SURFACE + 0.02, 0]} material={materials.metal} castShadow>
        <cylinderGeometry args={[0.3, 0.36, 0.04, 24]} />
      </mesh>
      <mesh position={[0, SURFACE + 0.32, 0]} material={materials.metal} castShadow>
        <boxGeometry args={[0.12, 0.62, 0.08]} />
      </mesh>

      {/* Panel */}
      <group position={[0, SURFACE + 0.62 + H / 2, 0]} rotation={[-0.06, 0, 0]}>
        <RoundedBox args={[W + 0.1, H + 0.1, 0.07]} radius={0.03} smoothness={3} castShadow>
          <meshStandardMaterial color="#0b0f1f" roughness={0.4} metalness={0.7} />
        </RoundedBox>

        {/* Emissive display surface */}
        <mesh ref={screenRef} position={[0, 0, 0.041]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial
            map={code.texture}
            emissive="#ffffff"
            emissiveMap={code.texture}
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>

        {/* Screen spill onto the desk — one light does the job. */}
        <Glow color="#00E5FF" scale={4.2} opacity={0.16} position={[0, 0, 0.16]} />
        <pointLight position={[0, 0, 0.7]} color="#8fdcff" intensity={7} distance={5} decay={2} />

        {/* Rear RGB halo */}
        <LightStrip length={W - 0.2} color="#14F195" intensity={2.2} position={[0, -H / 2 - 0.02, -0.06]} />
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   LAPTOP — its screen hosts the live portfolio panel (see LaptopScreen)
   ══════════════════════════════════════════════════════════════════════ */
/** The laptop display — runs the live miniature of this portfolio. */
function LaptopScreen({ width, height }) {
  const meshRef = useRef(null);
  const screen = useMemo(() => createPortfolioTexture(), []);
  useEffect(() => () => screen.dispose(), [screen]);

  useFrame((state) => {
    screen.update(state.clock.elapsedTime);
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity =
        1.05 + Math.sin(state.clock.elapsedTime * 7.3) * 0.03;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={screen.texture}
        emissive="#ffffff"
        emissiveMap={screen.texture}
        emissiveIntensity={1.05}
        toneMapped={false}
      />
    </mesh>
  );
}

function Laptop({ materials, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const W = 1.55;
  const D = 1.05;
  const lidRef = useRef(null);

  useFrame((state) => {
    // The lid stands upright at rotation 0 (hinge is at its bottom edge), so
    // a small negative angle leans it back like a real open laptop. It also
    // breathes a couple of degrees — alive, not floppy.
    if (lidRef.current) {
      lidRef.current.rotation.x = -0.28 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Base */}
      <RoundedBox
        args={[W, 0.05, D]}
        radius={0.02}
        smoothness={3}
        position={[0, SURFACE + 0.025, 0]}
        material={materials.metal}
        castShadow
      />
      {/* Keyboard well */}
      <mesh position={[0, SURFACE + 0.052, 0.08]} material={materials.dark}>
        <boxGeometry args={[W - 0.18, 0.005, D - 0.42]} />
      </mesh>
      {/* Trackpad */}
      <mesh position={[0, SURFACE + 0.053, D / 2 - 0.18]}>
        <boxGeometry args={[0.42, 0.004, 0.26]} />
        <meshStandardMaterial color="#242a44" roughness={0.25} metalness={0.5} />
      </mesh>

      {/* Lid — hinged at the back edge */}
      <group ref={lidRef} position={[0, SURFACE + 0.05, -D / 2]}>
        <RoundedBox
          args={[W, D * 0.92, 0.035]}
          radius={0.02}
          smoothness={3}
          position={[0, D * 0.46, 0]}
          material={materials.metal}
          castShadow
        />
        {/* Live portfolio display */}
        <group position={[0, D * 0.46, 0.021]}>
          <LaptopScreen width={W - 0.1} height={D * 0.92 - 0.08} />
        </group>
        {/* The laptop's spill is carried by this additive glow rather than a
            light — the screen is emissive, so it already reads as lit. */}
        <Glow color="#00E5FF" scale={2.6} opacity={0.18} position={[0, D * 0.46, 0.12]} />
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PERIPHERALS
   ══════════════════════════════════════════════════════════════════════ */

/** Mechanical keyboard with individually lit, per-key RGB caps. */
function Keyboard({ materials, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const COLS = 15;
  const ROWS = 5;
  const gap = 0.105;
  const keysRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // One InstancedMesh for all 75 keycaps — a single draw call instead of 75.
  const count = COLS * ROWS;

  // Key positions never change, so the matrices are written exactly once.
  // Rewriting all 75 every frame (and re-uploading instanceMatrix) was pure
  // waste — only the colours actually animate.
  useEffect(() => {
    const mesh = keysRef.current;
    if (!mesh) return;
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        dummy.position.set((c - (COLS - 1) / 2) * gap, 0, (r - (ROWS - 1) / 2) * gap);
        dummy.updateMatrix();
        mesh.setMatrixAt(r * COLS + c, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy, gap]);

  // Colour wave, throttled: the RGB sweep is slow enough that refreshing it
  // ~20 times a second is indistinguishable from every frame.
  const lastWave = useRef(0);
  useFrame((state) => {
    const mesh = keysRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    if (t - lastWave.current < 0.05) return;
    lastWave.current = t;

    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const x = (c - (COLS - 1) / 2) * gap;
        const z = (r - (ROWS - 1) / 2) * gap;
        // Diagonal rainbow wave across the board.
        const hue = ((x + z) * 0.5 + t * 0.14) % 1;
        color.setHSL(hue < 0 ? hue + 1 : hue, 0.85, 0.55);
        mesh.setColorAt(r * COLS + c, color);
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Chassis */}
      <RoundedBox
        args={[COLS * gap + 0.14, 0.055, ROWS * gap + 0.14]}
        radius={0.02}
        smoothness={3}
        position={[0, SURFACE + 0.028, 0]}
        material={materials.dark}
        castShadow
      />
      {/* Keycaps */}
      <instancedMesh
        ref={keysRef}
        args={[undefined, undefined, count]}
        position={[0, SURFACE + 0.068, 0]}
        castShadow
      >
        <boxGeometry args={[0.082, 0.022, 0.082]} />
        {/* Per-key colour comes from instanceColor (set in the frame loop),
            which tints the diffuse — so the material itself stays neutral. */}
        <meshStandardMaterial roughness={0.42} metalness={0.1} />
      </instancedMesh>
      {/* Underglow bleeding out from beneath the board */}
      <Glow color="#7C3AED" scale={2.2} opacity={0.2} position={[0, SURFACE + 0.01, 0]} />
    </group>
  );
}

/** Low-poly gaming mouse with a lit scroll wheel. */
function Mouse({ materials, position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, SURFACE + 0.045, 0]} castShadow material={materials.plastic}>
        {/* Squashed sphere reads as a mouse shell at this scale. */}
        <sphereGeometry args={[0.14, 20, 14]} />
      </mesh>
      <mesh position={[0, SURFACE + 0.045, 0]} scale={[1, 0.55, 1.45]} castShadow material={materials.plastic}>
        <sphereGeometry args={[0.13, 20, 14]} />
      </mesh>
      {/* Scroll wheel */}
      <mesh position={[0, SURFACE + 0.1, -0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.03, 12]} />
        <meshStandardMaterial color="#14F195" emissive="#14F195" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <Glow color="#14F195" scale={0.7} opacity={0.35} position={[0, SURFACE + 0.06, 0]} />
    </group>
  );
}

/** Coffee mug with a liquid surface and a drifting steam wisp. */
function CoffeeMug({ materials, position = [0, 0, 0] }) {
  const steamRef = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (steamRef.current) {
      // Rise, drift, fade, reset.
      const phase = (t * 0.35) % 1;
      steamRef.current.position.y = SURFACE + 0.24 + phase * 0.45;
      steamRef.current.position.x = Math.sin(phase * 4 + t) * 0.05;
      steamRef.current.material.opacity = (1 - phase) * 0.16;
      steamRef.current.scale.setScalar(0.5 + phase * 1.4);
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, SURFACE + 0.11, 0]} castShadow material={materials.ceramic}>
        <cylinderGeometry args={[0.115, 0.095, 0.22, 24, 1, true]} />
      </mesh>
      {/* Base */}
      <mesh position={[0, SURFACE + 0.005, 0]} material={materials.ceramic}>
        <cylinderGeometry args={[0.095, 0.095, 0.01, 24]} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.14, SURFACE + 0.12, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.ceramic}>
        <torusGeometry args={[0.065, 0.018, 8, 20, Math.PI * 1.15]} />
      </mesh>
      {/* Coffee */}
      <mesh position={[0, SURFACE + 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.108, 24]} />
        <meshStandardMaterial color="#2b1608" roughness={0.15} metalness={0.3} />
      </mesh>
      {/* Steam */}
      <mesh ref={steamRef} position={[0, SURFACE + 0.24, 0]}>
        <planeGeometry args={[0.2, 0.3]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Potted plant — stacked cones read as foliage without a model. */
function Plant({ materials, position = [0, 0, 0], scale = 1, leaves = 7 }) {
  const group = useRef(null);

  useFrame((state) => {
    // Slow sway, as if there were air moving in the room.
    if (group.current) group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
  });

  return (
    <group position={position} scale={scale}>
      {/* Pot */}
      <mesh position={[0, SURFACE + 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.1, 0.22, 16]} />
        <meshStandardMaterial color="#1e2540" roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[0, SURFACE + 0.215, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 0.02, 16]} />
        <meshStandardMaterial color="#101528" roughness={0.9} />
      </mesh>

      {/* Foliage */}
      <group ref={group} position={[0, SURFACE + 0.22, 0]}>
        {Array.from({ length: leaves }).map((_, i) => {
          const a = (i / leaves) * Math.PI * 2;
          const tilt = 0.4 + (i % 3) * 0.12;
          const h = 0.34 + (i % 4) * 0.07;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.07, h / 2, Math.sin(a) * 0.07]}
              rotation={[Math.cos(a) * tilt, 0, -Math.sin(a) * tilt]}
              castShadow
            >
              <coneGeometry args={[0.055, h, 5]} />
              <meshStandardMaterial
                color={i % 2 ? '#1f7a52' : '#14F195'}
                roughness={0.6}
                emissive="#14F195"
                emissiveIntensity={0.12}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ASSEMBLY
   ══════════════════════════════════════════════════════════════════════ */
export default function Workspace({ quality = 'high' }) {
  const materials = useMaterials();
  const showExtras = quality !== 'low';

  return (
    <group position={[0, -0.3, 0]}>
      <Desk materials={materials} />

      <Monitor materials={materials} position={[0, 0, -0.85]} />

      <Laptop materials={materials} position={[-1.85, 0, 0.35]} rotation={[0, 0.42, 0]} />

      <Keyboard materials={materials} position={[0.25, 0, 0.72]} rotation={[0, -0.04, 0]} />
      <Mouse materials={materials} position={[1.42, 0, 0.72]} />
      <CoffeeMug materials={materials} position={[2.05, 0, 0.05]} />

      <Plant materials={materials} position={[-2.75, 0, -0.55]} scale={1.15} />
      {showExtras && <Plant materials={materials} position={[2.72, 0, -0.75]} scale={0.85} leaves={5} />}

      {/* Floating holographic panels surrounding the desk */}
      <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.4}>
        <HoloPanel position={[-3.4, 1.7, -0.6]} rotation={[0, 0.6, 0]} scale={0.95} color="#00E5FF" seed={0} />
      </Float>
      <Float speed={1.1} rotationIntensity={0.16} floatIntensity={0.45}>
        <HoloPanel position={[3.5, 1.55, -0.5]} rotation={[0, -0.62, 0]} scale={0.9} color="#7C3AED" seed={1} />
      </Float>
      {showExtras && (
        <>
          <Float speed={1.25} rotationIntensity={0.2} floatIntensity={0.5}>
            <HoloPanel position={[-2.6, 2.65, -1.6]} rotation={[0.08, 0.38, 0]} scale={0.68} color="#14F195" seed={2} />
          </Float>
          <Float speed={1.5} rotationIntensity={0.18} floatIntensity={0.42}>
            <HoloPanel position={[2.75, 2.75, -1.5]} rotation={[0.06, -0.4, 0]} scale={0.62} color="#00E5FF" seed={3} />
          </Float>
          <Float speed={0.95} rotationIntensity={0.14} floatIntensity={0.38}>
            <HoloPanel position={[0, 3.15, -2.2]} rotation={[0.12, 0, 0]} scale={0.7} color="#7C3AED" seed={4} />
          </Float>
        </>
      )}

      {/* Reflective floor catching the RGB spill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -DESK.height - 0.02, 0]} receiveShadow>
        <circleGeometry args={[9, 48]} />
        <meshStandardMaterial color="#070a18" roughness={0.35} metalness={0.75} />
      </mesh>
    </group>
  );
}
