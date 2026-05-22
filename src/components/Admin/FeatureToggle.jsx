import { useState, useEffect } from 'react';
import { Settings, Layers, Music, MessageSquare, Save } from 'lucide-react';
import { Card, Toggle, Btn, Alert, C } from './ui';
import useStore from '../../store/useStore';
import { updateFeatureSettings, getPlaylists } from '../../lib/supabase';

export default function FeatureToggle() {
  const { user, featureSettings, setFeatureSettings } = useStore();
  const [cfg,      setCfg]      = useState({ ...featureSettings });
  const [playlists,setPlaylists]= useState([]);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => { setCfg({ ...featureSettings }); }, [featureSettings]);
  useEffect(() => {
    if (user?.id) getPlaylists(user.id).then(({data}) => { if (data) setPlaylists(data); });
  }, [user?.id]);

  const set = (k, v) => setCfg(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true); setError('');
    const { data, error: e } = await updateFeatureSettings(user.id, cfg);
    if (e) setError(e.message || 'Gagal menyimpan.');
    else if (data) { setFeatureSettings(data); setSaved(true); setTimeout(()=>setSaved(false), 2500); }
    setSaving(false);
  };

  const inputRow = (label, key, min, max, unit='') => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:`1px solid ${C.line}` }}>
      <span style={{ fontSize:'0.875rem', color: C.ink, fontWeight:500 }}>{label}</span>
      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
        <input type="number" min={min} max={max} value={cfg[key]||min}
          onChange={e => set(key, Number(e.target.value))}
          className="ms-input"
          style={{ width: 80, textAlign:'center', padding:'6px 10px' }}
        />
        {unit && <span style={{ fontSize:'0.78rem', color: C.faint }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 640 }}>
      {error && <Alert type="error">{error}</Alert>}
      {saved && <Alert type="success">✓ Tetapan berjaya disimpan</Alert>}

      {/* Widget visibility */}
      <Card title="Keterlihatan Widget" icon={Layers} accent={C.blue}>
        <Toggle value={!!cfg.show_countdown}    onChange={v=>set('show_countdown',v)}    label="Kiraan Mundur Solat" hint="Tunjuk masa sehingga solat seterusnya" />
        <Toggle value={!!cfg.show_ticker}       onChange={v=>set('show_ticker',v)}       label="Info Ticker" hint="Teks berjalan di bahagian bawah skrin" />
        <Toggle value={!!cfg.show_hadith}       onChange={v=>set('show_hadith',v)}       label="Hadith & Kata Hikmah" />
        <Toggle value={!!cfg.show_datetime}     onChange={v=>set('show_datetime',v)}     label="Tarikh & Masa" />
        <Toggle value={!!cfg.show_slider}       onChange={v=>set('show_slider',v)}       label="Slider Media" />
        <Toggle value={!!cfg.show_audio_player} onChange={v=>set('show_audio_player',v)} label="Pemain Audio" />
      </Card>

      {/* Slider settings */}
      <Card title="Tetapan Slider" icon={Settings} accent={C.violet}>
        {inputRow('Had Maksimum Slaid', 'slider_limit', 1, 20, 'slaid')}
        {inputRow('Putaran Hadith', 'hadith_rotation_minutes', 1, 60, 'minit')}
      </Card>

      {/* Audio settings */}
      <Card title="Tetapan Audio" icon={Music} accent={C.green}>
        <Toggle value={!!cfg.audio_autoplay} onChange={v=>set('audio_autoplay',v)} label="Main Secara Automatik" />
        <div style={{ padding:'12px 0', borderBottom:`1px solid ${C.line}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:'0.875rem', color:C.ink, fontWeight:500 }}>Kelantangan Audio</span>
            <span style={{ fontWeight:700, color:C.blue }}>{cfg.audio_volume||60}%</span>
          </div>
          <input type="range" min={0} max={100} value={cfg.audio_volume||60}
            onChange={e=>set('audio_volume',Number(e.target.value))}
            style={{ width:'100%', accentColor: C.blue }}
          />
        </div>
        <div style={{ padding:'12px 0', borderBottom:`1px solid ${C.line}` }}>
          <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>
            Kategori Audio Lalai
          </label>
          <select value={cfg.audio_default_category||'zikir'} onChange={e=>set('audio_default_category',e.target.value)} className="ms-input">
            <option value="zikir">Zikir</option>
            <option value="quran">Quran</option>
            <option value="nasheed">Nasheed</option>
          </select>
        </div>
        <div style={{ paddingTop:12 }}>
          <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>
            Senarai Main Aktif
          </label>
          <select value={cfg.active_playlist_id||''} onChange={e=>set('active_playlist_id',e.target.value||null)} className="ms-input">
            <option value="">— Tiada —</option>
            {playlists.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </Card>

      {/* Ticker settings */}
      <Card title="Tetapan Ticker" icon={MessageSquare} accent={C.amber}>
        <div style={{ paddingBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:'0.875rem', color:C.ink, fontWeight:500 }}>Kelajuan Ticker</span>
            <span style={{ fontWeight:700, color:C.blue }}>{cfg.ticker_speed||50}</span>
          </div>
          <input type="range" min={1} max={100} value={cfg.ticker_speed||50}
            onChange={e=>set('ticker_speed',Number(e.target.value))}
            style={{ width:'100%', accentColor: C.blue }}
          />
        </div>
      </Card>

      <Btn onClick={handleSave} disabled={saving} size="lg" style={{ width:'100%' }}>
        <Save size={15} />
        {saving ? 'Menyimpan...' : 'Simpan Semua Tetapan'}
      </Btn>
    </div>
  );
}
