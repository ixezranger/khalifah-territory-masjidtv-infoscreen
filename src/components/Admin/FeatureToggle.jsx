import { useState, useEffect } from 'react';
import GlassCard from '../shared/GlassCard';
import useStore from '../../store/useStore';
import { updateFeatureSettings, getPlaylists } from '../../lib/supabase';

const btnPrimary = {
  background: '#C9A84C', color: '#050E1A', border: 'none',
  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '14px',
  width: '100%',
};
const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,168,76,0.3)',
  color: '#F5EDD6', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px',
  outline: 'none', boxSizing: 'border-box',
};
const labelStyle = {
  color: '#C9A84C', fontSize: '13px', display: 'block',
  marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
};

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
      <span style={{ color: '#F5EDD6', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
          background: value ? '#C9A84C' : 'rgba(255,255,255,0.15)',
          position: 'relative', transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: '3px',
          left: value ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '9px',
          background: value ? '#050E1A' : '#F5EDD6',
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  );
}

export default function FeatureToggle() {
  const { user, featureSettings, setFeatureSettings } = useStore();
  const [localSettings, setLocalSettings] = useState({ ...featureSettings });
  const [playlists, setPlaylists] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalSettings({ ...featureSettings });
  }, [featureSettings]);

  useEffect(() => {
    if (user?.id) {
      getPlaylists(user.id).then(({ data }) => {
        if (data) setPlaylists(data);
      });
    }
  }, [user?.id]);

  const set = (key, val) => setLocalSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    setError('');
    const { data, error: saveErr } = await updateFeatureSettings(user.id, localSettings);
    if (saveErr) {
      setError(saveErr.message || 'Gagal menyimpan tetapan.');
    } else if (data) {
      setFeatureSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Section 1: Widget Visibility */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 8px 0' }}>
          Keterlihatan Widget
        </h3>
        <Toggle value={!!localSettings.show_countdown} onChange={v => set('show_countdown', v)} label="Tunjuk Kiraan Mundur" />
        <Toggle value={!!localSettings.show_ticker} onChange={v => set('show_ticker', v)} label="Tunjuk Info Ticker" />
        <Toggle value={!!localSettings.show_hadith} onChange={v => set('show_hadith', v)} label="Tunjuk Hadith" />
        <Toggle value={!!localSettings.show_datetime} onChange={v => set('show_datetime', v)} label="Tunjuk Tarikh & Masa" />
        <Toggle value={!!localSettings.show_slider} onChange={v => set('show_slider', v)} label="Tunjuk Slider Media" />
        <Toggle value={!!localSettings.show_audio_player} onChange={v => set('show_audio_player', v)} label="Tunjuk Pemain Audio" />
      </GlassCard>

      {/* Section 2: Slider Settings */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 16px 0' }}>
          Tetapan Slider
        </h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Had Slaid (1–20)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={localSettings.slider_limit || 10}
            onChange={e => set('slider_limit', Number(e.target.value))}
            style={{ ...inputStyle, width: '120px' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Putaran Hadith (minit)</label>
          <select
            value={localSettings.hadith_rotation_minutes || 5}
            onChange={e => set('hadith_rotation_minutes', Number(e.target.value))}
            style={inputStyle}
          >
            <option value={1}>1 minit</option>
            <option value={3}>3 minit</option>
            <option value={5}>5 minit</option>
            <option value={10}>10 minit</option>
          </select>
        </div>
      </GlassCard>

      {/* Section 3: Audio Settings */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 8px 0' }}>
          Tetapan Audio
        </h3>
        <Toggle value={!!localSettings.audio_autoplay} onChange={v => set('audio_autoplay', v)} label="Main Secara Automatik" />
        <div style={{ paddingTop: '12px', marginBottom: '16px' }}>
          <label style={labelStyle}>Kelantangan Audio: {localSettings.audio_volume || 60}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={localSettings.audio_volume || 60}
            onChange={e => set('audio_volume', Number(e.target.value))}
            style={{ width: '100%', accentColor: '#C9A84C' }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Kategori Audio Lalai</label>
          <select
            value={localSettings.audio_default_category || 'zikir'}
            onChange={e => set('audio_default_category', e.target.value)}
            style={inputStyle}
          >
            <option value="zikir">Zikir</option>
            <option value="quran">Quran</option>
            <option value="nasheed">Nasheed</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Senarai Main Aktif</label>
          <select
            value={localSettings.active_playlist_id || ''}
            onChange={e => set('active_playlist_id', e.target.value || null)}
            style={inputStyle}
          >
            <option value="">-- Tiada --</option>
            {playlists.map(pl => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Section 4: Ticker Settings */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 16px 0' }}>
          Tetapan Ticker
        </h3>
        <label style={labelStyle}>Kelajuan Ticker: {localSettings.ticker_speed || 50}</label>
        <input
          type="range"
          min={1}
          max={100}
          value={localSettings.ticker_speed || 50}
          onChange={e => set('ticker_speed', Number(e.target.value))}
          style={{ width: '100%', accentColor: '#C9A84C' }}
        />
      </GlassCard>

      {/* Save button */}
      <div>
        {error && (
          <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {error}
          </div>
        )}
        {saved && (
          <div style={{
            marginBottom: '12px', padding: '10px 16px',
            background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: '8px', color: '#4ade80', fontSize: '13px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'center',
          }}>
            Tetapan disimpan ✓
          </div>
        )}
        <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Menyimpan...' : 'Simpan Semua Tetapan'}
        </button>
      </div>
    </div>
  );
}
