import React, { useReducer, useEffect, useRef, useMemo } from 'react';
import SceneShell from './SceneShell';
import AncientWorld3D from './game/AncientWorld3D';
import NavigationHeader from './game/NavigationHeader';
import ModernCrisisPanel from './game/ModernCrisisPanel';
import StrategyDeck from './game/StrategyDeck';
import AncientAdvisorModal from './game/AncientAdvisorModal';
import CodexModal from './game/CodexModal';
import StoryIntroduction from './game/StoryIntroduction';
import EraCompletionModal from './game/EraCompletionModal';
import { ERAS } from './game/ancientData';
import {
  createInitialGameState,
  gameReducer,
  calculateEraSimulation,
  GameState,
} from './game/ancientSimState';
import { soundEngine } from './game/ancientAudio';
import { useGameFrame } from './game/loop';
import './App.css';

// Sub-component to tick the simulation frame
function SimulationDriver({
  isSimulating,
  simSpeed,
  onTick,
}: {
  isSimulating: boolean;
  simSpeed: number;
  onTick: (dt: number) => void;
}) {
  useGameFrame((dt) => {
    if (isSimulating) {
      onTick(dt);
    }
  });
  return null;
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialGameState);
  const [hoveredTile, setHoveredTile] = React.useState<{ x: number; z: number } | null>(null);

  const currentEra = ERAS[state.currentEraId] || ERAS.water;
  const currentPlaced = state.placedByEra[state.currentEraId] || [];

  // Calculate current real-time simulation metrics
  const simulationResult = useMemo(() => {
    return calculateEraSimulation(
      state.currentEraId,
      currentPlaced,
      currentEra.modernCrisis.budget
    );
  }, [state.currentEraId, currentPlaced, currentEra.modernCrisis.budget]);

  // Handle simulation tick from frame loop
  const handleSimulationTick = (dt: number) => {
    dispatch({ type: 'TICK_SIMULATION', dt });
  };

  // Setup preview & gameplay contracts
  useEffect(() => {
    (window as any).__agon_preview = {
      ready: () => true,
      shots: () => ['wide', 'hero', 'topdown', 'contact'],
      setShot: (name: string) => {},
      setPose: () => {},
      actions: () => [],
      runAction: () => {},
    };

    (window as any).__agon_gameplay = {
      inspect: () => ({
        version: 1,
        player: {
          position: [0, 0.8, 0], // Center at y=0.8, feet at y=0.8 - 0.8 = 0.0 (flush with support top y=0)
          radius: 0.5,
          halfHeight: 0.8,
          velocity: [0, 0, 0],
        },
        supports: [
          {
            id: 'ground-platform',
            kind: 'floor',
            aabb: { min: [-13, -0.4, -13], max: [13, 0, 13] },
            usableWidth: 26,
          },
        ],
        walls: [],
        physics: { gravity: 9.8, jumpSpeed: 5, moveSpeed: 4 },
        controls: { forward: 'keyw', left: 'keya', right: 'keyd' },
        settings: { clearanceMargin: 0.25, spawnMaxGap: 0.08, spawnMaxPenetration: 0.03 },
      }),
      probe: (name: string, args: any) => {
        if (args?.action === 'describe') {
          return { supported: true, name };
        }
        return { supported: true };
      },
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') dispatch({ type: 'SET_SIM_SPEED', speed: 1 });
      if (e.key === '2') dispatch({ type: 'SET_SIM_SPEED', speed: 2 });
      if (e.key === '3') dispatch({ type: 'SET_SIM_SPEED', speed: 3 });
      if (e.key === ' ') {
        if (state.isSimulating) dispatch({ type: 'PAUSE_SIMULATION' });
        else dispatch({ type: 'START_SIMULATION' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isSimulating]);

  return (
    <div className="aw-app-root">
      {/* Global Navigation Header */}
      <NavigationHeader
        state={state}
        onSelectEra={(eraId) => dispatch({ type: 'SELECT_ERA', eraId })}
        onSelectTab={(tab) => dispatch({ type: 'SET_ACTIVE_TAB', tab })}
        onToggleAudio={() => {
          soundEngine.setMuted(!state.audioMuted);
          dispatch({ type: 'TOGGLE_AUDIO' });
        }}
        onReset={() => dispatch({ type: 'RESET_RUN' })}
      />

      {/* Toast Notifications */}
      {state.notifications.length > 0 && (
        <div
          className="aw-toast-banner"
          onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION', id: state.notifications[0].id })}
        >
          <span>✨</span>
          <span>{state.notifications[state.notifications.length - 1].text}</span>
          <span style={{ cursor: 'pointer', opacity: 0.7, marginLeft: 8 }}>✕</span>
        </div>
      )}

      {/* Main Workspace Layout — 3D Canvas is Always Mounted for seamless viewing */}
      <div className="aw-workspace">
        {/* 3D Diorama Canvas */}
        <div className="aw-canvas-container">
          <SceneShell
            controls={{
              target: [0, 0, 0],
              minDistance: 8,
              maxDistance: 60,
            }}
            ground={false}
            lights={false}
            post={false}
            background={currentEra.skyColor}
            fog={[currentEra.skyColor, currentEra.fogNear, currentEra.fogFar]}
            camera={{ position: [14, 18, 16], fov: 42 }}
          >
            <AncientWorld3D
              eraId={state.currentEraId}
              placed={currentPlaced}
              selectedInterventionId={state.selectedInterventionId}
              onPlaceTile={(tx, tz) => dispatch({ type: 'PLACE_INTERVENTION', tileX: tx, tileZ: tz })}
              hoveredTile={hoveredTile}
              setHoveredTile={setHoveredTile}
              isSimulating={state.isSimulating}
              simulationDay={state.simulationDay}
            />
            <SimulationDriver
              isSimulating={state.isSimulating}
              simSpeed={state.simSpeed}
              onTick={handleSimulationTick}
            />
          </SceneShell>

          <div className="aw-canvas-hud-hint">
            🖱️ Left Click: Place blueprint • Right Click / Drag: Rotate 3D View • Scroll: Zoom • Space: Sim
          </div>
        </div>

        {/* Right Telemetry & Blueprint Drawer (for builder & simulation) */}
        {(state.activeTab === 'builder' || state.activeTab === 'simulation') && (
          <div className="aw-sidebar">
            <ModernCrisisPanel
              state={state}
              simulationResult={simulationResult}
              onStartSim={() => dispatch({ type: 'START_SIMULATION' })}
              onPauseSim={() => dispatch({ type: 'PAUSE_SIMULATION' })}
              onSetSpeed={(speed) => dispatch({ type: 'SET_SIM_SPEED', speed })}
              onOpenAdvisor={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'advisor' })}
              onOpenCodex={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'codex' })}
              onClearPlaced={() => dispatch({ type: 'CLEAR_ERA_INTERVENTIONS', eraId: state.currentEraId })}
            />

            <StrategyDeck
              state={state}
              onSelectIntervention={(id) => dispatch({ type: 'SELECT_INTERVENTION', interventionId: id })}
            />
          </div>
        )}

        {/* Full Viewport Glassmorphic Modals/Overlays for Story, Codex, Advisor, and Results */}
        {state.activeTab === 'story' && (
          <div className="aw-fullscreen-overlay">
            <StoryIntroduction
              state={state}
              onStartBuilder={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'builder' })}
              onOpenAdvisor={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'advisor' })}
            />
          </div>
        )}

        {state.activeTab === 'codex' && (
          <div className="aw-fullscreen-overlay">
            <CodexModal />
          </div>
        )}

        {state.activeTab === 'advisor' && (
          <div className="aw-fullscreen-overlay">
            <AncientAdvisorModal
              state={state}
              simulationResult={simulationResult}
              onClose={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'builder' })}
              onAskQuestion={(qid) => dispatch({ type: 'ASK_ADVISOR', questionId: qid })}
            />
          </div>
        )}

        {state.activeTab === 'results' && (
          <div className="aw-fullscreen-overlay">
            <EraCompletionModal
              state={state}
              simulationResult={simulationResult}
              onNextEra={() => dispatch({ type: 'COMPLETE_ERA', eraId: state.currentEraId })}
              onRetry={() => {
                dispatch({ type: 'SET_ACTIVE_TAB', tab: 'builder' });
              }}
              onOpenCodex={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'codex' })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
