import { useState, useEffect } from 'react';
import { Building2, Save } from 'lucide-react';
import { Card, Field, Input, Textarea, Btn, Alert, PageWrap, C } from './ui';
import useStore from '../../store/useStore';
import { getProfile, updateProfile } from '../../lib/supabase';

export default function MasjidProfileEditor() {
  const { user, profile, setProfile } = useStore();
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [saved,  setSaved]      = useState(false);
  const [error,  setError]      = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.masjid_name || '');
      setDesc(profile.masjid_description || '');
    } else if (user?.id) {
      getProfile(user.id).then(({ data }) => {
        if (data) { setName(data.masjid_name||''); setDesc(data.masjid_description||''); setProfile(data); }
      });
    }
  }, [profile, user, setProfile]);

  const handleSave = async () => {
    if (!name.trim()) { setError('Nama Masjid diperlukan.'); return; }
    if (!user?.id)    { setError('Pengguna tidak log masuk.'); return; }
    setSaving(true); setError('');
    const { data, error: e } = await updateProfile(user.id, {
      masjid_name: name.trim(), masjid_description: desc.trim(),
    });
    setSaving(false);
    if (e) setError(e.message || 'Gagal menyimpan.');
    else if (data) { setProfile(data); setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  return (
    <PageWrap maxWidth={640}>
      <Card title="Profil Masjid / Surau" icon={Building2} accent={C.blue}>
        {error  && <Alert type="error">{error}</Alert>}
        {saved  && <Alert type="success">✓ Profil berjaya disimpan</Alert>}

        <Field label="Nama Masjid / Surau" required>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="cth: Masjid Al-Hidayah" />
        </Field>

        <Field label="Keterangan Ringkas" hint="Maksimum 200 aksara">
          <Textarea
            value={desc}
            onChange={e => { if (e.target.value.length <= 200) setDesc(e.target.value); }}
            placeholder="Keterangan ringkas tentang masjid..."
            rows={3}
          />
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: C.faint, marginTop: 4 }}>
            {desc.length}/200
          </div>
        </Field>

        <Btn onClick={handleSave} disabled={saving} size="md" style={{ marginTop: 4 }}>
          <Save size={14} />
          {saving ? 'Menyimpan...' : 'Simpan Profil'}
        </Btn>
      </Card>
    </PageWrap>
  );
}
