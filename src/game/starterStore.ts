/**
 * Tiny imperative shell around the pure starter simulation.
 *
 * R3F calls tick() once per frame and mirrors getState() into refs. React HUD
 * components subscribe only to the stable, discrete HUD snapshot. Presentation
 * drains typed events for sound, particles, camera shake, and banners.
 */

import {
  STARTER_STAGES,
  STARTER_UPGRADES,
  createStarterState,
  snapshotStarterState,
  stepStarterState,
  type StarterCommand,
  type StarterEvent,
  type StarterState,
  type StarterUpgradeId,
} from './starterState';

export interface StarterHudSnapshot {
  score: number;
  stage: number;
  collected: number;
  quota: number;
  health: number;
  maxHealth: number;
  phase: StarterState['phase'];
  upgrades: readonly StarterUpgradeId[];
  offeredUpgrades: readonly StarterUpgradeId[];
}

export interface StarterStore {
  getState: () => StarterState;
  getHudSnapshot: () => StarterHudSnapshot;
  subscribeHud: (listener: () => void) => () => void;
  dispatch: (command: StarterCommand) => void;
  tick: (commands: readonly StarterCommand[], dt: number) => void;
  drainEvents: () => StarterEvent[];
  reset: (seed?: number) => void;
  debugSetPhase: (phase: 'upgrade' | 'won' | 'lost') => void;
}

function toHudSnapshot(state: StarterState): StarterHudSnapshot {
  return {
    score: state.score,
    stage: state.stage,
    collected: state.collected,
    quota: STARTER_STAGES[state.stage].quota,
    health: state.health,
    maxHealth: state.maxHealth,
    phase: state.phase,
    upgrades: state.upgrades,
    offeredUpgrades: state.offeredUpgrades,
  };
}

function sameHud(a: StarterHudSnapshot, b: StarterHudSnapshot): boolean {
  return (
    a.score === b.score &&
    a.stage === b.stage &&
    a.collected === b.collected &&
    a.quota === b.quota &&
    a.health === b.health &&
    a.maxHealth === b.maxHealth &&
    a.phase === b.phase &&
    a.upgrades.join() === b.upgrades.join() &&
    a.offeredUpgrades.join() === b.offeredUpgrades.join()
  );
}

export function createStarterStore(seed?: number): StarterStore {
  let state = createStarterState(seed);
  let hudSnapshot = toHudSnapshot(state);
  let queuedCommands: StarterCommand[] = [];
  let queuedEvents: StarterEvent[] = [];
  const hudListeners = new Set<() => void>();

  const publishHud = () => {
    const next = toHudSnapshot(state);
    if (sameHud(hudSnapshot, next)) return;
    hudSnapshot = next;
    for (const listener of hudListeners) listener();
  };
  const applyControl = (command: Extract<StarterCommand, { type: 'choose_upgrade' | 'restart' }>) => {
    const transition = stepStarterState(state, [command], 1 / 60);
    state = transition.state;
    queuedCommands = [];
    if (command.type === 'restart') queuedEvents = transition.events;
    else queuedEvents.push(...transition.events);
    publishHud();
  };

  return {
    getState: () => state,
    getHudSnapshot: () => hudSnapshot,
    subscribeHud: (listener) => {
      hudListeners.add(listener);
      return () => hudListeners.delete(listener);
    },
    dispatch: (command) => {
      if (command.type === 'choose_upgrade' || command.type === 'restart') {
        applyControl(command);
      } else {
        queuedCommands.push(command);
      }
    },
    tick: (commands, dt) => {
      const transition = stepStarterState(state, [...queuedCommands, ...commands], dt);
      queuedCommands = [];
      state = transition.state;
      queuedEvents.push(...transition.events);
      publishHud();
    },
    drainEvents: () => {
      const events = queuedEvents;
      queuedEvents = [];
      return events;
    },
    reset: (nextSeed) => {
      applyControl({ type: 'restart', ...(nextSeed === undefined ? {} : { seed: nextSeed }) });
    },
    debugSetPhase: (phase) => {
      if (!import.meta.env.DEV) throw new Error('debugSetPhase is only available in development');
      const fresh = createStarterState(state.initialSeed);
      state = {
        ...fresh,
        phase,
        offeredUpgrades:
          phase === 'upgrade'
            ? [STARTER_UPGRADES[0].id, STARTER_UPGRADES[1].id]
            : [],
      };
      queuedCommands = [];
      queuedEvents = [];
      publishHud();
    },
  };
}

export const starterStore = createStarterStore();

export function getStarterInspectionSnapshot() {
  return snapshotStarterState(starterStore.getState());
}
