// Title + result overlays as DOM over the canvas (never 3D text). Restyle these
// to the brief's palette — the default look is a placeholder, not a design.
//
// HARD RULE: no backdrop-filter, no mix-blend-mode, no full-viewport blur over
// the canvas — they force the browser to re-rasterise the WebGL canvas per HUD
// repaint and read as full-screen strobing. Use a high-alpha rgba() panel.

import { useEffect, type ReactNode } from 'react';
import {
  getPhase,
  pauseRun,
  resumeRun,
  startRun,
  toMenu,
  useGamePhase,
} from './loop';

interface GameFlowProps {
  title: string;
  /** Message under the title. Vary it by outcome (won / lost) from the caller. */
  tagline?: string;
  startLabel?: string;
  /** Button label after a run ends. */
  resultLabel?: string;
  /** Called from the Start/Restart gesture — the place to request pointer lock. */
  onStart?: () => void;
  /** Optional HUD shown only while playing. */
  hud?: ReactNode;
}

const panelStyle: React.CSSProperties = {
  background: 'rgba(12, 14, 24, 0.82)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 16,
  padding: '32px 40px',
  boxShadow: '0 18px 60px rgba(0,0,0,0.5)',
  textAlign: 'center',
  color: '#f4f6ff',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  maxWidth: 460,
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 22,
  padding: '12px 28px',
  fontSize: 18,
  fontWeight: 600,
  color: '#0b0e18',
  background: '#8fd6ff',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
};

export default function GameFlow({
  title,
  tagline,
  startLabel = 'Start',
  resultLabel = 'Play again',
  onStart,
  hud,
}: GameFlowProps) {
  const phase = useGamePhase();

  // Guarded because the click, the bubbled overlay click and the key handler can
  // all land in the same gesture; a second startRun() would re-run every reset.
  const begin = () => {
    if (getPhase() === 'playing') return;
    onStart?.();
    startRun();
  };

  // Start/restart and pause controls stay live while the simulation is stopped.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        if (getPhase() === 'playing') pauseRun();
        else if (getPhase() === 'paused') resumeRun();
        return;
      }
      if (e.code !== 'Enter' && e.code !== 'Space') return;
      if (getPhase() === 'playing') return;
      e.preventDefault();
      if (getPhase() === 'paused') resumeRun();
      else begin();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onStart]);

  if (phase === 'playing') {
    return hud ? <>{hud}</> : null;
  }

  if (phase === 'paused') {
    return (
      <div className="overlay" data-game-overlay="pause" style={overlayStyle}>
        <div className="overlay-card" style={panelStyle}>
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: 0.5 }}>Paused</h1>
          <button data-game-action="resume" style={buttonStyle} onClick={resumeRun}>
            Resume
          </button>
          <button data-game-action="pause-restart" style={buttonStyle} onClick={startRun}>
            Restart
          </button>
          <button data-game-action="quit" style={buttonStyle} onClick={toMenu}>
            Quit
          </button>
        </div>
      </div>
    );
  }

  const result = phase === 'gameover';
  return (
    <div
      className="overlay"
      data-game-overlay={result ? 'gameover' : 'title'}
      style={overlayStyle}
      onClick={begin}
    >
      <div className="overlay-card" style={panelStyle}>
        <h1 style={{ margin: 0, fontSize: 34, letterSpacing: 0.5 }}>{title}</h1>
        {tagline && <p style={{ margin: '14px 0 0', opacity: 0.85, lineHeight: 1.5 }}>{tagline}</p>}
        <button
          data-game-action={result ? 'restart' : 'start'}
          style={buttonStyle}
          onClick={(e) => {
            e.stopPropagation();
            begin();
          }}
        >
          {result ? resultLabel : startLabel}
        </button>
      </div>
    </div>
  );
}
