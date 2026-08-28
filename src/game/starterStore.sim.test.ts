import { describe, expect, it } from 'vitest';
import { createStarterStore } from './starterStore';

describe('starter simulation store shell', () => {
  it('keeps the HUD snapshot stable during transform-only ticks', () => {
    const store = createStarterStore(44);
    const initialHud = store.getHudSnapshot();
    let notifications = 0;
    const unsubscribe = store.subscribeHud(() => {
      notifications += 1;
    });

    store.tick([{ type: 'move', x: 1, z: 0 }], 1 / 60);

    expect(store.getHudSnapshot()).toBe(initialHud);
    expect(notifications).toBe(0);
    unsubscribe();
  });

  it('notifies on discrete state and drains each typed event once', () => {
    const store = createStarterStore(44);
    let notifications = 0;
    const unsubscribe = store.subscribeHud(() => {
      notifications += 1;
    });

    for (let frame = 0; frame < 45; frame += 1) {
      store.tick([{ type: 'move', x: 0, z: -1 }], 1 / 60);
    }

    const events = store.drainEvents();
    expect(events.some(({ type }) => type === 'collect')).toBe(true);
    expect(store.drainEvents()).toEqual([]);
    expect(notifications).toBeGreaterThan(0);
    unsubscribe();
  });

  it('applies restart through the live control plane without a simulation tick', () => {
    const store = createStarterStore(44);
    const before = store.getState();
    store.dispatch({ type: 'restart', seed: 99 });
    expect(store.getState()).not.toBe(before);
    expect(store.getState().initialSeed).toBe(99);
  });

  it('applies an upgrade choice while the simulation is paused', () => {
    const store = createStarterStore(44);
    store.debugSetPhase('upgrade');

    store.dispatch({ type: 'choose_upgrade', id: 'glass-engine' });

    expect(store.getState().phase).toBe('playing');
    expect(store.getState().upgrades).toEqual(['glass-engine']);
    expect(store.getState().offeredUpgrades).toEqual([]);
  });
});
