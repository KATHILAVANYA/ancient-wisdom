import React from 'react';
import { ERAS } from './ancientData';
import { GameState, EraSimulationResult } from './ancientSimState';
import { soundEngine } from './ancientAudio';

interface ModernCrisisPanelProps {
  state: GameState;
  simulationResult: EraSimulationResult;
  onStartSim: () => void;
  onPauseSim: () => void;
  onSetSpeed: (speed: number) => void;
  onOpenAdvisor: () => void;
  onOpenCodex: () => void;
  onClearPlaced: () => void;
}

export default function ModernCrisisPanel({
  state,
  simulationResult,
  onStartSim,
  onPauseSim,
  onSetSpeed,
  onOpenAdvisor,
  onOpenCodex,
  onClearPlaced,
}: ModernCrisisPanelProps) {
  const era = ERAS[state.currentEraId];
  const crisis = era.modernCrisis;
  const targetDays = crisis.targetSurvivalDays;
  const progressPct = Math.min(100, Math.round((state.simulationDay / targetDays) * 100));

  return (
    <div className="aw-crisis-panel">
      {/* Top Banner: Crisis Objective */}
      <div className="aw-crisis-header">
        <div className="aw-crisis-tag">
          <span className="aw-pulse-dot" />
          <span>CURRENT CRISIS</span>
        </div>
        <h3 className="aw-crisis-title">{crisis.title}</h3>
        <p className="aw-crisis-desc">{crisis.urgencyText}</p>
      </div>

      {/* Target Goal Progress */}
      <div className="aw-goal-box">
        <div className="aw-goal-top">
          <span className="aw-goal-label">Objective Target</span>
          <span className="aw-goal-val">
            Score: <strong>{simulationResult.overallSustainabilityScore}%</strong> / {crisis.successGoals.minSustainabilityScore}%
          </span>
        </div>
        <div className="aw-progress-track">
          <div
            className="aw-progress-fill"
            style={{
              width: `${Math.min(100, (simulationResult.overallSustainabilityScore / crisis.successGoals.minSustainabilityScore) * 100)}%`,
              backgroundColor: simulationResult.passedSuccessCriteria ? '#10b981' : era.accentColor,
            }}
          />
        </div>
        <div className="aw-goal-sub">{crisis.successGoals.keyMilestoneLabel}</div>
      </div>

      {/* Key Telemetry Metrics Matrix */}
      <div className="aw-metrics-grid">
        <div className="aw-metric-card">
          <div className="aw-metric-icon">💧</div>
          <div className="aw-metric-info">
            <span className="aw-metric-label">Water Reserve</span>
            <span className="aw-metric-val" style={{ color: simulationResult.waterDaysAvailable >= 365 ? '#10b981' : '#38bdf8' }}>
              {simulationResult.waterDaysAvailable} Days
            </span>
          </div>
        </div>

        <div className="aw-metric-card">
          <div className="aw-metric-icon">🌡️</div>
          <div className="aw-metric-info">
            <span className="aw-metric-label">Indoor Temp</span>
            <span className="aw-metric-val" style={{ color: simulationResult.indoorTempCelsius <= 28 ? '#10b981' : '#f59e0b' }}>
              {simulationResult.indoorTempCelsius}°C (-{simulationResult.temperatureReductionC}°C)
            </span>
          </div>
        </div>

        <div className="aw-metric-card">
          <div className="aw-metric-icon">⚡</div>
          <div className="aw-metric-info">
            <span className="aw-metric-label">Grid AC Stress</span>
            <span className="aw-metric-val" style={{ color: simulationResult.gridStressPct <= 40 ? '#10b981' : '#ef4444' }}>
              {simulationResult.gridStressPct}%
            </span>
          </div>
        </div>

        <div className="aw-metric-card">
          <div className="aw-metric-icon">🌱</div>
          <div className="aw-metric-info">
            <span className="aw-metric-label">Soil Carbon</span>
            <span className="aw-metric-val" style={{ color: simulationResult.soilOrganicMatterPct >= 4.0 ? '#10b981' : '#10b981' }}>
              {simulationResult.soilOrganicMatterPct}% Humus
            </span>
          </div>
        </div>

        <div className="aw-metric-card">
          <div className="aw-metric-icon">🛡️</div>
          <div className="aw-metric-info">
            <span className="aw-metric-label">Resilience Index</span>
            <span className="aw-metric-val" style={{ color: '#a855f7' }}>
              {simulationResult.resilienceRating} / 100
            </span>
          </div>
        </div>

        <div className="aw-metric-card">
          <div className="aw-metric-icon">🪙</div>
          <div className="aw-metric-info">
            <span className="aw-metric-label">Treasury Budget</span>
            <span className="aw-metric-val" style={{ color: simulationResult.remainingBudgetGold < 0 ? '#ef4444' : '#eab308' }}>
              {simulationResult.remainingBudgetGold} Gold
            </span>
          </div>
        </div>
      </div>

      {/* Active Synergies Notification Box */}
      {simulationResult.activeSynergies.length > 0 && (
        <div className="aw-synergies-section">
          <div className="aw-synergy-title">✨ ACTIVE ANCIENT SYNERGIES ({simulationResult.activeSynergies.length})</div>
          {simulationResult.activeSynergies.map((syn) => (
            <div key={syn.id} className="aw-synergy-pill">
              <span className="aw-synergy-badge">Combo</span>
              <div>
                <strong>{syn.name}</strong>
                <p>{syn.bonusDescription}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simulation Progress & Run Controls */}
      <div className="aw-sim-controls-box">
        <div className="aw-sim-status-row">
          <span>Simulation Horizon: <strong>Day {Math.round(state.simulationDay)} / {targetDays}</strong></span>
          <div className="aw-speed-group">
            {[1, 2, 3].map((spd) => (
              <button
                key={spd}
                className={`aw-speed-btn ${state.simSpeed === spd ? 'active' : ''}`}
                onClick={() => onSetSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="aw-sim-bar-bg">
          <div className="aw-sim-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="aw-sim-btn-row">
          {!state.isSimulating ? (
            <button
              className="aw-btn-primary"
              onClick={() => {
                soundEngine.playUiClick();
                onStartSim();
              }}
            >
              ▶ Run {targetDays}-Day Simulation
            </button>
          ) : (
            <button
              className="aw-btn-secondary"
              onClick={() => {
                soundEngine.playUiClick();
                onPauseSim();
              }}
            >
              ⏸ Pause Simulation
            </button>
          )}

          <button
            className="aw-btn-ghost"
            onClick={onClearPlaced}
            title="Clear all placed structures in this era"
          >
            Clear Board
          </button>
        </div>
      </div>
    </div>
  );
}
