import { memo } from 'react';
import useWaktuSolat, { ZONE_LABELS } from '../../hooks/useWaktuSolat';

const PRAYERS = [
  { key: 'imsak',   label: 'IMSAK',   icon: '⏰', color: '#D97706', light: 'rgba(217,119,6,0.12)'   },
  { key: 'subuh',   label: 'SUBUH',   icon: '🌄', color: '#059669', light: 'rgba(5,150,105,0.12)'   },
  { key: 'syuruk',  label: 'SYURUK',  icon: '🌅', color: '#EA580C', light: 'rgba(234,88,12,0.12)'   },
  { key: 'zohor',   label: 'ZOHOR',   icon: '☀️', color: '#2563EB', light: 'rgba(37,99,235,0.12)'   },
  { key: 'asar',    label: 'ASAR',    icon: '🌤️', color: '#DB2777', light: 'rgba(219,39,119,0.12)'  },
  { key: 'maghrib', label: 'MAGHRIB', icon: '🌇', color: '#DC2626', light: 'rgba(220,38,38,0.12)'   },
  { key: 'isyak',   label: 'ISYAK',   icon: '🌙', color: '#7C3AED', light: 'rgba(124,58,237,0.12)'  },
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
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.9)',
      padding: '8px 14px 10px',
      flexShrink: 0,
      boxShadow: '0 -4px 24px rgba(79,70,229,0.08)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(37,99,235,0.1)',
          border: '1px solid rgba(37,99,235,0.25)',
          borderRadius: 20, padding: '2px 12px',
        }}>
          <span style={{ fontSize: 12 }}>🕐</span>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
            color: '#1D4ED8', textTransform: 'uppercase',
          }}>
            Waktu Solat Hari Ini
          </span>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'rgba(15,23,42,0.4)' }}>
          {ZONE_LABELS[zone] || zone}
        </span>
        {usingFallback && (
          <span style={{ fontSize: '0.62rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚠ Waktu anggaran
          </span>
        )}
      </div>

      {/* Prayer cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {PRAYERS.map(({ key, label, icon, color, light }) => {
          const isNext = times?.[key] === nextSolat && key !== 'syuruk';
          const [time12, ampm] = fmt12(times?.[key]);
          const isLoading = loading && !times;

          return (
            <div key={key} style={{
              borderRadius: 12,
              padding: '8px 6px 6px',
              background: isNext
                ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)'
                : light,
              border: isNext ? 'none' : `1px solid ${color}33`,
              boxShadow: isNext
                ? '0 4px 20px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                : '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'all 0.4s ease',
              cursor: 'default',
            }}>
              {/* Icon circle */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: isNext ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${isNext ? 'rgba(255,255,255,0.35)' : color + '44'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {icon}
              </div>

              {/* Label */}
              <div style={{
                fontSize: 'clamp(0.55rem, 0.65vw, 0.65rem)',
                fontWeight: 700, letterSpacing: '0.06em',
                color: isNext ? 'rgba(255,255,255,0.85)' : color,
                textTransform: 'uppercase',
              }}>
                {label}
              </div>

              {/* Time */}
              {isLoading ? (
                <div className="skeleton" style={{ width: 52, height: 20, borderRadius: 4 }} />
              ) : (
                <div style={{
                  fontSize: 'clamp(0.9rem, 1.3vw, 1.2rem)',
                  fontWeight: 800, fontFamily: 'monospace',
                  color: isNext ? '#FFFFFF' : '#0F172A',
                  letterSpacing: '0.02em', lineHeight: 1,
                }}>
                  {time12}
                </div>
              )}

              {/* AM/PM */}
              <div style={{
                fontSize: 'clamp(0.52rem, 0.62vw, 0.62rem)', fontWeight: 700,
                color: isNext ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.4)',
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
