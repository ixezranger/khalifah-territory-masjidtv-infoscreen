import { memo } from 'react';

const InfoTicker = memo(function InfoTicker({ messages = [], speed = 50 }) {
  const active = messages.filter(Boolean);
  if (!active.length) return null;

  const duration = `${(110 - speed) * 0.3}s`;
  const text = [...active, ...active, ...active].join('  ·  ');

  return (
    <div style={{
      width: '100%',
      height: 36,
      background: 'linear-gradient(to right, rgba(0,120,212,0.15), rgba(0,120,212,0.08), rgba(0,120,212,0.15))',
      borderTop: '1px solid var(--glass-border-blue)',
      borderBottom: '1px solid var(--glass-border-blue)',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Fixed label */}
      <div style={{
        background: 'var(--ms-blue)',
        color: 'white',
        padding: '0 12px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        flexShrink: 0,
        borderRight: '1px solid rgba(0,120,212,0.4)',
        whiteSpace: 'nowrap',
      }}>
        📢 INFO
      </div>

      {/* Scrolling text */}
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          animation: `marquee ${duration} linear infinite`,
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          padding: '0 16px',
        }}>
          {text}
        </div>
      </div>
    </div>
  );
});

export default InfoTicker;
