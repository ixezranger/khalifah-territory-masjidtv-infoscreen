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
];

const HadithWidget = memo(function HadithWidget({ hadithItems = [], rotationMinutes = 5 }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const items = hadithItems.length ? hadithItems : FALLBACK;
  const [index, setIndex] = useState(0);

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Rotation
  useEffect(() => {
    if (items.length <= 1) return;
    const ms = rotationMinutes * 60 * 1000;

    const interval = setInterval(() => {
      if (!contentRef.current) return;
      gsap.to(contentRef.current, {
        opacity: 0, duration: 0.5, ease: 'power1.in',
        onComplete: () => {
          setIndex((prev) => (prev + 1) % items.length);
          gsap.to(contentRef.current, { opacity: 1, duration: 0.5, ease: 'power1.out' });
        },
      });
    }, ms);

    return () => clearInterval(interval);
  }, [items.length, rotationMinutes]);

  const current = items[index] || FALLBACK[0];

  return (
    <GlassCard style={{ padding: '20px' }}>
      <div ref={containerRef}>
        {/* Header */}
        <div
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#C9A84C',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          Hadith Pilihan
        </div>

        <div ref={contentRef}>
          {/* Arabic text */}
          {current.arabic_text && (
            <p
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: '1.3rem',
                direction: 'rtl',
                textAlign: 'right',
                color: '#C9A84C',
                lineHeight: 1.8,
                marginBottom: '12px',
                marginTop: 0,
              }}
            >
              {current.arabic_text}
            </p>
          )}

          <OttomanDivider size="sm" />

          {/* Malay translation */}
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#F5EDD6',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              lineHeight: 1.6,
              margin: '10px 0 0',
            }}
          >
            {current.malay_translation}
          </p>

          {/* Source */}
          {current.source && (
            <span
              style={{
                display: 'block',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'rgba(245,237,214,0.5)',
                fontSize: '0.75rem',
                textAlign: 'right',
                marginTop: '8px',
              }}
            >
              {current.source}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
});

export default HadithWidget;
