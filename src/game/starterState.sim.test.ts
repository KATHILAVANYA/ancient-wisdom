import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  assertFiniteState,
  assertNoInitialDownwardFall,
  assertPlayerSupported,
  assertResetRestoresInitialState,
  assertStatesClose,
  runInputSequenceAtHz,
  type PlayerCollider,
  type TimedInput,
} from './simTestKit';
import {
  STARTER_FLOOR,
  STARTER_MOVE_SPEED,
  STARTER_PLAYER_HALF_HEIGHT,
  STARTER_PLAYER_RADIUS,
  STARTER_STAGES,
  createStarterState,
  resetStarterState,
  snapshotStarterState,
  stepStarterState,
  type StarterCommand,
  type StarterState,
  type StarterUpgradeId,
} from './starterState';

const IDLE: StarterCommand[] = [{ type: 'move', x: 0, z: 0 }];

function step(state: StarterState, input: readonly StarterCommand[], dt: number): StarterState {
  return stepStarterState(state, input, dt).state;
}

function movementOnly(seed = 123): StarterState {
  return { ...createStarterState(seed), pickups: [], hazards: [] };
}

function collider(state: StarterState): PlayerCollider {
  const snapshot = snapshotStarterState(state);
  return {
    position: snapshot.position,
    velocity: snapshot.velocity,
    radius: STARTER_PLAYER_RADIUS,
    halfHeight: STARTER_PLAYER_HALF_HEIGHT,
  };
}

describe('pure starter simulation', () => {
  it('keeps the spawn finite, supported, and still through initial ticks', () => {
    let state = movementOnly();
    const samples = [collider(state)];
    for (let tick = 0; tick < 12; tick += 1) {
      state = step(state, IDLE, 1 / 60);
      assertFiniteState(snapshotStarterState(state));
      assertPlayerSupported(collider(state), STARTER_FLOOR);
      samples.push(collider(state));
    }
    assertNoInitialDownwardFall(samples);
  });

  it('is deterministic for the same seed and command sequence', () => {
    const commands: TimedInput<readonly StarterCommand[]>[] = [
      { input: [{ type: 'move', x: 1, z: 0 }], duration: 0.4 },
      { input: [{ type: 'move', x: 0.2, z: -1 }, { type: 'jump' }], duration: 1 / 60 },
      { input: [{ type: 'move', x: 0.2, z: -1 }], duration: 0.8 },
    ];
    const first = runInputSequenceAtHz(movementOnly(77), step, commands, 60);
    const second = runInputSequenceAtHz(movementOnly(77), step, commands, 60);
    expect(snapshotStarterState(second)).toEqual(snapshotStarterState(first));
  });

  it('integrates movement consistently at 30, 60, and 144Hz', () => {
    const sequence: TimedInput<readonly StarterCommand[]>[] = [
      { input: [{ type: 'move', x: 1, z: -0.3 }], duration: 0.75 },
      { input: [{ type: 'move', x: -0.2, z: 0.8 }], duration: 0.75 },
    ];
    const at30 = snapshotStarterState(runInputSequenceAtHz(movementOnly(), step, sequence, 30));
    for (const hz of [60, 144]) {
      const candidate = snapshotStarterState(
        runInputSequenceAtHz(movementOnly(), step, sequence, hz),
      );
      assertStatesClose(candidate.position, at30.position, 1e-8, `${hz}Hz position`);
      assertStatesClose(candidate.velocity, at30.velocity, 1e-8, `${hz}Hz velocity`);
    }
  });

  it('restores every authoritative field on restart', () => {
    assertResetRestoresInitialState(
      () => createStarterState(91),
      (initial) => ({
        ...initial,
        score: 900,
        stage: 2,
        health: 1,
        upgrades: [...initial.upgrades, 'glass-engine'] as StarterUpgradeId[],
        position: { x: 4, y: 3, z: -2 },
      }),
      resetStarterState,
      snapshotStarterState,
    );
  });

  it('emits collect then upgrade events without presentation code', () => {
    const initial = createStarterState(12);
    const config = STARTER_STAGES[0];
    const target = initial.pickups[0];
    const state: StarterState = {
      ...initial,
      position: { x: target.position[0], y: target.position[1], z: target.position[2] },
      collected: config.quota - 1,
      pickups: initial.pickups.map((pickup, index) => ({ ...pickup, active: index === 0 })),
      hazards: [],
    };
    const transition = stepStarterState(state, IDLE, 1 / 60);

    expect(transition.events.map(({ type }) => type)).toEqual(['collect', 'upgrade_offered']);
    expect(transition.state.phase).toBe('upgrade');
    expect(transition.state.offeredUpgrades).toHaveLength(2);

    const chosen = transition.state.offeredUpgrades[0];
    const advanced = stepStarterState(
      transition.state,
      [{ type: 'choose_upgrade', id: chosen }],
      1 / 60,
    );
    expect(advanced.events.map(({ type }) => type)).toEqual([
      'upgrade_chosen',
      'stage_changed',
    ]);
    expect(advanced.state.stage).toBe(1);
    expect(advanced.state.upgrades).toContain(chosen);
  });

  it('keeps randomized input and dt finite and speed-bounded', () => {
    const sample = fc.record({
      dtMs: fc.integer({ min: 1, max: 50 }),
      x: fc.integer({ min: -1000, max: 1000 }),
      z: fc.integer({ min: -1000, max: 1000 }),
      jump: fc.boolean(),
    });
    fc.assert(
      fc.property(fc.array(sample, { minLength: 1, maxLength: 80 }), (samples) => {
        let state = movementOnly();
        for (const input of samples) {
          const commands: StarterCommand[] = [
            { type: 'move', x: input.x / 1000, z: input.z / 1000 },
          ];
          if (input.jump) commands.push({ type: 'jump' });
          state = step(state, commands, input.dtMs / 1000);
          const snapshot = snapshotStarterState(state);
          assertFiniteState(snapshot);
          expect(snapshot.speed).toBeLessThanOrEqual(STARTER_MOVE_SPEED + 1e-9);
        }
      }),
      { numRuns: 100, seed: 20260824 },
    );
  });
});
