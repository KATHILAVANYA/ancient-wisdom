// Game feel: camera shake, hitstop, DOM floating text, screen flash, particles.
//
// All state is module-level on purpose — the sim fires effects from deep inside
// a useFrame tick and must not prop-drill or setState to do it. The React-facing
// pieces (text, flash) expose useSyncExternalStore hooks so the DOM layer
// re-renders only when something actually spawns, never per frame.
//
// Call resetJuice() from a resettable() so a restart starts clean.

import { useSyncExternalStore } from 'react';
import * as THREE from 'three';

/* ─── Camera shake ──────────────────────────────────────────────────────────
   Additive on the CAMERA, never on the player transform: shaking the player
   desyncs it from its own collision box. Render the component that applies
   this AFTER whatever writes camera.position (ChaseCamera), or it gets
   overwritten in the same frame. */

const SHAKE_DECAY = 3.2;
const SHAKE_MAX = 1.2;
let shakeAmp = 0;
const shakeVec = new THREE.Vector3();

export function shake(amount = 0.4): void {
  shakeAmp = Math.min(SHAKE_MAX, shakeAmp + amount);
}

/** Decays the shake and returns this frame's positional offset (reused vector). */
export function stepShake(dt: number): THREE.Vector3 {
  shakeAmp = Math.max(0, shakeAmp - dt * SHAKE_DECAY);
  const a = shakeAmp * shakeAmp * 0.55;
  shakeVec.set((Math.random() * 2 - 1) * a, (Math.random() * 2 - 1) * a, (Math.random() * 2 - 1) * a);
  return shakeVec;
}

/* ─── Hitstop / freeze ─────────────────────────────────────────────────────
   A few frames of frozen sim on impact reads as weight. Also doubles as the
   "get ready" beat between stages. Timers that must keep running during the
   freeze (blink, particles, HUD) should use the RAW dt, not the returned one. */

let freezeT = 0;

export function freeze(seconds: number): void {
  freezeT = Math.max(freezeT, seconds);
}

export function isFrozen(): boolean {
  return freezeT > 0;
}

/** Returns the dt the sim should advance by — 0 while frozen. */
export function stepFreeze(dt: number): number {
  if (freezeT <= 0) return dt;
  freezeT -= dt;
  return 0;
}

/* ─── Floating text (DOM) ──────────────────────────────────────────────────
   DOM, not 3D text: it stays crisp, costs nothing, and can use the .float-text
   CSS animation. Positions are canvas-space CSS pixels. */

export type FloatKind = 'score' | 'damage' | 'combo';
export interface FloatText {
  id: number;
  text: string;
  x: number;
  y: number;
  kind: FloatKind;
}

const FLOAT_LIFE_MS = 1000;
let texts: FloatText[] = [];
let nextId = 1;
const textListeners = new Set<() => void>();

function emitTexts() {
  for (const l of textListeners) l();
}

export function floatText(text: string, x: number, y: number, kind: FloatKind = 'score'): void {
  const id = nextId++;
  texts = [...texts, { id, text, x, y, kind }];
  emitTexts();
  window.setTimeout(() => {
    texts = texts.filter((t) => t.id !== id);
    emitTexts();
  }, FLOAT_LIFE_MS);
}

const projected = new THREE.Vector3();

/** Spawns floating text at a world position, projected through the camera. */
export function floatWorldText(
  text: string,
  world: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number,
  kind: FloatKind = 'score',
): void {
  projected.copy(world).project(camera);
  if (projected.z > 1) return; // behind the camera
  floatText(text, (projected.x * 0.5 + 0.5) * width, (-projected.y * 0.5 + 0.5) * height, kind);
}

export function useFloatTexts(): FloatText[] {
  return useSyncExternalStore(
    (cb) => {
      textListeners.add(cb);
      return () => textListeners.delete(cb);
    },
    () => texts,
    () => texts,
  );
}

/* ─── Screen flash (DOM) ───────────────────────────────────────────────────
   A full-screen tint element, NOT a backdrop-filter — filtering over the WebGL
   canvas forces a re-rasterise every repaint and reads as strobing. */

export type FlashKind = 'hit' | 'score';
export interface Flash {
  id: number;
  kind: FlashKind;
}

const FLASH_LIFE_MS = 420;
let activeFlash: Flash | null = null;
const flashListeners = new Set<() => void>();

function emitFlash() {
  for (const l of flashListeners) l();
}

export function flash(kind: FlashKind): void {
  const id = nextId++;
  activeFlash = { id, kind };
  emitFlash();
  window.setTimeout(() => {
    if (activeFlash?.id === id) {
      activeFlash = null;
      emitFlash();
    }
  }, FLASH_LIFE_MS);
}

export function useFlash(): Flash | null {
  return useSyncExternalStore(
    (cb) => {
      flashListeners.add(cb);
      return () => flashListeners.delete(cb);
    },
    () => activeFlash,
    () => activeFlash,
  );
}

/* ─── Particles ────────────────────────────────────────────────────────────
   Fixed pool, no allocation per burst. The renderer walks getParticles() and
   writes instance matrices; dead particles get a zero scale. */

export const MAX_PARTICLES = 96;

export interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number; ttl: number; size: number;
  r: number; g: number; b: number;
}

const PARTICLE_GRAVITY = -16;
const PARTICLE_DRAG = 1.8;
const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
  x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, ttl: 1, size: 0.14, r: 1, g: 1, b: 1,
}));
let cursor = 0;
const burstColor = new THREE.Color();

export function burst(
  x: number, y: number, z: number,
  color: string,
  count = 10,
  speed = 4.5,
  size = 0.14,
): void {
  burstColor.set(color);
  for (let i = 0; i < count; i++) {
    const p = particles[cursor];
    cursor = (cursor + 1) % MAX_PARTICLES;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 1.4 - 0.4); // biased upward
    const s = speed * (0.55 + Math.random() * 0.7);
    p.x = x; p.y = y; p.z = z;
    p.vx = Math.sin(phi) * Math.cos(theta) * s;
    p.vy = Math.cos(phi) * s + speed * 0.35;
    p.vz = Math.sin(phi) * Math.sin(theta) * s;
    p.ttl = 0.5 + Math.random() * 0.35;
    p.life = p.ttl;
    p.size = size * (0.7 + Math.random() * 0.6);
    p.r = burstColor.r; p.g = burstColor.g; p.b = burstColor.b;
  }
}

export function stepParticles(dt: number): void {
  for (const p of particles) {
    if (p.life <= 0) continue;
    p.life -= dt;
    p.vy += PARTICLE_GRAVITY * dt;
    const drag = Math.max(0, 1 - PARTICLE_DRAG * dt);
    p.vx *= drag;
    p.vz *= drag;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    if (p.y < 0.06) {
      p.y = 0.06;
      p.vy *= -0.35;
      p.vx *= 0.6;
      p.vz *= 0.6;
    }
  }
}

export function getParticles(): readonly Particle[] {
  return particles;
}

/* ─── Reset ───────────────────────────────────────────────────────────────── */

export function resetJuice(): void {
  shakeAmp = 0;
  freezeT = 0;
  for (const p of particles) p.life = 0;
  if (texts.length) {
    texts = [];
    emitTexts();
  }
  if (activeFlash) {
    activeFlash = null;
    emitFlash();
  }
}
