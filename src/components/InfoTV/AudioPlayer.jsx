import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import GlassCard from '../shared/GlassCard';
import AudioVisualizer from '../shared/AudioVisualizer';
import CrescentIcon from '../shared/CrescentIcon';

const CATEGORIES = ['zikir', 'quran', 'nasheed'];
const CAT_LABEL = { zikir: 'Zikir', quran: 'Quran', nasheed: 'Nasheed' };

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function CoverArt({ src, size = 72 }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '8px',
        background: 'rgba(13,79,79,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(201,168,76,0.2)',
        flexShrink: 0,
      }}>
        <CrescentIcon size={36} color="#C9A84C" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
    />
  );
}

const CTRL_BTN = {
  background: 'transparent',
  border: '1px solid rgba(201,168,76,0.3)',
  borderRadius: '9999px',
  width: '32px',
  height: '32px',
  color: '#C9A84C',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  padding: 0,
};

export default function AudioPlayer({ audioItems = [], featureSettings = {} }) {
  const containerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(featureSettings.audio_default_category || 'zikir');

  const filtered = audioItems.filter((a) => a.category === activeCategory);
  const vol = (featureSettings.audio_volume ?? 60) / 100;
  const autoplay = featureSettings.audio_autoplay ?? true;

  const player = useAudioPlayer(filtered, vol, autoplay);

  // Reload when category changes
  useEffect(() => {
    const list = audioItems.filter((a) => a.category === activeCategory);
    if (list.length) player.load(list);
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSeek = useCallback((e) => {
    const pct = Number(e.target.value);
    if (player.duration) player.seek((pct / 100) * player.duration);
  }, [player]);

  if (!audioItems.length) {
    return (
      <GlassCard style={{ padding: '20px', textAlign: 'center' }}>
        <span style={{ color: '#F5EDD6', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', opacity: 0.6 }}>
          Tiada audio ditambah
        </span>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={{ padding: '16px' }}>
      <div ref={containerRef}>
        {/* Main row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Cover art */}
          <CoverArt src={player.currentTrack?.thumbnail_url} />

          {/* Center info */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#F5EDD6',
              fontSize: '0.9rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {player.currentTrack?.title || 'No track'}
            </div>

            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'rgba(245,237,214,0.6)',
              fontSize: '0.8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {player.currentTrack?.artist_reciter || ''}
            </div>

            {player.currentTrack?.category && (
              <span style={{
                display: 'inline-block',
                border: '1px solid #C9A84C',
                color: '#C9A84C',
                fontSize: '0.7rem',
                borderRadius: '12px',
                padding: '1px 8px',
                alignSelf: 'flex-start',
                textTransform: 'capitalize',
              }}>
                {player.currentTrack.category}
              </span>
            )}

            <AudioVisualizer isPlaying={player.isPlaying} color="#C9A84C" height={24} barCount={10} />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button style={CTRL_BTN} onClick={player.prev} title="Previous">◄◄</button>
              <button
                style={{ ...CTRL_BTN, width: '38px', height: '38px', fontSize: '16px', background: 'rgba(201,168,76,0.15)' }}
                onClick={player.isPlaying ? player.pause : player.resume}
                title={player.isPlaying ? 'Pause' : 'Play'}
              >
                {player.isPlaying ? '⏸' : '▶'}
              </button>
              <button style={CTRL_BTN} onClick={player.next} title="Next">►►</button>
            </div>

            <input
              type="range"
              min={0} max={1} step={0.01}
              value={player.volume}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              style={{ width: '64px', accentColor: '#C9A84C' }}
              title="Volume"
            />

            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'rgba(245,237,214,0.6)',
              fontSize: '0.7rem',
            }}>
              {formatTime(player.currentTime)} / {formatTime(player.duration)}
            </span>
          </div>
        </div>

        {/* Seek bar */}
        <input
          type="range"
          min={0} max={100} step={0.1}
          value={player.progress}
          onChange={handleSeek}
          style={{ width: '100%', accentColor: '#C9A84C', marginTop: '10px', cursor: 'pointer' }}
        />

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  border: `1px solid ${isActive ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
                  background: isActive ? '#C9A84C' : 'transparent',
                  color: isActive ? '#050E1A' : '#C9A84C',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {CAT_LABEL[cat]}
              </button>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
