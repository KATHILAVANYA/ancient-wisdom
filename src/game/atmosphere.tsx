/*
 * The atmosphere rig — hemisphere + warm shadow-casting key + cool fill.
 *
 * It lives here, and not inline in App.tsx, because adopting a genre look means
 * replacing App.tsx wholesale, and the rig is the one thing you must NOT lose
 * when you do. TINT IT, DON'T DELETE IT: every colour is an argument, so a
 * horror scene is
 *
 *   makeDaylightRig({ skyColor: '#25313d', groundColor: '#12161b',
 *                     keyColor: '#9fb6c9', fillColor: '#3d5a72', intensity: 0.45 })
 *
 * and a sunset track is the same call with warm colours. A scene with no rig at
 * all is the dark void this arena keeps shipping.
 *
 * Three-light shape, and why each one is there:
 *   hemisphere  sky-to-ground gradient, so upward faces read cool and downward
 *               faces pick up bounce instead of going flat black
 *   key         the sun. The ONLY shadow caster — a second one doubles the
 *               shadow-map cost and cross-hatches the contacts
 *   fill        opposite side, no shadow, so the key's shadowed faces still
 *               show their silhouette and material
 */

import type { ReactElement } from 'react';

/** Neutral daylight placeholder. Not a design — pick the brief's palette. */
export const DEFAULT_SKY = '#aebfd0';

/** `[color, near, far]` for `<SceneShell fog>`. Match the colour to the sky or
 *  the horizon shows as a hard seam. */
export const DEFAULT_FOG: [string, number, number] = [DEFAULT_SKY, 55, 140];

export interface DaylightRigOptions {
  /** Sun colour. Warm reads as daylight; cold reads as moon/overcast. */
  keyColor?: string;
  /** Opposite-side bounce. Keep it the sky's complement, never black. */
  fillColor?: string;
  /** Hemisphere top — the light coming from the sky. */
  skyColor?: string;
  /** Hemisphere bottom — light bouncing back off the floor. */
  groundColor?: string;
  /** Scales the whole rig at once. Dim a horror scene with 0.4, not with 0. */
  intensity?: number;
  /** Half-width of the shadow camera. Must cover the playable area or shadows
   *  vanish at the edges; growing it past the arena just blurs them. */
  shadowExtent?: number;
}

export function makeDaylightRig({
  keyColor = '#fff3dd',
  fillColor = '#9fc2e6',
  skyColor = '#dce8f4',
  groundColor = '#b6a98f',
  intensity = 1,
  shadowExtent = 22,
}: DaylightRigOptions = {}): ReactElement {
  return (
    <>
      <hemisphereLight args={[skyColor, groundColor, 0.95 * intensity]} />
      <ambientLight intensity={0.22 * intensity} color="#f4f7ff" />
      <directionalLight
        position={[13, 19, 9]}
        intensity={2.1 * intensity}
        color={keyColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
      />
      <directionalLight position={[-11, 7, -9]} intensity={0.38 * intensity} color={fillColor} />
    </>
  );
}
