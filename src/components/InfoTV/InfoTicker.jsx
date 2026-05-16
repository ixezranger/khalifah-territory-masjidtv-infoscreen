import { memo } from 'react';

const InfoTicker = memo(function InfoTicker({ messages = [], speed = 50 }) {
  const active = messages.filter(Boolean);
  if (!active.length) return null;

  const duration = `${(110 - speed) * 0.5}s`;
  const text = [...active, ...active, ...active].join('     ·     ');

  return (
    <div style={{
      height: 40,
      background: 'rgba(5,10,25,0.9)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Fixed label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'linear-gradient(135deg, #1D4ED8, #6D28D9)',
        height: '100%', padding: '0 16px',
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.1)',
      }}>
        <span style={{ fontSize: 14 }}>📢</span>
        <span style={{
          fontSize: '0.72rem', fontWeight: 800,
          letterSpacing: '0.1em', color: 'white',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
          PENGUMUMAN
        </span>
      </div>

      {/* Scrolling messages */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          animation: `marquee ${duration} linear infinite`,
          fontSize: 'clamp(0.72rem, 0.85vw, 0.85rem)',
          color: 'rgba(255,255,255,0.75)',
          padding: '0 24px',
          letterSpacing: '0.01em',
        }}>
          {text}
        </div>
      </div>

      {/* Right decoration */}
      <div style={{
        padding: '0 12px',
        flexShrink: 0,
        borderLeft: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontSize: 16 }}>☪️</span>
      </div>
    </div>
  );
});

export default InfoTicker;
