/**
 * Headless helpers for testing deterministic game state. This module has no
 * React, R3F, DOM, timer, or renderer dependency and is safe in Vitest's Node
 * environment.
 */

export type SimStep<State, Input> = (state: State, input: Input, dt: number) => State;

export interface TimedInput<Input> {
  duration: number;
  input: Input;
}

export function stepFrames<State, Input>(
  initial: State,
  step: SimStep<State, Input>,
  input: Input,
  frameCount: number,
  dt: number,
): State {
  if (!Number.isInteger(frameCount) || frameCount < 0) {
    throw new Error(`frameCount must be a non-negative integer, got ${frameCount}`);
  }
  if (!Number.isFinite(dt) || dt <= 0) {
    throw new Error(`dt must be finite and positive, got ${dt}`);
  }

  let state = initial;
  for (let frame = 0; frame < frameCount; frame += 1) {
    state = step(state, input, dt);
  }
  return state;
}

/**
 * Runs time-authored inputs at a chosen presentation rate. The final frame in
 * each segment is shortened when necessary, so every rate simulates the exact
 * same duration instead of accumulating a rounded-frame timing error.
 */
export function runInputSequenceAtHz<State, Input>(
  initial: State,
  step: SimStep<State, Input>,
  sequence: readonly TimedInput<Input>[],
  hz: number,
): State {
  if (!Number.isFinite(hz) || hz <= 0) {
    throw new Error(`hz must be finite and positive, got ${hz}`);
  }

  const frameDt = 1 / hz;
  let state = initial;
  for (const segment of sequence) {
    if (!Number.isFinite(segment.duration) || segment.duration < 0) {
      throw new Error(`segment duration must be finite and non-negative, got ${segment.duration}`);
    }
    let remaining = segment.duration;
    while (remaining > 1e-12) {
      const dt = Math.min(frameDt, remaining);
      state = step(state, segment.input, dt);
      remaining -= dt;
    }
  }
  return state;
}

export function assertFiniteState(value: unknown, path = 'state'): void {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`${path} is not finite: ${value}`);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteState(item, `${path}[${index}]`));
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    assertFiniteState(item, `${path}.${key}`);
  }
}

export function assertStatesClose(
  actual: unknown,
  expected: unknown,
  tolerance = 1e-6,
  path = 'state',
): void {
  if (typeof actual === 'number' && typeof expected === 'number') {
    if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
      throw new Error(`${path} contains a non-finite value`);
    }
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`${path}: expected ${expected} ± ${tolerance}, got ${actual}`);
    }
    return;
  }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) {
      throw new Error(`${path}: expected length ${expected.length}, got ${actual.length}`);
    }
    actual.forEach((item, index) => assertStatesClose(item, expected[index], tolerance, `${path}[${index}]`));
    return;
  }
  if (actual && expected && typeof actual === 'object' && typeof expected === 'object') {
    const actualRecord = actual as Record<string, unknown>;
    const expectedRecord = expected as Record<string, unknown>;
    const actualKeys = Object.keys(actualRecord).sort();
    const expectedKeys = Object.keys(expectedRecord).sort();
    if (actualKeys.join('\0') !== expectedKeys.join('\0')) {
      throw new Error(`${path}: object keys differ`);
    }
    for (const key of actualKeys) {
      assertStatesClose(actualRecord[key], expectedRecord[key], tolerance, `${path}.${key}`);
    }
    return;
  }
  if (!Object.is(actual, expected)) {
    throw new Error(`${path}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

export function assertResetRestoresInitialState<State, Snapshot>(
  createInitial: () => State,
  makeDirty: (state: State) => State,
  reset: (state: State) => State,
  snapshot: (state: State) => Snapshot,
  tolerance = 0,
): void {
  const initial = createInitial();
  const dirty = makeDirty(initial);
  const restarted = reset(dirty);
  assertStatesClose(snapshot(restarted), snapshot(createInitial()), tolerance, 'reset state');
}

export interface SeededRandom {
  /** Uniform value in the half-open interval [0, 1). */
  unit: () => number;
  /** Inclusive integer range. */
  integer: (min: number, max: number) => number;
  bool: () => boolean;
}

function numericSeed(seed: number | string): number {
  if (typeof seed === 'number') return seed >>> 0;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededInputSequence<Input>(
  seed: number | string,
  length: number,
  makeInput: (random: SeededRandom, index: number) => Input,
): Input[] {
  if (!Number.isInteger(length) || length < 0) {
    throw new Error(`length must be a non-negative integer, got ${length}`);
  }

  let value = numericSeed(seed);
  const unit = () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
  const random: SeededRandom = {
    unit,
    integer: (min, max) => {
      if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
        throw new Error(`invalid integer range ${min}..${max}`);
      }
      return min + Math.floor(unit() * (max - min + 1));
    },
    bool: () => unit() < 0.5,
  };
  return Array.from({ length }, (_, index) => makeInput(random, index));
}

export type Vec3 = readonly [number, number, number];

export interface SupportAabb {
  min: Vec3;
  max: Vec3;
}

export interface PlayerCollider {
  position: Vec3;
  radius: number;
  halfHeight: number;
  velocity?: Vec3;
}

export interface SupportMetrics {
  bottom: number;
  supportTop: number;
  gap: number;
  penetration: number;
}

/**
 * Verifies that a player's collider footprint is over a support AABB and that
 * its bottom neither floats above nor penetrates below the support top.
 */
export function assertPlayerSupported(
  player: PlayerCollider,
  support: SupportAabb,
  options: { maxGap?: number; maxPenetration?: number; horizontalTolerance?: number } = {},
): SupportMetrics {
  assertFiniteState({ player, support }, 'spawn support');
  const maxGap = options.maxGap ?? 0.08;
  const maxPenetration = options.maxPenetration ?? 0.03;
  const horizontalTolerance = options.horizontalTolerance ?? 1e-6;
  const [x, , z] = player.position;

  if (
    x - player.radius < support.min[0] - horizontalTolerance ||
    x + player.radius > support.max[0] + horizontalTolerance ||
    z - player.radius < support.min[2] - horizontalTolerance ||
    z + player.radius > support.max[2] + horizontalTolerance
  ) {
    throw new Error('player collider footprint is not fully over the support AABB');
  }

  const bottom = player.position[1] - player.halfHeight;
  const supportTop = support.max[1];
  const signedGap = bottom - supportTop;
  const gap = Math.max(0, signedGap);
  const penetration = Math.max(0, -signedGap);
  if (gap > maxGap) {
    throw new Error(`player spawn floats ${gap} above support (max ${maxGap})`);
  }
  if (penetration > maxPenetration) {
    throw new Error(`player spawn penetrates support by ${penetration} (max ${maxPenetration})`);
  }
  return { bottom, supportTop, gap, penetration };
}

export function assertNoInitialDownwardFall(
  samples: readonly PlayerCollider[],
  tolerance = 1e-6,
): void {
  if (samples.length < 2) throw new Error('at least two initial player samples are required');
  const initialY = samples[0].position[1];
  for (let index = 1; index < samples.length; index += 1) {
    const sample = samples[index];
    if (sample.position[1] < initialY - tolerance) {
      throw new Error(`player fell downward at initial sample ${index}`);
    }
    if (sample.velocity && sample.velocity[1] < -tolerance) {
      throw new Error(`player has downward velocity at initial sample ${index}`);
    }
  }
}
