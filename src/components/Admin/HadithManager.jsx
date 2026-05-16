import { useState, useEffect } from 'react';
import GlassCard from '../shared/GlassCard';
import useStore from '../../store/useStore';
import { getHadithItems, upsertHadithItem, deleteHadithItem } from '../../lib/supabase';

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,168,76,0.3)',
  color: '#F5EDD6', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px',
  outline: 'none', boxSizing: 'border-box',
};
const btnPrimary = {
  background: '#C9A84C', color: '#050E1A', border: 'none',
  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '14px',
  width: '100%',
};
const labelStyle = {
  color: '#C9A84C', fontSize: '13px', display: 'block',
  marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
};

export default function HadithManager() {
  const { user, hadithItems, setHadithItems } = useStore();
  const [items, setItems] = useState([]);
  const [arabicText, setArabicText] = useState('');
  const [malayTranslation, setMalayTranslation] = useState('');
  const [source, setSource] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const loadItems = async () => {
    if (!user?.id) return;
    const { data } = await getHadithItems(user.id);
    if (data) {
      setItems(data);
      setHadithItems(data);
    }
  };

  useEffect(() => { loadItems(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async () => {
    if (!user?.id) return;
    if (!malayTranslation.trim()) {
      setError('Terjemahan Melayu diperlukan.');
      return;
    }
    setAdding(true);
    setError('');
    const { data, error: addErr } = await upsertHadithItem({
      user_id: user.id,
      arabic_text: arabicText.trim(),
      malay_translation: malayTranslation.trim(),
      source: source.trim(),
      is_active: true,
    });
    if (addErr) {
      setError(addErr.message || 'Gagal menambah hadith.');
    } else if (data) {
      setArabicText('');
      setMalayTranslation('');
      setSource('');
      await loadItems();
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    await deleteHadithItem(id);
    await loadItems();
  };

  const handleToggleActive = async (item) => {
    await upsertHadithItem({ ...item, is_active: !item.is_active });
    await loadItems();
  };

  return (
    <div>
      {/* Add form */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 20px 0' }}>
          Tambah Hadith
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Teks Arab</label>
          <textarea
            value={arabicText}
            onChange={e => setArabicText(e.target.value)}
            placeholder="أدخل الحديث هنا..."
            rows={3}
            dir="rtl"
            style={{
              ...inputStyle,
              fontFamily: "'Amiri', serif",
              fontSize: '1.2rem',
              color: '#C9A84C',
              resize: 'vertical',
              lineHeight: 1.8,
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Terjemahan Melayu *</label>
          <textarea
            value={malayTranslation}
            onChange={e => setMalayTranslation(e.target.value)}
            placeholder="Masukkan terjemahan hadith dalam Bahasa Melayu..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Sumber (cth: HR. Bukhari No. 123)</label>
          <input
            type="text"
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="cth: HR. Bukhari No. 123"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {error}
          </div>
        )}

        <button onClick={handleAdd} disabled={adding || !malayTranslation.trim()} style={{ ...btnPrimary, opacity: adding || !malayTranslation.trim() ? 0.6 : 1 }}>
          {adding ? 'Menambah...' : '+ Tambah Hadith'}
        </button>
      </GlassCard>

      {/* Hadith list */}
      {items.length === 0 && (
        <GlassCard style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '24px 0' }}>
            Tiada hadith lagi
          </p>
        </GlassCard>
      )}

      {items.map(item => (
        <GlassCard key={item.id} style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {item.arabic_text && (
                <div style={{
                  direction: 'rtl', fontFamily: "'Amiri', serif", fontSize: '1.1rem',
                  color: '#C9A84C', marginBottom: '8px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.arabic_text.length > 60 ? item.arabic_text.slice(0, 60) + '...' : item.arabic_text}
                </div>
              )}
              <div style={{
                color: '#F5EDD6', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item.malay_translation?.length > 80 ? item.malay_translation.slice(0, 80) + '...' : item.malay_translation}
              </div>
              {item.source && (
                <div style={{ color: 'rgba(245,237,214,0.45)', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.source}
                </div>
              )}
            </div>

            {/* Active toggle */}
            <div
              onClick={() => handleToggleActive(item)}
              style={{
                width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
                background: item.is_active ? '#C9A84C' : 'rgba(255,255,255,0.15)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                marginTop: '4px',
              }}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: item.is_active ? '19px' : '3px',
                width: '14px', height: '14px', borderRadius: '7px',
                background: item.is_active ? '#050E1A' : '#F5EDD6',
                transition: 'left 0.2s',
              }} />
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDelete(item.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'rgba(239,68,68,0.7)', fontSize: '16px', padding: '4px', flexShrink: 0,
              }}
            >
              🗑
            </button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
