import React from 'react';
import { ERAS } from './ancientData';
import { GameState } from './ancientSimState';
import { soundEngine } from './ancientAudio';

interface NavigationHeaderProps {
  state: GameState;
  onSelectEra: (eraId: 'water' | 'architecture' | 'agriculture' | 'final2050') => void;
  onSelectTab: (tab: 'story' | 'codex' | 'builder' | 'simulation' | 'advisor' | 'results') => void;
  onToggleAudio: () => void;
  onReset: () => void;
}

export default function NavigationHeader({
  state,
  onSelectEra,
  onSelectTab,
  onToggleAudio,
  onReset,
}: NavigationHeaderProps) {
  const currentEra = ERAS[state.currentEraId];

  return (
    <header className="aw-header">
      <div className="aw-header-left">
        <div className="aw-brand-logo" onClick={() => onSelectTab('story')}>
          <div className="aw-brand-gem" style={{ borderColor: currentEra.accentColor }}>
            <span className="aw-brand-symbol">🏛️</span>
          </div>
          <div className="aw-brand-text">
            <h1 className="aw-title">Ancient Wisdom</h1>
            <span className="aw-subtitle">VS MODERN PROBLEMS</span>
          </div>
        </div>

        {/* Era Selector Tabs */}
        <div className="aw-era-nav">
          {Object.values(ERAS).map((era) => {
            const isUnlocked = state.unlockedEras.includes(era.id);
            const isCurrent = state.currentEraId === era.id;
            const isCompleted = state.completedEras.includes(era.id);

            return (
              <button
                key={era.id}
                className={`aw-era-btn ${isCurrent ? 'active' : ''} ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                style={{
                  '--accent': era.accentColor,
                  '--secondary': era.secondaryColor,
                } as React.CSSProperties}
                disabled={!isUnlocked}
                onClick={() => {
                  soundEngine.playUiClick();
                  onSelectEra(era.id);
                }}
                title={!isUnlocked ? 'Complete previous era to unlock' : era.title}
              >
                <span className="aw-era-badge">{era.order === 4 ? 'FINAL' : `ERA ${era.order}`}</span>
                <span className="aw-era-name">{era.id === 'final2050' ? '2050 Metropolis' : era.id.charAt(0).toUpperCase() + era.id.slice(1)}</span>
                {isCompleted && <span className="aw-era-check">✓</span>}
                {!isUnlocked && <span className="aw-era-lock">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="aw-header-right">
        {/* Navigation Mode Tabs */}
        <nav className="aw-tab-nav">
          <button
            className={`aw-tab-btn ${state.activeTab === 'story' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playUiClick();
              onSelectTab('story');
            }}
          >
            📜 Story & Crisis
          </button>
          <button
            className={`aw-tab-btn ${state.activeTab === 'codex' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playUiClick();
              onSelectTab('codex');
            }}
          >
            📚 Ancient Codex
          </button>
          <button
            className={`aw-tab-btn ${state.activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playUiClick();
              onSelectTab('builder');
            }}
          >
            🏗️ 3D Strategy Builder
          </button>
          <button
            className={`aw-tab-btn ${state.activeTab === 'advisor' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playUiClick();
              onSelectTab('advisor');
            }}
          >
            🧠 Ancient Advisor
          </button>
        </nav>

        {/* Action Controls */}
        <div className="aw-controls">
          <button
            className="aw-icon-btn"
            onClick={onToggleAudio}
            title={state.audioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {state.audioMuted ? '🔇' : '🔊'}
          </button>
          <button
            className="aw-icon-btn"
            onClick={() => {
              if (window.confirm('Reset current journey from the beginning?')) {
                onReset();
              }
            }}
            title="Reset Game"
          >
            🔄
          </button>
        </div>
      </div>
    </header>
  );
}
