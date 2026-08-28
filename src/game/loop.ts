// Game flow (phase machine) + the sim tick, both OUTSIDE React state where it
// matters. Phase transitions ARE discrete, so they live in React state via
// useGamePhase. The per-frame sim runs in useGameFrame and must write to refs,
// never setState — setState from useFrame re-renders 60x/s and tanks the frame
// rate.

import { useContext, useEffect, useState } from 'react';
import { context as fiberContext, useFrame } from '@react-three/fiber';
import { clearPresses } from './input';

export type GamePhase = 'menu' | 'playing' | 'paused' | 'gameover';

// Longest sim step we ever apply. A backgrounded tab or a GC pause can hand
// useFrame a huge delta; clamping stops the player teleporting through walls.
const MAX_STEP_S = 1 / 20;

type Listener = (phase: GamePhase) => void;

const state = { phase: 'menu' as GamePhase };
const listeners = new Set<Listener>();
const resetHooks = new Set<() => void>();

function emit() {
  for (const l of listeners) l(state.phase);
}

/**
 * Register per-run state to be wiped on startRun() (positions, score, timers).
 * Returns an unregister fn — ALWAYS return it from the effect that registered,
 * or unmounts and HMR reloads pile up stale hooks that fire against dead state.
 */
export function resettable(reset: () => void): () => void {
  resetHooks.add(reset);
  return () => {
    resetHooks.delete(reset);
  };
}

function runResets() {
  for (const r of resetHooks) r();
}

/** menu/gameover -> playing. Wipes all resettable state first (full restart). */
export function startRun(): void {
  runResets();
  state.phase = 'playing';
  emit();
}

/** playing -> gameover. */
export function endRun(): void {
  if (state.phase !== 'playing') return;
  state.phase = 'gameover';
  emit();
}

/** playing -> paused without touching simulation state. */
export function pauseRun(): void {
  if (state.phase !== 'playing') return;
  state.phase = 'paused';
  emit();
}

/** paused -> playing without resetting the run. */
export function resumeRun(): void {
  if (state.phase !== 'paused') return;
  state.phase = 'playing';
  emit();
}

/** playing/paused/gameover -> menu. */
export function toMenu(): void {
  state.phase = 'menu';
  emit();
}

export function getPhase(): GamePhase {
  return state.phase;
}

/** Subscribe a React component to phase changes (drives overlays). */
export function useGamePhase(): GamePhase {
  const [phase, setPhase] = useState<GamePhase>(state.phase);
  useEffect(() => {
    listeners.add(setPhase);
    setPhase(state.phase);
    return () => {
      listeners.delete(setPhase);
    };
  }, []);
  return phase;
}

/**
 * A delta-clamped sim tick that ONLY runs while phase === 'playing'. Scale every
 * movement by dt. Presses are cleared automatically after your callback.
 *
 * MUST be called from a component rendered INSIDE <Canvas> — it is an R3F hook
 * and throws (blank screen) anywhere else. Register it ONCE, from a single root
 * sim component that runs your systems in order: the automatic clearPresses()
 * means a second registered tick would eat the first one's input.
 */
export function useGameFrame(cb: (dt: number, t: number) => void): void {
  // Outside a Canvas, useFrame throws "R3F: Hooks can only be used within the
  // Canvas component!" — accurate but it reads like a library bug, and with no
  // error boundary it just blanks the page. Name the actual mistake instead.
  if (!useContext(fiberContext)) {
    const why =
      'useGameFrame must be called from a component rendered inside <SceneShell> ' +
      '(it wraps R3F useFrame and needs Canvas context). Calling it in App itself ' +
      'does not work: <SceneShell> is a sibling of that call, not an ancestor. Move ' +
      'the per-frame work into a child of <SceneShell> and lift values back out with ' +
      'a callback or an external store.';
    console.error(why);
    throw new Error(why);
  }

  useFrame((s, delta) => {
    if (state.phase !== 'playing') return;
    cb(Math.min(delta, MAX_STEP_S), s.clock.elapsedTime);
    clearPresses();
  });
}
