import { useState, useEffect, memo } from 'react';
import useDateTime from '../../hooks/useDateTime';
import GlassCard from '../shared/GlassCard';
import OttomanDivider from '../shared/OttomanDivider';

const DateTimeWidget = memo(function DateTimeWidget() {
  const { time, gregorianDate, hijriDate } = useDateTime();
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setColonVisible((v) => !v), 1000);
    return () => clearInterval(interval);
  }, []);

  const [hh, mm, ss] = time ? time.split(':') : ['--', '--', '--'];

  return (
    <GlassCard variant="blue" padding="20px">
      <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
        Tarikh &amp; Masa
      </div>

      {/* Large time display */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, lineHeight: 1 }}>
        {[hh, mm, ss].map((part, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{
              fontFamily: "'Segoe UI', monospace",
              fontSize: 'clamp(2.5rem,5vw,3.8rem)',
              fontWeight: 300,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              {part}
            </span>
            {i < 2 && (
              <span style={{
                color: 'var(--ms-blue)',
                fontSize: 'clamp(2rem,4vw,3rem)',
                fontWeight: 300,
                opacity: colonVisible ? 1 : 0.2,
                transition: 'opacity 0.1s',
                margin: '0 2px',
              }}>
                :
              </span>
            )}
          </span>
        ))}
      </div>

      <OttomanDivider />

      {/* Date row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {gregorianDate}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--ms-blue)' }}>
          {hijriDate}
        </span>
      </div>
    </GlassCard>
  );
});

export default DateTimeWidget;
