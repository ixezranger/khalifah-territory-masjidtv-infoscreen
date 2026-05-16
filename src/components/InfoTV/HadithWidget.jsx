import { useEffect, useRef, useState, memo } from 'react';
import { gsap } from 'gsap';

const FALLBACK = [
  {
    arabic_text: 'مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ',
    malay_translation: '"Sesiapa yang menunjukkan kepada kebaikan, maka baginya pahala seperti orang yang melakukannya."',
    source: 'Riwayat Muslim (2674)',
  },
  {
    arabic_text: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
    malay_translation: '"Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain."',
    source: 'HR. Ahmad & Al-Hakim',
  },
  {
    arabic_text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    malay_translation: '"Menuntut ilmu adalah kewajipan ke atas setiap Muslim."',
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
        opacity: 0, y: -8, duration: 0.35, ease: 'power1.in',
        onComplete: () => {
          setIndex((prev) => (prev + 1) % items.length);
          gsap.fromTo(contentRef.current,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out' }
          );
        },
      });
    }, ms);
    return () => clearInterval(interval);
  }, [items.length, rotationMinutes]);

  const current = items[index] || FALLBACK[0];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 16,
      padding: 'clamp(12px, 1.5vh, 18px) clamp(14px, 1.5vw, 20px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(8px, 1.2vh, 14px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #059669, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>
            📿
          </div>
          <span style={{
            fontSize: 'clamp(0.65rem, 0.75vw, 0.78rem)',
            fontWeight: 700, letterSpacing: '0.08em',
            color: '#374151', textTransform: 'uppercase',
          }}>
            Hadis Hari Ini
          </span>
        </div>
        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 3 }}>
          {items.slice(0, 5).map((_, i) => (
            <div key={i} style={{
              width: i === index ? 14 : 5, height: 5, borderRadius: 9999,
              background: i === index ? '#059669' : '#D1FAE5',
              transition: 'width 0.3s, background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(to right, #059669, transparent)', opacity: 0.3, marginBottom: 'clamp(8px, 1.2vh, 12px)', flexShrink: 0 }} />

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1vh, 10px)' }}>
        {/* Arabic */}
        {current.arabic_text && (
          <div style={{
            fontFamily: "'Amiri', serif",
            fontSize: 'clamp(1rem, 1.6vw, 1.8rem)',
            direction: 'rtl', textAlign: 'right',
            color: '#1E3A5F',
            lineHeight: 1.8,
            flexShrink: 0,
          }}>
            {current.arabic_text}
          </div>
        )}

        {/* Translation */}
        <p style={{
          fontSize: 'clamp(0.68rem, 0.9vw, 0.9rem)',
          color: '#374151',
          lineHeight: 1.55,
          margin: 0,
          flex: 1, overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}>
          {current.malay_translation}
        </p>

        {/* Source */}
        {current.source && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
            <span style={{
              fontSize: 'clamp(0.6rem, 0.72vw, 0.72rem)',
              color: '#059669', fontWeight: 600, fontStyle: 'italic',
            }}>
              – {current.source}
            </span>
          </div>
        )}
      </div>

      {/* Decorative bottom leaf */}
      <div style={{
        position: 'absolute', bottom: 12, right: 16,
        fontSize: 'clamp(1.5rem, 3vw, 4rem)',
        opacity: 0.08, pointerEvents: 'none', userSelect: 'none',
      }}>
        🌿
      </div>
    </div>
  );
});

export default HadithWidget;
