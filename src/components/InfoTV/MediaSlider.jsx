import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import CrescentIcon from '../shared/CrescentIcon';

// ── Transition definitions ──────────────────────────────────────────────────
function transitionA(current, next) {
  const tl = gsap.timeline();
  tl.set(next, { clipPath: 'inset(0 100% 0 0)', zIndex: 2 });
  tl.to(next, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power3.inOut' });
  tl.set(current, { zIndex: 1 }, '<');
  return tl;
}

function transitionB(current, next) {
  const tl = gsap.timeline();
  tl.set(next, { scale: 1.08, opacity: 0, zIndex: 2 });
  tl.to(next, { scale: 1, opacity: 1, duration: 1.0, ease: 'power2.out' });
  tl.to(current, { opacity: 0, duration: 0.6 }, '<0.2');
  return tl;
}

function transitionC(current, next) {
  const tl = gsap.timeline();
  tl.set(next, { yPercent: 100, opacity: 1, zIndex: 2 });
  tl.to(next, { yPercent: 0, duration: 0.9, ease: 'expo.out' });
  tl.to(current, { yPercent: -20, opacity: 0, duration: 0.7 }, '<');
  return tl;
}

const TRANSITIONS = [transitionA, transitionB, transitionC];

function resetSlide(el) {
  if (!el) return;
  gsap.set(el, { opacity: 1, yPercent: 0, scale: 1, zIndex: 0, clipPath: 'none' });
}

// ── Slide media renderers ───────────────────────────────────────────────────
function ImageSlide({ item }) {
  return (
    <img
      src={item.media_url}
      alt={item.title || ''}
      loading="lazy"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

function VideoSlide({ item, isActive, videoRef }) {
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isActive, videoRef]);

  return (
    <video
      ref={videoRef}
      src={item.media_url}
      autoPlay
      muted
      loop
      playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

function YouTubeSlide({ item }) {
  const src = `https://www.youtube.com/embed/${item.youtube_id}?autoplay=1&mute=1&loop=1&playlist=${item.youtube_id}&controls=0&modestbranding=1`;
  return (
    <iframe
      src={src}
      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      allow="autoplay; encrypted-media"
      title={item.title || 'YouTube slide'}
    />
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptySlider() {
  return (
    <div style={{
      width: '100%',
      aspectRatio: '16/9',
      borderRadius: '16px',
      background: 'rgba(5,14,26,0.7)',
      border: '1px solid rgba(201,168,76,0.15)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      <CrescentIcon size={64} color="#C9A84C" animated />
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#C9A84C',
          fontSize: '1.1rem',
          marginBottom: '8px',
        }}>
          Media Belum Ditambah
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#F5EDD6',
          fontSize: '0.85rem',
          opacity: 0.6,
        }}>
          Tambah imej atau video melalui panel admin
        </div>
      </div>
    </div>
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
  const gsapCtxRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndices, setVisibleIndices] = useState([0]);

  // Ensure refs arrays are sized correctly
  slideRefs.current = slideRefs.current.slice(0, slides.length);
  videoRefs.current = videoRefs.current.slice(0, slides.length);

  const getDuration = useCallback((index) => {
    const slide = slides[index];
    if (!slide) return 8000;
    if (slide.media_type === 'youtube') return 30000;
    return (slide.duration_seconds || 8) * 1000;
  }, [slides]);

  const goToSlide = useCallback((nextIndex) => {
    if (isTransitioningRef.current) return;
    if (nextIndex === activeIndex) return;

    const currentEl = slideRefs.current[activeIndex];
    const nextEl = slideRefs.current[nextIndex];
    if (!currentEl || !nextEl) return;

    isTransitioningRef.current = true;

    // Make next slide visible before transition
    setVisibleIndices([activeIndex, nextIndex]);

    // Pick transition type
    const type = transitionTypeRef.current;
    transitionTypeRef.current = (type + 1) % 3;

    // Kill any existing tweens on these elements
    gsap.killTweensOf([currentEl, nextEl]);

    const tl = TRANSITIONS[type](currentEl, nextEl);
    tl.eventCallback('onComplete', () => {
      resetSlide(currentEl);
      setActiveIndex(nextIndex);
      setVisibleIndices([nextIndex]);
      isTransitioningRef.current = false;
    });
  }, [activeIndex]);

  // Auto-advance interval
  const startInterval = useCallback((index) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const slide = slides[index];
    // For video slides, prefer onended event — interval is a fallback
    if (slide?.media_type === 'video') {
      const vid = videoRefs.current[index];
      if (vid && !vid.loop) {
        const onEnded = () => {
          const next = (index + 1) % slides.length;
          goToSlide(next);
        };
        vid.addEventListener('ended', onEnded, { once: true });
        return;
      }
    }

    const duration = getDuration(index);
    intervalRef.current = setInterval(() => {
      const next = (index + 1) % slides.length;
      goToSlide(next);
    }, duration);
  }, [slides, getDuration, goToSlide]);

  // Restart interval whenever activeIndex changes
  useEffect(() => {
    if (slides.length <= 1) return;
    startInterval(activeIndex);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeIndex, startInterval, slides.length]);

  // GSAP context for cleanup
  useEffect(() => {
    gsapCtxRef.current = gsap.context(() => {}, sliderRef);
    return () => {
      gsapCtxRef.current?.revert();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!slides.length) return <EmptySlider />;

  return (
    <div
      ref={sliderRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        overflow: 'hidden',
        borderRadius: '16px',
        background: '#050E1A',
      }}
    >
      {/* Slides */}
      {slides.map((item, i) => {
        const isActive = i === activeIndex;
        const isVisible = visibleIndices.includes(i);

        // Ensure video ref slot exists
        if (!videoRefs.current[i]) videoRefs.current[i] = { current: null };

        return (
          <div
            key={item.id || i}
            ref={(el) => { slideRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: isVisible ? 'block' : 'none',
              zIndex: isActive ? 1 : 0,
            }}
          >
            {item.media_type === 'image' && <ImageSlide item={item} />}

            {item.media_type === 'video' && (
              <VideoSlide
                item={item}
                isActive={isActive}
                videoRef={{ current: videoRefs.current[i] }}
              />
            )}

            {item.media_type === 'youtube' && isVisible && (
              <YouTubeSlide item={item} />
            )}
          </div>
        );
      })}

      {/* Bottom gradient overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(to top, rgba(5,14,26,0.8), transparent)',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      />

      {/* Slide title caption */}
      {slides[activeIndex]?.title && (
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '24px',
            zIndex: 10,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#F5EDD6',
            fontSize: '0.85rem',
            opacity: 0.8,
            maxWidth: 'calc(100% - 48px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {slides[activeIndex].title}
        </div>
      )}

      {/* Navigation dots */}
      {slides.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          {slides.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  goToSlide(i);
                }}
                style={{
                  width: isActive ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  background: isActive ? '#C9A84C' : 'rgba(201,168,76,0.4)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'width 0.3s ease, background 0.3s ease',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
