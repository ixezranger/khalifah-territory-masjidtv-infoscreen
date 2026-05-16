import { useEffect, useRef, useState, useCallback } from 'react';
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

function CoverArt({ src, size = 64 }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, var(--ms-blue), var(--ms-purple))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <CrescentIcon size={size * 0.5} color="rgba(255,255,255,0.8)" />
      </div>
    );
  }
  return (
    <img src={src} alt="" onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
  );
}

const ctrlBtn = (active = false) => ({
  background: active ? 'var(--ms-blue)' : 'transparent',
  border: '1px solid var(--glass-border)',
  borderRadius: '50%',
  width: 32, height: 32,
  color: active ? 'white' : 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 13, padding: 0,
  transition: 'background 0.2s, color 0.2s',
});

export default function AudioPlayer({ audioItems = [], featureSettings = {} }) {
  const [activeCategory, setActiveCategory] = useState(featureSettings.audio_default_category || 'zikir');

  const filtered = audioItems.filter((a) => a.category === activeCategory);
  const vol = (featureSettings.audio_volume ?? 60) / 100;
  const autoplay = featureSettings.audio_autoplay ?? true;

  const player = useAudioPlayer(filtered, vol, autoplay);

  useEffect(() => {
    const list = audioItems.filter((a) => a.category === activeCategory);
    if (list.length) player.load(list);
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSeek = useCallback((e) => {
    const pct = Number(e.target.value);
    if (player.duration) player.seek((pct / 100) * player.duration);
  }, [player]);

  if (!audioItems.length) {
    return (
      <GlassCard padding="20px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tiada audio ditambah</span>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="16px" style={{ height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
        Audio Player
      </div>

      {/* Main row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <CoverArt src={player.currentTrack?.thumbnail_url} />

        {/* Track info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {player.currentTrack?.title || 'Tiada track'}
          </div>
          <div style={{
            fontSize: '0.8rem', color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {player.currentTrack?.artist_reciter || ''}
          </div>
          <AudioVisualizer isPlaying={player.isPlaying} color="var(--ms-blue)" height={20} barCount={16} />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button style={ctrlBtn()} onClick={player.prev} title="Previous">◄◄</button>
            <button style={{ ...ctrlBtn(true), width: 36, height: 36, fontSize: 16 }}
              onClick={player.isPlaying ? player.pause : player.resume}
              title={player.isPlaying ? 'Pause' : 'Play'}>
              {player.isPlaying ? '⏸' : '▶'}
            </button>
            <button style={ctrlBtn()} onClick={player.next} title="Next">►►</button>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔊</span>
            <input type="range" min={0} max={1} step={0.01}
              value={player.volume}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              style={{ width: 72, accentColor: 'var(--ms-blue)' }} />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 12, position: 'relative' }}>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <div style={{
            height: '100%', background: 'var(--ms-blue)', borderRadius: 2,
            width: `${player.progress || 0}%`, transition: 'width 0.5s linear',
          }} />
        </div>
        <input type="range" min={0} max={100} step={0.1}
          value={player.progress || 0}
          onChange={handleSeek}
          style={{
            position: 'absolute', top: -6, left: 0, width: '100%',
            opacity: 0, cursor: 'pointer', height: 16,
          }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
        <span>{formatTime(player.currentTime)}</span>
        <span>{formatTime(player.duration)}</span>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '4px 14px', borderRadius: 9999,
              border: `1px solid ${isActive ? 'var(--ms-blue)' : 'var(--glass-border)'}`,
              background: isActive ? 'var(--ms-blue)' : 'transparent',
              color: isActive ? 'white' : 'var(--text-muted)',
              fontSize: '0.75rem', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s',
            }}>
              {CAT_LABEL[cat]}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
