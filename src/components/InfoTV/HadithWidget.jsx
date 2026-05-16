import { useEffect, useRef, useState, memo } from 'react';
import { gsap } from 'gsap';
import GlassCard from '../shared/GlassCard';
import OttomanDivider from '../shared/OttomanDivider';

const FALLBACK = [
  {
    arabic_text: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
    malay_translation: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain.',
    source: 'HR. Ahmad & Al-Hakim',
  },
  {
    arabic_text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    malay_translation: 'Menuntut ilmu adalah kewajipan ke atas setiap Muslim.',
    source: 'HR. Ibn Majah',
  },
];

const HadithWidget = memo(function HadithWidget({ hadithItems = [], rotationMinutes = 5 }) {
  const contentRef = useRef(null);
  const items = hadithItems.length ? hadithItems : FALLBACK;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const ms = rotationMinutes * 60 * 1000;
    const interval = setInterval(() => {
      if (!contentRef.current) return;
      gsap.to(contentRef.current, {
        opacity: 0, y: -10, duration: 0.4, ease: 'power1.in',
        onComplete: () => {
          setIndex((prev) => (prev + 1) % items.length);
          gsap.fromTo(contentRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out' }
          );
        },
      });
    }, ms);
    return () => clearInterval(interval);
  }, [items.length, rotationMinutes]);

  const current = items[index] || FALLBACK[0];

  return (
    <GlassCard variant="purple" padding="24px" style={{ height: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Hadith Pilihan
        </span>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 4 }}>
          {items.map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === index ? 'var(--ms-purple-light)' : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      <div ref={contentRef}>
        {/* Arabic */}
        {current.arabic_text && (
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{
              position: 'absolute', top: -8, left: -4,
              fontSize: '3rem', color: 'var(--ms-purple)', opacity: 0.3,
              lineHeight: 1, fontFamily: 'serif',
            }}>"</span>
            <p style={{
              fontFamily: "'Amiri', serif",
              fontSize: '1.2rem',
              direction: 'rtl',
              textAlign: 'right',
              color: 'rgba(198,160,214,0.9)',
              lineHeight: 2,
              margin: 0,
              paddingTop: 8,
            }}>
              {current.arabic_text}
            </p>
          </div>
        )}

        <OttomanDivider />

        {/* Malay translation */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          margin: '0 0 12px',
          borderLeft: '2px solid rgba(119,25,170,0.5)',
          paddingLeft: 12,
        }}>
          {current.malay_translation}
        </p>

        {/* Source */}
        {current.source && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ms-purple)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {current.source}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
});

export default HadithWidget;
