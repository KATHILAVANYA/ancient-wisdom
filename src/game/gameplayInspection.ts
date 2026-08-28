/**
 * Small semantic contract consumed by preview_scene.
 *
 * Keep this as authored gameplay data, not scene-graph guesses. The validator
 * needs the same collider dimensions, support surfaces, walls, and physics
 * constants that the simulation actually uses.
 */
export type GameplayVec3 = [number, number, number];

export interface GameplayAabb {
  min: GameplayVec3;
  max: GameplayVec3;
}

export interface GameplayWidthSample {
  id: string;
  width: number;
  position?: GameplayVec3;
}

export interface GameplaySupport {
  id: string;
  kind: 'floor' | 'platform' | 'track' | 'path';
  aabb: GameplayAabb;
  /** Constant usable width for a track/path segment. */
  usableWidth?: number;
  /** Use samples when the usable width varies along the segment. */
  widthSamples?: GameplayWidthSample[];
}

export interface GameplayWall {
  id: string;
  aabb: GameplayAabb;
}

export interface GameplayRoute {
  id: string;
  start: string;
  goal: string;
  /** Required waypoints, in order. Other supports may still bridge each leg. */
  via?: string[];
}

export interface GameplaySnapshot {
  version: 1;
  player: {
    /** Collider center in world coordinates (not mesh origin unless they match). */
    position: GameplayVec3;
    /** Horizontal collider radius. Collider width is radius * 2. */
    radius: number;
    /** Vertical distance from collider center to top/bottom; defaults to radius. */
    halfHeight?: number;
    velocity?: GameplayVec3;
  };
  supports: GameplaySupport[];
  walls?: GameplayWall[];
  physics?: {
    /** Positive downward acceleration magnitude. */
    gravity: number;
    jumpSpeed: number;
    moveSpeed: number;
  };
  controls?: {
    forward?: string;
    left?: string;
    right?: string;
  };
  routes?: GameplayRoute[];
  settings?: {
    spawnMaxGap?: number;
    spawnMaxPenetration?: number;
    /** Total extra usable width beyond the player collider diameter. */
    clearanceMargin?: number;
    /** Passive no-input sampling controls; capture clamps duration to one second. */
    spawnStabilityDurationMs?: number;
    spawnDownwardTolerance?: number;
  };
}

export type GameplayProbeName =
  | 'control_direction'
  | 'player_wall_blocking'
  | 'projectile_wall_blocking'
  | 'boundary_recovery';

export type GameplayProbeCommand =
  | { action: 'describe' }
  | { action: 'setup' }
  | { action: 'run' }
  | { action: 'measure' }
  | { action: 'reset' };

/**
 * `describe` result shapes understood by preview_scene.
 *
 * The browser harness dispatches real KeyA/KeyD for control_direction. The
 * other probes use authored setup/run/reset actions because a generic harness
 * cannot know how to enter a wall, projectile, or off-track scenario.
 */
export type GameplayProbeDescription =
  | {
      rightBasis: GameplayVec3;
      durationMs?: number;
      minDisplacement?: number;
      restoreTolerance?: number;
    }
  | {
      wallId: string;
      axis: 0 | 1 | 2;
      approachSign: -1 | 1;
      durationMs?: number;
      penetrationTolerance?: number;
    }
  | {
      wallId: string;
      targetId: string;
      origin: GameplayVec3;
      targetPosition: GameplayVec3;
      durationMs?: number;
      stopTolerance?: number;
    }
  | {
      traversableSupportIds: string[];
      timeoutMs?: number;
      pollMs?: number;
      minUsefulSpeed?: number;
    };

/** Raw projectile evidence returned only for the `measure` command. */
export interface GameplayProjectileMeasurement {
  firstHitId: string | null;
  targetHit: boolean;
  projectileActive: boolean;
  projectilePosition: GameplayVec3;
}

export interface GameplayInspectionContract {
  /** Synchronous and cheap: dynamic probes sample this repeatedly. */
  inspect: () => GameplaySnapshot;
  /**
   * Capability-gated dynamic scenario command channel.
   *
   * Return a description for `describe`, raw projectile evidence for `measure`,
   * and nothing for setup/run/reset. Return null from `describe` when a probe is
   * unsupported. Never return `{ passed: true }`: preview_scene ignores authored
   * verdicts and computes pass/fail from inspect() snapshots and measurements.
   * Reset must restore the same player baseline before each A/D control arm.
   */
  probe?: (
    name: GameplayProbeName,
    command: GameplayProbeCommand,
  ) => GameplayProbeDescription | GameplayProjectileMeasurement | null | void
    | Promise<GameplayProbeDescription | GameplayProjectileMeasurement | null | void>;
}

declare global {
  interface Window {
    __agon_gameplay?: GameplayInspectionContract;
  }
}

export function installGameplayInspection(
  inspect: () => GameplaySnapshot,
  probe?: GameplayInspectionContract['probe'],
): () => void {
  const contract: GameplayInspectionContract = { inspect, ...(probe ? { probe } : {}) };
  window.__agon_gameplay = contract;
  return () => {
    if (window.__agon_gameplay === contract) delete window.__agon_gameplay;
  };
}

