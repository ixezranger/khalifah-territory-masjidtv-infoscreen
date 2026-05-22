import { useState, useEffect } from 'react';
import { Music, Plus, Trash2, FolderOpen } from 'lucide-react';
import { Card, Btn, Badge, TabBar, Empty, Row, C } from './ui';
import MediaUploader from '../shared/MediaUploader';
import CrescentIcon from '../shared/CrescentIcon';
import useStore from '../../store/useStore';
import { getAudioItems, upsertAudioItem, deleteAudioItem } from '../../lib/supabase';
import GoogleDriveImporter from './GoogleDriveImporter';

const CATS = ['Zikir','Quran','Nasheed'];
const CAT_COLOR = { zikir: C.amber, quran: C.blue, nasheed: C.green };

function CoverThumb({ item, size=44 }) {
  if (item.cover_image_url) return (
    <img src={item.cover_image_url} alt="" style={{ width:size, height:size, objectFit:'cover', borderRadius:10, flexShrink:0 }} />
  );
  const bg = CAT_COLOR[item.category] || C.blue;
  return (
    <div style={{ width:size, height:size, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:`${bg}18`, border:`1px solid ${bg}33` }}>
      <CrescentIcon size={size*0.5} color={bg} />
    </div>
  );
}

export default function AudioLibraryManager() {
  const { user, audioItems, setAudioItems } = useStore();
  const [items,          setItems]          = useState([]);
  const [activeCat,      setActiveCat]      = useState('zikir');
  const [newTitle,       setNewTitle]       = useState('');
  const [newArtist,      setNewArtist]      = useState('');
  const [newCategory,    setNewCategory]    = useState('zikir');
  const [pendingAudio,   setPendingAudio]   = useState(null);
  const [adding,         setAdding]         = useState(false);
  const [showDrive,      setShowDrive]      = useState(false);

  const load = async () => {
    if (!user?.id) return;
    const { data } = await getAudioItems(user.id);
    if (data) { setItems(data); setAudioItems(data); }
  };
  useEffect(() => { load(); }, [user?.id]); // eslint-disable-line

  const handleAdd = async () => {
    if (!user?.id || !pendingAudio) return;
    setAdding(true);
    await upsertAudioItem({ user_id:user.id, title:newTitle.trim()||'Audio Baharu', artist:newArtist.trim()||'', category:newCategory, audio_url:pendingAudio, display_order:items.length, is_active:true, storage_provider:'r2' });
    setNewTitle(''); setNewArtist(''); setPendingAudio(null); await load();
    setAdding(false);
  };
  const handleDelete = async id => { await deleteAudioItem(id); await load(); };
  const handleToggle = async item => { await upsertAudioItem({ ...item, is_active: !item.is_active }); await load(); };

  const CAT_TABS = CATS.map(c => ({ id: c.toLowerCase(), label: c, icon: c==='Quran'?'📖':c==='Nasheed'?'🎶':'📿' }));
  const filtered = items.filter(i => i.category === activeCat);

  return (
    <div style={{ maxWidth: 760 }}>

      {/* Add audio */}
      <Card title="Tambah Audio Baharu" icon={Music} accent={C.amber}>
        <div style={{ marginBottom: 16 }}>
          {pendingAudio && (
            <div style={{ marginBottom:10, padding:'8px 12px', background:`${C.green}12`, border:`1px solid ${C.green}30`, borderRadius:10, fontSize:'0.82rem', color:C.green, fontWeight:600 }}>
              ✓ Audio berjaya dimuat naik
            </div>
          )}
          <MediaUploader accept="audio" userId={user?.id} uploadPath="audio" onUploadComplete={({url})=>setPendingAudio(url)} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:16 }}>
          <div>
            <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Tajuk</label>
            <input type="text" value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Tajuk audio" className="ms-input" />
          </div>
          <div>
            <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Artis / Qari</label>
            <input type="text" value={newArtist} onChange={e=>setNewArtist(e.target.value)} placeholder="Nama artis" className="ms-input" />
          </div>
          <div>
            <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Kategori</label>
            <select value={newCategory} onChange={e=>setNewCategory(e.target.value)} className="ms-input">
              <option value="zikir">Zikir</option>
              <option value="quran">Quran</option>
              <option value="nasheed">Nasheed</option>
            </select>
          </div>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <Btn onClick={handleAdd} disabled={adding || !pendingAudio}>
            <Plus size={14} />
            {adding ? 'Menambah...' : 'Tambah Audio'}
          </Btn>
          <Btn variant="ghost" onClick={() => setShowDrive(v=>!v)}>
            <FolderOpen size={14} />
            Import Google Drive
          </Btn>
        </div>
      </Card>

      {/* Google Drive importer */}
      {showDrive && (
        <Card title="Import dari Google Drive" icon={FolderOpen} accent={C.blue}
          action={<Btn variant="ghost" size="sm" onClick={()=>setShowDrive(false)}>✕ Tutup</Btn>}
        >
          <GoogleDriveImporter onImportComplete={async()=>{ await load(); setShowDrive(false); }} />
        </Card>
      )}

      {/* Audio list with category tabs */}
      <Card title="Pustaka Audio" icon={Music} accent={C.cyan}
        action={<Badge color={C.blue}>{items.length}</Badge>}
      >
        <TabBar tabs={CAT_TABS} active={activeCat} onChange={setActiveCat} />

        {filtered.length === 0 ? (
          <Empty icon="🎵" text={`Tiada audio dalam kategori ${activeCat}`} />
        ) : filtered.map((item, i) => (
          <Row key={item.id} last={i===filtered.length-1}>
            <CoverThumb item={item} />
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontWeight:600, fontSize:'0.875rem', color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {item.title}
              </div>
              {item.artist && <div style={{ fontSize:'0.75rem', color:C.faint }}>{item.artist}</div>}
            </div>
            <Badge color={CAT_COLOR[item.category]||C.blue}>{item.category}</Badge>
            {item.duration && <span style={{ fontSize:'0.75rem', color:C.faint, flexShrink:0 }}>{item.duration}s</span>}
            <Btn variant="ghost" size="sm" onClick={()=>handleToggle(item)}>
              {item.is_active ? 'Sembunyi' : 'Aktif'}
            </Btn>
            <Btn variant="danger" size="sm" onClick={()=>handleDelete(item.id)}>
              <Trash2 size={12} />
            </Btn>
          </Row>
        ))}
      </Card>
    </div>
  );
}
