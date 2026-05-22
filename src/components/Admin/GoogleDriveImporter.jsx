import { useState } from 'react';
import { FolderOpen, RefreshCw, ArrowLeft, Home, Download, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Card, Btn, Badge, Alert, Empty, C } from './ui';
import useGoogleDrive from '../../hooks/useGoogleDrive';
import useStore from '../../store/useStore';
import {
  logGdriveImport, updateGdriveImportStatus,
  upsertSliderItem, upsertAudioItem,
} from '../../lib/supabase';
import { getDriveDownloadUrl } from '../../lib/googleDrive';

const TYPE_FILTERS = [
  { id: null,    label: 'Semua', icon: '🗂️' },
  { id: 'image', label: 'Imej',  icon: '🖼️' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'audio', label: 'Audio', icon: '🎵' },
];

function getMimeIcon(m) {
  if (!m) return '📄';
  if (m.includes('image'))  return '🖼️';
  if (m.includes('video'))  return '🎬';
  if (m.includes('audio'))  return '🎵';
  if (m.includes('folder')) return '📂';
  return '📄';
}

function fmtBytes(b) {
  if (!b) return '';
  const n = Number(b);
  if (n < 1024)        return `${n} B`;
  if (n < 1048576)     return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1048576).toFixed(1)} MB`;
}

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    idle:      null,
    importing: { icon: <Loader size={11} style={{ animation:'spin 1s linear infinite' }}/>, label:'Mengimport', color: C.amber },
    done:      { icon: <CheckCircle size={11}/>, label:'Selesai',    color: C.green },
    error:     { icon: <XCircle size={11}/>,     label:'Ralat',      color: C.red   },
  };
  const s = map[status];
  if (!s) return null;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'3px 8px', borderRadius:20,
      background:`${s.color}15`, border:`1px solid ${s.color}33`,
      color: s.color, fontSize:'0.72rem', fontWeight:700,
    }}>
      {s.icon}{s.label}
    </span>
  );
}

/* ── File / Folder tile ── */
function Tile({ children, onClick, style }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px)',
      border: `1px solid rgba(17,116,255,0.12)`,
      borderRadius: 14,
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.15s, box-shadow 0.15s',
      boxShadow: '0 2px 12px rgba(17,50,140,0.06)',
      ...style,
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(17,50,140,0.12)'; }}}
    onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 12px rgba(17,50,140,0.06)'; }}
    >
      {children}
    </div>
  );
}

export default function GoogleDriveImporter({ onImportComplete }) {
  const { user } = useStore();
  const drive = useGoogleDrive();
  const [statuses,   setStatuses]   = useState({});
  const [activeType, setActiveType] = useState(null);

  const setStatus = (id, s) => setStatuses(p => ({ ...p, [id]: s }));

  const handleImport = async file => {
    if (!user?.id) return;
    setStatus(file.id, 'importing');
    const importType = file.mimeType?.includes('audio') ? 'audio' : 'slider';
    let logId = null;
    try {
      const { data: ld } = await logGdriveImport({ user_id:user.id, file_id:file.id, file_name:file.name, import_type:importType, status:'importing' });
      logId = ld?.id;
      const url = getDriveDownloadUrl(file.id);
      if (importType === 'audio') {
        await upsertAudioItem({ title:file.name, audio_url:url, source_gdrive_id:file.id, user_id:user.id, category:'zikir', storage_provider:'gdrive', is_active:true });
      } else {
        await upsertSliderItem({ media_url:url, media_type:'image', title:file.name, user_id:user.id, storage_provider:'gdrive', is_active:true });
      }
      if (logId) await updateGdriveImportStatus(logId, 'done', url);
      setStatus(file.id, 'done');
      onImportComplete?.();
    } catch (err) {
      if (logId) await updateGdriveImportStatus(logId, 'error', null, err.message);
      setStatus(file.id, 'error');
    }
  };

  /* ── Not connected ── */
  if (!drive.isConnected) {
    return (
      <div style={{ textAlign:'center', padding:'48px 24px' }}>
        <div style={{
          width:80, height:80, borderRadius:24, margin:'0 auto 20px',
          background:'linear-gradient(135deg,rgba(17,116,255,0.1),rgba(117,71,255,0.08))',
          border:`1px solid rgba(17,116,255,0.15)`,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <FolderOpen size={36} color={C.blue} />
        </div>
        <h3 style={{ fontSize:'1rem', fontWeight:800, color:C.ink, marginBottom:8 }}>
          Sambungkan Google Drive
        </h3>
        <p style={{ fontSize:'0.855rem', color:C.muted, marginBottom:24, maxWidth:320, margin:'0 auto 24px' }}>
          Sambungkan akaun Google anda untuk melayari dan mengimport fail terus ke MasjidTV.
        </p>
        {drive.error && <Alert type="error">{drive.error}</Alert>}
        <Btn onClick={drive.connect} disabled={drive.isLoading} size="lg">
          <FolderOpen size={16} />
          {drive.isLoading ? 'Menyambung...' : 'Sambungkan Google Drive'}
        </Btn>
      </div>
    );
  }

  const filtered = activeType
    ? drive.files.filter(f => f.mimeType?.includes(activeType))
    : drive.files;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {/* Path breadcrumb */}
        <div style={{
          display:'flex', alignItems:'center', gap:4,
          padding:'5px 10px', borderRadius:8,
          background:'rgba(17,116,255,0.05)', border:`1px solid ${C.line}`,
          fontSize:'0.78rem', color:C.muted,
        }}>
          <FolderOpen size={13} color={C.blue} />
          <span style={{ fontWeight:600, color:C.blue }}>
            {drive.currentFolderId === 'root' ? 'My Drive' : 'Folder'}
          </span>
        </div>

        {/* Type filter pills */}
        <div style={{ display:'flex', gap:4 }}>
          {TYPE_FILTERS.map(f => (
            <button key={String(f.id)} onClick={() => setActiveType(f.id)} style={{
              display:'inline-flex', alignItems:'center', gap:4,
              padding:'5px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:600,
              background: activeType===f.id ? C.blue : 'rgba(17,116,255,0.06)',
              color: activeType===f.id ? 'white' : C.muted,
              transition:'all 0.15s',
            }}>{f.icon} {f.label}</button>
          ))}
        </div>

        <div style={{ flex:1 }} />

        {drive.currentFolderId !== 'root' && (
          <Btn variant="ghost" size="sm" onClick={drive.browseRoot}><Home size={13}/> Root</Btn>
        )}
        <Btn variant="ghost" size="sm" onClick={drive.refresh} disabled={drive.isLoading}>
          <RefreshCw size={13} style={{ animation: drive.isLoading ? 'spin 1s linear infinite' : 'none' }} />
          Muat Semula
        </Btn>
      </div>

      {drive.error && <Alert type="error">{drive.error}</Alert>}

      {drive.isLoading ? (
        <div style={{ padding:'40px', textAlign:'center' }}>
          <div style={{ width:44, height:44, border:`3px solid ${C.line}`, borderTopColor:C.blue, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
          <p style={{ fontSize:'0.855rem', color:C.muted }}>Memuatkan fail...</p>
        </div>
      ) : (drive.folders.length + filtered.length) === 0 ? (
        <Empty icon="📂" text="Tiada fail dijumpai" sub="Cuba tukar penapis atau buka folder lain" />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
          {/* Folders */}
          {drive.folders.map(folder => (
            <Tile key={folder.id} onClick={() => drive.browseTo(folder.id)}>
              <div style={{ padding:'14px 12px 10px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:8 }}>📂</div>
                <div style={{ fontSize:'0.78rem', fontWeight:600, color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:8 }}>
                  {folder.name}
                </div>
                <Btn variant="secondary" size="sm" onClick={e=>{e.stopPropagation();drive.browseTo(folder.id);}}>
                  Buka
                </Btn>
              </div>
            </Tile>
          ))}

          {/* Files */}
          {filtered.map(file => {
            const status = statuses[file.id] || 'idle';
            return (
              <Tile key={file.id}>
                {/* Thumb */}
                {file.thumbnailLink ? (
                  <img src={file.thumbnailLink} alt="" style={{ width:'100%', height:80, objectFit:'cover', display:'block' }} />
                ) : (
                  <div style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, background:`${C.blue}08` }}>
                    {getMimeIcon(file.mimeType)}
                  </div>
                )}
                <div style={{ padding:'10px 12px' }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:600, color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>
                    {file.name}
                  </div>
                  {file.size && <div style={{ fontSize:'0.7rem', color:C.faint, marginBottom:8 }}>{fmtBytes(file.size)}</div>}
                  {status === 'idle' ? (
                    <Btn size="sm" onClick={() => handleImport(file)} style={{ width:'100%' }}>
                      <Download size={11}/> Import
                    </Btn>
                  ) : (
                    <StatusBadge status={status} />
                  )}
                </div>
              </Tile>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
