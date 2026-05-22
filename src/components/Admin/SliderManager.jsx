import { useState, useEffect, useRef } from 'react';
import { Images, Plus, Trash2, GripVertical } from 'lucide-react';
import { Card, Btn, Badge, TabBar, Empty, Row, DragHandle, Thumb, C } from './ui';
import MediaUploader from '../shared/MediaUploader';
import useStore from '../../store/useStore';
import { getSliderItems, upsertSliderItem, deleteSliderItem } from '../../lib/supabase';

function extractYoutubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

const TYPE_BADGE = {
  image:   { color: C.cyan,  label: 'Imej' },
  video:   { color: C.violet,label: 'Video' },
  youtube: { color: C.red,   label: 'YouTube' },
};

export default function SliderManager() {
  const { user, sliderItems, setSliderItems, featureSettings, setFeatureSettings } = useStore();
  const [items,          setItems]          = useState([]);
  const [addTab,         setAddTab]         = useState('upload');
  const [newTitle,       setNewTitle]       = useState('');
  const [newDuration,    setNewDuration]    = useState(8);
  const [newYoutubeUrl,  setNewYoutubeUrl]  = useState('');
  const [newExternalUrl, setNewExternalUrl] = useState('');
  const [newExternalType,setNewExternalType]= useState('image');
  const [pendingMedia,   setPendingMedia]   = useState(null);
  const [sliderLimit,    setSliderLimit]    = useState(featureSettings?.slider_limit || 10);
  const [adding,         setAdding]         = useState(false);
  const [savingLimit,    setSavingLimit]    = useState(false);
  const dragIndex = useRef(null);

  const load = async () => {
    if (!user?.id) return;
    const { data } = await getSliderItems(user.id);
    if (data) { setItems(data); setSliderItems(data); }
  };
  useEffect(() => { load(); }, [user?.id]); // eslint-disable-line

  const handleAddSlide = async () => {
    if (!user?.id) return;
    if (addTab === 'upload' && !pendingMedia) return;
    if (addTab === 'youtube' && !newYoutubeUrl.trim()) return;
    if (addTab === 'url' && !newExternalUrl.trim()) return;

    setAdding(true);
    const item = {
      user_id: user.id,
      title: newTitle.trim() || 'Slaid Baharu',
      duration: Number(newDuration) || 8,
      display_order: items.length,
      is_active: true,
    };
    if (addTab === 'upload' && pendingMedia) {
      item.media_url = pendingMedia.url; item.media_type = pendingMedia.type === 'image' ? 'image' : 'video';
    } else if (addTab === 'youtube') {
      item.media_url = newYoutubeUrl; item.media_type = 'youtube'; item.youtube_id = extractYoutubeId(newYoutubeUrl);
    } else if (addTab === 'url') {
      item.media_url = newExternalUrl.trim(); item.media_type = newExternalType;
    }
    const { data } = await upsertSliderItem(item);
    if (data) { setNewTitle(''); setNewDuration(8); setNewYoutubeUrl(''); setNewExternalUrl(''); setPendingMedia(null); await load(); }
    setAdding(false);
  };

  const handleDelete = async id => { await deleteSliderItem(id); await load(); };
  const handleToggle = async item => { await upsertSliderItem({ ...item, is_active: !item.is_active }); await load(); };
  const handleReorder = async drop => {
    if (dragIndex.current === null || dragIndex.current === drop) return;
    const arr = [...items]; const [m] = arr.splice(dragIndex.current, 1); arr.splice(drop, 0, m);
    setItems(arr);
    for (let i = 0; i < arr.length; i++) if (arr[i].display_order !== i) await upsertSliderItem({ ...arr[i], display_order: i });
    dragIndex.current = null; await load();
  };

  const TABS = [
    { id: 'upload',  icon: '📁', label: 'Muat Naik' },
    { id: 'youtube', icon: '▶',  label: 'YouTube' },
    { id: 'url',     icon: '🔗', label: 'URL Luar' },
  ];

  return (
    <div style={{ maxWidth: 760 }}>

      {/* Add slide */}
      <Card title="Tambah Slaid Baharu" icon={Images} accent={C.blue}>
        <TabBar tabs={TABS} active={addTab} onChange={setAddTab} />

        {addTab === 'upload' && (
          <div style={{ marginBottom: 16 }}>
            {pendingMedia && (
              <div style={{ marginBottom: 10, padding: '8px 12px', background: `${C.green}12`, border:`1px solid ${C.green}30`, borderRadius:10, fontSize:'0.82rem', color: C.green, fontWeight:600 }}>
                ✓ Fail berjaya dimuat naik
              </div>
            )}
            <MediaUploader accept="image" userId={user?.id} uploadPath="slider" onUploadComplete={({url, type}) => setPendingMedia({url,type})} />
          </div>
        )}

        {addTab === 'youtube' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>YouTube URL</label>
            <input type="text" value={newYoutubeUrl} onChange={e=>setNewYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..." className="ms-input" />
          </div>
        )}

        {addTab === 'url' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>URL Imej / Video</label>
            <input type="url" value={newExternalUrl} onChange={e=>setNewExternalUrl(e.target.value)}
              placeholder="https://yourdomain.com/slide1.jpg" className="ms-input" style={{ marginBottom: 10 }} />
            {newExternalUrl.trim() && (
              <img src={newExternalUrl.trim()} alt="Preview"
                style={{ width:'100%', height:90, objectFit:'cover', borderRadius:10, border:`1px solid ${C.line}`, marginBottom:10 }}
                onError={e=>{e.target.style.display='none';}} onLoad={e=>{e.target.style.display='block';}}
              />
            )}
            <div style={{ display:'flex', gap:8 }}>
              {['image','video'].map(t => (
                <button key={t} onClick={()=>setNewExternalType(t)} style={{
                  padding:'6px 14px', borderRadius:9, border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600,
                  background: newExternalType===t ? C.blue : 'rgba(17,116,255,0.06)',
                  color: newExternalType===t ? 'white' : C.muted,
                }}>
                  {t==='image' ? '🖼 Imej' : '🎬 Video'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          <div>
            <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Tajuk Slaid</label>
            <input type="text" value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Tajuk (pilihan)" className="ms-input" />
          </div>
          <div>
            <label style={{ fontSize:'0.78rem', fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:6 }}>Tempoh (saat)</label>
            <input type="number" value={newDuration} onChange={e=>setNewDuration(e.target.value)} min={1} max={60} className="ms-input" />
          </div>
        </div>

        <Btn onClick={handleAddSlide} disabled={adding || (addTab==='upload' && !pendingMedia) || (addTab==='youtube' && !newYoutubeUrl.trim()) || (addTab==='url' && !newExternalUrl.trim())}>
          <Plus size={14} />
          {adding ? 'Menambah...' : 'Tambah Slaid'}
        </Btn>
      </Card>

      {/* Slides list */}
      <Card title="Slaid Sedia Ada" icon={Images} accent={C.cyan}
        action={<Badge color={C.blue}>{items.length}</Badge>}
      >
        {items.length === 0 ? (
          <Empty icon="🖼️" text="Tiada slaid lagi" sub="Tambah slaid pertama anda di atas" />
        ) : items.map((item, i) => {
          const tb = TYPE_BADGE[item.media_type] || TYPE_BADGE.image;
          return (
            <Row key={item.id} last={i===items.length-1}
              draggable onDragStart={()=>{dragIndex.current=i;}}
              onDragOver={e=>e.preventDefault()} onDrop={()=>handleReorder(i)}
              style={{ cursor:'grab' }}
            >
              <DragHandle />
              <Thumb src={item.media_type==='image' ? item.media_url : null}
                icon={item.media_type==='youtube' ? '▶' : '🎬'} w={64} h={44} />
              <Badge color={tb.color}>{tb.label}</Badge>
              <span style={{ flex:1, fontSize:'0.875rem', color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {item.title || 'Tanpa tajuk'}
              </span>
              <span style={{ fontSize:'0.78rem', color:C.faint, flexShrink:0 }}>{item.duration||8}s</span>
              <Btn variant="ghost" size="sm" onClick={()=>handleToggle(item)}>
                {item.is_active ? 'Sembunyi' : 'Aktif'}
              </Btn>
              <Btn variant="danger" size="sm" onClick={()=>handleDelete(item.id)}>
                <Trash2 size={12} />
              </Btn>
            </Row>
          );
        })}
      </Card>

      {/* Slider limit */}
      <Card title="Had Slaid" icon={Images} accent={C.violet}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <label style={{ fontSize:'0.875rem', color:C.ink, fontWeight:500, flex:1 }}>Maksimum slaid dipaparkan:</label>
          <input type="number" min={1} max={20} value={sliderLimit} onChange={e=>setSliderLimit(Number(e.target.value))}
            className="ms-input" style={{ width:80, textAlign:'center' }} />
          <Btn onClick={async()=>{setSavingLimit(true);setFeatureSettings({...featureSettings,slider_limit:sliderLimit});setSavingLimit(false);}} disabled={savingLimit} size="sm">
            {savingLimit ? '...' : 'Simpan'}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
