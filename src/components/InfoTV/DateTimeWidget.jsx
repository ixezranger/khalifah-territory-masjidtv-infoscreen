import { useState, useEffect, memo } from 'react';
import useDateTime from '../../hooks/useDateTime';

const DateTimeWidget = memo(function DateTimeWidget() {
  const { time, gregorianDate, hijriDate, dayName } = useDateTime();
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setColonVisible((v) => !v), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = time ? time.split(':') : ['--', '--', '--'];
  const hh = parts[0];
  const mm = parts[1];
  const h24 = parseInt(hh, 10);
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = String(h24 % 12 || 12).padStart(2, '0');

  return (
    <div style={{
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 16,
      padding: 'clamp(12px, 1.5vh, 20px) clamp(14px, 1.5vw, 22px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.8)',
      flexShrink: 0,
    }}>
      {/* Time row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <div style={{
          fontSize: 'clamp(2.4rem, 3.8vw, 5rem)',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {h12}
          <span style={{ opacity: colonVisible ? 1 : 0.15, transition: 'opacity 0.1s', color: '#2563EB' }}>:</span>
          {mm}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 4 }}>
          <span style={{
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            color: 'white', fontSize: 'clamp(0.6rem, 0.8vw, 0.8rem)',
            fontWeight: 800, padding: '3px 8px', borderRadius: 8,
            letterSpacing: '0.05em',
          }}>
            {ampm}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(to right, #2563EB, #7C3AED, transparent)', marginBottom: 8, opacity: 0.3 }} />

      {/* Gregorian date */}
      <div style={{ fontSize: 'clamp(0.75rem, 1vw, 1rem)', fontWeight: 600, color: '#1E293B', marginBottom: 3 }}>
        {gregorianDate}
      </div>

      {/* Day */}
      <div style={{ fontSize: 'clamp(0.65rem, 0.85vw, 0.85rem)', color: '#64748B', marginBottom: 6 }}>
        {dayName}
      </div>

      {/* Hijri */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))',
        border: '1px solid rgba(37,99,235,0.2)',
        borderRadius: 8, padding: '4px 10px',
      }}>
        <span style={{ fontSize: 11 }}>☪️</span>
        <span style={{
          fontSize: 'clamp(0.65rem, 0.8vw, 0.8rem)', fontWeight: 600,
          color: '#1D4ED8', letterSpacing: '0.01em',
        }}>
          {hijriDate}
        </span>
      </div>
    </div>
  );
});

export default DateTimeWidget;
