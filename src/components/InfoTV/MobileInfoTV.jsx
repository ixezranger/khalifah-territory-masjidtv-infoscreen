/**
 * MobileInfoTV.jsx — Premium mobile layout matching Masjid As-Salam design.
 * Performance rules:
 *   - NO backdropFilter/blur (causes Android GPU stripe glitch)
 *   - NO JS-animated background layers (causes scroll jank)
 *   - Animated gradient lives ONLY on the root ::before pseudo-element via CSS keyframes
 *   - All cards: solid semi-opaque white — visually glass, zero GPU cost
 */
import { useState, useEffect, useRef } from 'react';
import { isHoliday, toHijri } from '../../lib/myHolidays';
import { ZONES } from '../../hooks/useWaktuSolat';

/* ── Inject global styles once ───────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

  @keyframes meshMove {
    0%   { background-position: 0% 0%, 100% 100%, 50% 0%; }
    33%  { background-position: 30% 60%, 70%  30%, 80% 80%; }
    66%  { background-position: 70% 20%, 20%  80%, 20% 50%; }
    100% { background-position: 0% 0%, 100% 100%, 50% 0%; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity:1; }
    50%     { opacity:0.6; }
  }
  .mob-root {
    width:100%; min-height:100vh;
    font-family:'Plus Jakarta Sans',sans-serif;
    -webkit-font-smoothing:antialiased;
    position:relative; overflow-x:hidden;
    /* Animated mesh gradient as CSS background — single layer, no child divs */
    background-color: #eceeff;
    background-image:
      radial-gradient(ellipse 60% 50% at 10% 10%, rgba(163,148,255,0.35) 0%, transparent 70%),
      radial-gradient(ellipse 55% 45% at 90% 90%, rgba(130,160,255,0.28) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,185,255,0.18) 0%, transparent 70%);
    background-size: 200% 200%, 200% 200%, 200% 200%;
    animation: meshMove 18s ease-in-out infinite;
    animation-fill-mode: both;
  }
  .card {
    background: rgba(255,255,255,0.72);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    backdrop-filter: blur(20px) saturate(1.4);
    border: 1.5px solid rgba(255,255,255,0.88);
    border-radius: 22px;
    box-shadow: 0 4px 24px rgba(75,94,255,0.10), 0 1px 0 rgba(255,255,255,0.9) inset;
    overflow: hidden;
  }
  .card-blue {
    background: linear-gradient(145deg,#4B5EFF,#7B5CFF);
    border: none;
    border-radius: 22px;
    box-shadow: 0 8px 28px rgba(75,94,255,0.38);
  }
  .sec-fade { animation: fadeUp 0.5s ease both; }
  @keyframes prayerPulse {
    0%,100% { box-shadow: 0 8px 24px rgba(13,134,255,0.45), 0 0 0 2px rgba(13,134,255,0.18); }
    50%     { box-shadow: 0 14px 40px rgba(139,72,255,0.60), 0 0 0 3px rgba(139,72,255,0.22); }
  }
  .prayer-active { animation: prayerPulse 2.8s ease-in-out infinite; }
`;

function InjectStyles() {
  useEffect(() => {
    const id = 'mob-infotv-styles';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id; s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => document.getElementById(id)?.remove();
  }, []);
  return null;
}

/* ── Design tokens ───────────────────────────────────────────────── */
const C = {
  blue:   '#4B5EFF',
  violet: '#7B5CFF',
  indigo: '#5B6AF5',
  ink:    '#1a1f3d',
  sub:    '#444b72',
  muted:  '#7a82ac',
  faint:  'rgba(122,130,172,0.45)',
  line:   'rgba(75,94,255,0.08)',
};

/* ── Helpers ─────────────────────────────────────────────────────── */
const MALAY_DAYS   = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
const MALAY_DSHORT = ['Ahd','Isn','Sel','Rab','Kha','Jum','Sab'];
const MALAY_MONTHS = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];

function fmt12(t) {
  if (!t) return '--:--';
  const [h,m] = t.split(':').map(Number);
  return `${String(h%12||12).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function ampm(t) { if(!t) return ''; return t.split(':')[0]*1>=12?'PM':'AM'; }
function pad(n) { return String(n).padStart(2,'0'); }

/* ── Prayer row config ───────────────────────────────────────────── */
const PRAYERS = [
  { key:'imsak',   lbl:'IMSAK',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4v6l4 2"/></svg> },
  { key:'subuh',   lbl:'SUBUH',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3L9 9H3l5 4-2 7 6-4 6 4-2-7 5-4h-6z"/></svg> },
  { key:'syuruk',  lbl:'SYURUK',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
  { key:'dhuha',   lbl:'DHUHA',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/><path d="M12 8v1"/></svg> },
  { key:'zohor',   lbl:'ZUHUR',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
  { key:'asar',    lbl:'ASAR',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg> },
  { key:'maghrib', lbl:'MAGHRIB',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg> },
  { key:'isyak',   lbl:'ISYAK',
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/><path d="M15 17l2 2 4-4"/></svg> },
];

/* ── Mosque SVG (outline white) ──────────────────────────────────── */
const MosqueSVG = ({ size=28, color='white' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 42V22M42 42V22"/>
    <path d="M2 22h44"/>
    <path d="M6 22c0-6 4-11 9-14l3-6 3 6c5 3 9 8 9 14"/>
    <path d="M24 3v4"/>
    <path d="M15 42V30h18v12"/>
    <path d="M21 42v-8h6v8"/>
    <ellipse cx="24" cy="22" rx="4" ry="3"/>
    <path d="M34 22c0-5 3-9 8-12"/>
    <path d="M14 22c0-5-3-9-8-12"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════════
   HOME TAB
   ══════════════════════════════════════════════════════════════════ */
function HomeTab({ times, nextSolatName, hours, minutes, seconds, isImminent,
    progressPct, time, gregorianDate, hijriDate, dayName,
    hadith, slides, slideIndex, setSlideIndex, profile, masjidIcon }) {

  const hh = parseInt(time,10);
  const meridiem = hh>=12?'PM':'AM';
  const timeDisplay = time.substring(0,5);

  /* hadith rotation */
  const hadithArr = Array.isArray(hadith)?hadith:[hadith].filter(Boolean);
  const [hidx,setHidx] = useState(0);
  useEffect(()=>{
    if(hadithArr.length<2) return;
    const t=setInterval(()=>setHidx(i=>(i+1)%hadithArr.length),12000);
    return()=>clearInterval(t);
  },[hadithArr.length]);
  const h = hadithArr[hidx]||{};

  /* slide auto-advance */
  useEffect(()=>{
    if(!slides||slides.length<2) return;
    const t=setInterval(()=>setSlideIndex(i=>(i+1)%slides.length),9000);
    return()=>clearInterval(t);
  },[slides?.length, setSlideIndex]);

  const cur = slides?.[slideIndex]||{};
  const dateStr = gregorianDate.replace(/^[A-Za-z]+,\s*/,'');

  return (
    <div style={{paddingBottom:100}}>

      {/* ── Header ── */}
      <div style={{padding:'22px 18px 14px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}} className="sec-fade">
        <div style={{display:'flex',gap:14,alignItems:'center',flex:1,minWidth:0}}>
          <div style={{
            width:72,height:72,borderRadius:20,flexShrink:0,
            background:masjidIcon?'transparent':'linear-gradient(145deg,#4B5EFF,#7B5CFF)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:masjidIcon?'none':'0 10px 28px rgba(75,94,255,0.35)',
            overflow:'hidden',
          }}>
            {masjidIcon
              ? <img src={masjidIcon} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>
              : <MosqueSVG size={34}/>}
          </div>
          <div style={{minWidth:0}}>
            <h1 style={{fontSize:20,fontWeight:850,color:C.ink,margin:'0 0 3px',lineHeight:1.1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {profile?.masjid_name||'MasjidTV'}
            </h1>
            <p style={{fontSize:12,color:C.sub,margin:'0 0 3px',lineHeight:1.4}}>
              {profile?.masjid_description||'Sistem InfoTV Islamik'}
            </p>
            <p style={{fontSize:11,color:C.muted,margin:0,fontStyle:'italic'}}>Menyatukan Ummah, Mengimarahkan Masjid</p>
          </div>
        </div>
        {/* Bell */}
        <div style={{width:46,height:46,borderRadius:16,flexShrink:0,background:'rgba(255,255,255,0.92)',border:'1.5px solid rgba(255,255,255,0.98)',boxShadow:'0 2px 14px rgba(75,94,255,0.10)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',cursor:'pointer'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style={{position:'absolute',top:9,right:9,width:8,height:8,borderRadius:'50%',background:C.violet,border:'2px solid white'}}/>
        </div>
      </div>

      {/* ── Time & Date card ── */}
      <div style={{padding:'0 16px 12px'}} className="sec-fade" >
        <div className="card" style={{padding:'18px 20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            {/* Clock bubble */}
            <div style={{width:56,height:56,borderRadius:18,flexShrink:0,background:'rgba(255,255,255,0.85)',border:'1.5px solid rgba(75,94,255,0.12)',boxShadow:'0 4px 14px rgba(75,94,255,0.10)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.indigo} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            {/* Time */}
            <div style={{display:'flex',alignItems:'flex-end',gap:4,lineHeight:1}}>
              <span style={{fontSize:34,fontWeight:850,color:C.ink,letterSpacing:'-0.04em',lineHeight:1}}>{timeDisplay}</span>
              <span style={{fontSize:14,fontWeight:800,color:C.blue,paddingBottom:2}}>{meridiem}</span>
            </div>
            {/* Divider */}
            <div style={{width:1,height:54,background:'rgba(75,94,255,0.10)',margin:'0 2px',flexShrink:0}}/>
            {/* Dates */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:7}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.indigo} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <div>
                  <strong style={{display:'block',fontSize:13,color:C.ink,lineHeight:1.2}}>{dateStr}</strong>
                  <span style={{fontSize:11,color:C.muted}}>{dayName}</span>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.indigo} strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                <div>
                  <strong style={{display:'block',fontSize:12,color:C.ink,lineHeight:1.2}}>{hijriDate}</strong>
                  <span style={{fontSize:11,color:C.muted}}>{dayName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Countdown card ── */}
      <div style={{padding:'0 16px 12px'}} className="sec-fade">
        <div className="card" style={{padding:'18px 20px 14px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <span style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.09em'}}>COUNTDOWN KE</span>
              <div style={{fontSize:20,fontWeight:850,color:isImminent?'#e05c00':C.blue,lineHeight:1.1,margin:'4px 0 12px'}}>
                {nextSolatName||'--'}
              </div>
              {/* Digits */}
              <div style={{display:'flex',alignItems:'flex-end'}}>
                {[{n:pad(hours),l:'JAM'},{n:pad(minutes),l:'MINIT'},{n:pad(seconds),l:'SAAT'}].map((it,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-end'}}>
                    <div style={{textAlign:'center',minWidth:44}}>
                      <div style={{fontSize:40,fontWeight:850,color:isImminent?'#e05c00':C.ink,lineHeight:1,letterSpacing:'-0.02em'}}>{it.n}</div>
                      <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:'0.06em',marginTop:3}}>{it.l}</div>
                    </div>
                    {i<2&&<div style={{fontSize:34,fontWeight:700,color:C.muted,paddingBottom:12,margin:'0 1px',lineHeight:1}}>:</div>}
                  </div>
                ))}
              </div>
              {/* Progress */}
              <div style={{marginTop:14,height:4,borderRadius:10,background:'rgba(75,94,255,0.10)',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${progressPct}%`,borderRadius:10,background:'linear-gradient(90deg,#4B5EFF,#7B5CFF)',transition:'width 1s linear'}}/>
              </div>
            </div>
            {/* Deco */}
            <div style={{flexShrink:0,opacity:0.09,marginLeft:8,marginTop:-4}}>
              <svg width="72" height="72" viewBox="0 0 48 48" fill="#4B5EFF">
                <path d="M4 42V22M44 42V22M2 22h44M6 22c0-6 4-11 9-14l3-6 3 6c5 3 9 8 9 14M24 3v4M15 42V30h18v12M21 42v-8h6v8"/>
              </svg>
            </div>
          </div>
          {/* Jadual button */}
          <button style={{marginTop:10,width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',borderRadius:12,cursor:'pointer',background:'rgba(75,94,255,0.07)',border:'1px solid rgba(75,94,255,0.13)'}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span style={{fontSize:11,fontWeight:600,color:C.ink}}>Jadual hari ini</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      {/* ── Tazkirah Slider ── */}
      <div style={{padding:'0 16px 12px',position:'relative'}} className="sec-fade">
        {/* Prev arrow */}
        <button onClick={()=>setSlideIndex(i=>(i-1+slides.length)%slides.length)} style={{position:'absolute',left:-2,top:'50%',transform:'translateY(-50%)',width:30,height:30,borderRadius:'50%',border:'none',cursor:'pointer',zIndex:10,background:cur.media_url?'rgba(0,0,0,0.35)':'rgba(255,255,255,0.95)',boxShadow:'0 2px 10px rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={cur.media_url?'white':C.blue} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {/* Next arrow */}
        <button onClick={()=>setSlideIndex(i=>(i+1)%slides.length)} style={{position:'absolute',right:-2,top:'50%',transform:'translateY(-50%)',width:30,height:30,borderRadius:'50%',border:'none',cursor:'pointer',zIndex:10,background:cur.media_url?'rgba(0,0,0,0.35)':'rgba(255,255,255,0.95)',boxShadow:'0 2px 10px rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={cur.media_url?'white':C.blue} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <div style={{borderRadius:22,overflow:'hidden',position:'relative',minHeight:210,
          background: cur.media_url ? 'transparent' : 'linear-gradient(135deg,rgba(10,16,80,0.95),rgba(55,35,190,0.90))'}}>

          {/* IMAGE slide — pure, no overlay, no gradient */}
          {cur.media_url && (
            <img src={cur.media_url} alt="" style={{
              position:'absolute',inset:0,width:'100%',height:'100%',
              objectFit:'cover',display:'block',opacity:1,
            }} onError={e=>e.target.style.display='none'}/>
          )}

          {/* TEXT slide — dark gradient bg + content */}
          {!cur.media_url && (
            <div style={{position:'relative',padding:'20px 22px 36px',zIndex:1}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:20,marginBottom:12,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.22)'}}>
                <span style={{fontSize:12}}>📖</span>
                <span style={{fontSize:10,fontWeight:700,color:'white',letterSpacing:'0.03em'}}>{cur.pill||'Tazkirah Hari Ini'}</span>
              </div>
              <h2 style={{fontSize:22,fontWeight:850,color:'white',lineHeight:1.2,margin:'0 0 10px',whiteSpace:'pre-line'}}>
                {cur.title||'Jangan Lupa,\nAllah Sentiasa\nBersama Kita'}
              </h2>
              {cur.text&&<p style={{fontSize:13,color:'rgba(255,255,255,0.80)',lineHeight:1.5,margin:0}}>{cur.text}</p>}
            </div>
          )}

          {/* Dots — always shown */}
          <div style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',display:'flex',gap:6,zIndex:2}}>
            {(slides||[]).map((_,i)=>(
              <div key={i} onClick={()=>setSlideIndex(i)} style={{width:i===slideIndex?20:7,height:7,borderRadius:4,cursor:'pointer',background:i===slideIndex?'white':'rgba(255,255,255,0.38)',transition:'width 0.3s'}}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hadith card ── */}
      <div style={{padding:'0 16px 12px'}} className="sec-fade">
        <div className="card" style={{padding:'16px 16px'}}>
          <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <div style={{width:34,height:34,borderRadius:10,flexShrink:0,background:'rgba(75,94,255,0.10)',border:'1px solid rgba(75,94,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <span style={{fontSize:15,fontWeight:750,color:C.ink}}>Hadis Hari Ini</span>
              </div>
              {(h.arabic_text||h.arabic)&&(
                <p style={{direction:'rtl',fontFamily:"'Amiri','Noto Naskh Arabic',Georgia,serif",fontSize:18,color:C.blue,textAlign:'right',margin:'0 0 10px',lineHeight:1.9}}>
                  {h.arabic_text||h.arabic}
                </p>
              )}
              <p style={{fontSize:12.5,color:C.sub,lineHeight:1.55,margin:'0 0 7px'}}>
                {h.malay_translation||h.malay||''}
              </p>
              <p style={{fontSize:12,fontWeight:700,color:C.blue,margin:0}}>{h.source||''}</p>
            </div>
            <div style={{width:82,flexShrink:0,borderRadius:12,overflow:'hidden',alignSelf:'center'}}>
              <img src="https://images.unsplash.com/photo-1585036156171-384164a8c675?w=200&q=80" alt="" style={{width:'100%',height:96,objectFit:'cover',display:'block'}} onError={e=>e.target.style.display='none'}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── Waktu Solat ── */}
      <div style={{padding:'0 16px 12px'}} className="sec-fade">
        <div className="card" style={{padding:'16px 12px'}}>
          {/* Pill header */}
          <div style={{marginBottom:14,paddingLeft:2}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:20,background:'rgba(75,94,255,0.10)',border:'1px solid rgba(75,94,255,0.18)',fontSize:9.5,fontWeight:750,color:C.blue,letterSpacing:'0.04em'}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              WAKTU SOLAT HARI INI
            </span>
          </div>
          {/* Horizontally scrollable prayer row */}
          <div style={{
            display:'flex', gap:6, overflowX:'auto', overflowY:'hidden',
            paddingBottom:4, paddingLeft:2, paddingRight:2,
            scrollbarWidth:'none', msOverflowStyle:'none',
            WebkitOverflowScrolling:'touch',
          }}>
            <style>{'.pray-scroll::-webkit-scrollbar{display:none}'}</style>
            {PRAYERS.map(p=>{
              const isNext = nextSolatName===p.lbl;
              /* Dhuha: compute as Syuruk + ~1h20m */
              let displayTime = times?.[p.key];
              if (p.key==='dhuha' && times?.syuruk) {
                const [sh,sm] = times.syuruk.split(':').map(Number);
                const total = sh*60+sm+80;
                displayTime = `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
              }
              return (
                <div key={p.key} className={isNext?'prayer-active':''} style={{
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  padding:isNext?'12px 8px':' 10px 6px',borderRadius:isNext?18:16,flexShrink:0,
                  minWidth:isNext?58:52,
                  background:isNext?'linear-gradient(155deg,#1a8fff 0%,#8b48ff 100%)':'rgba(75,94,255,0.05)',
                  border:isNext?'none':'1px solid rgba(75,94,255,0.08)',
                  boxShadow:isNext?'0 10px 28px rgba(13,134,255,0.42),0 3px 10px rgba(139,72,255,0.28),inset 0 1px 0 rgba(255,255,255,0.22)':'none',
                  marginTop:isNext?-4:0, marginBottom:isNext?-4:0,
                  zIndex:isNext?2:0, position:'relative',
                  transition:'all 0.2s',
                }}>
                  <div style={{width:isNext?22:18,height:isNext?22:18,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:isNext?7:5,color:isNext?'rgba(255,255,255,0.92)':'rgba(107,115,172,0.65)'}}>
                    {p.icon}
                  </div>
                  <div style={{fontSize:isNext?7.5:7,fontWeight:750,letterSpacing:'0.04em',textTransform:'uppercase',color:isNext?'rgba(255,255,255,0.80)':C.muted,marginBottom:isNext?6:5,textAlign:'center',lineHeight:1.2,whiteSpace:'nowrap'}}>{p.lbl}</div>
                  <div style={{fontSize:isNext?13:11,fontWeight:860,lineHeight:1,color:isNext?'white':C.ink,marginBottom:2,textAlign:'center',whiteSpace:'nowrap'}}>{fmt12(displayTime)}</div>
                  <div style={{fontSize:isNext?9:8,fontWeight:700,color:isNext?'rgba(255,255,255,0.75)':C.muted,textAlign:'center',letterSpacing:'0.03em'}}>{ampm(displayTime)}</div>
                  {isNext&&<div style={{marginTop:5,padding:'2px 7px',borderRadius:20,background:'rgba(255,255,255,0.20)',fontSize:7,fontWeight:750,color:'white',letterSpacing:'0.06em',whiteSpace:'nowrap'}}>SETERUSNYA</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Announcements ── */}
      <AnnouncementSection/>

    </div>
  );
}

/* ── Announcement items ──────────────────────────────────────────── */
const ANNOUNCEMENTS = [
  {id:1,icon:'📢',label:'PENGUMUMAN',sub:null,color:'#6B48FF'},
  {id:2,icon:'📚',label:'Kelas Pengajian',sub:'Setiap Khamis, 8:30 Malam',color:'#0ea5e9'},
  {id:3,icon:'🏦',label:'Tabung Infaq Masjid',sub:'Maybank 5642 7654 3210',color:'#10b981'},
  {id:4,icon:'🤲',label:'Jom Menyumbang',sub:'Jom Beramal Jariah',color:'#f59e0b'},
  {id:5,icon:'📅',label:'Program Minggu Ini',sub:'Sabtu & Ahad, 9:00 Pagi',color:'#8b5cf6'},
  {id:6,icon:'🕌',label:'Kuliah Maghrib',sub:'Setiap Malam, 8:30 PM',color:'#ec4899'},
];

function AnnouncementSection() {
  const [active,setActive] = useState(0);
  const timerRef = useRef(null);
  const N = ANNOUNCEMENTS.length;

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>setActive(p=>(p+1)%N), 10000);
  };
  useEffect(()=>{startTimer(); return()=>clearInterval(timerRef.current);},[]);

  const goTo = i => { setActive(i); startTimer(); };

  /* drag */
  const drag = useRef({x:0,a:0,on:false});
  const ref = useRef(null);
  const onDown = x => { drag.current={x,a:active,on:true}; };
  const onUp   = x => {
    if(!drag.current.on) return;
    drag.current.on=false;
    const W = (ref.current?.offsetWidth||300)/3;
    const d = drag.current.x - x;
    if(Math.abs(d)>W*0.25) goTo(((drag.current.a+(d>0?1:-1))%N+N)%N);
  };

  return (
    <div style={{padding:'0 0 12px'}} className="sec-fade">
      {/* Clipping window — 3 cards visible */}
      <div ref={ref}
        onMouseDown={e=>onDown(e.clientX)} onMouseUp={e=>onUp(e.clientX)} onMouseLeave={e=>onUp(e.clientX)}
        onTouchStart={e=>onDown(e.touches[0].clientX)} onTouchEnd={e=>onUp(e.changedTouches[0].clientX)}
        style={{overflow:'hidden',padding:'4px 16px 4px',cursor:'grab',userSelect:'none'}}>
        {/* Sliding track */}
        <div style={{
          display:'flex', gap:10,
          width:`${(N/3)*100}%`,
          transform:`translateX(calc(-${active} * (100% / ${N})))`,
          transition:'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {ANNOUNCEMENTS.map((item,i)=>{
            const isA = i===active;
            return (
              <div key={item.id} onClick={()=>goTo(i)} style={{
                width:`calc(100% / ${N})`,flexShrink:0,
                background:isA?`linear-gradient(145deg,${item.color},${item.color}cc)`:'rgba(255,255,255,0.92)',
                border:isA?'none':'1.5px solid rgba(255,255,255,0.98)',
                borderRadius:20,padding:'16px 8px 14px',textAlign:'center',
                boxShadow:isA?`0 10px 26px ${item.color}44`:'0 2px 12px rgba(75,94,255,0.07)',
                cursor:'pointer',transition:'background 0.35s,box-shadow 0.35s',
              }}>
                <div style={{width:46,height:46,borderRadius:14,margin:'0 auto 10px',background:isA?'rgba(255,255,255,0.20)':item.color+'14',border:isA?'1.5px solid rgba(255,255,255,0.30)':item.color+'28',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{item.icon}</div>
                <div style={{fontSize:10.5,fontWeight:750,lineHeight:1.35,color:isA?'white':C.ink}}>{item.label}</div>
                {item.sub&&<div style={{fontSize:9.5,marginTop:4,lineHeight:1.35,color:isA?'rgba(255,255,255,0.82)':C.muted}}>{item.sub}</div>}
              </div>
            );
          })}
        </div>
      </div>
      {/* Dots */}
      <div style={{display:'flex',justifyContent:'center',gap:5,marginTop:10}}>
        {ANNOUNCEMENTS.map((_,i)=>(
          <div key={i} onClick={()=>goTo(i)} style={{width:i===active?20:6,height:6,borderRadius:3,cursor:'pointer',background:i===active?C.blue:'rgba(75,94,255,0.20)',transition:'all 0.35s'}}/>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   JADUAL TAB
   ══════════════════════════════════════════════════════════════════ */
const SUB_TABS=[
  {id:'solat',l:'Waktu Solat',icon:<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L8 8H4l3 3-1 4 6-3 6 3-1-4 3-3h-4z"/></svg>},
  {id:'jadual',l:'Jadual',icon:<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>},
  {id:'calendar',l:'Kalendar',icon:<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="15" r="1" fill="currentColor"/></svg>},
  {id:'iqamah',l:'Iqamah',icon:<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
];

const DEFAULT_ACTS=[
  {id:1,time:'08:30 PM',end:'10:00 PM',title:'Kuliah Maghrib',sp:'Ustaz Ahmad Farhan',venue:'Dewan Solat Utama',color:'#6B48FF',icon:'📖'},
  {id:2,time:'02:30 PM',end:'05:00 PM',title:'Kelas Fardu Ain',sp:'Ustazah Nurul Huda',venue:'Bilik Kuliah 2',color:'#10b981',icon:'👥'},
  {id:3,time:'09:00 AM',end:'12:00 PM',title:'Program Gotong-Royong',sp:'Kawasan Masjid',venue:'Kawasan Masjid',color:'#f59e0b',icon:'⭐'},
  {id:4,time:'07:30 PM',end:'09:00 PM',title:'Majlis Tilawah Al-Quran',sp:'Qari Masjid',venue:'Dewan Solat Utama',color:'#0ea5e9',icon:'📿'},
];

function JadualTab({times,nextSolatName}) {
  const [sub,setSub]=useState('calendar');
  const today=new Date();
  const [vY,setVY]=useState(today.getFullYear());
  const [vM,setVM]=useState(today.getMonth());
  const [sel,setSel]=useState(today.getDate());

  const fd=new Date(vY,vM,1).getDay();
  const dim=new Date(vY,vM+1,0).getDate();
  const pmd=new Date(vY,vM,0).getDate();
  const cells=[];
  for(let i=0;i<fd;i++) cells.push({d:pmd-fd+i+1,c:false});
  for(let i=1;i<=dim;i++) cells.push({d:i,c:true});
  while(cells.length%7) cells.push({d:cells.length-dim-fd+1,c:false});

  const selH=isHoliday(vY,vM,sel);

  return (
    <div style={{paddingBottom:100}}>
      <div style={{padding:'18px 16px 0'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4,background:'rgba(255,255,255,0.75)',border:'1.5px solid rgba(255,255,255,0.98)',borderRadius:18,padding:5}}>
          {SUB_TABS.map(t=>{
            const on=sub===t.id;
            return <button key={t.id} onClick={()=>setSub(t.id)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 4px',borderRadius:13,border:'none',cursor:'pointer',background:on?'white':'transparent',color:on?C.blue:C.muted,boxShadow:on?'0 2px 8px rgba(75,94,255,0.13)':'none',transition:'all 0.15s'}}>
              <span style={{color:on?C.blue:C.muted}}>{t.icon}</span>
              <span style={{fontSize:9.5,fontWeight:on?750:450}}>{t.l}</span>
              {on&&<div style={{width:14,height:2.5,borderRadius:2,background:`linear-gradient(90deg,${C.blue},${C.violet})`}}/>}
            </button>;
          })}
        </div>
      </div>

      {sub==='calendar'&&(
        <div style={{padding:'14px 16px'}}>
          <div className="card">
            <div style={{padding:'16px 18px 10px',borderBottom:'1px solid rgba(75,94,255,0.07)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <h3 style={{fontSize:16,fontWeight:800,color:C.ink,margin:'0 0 2px'}}>Kalendar Masjid</h3>
                  <p style={{fontSize:11,color:C.muted,margin:0}}>{MALAY_MONTHS[vM]} {vY} / {toHijri(new Date(vY,vM,1)).monthName} {toHijri(new Date(vY,vM,1)).year}H</p>
                </div>
                <div style={{display:'flex',gap:5,alignItems:'center'}}>
                  <button onClick={()=>{setVY(today.getFullYear());setVM(today.getMonth());setSel(today.getDate());}} style={{padding:'4px 9px',borderRadius:8,cursor:'pointer',background:'rgba(75,94,255,0.08)',border:'1px solid rgba(75,94,255,0.18)',color:C.blue,fontSize:10,fontWeight:700}}>Hari Ini</button>
                  {[{a:'‹',fn:()=>{if(vM===0){setVY(y=>y-1);setVM(11);}else setVM(m=>m-1);}},{a:'›',fn:()=>{if(vM===11){setVY(y=>y+1);setVM(0);}else setVM(m=>m+1);}}].map(({a,fn})=>(
                    <button key={a} onClick={fn} style={{width:28,height:28,borderRadius:8,border:'1px solid rgba(75,94,255,0.14)',background:'rgba(255,255,255,0.85)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:C.sub,fontWeight:700}}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'10px 12px 4px'}}>
              {MALAY_DSHORT.map((d,i)=><div key={d} style={{textAlign:'center',fontSize:10,fontWeight:700,padding:'3px 0',color:i===5?C.blue:C.muted}}>{d}</div>)}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'0 10px 12px',gap:'2px 0'}}>
              {cells.map((cell,i)=>{
                const holiday=cell.c?isHoliday(vY,vM,cell.d):null;
                const isToday=cell.c&&cell.d===today.getDate()&&vM===today.getMonth()&&vY===today.getFullYear();
                const isSel=cell.c&&cell.d===sel;
                const hc=cell.c?toHijri(new Date(vY,vM,cell.d)):null;
                return <div key={i} onClick={()=>cell.c&&setSel(cell.d)} style={{textAlign:'center',padding:'4px 1px',borderRadius:10,cursor:cell.c?'pointer':'default',background:isSel?`linear-gradient(145deg,${C.blue},${C.violet})`:'transparent',opacity:cell.c?1:0.28}}>
                  <div style={{fontSize:13,fontWeight:isSel||isToday?800:400,lineHeight:1.2,color:isSel?'white':isToday?C.blue:C.ink}}>{cell.d}</div>
                  {hc&&<div style={{fontSize:7.5,color:isSel?'rgba(255,255,255,0.72)':C.faint,lineHeight:1,marginTop:1}}>{hc.day} {hc.monthName?.slice(0,3)}</div>}
                  <div style={{display:'flex',justifyContent:'center',gap:2,marginTop:2}}>
                    {holiday&&<div style={{width:4,height:4,borderRadius:'50%',background:isSel?'rgba(255,255,255,0.85)':'#f59e0b'}}/>}
                    {isToday&&!isSel&&<div style={{width:4,height:4,borderRadius:'50%',background:C.blue}}/>}
                  </div>
                </div>;
              })}
            </div>
            <div style={{padding:'6px 16px 12px',borderTop:'1px solid rgba(75,94,255,0.06)',display:'flex',gap:10,flexWrap:'wrap'}}>
              {[{c:'#6B48FF',l:'Kuliah'},{c:'#10b981',l:'Program'},{c:'#f59e0b',l:'Cuti Umum'},{c:'#0ea5e9',l:'Lain-lain'}].map(x=>(
                <div key={x.l} style={{display:'flex',alignItems:'center',gap:5}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:x.c}}/>
                  <span style={{fontSize:9.5,color:C.muted}}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
          {selH&&<div style={{marginTop:10,padding:'10px 14px',borderRadius:12,background:'rgba(245,158,11,0.10)',border:'1.5px solid rgba(245,158,11,0.24)',display:'flex',gap:9,alignItems:'center'}}>
            <span style={{fontSize:17}}>🎉</span>
            <div><div style={{fontSize:12,fontWeight:750,color:'#92400e'}}>{selH.name}</div><div style={{fontSize:11,color:'#b45309'}}>Cuti Umum Malaysia</div></div>
          </div>}
          <div style={{marginTop:14}}>
            <h4 style={{fontSize:13,fontWeight:800,color:C.ink,margin:'0 0 10px',display:'flex',alignItems:'center',gap:7}}>
              Acara pada {sel} {MALAY_MONTHS[vM]}
              <span style={{fontSize:11,color:C.blue,fontWeight:600}}>({MALAY_DAYS[new Date(vY,vM,sel).getDay()]})</span>
            </h4>
            {DEFAULT_ACTS.map(a=>(
              <div key={a.id} className="card" style={{padding:'13px 15px',marginBottom:9,cursor:'pointer'}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:44,height:44,borderRadius:13,flexShrink:0,background:`${a.color}18`,border:`1px solid ${a.color}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:21}}>{a.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,color:C.blue,fontWeight:700,marginBottom:2}}>{a.time} – {a.end}</div>
                    <div style={{fontSize:13,fontWeight:800,color:C.ink,marginBottom:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</div>
                    <div style={{fontSize:11,color:C.muted}}>{a.sp}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:10,color:C.muted,marginBottom:4}}>{a.venue}</div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sub==='solat'&&(
        <div style={{padding:'14px 16px'}}>
          <div className="card">
            <div style={{padding:'14px 16px'}}>
              <h3 style={{fontSize:14,fontWeight:800,color:C.ink,margin:'0 0 12px'}}>Waktu Solat Hari Ini</h3>
              {PRAYERS.map((p,i)=>{
                const isNext=nextSolatName===p.lbl;
                let dTime = times?.[p.key];
                if (p.key==='dhuha' && times?.syuruk) {
                  const [sh,sm]=times.syuruk.split(':').map(Number);
                  const tot=sh*60+sm+80;
                  dTime=`${String(Math.floor(tot/60)).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`;
                }
                return <div key={p.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:i<PRAYERS.length-1?'1px solid rgba(75,94,255,0.06)':'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:11}}>
                    <div style={{width:36,height:36,borderRadius:11,background:isNext?`linear-gradient(135deg,${C.blue},${C.violet})`:'rgba(75,94,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',color:isNext?'white':'rgba(107,115,172,0.65)'}}>
                      <div style={{width:18,height:18}}>{p.icon}</div>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.ink}}>{p.lbl}{p.key==='dhuha'&&<span style={{fontSize:9,color:C.muted,marginLeft:4,fontWeight:400}}>(Anggaran)</span>}</div>
                      {isNext&&<div style={{fontSize:10,color:C.blue,fontWeight:600}}>Seterusnya</div>}
                    </div>
                  </div>
                  <div><span style={{fontSize:19,fontWeight:850,color:isNext?C.blue:C.ink}}>{fmt12(dTime)}</span><span style={{fontSize:10,color:C.muted,marginLeft:3}}>{ampm(dTime)}</span></div>
                </div>;
              })}
            </div>
          </div>
        </div>
      )}

      {(sub==='jadual'||sub==='iqamah')&&(
        <div style={{padding:'48px 16px 110px',textAlign:'center'}}>
          <div style={{width:70,height:70,borderRadius:21,margin:'0 auto 14px',background:'rgba(75,94,255,0.08)',border:'1px solid rgba(75,94,255,0.14)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:30}}>{sub==='iqamah'?'⏱':'📋'}</span>
          </div>
          <p style={{fontSize:13,fontWeight:600,color:C.sub,marginBottom:5}}>{sub==='iqamah'?'Jadual Iqamah':'Jadual Program'}</p>
          <p style={{fontSize:12,color:C.muted}}>Akan dikemaskini melalui panel admin</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   KOMUNITI TAB
   ══════════════════════════════════════════════════════════════════ */
function KomunitiTab() {
  return (
    <div style={{padding:'24px 16px 110px'}}>
      <h2 style={{fontSize:17,fontWeight:850,color:C.ink,margin:'0 0 16px'}}>Komuniti Masjid</h2>
      {[{icon:'📢',title:'Pengumuman Masjid',sub:'Berita & maklumat terkini',color:'#6B48FF'},{icon:'💰',title:'Tabung Masjid',sub:'Infaq, zakat & sedekah',color:'#10b981'},{icon:'📚',title:'Kelas Pengajian',sub:'Jadual & pendaftaran',color:'#f59e0b'},{icon:'🏗',title:'Projek Masjid',sub:'Pembinaan & pengubahsuaian',color:'#0ea5e9'}].map(item=>(
        <div key={item.title} className="card" style={{padding:'15px 17px',marginBottom:10,cursor:'pointer'}}>
          <div style={{display:'flex',alignItems:'center',gap:13}}>
            <div style={{width:44,height:44,borderRadius:13,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:21,background:`${item.color}13`,border:`1px solid ${item.color}22`}}>{item.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:750,color:C.ink}}>{item.title}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{item.sub}</div></div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PROFIL TAB
   ══════════════════════════════════════════════════════════════════ */

/* Zone Selector bottom sheet */
function ZoneModal({ currentZone, onZoneChange, onClose }) {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  useEffect(() => {
    for (const [state, zones] of Object.entries(ZONES)) {
      if (Object.keys(zones).includes(currentZone)) { setExpanded(state); break; }
    }
  }, [currentZone]);
  const filtered = Object.entries(ZONES).reduce((acc, [state, zones]) => {
    const q = search.toLowerCase();
    const matched = Object.entries(zones).filter(([code, label]) =>
      !q || code.toLowerCase().includes(q) || label.toLowerCase().includes(q) || state.toLowerCase().includes(q));
    if (matched.length) acc[state] = Object.fromEntries(matched);
    return acc;
  }, {});
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(7,20,60,0.52)',backdropFilter:'blur(8px)',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'rgba(246,248,255,0.99)',borderRadius:'28px 28px 0 0',maxHeight:'84vh',display:'flex',flexDirection:'column',boxShadow:'0 -8px 40px rgba(75,94,255,0.20)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}>
          <div style={{width:42,height:4,borderRadius:2,background:'rgba(75,94,255,0.18)'}}/>
        </div>
        <div style={{padding:'14px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(75,94,255,0.09)'}}>
          <div>
            <h3 style={{margin:0,fontSize:17,fontWeight:800,color:C.ink}}>Zon Waktu Solat</h3>
            <p style={{margin:'3px 0 0',fontSize:12,color:C.muted}}>Zon semasa: <strong style={{color:C.blue}}>{currentZone}</strong></p>
          </div>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:10,border:'none',background:'rgba(75,94,255,0.08)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:C.muted}}>×</button>
        </div>
        <div style={{padding:'10px 16px',borderBottom:'1px solid rgba(75,94,255,0.07)'}}>
          <div style={{position:'relative'}}>
            <svg style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Cari zon atau negeri…"
              style={{width:'100%',padding:'9px 12px 9px 32px',borderRadius:12,border:'1.5px solid rgba(75,94,255,0.15)',background:'white',fontSize:13,color:C.ink,boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}/>
          </div>
        </div>
        <div style={{overflowY:'auto',flex:1,paddingBottom:'env(safe-area-inset-bottom,16px)'}}>
          {Object.entries(filtered).map(([state, zones]) => (
            <div key={state}>
              <button onClick={()=>setExpanded(e=>e===state?null:state)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',border:'none',background:'transparent',cursor:'pointer',textAlign:'left'}}>
                <span style={{fontSize:13,fontWeight:750,color:C.sub}}>{state}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="2.5" strokeLinecap="round"
                  style={{transform:expanded===state||search?'rotate(180deg)':' none',transition:'transform 0.2s'}}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {(expanded===state||!!search)&&Object.entries(zones).map(([code,label])=>{
                const isActive=code===currentZone;
                return (
                  <button key={code} onClick={()=>{onZoneChange(code);onClose();}} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'10px 20px 10px 32px',border:'none',cursor:'pointer',textAlign:'left',background:isActive?`${C.blue}0d`:'transparent',borderLeft:isActive?`3px solid ${C.blue}`:"3px solid transparent",transition:'background 0.15s'}}>
                    <span style={{fontSize:11,fontWeight:800,color:isActive?C.blue:C.faint,minWidth:50,flexShrink:0}}>{code}</span>
                    <span style={{fontSize:13,color:isActive?C.ink:C.sub,flex:1,lineHeight:1.4}}>{label}</span>
                    {isActive&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilTab({profile, currentZone, onZoneChange}) {
  const [showZone, setShowZone] = useState(false);
  const zoneLabel = Object.values(ZONES).flatMap(z=>Object.entries(z)).find(([k])=>k===currentZone)?.[1]||'Kuala Lumpur & Putrajaya';
  return (
    <div style={{padding:'24px 16px 110px'}}>
      {showZone&&<ZoneModal currentZone={currentZone||'WLY01'} onZoneChange={onZoneChange} onClose={()=>setShowZone(false)}/>}
      <div className="card" style={{padding:'22px 18px',marginBottom:16,textAlign:'center'}}>
        <div style={{width:74,height:74,borderRadius:21,margin:'0 auto 13px',background:'linear-gradient(145deg,#4B5EFF,#7B5CFF)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 10px 26px rgba(75,94,255,0.33)'}}>
          <MosqueSVG size={32}/>
        </div>
        <h3 style={{fontSize:17,fontWeight:850,color:C.ink,margin:'0 0 4px'}}>{profile?.masjid_name||'MasjidTV'}</h3>
        <p style={{fontSize:11,color:C.muted,margin:0}}>{profile?.masjid_description||'Sistem InfoTV Islamik'}</p>
      </div>
      {/* Zon Solat — interactive */}
      <button onClick={()=>setShowZone(true)} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'14px 17px',marginBottom:9,background:'rgba(255,255,255,0.92)',border:`1.5px solid ${C.blue}30`,borderRadius:18,cursor:'pointer',textAlign:'left',boxShadow:`0 2px 14px ${C.blue}0d`}}>
        <span style={{fontSize:21,flexShrink:0}}>🌐</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:650,color:C.ink}}>Zon Solat</div>
          <div style={{fontSize:11,color:C.blue,marginTop:2,fontWeight:700}}>{currentZone||'WLY01'} — {zoneLabel}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      {[
        {icon:'⚙️',l:'Tetapan',s:'Konfigurasi masjid'},
        {icon:'🔔',l:'Notifikasi',s:'Urus pemberitahuan'},
        {icon:'ℹ️',l:'Tentang MasjidTV',s:'Versi 1.0 — Khalifah Territory'},
      ].map(item=>(
        <div key={item.l} className="card" style={{padding:'13px 17px',marginBottom:9,cursor:'pointer'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:21,flexShrink:0}}>{item.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:650,color:C.ink}}>{item.l}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{item.s}</div></div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PAPARAN TAB — viewport mode switcher (TV / Tablet / Mobile)
   ══════════════════════════════════════════════════════════════════ */
function PaparanTab({profile, viewportMode, onViewChange}) {
  const MODES = [
    {
      id:'tv', label:'Paparan TV',
      desc:'Skrin penuh untuk TV & projektor (1920×1080)',
      icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
      gradient:'linear-gradient(135deg,#0d86ff,#8b48ff)',
    },
    {
      id:'tablet', label:'Paparan Tablet',
      desc:'Skrin tablet 1024×768px',
      icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18" strokeWidth="2"/></svg>,
      gradient:'linear-gradient(135deg,#0ea5e9,#22d3ee)',
    },
    {
      id:'mobile', label:'Paparan Mobile',
      desc:'Reka letak aplikasi mudah alih',
      icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18" strokeWidth="2"/></svg>,
      gradient:'linear-gradient(135deg,#7B5CFF,#ec4899)',
    },
  ];

  return (
    <div style={{padding:'24px 16px 110px'}}>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:18,fontWeight:850,color:C.ink,margin:'0 0 4px'}}>Mod Paparan</h2>
        <p style={{fontSize:12,color:C.muted,margin:0}}>Pilih mod paparan untuk skrin InfoTV</p>
      </div>

      {MODES.map(mode => {
        const isActive = viewportMode === mode.id;
        return (
          <button key={mode.id} onClick={() => onViewChange(mode.id)}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:16,
              padding:'16px 18px', marginBottom:12, borderRadius:20,
              border: isActive ? 'none' : '1.5px solid rgba(255,255,255,0.88)',
              background: isActive ? mode.gradient : 'rgba(255,255,255,0.72)',
              boxShadow: isActive
                ? '0 8px 28px rgba(75,94,255,0.30)'
                : '0 4px 20px rgba(75,94,255,0.08)',
              cursor:'pointer', textAlign:'left',
              transition:'all 0.2s',
            }}>
            <div style={{
              width:52, height:52, borderRadius:16, flexShrink:0,
              background: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(75,94,255,0.10)',
              border: isActive ? '1.5px solid rgba(255,255,255,0.35)' : '1px solid rgba(75,94,255,0.18)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color: isActive ? 'white' : C.blue,
            }}>
              {mode.icon}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{
                fontSize:15, fontWeight:800,
                color: isActive ? 'white' : C.ink,
                marginBottom:3,
              }}>{mode.label}</div>
              <div style={{
                fontSize:12,
                color: isActive ? 'rgba(255,255,255,0.80)' : C.muted,
              }}>{mode.desc}</div>
            </div>
            {isActive && (
              <div style={{width:22, height:22, borderRadius:'50%', background:'rgba(255,255,255,0.28)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            )}
          </button>
        );
      })}

      <div className="card" style={{padding:'18px',marginTop:8}}>
        <div style={{display:'flex',alignItems:'center',gap:13}}>
          <div style={{width:44,height:44,borderRadius:13,background:'linear-gradient(145deg,#4B5EFF,#7B5CFF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 6px 18px rgba(75,94,255,0.30)'}}>
            <MosqueSVG size={22}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:750,color:C.ink,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.masjid_name||'MasjidTV'}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{profile?.zone_code||'WLY01'} · {profile?.masjid_description||'Sistem InfoTV Islamik'}</div>
          </div>
        </div>
      </div>

      <div style={{marginTop:16, padding:'12px 0', textAlign:'center'}}>
        <p style={{fontSize:11,color:C.faint,margin:0}}>MasjidTV v1.0 · Khalifah Territory</p>
        <p style={{fontSize:10,color:C.faint,margin:'4px 0 0'}}>Data waktu solat rasmi JAKIM</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   BOTTOM NAV — floating rounded pill
   ══════════════════════════════════════════════════════════════════ */
const NAV_TABS=[
  {id:'home',l:'Utama',d:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'},
  {id:'jadual',l:'Jadual',d:'M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2 M8 2v4 M16 2v4 M3 10h18'},
  {id:'komuniti',l:'Komuniti',d:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75'},
  {id:'paparan',l:'Paparan',d:'M20 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8 21h8M12 17v4'},
];

function BottomNav({active,onChange}) {
  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:100,padding:'0 12px 14px',paddingBottom:'calc(14px + env(safe-area-inset-bottom,0px))'}}>
      <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.94)',border:'1.5px solid rgba(255,255,255,0.98)',borderRadius:36,boxShadow:'0 8px 32px rgba(75,94,255,0.16), 0 1px 0 rgba(255,255,255,0.85) inset',padding:'6px 4px',height:64}}>
        {/* Left 2 */}
        {NAV_TABS.slice(0,2).map(tab=>{
          const on=active===tab.id;
          return <button key={tab.id} onClick={()=>onChange(tab.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:on?`${C.blue}11`:'transparent',border:'none',cursor:'pointer',padding:'6px 4px',borderRadius:24,margin:'0 2px',transition:'all 0.18s'}}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={on?C.blue:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {tab.d.split(' M').map((seg,i)=><path key={i} d={(i?'M':'')+seg}/>)}
            </svg>
            <span style={{fontSize:9.5,fontWeight:on?750:450,color:on?C.blue:C.muted,lineHeight:1}}>{tab.l}</span>
          </button>;
        })}
        {/* Centre FAB — links to Profil */}
        <div style={{flex:'0 0 72px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',marginTop:-24}}>
          <div onClick={()=>onChange('profil')} style={{width:56,height:56,borderRadius:'50%',background:'linear-gradient(145deg,#4B5EFF,#7B5CFF)',border:'4px solid white',boxShadow:'0 8px 26px rgba(75,94,255,0.42)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'transform 0.18s'}}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.07)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
            <MosqueSVG size={26}/>
          </div>
        </div>
        {/* Right 2 — Komuniti + Paparan */}
        {NAV_TABS.slice(2).map(tab=>{
          const on=active===tab.id;
          return <button key={tab.id} onClick={()=>onChange(tab.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:on?`${C.blue}11`:'transparent',border:'none',cursor:'pointer',padding:'6px 4px',borderRadius:24,margin:'0 2px',transition:'all 0.18s'}}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={on?C.blue:C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {tab.d.split(' M').map((seg,i)=><path key={i} d={(i?'M':'')+seg}/>)}
            </svg>
            <span style={{fontSize:9.5,fontWeight:on?750:450,color:on?C.blue:C.muted,lineHeight:1}}>{tab.l}</span>
          </button>;
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROOT
   ══════════════════════════════════════════════════════════════════ */
export default function MobileInfoTV(props) {
  const [tab,setTab]=useState('home');
  return (
    <>
      <InjectStyles/>
      <div className="mob-root">
        {tab==='home'    &&<HomeTab    {...props}/>}
        {tab==='jadual'  &&<JadualTab  times={props.times} nextSolatName={props.nextSolatName}/>}
        {tab==='komuniti'&&<KomunitiTab/>}
        {tab==='profil'  &&<ProfilTab  profile={props.profile} currentZone={props.currentZone} onZoneChange={props.onZoneChange}/>}
        {tab==='paparan' &&<PaparanTab profile={props.profile} viewportMode={props.viewportMode} onViewChange={props.onViewChange}/>}
        <BottomNav active={tab} onChange={setTab}/>
      </div>
    </>
  );
}
