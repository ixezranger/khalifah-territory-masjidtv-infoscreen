import { useState, useRef, useCallback } from 'react';
import { Upload, FolderOpen, RefreshCw, Home, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { C } from '../Admin/ui';
import { uploadToR2, buildR2Key } from '../../lib/r2';
import useGoogleDrive from '../../hooks/useGoogleDrive';

const ACCEPT_MAP = { image:'image/*', video:'video/*', audio:'audio/*' };
const MIME_ICON  = { image:'🖼️', video:'🎬', audio:'🎵' };

function fmtBytes(b) {
  if (!b) return '';
  if (b < 1024)    return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(1)} MB`;
}

/* ── Progress ring ── */
function Ring({ pct, size=56 }) {
  const r = (size-6)/2, circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${C.blue}22`} strokeWidth={4}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.blue} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 0.2s' }}/>
    </svg>
  );
}

/* ── Drive browser modal ── */
function DriveModal({ drive, accept, onSelect, onClose }) {
  const [activeType, setActiveType] = useState(null);
  const filtered = activeType ? drive.files.filter(f=>f.mimeType?.includes(activeType)) : drive.files;

  const connectAndBrowse = async () => { await drive.connect(); await drive.browseRoot?.(); };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(7,25,66,0.55)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16,
    }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{
        width:'100%', maxWidth:540, maxHeight:'82vh',
        background:'rgba(246,249,255,0.98)',
        backdropFilter:'blur(32px)',
        border:`1px solid rgba(17,116,255,0.18)`,
        borderRadius:24,
        boxShadow:'0 24px 80px rgba(17,50,140,0.22)',
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Modal header */}
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.line}`, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`${C.blue}12`, border:`1px solid ${C.blue}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FolderOpen size={18} color={C.blue}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, color:C.ink, fontSize:'0.95rem' }}>Google Drive</div>
            <div style={{ fontSize:'0.72rem', color:C.muted }}>Pilih fail untuk diimport</div>
          </div>
          <button onClick={onClose} style={{ background:`${C.red}12`, border:`1px solid ${C.red}28`, borderRadius:8, padding:'5px 8px', cursor:'pointer', color:C.red, display:'flex' }}>
            <X size={14}/>
          </button>
        </div>

        {!drive.isConnected ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:`${C.blue}10`, border:`1px solid ${C.blue}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FolderOpen size={28} color={C.blue}/>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:700, color:C.ink, marginBottom:6 }}>Sambungkan Google Drive</div>
              <div style={{ fontSize:'0.82rem', color:C.muted }}>Log masuk dengan Google untuk melayari fail anda</div>
            </div>
            <button onClick={connectAndBrowse} disabled={drive.isLoading} style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'10px 24px', borderRadius:12,
              background:`linear-gradient(135deg,${C.blue},${C.violet})`,
              color:'white', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.875rem',
              opacity:drive.isLoading?0.6:1,
            }}>
              <FolderOpen size={16}/>
              {drive.isLoading ? 'Menyambung...' : 'Sambungkan Google Drive'}
            </button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.line}`, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              {['image','video','audio'].map(t=>(
                <button key={t} onClick={()=>setActiveType(activeType===t?null:t)} style={{
                  padding:'4px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:'0.75rem', fontWeight:600,
                  background: activeType===t ? C.blue : 'rgba(17,116,255,0.07)',
                  color: activeType===t ? 'white' : C.muted,
                }}>
                  {MIME_ICON[t]} {t}
                </button>
              ))}
              <div style={{ flex:1 }}/>
              {drive.currentFolderId!=='root' && (
                <button onClick={drive.browseRoot} style={{ background:'none', border:'none', cursor:'pointer', color:C.blue, display:'flex', alignItems:'center', gap:4, fontSize:'0.78rem', fontWeight:600 }}>
                  <Home size={12}/> Root
                </button>
              )}
              <button onClick={drive.refresh} disabled={drive.isLoading} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, display:'flex', padding:4 }}>
                <RefreshCw size={14} style={{ animation:drive.isLoading?'spin 0.8s linear infinite':'none' }}/>
              </button>
            </div>

            {/* File list */}
            <div style={{ flex:1, overflowY:'auto', padding:12 }}>
              {drive.isLoading ? (
                <div style={{ textAlign:'center', padding:32 }}>
                  <div style={{ width:36, height:36, border:`3px solid ${C.line}`, borderTopColor:C.blue, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 10px' }}/>
                  <p style={{ fontSize:'0.82rem', color:C.muted }}>Memuatkan...</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {drive.folders.map(f=>(
                    <div key={f.id} onClick={()=>drive.browseTo(f.id)} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                      borderRadius:10, cursor:'pointer', border:`1px solid ${C.line}`,
                      background:'rgba(255,255,255,0.6)', transition:'background 0.15s',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background=`${C.blue}08`}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.6)'}
                    >
                      <span style={{ fontSize:20 }}>📂</span>
                      <span style={{ flex:1, fontSize:'0.855rem', fontWeight:600, color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                      <ArrowLeft size={14} color={C.blue} style={{ transform:'rotate(180deg)' }}/>
                    </div>
                  ))}
                  {filtered.map(f=>(
                    <div key={f.id} onClick={()=>onSelect(f)} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                      borderRadius:10, cursor:'pointer', border:`1px solid ${C.line}`,
                      background:'rgba(255,255,255,0.6)', transition:'all 0.15s',
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${C.green}08`;e.currentTarget.style.borderColor=`${C.green}40`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.6)';e.currentTarget.style.borderColor=C.line;}}
                    >
                      {f.thumbnailLink
                        ? <img src={f.thumbnailLink} alt="" style={{ width:32, height:32, objectFit:'cover', borderRadius:6, flexShrink:0 }}/>
                        : <span style={{ fontSize:20 }}>{MIME_ICON[accept]||'📄'}</span>
                      }
                      <div style={{ flex:1, overflow:'hidden' }}>
                        <div style={{ fontSize:'0.855rem', fontWeight:600, color:C.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                        {f.size && <div style={{ fontSize:'0.72rem', color:C.faint }}>{fmtBytes(Number(f.size))}</div>}
                      </div>
                      <CheckCircle size={14} color={C.green} style={{ opacity:0.5, flexShrink:0 }}/>
                    </div>
                  ))}
                  {drive.folders.length===0&&filtered.length===0&&(
                    <p style={{ textAlign:'center', padding:'28px 0', fontSize:'0.855rem', color:C.faint }}>Tiada fail dijumpai</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Main MediaUploader ── */
export default function MediaUploader({ accept='image', userId, uploadPath, onUploadComplete, onProgress, maxSizeMB=100 }) {
  const [state,     setState]    = useState('idle');
  const [file,      setFile]     = useState(null);
  const [pct,       setPct]      = useState(0);
  const [err,       setErr]      = useState('');
  const [dragging,  setDragging] = useState(false);
  const [showDrive, setShowDrive]= useState(false);
  const fileRef = useRef(null);
  const drive   = useGoogleDrive();

  const pickFile = useCallback(f => {
    if (!f) return;
    if (f.size > maxSizeMB*1048576) { setErr(`Fail melebihi ${maxSizeMB} MB`); setState('error'); return; }
    setFile(f); setState('selected'); setErr('');
  }, [maxSizeMB]);

  const handleDrop = useCallback(e => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }, [pickFile]);

  const handleUpload = useCallback(async () => {
    if (!file||!userId) return;
    setState('uploading'); setPct(0);
    try {
      const key = buildR2Key(userId, uploadPath||accept, file.name);
      const url = await uploadToR2(file, key, p=>{ setPct(p); onProgress?.(p); });
      setState('done');
      onUploadComplete?.({ url, key, filename:file.name, type:accept });
    } catch(e) { setErr(e.message||'Upload gagal'); setState('error'); }
  }, [file, userId, uploadPath, accept, onProgress, onUploadComplete]);

  const reset = () => { setState('idle'); setFile(null); setPct(0); setErr(''); if(fileRef.current) fileRef.current.value=''; };

  const handleDriveSelect = f => {
    setShowDrive(false);
    const url = `https://drive.google.com/uc?id=${f.id}&export=download`;
    onUploadComplete?.({ url, key:null, filename:f.name, type:accept, gdriveId:f.id });
  };

  /* ── Zone colours by state ── */
  const zoneBg = state==='error' ? `${C.red}08` : dragging ? `${C.blue}0c` : state==='done' ? `${C.green}08` : 'rgba(255,255,255,0.55)';
  const zoneBorder = state==='error' ? C.red : dragging ? C.blue : state==='done' ? C.green : `rgba(17,116,255,0.2)`;

  return (
    <div>
      {/* Two-column: local + drive */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'stretch' }}>

        {/* ── Local upload zone ── */}
        <div
          onClick={()=>state==='idle'&&fileRef.current?.click()}
          onDragOver={e=>{e.preventDefault();setDragging(true);}}
          onDragLeave={()=>setDragging(false)}
          onDrop={handleDrop}
          style={{
            border:`2px dashed ${zoneBorder}`,
            borderRadius:14, padding:'16px 20px',
            background:zoneBg,
            cursor:state==='idle'?'pointer':'default',
            transition:'all 0.2s',
            display:'flex', alignItems:'center', gap:14, minHeight:80,
          }}
        >
          {/* Icon / progress */}
          <div style={{ flexShrink:0, width:56, height:56, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {state==='uploading' ? (
              <div style={{ position:'relative', width:56, height:56 }}>
                <Ring pct={pct}/>
                <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:800, color:C.blue }}>{pct}%</span>
              </div>
            ) : state==='done' ? (
              <div style={{ width:44, height:44, borderRadius:14, background:`${C.green}15`, border:`1px solid ${C.green}33`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CheckCircle size={22} color={C.green}/>
              </div>
            ) : (
              <div style={{ width:44, height:44, borderRadius:14, background:`${C.blue}10`, border:`1px solid ${C.blue}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Upload size={20} color={C.blue}/>
              </div>
            )}
          </div>

          {/* Text */}
          <div style={{ flex:1, minWidth:0 }}>
            {state==='idle' && <>
              <div style={{ fontWeight:700, color:C.ink, fontSize:'0.875rem', marginBottom:2 }}>
                {dragging ? 'Lepaskan fail di sini' : 'Klik atau seret fail'}
              </div>
              <div style={{ fontSize:'0.75rem', color:C.faint }}>{MIME_ICON[accept]} {accept.toUpperCase()} · Maks {maxSizeMB} MB</div>
            </>}
            {state==='selected' && file && <>
              <div style={{ fontWeight:700, color:C.ink, fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</div>
              <div style={{ fontSize:'0.75rem', color:C.muted }}>{fmtBytes(file.size)}</div>
            </>}
            {state==='uploading' && <div style={{ fontWeight:600, color:C.blue, fontSize:'0.875rem' }}>Memuat naik...</div>}
            {state==='done' && <div style={{ fontWeight:700, color:C.green, fontSize:'0.875rem' }}>✓ Berjaya dimuat naik!</div>}
            {state==='error' && <>
              <div style={{ fontWeight:700, color:C.red, fontSize:'0.875rem' }}>Muat naik gagal</div>
              <div style={{ fontSize:'0.75rem', color:C.red }}>{err}</div>
            </>}
          </div>
        </div>

        {/* ── Google Drive button ── */}
        <button onClick={()=>setShowDrive(true)} style={{
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6,
          padding:'12px 16px', borderRadius:14, cursor:'pointer',
          border:`2px dashed rgba(17,116,255,0.2)`,
          background:'rgba(255,255,255,0.55)',
          color:C.muted, fontSize:'0.72rem', fontWeight:600,
          transition:'all 0.2s', minWidth:80, whiteSpace:'nowrap',
        }}
        onMouseEnter={e=>{e.currentTarget.style.background=`${C.blue}0a`;e.currentTarget.style.borderColor=`${C.blue}40`;e.currentTarget.style.color=C.blue;}}
        onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.55)';e.currentTarget.style.borderColor='rgba(17,116,255,0.2)';e.currentTarget.style.color=C.muted;}}
        >
          <FolderOpen size={20}/>
          Google Drive
        </button>
      </div>

      <input ref={fileRef} type="file" accept={ACCEPT_MAP[accept]} style={{ display:'none' }} onChange={e=>pickFile(e.target.files?.[0])}/>

      {/* Action buttons */}
      {(state==='selected'||state==='error')&&(
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          {state==='selected'&&(
            <button onClick={handleUpload} style={{
              display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:10,
              background:`linear-gradient(135deg,${C.blue},${C.violet})`, color:'white', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.82rem',
            }}>
              <Upload size={13}/> Muat Naik
            </button>
          )}
          <button onClick={reset} style={{
            display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10,
            background:`${C.red}0f`, color:C.red, border:`1px solid ${C.red}28`, cursor:'pointer', fontSize:'0.82rem',
          }}>
            <X size={12}/> Reset
          </button>
        </div>
      )}

      {showDrive && <DriveModal drive={drive} accept={accept} onSelect={handleDriveSelect} onClose={()=>setShowDrive(false)}/>}
    </div>
  );
}
