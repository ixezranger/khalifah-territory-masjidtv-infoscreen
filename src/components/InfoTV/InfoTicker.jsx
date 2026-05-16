import { memo } from 'react';

const InfoTicker = memo(function InfoTicker({ messages = [], speed = 50 }) {
  const active = messages.filter(Boolean);
  if (!active.length) return null;

  // speed 50 → ~18s | speed 100 → ~3s | speed 1 → ~33s
  const duration = `${(110 - speed) * 0.3}s`;
  const text = [...active, ...active, ...active].join('  ✦  ');

  return (
    <div
      style={{
        width: '100%',
        height: '40px',
        background: 'rgba(5,14,26,0.85)',
        borderTop: '1px solid rgba(201,168,76,0.2)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          animation: `marquee ${duration} linear infinite`,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#C9A84C',
          fontSize: '0.85rem',
        }}
      >
        {text}
      </div>
    </div>
  );
});

export default InfoTicker;
