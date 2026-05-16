import useCountdown from '../../hooks/useCountdown';

function DigitPair({ value, label, isImminent }) {
  const str = String(value).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        fontSize: 'clamp(2rem, 3.5vw, 4.5rem)',
        fontWeight: 800,
        color: isImminent ? '#FCD34D' : 'white',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        textShadow: isImminent ? '0 0 24px rgba(252,211,77,0.6)' : '0 2px 12px rgba(0,0,0,0.4)',
        transition: 'color 0.3s, text-shadow 0.3s',
      }}>
        {str}
      </div>
      <div style={{
        fontSize: 'clamp(0.55rem, 0.65vw, 0.7rem)',
        fontWeight: 700, letterSpacing: '0.1em',
        color: isImminent ? 'rgba(252,211,77,0.7)' : 'rgba(255,255,255,0.5)',
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
      color: isImminent ? 'rgba(252,211,77,0.6)' : 'rgba(255,255,255,0.35)',
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
        ? 'linear-gradient(135deg, #92400E 0%, #78350F 100%)'
        : 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',
      borderRadius: 16,
      padding: 'clamp(12px, 1.5vh, 20px) clamp(14px, 1.5vw, 22px)',
      boxShadow: isImminent
        ? '0 8px 32px rgba(146,64,14,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'
        : '0 8px 32px rgba(29,78,216,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
      transition: 'background 0.5s, box-shadow 0.5s',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'clamp(6px, 1vh, 12px)' }}>
        <div style={{
          fontSize: 'clamp(0.58rem, 0.7vw, 0.72rem)',
          fontWeight: 700, letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase',
          marginBottom: 2,
        }}>
          Seterusnya
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>🕌</span>
          <span style={{
            fontSize: 'clamp(1rem, 1.4vw, 1.6rem)',
            fontWeight: 800, color: 'white',
            letterSpacing: '-0.01em', textTransform: 'uppercase',
          }}>
            {nextSolatName || '—'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: 'clamp(8px, 1.2vh, 14px)' }} />

      {/* Digits */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'clamp(4px, 0.8vw, 12px)',
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
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>☀️</span>
          <span style={{ fontSize: 'clamp(0.58rem, 0.7vw, 0.72rem)', color: 'rgba(255,255,255,0.6)' }}>
            Jadual hari ini
          </span>
        </div>
        <span style={{ fontSize: 'clamp(0.58rem, 0.7vw, 0.72rem)', color: 'rgba(255,255,255,0.4)' }}>📅</span>
      </div>
    </div>
  );
}
