import useCountdown from '../../hooks/useCountdown';

function DigitPair({ value, label, isImminent }) {
  const str = String(value).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        fontSize: 'clamp(2rem, 3.5vw, 4.5rem)',
        fontWeight: 800,
        color: isImminent ? '#92400E' : '#0F172A',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        textShadow: isImminent ? '0 0 24px rgba(146,64,14,0.25)' : 'none',
        transition: 'color 0.3s, text-shadow 0.3s',
      }}>
        {str}
      </div>
      <div style={{
        fontSize: 'clamp(0.55rem, 0.65vw, 0.7rem)',
        fontWeight: 700, letterSpacing: '0.1em',
        color: isImminent ? 'rgba(146,64,14,0.6)' : 'rgba(15,23,42,0.4)',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  );
}

function Sep({ isImminent }) {
  return (
    <div style={{
      fontSize: 'clamp(1.5rem, 2.5vw, 3.5rem)',
      fontWeight: 300,
      color: isImminent ? 'rgba(146,64,14,0.4)' : 'rgba(15,23,42,0.2)',
      paddingBottom: 'clamp(14px, 2vh, 22px)',
      lineHeight: 1,
    }}>
      :
    </div>
  );
}

export default function CountdownWidget({ nextSolatTime, nextSolatName }) {
  const { hours, minutes, seconds, isImminent } = useCountdown(nextSolatTime, nextSolatName);

  return (
    <div style={{
      background: isImminent
        ? 'rgba(254,243,199,0.92)'
        : 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 16,
      padding: 'clamp(12px, 1.5vh, 20px) clamp(14px, 1.5vw, 22px)',
      boxShadow: isImminent
        ? '0 8px 32px rgba(146,64,14,0.15), inset 0 1px 0 rgba(255,255,255,0.9)'
        : '0 8px 32px rgba(79,70,229,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
      border: isImminent
        ? '1px solid rgba(146,64,14,0.2)'
        : '1px solid rgba(255,255,255,0.85)',
      transition: 'background 0.5s, box-shadow 0.5s',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'clamp(6px, 1vh, 12px)' }}>
        <div style={{
          fontSize: 'clamp(0.58rem, 0.7vw, 0.72rem)',
          fontWeight: 700, letterSpacing: '0.12em',
          color: isImminent ? 'rgba(146,64,14,0.55)' : 'rgba(15,23,42,0.4)',
          textTransform: 'uppercase',
          marginBottom: 2,
        }}>
          Countdown Ke
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🕌</span>
          <span style={{
            fontSize: 'clamp(1rem, 1.4vw, 1.6rem)',
            fontWeight: 800,
            color: isImminent ? '#92400E' : '#2563EB',
            letterSpacing: '-0.01em', textTransform: 'uppercase',
          }}>
            {nextSolatName || '—'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        height: 1,
        background: isImminent
          ? 'rgba(146,64,14,0.15)'
          : 'linear-gradient(to right, #2563EB, #7C3AED, transparent)',
        opacity: isImminent ? 1 : 0.3,
        marginBottom: 'clamp(8px, 1.2vh, 14px)',
      }} />

      {/* Digits */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        gap: 'clamp(4px, 0.8vw, 12px)',
      }}>
        <DigitPair value={hours} label="JAM" isImminent={isImminent} />
        <Sep isImminent={isImminent} />
        <DigitPair value={minutes} label="MINIT" isImminent={isImminent} />
        <Sep isImminent={isImminent} />
        <DigitPair value={seconds} label="SAAT" isImminent={isImminent} />
      </div>

      {/* Jadual link */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 'clamp(8px, 1.2vh, 14px)',
        padding: '6px 10px',
        background: isImminent ? 'rgba(146,64,14,0.08)' : 'rgba(37,99,235,0.06)',
        borderRadius: 8,
        border: isImminent ? '1px solid rgba(146,64,14,0.1)' : '1px solid rgba(37,99,235,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>☀️</span>
          <span style={{
            fontSize: 'clamp(0.58rem, 0.7vw, 0.72rem)',
            color: isImminent ? 'rgba(146,64,14,0.6)' : 'rgba(37,99,235,0.7)',
          }}>
            Jadual hari ini
          </span>
        </div>
        <span style={{ fontSize: 'clamp(0.58rem, 0.7vw, 0.72rem)', color: 'rgba(15,23,42,0.3)' }}>📅</span>
      </div>
    </div>
  );
}
