import { Component } from 'react';
import CrescentIcon from './CrescentIcon';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#050E1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
          }}>
            <div style={{ marginBottom: '16px' }}>
              <CrescentIcon size={64} color="#C9A84C" animated />
            </div>
            <h2 style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#C9A84C',
              fontSize: '1.5rem',
              margin: '0 0 12px',
            }}>
              Ralat Sistem
            </h2>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#F5EDD6',
              fontSize: '0.85rem',
              opacity: 0.7,
              margin: '0 0 24px',
              wordBreak: 'break-word',
            }}>
              {this.state.error?.message || 'Ralat tidak dijangka telah berlaku.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#C9A84C',
                color: '#050E1A',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 28px',
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Cuba Semula
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
