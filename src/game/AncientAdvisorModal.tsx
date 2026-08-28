import React, { useState } from 'react';
import { ERAS, ADVISOR_QUESTIONS, AdvisorQuestion } from './ancientData';
import { GameState, EraSimulationResult } from './ancientSimState';
import { soundEngine } from './ancientAudio';

interface AncientAdvisorModalProps {
  state: GameState;
  simulationResult: EraSimulationResult;
  onClose: () => void;
  onAskQuestion: (questionId: string) => void;
}

export default function AncientAdvisorModal({
  state,
  simulationResult,
  onClose,
  onAskQuestion,
}: AncientAdvisorModalProps) {
  const era = ERAS[state.currentEraId];
  const eraQuestions = ADVISOR_QUESTIONS.filter(
    (q) => q.eraId === state.currentEraId || q.eraId === 'general'
  );

  const [activeQuestion, setActiveQuestion] = useState<AdvisorQuestion | null>(
    eraQuestions[0] || null
  );

  // Dynamic contextual advice based on player's current build
  const getContextualAdvice = () => {
    const placed = state.placedByEra[state.currentEraId] || [];
    if (placed.length === 0) {
      return era.advisorTips.welcome;
    }
    if (simulationResult.activeSynergies.length > 0) {
      return `${era.advisorTips.synergySuccess} Current Sustainability: ${simulationResult.overallSustainabilityScore}%.`;
    }
    if (simulationResult.remainingBudgetGold < 200) {
      return `${era.advisorTips.warningHighCost} Consider balancing with lower-cost interventions like Johads or Zaï pits.`;
    }
    return `${era.advisorTips.hint1} ${era.advisorTips.hint2}`;
  };

  return (
    <div className="aw-advisor-container">
      {/* Advisor Persona Card */}
      <div className="aw-advisor-hero">
        <div className="aw-advisor-avatar-box">
          <img
            src="/advisor_avatar.png"
            alt="Ancient Advisor"
            className="aw-advisor-avatar-img"
            onError={(e) => {
              // Fallback avatar icon
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="aw-advisor-glow" style={{ backgroundColor: era.accentColor }} />
        </div>

        <div className="aw-advisor-meta">
          <div className="aw-advisor-role">COUNCIL OF ANCIENT MASTERS</div>
          <h3 className="aw-advisor-name">The Ancient Polymath Advisor</h3>
          <p className="aw-advisor-quote">
            "{era.historicalStory.heroQuote}"
          </p>
        </div>
      </div>

      {/* Live Contextual Feedback on Current Player Strategy */}
      <div className="aw-advisor-speech-box">
        <div className="aw-speech-header">
          <span className="aw-speech-badge">LIVE STRATEGIC APPRAISAL</span>
          <span className="aw-speech-era">{era.title}</span>
        </div>
        <p className="aw-speech-text">{getContextualAdvice()}</p>

        {/* Synergies Guide Pill */}
        <div className="aw-advisor-synergy-hint">
          <strong>💡 Master Synergy Blueprint:</strong>{' '}
          {era.synergies[0]?.bonusDescription || 'Combine complementary interventions across water, thermal mass, and living soils.'}
        </div>
      </div>

      {/* Interactive Q&A Knowledge Terminal */}
      <div className="aw-advisor-qa-section">
        <h4 className="aw-qa-title">📜 Inquire Into Verified Ancient Wisdom & Physics</h4>

        <div className="aw-qa-layout">
          {/* Question List Chips */}
          <div className="aw-questions-col">
            {eraQuestions.map((q) => {
              const isSelected = activeQuestion?.id === q.id;
              return (
                <button
                  key={q.id}
                  className={`aw-question-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    soundEngine.playUiClick();
                    setActiveQuestion(q);
                    onAskQuestion(q.id);
                  }}
                >
                  <span className="aw-q-icon">💬</span>
                  <span className="aw-q-text">{q.question}</span>
                </button>
              );
            })}
          </div>

          {/* Answer Dialogue Window */}
          {activeQuestion && (
            <div className="aw-answer-col">
              <div className="aw-answer-card">
                <div className="aw-answer-header">
                  <span className="aw-tag">Historical Physics & Agronomy</span>
                  <div className="aw-answer-q">{activeQuestion.question}</div>
                </div>

                <div className="aw-answer-body">
                  <p>{activeQuestion.advisorReply}</p>
                </div>

                <div className="aw-answer-takeaway">
                  <strong>✨ Key Scientific Takeaway:</strong> {activeQuestion.keyTakeaway}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
