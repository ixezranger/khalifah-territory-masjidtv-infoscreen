import { useState } from 'react';
import { Palette, Image, Eye, Landmark } from 'lucide-react';
import { Card, Field, Input, Btn, Alert, Divider, PageWrap, C } from './ui';
import MediaUploader from '../shared/MediaUploader';
import useStore from '../../store/useStore';
import { updateProfile } from '../../lib/supabase';

function UrlPreview({ url, type }) {
  if (!url) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <img
        src={url} alt="Preview"
        style={{
          width: type === 'icon' ? 80 : '100%',
          height: type === 'icon' ? 80 : 90,
          objectFit: type === 'icon' ? 'contain' : 'cover',
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          background: 'rgba(17,116,255,0.04)',
          display: 'block',
        }}
        onError={e => { e.target.style.display='none'; }}
        onLoad={e  => { e.target.style.display='block'; }}
      />
    </div>
  );
}

export default function AppearanceSettings() {
  const { user, profile, setProfile } = useStore();
  const [bgUrl,    setBgUrl]    = useState(profile?.background_image_url || '');
  const [iconUrl,  setIconUrl]  = useState(profile?.icon_url             || '');
  const [opacity,  setOpacity]  = useState(profile?.bg_overlay_opacity   ?? 40);
  const [bgSaving,   setBgSaving]   = useState(false);
  const [iconSaving, setIconSaving] = useState(false);
  const [opSaving,   setOpSaving]   = useState(false);
  const [msg,    setMsg]    = useState('');
  const [msgKey, setMsgKey] = useState('');

  const flash = key => { setMsgKey(key); setMsg('✓ Tersimpan'); setTimeout(() => setMsg(''), 2500); };

  const save = async fields => {
    if (!user?.id) return null;
    const { data } = await updateProfile(user.id, fields);
    if (data) setProfile(data);
    return data;
  };

  return (
    <PageWrap maxWidth={680}>

      {/* Background image */}
      <Card title="Imej Latar Belakang" icon={Image} accent={C.violet}>
        {msg && msgKey === 'bg' && <Alert type="success">{msg}</Alert>}

        <Field label="URL Imej dari Hosting Anda" hint="JPG, PNG, WebP, GIF — terus dari URL awam anda">
          <UrlPreview url={profile?.background_image_url} type="banner" />
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              type="url" value={bgUrl} onChange={e => setBgUrl(e.target.value)}
              placeholder="https://yourdomain.com/bg.jpg"
              style={{ flex: 1 }}
            />
            <Btn onClick={async () => { setBgSaving(true); await save({ background_image_url: bgUrl.trim()||null }); setBgSaving(false); flash('bg'); }} disabled={bgSaving} size="md">
              {bgSaving ? '...' : 'Simpan'}
            </Btn>
          </div>
          {profile?.background_image_url && (
            <Btn variant="danger" size="sm" style={{ marginTop: 8 }} onClick={async () => { setBgUrl(''); await save({ background_image_url: null }); }}>
              Buang
            </Btn>
          )}
        </Field>

        <Divider label="atau muat naik fail" />

        <MediaUploader accept="image" userId={user?.id} uploadPath="backgrounds"
          onUploadComplete={async ({ url }) => { setBgUrl(url); await save({ background_image_url: url }); flash('bg'); }}
        />
      </Card>

      {/* Overlay opacity */}
      <Card title="Kegelapan Overlay" icon={Eye} accent={C.cyan}>
        {msg && msgKey === 'op' && <Alert type="success">{msg}</Alert>}
        <p style={{ fontSize: '0.82rem', color: C.muted, margin: '0 0 14px' }}>
          Kawal berapa gelap lapisan di atas imej latar supaya teks mudah dibaca.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <input type="range" min={0} max={90} value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            style={{ flex: 1, accentColor: C.blue }}
          />
          <span style={{ minWidth: 44, fontWeight: 700, color: C.blue, fontSize: '0.9rem', textAlign: 'right' }}>
            {opacity}%
          </span>
          <Btn onClick={async () => { setOpSaving(true); await save({ bg_overlay_opacity: opacity }); setOpSaving(false); flash('op'); }} disabled={opSaving} size="sm">
            {opSaving ? '...' : 'Simpan'}
          </Btn>
        </div>

        {/* Live swatch */}
        <div style={{
          height: 44, borderRadius: 10, overflow: 'hidden', position: 'relative',
          background: profile?.background_image_url
            ? `url(${profile.background_image_url}) center/cover` : 'linear-gradient(135deg,#1a3a6b,#0f1f4a)',
          border: `1px solid ${C.line}`,
        }}>
          <div style={{
            position: 'absolute', inset: 0, background: `rgba(0,0,0,${opacity/100})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em',
          }}>Pratonton Overlay</div>
        </div>
      </Card>

      {/* Masjid icon */}
      <Card title="Ikon / Logo Masjid" icon={Landmark} accent={C.green}>
        {msg && msgKey === 'icon' && <Alert type="success">{msg}</Alert>}

        <Field label="URL Ikon atau Logo" hint="PNG/SVG latar telus disyorkan · Saiz cadangan 256×256px">
          <UrlPreview url={profile?.icon_url} type="icon" />
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              type="url" value={iconUrl} onChange={e => setIconUrl(e.target.value)}
              placeholder="https://yourdomain.com/logo.png"
              style={{ flex: 1 }}
            />
            <Btn onClick={async () => { setIconSaving(true); await save({ icon_url: iconUrl.trim()||null }); setIconSaving(false); flash('icon'); }} disabled={iconSaving} size="md">
              {iconSaving ? '...' : 'Simpan'}
            </Btn>
          </div>
          {profile?.icon_url && (
            <Btn variant="danger" size="sm" style={{ marginTop: 8 }} onClick={async () => { setIconUrl(''); await save({ icon_url: null }); }}>
              Buang
            </Btn>
          )}
        </Field>
      </Card>

      {/* Theme placeholder */}
      <Card title="Tema Warna" icon={Palette} accent={C.purple}>
        <p style={{ color: C.faint, fontSize: '0.85rem', fontStyle: 'italic' }}>Pilihan tema tambahan akan datang</p>
      </Card>

    </PageWrap>
  );
}
