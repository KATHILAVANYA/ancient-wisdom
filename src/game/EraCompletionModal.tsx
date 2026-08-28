import React from 'react';
import { ERAS } from './ancientData';
import { GameState, EraSimulationResult } from './ancientSimState';
import { soundEngine } from './ancientAudio';

interface EraCompletionModalProps {
  state: GameState;
  simulationResult: EraSimulationResult;
  onNextEra: () => void;
  onRetry: () => void;
  onOpenCodex: () => void;
}

// 7-Axis SVG Radar Chart Component
function SustainabilityRadarChart({ scores }: { scores: EraSimulationResult['radarScores'] }) {
  const axes = [
    { label: 'Water Security', val: scores.waterSecurity },
    { label: 'Thermal Comfort', val: scores.thermalComfort },
    { label: 'Food & Soil', val: scores.foodSoilHealth },
    { label: 'Carbon Offset', val: scores.carbonOffset },
    { label: 'Community', val: scores.communityWellbeing },
    { label: 'Cost Efficiency', val: scores.costEfficiency },
    { label: 'Resilience', val: scores.climateResilience },
  ];

  const size = 260;
  const center = size / 2;
  const radius = 95;
  const count = axes.length;

  const getCoordinates = (index: number, valuePct: number) => {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const r = (valuePct / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.val);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="aw-radar-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background concentric reference rings */}
        {[25, 50, 75, 100].map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 100) * radius}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray={level === 100 ? 'none' : '3 3'}
          />
        ))}

        {/* Axis spoke lines */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#475569"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(56, 189, 248, 0.35)"
          stroke="#38bdf8"
          strokeWidth="2.5"
        />

        {/* Axis data points and labels */}
        {axes.map((axis, i) => {
          const pt = getCoordinates(i, axis.val);
          const labelPt = getCoordinates(i, 118);
          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#cbd5e1"
                fontSize="9"
                fontWeight="600"
              >
                {axis.label} ({axis.val}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function EraCompletionModal({
  state,
  simulationResult,
  onNextEra,
  onRetry,
  onOpenCodex,
}: EraCompletionModalProps) {
  const era = ERAS[state.currentEraId];
  const isPassed = simulationResult.passedSuccessCriteria;
  const isFinal2050 = state.currentEraId === 'final2050';

  return (
    <div className="aw-completion-container">
      <div className="aw-completion-card" style={{ borderColor: isPassed ? '#10b981' : '#f59e0b' }}>
        {/* Header Ribbon */}
        <div className="aw-completion-header">
          <div className="aw-completion-badge">
            {isPassed ? (isFinal2050 ? '🏆 GLOBAL RESILIENCE MASTERED' : '🎉 CRISIS RESOLVED') : '⚠️ TARGET DEFICIT'}
          </div>
          <h2 className="aw-completion-title">
            {isPassed
              ? `${era.title} — Victory!`
              : `${era.title} — Sustainability Evaluation`}
          </h2>
          <p className="aw-completion-subtitle">
            {isPassed
              ? `Ancient engineering principles successfully reversed the modern crisis over the ${era.modernCrisis.targetSurvivalDays}-day simulation horizon.`
              : `Your sustainability score (${simulationResult.overallSustainabilityScore}%) did not meet the ${era.modernCrisis.successGoals.minSustainabilityScore}% passing threshold.`}
          </p>
        </div>

        {/* Core Results Content Grid */}
        <div className="aw-completion-grid">
          {/* Radar Chart Visual */}
          <div className="aw-completion-radar-box">
            <h4>7-Axis Sustainability Radar</h4>
            <SustainabilityRadarChart scores={simulationResult.radarScores} />
            <div className="aw-overall-score-tag">
              Overall Score: <strong>{simulationResult.overallSustainabilityScore}%</strong>
            </div>
          </div>

          {/* Detailed Outcomes Matrix */}
          <div className="aw-completion-stats-box">
            <h4>Quantitative Outcomes</h4>
            <div className="aw-outcomes-table">
              <div className="aw-outcome-row">
                <span>💧 Usable Water Reserve:</span>
                <strong className={simulationResult.waterDaysAvailable >= 365 ? 'good' : 'neutral'}>
                  {simulationResult.waterDaysAvailable} Days (365+ target)
                </strong>
              </div>
              <div className="aw-outcome-row">
                <span>🌡️ Indoor Heat Reduction:</span>
                <strong className="good">
                  -{simulationResult.temperatureReductionC}°C (Interior: {simulationResult.indoorTempCelsius}°C)
                </strong>
              </div>
              <div className="aw-outcome-row">
                <span>⚡ Power Grid Relief:</span>
                <strong className="good">
                  {simulationResult.gridPowerSavedMW} MW saved ({simulationResult.gridStressPct}% load)
                </strong>
              </div>
              <div className="aw-outcome-row">
                <span>🌱 Soil Organic Matter:</span>
                <strong className={simulationResult.soilOrganicMatterPct >= 4.0 ? 'good' : 'neutral'}>
                  {simulationResult.soilOrganicMatterPct}% Humus (Base: 0.4%)
                </strong>
              </div>
              <div className="aw-outcome-row">
                <span>🌿 Annual Food Yield:</span>
                <strong className="good">
                  +{simulationResult.foodYieldTonsPerYr} Tons/yr
                </strong>
              </div>
              <div className="aw-outcome-row">
                <span>🌍 Carbon Sequestration:</span>
                <strong className="good">
                  +{simulationResult.carbonOffsetTonsPerYr} Tons CO₂e/yr
                </strong>
              </div>
              <div className="aw-outcome-row">
                <span>🪙 Budget Remaining:</span>
                <strong className={simulationResult.remainingBudgetGold >= 0 ? 'good' : 'bad'}>
                  {simulationResult.remainingBudgetGold} Gold / {era.modernCrisis.budget} Max
                </strong>
              </div>
            </div>

            {/* Active Synergies Summary */}
            {simulationResult.activeSynergies.length > 0 && (
              <div className="aw-completion-synergies">
                <h5>✨ Synergies Activated:</h5>
                {simulationResult.activeSynergies.map((syn) => (
                  <div key={syn.id} className="aw-syn-item">
                    <strong>{syn.name}:</strong> {syn.historicalLesson}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Historical Certificate of Mastery */}
        {isPassed && (
          <div className="aw-certificate-box">
            <div className="aw-cert-icon">📜</div>
            <div>
              <h5>CERTIFICATE OF ANCIENT ENGINEERING MASTERY</h5>
              <p>
                You have demonstrated that the solutions to humanity's most daunting 21st-century ecological crises have already been discovered, refined, and proven across thousands of years of civilizational heritage.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="aw-completion-actions">
          {isPassed ? (
            !isFinal2050 ? (
              <button
                className="aw-btn-primary"
                onClick={() => {
                  soundEngine.playEraVictory();
                  onNextEra();
                }}
              >
                🚀 Unlock Next Era & Continue Journey
              </button>
            ) : (
              <button
                className="aw-btn-primary gold"
                onClick={() => {
                  soundEngine.playEraVictory();
                  onNextEra();
                }}
              >
                👑 Master of Civilization 2050 — View Grand Summary
              </button>
            )
          ) : (
            <button
              className="aw-btn-primary"
              onClick={() => {
                soundEngine.playUiClick();
                onRetry();
              }}
            >
              🔄 Adjust Strategy & Retry Simulation
            </button>
          )}

          <button
            className="aw-btn-secondary"
            onClick={() => {
              soundEngine.playUiClick();
              onOpenCodex();
            }}
          >
            📚 Review Archaeological Codex
          </button>
        </div>
      </div>
    </div>
  );
}
