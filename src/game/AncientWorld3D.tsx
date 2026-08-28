import React, { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { ERAS, AncientIntervention } from './ancientData';
import { PlacedIntervention } from './ancientSimState';
import { soundEngine } from './ancientAudio';

interface AncientWorld3DProps {
  eraId: string;
  placed: PlacedIntervention[];
  selectedInterventionId: string | null;
  onPlaceTile: (tileX: number, tileZ: number) => void;
  hoveredTile: { x: number; z: number } | null;
  setHoveredTile: (tile: { x: number; z: number } | null) => void;
  isSimulating: boolean;
  simulationDay: number;
}

// Grid dimensions: 6 x 6 placement grid
const GRID_SIZE = 6;
const TILE_SPACING = 3.8;

// Animated Water Shader Material / Component
function WaterSurface({ size = [2.6, 2.6], position = [0, 0.05, 0] }: { size?: [number, number]; position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.roughness = 0.1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color="#38bdf8"
        roughness={0.15}
        metalness={0.7}
        transparent
        opacity={0.88}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

// Clean GPU Point Particles for Atmosphere
function AmbientParticles({ eraId }: { eraId: string }) {
  const count = 90;
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = 1.0 + Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 24;

      spd[i * 3] = 0.4 + Math.random() * 0.8;
      spd[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return [pos, spd];
  }, [count]);

  useFrame((_, dt) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += speeds[i * 3] * dt * 2.0;
      arr[i * 3 + 1] += speeds[i * 3 + 1] * dt;
      arr[i * 3 + 2] += speeds[i * 3 + 2] * dt;

      if (arr[i * 3] > 13) arr[i * 3] = -13;
      if (arr[i * 3 + 1] > 9) arr[i * 3 + 1] = 1.0;
      if (arr[i * 3 + 1] < 0.5) arr[i * 3 + 1] = 8.0;
    }
    posAttr.needsUpdate = true;
  });

  const particleColor =
    eraId === 'water' ? '#7dd3fc' :
    eraId === 'architecture' ? '#fde68a' :
    eraId === 'agriculture' ? '#86efac' : '#67e8f9';

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={particleColor}
        size={0.22}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Compound 3D Models for Interventions
function StepwellMesh({ stoneTex }: { stoneTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Outer base platform resting flush on ground */}
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.48, 3.2]} />
        <meshStandardMaterial map={stoneTex} color="#d4a373" roughness={0.8} />
      </mesh>
      {/* Stepped tiers sitting on top of base */}
      <mesh position={[0, 0.51, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.02, 2.5]} />
        <meshStandardMaterial map={stoneTex} color="#bc6c25" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.53, 0]} receiveShadow>
        <boxGeometry args={[1.9, 0.02, 1.9]} />
        <meshStandardMaterial map={stoneTex} color="#9a581e" roughness={0.7} />
      </mesh>
      {/* Central Water pool */}
      <WaterSurface size={[1.3, 1.3]} position={[0, 0.545, 0]} />
      {/* Corner stone pavilions (Chhatris) flush on the base top at y=0.50 */}
      {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([cx, cz], idx) => (
        <group key={idx}>
          <mesh position={[cx, 0.72, cz]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.44, 6]} />
            <meshStandardMaterial color="#bc6c25" />
          </mesh>
          <mesh position={[cx, 1.06, cz]} castShadow>
            <coneGeometry args={[0.26, 0.24, 6]} />
            <meshStandardMaterial color="#dda15e" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function QanatMesh({ stoneTex }: { stoneTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Underground aqueduct stone line */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.16, 1.2]} />
        <meshStandardMaterial map={stoneTex} color="#b08968" roughness={0.8} />
      </mesh>
      {/* Vertical ventilation wellheads */}
      {[-1.0, 0, 1.0].map((xOffset, i) => (
        <group key={i} position={[xOffset, 0, 0]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.42, 0.6, 12]} />
            <meshStandardMaterial map={stoneTex} color="#d4a373" roughness={0.7} />
          </mesh>
          {/* Inner dark well shaft */}
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.08, 12]} />
            <meshBasicMaterial color="#1e1e1e" />
          </mesh>
          {/* Subtle water glint */}
          <mesh position={[0, 0.58, 0]}>
            <circleGeometry args={[0.24, 12]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Flowing water channel outlet */}
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 0.4]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.6} />
      </mesh>
    </group>
  );
}

function JohadMesh() {
  return (
    <group position={[0, 0, 0]}>
      {/* Curved earthen check dam bund */}
      <mesh position={[0, 0.4, 0.7]} rotation={[0, 0, Math.PI / 16]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.7, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#9c6644" roughness={0.9} />
      </mesh>
      {/* Captured pond basin */}
      <WaterSurface size={[2.2, 1.8]} position={[0, 0.15, -0.2]} />
      {/* Perimeter trees / greenery */}
      {[[-0.9, -0.6], [0.9, -0.6], [-1.1, 0.3], [1.1, 0.3]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.8, 6]} />
            <meshStandardMaterial color="#582f0e" />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.42, 8, 8]} />
            <meshStandardMaterial color="#588157" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CisternMesh({ stoneTex }: { stoneTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Vaulted subterranean roof structure */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.5, 3.0]} />
        <meshStandardMaterial map={stoneTex} color="#7f5539" roughness={0.7} />
      </mesh>
      {/* Stone vaulted columns */}
      {[[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9], [0, 0]].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0.5, cz]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.22, 1.0, 8]} />
            <meshStandardMaterial map={stoneTex} color="#b08968" />
          </mesh>
          {/* Column Capital */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[0.45, 0.15, 0.45]} />
            <meshStandardMaterial map={stoneTex} color="#d4a373" />
          </mesh>
        </group>
      ))}
      {/* Central water intake opening */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 12]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.7} />
      </mesh>
    </group>
  );
}

function InundationCanalMesh() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.16, 3.2]} />
        <meshStandardMaterial color="#a68a68" roughness={0.9} />
      </mesh>
      {/* Branching water canals */}
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 0.6]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[3.0, 0.5]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* Stone sluice gates */}
      {[-0.8, 0.8].map((gx, i) => (
        <mesh key={i} position={[gx, 0.35, 0]} castShadow>
          <boxGeometry args={[0.2, 0.5, 0.8]} />
          <meshStandardMaterial color="#6c584c" />
        </mesh>
      ))}
    </group>
  );
}

function WindcatcherMesh({ adobeTex }: { adobeTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Base House Structure */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 1.4, 2.8]} />
        <meshStandardMaterial map={adobeTex} color="#e0a96d" roughness={0.8} />
      </mesh>
      {/* Tall Badgir Cooling Tower */}
      <group position={[0.6, 1.4, 0.6]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 2.2, 1.0]} />
          <meshStandardMaterial map={adobeTex} color="#c68b59" roughness={0.7} />
        </mesh>
        {/* Top Intake Louvers / Vents */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[1.15, 0.5, 1.15]} />
          <meshStandardMaterial color="#6f4e37" roughness={0.9} />
        </mesh>
        {/* Slotted airflow louvers */}
        {[-0.15, 0.15].map((ly, i) => (
          <mesh key={i} position={[0, 2.2 + ly, 0.58]}>
            <boxGeometry args={[0.9, 0.08, 0.05]} />
            <meshBasicMaterial color="#2d1e18" />
          </mesh>
        ))}
        {/* Aerodynamic decorative spire */}
        <mesh position={[0, 2.6, 0]} castShadow>
          <coneGeometry args={[0.25, 0.4, 4]} />
          <meshStandardMaterial color="#d4a373" />
        </mesh>
      </group>
      {/* Wooden tie beams (structural vernacular detail) */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[3.0, 0.08, 0.08]} />
        <meshStandardMaterial color="#4a3525" />
      </mesh>
    </group>
  );
}

function MashrabiyaMesh({ adobeTex }: { adobeTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* 2-Story Traditional Building */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 2.0, 2.8]} />
        <meshStandardMaterial map={adobeTex} color="#ddb892" roughness={0.8} />
      </mesh>
      {/* Projecting Mashrabiya wooden lattice oriel */}
      <group position={[0, 1.3, 1.45]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.0, 0.6]} />
          <meshStandardMaterial color="#7f4f24" roughness={0.6} />
        </mesh>
        {/* Intricate geometric lattice grid front */}
        <mesh position={[0, 0, 0.32]}>
          <planeGeometry args={[1.3, 0.8]} />
          <meshStandardMaterial color="#936639" roughness={0.4} metalness={0.2} />
        </mesh>
      </group>
      {/* Carved timber door entrance */}
      <mesh position={[0, 0.45, 1.42]}>
        <boxGeometry args={[0.7, 0.9, 0.05]} />
        <meshStandardMaterial color="#582f0e" />
      </mesh>
    </group>
  );
}

function CourtyardMesh({ adobeTex }: { adobeTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Four surrounding shaded wings */}
      <mesh position={[0, 0.6, 1.0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 1.2, 0.8]} />
        <meshStandardMaterial map={adobeTex} color="#d4a373" />
      </mesh>
      <mesh position={[0, 0.6, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 1.2, 0.8]} />
        <meshStandardMaterial map={adobeTex} color="#d4a373" />
      </mesh>
      <mesh position={[-1.0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 1.2, 1.2]} />
        <meshStandardMaterial map={adobeTex} color="#c68b59" />
      </mesh>
      <mesh position={[1.0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 1.2, 1.2]} />
        <meshStandardMaterial map={adobeTex} color="#c68b59" />
      </mesh>
      {/* Central open courtyard fountain */}
      <group position={[0, 0.1, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.55, 0.3, 12]} />
          <meshStandardMaterial color="#ede0d4" />
        </mesh>
        <WaterSurface size={[0.8, 0.8]} position={[0, 0.28, 0]} />
        {/* Tiny potted orange / olive trees */}
        {[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map(([px, pz], i) => (
          <group key={i} position={[px, 0.1, pz]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.12, 0.09, 0.2, 6]} />
              <meshStandardMaterial color="#9c6644" />
            </mesh>
            <mesh position={[0, 0.35, 0]} castShadow>
              <sphereGeometry args={[0.18, 6, 6]} />
              <meshStandardMaterial color="#588157" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function AdobeTowerMesh({ adobeTex }: { adobeTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* High-rise Shibam mudbrick tower */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 3.2, 2.2]} />
        <meshStandardMaterial map={adobeTex} color="#b08968" roughness={0.85} />
      </mesh>
      {/* Whitewashed lime parapet crown (traditional Shibam detail) */}
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[2.3, 0.3, 2.3]} />
        <meshStandardMaterial color="#fefae0" roughness={0.5} />
      </mesh>
      {/* Windows with wooden lintels */}
      {[-0.6, 0.6].map((wx, i) => (
        <group key={i}>
          <mesh position={[wx, 1.2, 1.12]}>
            <boxGeometry args={[0.3, 0.4, 0.05]} />
            <meshBasicMaterial color="#332211" />
          </mesh>
          <mesh position={[wx, 2.2, 1.12]}>
            <boxGeometry args={[0.3, 0.4, 0.05]} />
            <meshBasicMaterial color="#332211" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EarthShelteredMesh() {
  return (
    <group position={[0, 0, 0]}>
      {/* Sunken circular central atrium */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.6, 16]} />
        <meshStandardMaterial color="#8c5b36" roughness={0.9} />
      </mesh>
      {/* Sunken central floor */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.1, 16]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>
      {/* Subterranean chamber arched entryways */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]} position={[0, 0.2, 0]}>
          <mesh position={[0, 0.25, 1.25]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.4]} />
            <meshStandardMaterial color="#6f4e37" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MilpaMesh({ soilTex }: { soilTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Dark fertile soil base */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial map={soilTex} color="#2b1810" roughness={0.9} />
      </mesh>
      {/* 9 Polyculture mounds (Corn stalks + bean vines + squash leaves) */}
      {[-0.9, 0, 0.9].map((mx) =>
        [-0.9, 0, 0.9].map((mz, j) => (
          <group key={`${mx}_${mz}_${j}`} position={[mx, 0.2, mz]}>
            {/* Tall Corn stalk */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.06, 1.4, 5]} />
              <meshStandardMaterial color="#e9d8a6" />
            </mesh>
            {/* Corn leaves & tassels */}
            <mesh position={[0, 1.3, 0]} castShadow>
              <coneGeometry args={[0.18, 0.4, 5]} />
              <meshStandardMaterial color="#588157" />
            </mesh>
            {/* Winding Bean tendrils */}
            <mesh position={[0.08, 0.6, 0]} castShadow>
              <torusGeometry args={[0.1, 0.03, 4, 8]} />
              <meshStandardMaterial color="#2d6a4f" />
            </mesh>
            {/* Sprawling broad Squash leaves */}
            <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.32, 6]} />
              <meshStandardMaterial color="#1b4332" roughness={0.6} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

function ChinampaMesh({ soilTex }: { soilTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Water canal border */}
      <WaterSurface size={[3.4, 3.4]} position={[0, 0.06, 0]} />
      {/* Floating rectangular agricultural island */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.35, 2.5]} />
        <meshStandardMaterial map={soilTex} color="#2d1810" roughness={0.8} />
      </mesh>
      {/* Willow tree stakes bordering the island */}
      {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2], [0, -1.2], [0, 1.2]].map(([wx, wz], i) => (
        <group key={i} position={[wx, 0.2, wz]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, 1.2, 5]} />
            <meshStandardMaterial color="#582f0e" />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <coneGeometry args={[0.22, 0.6, 6]} />
            <meshStandardMaterial color="#52b788" />
          </mesh>
        </group>
      ))}
      {/* Rich vegetable crop rows */}
      {[-0.6, 0, 0.6].map((rx, i) => (
        <mesh key={i} position={[rx, 0.42, 0]} castShadow>
          <boxGeometry args={[0.35, 0.15, 2.1]} />
          <meshStandardMaterial color="#40916c" />
        </mesh>
      ))}
    </group>
  );
}

function TerraceMesh({ soilTex }: { soilTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* 3 Stepped Stone Terraces */}
      <mesh position={[0, 0.25, 0.8]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.5, 1.0]} />
        <meshStandardMaterial color="#6c584c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.6, 1.0]} />
        <meshStandardMaterial color="#582f0e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.0, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.7, 1.0]} />
        <meshStandardMaterial color="#4a3525" roughness={0.9} />
      </mesh>
      {/* Fertile soil & crop top layers */}
      <mesh position={[0, 0.52, 0.8]}>
        <boxGeometry args={[3.0, 0.05, 0.8]} />
        <meshStandardMaterial map={soilTex} color="#52b788" />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[3.0, 0.05, 0.8]} />
        <meshStandardMaterial map={soilTex} color="#40916c" />
      </mesh>
      <mesh position={[0, 1.37, -0.8]}>
        <boxGeometry args={[3.0, 0.05, 0.8]} />
        <meshStandardMaterial map={soilTex} color="#2d6a4f" />
      </mesh>
    </group>
  );
}

function TerraPretaMesh({ soilTex }: { soilTex: THREE.Texture }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Deep black biochar soil plot */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.3, 3.2]} />
        <meshStandardMaterial map={soilTex} color="#1a120b" roughness={0.95} />
      </mesh>
      {/* Biochar smoldering kiln pit */}
      <group position={[0.8, 0.3, 0.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 0.45, 0.4, 8]} />
          <meshStandardMaterial color="#3c2a21" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <circleGeometry args={[0.25, 8]} />
          <meshBasicMaterial color="#d4a373" />
        </mesh>
      </group>
      {/* Lush vigorous dark green clover & sprouts */}
      {[-0.8, -0.2, 0.4].map((px) =>
        [-0.8, -0.2, 0.4].map((pz, j) => (
          <mesh key={`${px}_${pz}_${j}`} position={[px, 0.32, pz]} castShadow>
            <sphereGeometry args={[0.22, 6, 6]} />
            <meshStandardMaterial color="#74c69d" />
          </mesh>
        ))
      )}
    </group>
  );
}

function ZaiPitsMesh() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.16, 3.2]} />
        <meshStandardMaterial color="#b08968" roughness={0.9} />
      </mesh>
      {/* Grid of moisture catching pits with emerging millet */}
      {[-0.8, 0, 0.8].map((zx) =>
        [-0.8, 0, 0.8].map((zz, j) => (
          <group key={`${zx}_${zz}_${j}`} position={[zx, 0.12, zz]}>
            {/* Sunken basin */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.3, 0.25, 0.12, 10]} />
              <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
            </mesh>
            {/* Water / compost layer */}
            <mesh position={[0, 0.09, 0]}>
              <circleGeometry args={[0.22, 10]} />
              <meshStandardMaterial color="#0284c7" roughness={0.3} />
            </mesh>
            {/* Golden millet crop sprout */}
            <mesh position={[0, 0.4, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.05, 0.6, 5]} />
              <meshStandardMaterial color="#d4a373" />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

// 2050 Solarpunk Hybrid Models
function SolarpunkSpireMesh() {
  return (
    <group position={[0, 0, 0]}>
      {/* High-tech curved aerodynamic wind spire */}
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 1.2, 4.0, 16]} />
        <meshStandardMaterial color="#0891b2" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Integrated solar glass & intake fins */}
      <mesh position={[0, 4.2, 0]} castShadow>
        <coneGeometry args={[0.7, 0.9, 16]} />
        <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.6} />
      </mesh>
      {/* Hanging vertical garden bands */}
      {[-0.8, 0.4, 1.6].map((by, i) => (
        <mesh key={i} position={[0, 2.0 + by, 0]} rotation={[0, (i * Math.PI) / 3, 0]}>
          <torusGeometry args={[0.95, 0.12, 6, 16]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
      ))}
    </group>
  );
}

function RooftopMilpaMesh() {
  return (
    <group position={[0, 0, 0]}>
      {/* Solarpunk building base */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 1.8, 2.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Rooftop chinampa garden deck */}
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[2.6, 0.15, 2.6]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
      <WaterSurface size={[2.2, 2.2]} position={[0, 1.94, 0]} />
      {/* Rooftop crops and solar pergolas */}
      {[-0.6, 0.6].map((px, i) => (
        <group key={i} position={[px, 2.1, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 5]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.25, 6, 6]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Master Intervention Renderer Map
function InterventionMeshDispatcher({
  meshType,
  stoneTex,
  adobeTex,
  soilTex,
}: {
  meshType: AncientIntervention['meshType'];
  stoneTex: THREE.Texture;
  adobeTex: THREE.Texture;
  soilTex: THREE.Texture;
}) {
  switch (meshType) {
    case 'stepwell':
      return <StepwellMesh stoneTex={stoneTex} />;
    case 'qanat':
      return <QanatMesh stoneTex={stoneTex} />;
    case 'johad':
      return <JohadMesh />;
    case 'cistern':
      return <CisternMesh stoneTex={stoneTex} />;
    case 'inundation':
      return <InundationCanalMesh />;
    case 'windcatcher':
      return <WindcatcherMesh adobeTex={adobeTex} />;
    case 'mashrabiya':
      return <MashrabiyaMesh adobeTex={adobeTex} />;
    case 'courtyard':
      return <CourtyardMesh adobeTex={adobeTex} />;
    case 'thick_adobe':
      return <AdobeTowerMesh adobeTex={adobeTex} />;
    case 'earth_sheltered':
      return <EarthShelteredMesh />;
    case 'milpa':
      return <MilpaMesh soilTex={soilTex} />;
    case 'chinampa':
      return <ChinampaMesh soilTex={soilTex} />;
    case 'terrace':
      return <TerraceMesh soilTex={soilTex} />;
    case 'terra_preta':
      return <TerraPretaMesh soilTex={soilTex} />;
    case 'zai_pits':
      return <ZaiPitsMesh />;
    case 'cooling_spire':
      return <SolarpunkSpireMesh />;
    case 'rooftop_milpa':
      return <RooftopMilpaMesh />;
    default:
      return <CourtyardMesh adobeTex={adobeTex} />;
  }
}

export default function AncientWorld3D({
  eraId,
  placed,
  selectedInterventionId,
  onPlaceTile,
  hoveredTile,
  setHoveredTile,
  isSimulating,
  simulationDay,
}: AncientWorld3DProps) {
  const { camera, raycaster, pointer } = useThree();
  const eraConfig = ERAS[eraId] || ERAS.water;

  // Load textures
  const [stoneTex, adobeTex, soilTex] = useTexture([
    '/textures/sandstone_stepwell.png',
    '/textures/adobe_terracotta.png',
    '/textures/rich_soil_plants.png',
  ]);

  // Set repeat for crisp high-frequency detail
  useMemo(() => {
    [stoneTex, adobeTex, soilTex].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
    });
  }, [stoneTex, adobeTex, soilTex]);

  // Handle tile clicking and hover
  const groundPlaneRef = useRef<THREE.Mesh>(null);

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    const hitPoint = e.point;
    if (!hitPoint) return;

    // Convert world pos to grid coordinates
    const gx = Math.round(hitPoint.x / TILE_SPACING);
    const gz = Math.round(hitPoint.z / TILE_SPACING);

    const half = Math.floor(GRID_SIZE / 2);
    if (gx >= -half && gx <= half && gz >= -half && gz <= half) {
      if (!hoveredTile || hoveredTile.x !== gx || hoveredTile.z !== gz) {
        setHoveredTile({ x: gx, z: gz });
      }
    } else {
      if (hoveredTile !== null) setHoveredTile(null);
    }
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.button === 0 && hoveredTile) {
      onPlaceTile(hoveredTile.x, hoveredTile.z);
      soundEngine.playPlacement();
      if (eraId === 'water') soundEngine.playWaterTrickle();
    }
  };

  // Find intervention details for placed items
  const placedItemsWithMeta = useMemo(() => {
    return placed.map((p) => {
      const def = eraConfig.interventions.find((i) => i.id === p.interventionId) || eraConfig.interventions[0];
      return {
        ...p,
        def,
      };
    });
  }, [placed, eraConfig]);

  return (
    <group onPointerMove={handlePointerMove} onPointerDown={handlePointerDown}>
      {/* Ambient & Key Lighting */}
      <ambientLight color={eraConfig.ambientLightColor} intensity={0.75} />
      <directionalLight
        position={[18, 28, 16]}
        color={eraConfig.keyLightColor}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-16, 12, -14]} color="#93c5fd" intensity={0.4} />

      {/* Main Diorama Ground Platform */}
      <mesh
        ref={groundPlaneRef}
        position={[0, -0.2, 0]}
        receiveShadow
      >
        <boxGeometry args={[26, 0.4, 26]} />
        <meshStandardMaterial
          color={eraConfig.groundColor}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Grid Floor Plazas & Stepping Stones */}
      {Array.from({ length: GRID_SIZE }).map((_, xi) => {
        const gx = xi - Math.floor(GRID_SIZE / 2);
        return Array.from({ length: GRID_SIZE }).map((_, zi) => {
          const gz = zi - Math.floor(GRID_SIZE / 2);
          const isHovered = hoveredTile?.x === gx && hoveredTile?.z === gz;
          const isOccupied = placed.some((p) => p.tileX === gx && p.tileZ === gz);

          return (
            <group key={`${gx}_${gz}`} position={[gx * TILE_SPACING, 0.02, gz * TILE_SPACING]}>
              {/* Base tile paving */}
              <mesh receiveShadow>
                <boxGeometry args={[TILE_SPACING * 0.92, 0.04, TILE_SPACING * 0.92]} />
                <meshStandardMaterial
                  color={
                    isHovered
                      ? '#38bdf8'
                      : isOccupied
                      ? eraConfig.secondaryColor
                      : '#6c584c'
                  }
                  roughness={0.8}
                  opacity={isOccupied ? 0.9 : 0.45}
                  transparent
                />
              </mesh>

              {/* Hover placement guide ring */}
              {isHovered && (
                <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.4, 1.6, 24]} />
                  <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                </mesh>
              )}
            </group>
          );
        });
      })}

      {/* Render All Placed Interventions */}
      {placedItemsWithMeta.map((item) => (
        <group
          key={item.instanceId}
          position={[item.tileX * TILE_SPACING, 0, item.tileZ * TILE_SPACING]}
        >
          <InterventionMeshDispatcher
            meshType={item.def.meshType}
            stoneTex={stoneTex}
            adobeTex={adobeTex}
            soilTex={soilTex}
          />
        </group>
      ))}

      {/* Surrounding Scenery (Dunes / Mountains / Riverbed) - Placed safely outside grid */}
      <group position={[0, -0.2, 0]}>
        {/* Mountain ridgeline in distance */}
        {[-26, 0, 26].map((mx, i) => (
          <mesh key={`m_north_${i}`} position={[mx, 3.8, -26]} castShadow>
            <coneGeometry args={[9, 8, 5]} />
            <meshStandardMaterial color="#8c5b36" roughness={0.9} />
          </mesh>
        ))}
        {[-24, 24].map((mx, i) => (
          <mesh key={`m_south_${i}`} position={[mx, 2.8, 26]} castShadow>
            <coneGeometry args={[8, 6, 5]} />
            <meshStandardMaterial color="#a68a68" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Animated Atmosphere Particles */}
      <AmbientParticles eraId={eraId} />
    </group>
  );
}
