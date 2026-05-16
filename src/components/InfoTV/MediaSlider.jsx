import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

// ── Transitions ──────────────────────────────────────────────────────────────
function transitionA(current, next) {
  const tl = gsap.timeline();
  tl.set(next, { clipPath: 'inset(0 100% 0 0)', zIndex: 2 });
  tl.to(next, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power3.inOut' });
  tl.set(current, { zIndex: 1 }, '<');
  return tl;
}
function transitionB(current, next) {
  const tl = gsap.timeline();
  tl.set(next, { scale: 1.06, opacity: 0, zIndex: 2 });
  tl.to(next, { scale: 1, opacity: 1, duration: 1.0, ease: 'power2.out' });
  tl.to(current, { opacity: 0, duration: 0.5 }, '<0.2');
  return tl;
}
function transitionC(current, next) {
  const tl = gsap.timeline();
  tl.set(next, { yPercent: 100, zIndex: 2 });
  tl.to(next, { yPercent: 0, duration: 0.9, ease: 'expo.out' });
  tl.to(current, { yPercent: -15, opacity: 0, duration: 0.6 }, '<');
  return tl;
}
const TRANSITIONS = [transitionA, transitionB, transitionC];
function resetSlide(el) { if (el) gsap.set(el, { opacity: 1, yPercent: 0, scale: 1, zIndex: 0, clipPath: 'none' }); }

// ── Demo slides shown when no media is uploaded ──────────────────────────────
const DEMO_SLIDES = [
  {
    id: 'demo-1',
    badge: '📖 Tazkirah Hari Ini',
    badgeColor: '#818CF8',
    badgeBg: 'rgba(99,102,241,0.25)',
    title: 'Jangan Lupa,\nAllah Sentiasa\nBersama Kita',
    titleColors: ['#FFFFFF', '#93C5FD', '#C4B5FD'],
    body: 'Ingatlah, dengan mengingati Allah hati akan menjadi tenang.',
    source: '– Surah Ar-Ra\'d (13:28)',
    bg: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
    accent: '#818CF8',
    deco: '🕌',
  },
  {
    id: 'demo-2',
    badge: '📿 Hadis Pilihan',
    badgeColor: '#34D399',
    badgeBg: 'rgba(16,185,129,0.2)',
    arabic: 'مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ',
    title: '"Sesiapa yang menunjukkan kepada kebaikan, maka baginya pahala seperti orang yang melakukannya."',
    source: '– Riwayat Muslim (2674)',
    bg: 'linear-gradient(135deg, #071330 0%, #0C2461 50%, #1A5276 100%)',
    accent: '#34D399',
    deco: '🌿',
  },
  {
    id: 'demo-3',
    badge: '💡 Peringatan',
    badgeColor: '#FCD34D',
    badgeBg: 'rgba(251,191,36,0.2)',
    title: 'Solat Adalah Tiang Agama',
    body: 'Barangsiapa yang mendirikan solat, dia telah menegakkan agama. Barangsiapa meninggalkannya, dia telah meruntuhkan agama.',
    source: '– Hadis Riwayat Baihaqi',
    bg: 'linear-gradient(135deg, #0D0221 0%, #341562 50%, #0B0C2A 100%)',
    accent: '#FCD34D',
    deco: '⭐',
  },
];

function DemoSlide({ slide, isActive }) {
  const hasArabic = !!slide.arabic;
  const titleLines = slide.title?.split('\n') || [];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: slide.bg,
      display: 'flex', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 320, height: 320, borderRadius: '50%',
        background: slide.accent + '18',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 240, height: 240, borderRadius: '50%',
        background: slide.accent + '12',
        filter: 'blur(50px)',
      }} />

      {/* Left: text content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 'clamp(24px, 4%, 48px)',
        position: 'relative', zIndex: 10,
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: slide.badgeBg,
          border: `1px solid ${slide.badgeColor}44`,
          borderRadius: 20, padding: '5px 14px',
          marginBottom: 'clamp(12px, 2vh, 24px)',
          width: 'fit-content',
        }}>
          <span style={{ fontSize: 'clamp(11px, 1.2vw, 14px)' }}>{slide.badge.split(' ')[0]}</span>
          <span style={{
            fontSize: 'clamp(0.6rem, 0.8vw, 0.8rem)',
            fontWeight: 700, letterSpacing: '0.06em',
            color: slide.badgeColor, textTransform: 'uppercase',
          }}>
            {slide.badge.split(' ').slice(1).join(' ')}
          </span>
        </div>

        {/* Arabic text */}
        {hasArabic && (
          <div style={{
            fontFamily: "'Amiri', 'Arabic Typesetting', serif",
            fontSize: 'clamp(1.4rem, 2.5vw, 2.8rem)',
            direction: 'rtl', textAlign: 'right',
            color: slide.accent,
            lineHeight: 1.8, marginBottom: 'clamp(12px, 2vh, 20px)',
            textShadow: `0 0 40px ${slide.accent}44`,
          }}>
            {slide.arabic}
          </div>
        )}

        {/* Title (potentially multiline) */}
        <div style={{ marginBottom: 'clamp(10px, 1.5vh, 18px)' }}>
          {titleLines.map((line, i) => (
            <div key={i} style={{
              fontSize: hasArabic
                ? 'clamp(0.9rem, 1.4vw, 1.4rem)'
                : 'clamp(1.4rem, 2.8vw, 3.2rem)',
              fontWeight: hasArabic ? 500 : 800,
              lineHeight: 1.15,
              color: i === 1 ? slide.accent : 'white',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              letterSpacing: hasArabic ? 0 : '-0.02em',
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* Body text */}
        {slide.body && (
          <p style={{
            fontSize: 'clamp(0.8rem, 1.1vw, 1.05rem)',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.6, margin: '0 0 clamp(8px, 1.5vh, 16px)',
            maxWidth: '90%',
          }}>
            {slide.body}
          </p>
        )}

        {/* Divider */}
        <div style={{ width: 48, height: 2, background: slide.accent, borderRadius: 2, marginBottom: 'clamp(6px, 1vh, 12px)', opacity: 0.7 }} />

        {/* Source */}
        <div style={{
          fontSize: 'clamp(0.7rem, 0.85vw, 0.85rem)',
          color: slide.accent,
          fontStyle: 'italic',
          fontWeight: 500,
        }}>
          {slide.source}
        </div>
      </div>

      {/* Right: decorative panel */}
      <div style={{
        width: '38%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Geometric circles */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75%', paddingTop: '75%', borderRadius: '50%',
          border: `1px solid ${slide.accent}22`,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '55%', paddingTop: '55%', borderRadius: '50%',
          border: `1px solid ${slide.accent}33`,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '35%', paddingTop: '35%', borderRadius: '50%',
          background: slide.accent + '18',
          border: `1px solid ${slide.accent}55`,
        }} />
        <div style={{
          fontSize: 'clamp(3rem, 7vw, 8rem)',
          filter: 'drop-shadow(0 0 40px ' + slide.accent + '66)',
          position: 'relative', zIndex: 10,
          animation: 'fadeSlideUp 1s ease',
        }}>
          {slide.deco}
        </div>
      </div>

      {/* Vertical left accent line */}
      <div style={{
        position: 'absolute', left: 0, top: '15%', bottom: '15%',
        width: 3, background: `linear-gradient(to bottom, transparent, ${slide.accent}, transparent)`,
        borderRadius: 2,
      }} />
    </div>
  );
}

function DemoSlider() {
  const [active, setActive] = useState(0);
  const [, setTick] = useState(0);
  const slideRefs = useRef([]);
  const intervalRef = useRef(null);
  const isTransRef = useRef(false);

  const advance = useCallback(() => {
    if (isTransRef.current) return;
    isTransRef.current = true;

    const current = slideRefs.current[active];
    const next = (active + 1) % DEMO_SLIDES.length;
    const nextEl = slideRefs.current[next];

    if (current && nextEl) {
      gsap.set(nextEl, { opacity: 0, display: 'flex' });
      gsap.to(nextEl, { opacity: 1, duration: 0.8, ease: 'power2.out' });
      gsap.to(current, {
        opacity: 0, duration: 0.5, ease: 'power1.in',
        onComplete: () => {
          gsap.set(current, { display: 'none', opacity: 1 });
          setActive(next);
          isTransRef.current = false;
        },
      });
    } else {
      setActive(next);
      isTransRef.current = false;
    }
  }, [active]);

  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { display: i === 0 ? 'flex' : 'none', opacity: 1 });
    });
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(advance, 8000);
    return () => clearInterval(intervalRef.current);
  }, [advance]);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      borderRadius: 16, overflow: 'hidden', background: '#0F0C29',
    }}>
      {DEMO_SLIDES.map((slide, i) => (
        <div key={slide.id} ref={(el) => { slideRefs.current[i] = el; }}
          style={{ position: 'absolute', inset: 0, display: i === 0 ? 'flex' : 'none' }}>
          <DemoSlide slide={slide} isActive={i === active} />
        </div>
      ))}

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%',
        transform: 'translateX(-50%)', zIndex: 20,
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        {DEMO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => { if (!isTransRef.current) advance(); }}
            style={{
              width: i === active ? 24 : 8, height: 8, borderRadius: 9999,
              background: i === active ? 'white' : 'rgba(255,255,255,0.35)',
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'width 0.3s, background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Nav arrows */}
      {['◀', '▶'].map((arrow, idx) => (
        <button key={arrow} onClick={advance} style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          [idx === 0 ? 'left' : 'right']: 12, zIndex: 20,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: 'white', fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {arrow}
        </button>
      ))}
    </div>
  );
}

// ── Real slide renderers ────────────────────────────────────────────────────
function ImageSlide({ item }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img src={item.media_url} alt={item.title || ''}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {item.title && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 30%, rgba(0,0,0,0.1) 70%)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: 24,
        }}>
          <div style={{
            fontSize: 'clamp(1rem, 1.6vw, 1.5rem)', fontWeight: 700,
            color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            lineHeight: 1.3, maxWidth: '70%',
          }}>
            {item.title}
          </div>
        </div>
      )}
    </div>
  );
}

function VideoSlide({ item, isActive, videoRef }) {
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) vid.play().catch(() => {});
    else vid.pause();
  }, [isActive, videoRef]);

  return (
    <video ref={videoRef} src={item.media_url} autoPlay muted loop playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  );
}

function YouTubeSlide({ item }) {
  const src = `https://www.youtube.com/embed/${item.youtube_id}?autoplay=1&mute=1&loop=1&playlist=${item.youtube_id}&controls=0&modestbranding=1`;
  return (
    <iframe src={src} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      allow="autoplay; encrypted-media" title={item.title || 'YouTube'} />
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function MediaSlider({ items = [], settings = {} }) {
  const limit = settings.slider_limit || 10;
  const slides = items.slice(0, limit);

  const sliderRef = useRef(null);
  const slideRefs = useRef([]);
  const videoRefs = useRef([]);
  const transitionTypeRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const intervalRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndices, setVisibleIndices] = useState([0]);

  slideRefs.current = slideRefs.current.slice(0, slides.length);
  videoRefs.current = videoRefs.current.slice(0, slides.length);

  const getDuration = useCallback((index) => {
    const slide = slides[index];
    if (!slide) return 8000;
    if (slide.media_type === 'youtube') return 30000;
    return (slide.duration_seconds || 8) * 1000;
  }, [slides]);

  const goToSlide = useCallback((nextIndex) => {
    if (isTransitioningRef.current || nextIndex === activeIndex) return;
    const currentEl = slideRefs.current[activeIndex];
    const nextEl = slideRefs.current[nextIndex];
    if (!currentEl || !nextEl) return;

    isTransitioningRef.current = true;
    setVisibleIndices([activeIndex, nextIndex]);

    const type = transitionTypeRef.current;
    transitionTypeRef.current = (type + 1) % 3;
    gsap.killTweensOf([currentEl, nextEl]);

    const tl = TRANSITIONS[type](currentEl, nextEl);
    tl.eventCallback('onComplete', () => {
      resetSlide(currentEl);
      setActiveIndex(nextIndex);
      setVisibleIndices([nextIndex]);
      isTransitioningRef.current = false;
    });
  }, [activeIndex]);

  const startInterval = useCallback((index) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const duration = getDuration(index);
    intervalRef.current = setInterval(() => {
      goToSlide((index + 1) % slides.length);
    }, duration);
  }, [slides, getDuration, goToSlide]);

  useEffect(() => {
    if (slides.length <= 1) return;
    startInterval(activeIndex);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeIndex, startInterval, slides.length]);

  if (!slides.length) return <DemoSlider />;

  return (
    <div ref={sliderRef} style={{
      position: 'relative', width: '100%', height: '100%',
      overflow: 'hidden', borderRadius: 16, background: '#050E1A',
    }}>
      {slides.map((item, i) => {
        if (!videoRefs.current[i]) videoRefs.current[i] = { current: null };
        const isActive = i === activeIndex;
        const isVisible = visibleIndices.includes(i);
        return (
          <div key={item.id || i}
            ref={(el) => { slideRefs.current[i] = el; }}
            style={{
              position: 'absolute', inset: 0,
              display: isVisible ? 'block' : 'none',
              zIndex: isActive ? 1 : 0,
            }}>
            {item.media_type === 'image' && <ImageSlide item={item} />}
            {item.media_type === 'video' && (
              <VideoSlide item={item} isActive={isActive} videoRef={{ current: videoRefs.current[i] }} />
            )}
            {item.media_type === 'youtube' && isVisible && <YouTubeSlide item={item} />}
          </div>
        );
      })}

      {/* Dot nav */}
      {slides.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%',
          transform: 'translateX(-50%)', zIndex: 10,
          display: 'flex', gap: 6,
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); goToSlide(i); }}
              style={{
                width: i === activeIndex ? 24 : 8, height: 8, borderRadius: 9999,
                background: i === activeIndex ? 'white' : 'rgba(255,255,255,0.4)',
                border: 'none', padding: 0, cursor: 'pointer',
                transition: 'width 0.3s, background 0.3s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
