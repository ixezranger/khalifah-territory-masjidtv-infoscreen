import { memo } from 'react';
import CrescentIcon from '../shared/CrescentIcon';

const MasjidHeader = memo(function MasjidHeader({ masjidName = 'MasjidTV', description = '' }) {
  const today = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        {/* Left: icon + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CrescentIcon size={28} color="var(--ms-blue)" animated />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: 'clamp(1.2rem,3vw,2rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>
              {masjidName}
            </span>
            {description && (
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '50vw',
              }}>
                {description}
              </span>
            )}
          </div>
        </div>

        {/* Right: pill badges */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {['🕌 InfoTV', '🇲🇾 Malaysia', today].map((text) => (
            <span key={text} style={{
              background: 'rgba(0,120,212,0.15)',
              border: '1px solid var(--glass-border-blue)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: '0.72rem',
              color: 'var(--ms-blue)',
              whiteSpace: 'nowrap',
            }}>
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, var(--ms-blue), rgba(0,120,212,0.4), transparent)',
      }} />
    </div>
  );
});

export default MasjidHeader;
