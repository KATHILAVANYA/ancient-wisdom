import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

// A render throw anywhere in the tree (a misplaced R3F hook is the classic one)
// unmounts everything and leaves a blank page with no clue why. This prints the
// failure on top of the app instead. Inline styles on purpose: App.css may be
// the thing that is broken.
type BoundaryState = { error: Error | null; stack: string };

class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null, stack: '' };

  static getDerivedStateFromError(error: Error): Partial<BoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[render error]', error);
    this.setState({ stack: info.componentStack ?? '' });
  }

  render() {
    const { error, stack } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          overflow: 'auto',
          padding: '32px',
          background: '#fdf6f4',
          color: '#2b1a16',
          font: '13px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        <h1 style={{ margin: '0 0 4px', font: '600 20px/1.3 system-ui, sans-serif' }}>
          The app crashed while rendering
        </h1>
        <p style={{ margin: '0 0 20px', color: '#7a5b53' }}>
          Fix the error below, then save — Vite will hot-reload.
        </p>
        <pre
          style={{
            margin: '0 0 20px',
            padding: '14px 16px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#fff',
            border: '1px solid #e6cfc9',
            borderRadius: '8px',
            color: '#a1291b',
          }}
        >
          {error.message}
        </pre>
        {(stack || error.stack) && (
          <pre
            style={{
              margin: 0,
              padding: '14px 16px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#fff',
              border: '1px solid #e8ddda',
              borderRadius: '8px',
              color: '#5a4640',
            }}
          >
            {stack || error.stack}
          </pre>
        )}
      </div>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
