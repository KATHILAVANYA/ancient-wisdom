/**
 * Development-only browser contract for interactive overlays.
 *
 * Games describe how to enter a modal and where its real controls live. The
 * central runner performs hit-testing, dispatches real pointer events, compares
 * authoritative snapshots, and owns the verdict; game code never reports pass.
 */

export type UiSnapshotExpectation = 'changed' | 'unchanged';
export type UiOverlayExpectation = 'dismissed' | 'visible';
export type UiPointerLockExpectation = 'forbid' | 'allow';

export interface UiTestAction {
  name: string;
  selector: string;
  snapshot?: UiSnapshotExpectation;
  overlay?: UiOverlayExpectation;
  pointerLock?: UiPointerLockExpectation;
}

export interface UiTestScenario {
  name: string;
  overlay: string;
  actions: readonly UiTestAction[];
  /** Put the authoritative game state directly into this modal state. */
  enter: () => void | Promise<void>;
  /** Re-establish a clean modal state before each action. Defaults to enter. */
  reset?: () => void | Promise<void>;
  /** Return domain + flow state, not DOM state or a game-authored verdict. */
  snapshot: () => unknown;
  /** Override the runner's practical default when a scenario needs more churn. */
  repeat?: number;
}

export interface UiTestScenarioDescription {
  name: string;
  overlay: string;
  actions: readonly UiTestAction[];
  repeat?: number;
}

export interface AgonUiTestContract {
  version: 1;
  scenarios: () => readonly UiTestScenarioDescription[];
  enter: (name: string) => Promise<void>;
  reset: (name: string) => Promise<void>;
  snapshot: (name: string) => unknown;
}

function serialized(value: unknown): unknown {
  const json = JSON.stringify(value);
  if (json === undefined) throw new Error('UI test snapshots must be JSON-serializable');
  return JSON.parse(json);
}

export function installUiTestContract(scenarios: readonly UiTestScenario[]): () => void {
  if (!import.meta.env.DEV) return () => {};

  const byName = new Map<string, UiTestScenario>();
  for (const scenario of scenarios) {
    if (byName.has(scenario.name)) throw new Error(`Duplicate UI test scenario: ${scenario.name}`);
    if (!scenario.actions.length) throw new Error(`UI test scenario has no actions: ${scenario.name}`);
    byName.set(scenario.name, scenario);
  }

  const get = (name: string): UiTestScenario => {
    const scenario = byName.get(name);
    if (!scenario) throw new Error(`Unknown UI test scenario: ${name}`);
    return scenario;
  };
  const contract: AgonUiTestContract = {
    version: 1,
    scenarios: () =>
      scenarios.map(({ name, overlay, actions, repeat }) => ({
        name,
        overlay,
        actions: actions.map((action) => ({ ...action })),
        ...(repeat === undefined ? {} : { repeat }),
      })),
    enter: async (name) => {
      await get(name).enter();
    },
    reset: async (name) => {
      const scenario = get(name);
      await (scenario.reset ?? scenario.enter)();
    },
    snapshot: (name) => serialized(get(name).snapshot()),
  };

  const target = window as Window & { __agon_ui_test?: AgonUiTestContract };
  target.__agon_ui_test = contract;
  return () => {
    if (target.__agon_ui_test === contract) delete target.__agon_ui_test;
  };
}
