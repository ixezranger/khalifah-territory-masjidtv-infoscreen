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
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 16,
      padding: 'clamp(10px, 1.2vh, 16px) clamp(12px, 1.3vw, 18px)',
      boxShadow: '0 8px 32px rgba(79,70,229,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
      border: '1px solid rgba(255,255,255,0.85)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(10px, 1.2vw, 16px)',
    }}>
      {/* Clock icon circle */}
      <div style={{
        width: 'clamp(44px, 5vw, 64px)',
        height: 'clamp(44px, 5vw, 64px)',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
      }}>
        <span style={{ fontSize: 'clamp(18px, 2.2vw, 28px)' }}>🕐</span>
      </div>

      {/* Time display */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Time + AM/PM row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
          <div style={{
            fontSize: 'clamp(1.8rem, 2.8vw, 3.6rem)',
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
          <span style={{
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            color: 'white', fontSize: 'clamp(0.55rem, 0.7vw, 0.72rem)',
            fontWeight: 800, padding: '2px 7px', borderRadius: 6,
            letterSpacing: '0.05em', alignSelf: 'flex-start',
          }}>
            {ampm}
          </span>
        </div>

        {/* Thin divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(to right, #2563EB, #7C3AED, transparent)',
          opacity: 0.25, marginBottom: 4,
        }} />

        {/* Gregorian date + day */}
        <div style={{ fontSize: 'clamp(0.62rem, 0.8vw, 0.82rem)', fontWeight: 600, color: '#1E293B', marginBottom: 2 }}>
          {gregorianDate}
        </div>
        <div style={{ fontSize: 'clamp(0.58rem, 0.72vw, 0.72rem)', color: '#64748B', marginBottom: 4 }}>
          {dayName}
        </div>

        {/* Hijri pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))',
          border: '1px solid rgba(37,99,235,0.18)',
          borderRadius: 6, padding: '2px 8px',
        }}>
          <span style={{ fontSize: 9 }}>☪️</span>
          <span style={{
            fontSize: 'clamp(0.58rem, 0.7vw, 0.7rem)', fontWeight: 600,
            color: '#1D4ED8', letterSpacing: '0.01em',
          }}>
            {hijriDate}
          </span>
        </div>
      </div>
    </div>
  );
});

export default DateTimeWidget;
