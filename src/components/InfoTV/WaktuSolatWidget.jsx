import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import useWaktuSolat, { ZONE_LABELS } from '../../hooks/useWaktuSolat';
import GlassCard from '../shared/GlassCard';
import OttomanDivider from '../shared/OttomanDivider';

const PRAYER_ORDER = ['imsak', 'subuh', 'syuruk', 'zohor', 'asar', 'maghrib', 'isyak'];
const PRAYER_DISPLAY = {
  imsak: 'Imsak',
  subuh: 'Subuh',
  syuruk: 'Syuruk',
  zohor: 'Zohor',
  asar: 'Asar',
  maghrib: 'Maghrib',
  isyak: 'Isyak',
};

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <div style={{ width: '60px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
      <div style={{ width: '44px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
    </div>
  );
}

export default function WaktuSolatWidget({ zone = 'WLY01' }) {
  const containerRef = useRef(null);
  const { times, nextSolat, loading, error } = useWaktuSolat(zone);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <GlassCard style={{ padding: '20px', height: '100%', boxSizing: 'border-box' }}>
      <div ref={containerRef}>
        {/* Header */}
        <div style={{ marginBottom: '4px' }}>
          <div
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#C9A84C',
              fontSize: '0.85rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Waktu Solat
          </div>
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#F5EDD6',
              fontSize: '0.75rem',
              opacity: 0.7,
              marginTop: '2px',
            }}
          >
            {ZONE_LABELS[zone] || zone}
          </div>
        </div>

        <div style={{ marginBottom: '8px', marginTop: '8px' }}>
          <OttomanDivider size="sm" />
        </div>

        {/* Error */}
        {error && !times && (
          <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0 }}>
            Ralat memuatkan waktu solat
          </p>
        )}

        {/* Loading skeletons */}
        {loading && !times && (
          <div>
            {PRAYER_ORDER.map((k) => <SkeletonRow key={k} />)}
          </div>
        )}

        {/* Prayer rows */}
        {times && (
          <div>
            {PRAYER_ORDER.map((key) => {
              const isNext = times[key] === nextSolat && key !== 'syuruk';
              const rowContent = (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: isNext ? '4px 8px' : '6px 0',
                    borderBottom: '1px solid rgba(201,168,76,0.1)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: isNext ? '#C9A84C' : '#F5EDD6',
                      fontSize: '0.9rem',
                      fontWeight: isNext ? 700 : 400,
                    }}
                  >
                    {PRAYER_DISPLAY[key]}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#C9A84C',
                      fontSize: '0.9rem',
                      fontWeight: isNext ? 700 : 600,
                    }}
                  >
                    {times[key] || '--:--'}
                  </span>
                </div>
              );

              return isNext ? (
                <GlassCard key={key} variant="active" style={{ padding: '0', marginBottom: '2px', borderRadius: '8px' }}>
                  {rowContent}
                </GlassCard>
              ) : (
                <div key={key}>{rowContent}</div>
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
