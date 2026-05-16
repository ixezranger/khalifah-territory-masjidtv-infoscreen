import { useEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';
import CrescentIcon from '../shared/CrescentIcon';
import OttomanDivider from '../shared/OttomanDivider';

const ARABESQUE = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M20 0l4 8h8l-6 6 2 9-8-5-8 5 2-9-6-6h8z'/%3E%3C/g%3E%3C/svg%3E")`;

const MasjidHeader = memo(function MasjidHeader({ masjidName = 'Masjid', description = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        textAlign: 'center',
        padding: '20px 24px 16px',
        backgroundImage: ARABESQUE,
        backgroundRepeat: 'repeat',
      }}
    >
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
        <CrescentIcon size={28} animated />
        <h1
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#C9A84C',
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {masjidName}
        </h1>
        <CrescentIcon size={28} animated />
      </div>

      <OttomanDivider size="md" />

      {description && (
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#F5EDD6',
            fontSize: '1rem',
            maxWidth: '700px',
            margin: '10px auto 0',
            textAlign: 'center',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
});

export default MasjidHeader;
