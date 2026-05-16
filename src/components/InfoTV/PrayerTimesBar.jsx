import { useState, useEffect, useRef, memo } from 'react';
import useWaktuSolat, { ZONE_LABELS } from '../../hooks/useWaktuSolat';

const PRAYERS = [
  { key: 'imsak',   label: 'IMSAK',   icon: '⏰', color: '#F59E0B', light: 'rgba(245,158,11,0.15)' },
  { key: 'subuh',   label: 'SUBUH',   icon: '🌄', color: '#10B981', light: 'rgba(16,185,129,0.15)' },
  { key: 'syuruk',  label: 'SYURUK',  icon: '🌅', color: '#F97316', light: 'rgba(249,115,22,0.15)' },
  { key: 'zohor',   label: 'ZOHOR',   icon: '☀️', color: '#3B82F6', light: 'rgba(59,130,246,0.15)' },
  { key: 'asar',    label: 'ASAR',    icon: '🌤️', color: '#EC4899', light: 'rgba(236,72,153,0.15)' },
  { key: 'maghrib', label: 'MAGHRIB', icon: '🌇', color: '#EF4444', light: 'rgba(239,68,68,0.15)'  },
  { key: 'isyak',   label: 'ISYAK',   icon: '🌙', color: '#8B5CF6', light: 'rgba(139,92,246,0.15)' },
];

function fmt12(hhmm) {
  if (!hhmm) return ['--:--', ''];
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return [`${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`, ampm];
}

const PrayerTimesBar = memo(function PrayerTimesBar({ zone = 'WLY01' }) {
  const { times, nextSolat, loading, usingFallback } = useWaktuSolat(zone);

  return (
    <div style={{
      background: 'rgba(8,12,36,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '10px 16px 12px',
      flexShrink: 0,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(59,130,246,0.18)',
          border: '1px solid rgba(59,130,246,0.4)',
          borderRadius: 20, padding: '3px 12px',
        }}>
          <span style={{ fontSize: 13 }}>🕐</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: '#93C5FD', textTransform: 'uppercase' }}>
            Waktu Solat Hari Ini
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
          {ZONE_LABELS[zone] || zone}
        </span>
        {usingFallback && (
          <span style={{ fontSize: '0.65rem', color: '#FCD34D', display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚠ Waktu anggaran
          </span>
        )}
      </div>

      {/* Prayer cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {PRAYERS.map(({ key, label, icon, color, light }) => {
          const isNext = times?.[key] === nextSolat && key !== 'syuruk';
          const [time12, ampm] = fmt12(times?.[key]);
          const isLoading = loading && !times;

          return (
            <div key={key} style={{
              borderRadius: 12,
              padding: '10px 8px 8px',
              background: isNext
                ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)'
                : 'rgba(255,255,255,0.05)',
              border: isNext ? 'none' : `1px solid ${color}22`,
              boxShadow: isNext ? `0 4px 24px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.15)` : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              transition: 'all 0.4s ease',
              cursor: 'default',
            }}>
              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: isNext ? 'rgba(255,255,255,0.2)' : light,
                border: `1px solid ${isNext ? 'rgba(255,255,255,0.3)' : color + '44'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>
                {icon}
              </div>

              {/* Prayer label */}
              <div style={{
                fontSize: 'clamp(0.58rem, 0.7vw, 0.7rem)',
                fontWeight: 700, letterSpacing: '0.06em',
                color: isNext ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase',
              }}>
                {label}
              </div>

              {/* Time */}
              {isLoading ? (
                <div className="skeleton" style={{ width: 56, height: 22, borderRadius: 4 }} />
              ) : (
                <div style={{
                  fontSize: 'clamp(1rem, 1.4vw, 1.3rem)',
                  fontWeight: 800, fontFamily: 'monospace',
                  color: isNext ? '#FFFFFF' : 'rgba(255,255,255,0.88)',
                  letterSpacing: '0.02em', lineHeight: 1,
                }}>
                  {time12}
                </div>
              )}

              {/* AM/PM */}
              <div style={{
                fontSize: 'clamp(0.55rem, 0.65vw, 0.65rem)', fontWeight: 700,
                color: isNext ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                letterSpacing: '0.04em',
              }}>
                {ampm}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PrayerTimesBar;
