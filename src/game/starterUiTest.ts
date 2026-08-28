import { endRun, getPhase, pauseRun, startRun, toMenu } from './loop';
import { snapshotStarterState } from './starterState';
import { starterStore } from './starterStore';
import { installUiTestContract, type UiTestScenario } from './uiTestContract';

function snapshot() {
  return {
    flow: getPhase(),
    game: snapshotStarterState(starterStore.getState()),
  };
}

function enterTitle() {
  starterStore.reset();
  toMenu();
}

function enterPause() {
  startRun();
  pauseRun();
}

function enterUpgrade() {
  startRun();
  starterStore.debugSetPhase('upgrade');
}

function enterResult(phase: 'won' | 'lost') {
  startRun();
  starterStore.debugSetPhase(phase);
  endRun();
}

const scenarios: readonly UiTestScenario[] = [
  {
    name: 'title',
    overlay: '[data-game-overlay="title"]',
    enter: enterTitle,
    snapshot,
    actions: [
      { name: 'start', selector: '[data-game-action="start"]' },
    ],
  },
  {
    name: 'pause',
    overlay: '[data-game-overlay="pause"]',
    enter: enterPause,
    snapshot,
    actions: [
      { name: 'resume', selector: '[data-game-action="resume"]' },
      { name: 'restart', selector: '[data-game-action="pause-restart"]' },
      { name: 'quit', selector: '[data-game-action="quit"]' },
    ],
  },
  {
    name: 'upgrade',
    overlay: '[data-game-overlay="upgrade"]',
    enter: enterUpgrade,
    snapshot,
    actions: [
      { name: 'glass-engine', selector: '[data-game-action="upgrade-glass-engine"]' },
      { name: 'wide-signal', selector: '[data-game-action="upgrade-wide-signal"]' },
    ],
  },
  {
    name: 'gameover',
    overlay: '[data-game-overlay="gameover"]',
    enter: () => enterResult('lost'),
    snapshot,
    actions: [
      { name: 'restart', selector: '[data-game-action="restart"]' },
    ],
  },
  {
    name: 'win',
    overlay: '[data-game-overlay="gameover"]',
    enter: () => enterResult('won'),
    snapshot,
    actions: [
      { name: 'restart', selector: '[data-game-action="restart"]' },
    ],
  },
];

export function installStarterUiTest(): () => void {
  return installUiTestContract(scenarios);
}
