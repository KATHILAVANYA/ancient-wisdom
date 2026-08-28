import React from 'react';
import { ERAS } from './ancientData';
import { GameState } from './ancientSimState';
import { soundEngine } from './ancientAudio';

interface StoryIntroductionProps {
  state: GameState;
  onStartBuilder: () => void;
  onOpenAdvisor: () => void;
}

export default function StoryIntroduction({
  state,
  onStartBuilder,
  onOpenAdvisor,
}: StoryIntroductionProps) {
  const era = ERAS[state.currentEraId];
  const story = era.historicalStory;
  const crisis = era.modernCrisis;

  return (
    <div className="aw-story-container">
      {/* Era Hero Banner */}
      <div className="aw-story-hero" style={{ borderColor: era.accentColor }}>
        <div className="aw-story-tags-row">
          <span className="aw-tag" style={{ borderColor: era.accentColor, color: era.accentColor }}>
            {era.location}
          </span>
          <span className="aw-tag">
            {era.timePeriod}
          </span>
        </div>

        <h2 className="aw-story-title">{era.title}</h2>
        <h3 className="aw-story-subtitle">{era.subtitle}</h3>

        <blockquote className="aw-story-quote">
          "{story.heroQuote}"
        </blockquote>
      </div>

      {/* Narrative & Archaeological Grid */}
      <div className="aw-story-grid">
        {/* Left Column: The Historical Heritage */}
        <div className="aw-story-card">
          <div className="aw-card-section-title">
            <span>🏛️</span>
            <h4>The Rediscovered Ancient Wisdom</h4>
          </div>

          <div className="aw-narrative-paragraphs">
            {story.narrativeIntro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="aw-civs-list">
            <h5>Key Civilizations & Proven Practices:</h5>
            <ul>
              {story.ancientCivilizationsMentioned.map((civ, i) => (
                <li key={i}>{civ}</li>
              ))}
            </ul>
          </div>

          <div className="aw-archaeology-box">
            <strong>Archaeological Evidence:</strong> {story.archaeologicalEvidence}
          </div>
        </div>

        {/* Right Column: The Modern 21st-Century Crisis */}
        <div className="aw-story-card crisis-theme">
          <div className="aw-card-section-title">
            <span>🚨</span>
            <h4>The 21st Century Emergency</h4>
          </div>

          <h3 className="aw-crisis-headline">{crisis.title}</h3>
          <p className="aw-crisis-description">{crisis.description}</p>
          <div className="aw-urgency-callout">
            <strong>Critical Alert:</strong> {crisis.urgencyText}
          </div>

          {/* Baseline Challenge Stats */}
          <div className="aw-baseline-matrix">
            <h5>Initial Baseline Conditions:</h5>
            <div className="aw-matrix-row">
              <span>Water Days Remaining:</span>
              <strong className="danger">{crisis.baselineMetrics.waterAvailableDays} Days</strong>
            </div>
            <div className="aw-matrix-row">
              <span>Outdoor Ambient Heat:</span>
              <strong className="warning">{crisis.baselineMetrics.ambientTempC}°C</strong>
            </div>
            <div className="aw-matrix-row">
              <span>Power Grid AC Overload:</span>
              <strong className="danger">{crisis.baselineMetrics.gridStressPct}%</strong>
            </div>
            <div className="aw-matrix-row">
              <span>Soil Degradation:</span>
              <strong className="danger">{crisis.baselineMetrics.soilDegradationPct}%</strong>
            </div>
            <div className="aw-matrix-row">
              <span>Treasury Budget Allocated:</span>
              <strong className="gold">{crisis.budget} Gold</strong>
            </div>
          </div>

          {/* Action Call */}
          <div className="aw-story-action-row">
            <button
              className="aw-btn-primary"
              style={{ backgroundColor: era.accentColor }}
              onClick={() => {
                soundEngine.playUiClick();
                onStartBuilder();
              }}
            >
              🛠️ Enter 3D Strategy Builder & Solve Crisis
            </button>
            <button
              className="aw-btn-secondary"
              onClick={() => {
                soundEngine.playUiClick();
                onOpenAdvisor();
              }}
            >
              🧠 Consult Ancient Advisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
