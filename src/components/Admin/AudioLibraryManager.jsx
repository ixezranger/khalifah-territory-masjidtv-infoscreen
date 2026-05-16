import { useState, useEffect } from 'react';
import GlassCard from '../shared/GlassCard';
import MediaUploader from '../shared/MediaUploader';
import CrescentIcon from '../shared/CrescentIcon';
import useStore from '../../store/useStore';
import { getAudioItems, upsertAudioItem, deleteAudioItem } from '../../lib/supabase';
import GoogleDriveImporter from './GoogleDriveImporter';

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
};
const btnSecondary = {
  background: 'transparent', color: '#C9A84C',
  border: '1px solid rgba(201,168,76,0.4)',
  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px',
};
const labelStyle = {
  color: '#C9A84C', fontSize: '13px', display: 'block',
  marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
};

const CATEGORIES = ['Zikir', 'Quran', 'Nasheed'];
const CATEGORY_COLORS = {
  zikir: 'rgba(201,168,76,0.2)',
  quran: 'rgba(13,79,79,0.4)',
  nasheed: 'rgba(26,122,94,0.3)',
};

export default function AudioLibraryManager() {
  const { user, audioItems, setAudioItems } = useStore();
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('zikir');
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newCategory, setNewCategory] = useState('zikir');
  const [adding, setAdding] = useState(false);
  const [showDriveImporter, setShowDriveImporter] = useState(false);
  const [pendingAudio, setPendingAudio] = useState(null);

  const loadItems = async () => {
    if (!user?.id) return;
    const { data } = await getAudioItems(user.id);
    if (data) {
      setItems(data);
      setAudioItems(data);
    }
  };

  useEffect(() => { loadItems(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAudioUpload = ({ url }) => {
    setPendingAudio(url);
  };

  const handleAddAudio = async () => {
    if (!user?.id || !pendingAudio) return;
    setAdding(true);
    const { data } = await upsertAudioItem({
      user_id: user.id,
      title: newTitle.trim() || 'Audio Baharu',
      artist: newArtist.trim() || '',
      category: newCategory,
      audio_url: pendingAudio,
      display_order: items.length,
      is_active: true,
      storage_provider: 'r2',
    });
    if (data) {
      setNewTitle('');
      setNewArtist('');
      setPendingAudio(null);
      await loadItems();
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    await deleteAudioItem(id);
    await loadItems();
  };

  const handleToggleActive = async (item) => {
    await upsertAudioItem({ ...item, is_active: !item.is_active });
    await loadItems();
  };

  const handleDriveImport = async () => {
    await loadItems();
    setShowDriveImporter(false);
  };

  const tabStyle = (active) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '13px',
    border: 'none',
    background: active ? '#C9A84C' : 'transparent',
    color: active ? '#050E1A' : 'rgba(245,237,214,0.6)',
    fontWeight: active ? 600 : 400,
  });

  const filteredItems = items.filter(item => item.category === activeCategory);

  return (
    <div>
      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat.toLowerCase())}
            style={tabStyle(activeCategory === cat.toLowerCase())}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Audio */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 16px 0' }}>
          Tambah Audio
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <MediaUploader
            accept="audio"
            userId={user?.id}
            uploadPath="audio"
            onUploadComplete={handleAudioUpload}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Tajuk</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Tajuk audio"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Artis / Qari</label>
            <input
              type="text"
              value={newArtist}
              onChange={e => setNewArtist(e.target.value)}
              placeholder="Nama artis"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Kategori</label>
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="zikir">Zikir</option>
            <option value="quran">Quran</option>
            <option value="nasheed">Nasheed</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleAddAudio} disabled={adding || !pendingAudio} style={{ ...btnPrimary, opacity: adding || !pendingAudio ? 0.6 : 1 }}>
            {adding ? 'Menambah...' : '+ Tambah Audio'}
          </button>
          <button onClick={() => setShowDriveImporter(true)} style={btnSecondary}>
            📁 Import Google Drive
          </button>
        </div>
      </GlassCard>

      {/* Google Drive Importer */}
      {showDriveImporter && (
        <div style={{ marginTop: '16px' }}>
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: 0 }}>
                Import dari Google Drive
              </h3>
              <button
                onClick={() => setShowDriveImporter(false)}
                style={{ ...btnSecondary, padding: '6px 12px' }}
              >
                ✕ Tutup
              </button>
            </div>
            <GoogleDriveImporter onImportComplete={handleDriveImport} />
          </GlassCard>
        </div>
      )}

      {/* Items list */}
      <GlassCard style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: 0 }}>
            {CATEGORIES.find(c => c.toLowerCase() === activeCategory)} ({filteredItems.length})
          </h3>
        </div>

        {filteredItems.length === 0 && (
          <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'center', padding: '24px 0' }}>
            Tiada audio dalam kategori ini
          </p>
        )}

        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              marginBottom: '8px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(201,168,76,0.1)',
            }}
          >
            {/* Cover / icon */}
            {item.cover_image_url ? (
              <img
                src={item.cover_image_url}
                alt=""
                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: '48px', height: '48px', borderRadius: '6px', flexShrink: 0,
                background: CATEGORY_COLORS[item.category] || 'rgba(201,168,76,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CrescentIcon size={24} />
              </div>
            )}

            {/* Title & artist */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                color: '#F5EDD6', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item.title}
              </div>
              {item.artist && (
                <div style={{ color: 'rgba(245,237,214,0.5)', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.artist}
                </div>
              )}
            </div>

            {/* Category badge */}
            <span style={{
              background: CATEGORY_COLORS[item.category] || 'rgba(201,168,76,0.1)',
              color: '#C9A84C', borderRadius: '4px', padding: '2px 8px',
              fontSize: '11px', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0,
            }}>
              {item.category}
            </span>

            {/* Duration */}
            {item.duration && (
              <span style={{ color: 'rgba(245,237,214,0.4)', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0 }}>
                {item.duration}s
              </span>
            )}

            {/* Active toggle */}
            <div
              onClick={() => handleToggleActive(item)}
              style={{
                width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
                background: item.is_active ? '#C9A84C' : 'rgba(255,255,255,0.15)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
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
        ))}
      </GlassCard>
    </div>
  );
}
