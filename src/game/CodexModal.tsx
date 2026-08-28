import React, { useState } from 'react';
import { ERAS, AncientIntervention } from './ancientData';
import { soundEngine } from './ancientAudio';

export default function CodexModal() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'water' | 'cooling' | 'soil' | 'hybrid'>('all');
  const [selectedIntervention, setSelectedIntervention] = useState<AncientIntervention | null>(null);

  // Gather all interventions across all eras
  const allInterventions = Object.values(ERAS).flatMap((era) => era.interventions);

  const filteredInterventions = selectedCategory === 'all'
    ? allInterventions
    : allInterventions.filter((i) => i.category === selectedCategory);

  const activeItem = selectedIntervention || filteredInterventions[0];

  return (
    <div className="aw-codex-container">
      {/* Codex Header */}
      <div className="aw-codex-header">
        <div>
          <span className="aw-tag">ARCHAEOLOGICAL & ENGINEERING REPOSITORY</span>
          <h2 className="aw-codex-title">The Grand Codex of Ancient Wisdom</h2>
          <p className="aw-codex-subtitle">
            Peer-reviewed historical sources, empirical physics, and time-tested sustainable civilizational infrastructure.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="aw-filter-row">
          {[
            { id: 'all', label: 'All Disciplines' },
            { id: 'water', label: '💧 Water Engineering' },
            { id: 'cooling', label: '🏛️ Passive Architecture' },
            { id: 'soil', label: '🌱 Regenerative Agriculture' },
            { id: 'hybrid', label: '⚡ 2050 Solarpunk' },
          ].map((cat) => (
            <button
              key={cat.id}
              className={`aw-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playUiClick();
                setSelectedCategory(cat.id as any);
                setSelectedIntervention(null);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="aw-codex-layout">
        {/* Left Sidebar List */}
        <div className="aw-codex-list">
          {filteredInterventions.map((item) => {
            const isSelected = activeItem?.id === item.id;
            return (
              <div
                key={item.id}
                className={`aw-codex-list-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  soundEngine.playUiClick();
                  setSelectedIntervention(item);
                }}
              >
                <div className="aw-list-top">
                  <span className="aw-list-civ">{item.civilization}</span>
                  <span className="aw-list-cat">{item.category.toUpperCase()}</span>
                </div>
                <h4 className="aw-list-name">{item.name}</h4>
                <p className="aw-list-sub">{item.tagline}</p>
              </div>
            );
          })}
        </div>

        {/* Right Article Deep-Dive */}
        {activeItem && (
          <div className="aw-codex-detail">
            <div className="aw-detail-card">
              <div className="aw-detail-header">
                <span className="aw-tag">{activeItem.civilization}</span>
                <h3 className="aw-detail-title">{activeItem.name}</h3>
                <p className="aw-detail-tagline">{activeItem.tagline}</p>
              </div>

              <div className="aw-detail-body">
                <section className="aw-detail-section">
                  <h4>🏛️ Historical Context & Origins</h4>
                  <p>{activeItem.historicalOrigins}</p>
                </section>

                <section className="aw-detail-section">
                  <h4>📐 Engineering Principle & Physical Mechanism</h4>
                  <p>{activeItem.description}</p>
                </section>

                <section className="aw-detail-section verified-box">
                  <h4>🔬 Verified Peer-Reviewed Scientific Source</h4>
                  <div className="aw-source-card">
                    <div className="aw-source-title">{activeItem.verifiedSource.title}</div>
                    <div className="aw-source-meta">
                      <strong>Author / Institution:</strong> {activeItem.verifiedSource.authorOrOrg} • {activeItem.verifiedSource.publication} ({activeItem.verifiedSource.yearOrEra})
                    </div>
                    <div className="aw-source-fact">
                      <strong>Measured Empirical Data:</strong> {activeItem.verifiedSource.verifiedFact}
                    </div>
                  </div>
                </section>

                <section className="aw-detail-section">
                  <h4>📊 Quantitative Sustainable Performance</h4>
                  <div className="aw-stats-grid">
                    {activeItem.waterYieldLitersPerDay > 0 && (
                      <div className="aw-stat-box">
                        <span className="label">Daily Water Capture</span>
                        <span className="value">+{activeItem.waterYieldLitersPerDay.toLocaleString()} L/day</span>
                      </div>
                    )}
                    {activeItem.tempReductionCelsius > 0 && (
                      <div className="aw-stat-box">
                        <span className="label">Zero-Power Cooling</span>
                        <span className="value">-{activeItem.tempReductionCelsius}°C Temp</span>
                      </div>
                    )}
                    {activeItem.foodYieldTonsPerYr > 0 && (
                      <div className="aw-stat-box">
                        <span className="label">Annual Food Yield</span>
                        <span className="value">+{activeItem.foodYieldTonsPerYr} Tons/yr</span>
                      </div>
                    )}
                    {activeItem.soilOrganicMatterPct > 0 && (
                      <div className="aw-stat-box">
                        <span className="label">Soil Organic Matter</span>
                        <span className="value">+{activeItem.soilOrganicMatterPct}% Humus</span>
                      </div>
                    )}
                    <div className="aw-stat-box">
                      <span className="label">Carbon Sequestration</span>
                      <span className="value">+{activeItem.carbonOffsetTonsPerYr} t CO₂/yr</span>
                    </div>
                    <div className="aw-stat-box">
                      <span className="label">Climate Shock Resilience</span>
                      <span className="value">+{activeItem.resilienceIndex} Index</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
