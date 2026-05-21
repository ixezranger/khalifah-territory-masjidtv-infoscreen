import { useState } from 'react';
import GlassCard from '../shared/GlassCard';
import MediaUploader from '../shared/MediaUploader';
import useStore from '../../store/useStore';
import { updateProfile } from '../../lib/supabase';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(201,168,76,0.3)',
  color: '#F5EDD6',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnPrimary = {
  background: '#C9A84C',
  color: '#050E1A',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 600,
  fontSize: '14px',
};

const btnDanger = {
  background: 'transparent',
  color: '#ef4444',
  border: '1px solid rgba(239,68,68,0.4)',
  borderRadius: '8px',
  padding: '8px 16px',
  cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '13px',
};

const labelStyle = {
  color: '#C9A84C',
  fontSize: '13px',
  display: 'block',
  marginBottom: '6px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 600,
};

function Section({ title, children }) {
  return (
    <GlassCard style={{ marginBottom: '16px' }}>
      <h3 style={{
        fontFamily: "'Cinzel Decorative', serif",
        color: '#C9A84C',
        fontSize: '1rem',
        margin: '0 0 16px 0',
      }}>{title}</h3>
      {children}
    </GlassCard>
  );
}

function UrlInput({ label, hint, value, onChange, onSave, onRemove, saving, preview, previewType = 'image' }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {hint && <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '12px', margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{hint}</p>}

      {/* Preview */}
      {value && (
        <div style={{ marginBottom: '12px' }}>
          {previewType === 'image' ? (
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.3)' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <img
              src={value}
              alt="Icon preview"
              style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(255,255,255,0.05)' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="url"
          value={preview}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={onSave} disabled={saving} style={{ ...btnPrimary, padding: '10px 16px', whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Simpan...' : 'Simpan'}
        </button>
      </div>

      {value && (
        <button onClick={onRemove} style={btnDanger}>
          Buang
        </button>
      )}
    </div>
  );
}

export default function AppearanceSettings() {
  const { user, profile, setProfile } = useStore();

  // Background image
  const [bgUrl, setBgUrl]       = useState(profile?.background_image_url || '');
  const [bgSaving, setBgSaving] = useState(false);

  // Masjid icon / logo
  const [iconUrl, setIconUrl]         = useState(profile?.icon_url || '');
  const [iconSaving, setIconSaving]   = useState(false);

  // Background opacity overlay (0–100)
  const [bgOpacity, setBgOpacity]       = useState(profile?.bg_overlay_opacity ?? 40);
  const [opacitySaving, setOpacitySaving] = useState(false);

  async function save(fields) {
    if (!user?.id) return null;
    const { data } = await updateProfile(user.id, fields);
    if (data) setProfile(data);
    return data;
  }

  const handleSaveBg = async () => {
    setBgSaving(true);
    await save({ background_image_url: bgUrl.trim() || null });
    setBgSaving(false);
  };

  const handleRemoveBg = async () => {
    setBgUrl('');
    await save({ background_image_url: null });
  };

  const handleSaveIcon = async () => {
    setIconSaving(true);
    await save({ icon_url: iconUrl.trim() || null });
    setIconSaving(false);
  };

  const handleRemoveIcon = async () => {
    setIconUrl('');
    await save({ icon_url: null });
  };

  const handleSaveOpacity = async () => {
    setOpacitySaving(true);
    await save({ bg_overlay_opacity: bgOpacity });
    setOpacitySaving(false);
  };

  return (
    <div>
      {/* ── Background Image ───────────────────────────────────────── */}
      <Section title="🖼 Imej Latar Belakang">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '4px' }}>
          <span style={{
            padding: '6px 14px', borderRadius: '6px', background: '#C9A84C',
            color: '#050E1A', fontSize: '13px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>🔗 URL Luar</span>
          <span style={{ padding: '6px 14px', fontSize: '13px', color: 'rgba(245,237,214,0.4)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            (atau guna muat naik di bawah)
          </span>
        </div>

        <UrlInput
          label="URL Imej Latar"
          hint="Masukkan URL terus dari hosting anda (JPG, PNG, WebP, GIF)"
          value={profile?.background_image_url}
          preview={bgUrl}
          onChange={setBgUrl}
          onSave={handleSaveBg}
          onRemove={handleRemoveBg}
          saving={bgSaving}
          previewType="image"
        />

        <div style={{ margin: '20px 0 4px', borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: '16px' }}>
          <label style={labelStyle}>📁 Atau Muat Naik Terus</label>
          <MediaUploader
            accept="image"
            userId={user?.id}
            uploadPath="backgrounds"
            onUploadComplete={async ({ url }) => {
              setBgUrl(url);
              await save({ background_image_url: url });
            }}
          />
        </div>
      </Section>

      {/* ── Background Overlay Opacity ─────────────────────────────── */}
      <Section title="🌗 Kegelapan Overlay Latar">
        <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '13px', margin: '0 0 12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Kawal berapa gelap lapisan hitam di atas imej latar supaya teks tetap boleh dibaca.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input
            type="range" min={0} max={90} value={bgOpacity}
            onChange={(e) => setBgOpacity(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#C9A84C' }}
          />
          <span style={{ color: '#C9A84C', fontWeight: 700, minWidth: '40px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {bgOpacity}%
          </span>
          <button onClick={handleSaveOpacity} disabled={opacitySaving} style={{ ...btnPrimary, opacity: opacitySaving ? 0.7 : 1 }}>
            {opacitySaving ? 'Simpan...' : 'Simpan'}
          </button>
        </div>

        {/* Live preview swatch */}
        <div style={{
          marginTop: '12px', height: '40px', borderRadius: '8px', overflow: 'hidden',
          border: '1px solid rgba(201,168,76,0.2)', position: 'relative',
          background: profile?.background_image_url
            ? `url(${profile.background_image_url}) center/cover`
            : 'linear-gradient(135deg,#1a2b5f,#0f1f4a)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `rgba(0,0,0,${bgOpacity / 100})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '11px', fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Preview Overlay
          </div>
        </div>
      </Section>

      {/* ── Masjid Icon / Logo ─────────────────────────────────────── */}
      <Section title="🕌 Ikon / Logo Masjid">
        <UrlInput
          label="URL Ikon atau Logo"
          hint="Gunakan PNG/SVG dengan latar telus untuk hasil terbaik. Saiz cadangan: 256×256px"
          value={profile?.icon_url}
          preview={iconUrl}
          onChange={setIconUrl}
          onSave={handleSaveIcon}
          onRemove={handleRemoveIcon}
          saving={iconSaving}
          previewType="icon"
        />
      </Section>

      {/* ── Colour Theme ──────────────────────────────────────────── */}
      <Section title="🎨 Tema Warna">
        <p style={{
          color: '#F5EDD6', fontStyle: 'italic', opacity: 0.6,
          fontSize: '0.9rem', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0,
        }}>
          Pilihan tema tambahan akan datang
        </p>
      </Section>
    </div>
  );
}
