import { useEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';
import useDateTime from '../../hooks/useDateTime';
import GlassCard from '../shared/GlassCard';
import OttomanDivider from '../shared/OttomanDivider';
import CrescentIcon from '../shared/CrescentIcon';

const DateTimeWidget = memo(function DateTimeWidget() {
  const containerRef = useRef(null);
  const { time, gregorianDate, hijriDate } = useDateTime();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <GlassCard
      style={{ position: 'relative', padding: '20px 24px', overflow: 'hidden' }}
    >
      <div ref={containerRef} style={{ position: 'relative', zIndex: 1 }}>
        {/* Clock */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#C9A84C',
            fontWeight: 700,
            letterSpacing: '0.05em',
            lineHeight: 1,
          }}
        >
          {time}
        </div>

        {/* Gregorian date */}
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#F5EDD6',
            fontSize: '1rem',
            marginTop: '8px',
          }}
        >
          {gregorianDate}
        </div>

        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
          <OttomanDivider size="sm" />
        </div>

        {/* Hijri date */}
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#C9A84C',
            fontSize: '0.9rem',
          }}
        >
          {hijriDate}
        </div>
      </div>

      {/* Watermark */}
      <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 0 }}>
        <CrescentIcon size={48} color="rgba(201,168,76,0.08)" />
      </div>
    </GlassCard>
  );
});

export default DateTimeWidget;
