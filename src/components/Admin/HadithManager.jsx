import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { Card, Field, Btn, Alert, Empty, Row, Badge, C } from './ui';
import useStore from '../../store/useStore';
import { getHadithItems, upsertHadithItem, deleteHadithItem } from '../../lib/supabase';

export default function HadithManager() {
  const { user, setHadithItems } = useStore();
  const [items,       setItems]       = useState([]);
  const [arabic,      setArabic]      = useState('');
  const [translation, setTranslation] = useState('');
  const [source,      setSource]      = useState('');
  const [adding,      setAdding]      = useState(false);
  const [error,       setError]       = useState('');
  const [saved,       setSaved]       = useState(false);

  const load = async () => {
    if (!user?.id) return;
    const { data } = await getHadithItems(user.id);
    if (data) { setItems(data); setHadithItems(data); }
  };
  useEffect(() => { load(); }, [user?.id]); // eslint-disable-line

  const handleAdd = async () => {
    if (!translation.trim()) { setError('Terjemahan Melayu diperlukan.'); return; }
    setAdding(true); setError('');
    const { data, error: e } = await upsertHadithItem({
      user_id: user.id, arabic_text: arabic.trim(),
      malay_translation: translation.trim(), source: source.trim(), is_active: true,
    });
    if (e) setError(e.message || 'Gagal menambah hadith.');
    else if (data) { setArabic(''); setTranslation(''); setSource(''); setSaved(true); setTimeout(()=>setSaved(false),2000); await load(); }
    setAdding(false);
  };

  const handleDelete = async id => { await deleteHadithItem(id); await load(); };
  const handleToggle = async item => { await upsertHadithItem({ ...item, is_active: !item.is_active }); await load(); };

  return (
    <div style={{ maxWidth: 720 }}>

      {/* Add form */}
      <Card title="Tambah Hadith Baharu" icon={BookOpen} accent={C.amber}>
        {error && <Alert type="error">{error}</Alert>}
        {saved && <Alert type="success">✓ Hadith berjaya ditambah</Alert>}

        <Field label="Teks Arab">
          <textarea
            value={arabic} onChange={e => setArabic(e.target.value)}
            placeholder="أدخل الحديث هنا..."
            rows={3} dir="rtl"
            className="ms-input"
            style={{ fontFamily: "'Amiri', serif", fontSize: '1.15rem', color: C.blue, lineHeight: 1.8, resize: 'vertical', width: '100%' }}
          />
        </Field>

        <Field label="Terjemahan Melayu" required>
          <textarea value={translation} onChange={e => setTranslation(e.target.value)}
            placeholder="Masukkan terjemahan hadith..." rows={3} className="ms-input"
            style={{ resize: 'vertical', width: '100%' }}
          />
        </Field>

        <Field label="Sumber" hint="cth: HR. Bukhari No. 1">
          <input type="text" value={source} onChange={e => setSource(e.target.value)}
            placeholder="cth: HR. Bukhari No. 1" className="ms-input" />
        </Field>

        <Btn onClick={handleAdd} disabled={adding || !translation.trim()} style={{ marginTop: 4 }}>
          <Plus size={14} />
          {adding ? 'Menambah...' : 'Tambah Hadith'}
        </Btn>
      </Card>

      {/* List */}
      <Card title={`Senarai Hadith`} icon={BookOpen} accent={C.blue}
        action={<Badge color={C.blue}>{items.length}</Badge>}
      >
        {items.length === 0 ? (
          <Empty icon="📖" text="Tiada hadith lagi" sub="Tambah hadith pertama anda di atas" />
        ) : items.map((item, i) => (
          <Row key={item.id} last={i === items.length-1}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {item.arabic_text && (
                <div style={{ direction:'rtl', fontFamily:"'Amiri',serif", fontSize:'1rem', color: C.blue, marginBottom: 4,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {item.arabic_text.length > 70 ? item.arabic_text.slice(0,70)+'…' : item.arabic_text}
                </div>
              )}
              <div style={{ fontSize:'0.835rem', color: C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom: 3 }}>
                {item.malay_translation?.length > 90 ? item.malay_translation.slice(0,90)+'…' : item.malay_translation}
              </div>
              {item.source && (
                <div style={{ fontSize:'0.72rem', color: C.faint }}>{item.source}</div>
              )}
            </div>
            <Badge color={item.is_active ? C.green : C.faint}>{item.is_active ? 'Aktif' : 'Off'}</Badge>
            <Btn variant="ghost" size="sm" onClick={() => handleToggle(item)}>
              {item.is_active ? 'Sembunyi' : 'Aktif'}
            </Btn>
            <Btn variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
              <Trash2 size={12} />
            </Btn>
          </Row>
        ))}
      </Card>
    </div>
  );
}
