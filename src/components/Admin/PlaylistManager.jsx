import { useState, useEffect, useRef } from 'react';
import GlassCard from '../shared/GlassCard';
import useStore from '../../store/useStore';
import {
  getPlaylists, upsertPlaylist, deletePlaylist, getAudioItems,
} from '../../lib/supabase';
import { updateFeatureSettings } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';

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
  borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px',
};
const labelStyle = {
  color: '#C9A84C', fontSize: '13px', display: 'block',
  marginBottom: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
};

const CATEGORY_COLORS = {
  zikir: 'rgba(201,168,76,0.2)',
  quran: 'rgba(13,79,79,0.4)',
  nasheed: 'rgba(26,122,94,0.3)',
};

export default function PlaylistManager() {
  const { user, featureSettings, setFeatureSettings } = useStore();
  const [playlists, setPlaylists] = useState([]);
  const [audioItems, setAudioItems] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistCategory, setNewPlaylistCategory] = useState('zikir');
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [creating, setCreating] = useState(false);
  const dragIndex = useRef(null);

  const loadPlaylists = async () => {
    if (!user?.id) return;
    const { data } = await getPlaylists(user.id);
    if (data) setPlaylists(data);
  };

  const loadAudioItems = async () => {
    if (!user?.id) return;
    const { data } = await getAudioItems(user.id);
    if (data) setAudioItems(data);
  };

  useEffect(() => {
    loadPlaylists();
    loadAudioItems();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!user?.id || !newPlaylistName.trim()) return;
    setCreating(true);
    const { data } = await upsertPlaylist({
      user_id: user.id,
      name: newPlaylistName.trim(),
      category: newPlaylistCategory,
    });
    if (data) {
      setNewPlaylistName('');
      await loadPlaylists();
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    await deletePlaylist(id);
    await loadPlaylists();
    if (editingPlaylistId === id) setEditingPlaylistId(null);
  };

  const handleAddToPlaylist = async (playlistId, audioItem) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    const existingItems = playlist.playlist_items || [];
    const alreadyIn = existingItems.some(pi => pi.audio_item_id === audioItem.id);
    if (alreadyIn) return;
    await supabase.from('playlist_items').insert({
      playlist_id: playlistId,
      audio_item_id: audioItem.id,
      display_order: existingItems.length,
    });
    await loadPlaylists();
  };

  const handleRemoveFromPlaylist = async (playlistItemId) => {
    await supabase.from('playlist_items').delete().eq('id', playlistItemId);
    await loadPlaylists();
  };

  const handleReorderPlaylistItems = async (playlistId, fromIndex, toIndex) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    const items = [...(playlist.playlist_items || [])];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    for (let i = 0; i < items.length; i++) {
      if (items[i].display_order !== i) {
        await supabase.from('playlist_items')
          .update({ display_order: i })
          .eq('id', items[i].id);
      }
    }
    await loadPlaylists();
  };

  const handleSetActive = async (playlistId) => {
    if (!user?.id) return;
    const { data } = await updateFeatureSettings(user.id, { active_playlist_id: playlistId });
    if (data) setFeatureSettings(data);
  };

  return (
    <div>
      {/* Create form */}
      <GlassCard>
        <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: '0 0 16px 0' }}>
          Cipta Senarai Main Baharu
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Nama Senarai Main</label>
            <input
              type="text"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder="cth: Zikir Pagi"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Kategori</label>
            <select value={newPlaylistCategory} onChange={e => setNewPlaylistCategory(e.target.value)} style={inputStyle}>
              <option value="zikir">Zikir</option>
              <option value="quran">Quran</option>
              <option value="nasheed">Nasheed</option>
            </select>
          </div>
          <button onClick={handleCreate} disabled={creating || !newPlaylistName.trim()} style={{ ...btnPrimary, opacity: creating || !newPlaylistName.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}>
            {creating ? 'Mencipta...' : 'Cipta'}
          </button>
        </div>
      </GlassCard>

      {/* Playlist list */}
      {playlists.length === 0 && (
        <GlassCard style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(245,237,214,0.5)', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '24px 0' }}>
            Tiada senarai main lagi
          </p>
        </GlassCard>
      )}

      {playlists.map(playlist => {
        const isEditing = editingPlaylistId === playlist.id;
        const isActive = featureSettings?.active_playlist_id === playlist.id;
        const trackCount = playlist.playlist_items?.length || 0;
        const filteredAudio = audioItems.filter(a => a.category === playlist.category);

        return (
          <GlassCard key={playlist.id} style={{ marginTop: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isEditing ? '16px' : 0 }}>
              <h3 style={{ fontFamily: "'Cinzel Decorative', serif", color: '#C9A84C', fontSize: '1rem', margin: 0, flex: 1 }}>
                {playlist.name}
              </h3>

              <span style={{
                background: CATEGORY_COLORS[playlist.category] || 'rgba(201,168,76,0.1)',
                color: '#C9A84C', borderRadius: '4px', padding: '2px 8px',
                fontSize: '11px', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {playlist.category}
              </span>

              <span style={{
                background: 'rgba(255,255,255,0.08)', color: 'rgba(245,237,214,0.6)',
                borderRadius: '12px', padding: '2px 8px', fontSize: '11px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {trackCount} trek
              </span>

              {isActive && (
                <span style={{
                  background: 'rgba(201,168,76,0.2)', color: '#C9A84C',
                  borderRadius: '4px', padding: '2px 10px', fontSize: '11px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
                }}>
                  ● AKTIF
                </span>
              )}

              {!isActive && (
                <button onClick={() => handleSetActive(playlist.id)} style={{ ...btnSecondary, fontSize: '12px', padding: '4px 10px' }}>
                  Jadikan Aktif
                </button>
              )}

              <button
                onClick={() => setEditingPlaylistId(isEditing ? null : playlist.id)}
                style={{ ...btnSecondary, fontSize: '12px', padding: '4px 10px' }}
              >
                {isEditing ? 'Tutup' : 'Edit'}
              </button>
              <button
                onClick={() => handleDelete(playlist.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.7)', fontSize: '16px', padding: '4px' }}
              >
                🗑
              </button>
            </div>

            {/* Edit panel */}
            {isEditing && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Left: available audio */}
                <div>
                  <h4 style={{ color: 'rgba(245,237,214,0.7)', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 10px 0', fontWeight: 600 }}>
                    Audio Tersedia ({filteredAudio.length})
                  </h4>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredAudio.length === 0 && (
                      <p style={{ color: 'rgba(245,237,214,0.4)', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Tiada audio dalam kategori ini
                      </p>
                    )}
                    {filteredAudio.map(audio => {
                      const inPlaylist = playlist.playlist_items?.some(pi => pi.audio_item_id === audio.id);
                      return (
                        <div
                          key={audio.id}
                          onClick={() => !inPlaylist && handleAddToPlaylist(playlist.id, audio)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 10px', borderRadius: '6px', marginBottom: '4px',
                            background: inPlaylist ? 'rgba(201,168,76,0.05)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${inPlaylist ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.08)'}`,
                            cursor: inPlaylist ? 'default' : 'pointer',
                            opacity: inPlaylist ? 0.5 : 1,
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>🎵</span>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ color: '#F5EDD6', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {audio.title}
                            </div>
                          </div>
                          {!inPlaylist && <span style={{ color: '#C9A84C', fontSize: '12px' }}>+ Tambah</span>}
                          {inPlaylist && <span style={{ color: 'rgba(201,168,76,0.5)', fontSize: '12px' }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: current playlist tracks */}
                <div>
                  <h4 style={{ color: 'rgba(245,237,214,0.7)', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 10px 0', fontWeight: 600 }}>
                    Dalam Senarai Main ({trackCount})
                  </h4>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {trackCount === 0 && (
                      <p style={{ color: 'rgba(245,237,214,0.4)', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Tiada trek lagi
                      </p>
                    )}
                    {(playlist.playlist_items || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map((pi, i) => (
                      <div
                        key={pi.id}
                        draggable
                        onDragStart={() => { dragIndex.current = i; }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragIndex.current !== null && dragIndex.current !== i) {
                            handleReorderPlaylistItems(playlist.id, dragIndex.current, i);
                            dragIndex.current = null;
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 10px', borderRadius: '6px', marginBottom: '4px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(201,168,76,0.08)',
                          cursor: 'grab',
                        }}
                      >
                        <span style={{ color: 'rgba(245,237,214,0.3)', fontSize: '14px', cursor: 'grab', userSelect: 'none' }}>⋮⋮</span>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ color: '#F5EDD6', fontSize: '13px', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pi.audio_items?.title || `Trek ${i + 1}`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFromPlaylist(pi.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', fontSize: '14px', padding: '2px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}
