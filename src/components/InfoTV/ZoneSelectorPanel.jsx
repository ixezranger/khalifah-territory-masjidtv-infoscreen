import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, ChevronRight, X, MapPin, Check } from 'lucide-react';
import { ZONES } from '../../hooks/useWaktuSolat';

const COUNTRIES = { MY: { label:'Malaysia', flag:'🇲🇾', zones:ZONES } };

/* ── Token colours (light theme, not admin dark) ── */
const T = {
  blue:   '#1174ff',
  violet: '#7547ff',
  ink:    '#0f1f4a',
  muted:  '#3f568d',
  faint:  'rgba(63,86,141,0.45)',
  line:   'rgba(17,116,255,0.1)',
};

export default function ZoneSelectorPanel({ currentZone, onZoneChange }) {
  const [open,     setOpen]    = useState(false);
  const [country,  setCountry] = useState('MY');
  const [expanded, setExpanded]= useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    for (const [state, zones] of Object.entries(COUNTRIES[country].zones)) {
      if (Object.keys(zones).includes(currentZone)) { setExpanded(state); break; }
    }
  }, [open, currentZone, country]);

  let shortLabel = currentZone;
  for (const zones of Object.values(ZONES)) {
    if (zones[currentZone]) { shortLabel = zones[currentZone].split(',')[0].trim(); break; }
  }

  const c = COUNTRIES[country];

  return (
    <div ref={ref} style={{ position:'absolute', top:'50%', right:'1.2vw', transform:'translateY(-50%)', zIndex:9999 }}>

      {/* Trigger pill */}
      <button onClick={()=>setOpen(v=>!v)} style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'6px 13px', borderRadius:22,
        background: open
          ? 'linear-gradient(135deg,rgba(17,116,255,0.15),rgba(117,71,255,0.1))'
          : 'rgba(255,255,255,0.72)',
        backdropFilter:'blur(20px) saturate(1.6)',
        border:`1px solid ${open ? 'rgba(17,116,255,0.35)' : 'rgba(17,116,255,0.18)'}`,
        boxShadow: open ? '0 4px 20px rgba(17,116,255,0.2)' : '0 2px 10px rgba(17,50,140,0.08)',
        cursor:'pointer', color: open ? T.blue : T.ink,
        fontFamily:'inherit', fontSize:'clamp(11px,.72vw,13px)',
        fontWeight:600, whiteSpace:'nowrap',
        transition:'all 0.2s',
      }}>
        <Globe size={13} style={{ flexShrink:0, color: open ? T.blue : T.violet }}/>
        <span style={{ color: open ? T.blue : T.muted, fontWeight:800, letterSpacing:'0.02em' }}>{currentZone}</span>
        <span style={{ color:T.faint, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', fontWeight:400 }}>
          · {shortLabel}
        </span>
        <ChevronDown size={10} style={{ flexShrink:0, transform:open?'rotate(180deg)':'none', transition:'transform 0.2s', opacity:0.6 }}/>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 10px)', right:0,
          width:340, maxHeight:500, overflowY:'auto',
          background:'rgba(246,249,255,0.98)',
          backdropFilter:'blur(40px) saturate(1.8)',
          border:'1px solid rgba(17,116,255,0.15)',
          borderRadius:20,
          boxShadow:'0 24px 70px rgba(17,50,140,0.2), 0 1px 0 rgba(255,255,255,0.9) inset',
        }}>

          {/* Header */}
          <div style={{ padding:'13px 16px', borderBottom:`1px solid ${T.line}`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:`${T.blue}12`, border:`1px solid ${T.blue}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <MapPin size={14} color={T.blue}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:'0.875rem', color:T.ink }}>Pilih Zon Waktu Solat</div>
              <div style={{ fontSize:'0.7rem', color:T.faint }}>Zon semasa: {currentZone}</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{ background:`rgba(17,116,255,0.07)`, border:'none', borderRadius:8, padding:'5px 7px', cursor:'pointer', color:T.muted, display:'flex' }}>
              <X size={13}/>
            </button>
          </div>

          {/* Country selector */}
          <div style={{ padding:'10px 14px 6px', borderBottom:`1px solid ${T.line}` }}>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {Object.entries(COUNTRIES).map(([code,info])=>(
                <button key={code} onClick={()=>{setCountry(code);setExpanded(null);}} style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  padding:'4px 11px', borderRadius:9,
                  border: country===code ? `1px solid ${T.blue}50` : `1px solid ${T.line}`,
                  background: country===code ? `${T.blue}10` : 'transparent',
                  color: country===code ? T.blue : T.faint,
                  fontSize:'0.78rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                }}>
                  <span>{info.flag}</span><span>{info.label}</span>
                </button>
              ))}
              <span style={{ fontSize:'0.7rem', color:'#bcc8e0', alignSelf:'center', marginLeft:2 }}>+ akan datang</span>
            </div>
          </div>

          {/* States + zones */}
          <div style={{ padding:'6px 0' }}>
            {Object.entries(c.zones).map(([state, zones])=>{
              const isExpanded = expanded===state;
              const hasActive  = Object.keys(zones).includes(currentZone);
              return (
                <div key={state}>
                  {/* State row */}
                  <button onClick={()=>setExpanded(isExpanded?null:state)} style={{
                    width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'9px 16px', border:'none', cursor:'pointer', textAlign:'left',
                    background: hasActive ? `${T.blue}07` : 'transparent',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e=>{ if(!hasActive) e.currentTarget.style.background=`${T.blue}04`; }}
                  onMouseLeave={e=>{ if(!hasActive) e.currentTarget.style.background='transparent'; }}
                  >
                    <span style={{ fontSize:'0.855rem', fontWeight: hasActive?700:500, color: hasActive?T.blue:T.ink }}>
                      {state}
                    </span>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      {hasActive && (
                        <span style={{ fontSize:'0.65rem', fontWeight:800, color:T.blue, background:`${T.blue}12`, border:`1px solid ${T.blue}28`, borderRadius:5, padding:'1px 6px' }}>
                          Aktif
                        </span>
                      )}
                      <ChevronDown size={12} color={T.faint} style={{ transform:isExpanded?'rotate(180deg)':'none', transition:'transform 0.2s' }}/>
                    </div>
                  </button>

                  {/* Zone options */}
                  {isExpanded && (
                    <div style={{ background:'rgba(248,250,255,0.8)' }}>
                      {Object.entries(zones).map(([code, label])=>{
                        const isActive = code===currentZone;
                        return (
                          <button key={code} onClick={()=>{onZoneChange(code);setOpen(false);}} style={{
                            width:'100%', display:'flex', alignItems:'flex-start', gap:10,
                            padding:'8px 16px 8px 28px',
                            background: isActive ? `${T.blue}0e` : 'transparent',
                            borderLeft: isActive ? `3px solid ${T.blue}` : '3px solid transparent',
                            border:'none', cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                          }}
                          onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background=`${T.blue}06`; }}
                          onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}
                          >
                            <span style={{ fontSize:'0.72rem', fontWeight:800, color:isActive?T.blue:T.faint, minWidth:48, flexShrink:0, paddingTop:1 }}>{code}</span>
                            <span style={{ fontSize:'0.78rem', color:isActive?T.ink:T.muted, lineHeight:1.4, flex:1 }}>{label}</span>
                            {isActive && <Check size={13} color={T.blue} style={{ flexShrink:0, marginTop:1 }}/>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding:'9px 16px', borderTop:`1px solid ${T.line}`, fontSize:'0.68rem', color:T.faint, textAlign:'center' }}>
            Data waktu solat dari e-Solat JAKIM
          </div>
        </div>
      )}
    </div>
  );
}
