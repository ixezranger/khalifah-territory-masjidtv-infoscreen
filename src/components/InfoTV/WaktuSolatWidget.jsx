import { memo } from 'react';
import useWaktuSolat, { ZONE_LABELS } from '../../hooks/useWaktuSolat';
import GlassCard from '../shared/GlassCard';

const PRAYER_ORDER = ['imsak', 'subuh', 'syuruk', 'zohor', 'asar', 'maghrib', 'isyak'];
const PRAYER_DISPLAY = {
  imsak: 'Imsak', subuh: 'Subuh', syuruk: 'Syuruk',
  zohor: 'Zohor', asar: 'Asar', maghrib: 'Maghrib', isyak: 'Isyak',
};

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', marginBottom: 4 }}>
      <div className="skeleton" style={{ width: 64, height: 14 }} />
      <div className="skeleton" style={{ width: 44, height: 14 }} />
    </div>
  );
}

const WaktuSolatWidget = memo(function WaktuSolatWidget({ zone = 'WLY01' }) {
  const { times, nextSolat, loading, error, usingFallback } = useWaktuSolat(zone);

  return (
    <GlassCard padding="20px" style={{ height: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Waktu Solat
        </span>
        <span style={{
          background: 'rgba(0,120,212,0.15)',
          border: '1px solid var(--glass-border-blue)',
          borderRadius: 20, padding: '2px 10px',
          fontSize: '0.7rem', color: 'var(--ms-blue)',
        }}>
          {zone}
        </span>
      </div>

      {usingFallback && (
        <div style={{ fontSize: '0.7rem', color: 'var(--ms-amber)',
          marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠</span>
          <span>Waktu anggaran</span>
        </div>
      )}

      {error && !usingFallback && (
        <div style={{ fontSize: '0.7rem', color: 'var(--ms-red)', marginBottom: 10 }}>
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && !times && PRAYER_ORDER.map((k) => <SkeletonRow key={k} />)}

      {/* Prayer rows */}
      {times && PRAYER_ORDER.map((key) => {
        const isNext = times[key] === nextSolat && key !== 'syuruk';
        return (
          <div key={key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: isNext ? '0 var(--radius-sm) var(--radius-sm) 0' : 'var(--radius-sm)',
            borderLeft: isNext ? '3px solid var(--ms-blue)' : '3px solid transparent',
            background: isNext
              ? 'linear-gradient(135deg, rgba(0,120,212,0.2), rgba(0,120,212,0.08))'
              : 'transparent',
            boxShadow: isNext ? 'var(--shadow-blue)' : 'none',
            marginBottom: 4,
            transition: 'background 0.3s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: isNext ? 700 : 500,
                color: isNext ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
                {PRAYER_DISPLAY[key]}
              </span>
              {isNext && (
                <span style={{
                  fontSize: '0.6rem',
                  background: 'rgba(0,120,212,0.3)',
                  color: 'var(--ms-blue)',
                  borderRadius: 10,
                  padding: '2px 6px',
                }}>
                  SETERUSNYA
                </span>
              )}
            </div>
            <span style={{
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              fontWeight: isNext ? 700 : 400,
              color: isNext ? 'var(--ms-blue)' : 'var(--text-muted)',
            }}>
              {times[key] || '--:--'}
            </span>
          </div>
        );
      })}

      {/* Zone label */}
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'right' }}>
        {ZONE_LABELS[zone] || zone}
      </div>
    </GlassCard>
  );
});

export default WaktuSolatWidget;
