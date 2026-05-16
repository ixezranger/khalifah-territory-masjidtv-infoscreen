import { useState, useEffect } from 'react';
import GlassCard from '../shared/GlassCard';
import useStore from '../../store/useStore';
import { getProfile, updateProfile } from '../../lib/supabase';

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
  width: '100%',
};

const labelStyle = {
  color: '#C9A84C',
  fontSize: '13px',
  display: 'block',
  marginBottom: '6px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 600,
};

export default function MasjidProfileEditor() {
  const { user, profile, setProfile } = useStore();
  const [masjidName, setMasjidName] = useState('');
  const [description, setDescription] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setMasjidName(profile.masjid_name || '');
      const desc = profile.masjid_description || '';
      setDescription(desc);
      setCharCount(desc.length);
    } else if (user?.id) {
      getProfile(user.id).then(({ data }) => {
        if (data) {
          setMasjidName(data.masjid_name || '');
          const desc = data.masjid_description || '';
          setDescription(desc);
          setCharCount(desc.length);
          setProfile(data);
        }
      });
    }
  }, [profile, user, setProfile]);

  const handleDescChange = (e) => {
    const val = e.target.value;
    if (val.length <= 200) {
      setDescription(val);
      setCharCount(val.length);
    }
  };

  const handleSave = async () => {
    if (!masjidName.trim()) {
      setError('Nama Masjid diperlukan.');
      return;
    }
    if (!user?.id) {
      setError('Pengguna tidak log masuk.');
      return;
    }
    setSaving(true);
    setError('');
    const { data, error: saveError } = await updateProfile(user.id, {
      masjid_name: masjidName.trim(),
      masjid_description: description.trim(),
    });
    setSaving(false);
    if (saveError) {
      setError(saveError.message || 'Gagal menyimpan profil.');
    } else if (data) {
      setProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <GlassCard style={{ maxWidth: 600 }}>
      <h3 style={{
        fontFamily: "'Cinzel Decorative', serif",
        color: '#C9A84C',
        fontSize: '1rem',
        margin: '0 0 20px 0',
      }}>
        Profil Masjid / Surau
      </h3>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Nama Masjid/Surau *</label>
        <input
          type="text"
          value={masjidName}
          onChange={(e) => setMasjidName(e.target.value)}
          placeholder="cth: Masjid Al-Hidayah"
          style={inputStyle}
          required
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Keterangan Ringkas</label>
        <textarea
          value={description}
          onChange={handleDescChange}
          placeholder="Keterangan ringkas tentang masjid..."
          rows={3}
          maxLength={200}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <div style={{
          textAlign: 'right',
          color: 'rgba(245,237,214,0.5)',
          fontSize: '12px',
          marginTop: '4px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {charCount}/200
        </div>
      </div>

      {error && (
        <div style={{
          color: '#f87171',
          fontSize: '13px',
          marginBottom: '12px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}
      >
        {saving ? 'Menyimpan...' : 'Simpan Profil'}
      </button>

      {saved && (
        <div style={{
          marginTop: '12px',
          padding: '10px 16px',
          background: 'rgba(74,222,128,0.1)',
          border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: '8px',
          color: '#4ade80',
          fontSize: '13px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          textAlign: 'center',
        }}>
          Profil disimpan ✓
        </div>
      )}
    </GlassCard>
  );
}
