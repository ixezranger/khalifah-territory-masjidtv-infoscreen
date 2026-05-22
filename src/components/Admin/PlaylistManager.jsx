import { useState, useEffect, useRef } from 'react';
import { ListMusic, Plus, Trash2, CheckCircle, Music } from 'lucide-react';
import { Card, Btn, Badge, Empty, Row, DragHandle, C } from './ui';
import useStore from '../../store/useStore';
import { getPlaylists, upsertPlaylist, deletePlaylist, getAudioItems, updateFeatureSettings, supabase } from '../../lib/supabase';

const CAT_COLOR = { zikir: C.amber, quran: C.blue, nasheed: C.green };

export default function PlaylistManager() {
  const { user, featureSettings, setFeatureSettings } = useStore();
  const [playlists,    setPlaylists]    = useState([]);
  const [audioItems,   setAudioItems]   = useState([]);
  const [newName,      setNewName]      = useState('');
  const [newCat,       setNewCat]       = useState('zikir');
  const [editId,       setEditId]       = useState(null);
  const [creating,     setCreating]     = useState(false);
  const dragIndex = useRef(null);

  const loadPlaylists  = async () => { if (!user?.id) return; const {data} = await getPlaylists(user.id);  if (data) setPlaylists(data); };
  const loadAudio      = async () => { if (!user?.id) return; const {data} = await getAudioItems(user.id); if (data) setAudioItems(data); };

  useEffect(() => { loadPlaylists(); loadAudio(); }, [user?.id]); // eslint-disable-line

  const handleCreate = async () => {
    if (!user?.id || !newName.trim()) return;
    setCreating(true);
    await upsertPlaylist({ user_id:user.id, name:newName.trim(), category:newCat });
    setNewName(''); await loadPlaylists(); setCreating(false);
  };

  const handleDelete = async id => {
    await deletePlaylist(id); await loadPlaylists();
    if (editId === id) setEditId(null);
  };

  const handleAddTrack = async (playlistId, audio) => {
    const pl = playlists.find(p => p.id === playlistId); if (!pl) return;
    const already = (pl.playlist_items||[]).some(pi => pi.audio_item_id === audio.id);
    if (already) return;
    await supabase.from('playlist_items').insert({ playlist_id:playlistId, audio_item_id:audio.id, display_order:(pl.playlist_items||[]).length });
    await loadPlaylists();
  };

  const handleRemoveTrack = async piId => {
    await supabase.from('playlist_items').delete().eq('id', piId);
    await loadPlaylists();
  };

  const handleReorder = async (playlistId, from, to) => {
    const pl = playlists.find(p=>p.id===playlistId); if (!pl) return;
    const arr = [...(pl.playlist_items||[])]; const [m] = arr.splice(from,1); arr.splice(to,0,m);
    for (let i=0;i<arr.length;i++) if (arr[i].display_order!==i) await supabase.from('playlist_items').update({display_order:i}).eq('id',arr[i].id);
    await loadPlaylists();
  };

  const handleSetActive = async id => {
    if (!user?.id) return;
    const {data} = await updateFeatureSettings(user.id, {active_playlist_id:id});
    if (data) setFeatureSettings(data);
  };

  return (
    <div style={{ maxWidth: 860 }}>

      {/* Create */}
      <Card title="Cipta Senarai Main Baharu" icon={ListMusic} accent={C.green}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:10, alignItems:'flex-end' }}>
          <div>
            <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Nama Senarai Main</label>
            <input type="text" value={newName} onChange={e=>setNewName(e.target.value)}
              placeholder="cth: Zikir Pagi" className="ms-input"
              onKeyDown={e=>e.key==='Enter'&&handleCreate()} />
          </div>
          <div>
            <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Kategori</label>
            <select value={newCat} onChange={e=>setNewCat(e.target.value)} className="ms-input">
              <option value="zikir">Zikir</option>
              <option value="quran">Quran</option>
              <option value="nasheed">Nasheed</option>
            </select>
          </div>
          <Btn onClick={handleCreate} disabled={creating||!newName.trim()} style={{ alignSelf:'flex-end' }}>
            <Plus size={14}/> {creating?'Mencipta...':'Cipta'}
          </Btn>
        </div>
      </Card>

      {/* List */}
      {playlists.length === 0 ? (
        <Card>
          <Empty icon="🎵" text="Tiada senarai main lagi" sub="Cipta senarai main pertama anda di atas" />
        </Card>
      ) : playlists.map(pl => {
        const isEdit   = editId === pl.id;
        const isActive = featureSettings?.active_playlist_id === pl.id;
        const tracks   = pl.playlist_items || [];
        const avail    = audioItems.filter(a => a.category === pl.category);
        const accent   = CAT_COLOR[pl.category] || C.blue;

        return (
          <div key={pl.id} style={{
            background:'rgba(255,255,255,0.76)',
            backdropFilter:'blur(32px) saturate(1.6)',
            border:`1px solid rgba(255,255,255,0.88)`,
            borderLeft: `4px solid ${accent}`,
            borderRadius:20, overflow:'hidden', marginBottom:16,
            boxShadow:`0 4px 28px rgba(17,50,140,0.08)`,
          }}>
            {/* Playlist header */}
            <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              {/* Icon */}
              <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:`${accent}18`, border:`1px solid ${accent}33` }}>
                <Music size={18} color={accent} />
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:'0.95rem', color:C.ink }}>{pl.name}</div>
                <div style={{ fontSize:'0.75rem', color:C.faint }}>{tracks.length} trek</div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                <Badge color={accent}>{pl.category}</Badge>
                {isActive
                  ? <Badge color={C.green}>● Aktif</Badge>
                  : <Btn variant="ghost" size="sm" onClick={()=>handleSetActive(pl.id)}>Jadikan Aktif</Btn>
                }
                <Btn variant="secondary" size="sm" onClick={()=>setEditId(isEdit?null:pl.id)}>
                  {isEdit ? 'Tutup' : 'Edit Trek'}
                </Btn>
                <Btn variant="danger" size="sm" onClick={()=>handleDelete(pl.id)}>
                  <Trash2 size={12}/>
                </Btn>
              </div>
            </div>

            {/* Edit panel */}
            {isEdit && (
              <div style={{ padding:'0 20px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* Available audio */}
                <div>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
                    Audio Tersedia ({avail.length})
                  </div>
                  <div style={{ maxHeight:280, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                    {avail.length===0 ? (
                      <p style={{ fontSize:'0.82rem', color:C.faint }}>Tiada audio dalam kategori {pl.category}</p>
                    ) : avail.map(audio => {
                      const inPl = tracks.some(pi=>pi.audio_item_id===audio.id);
                      return (
                        <div key={audio.id} onClick={()=>!inPl&&handleAddTrack(pl.id,audio)} style={{
                          display:'flex', alignItems:'center', gap:10,
                          padding:'8px 12px', borderRadius:10, cursor:inPl?'default':'pointer',
                          background: inPl ? `${C.green}08` : 'rgba(17,116,255,0.03)',
                          border:`1px solid ${inPl ? C.green+'28' : C.line}`,
                          opacity: inPl ? 0.6 : 1, transition:'all 0.15s',
                        }}
                        onMouseEnter={e=>{if(!inPl)e.currentTarget.style.background=`${accent}0a`;}}
                        onMouseLeave={e=>{if(!inPl)e.currentTarget.style.background='rgba(17,116,255,0.03)';}}
                        >
                          <span style={{ fontSize:16 }}>🎵</span>
                          <span style={{ flex:1, fontSize:'0.82rem', color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{audio.title}</span>
                          {inPl
                            ? <CheckCircle size={14} color={C.green}/>
                            : <span style={{ fontSize:'0.72rem', color:accent, fontWeight:700 }}>+ Tambah</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracks in playlist */}
                <div>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
                    Dalam Senarai ({tracks.length})
                  </div>
                  <div style={{ maxHeight:280, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                    {tracks.length===0 ? (
                      <p style={{ fontSize:'0.82rem', color:C.faint }}>Tiada trek — klik audio di kiri untuk menambah</p>
                    ) : [...tracks].sort((a,b)=>(a.display_order||0)-(b.display_order||0)).map((pi,i)=>(
                      <div key={pi.id}
                        draggable
                        onDragStart={()=>{dragIndex.current=i;}}
                        onDragOver={e=>e.preventDefault()}
                        onDrop={()=>{if(dragIndex.current!==null&&dragIndex.current!==i){handleReorder(pl.id,dragIndex.current,i);dragIndex.current=null;}}}
                        style={{
                          display:'flex', alignItems:'center', gap:10,
                          padding:'8px 12px', borderRadius:10, cursor:'grab',
                          background:'rgba(17,116,255,0.04)', border:`1px solid ${C.line}`,
                        }}
                      >
                        <DragHandle/>
                        <span style={{ flex:1, fontSize:'0.82rem', color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {pi.audio_items?.title || `Trek ${i+1}`}
                        </span>
                        <button onClick={()=>handleRemoveTrack(pi.id)} style={{ background:'none', border:'none', cursor:'pointer', color:C.red, display:'flex', padding:2 }}>
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
