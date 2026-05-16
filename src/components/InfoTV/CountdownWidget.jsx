import useCountdown from '../../hooks/useCountdown';
import GlassCard from '../shared/GlassCard';

function DigitBox({ digit, isImminent }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      border: `1px solid ${isImminent ? 'var(--ms-amber)' : 'var(--glass-border)'}`,
      borderRadius: 'var(--radius-md)',
      width: 56,
      height: 64,
      fontFamily: "'Segoe UI', monospace",
      fontSize: '2rem',
      fontWeight: 300,
      color: isImminent ? 'var(--ms-amber)' : 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'flipDown 0.3s ease',
      transition: 'border-color 0.3s, color 0.3s',
    }}>
      {digit}
    </div>
  );
}

function DigitGroup({ value, label, isImminent }) {
  const str = String(value).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <DigitBox digit={str[0]} isImminent={isImminent} />
        <DigitBox digit={str[1]} isImminent={isImminent} />
      </div>
      <span style={{
        fontSize: '0.6rem', color: 'var(--text-muted)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        {label}
      </span>
    </div>
  );
}

function Colon({ isImminent }) {
  return (
    <span style={{
      fontSize: '1.5rem',
      color: isImminent ? 'var(--ms-amber)' : 'var(--ms-blue)',
      opacity: 0.6,
      margin: '0 8px',
      alignSelf: 'center',
      marginBottom: 20,
    }}>
      :
    </span>
  );
}

export default function CountdownWidget({ nextSolatTime, nextSolatName }) {
  const { hours, minutes, seconds, isImminent } = useCountdown(nextSolatTime, nextSolatName);

  return (
    <GlassCard variant="blue" padding="20px">
      <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
        Masa Sehingga
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ms-blue)', marginBottom: 16 }}>
        {nextSolatName || '—'}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <DigitGroup value={hours} label="JAM" isImminent={isImminent} />
        <Colon isImminent={isImminent} />
        <DigitGroup value={minutes} label="MIN" isImminent={isImminent} />
        <Colon isImminent={isImminent} />
        <DigitGroup value={seconds} label="SAAT" isImminent={isImminent} />
      </div>
    </GlassCard>
  );
}
