import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import useCountdown from '../../hooks/useCountdown';
import GlassCard from '../shared/GlassCard';

function pad(n) {
  return String(n).padStart(2, '0');
}

function DigitGroup({ value, label, isImminent }) {
  const tens = String(value).padStart(2, '0')[0];
  const units = String(value).padStart(2, '0')[1];
  const digitColor = isImminent ? '#FF6B35' : '#C9A84C';
  const digitStyle = {
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: '8px',
    width: '48px',
    height: '56px',
    fontFamily: 'monospace',
    fontSize: '2rem',
    color: digitColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: isImminent ? 'glowPulse 2s ease-in-out infinite' : 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        <div key={`t-${tens}`} style={{ ...digitStyle, animation: `flipDown 0.3s ease-out, ${isImminent ? 'glowPulse 2s ease-in-out infinite' : 'none'}` }}>
          {tens}
        </div>
        <div key={`u-${units}`} style={{ ...digitStyle, animation: `flipDown 0.3s ease-out, ${isImminent ? 'glowPulse 2s ease-in-out infinite' : 'none'}` }}>
          {units}
        </div>
      </div>
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#F5EDD6',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Colon({ isImminent }) {
  return (
    <span
      style={{
        fontFamily: 'monospace',
        fontSize: '2rem',
        color: isImminent ? '#FF6B35' : '#C9A84C',
        marginBottom: '20px',
        lineHeight: 1,
        alignSelf: 'center',
      }}
    >
      :
    </span>
  );
}

export default function CountdownWidget({ nextSolatTime, nextSolatName }) {
  const containerRef = useRef(null);
  const { hours, minutes, seconds, isImminent } = useCountdown(nextSolatTime, nextSolatName);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <GlassCard variant={isImminent ? 'active' : 'default'} style={{ padding: '20px' }}>
      <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#F5EDD6',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Seterusnya
          </div>
          <div
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#C9A84C',
              fontSize: '1.1rem',
              letterSpacing: '0.08em',
              marginTop: '2px',
            }}
          >
            {nextSolatName || '—'}
          </div>
        </div>

        {/* Flip groups */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <DigitGroup value={hours} label="Jam" isImminent={isImminent} />
          <Colon isImminent={isImminent} />
          <DigitGroup value={minutes} label="Minit" isImminent={isImminent} />
          <Colon isImminent={isImminent} />
          <DigitGroup value={seconds} label="Saat" isImminent={isImminent} />
        </div>
      </div>
    </GlassCard>
  );
}
