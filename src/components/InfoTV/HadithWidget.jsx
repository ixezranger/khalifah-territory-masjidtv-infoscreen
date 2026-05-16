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
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(79,70,229,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
      border: '1px solid rgba(255,255,255,0.85)',
      flex: 1, minHeight: 0,
      display: 'flex', flexDirection: 'row',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Left: content */}
      <div style={{
        flex: 1, minWidth: 0,
        display: 'flex', flexDirection: 'column',
        padding: 'clamp(10px, 1.3vh, 16px) clamp(12px, 1.3vw, 18px)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 'clamp(6px, 1vh, 10px)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'linear-gradient(135deg, #059669, #10B981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, flexShrink: 0,
            }}>
              📿
            </div>
            <span style={{
              fontSize: 'clamp(0.6rem, 0.7vw, 0.72rem)',
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
                width: i === index ? 12 : 4, height: 4, borderRadius: 9999,
                background: i === index ? '#059669' : '#D1FAE5',
                transition: 'width 0.3s, background 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(to right, #059669, transparent)',
          opacity: 0.25, marginBottom: 'clamp(6px, 1vh, 10px)', flexShrink: 0,
        }} />

        {/* Content */}
        <div ref={contentRef} style={{
          flex: 1, minHeight: 0, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: 'clamp(4px, 0.8vh, 8px)',
        }}>
          {/* Arabic */}
          {current.arabic_text && (
            <div style={{
              fontFamily: "'Amiri', serif",
              fontSize: 'clamp(0.9rem, 1.4vw, 1.6rem)',
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
            fontSize: 'clamp(0.62rem, 0.82vw, 0.82rem)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
              <span style={{
                fontSize: 'clamp(0.56rem, 0.65vw, 0.65rem)',
                color: '#059669', fontWeight: 600, fontStyle: 'italic',
              }}>
                – {current.source}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: decorative panel */}
      <div style={{
        width: 'clamp(48px, 5.5vw, 72px)',
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(5,150,105,0.08) 0%, rgba(16,185,129,0.04) 100%)',
        borderLeft: '1px solid rgba(5,150,105,0.12)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 6, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 80, height: 80, borderRadius: '50%',
          border: '1px solid rgba(5,150,105,0.15)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 56, height: 56, borderRadius: '50%',
          border: '1px solid rgba(5,150,105,0.2)',
        }} />
        {/* Plant emoji stack */}
        <span style={{ fontSize: 'clamp(1.2rem, 2vw, 2rem)', position: 'relative', zIndex: 1 }}>🌿</span>
        <span style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1.5rem)', position: 'relative', zIndex: 1, opacity: 0.6 }}>📖</span>
        <span style={{ fontSize: 'clamp(0.7rem, 1vw, 1rem)', position: 'relative', zIndex: 1, opacity: 0.4 }}>✨</span>
      </div>
    </div>
  );
});

export default HadithWidget;
