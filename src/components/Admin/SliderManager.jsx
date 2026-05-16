import { useState, useEffect, useRef } from 'react';
import GlassCard from '../shared/GlassCard';
import MediaUploader from '../shared/MediaUploader';
import useStore from '../../store/useStore';
import { getSliderItems, upsertSliderItem, deleteSliderItem } from '../../lib/supabase';

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

const btnSecondary = {
  background: 'transparent',
  color: '#C9A84C',
  border: '1px solid rgba(201,168,76,0.4)',
  borderRadius: '8px',
  padding: '10px 20px',
  cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '14px',
};

const labelStyle = {
  color: '#C9A84C',
  fontSize: '13px',
  display: 'block',
  marginBottom: '6px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 600,
};

function extractYoutubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

export default function SliderManager() {
  const { user, sliderItems, setSliderItems, featureSettings, setFeatureSettings } = useStore();
  const [items, setItems] = useState([]);
  const [addTab, setAddTab] = useState('upload');
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(8);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [pendingMedia, setPendingMedia] = useState(null);
  const [sliderLimit, setSliderLimit] = useState(featureSettings?.slider_limit || 10);
  const [savingLimit, setSavingLimit] = useState(false);
  const [adding, setAdding] = useState(false);
  const dragIndex = useRef(null);

  const loadItems = async () => {
    if (!user?.id) return;
    const { data } = await getSliderItems(user.id);
    if (data) {
      setItems(data);
      setSliderItems(data);
    }
  };

  useEffect(() => { loadItems(); }, [user?.id]);

  const handleMediaUpload = ({ url, type }) => {
    setPendingMedia({ url, type });
  };

  const handleAddSlide = async () => {
    if (!user?.id) return;
    if (addTab === 'upload' && !pendingMedia) return;
    if (addTab === 'youtube' && !newYoutubeUrl.trim()) return;

    setAdding(true);
    let item = {
      user_id: user.id,
      title: newTitle.trim() || 'Slaid Baharu',
      duration: Number(newDuration) || 8,
      display_order: items.length,
      is_active: true,
    };

    if (addTab === 'upload' && pendingMedia) {
      item.media_url = pendingMedia.url;
      item.media_type = pendingMedia.type === 'image' ? 'image' : 'video';
    } else if (addTab === 'youtube') {
      const ytId = extractYoutubeId(newYoutubeUrl);
      item.media_url = newYoutubeUrl;
      item.media_type = 'youtube';
      item.youtube_id = ytId;
    }

    const { data } = await upsertSliderItem(item);
    if (data) {
      setNewTitle('');
      setNewDuration(8);
      setNewYoutubeUrl('');
      setPendingMedia(null);
      await loadItems();
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    await deleteSliderItem(id);
    await loadItems();
  };

  const handleToggleActive = async (item) => {
    await upsertSliderItem({ ...item, is_active: !item.is_active });
    await loadItems();
  };

  const handleReorder = async (dropIndex) => {
    if (dragIndex.current === null || dragIndex.current === dropIndex) return;
    const reordered = [...items];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dropIndex, 0, moved);
    setItems(reordered);
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].display_order !== i) {
        await upsertSliderItem({ ...reordered[i], display_order: i });
      }
    }
    dragIndex.current = null;
    await loadItems();
  };

  const handleSaveLimit = async () => {
    setSavingLimit(true);
    setFeatureSettings({ ...featureSettings, slider_limit: sliderLimit });
    setSavingLimit(false);
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

  return (
    <div>
      {/* Add Slide */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 16px 0' }}>
          Tambah Slaid Baharu
        </h3>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '4px' }}>
          <button onClick={() => setAddTab('upload')} style={tabStyle(addTab === 'upload')}>📁 Muat Naik</button>
          <button onClick={() => setAddTab('youtube')} style={tabStyle(addTab === 'youtube')}>▶ YouTube URL</button>
        </div>

        {addTab === 'upload' && (
          <div style={{ marginBottom: '16px' }}>
            <MediaUploader
              accept="image"
              userId={user?.id}
              uploadPath="slider"
              onUploadComplete={handleMediaUpload}
            />
          </div>
        )}

        {addTab === 'youtube' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>YouTube URL</label>
            <input
              type="text"
              value={newYoutubeUrl}
              onChange={(e) => setNewYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              style={{ ...inputStyle, marginBottom: '12px' }}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Tajuk Slaid</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tajuk (pilihan)"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tempoh (saat)</label>
            <input
              type="number"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              min={1}
              max={60}
              style={inputStyle}
            />
          </div>
        </div>

        <button onClick={handleAddSlide} disabled={adding} style={{ ...btnPrimary, opacity: adding ? 0.7 : 1 }}>
          {adding ? 'Menambah...' : '+ Tambah Slaid'}
        </button>
      </GlassCard>

      {/* Items List */}
      <GlassCard style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: 0 }}>
            Slaid Sedia Ada
          </h3>
          <span style={{
            background: 'rgba(201,168,76,0.15)',
            color: '#C9A84C',
            borderRadius: '12px',
            padding: '2px 10px',
            fontSize: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {items.length}
          </span>
        </div>

        {items.length === 0 && (
          <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: 'center', padding: '24px 0' }}>
            Tiada slaid lagi
          </p>
        )}

        {items.map((item, i) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => { dragIndex.current = i; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleReorder(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 0',
              borderBottom: i < items.length - 1 ? '1px solid rgba(201,168,76,0.1)' : 'none',
              cursor: 'grab',
            }}
          >
            {/* Drag handle */}
            <span style={{ color: 'rgba(245,237,214,0.3)', fontSize: '16px', cursor: 'grab', userSelect: 'none' }}>⋮⋮</span>

            {/* Thumbnail */}
            {item.media_type === 'image' && item.media_url ? (
              <img
                src={item.media_url}
                alt=""
                style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: '60px', height: '40px', borderRadius: '4px', flexShrink: 0,
                background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>
                {item.media_type === 'youtube' ? '▶' : '🎬'}
              </div>
            )}

            {/* Type badge */}
            <span style={{
              background: item.media_type === 'youtube' ? 'rgba(239,68,68,0.15)' : 'rgba(13,79,79,0.3)',
              color: item.media_type === 'youtube' ? '#f87171' : '#5eead4',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              flexShrink: 0,
            }}>
              {item.media_type || 'image'}
            </span>

            {/* Title */}
            <span style={{
              flex: 1,
              color: '#F5EDD6',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {item.title || 'Tanpa tajuk'}
            </span>

            {/* Duration */}
            <span style={{ color: 'rgba(245,237,214,0.5)', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0 }}>
              {item.duration || 8}s
            </span>

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

      {/* Slider Limit */}
      <GlassCard style={{ marginTop: '16px' }}>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 16px 0' }}>
          Had Slaid
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ color: '#F5EDD6', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Maksimum slaid:
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={sliderLimit}
            onChange={(e) => setSliderLimit(Number(e.target.value))}
            style={{ ...inputStyle, width: '80px' }}
          />
          <button onClick={handleSaveLimit} disabled={savingLimit} style={btnPrimary}>
            {savingLimit ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
