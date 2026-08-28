import React, { useState } from 'react';
import { ERAS, AncientIntervention } from './ancientData';
import { GameState, PlacedIntervention } from './ancientSimState';
import { soundEngine } from './ancientAudio';

interface StrategyDeckProps {
  state: GameState;
  onSelectIntervention: (id: string) => void;
  onOpenCodexForIntervention?: (item: AncientIntervention) => void;
}

export default function StrategyDeck({
  state,
  onSelectIntervention,
  onOpenCodexForIntervention,
}: StrategyDeckProps) {
  const era = ERAS[state.currentEraId];
  const placed = state.placedByEra[state.currentEraId] || [];
  const [inspectedItem, setInspectedItem] = useState<AncientIntervention | null>(null);

  return (
    <div className="aw-strategy-deck">
      <div className="aw-deck-header">
        <div>
          <h4 className="aw-deck-title">Ancient Engineering Blueprints</h4>
          <span className="aw-deck-subtitle">Select an intervention, then click any grid tile on the 3D diorama</span>
        </div>
        <div className="aw-deck-count">
          Placed: <strong>{placed.length}</strong> structures
        </div>
      </div>

      <div className="aw-cards-scroll">
        {era.interventions.map((item) => {
          const isSelected = state.selectedInterventionId === item.id;
          const countPlaced = placed.filter((p) => p.interventionId === item.id).length;

          return (
            <div
              key={item.id}
              className={`aw-blueprint-card ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                soundEngine.playUiClick();
                onSelectIntervention(item.id);
              }}
            >
              <div className="aw-card-top">
                <span className="aw-card-civ">{item.civilization}</span>
                <span className="aw-card-cost">{item.costGold} Gold</span>
              </div>

              <h5 className="aw-card-name">{item.name}</h5>
              <p className="aw-card-tagline">{item.tagline}</p>

              {/* Impact Badges */}
              <div className="aw-card-stats-row">
                {item.waterYieldLitersPerDay > 0 && (
                  <span className="aw-stat-pill water">
                    💧 +{(item.waterYieldLitersPerDay / 1000).toFixed(0)}k L/d
                  </span>
                )}
                {item.tempReductionCelsius > 0 && (
                  <span className="aw-stat-pill temp">
                    🌡️ -{item.tempReductionCelsius}°C
                  </span>
                )}
                {item.foodYieldTonsPerYr > 0 && (
                  <span className="aw-stat-pill food">
                    🌽 +{item.foodYieldTonsPerYr} t/yr
                  </span>
                )}
                {item.soilOrganicMatterPct > 0 && (
                  <span className="aw-stat-pill soil">
                    🌱 +{item.soilOrganicMatterPct}% Humus
                  </span>
                )}
                {item.resilienceIndex > 0 && (
                  <span className="aw-stat-pill res">
                    🛡️ +{item.resilienceIndex} Res
                  </span>
                )}
              </div>

              <div className="aw-card-footer">
                <span className="aw-placed-count">
                  {countPlaced > 0 ? `Active: ${countPlaced} deployed` : 'Not deployed'}
                </span>
                <button
                  className="aw-card-info-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playUiClick();
                    setInspectedItem(item);
                  }}
                  title="View archaeological source & verified physics"
                >
                  📜 Evidence
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspected Intervention Modal */}
      {inspectedItem && (
        <div className="aw-modal-backdrop" onClick={() => setInspectedItem(null)}>
          <div className="aw-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="aw-modal-header">
              <div>
                <span className="aw-tag">{inspectedItem.civilization}</span>
                <h3>{inspectedItem.name}</h3>
              </div>
              <button className="aw-close-btn" onClick={() => setInspectedItem(null)}>✕</button>
            </div>

            <div className="aw-modal-body">
              <div className="aw-modal-section">
                <h4>🏛️ Historical Origins & Engineering</h4>
                <p>{inspectedItem.historicalOrigins}</p>
              </div>

              <div className="aw-modal-section">
                <h4>📐 Working Principle & Physics</h4>
                <p>{inspectedItem.description}</p>
              </div>

              <div className="aw-modal-section verified-box">
                <h4>📚 Verified Archaeological & Scientific Source</h4>
                <div className="aw-source-card">
                  <div className="aw-source-title">{inspectedItem.verifiedSource.title}</div>
                  <div className="aw-source-meta">
                    {inspectedItem.verifiedSource.authorOrOrg} • {inspectedItem.verifiedSource.publication} ({inspectedItem.verifiedSource.yearOrEra})
                  </div>
                  <div className="aw-source-fact">
                    <strong>Empirical Evidence:</strong> {inspectedItem.verifiedSource.verifiedFact}
                  </div>
                </div>
              </div>

              <div className="aw-modal-metrics-table">
                <div className="aw-metric-row">
                  <span>Upfront Cost:</span>
                  <strong>{inspectedItem.costGold} Gold</strong>
                </div>
                <div className="aw-metric-row">
                  <span>Construction Duration:</span>
                  <strong>{inspectedItem.constructionDays} Days</strong>
                </div>
                <div className="aw-metric-row">
                  <span>Annual Maintenance:</span>
                  <strong>{inspectedItem.maintenanceAnnual} Gold/yr</strong>
                </div>
                <div className="aw-metric-row">
                  <span>Carbon Offset:</span>
                  <strong>+{inspectedItem.carbonOffsetTonsPerYr} Tons CO₂e/yr</strong>
                </div>
              </div>
            </div>

            <div className="aw-modal-footer">
              <button
                className="aw-btn-primary"
                onClick={() => {
                  onSelectIntervention(inspectedItem.id);
                  setInspectedItem(null);
                }}
              >
                Select This Blueprint to Place
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
