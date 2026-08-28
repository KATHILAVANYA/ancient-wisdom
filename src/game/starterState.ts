/**
 * Functional core for the starter game.
 *
 * This file deliberately has no React, R3F, Three.js, DOM, audio, timer, or
 * browser dependency. Replace its data and rules for the brief; keep the
 * create/step/reset/snapshot boundary so the game remains headlessly testable.
 */

export type Vec3 = readonly [number, number, number];

export const STARTER_MOVE_SPEED = 8;
export const STARTER_MOVE_RESPONSE = 14;
export const STARTER_GRAVITY = 30;
export const STARTER_JUMP_SPEED = 11.5;
export const STARTER_PLAYER_RADIUS = 0.4;
export const STARTER_PLAYER_HALF_HEIGHT = 0.65;

export const STARTER_FLOOR = {
  min: [-45, -0.1, -45],
  max: [45, 0, 45],
} as const;

export const STARTER_STAGES = [
  {
    id: 'first-signal',
    label: 'FIRST SIGNAL',
    quota: 3,
    arenaRadius: 11,
    hazardSpeed: 1.05,
    pickupPositions: [[0, 0.65, -2.5], [-3.2, 1.85, -2.6], [3.6, 2.35, -1.8]] as Vec3[],
    presentation: { accent: '#efbc45', fog: '#aebfd0', worldScale: 1 },
  },
  {
    id: 'cross-current',
    label: 'CROSS CURRENT',
    quota: 4,
    arenaRadius: 12.5,
    hazardSpeed: 1.3,
    pickupPositions: [
      [0, 0.65, -3.5],
      [-3.2, 1.85, -2.6],
      [3.6, 2.35, -1.8],
      [0.2, 1.55, 4],
    ] as Vec3[],
    presentation: { accent: '#77d8d2', fog: '#7897ad', worldScale: 1.08 },
  },
  {
    id: 'resonance-storm',
    label: 'RESONANCE STORM',
    quota: 5,
    arenaRadius: 14,
    hazardSpeed: 1.6,
    pickupPositions: [
      [0, 0.65, -4],
      [-3.2, 1.85, -2.6],
      [3.6, 2.35, -1.8],
      [0.2, 1.55, 4],
      [-5.2, 0.65, 3],
    ] as Vec3[],
    presentation: { accent: '#ed6aa2', fog: '#665c8d', worldScale: 1.18 },
  },
] as const;

export const STARTER_STAGE_COUNT = STARTER_STAGES.length;

export const STARTER_UPGRADES = [
  {
    id: 'glass-engine',
    title: 'Glass Engine',
    description: '+25% speed, but lose one maximum health.',
  },
  {
    id: 'wide-signal',
    title: 'Wide Signal',
    description: 'Longer pickup reach, but hazards accelerate.',
  },
  {
    id: 'heavy-spring',
    title: 'Heavy Spring',
    description: 'Higher jump and +50% score, but slower movement.',
  },
] as const;

export type StarterUpgradeId = (typeof STARTER_UPGRADES)[number]['id'];
export type StarterPhase = 'playing' | 'upgrade' | 'won' | 'lost';

export type StarterCommand =
  | { type: 'move'; x: number; z: number }
  | { type: 'jump' }
  | { type: 'choose_upgrade'; id: StarterUpgradeId }
  | { type: 'restart'; seed?: number };

export interface StarterPickup {
  id: string;
  position: Vec3;
  active: boolean;
}

export interface StarterHazard {
  id: string;
  angle: number;
  radius: number;
  angularSpeed: number;
}

export interface StarterStats {
  moveSpeed: number;
  jumpSpeed: number;
  pickupRadius: number;
  hazardSpeedScale: number;
  scoreScale: number;
}

export interface StarterState {
  initialSeed: number;
  randomSeed: number;
  elapsed: number;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  grounded: boolean;
  health: number;
  maxHealth: number;
  invulnerableFor: number;
  score: number;
  collected: number;
  stage: number;
  phase: StarterPhase;
  pickups: StarterPickup[];
  hazards: StarterHazard[];
  upgrades: StarterUpgradeId[];
  offeredUpgrades: StarterUpgradeId[];
  stats: StarterStats;
}

export interface StarterSnapshot {
  elapsed: number;
  position: Vec3;
  velocity: Vec3;
  grounded: boolean;
  speed: number;
  health: number;
  maxHealth: number;
  score: number;
  collected: number;
  stage: number;
  phase: StarterPhase;
  pickups: readonly StarterPickup[];
  hazards: readonly StarterHazard[];
  upgrades: readonly StarterUpgradeId[];
  offeredUpgrades: readonly StarterUpgradeId[];
}

export type StarterEvent =
  | { type: 'collect'; pickupId: string; position: Vec3; points: number }
  | { type: 'hit'; hazardId: string; position: Vec3; health: number }
  | { type: 'stage_changed'; stage: number; stageId: string }
  | { type: 'upgrade_offered'; choices: readonly StarterUpgradeId[] }
  | { type: 'upgrade_chosen'; id: StarterUpgradeId }
  | { type: 'won'; score: number }
  | { type: 'lost'; score: number };

export interface StarterTransition {
  state: StarterState;
  events: StarterEvent[];
}

const FLOOR_CENTER_Y = STARTER_FLOOR.max[1] + STARTER_PLAYER_HALF_HEIGHT;
const HAZARD_RADII = [7.2, 8.6, 10] as const;
const HAZARD_RADIUS = 0.7;
const PICKUP_COLLISION_RADIUS = 0.85;
const INVULNERABLE_SECONDS = 1.1;

function normalizeSeed(seed: number): number {
  return Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 0x51a7e;
}

function nextRandom(seed: number): { seed: number; unit: number } {
  let value = (seed + 0x6d2b79f5) >>> 0;
  let mixed = value;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  return { seed: value, unit: ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296 };
}

function makeStageEntities(stageIndex: number, seed: number) {
  const config = STARTER_STAGES[stageIndex];
  const random = nextRandom(seed);
  const direction = random.unit < 0.5 ? -1 : 1;
  return {
    seed: random.seed,
    pickups: config.pickupPositions.map((position, index) => ({
      id: `${config.id}-pickup-${index}`,
      position,
      active: true,
    })),
    hazards: Array.from({ length: stageIndex + 1 }, (_, index) => ({
      id: `${config.id}-hazard-${index}`,
      angle: (index / (stageIndex + 1)) * Math.PI * 2 + random.unit,
      radius: HAZARD_RADII[index],
      angularSpeed: config.hazardSpeed * direction * (index % 2 === 0 ? 1 : -1),
    })),
  };
}

export function createStarterState(seed = 0x51a7e): StarterState {
  const initialSeed = normalizeSeed(seed);
  const entities = makeStageEntities(0, initialSeed);
  return {
    initialSeed,
    randomSeed: entities.seed,
    elapsed: 0,
    position: { x: 0, y: FLOOR_CENTER_Y, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    grounded: true,
    health: 3,
    maxHealth: 3,
    invulnerableFor: 0,
    score: 0,
    collected: 0,
    stage: 0,
    phase: 'playing',
    pickups: entities.pickups,
    hazards: entities.hazards,
    upgrades: [],
    offeredUpgrades: [],
    stats: {
      moveSpeed: STARTER_MOVE_SPEED,
      jumpSpeed: STARTER_JUMP_SPEED,
      pickupRadius: PICKUP_COLLISION_RADIUS,
      hazardSpeedScale: 1,
      scoreScale: 1,
    },
  };
}

export function resetStarterState(state?: StarterState, seed = state?.initialSeed): StarterState {
  return createStarterState(seed);
}

function finiteAxis(value: number): number {
  return Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0;
}

function movement(commands: readonly StarterCommand[]) {
  const latest = [...commands].reverse().find((command) => command.type === 'move');
  let x = finiteAxis(latest?.type === 'move' ? latest.x : 0);
  let z = finiteAxis(latest?.type === 'move' ? latest.z : 0);
  const length = Math.hypot(x, z);
  if (length > 1) {
    x /= length;
    z /= length;
  }
  return { x, z, jump: commands.some((command) => command.type === 'jump') };
}

function integrateVelocity(position: number, velocity: number, target: number, dt: number) {
  const decay = Math.exp(-STARTER_MOVE_RESPONSE * dt);
  return {
    position: position + target * dt + ((velocity - target) * (1 - decay)) / STARTER_MOVE_RESPONSE,
    velocity: target + (velocity - target) * decay,
  };
}

function chooseUpgrade(state: StarterState, id: StarterUpgradeId): StarterTransition {
  if (state.phase !== 'upgrade' || !state.offeredUpgrades.includes(id)) {
    return { state, events: [] };
  }
  const stats = { ...state.stats };
  let maxHealth = state.maxHealth;
  let health = state.health;
  if (id === 'glass-engine') {
    stats.moveSpeed *= 1.25;
    maxHealth = Math.max(1, maxHealth - 1);
    health = Math.min(health, maxHealth);
  } else if (id === 'wide-signal') {
    stats.pickupRadius += 0.75;
    stats.hazardSpeedScale *= 1.18;
  } else {
    stats.jumpSpeed += 2.2;
    stats.scoreScale *= 1.5;
    stats.moveSpeed *= 0.88;
  }
  const stage = state.stage + 1;
  const entities = makeStageEntities(stage, state.randomSeed);
  return {
    state: {
      ...state,
      randomSeed: entities.seed,
      stage,
      phase: 'playing',
      collected: 0,
      health,
      maxHealth,
      stats,
      upgrades: [...state.upgrades, id],
      offeredUpgrades: [],
      pickups: entities.pickups,
      hazards: entities.hazards,
    },
    events: [
      { type: 'upgrade_chosen', id },
      { type: 'stage_changed', stage, stageId: STARTER_STAGES[stage].id },
    ],
  };
}

function offerUpgrades(state: StarterState): StarterTransition {
  const available = STARTER_UPGRADES.map(({ id }) => id).filter((id) => !state.upgrades.includes(id));
  const random = nextRandom(state.randomSeed);
  const pivot = available.length ? Math.floor(random.unit * available.length) : 0;
  const choices = [...available.slice(pivot), ...available.slice(0, pivot)].slice(0, 2);
  return {
    state: { ...state, randomSeed: random.seed, phase: 'upgrade', offeredUpgrades: choices },
    events: [{ type: 'upgrade_offered', choices }],
  };
}

export function stepStarterState(
  state: StarterState,
  commands: readonly StarterCommand[],
  dt: number,
): StarterTransition {
  if (!Number.isFinite(dt) || dt <= 0) {
    throw new Error(`dt must be finite and positive, got ${dt}`);
  }
  const restart = commands.find((command) => command.type === 'restart');
  if (restart?.type === 'restart') {
    return { state: resetStarterState(state, restart.seed), events: [] };
  }
  const choice = commands.find((command) => command.type === 'choose_upgrade');
  if (choice?.type === 'choose_upgrade') return chooseUpgrade(state, choice.id);
  if (state.phase !== 'playing') return { state, events: [] };

  const input = movement(commands);
  let moveX = integrateVelocity(
    state.position.x,
    state.velocity.x,
    input.x * state.stats.moveSpeed,
    dt,
  );
  let moveZ = integrateVelocity(
    state.position.z,
    state.velocity.z,
    input.z * state.stats.moveSpeed,
    dt,
  );
  let y = state.position.y;
  let velocityY = state.velocity.y;
  let grounded = state.grounded;
  if (grounded && input.jump) {
    velocityY = state.stats.jumpSpeed;
    grounded = false;
  }
  if (!grounded) {
    y += velocityY * dt - 0.5 * STARTER_GRAVITY * dt * dt;
    velocityY -= STARTER_GRAVITY * dt;
    if (y <= FLOOR_CENTER_Y) {
      y = FLOOR_CENTER_Y;
      velocityY = 0;
      grounded = true;
    }
  }

  const arena = STARTER_STAGES[state.stage].arenaRadius - STARTER_PLAYER_RADIUS;
  const distance = Math.hypot(moveX.position, moveZ.position);
  if (distance > arena) {
    const scale = arena / distance;
    moveX = { position: moveX.position * scale, velocity: moveX.velocity * 0.4 };
    moveZ = { position: moveZ.position * scale, velocity: moveZ.velocity * 0.4 };
  }

  let next: StarterState = {
    ...state,
    elapsed: state.elapsed + dt,
    invulnerableFor: Math.max(0, state.invulnerableFor - dt),
    position: { x: moveX.position, y, z: moveZ.position },
    velocity: { x: moveX.velocity, y: velocityY, z: moveZ.velocity },
    grounded,
    hazards: state.hazards.map((hazard) => ({
      ...hazard,
      angle: hazard.angle + hazard.angularSpeed * state.stats.hazardSpeedScale * dt,
    })),
  };
  const events: StarterEvent[] = [];

  const pickups = next.pickups.map((pickup) => {
    if (!pickup.active) return pickup;
    const dx = next.position.x - pickup.position[0];
    const dy = next.position.y - pickup.position[1];
    const dz = next.position.z - pickup.position[2];
    if (dx * dx + dy * dy + dz * dz > next.stats.pickupRadius ** 2) return pickup;
    const points = Math.round(10 * next.stats.scoreScale);
    events.push({ type: 'collect', pickupId: pickup.id, position: pickup.position, points });
    next = { ...next, score: next.score + points, collected: next.collected + 1 };
    return { ...pickup, active: false };
  });
  next = { ...next, pickups };

  if (next.invulnerableFor <= 0) {
    for (const hazard of next.hazards) {
      const hx = Math.cos(hazard.angle) * hazard.radius;
      const hz = Math.sin(hazard.angle) * hazard.radius;
      if (Math.hypot(next.position.x - hx, next.position.z - hz) > STARTER_PLAYER_RADIUS + HAZARD_RADIUS) {
        continue;
      }
      const health = next.health - 1;
      next = { ...next, health, invulnerableFor: INVULNERABLE_SECONDS };
      events.push({ type: 'hit', hazardId: hazard.id, position: [hx, HAZARD_RADIUS, hz], health });
      if (health <= 0) {
        next = { ...next, phase: 'lost' };
        events.push({ type: 'lost', score: next.score });
      }
      break;
    }
  }

  if (next.phase === 'playing' && next.collected >= STARTER_STAGES[next.stage].quota) {
    if (next.stage === STARTER_STAGES.length - 1) {
      next = { ...next, phase: 'won' };
      events.push({ type: 'won', score: next.score });
    } else {
      const offered = offerUpgrades(next);
      next = offered.state;
      events.push(...offered.events);
    }
  }
  return { state: next, events };
}

export function snapshotStarterState(state: StarterState): StarterSnapshot {
  return {
    elapsed: state.elapsed,
    position: [state.position.x, state.position.y, state.position.z],
    velocity: [state.velocity.x, state.velocity.y, state.velocity.z],
    grounded: state.grounded,
    speed: Math.hypot(state.velocity.x, state.velocity.z),
    health: state.health,
    maxHealth: state.maxHealth,
    score: state.score,
    collected: state.collected,
    stage: state.stage,
    phase: state.phase,
    pickups: state.pickups,
    hazards: state.hazards,
    upgrades: state.upgrades,
    offeredUpgrades: state.offeredUpgrades,
  };
}
