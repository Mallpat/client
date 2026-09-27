import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Code Mafia ErrorBoundary]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: '#05070d',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            padding: '24px',
            boxSizing: 'border-box',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              maxWidth: '540px',
              backgroundColor: '#0f172a',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)'
            }}
          >
            <h2 style={{ color: '#ef4444', fontSize: '20px', fontWeight: 800, margin: '0 0 12px 0' }}>
              ⚠️ DREADNOUGHT SUBSYSTEM GLITCH
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.6', margin: '0 0 18px 0' }}>
              A rendering exception occurred while synchronizing the dreadnought arena.
            </p>
            <div
              style={{
                backgroundColor: '#090d16',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '12px',
                color: '#f87171',
                fontSize: '11px',
                textAlign: 'left',
                marginBottom: '20px',
                overflowX: 'auto'
              }}
            >
              {this.state.error?.message || String(this.state.error)}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('code_mafia_server_url');
                window.location.reload();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0284c7',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 RECONNECT & RELOAD ARENA
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
