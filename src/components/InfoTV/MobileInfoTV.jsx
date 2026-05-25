/**
 * MobileInfoTV.jsx — Full redesign matching Masjid As-Salam reference
 * Layout: soft lavender gradient bg, glass cards, purple accent,
 * bottom nav with centre FAB, icon-based prayer row.
 */
import { useState, useEffect, useRef } from 'react';
import { isHoliday, toHijri } from '../../lib/myHolidays';

/* ─── Design tokens ──────────────────────────────────────────────── */
const C = {
  bg1: '#eceeff', bg2: '#e4e8ff', bg3: '#ede8ff',
  blue:   '#4B5EFF',
  violet: '#7B5CFF',
  indigo: '#5B6AF5',
  ink:    '#1a1f3d',
  sub:    '#444b72',
  muted:  '#7a82ac',
  faint:  'rgba(122,130,172,0.45)',
  line:   'rgba(75,94,255,0.08)',
  glass:  'rgba(255,255,255,0.78)',
  gBord:  'rgba(255,255,255,0.92)',
  shadow: '0 4px 20px rgba(75,94,255,0.09)',
};

/* ─── Helpers ────────────────────────────────────────────────────── */
const MALAY_DAYS   = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
const MALAY_DSHORT = ['Ahd','Isn','Sel','Rab','Kha','Jum','Sab'];
const MALAY_MONTHS = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];

function fmt12(t) {
  if (!t) return '--:--';
  const [h,m] = t.split(':').map(Number);
  const hh = h%12||12;
  return `${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function ampm(t) {
  if (!t) return '';
  const [h] = t.split(':').map(Number);
  return h>=12 ? 'PM' : 'AM';
}
function pad(n){ return String(n).padStart(2,'0'); }

/* ─── Prayer config ─────────────────────────────────────────────── */
const PRAYERS = [
  { key:'imsak',   label:'IMSAK',   svg:'M12 3a9 9 0 0 0 0 18 9 9 0 0 0 0-18zm0 2a7 7 0 1 1 0 14A7 7 0 0 1 12 5z' },
  { key:'subuh',   label:'SUBUH',   svg:'M12 2L8 8H4l3 3-1 4 6-3 6 3-1-4 3-3h-4z' },
  { key:'syuruk',  label:'SYURUK',  svg:'M12 4V2M4.22 4.22l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M12 20v2m5.66-2.22l1.42 1.42M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0z' },
  { key:'zohor',   label:'ZUHUR',   svg:'M12 2v2M5.636 4.636 7.05 6.05M2 12h2m16 0h2M19.364 4.636 17.95 6.05M12 22v-2m6.364-3.364-1.414-1.414M22 12h-2M4.636 19.364l1.414-1.414M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z' },
  { key:'asar',    label:'ASAR',    svg:'M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0zM3 12h1M20 12h1M12 3v1M12 20v1' },
  { key:'maghrib', label:'MAGHRIB', svg:'M20 12c0 4.418-3.582 8-8 8a8 8 0 0 1 0-16c.34 0 .676.021 1.007.062A6 6 0 1 0 19.938 11C19.979 11.324 20 11.66 20 12z' },
  { key:'isyak',   label:'ISYAK',   svg:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' },
];

/* ─── Shared Card ────────────────────────────────────────────────── */
function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.glass,
      backdropFilter: 'blur(28px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
      border: `1.5px solid ${C.gBord}`,
      borderRadius: 22,
      boxShadow: `${C.shadow}, 0 1px 0 rgba(255,255,255,0.85) inset`,
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── SVG icon helper ────────────────────────────────────────────── */
function Ico({ d, size=18, color='currentColor', strokeWidth=1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );
}

/* ─── Pill badge ─────────────────────────────────────────────────── */
function Pill({ children, icon, bg='rgba(75,94,255,0.12)', color=C.blue }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'5px 12px', borderRadius:20,
      background: bg, border:`1px solid ${color}28`,
      fontSize:11, fontWeight:700, color, letterSpacing:'0.04em',
    }}>
      {icon && <span style={{fontSize:12}}>{icon}</span>}
      {children}
    </span>
  );
}

/* ─── Announcement Carousel ─────────────────────────────────────── */
const ANNOUNCEMENTS = [
  { id:1, icon:'📢', label:'PENGUMUMAN',        sub:null,                     color:'#6B48FF' },
  { id:2, icon:'📚', label:'Kelas Pengajian',    sub:'Setiap Khamis, 8:30 Malam', color:'#0ea5e9' },
  { id:3, icon:'🏦', label:'Tabung Infaq Masjid',sub:'Maybank 5642 7654 3210', color:'#10b981' },
  { id:4, icon:'🤲', label:'Jom Menyumbang',     sub:'Jom Beramal Jariah',     color:'#f59e0b' },
  { id:5, icon:'📅', label:'Program Minggu Ini', sub:'Sabtu & Ahad, 9:00 Pagi',color:'#8b5cf6' },
  { id:6, icon:'🕌', label:'Kuliah Maghrib',      sub:'Setiap Malam, 8:30 PM', color:'#ec4899' },
];

function AnnouncementCarousel() {
  const [active,  setActive]  = useState(0);
  const autoRef               = useRef(null);
  const containerRef          = useRef(null);

  // Drag/swipe state
  const drag = useRef({ startX: 0, isDragging: false, startActive: 0 });

  const N = ANNOUNCEMENTS.length;

  // Each card occupies exactly 1/3 of the container width.
  // We translate the track by -(active * 33.333)% relative to container.
  // This keeps exactly 3 cards visible at all times.

  const startAuto = () => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % N);
    }, 10000);
  };

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoRef.current);
  }, []); // eslint-disable-line

  const goTo = (idx) => {
    setActive(((idx % N) + N) % N);
    startAuto(); // reset timer on manual interaction
  };

  // Touch / mouse drag to swipe
  const onDragStart = (clientX) => {
    drag.current = { startX: clientX, isDragging: true, startActive: active };
  };
  const onDragEnd = (clientX) => {
    if (!drag.current.isDragging) return;
    drag.current.isDragging = false;
    const diff = drag.current.startX - clientX;
    const W = containerRef.current?.offsetWidth || 300;
    // swipe threshold: 15% of card width (one card = W/3)
    if (Math.abs(diff) > W / 3 / 3) {
      goTo(diff > 0 ? active + 1 : active - 1);
    }
  };

  return (
    <div style={{ padding: '0 0 20px' }}>
      {/* Clipping window — shows exactly 3 cards */}
      <div
        ref={containerRef}
        style={{
          overflow: 'hidden',
          padding: '4px 16px 4px',
          cursor: 'grab',
          userSelect: 'none',
        }}
        onMouseDown={e  => onDragStart(e.clientX)}
        onMouseUp={e    => onDragEnd(e.clientX)}
        onMouseLeave={e => onDragEnd(e.clientX)}
        onTouchStart={e => onDragStart(e.touches[0].clientX)}
        onTouchEnd={e   => onDragEnd(e.changedTouches[0].clientX)}
      >
        {/* Sliding track — width = N/3 × 100% of container */}
        <div style={{
          display: 'flex',
          gap: 10,
          width: `${(N / 3) * 100}%`,
          transform: `translateX(calc(-${active} * (100% / ${N}) ))`,
          transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}>
          {ANNOUNCEMENTS.map((item, i) => {
            const isActive = i === active;
            // Each card takes exactly 1/N of the track = 1/3 of the container
            return (
              <div
                key={item.id}
                onClick={() => goTo(i)}
                style={{
                  width: `calc(100% / ${N})`,
                  flexShrink: 0,
                  background: isActive
                    ? `linear-gradient(145deg,${item.color},${item.color}cc)`
                    : C.glass,
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: isActive ? 'none' : `1.5px solid ${C.gBord}`,
                  borderRadius: 20,
                  padding: '16px 8px 14px',
                  textAlign: 'center',
                  boxShadow: isActive
                    ? `0 10px 28px ${item.color}44`
                    : C.shadow,
                  cursor: 'pointer',
                  transition: 'background 0.35s, box-shadow 0.35s, border 0.35s',
                }}
              >
                {/* Icon bubble */}
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  margin: '0 auto 10px',
                  background: isActive ? 'rgba(255,255,255,0.22)' : `${item.color}14`,
                  border: isActive ? '1.5px solid rgba(255,255,255,0.32)' : `1.5px solid ${item.color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>{item.icon}</div>

                <div style={{
                  fontSize: 11, fontWeight: 750, lineHeight: 1.35,
                  color: isActive ? 'white' : C.ink,
                }}>
                  {item.label}
                </div>
                {item.sub && (
                  <div style={{
                    fontSize: 10, marginTop: 4, lineHeight: 1.35,
                    color: isActive ? 'rgba(255,255,255,0.82)' : C.muted,
                  }}>
                    {item.sub}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 10 }}>
        {ANNOUNCEMENTS.map((_, i) => (
          <div
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === active ? 20 : 6,
              height: 6, borderRadius: 3, cursor: 'pointer',
              background: i === active ? C.blue : 'rgba(75,94,255,0.2)',
              transition: 'all 0.35s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOME TAB
   ═══════════════════════════════════════════════════════════════════ */
function HomeTab({ times, nextSolatName, hours, minutes, seconds, isImminent,
  progressPct, time, gregorianDate, hijriDate, dayName, hadith, slides,
  slideIndex, setSlideIndex, profile, masjidIcon }) {

  const hh = parseInt(time.substring(0,2), 10);
  const meridiem = hh >= 12 ? 'PM' : 'AM';
  const cur = slides[slideIndex] || slides[0] || {};

  /* rotate hadith */
  const hadithArr = Array.isArray(hadith) ? hadith : [hadith];
  const [hidx, setHidx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHidx(i => (i+1) % hadithArr.length), 12000);
    return () => clearInterval(t);
  }, [hadithArr.length]);
  const h = hadithArr[hidx] || hadithArr[0] || {};

  /* auto-advance slider */
  useEffect(() => {
    const t = setInterval(() => setSlideIndex(i => (i+1) % slides.length), 9000);
    return () => clearInterval(t);
  }, [slides.length, setSlideIndex]);

  const dateStr = gregorianDate.replace(/^[A-Za-z]+,\s*/, '');

  return (
    <div style={{ paddingBottom: 110 }}>

      {/* ─── Header ─── */}
      <div style={{ padding:'22px 18px 14px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', gap:14, alignItems:'center', flex:1, minWidth:0 }}>
          {/* Icon */}
          <div style={{
            width:74, height:74, borderRadius:20, flexShrink:0,
            background: masjidIcon ? 'transparent' : `linear-gradient(145deg,${C.blue},${C.violet})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: masjidIcon ? 'none' : '0 10px 28px rgba(75,94,255,0.35)',
            overflow:'hidden',
          }}>
            {masjidIcon
              ? <img src={masjidIcon} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}}
                  onError={e=>e.target.style.display='none'}/>
              : <svg width="38" height="38" viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 56V30M56 56V30"/>
                  <path d="M2 30h60"/>
                  <path d="M8 30c0-8 6-14 12-18l4-8 4 8c6 4 12 10 12 18"/>
                  <path d="M32 4v6"/>
                  <path d="M20 56V38h24v18"/>
                  <path d="M27 56V46h10v10"/>
                  <circle cx="32" cy="30" r="4"/>
                  <path d="M44 30c0-8 6-14 12-18"/>
                  <path d="M20 30c0-8-6-14-12-18"/>
                </svg>
            }
          </div>
          <div style={{minWidth:0}}>
            <h1 style={{fontSize:22,fontWeight:850,color:C.ink,margin:'0 0 3px',lineHeight:1.1,
              overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {profile?.masjid_name || 'MasjidTV'}
            </h1>
            <p style={{fontSize:12,color:C.sub,margin:'0 0 4px',lineHeight:1.4}}>
              {profile?.masjid_description || 'Sistem InfoTV Islamik'}
            </p>
            <p style={{fontSize:11,color:C.muted,margin:0,fontStyle:'italic'}}>
              Menyatukan Ummah, Mengimarahkan Masjid
            </p>
          </div>
        </div>
        {/* Bell */}
        <div style={{
          width:46,height:46,borderRadius:16,flexShrink:0,
          background:'rgba(255,255,255,0.82)',
          border:'1.5px solid rgba(255,255,255,0.92)',
          boxShadow:'0 4px 14px rgba(75,94,255,0.1)',
          display:'flex',alignItems:'center',justifyContent:'center',
          position:'relative',cursor:'pointer',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style={{position:'absolute',top:9,right:9,width:8,height:8,borderRadius:'50%',
            background:C.violet,border:'2px solid white'}}/>
        </div>
      </div>

      {/* ─── Time & Date ─── */}
      <div style={{padding:'0 16px 12px'}}>
        <Card style={{padding:'18px 20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            {/* Clock bubble */}
            <div style={{
              width:58,height:58,borderRadius:18,flexShrink:0,
              background:'rgba(255,255,255,0.8)',
              border:'1.5px solid rgba(255,255,255,0.95)',
              boxShadow:'0 6px 18px rgba(75,94,255,0.12)',
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.indigo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            {/* Big time */}
            <div>
              <div style={{display:'flex',alignItems:'flex-end',gap:5,lineHeight:1}}>
                <span style={{fontSize:38,fontWeight:850,color:C.ink,letterSpacing:'-0.04em',lineHeight:1}}>
                  {time.substring(0,5)}
                </span>
                <span style={{fontSize:16,fontWeight:800,color:C.blue,paddingBottom:3}}>{meridiem}</span>
              </div>
            </div>
            {/* Divider */}
            <div style={{width:1,height:56,background:'rgba(75,94,255,0.12)',margin:'0 4px'}}/>
            {/* Dates */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:7}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.indigo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <div>
                  <strong style={{display:'block',fontSize:14,color:C.ink,lineHeight:1.2}}>{dateStr}</strong>
                  <span style={{fontSize:12,color:C.muted}}>{dayName}</span>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.indigo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <div>
                  <strong style={{display:'block',fontSize:13,color:C.ink,lineHeight:1.2}}>{hijriDate}</strong>
                  <span style={{fontSize:12,color:C.muted}}>{dayName}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Countdown ─── */}
      <div style={{padding:'0 16px 12px'}}>
        <Card style={{padding:'18px 20px 14px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <span style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.08em'}}>
                COUNTDOWN KE
              </span>
              <div style={{fontSize:22,fontWeight:850,color:isImminent?'#e05c00':C.blue,lineHeight:1.1,margin:'4px 0 12px'}}>
                {nextSolatName || '--'}
              </div>
              {/* Big digits row */}
              <div style={{display:'flex',alignItems:'flex-end',gap:0}}>
                {[{n:pad(hours),label:'JAM'},{n:pad(minutes),label:'MINIT'},{n:pad(seconds),label:'SAAT'}].map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-end',gap:0}}>
                    <div style={{textAlign:'center',minWidth:46}}>
                      <div style={{fontSize:42,fontWeight:850,color:isImminent?'#e05c00':C.ink,lineHeight:1,letterSpacing:'-0.02em'}}>{item.n}</div>
                      <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:'0.06em',marginTop:3}}>{item.label}</div>
                    </div>
                    {i<2 && <div style={{fontSize:36,fontWeight:700,color:C.muted,paddingBottom:16,margin:'0 1px',lineHeight:1}}>:</div>}
                  </div>
                ))}
              </div>
              {/* Progress */}
              <div style={{marginTop:14,height:5,borderRadius:10,background:'rgba(75,94,255,0.1)',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${progressPct}%`,borderRadius:10,
                  background:`linear-gradient(90deg,${C.blue},${C.violet})`,transition:'width 1s linear'}}/>
              </div>
            </div>
            {/* Decorative mosque silhouette */}
            <div style={{flexShrink:0,opacity:0.12,marginLeft:8,marginTop:-4}}>
              <svg width="72" height="72" viewBox="0 0 64 64" fill={C.violet}>
                <path d="M32 4c-2 0-3 1-3 3v4c-6 1-10 6-10 12v2H8v4h2v26h44V29h2v-4H46v-2c0-6-4-11-10-12V7c0-2-1-3-4-3zm0 10c4 0 7 3 7 8v2H25v-2c0-5 3-8 7-8z"/>
              </svg>
            </div>
          </div>
          {/* Jadual button */}
          <button style={{
            marginTop:14,width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'11px 16px',borderRadius:14,cursor:'pointer',
            background:'rgba(75,94,255,0.07)',border:'1.5px solid rgba(75,94,255,0.14)',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{fontSize:13,fontWeight:600,color:C.ink}}>Jadual hari ini</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </Card>
      </div>

      {/* ─── Tazkirah Slider ─── */}
      <div style={{padding:'0 16px 12px', position:'relative'}}>

        {/* Floating prev — outside card, left edge */}
        <button onClick={()=>setSlideIndex(i=>(i-1+slides.length)%slides.length)} style={{
          position:'absolute', left:-4, top:'50%', transform:'translateY(-50%)',
          width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer', zIndex:10,
          background:'rgba(255,255,255,0.95)',
          backdropFilter:'blur(12px)',
          boxShadow:'0 4px 16px rgba(75,94,255,0.22)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4B5EFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {/* Floating next — outside card, right edge */}
        <button onClick={()=>setSlideIndex(i=>(i+1)%slides.length)} style={{
          position:'absolute', right:-4, top:'50%', transform:'translateY(-50%)',
          width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer', zIndex:10,
          background:'rgba(255,255,255,0.95)',
          backdropFilter:'blur(12px)',
          boxShadow:'0 4px 16px rgba(75,94,255,0.22)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4B5EFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <div style={{
          borderRadius:22,overflow:'hidden',position:'relative',minHeight:220,
          background:'linear-gradient(135deg,rgba(10,18,80,0.94),rgba(58,40,200,0.88))',
          boxShadow:'0 12px 40px rgba(75,94,255,0.28)',
        }}>
          {/* BG image if available */}
          {cur.media_url && (
            <img src={cur.media_url} alt="" style={{
              position:'absolute',inset:0,width:'100%',height:'100%',
              objectFit:'cover',opacity:0.32,pointerEvents:'none',
            }}/>
          )}
          {/* Gradient overlay */}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(10,16,80,0.78) 55%,transparent)',pointerEvents:'none'}}/>

          <div style={{position:'relative',padding:'22px 22px 36px',zIndex:1}}>
            {/* Pill */}
            <div style={{
              display:'inline-flex',alignItems:'center',gap:6,
              padding:'5px 13px',borderRadius:20,marginBottom:14,
              background:'rgba(255,255,255,0.16)',
              border:'1px solid rgba(255,255,255,0.25)',
            }}>
              <span style={{fontSize:13}}>📖</span>
              <span style={{fontSize:11,fontWeight:700,color:'white',letterSpacing:'0.04em'}}>
                {cur.pill || 'Tazkirah Hari Ini'}
              </span>
            </div>

            {/* Title */}
            <h2 style={{fontSize:24,fontWeight:850,color:'white',lineHeight:1.18,margin:'0 0 10px',whiteSpace:'pre-line'}}>
              {(cur.title||'').split('\n').map((line,i)=>{
                const accent=(cur.accent||'').split('\n');
                return accent.includes(line)
                  ? <span key={i} style={{background:'linear-gradient(90deg,#8ee4ff,#c695ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',display:'block'}}>{line}</span>
                  : <span key={i} style={{display:'block'}}>{line}</span>;
              })}
            </h2>
            {cur.text && (
              <p style={{fontSize:13,color:'rgba(255,255,255,0.82)',lineHeight:1.55,margin:0,whiteSpace:'pre-line'}}>
                {cur.text}
              </p>
            )}
          </div>

          {/* Dots */}
          <div style={{position:'absolute',bottom:14,left:'50%',transform:'translateX(-50%)',display:'flex',gap:6,zIndex:2}}>
            {slides.map((_,i)=>(
              <div key={i} onClick={()=>setSlideIndex(i)} style={{
                width:i===slideIndex?22:8,height:8,borderRadius:4,cursor:'pointer',
                background:i===slideIndex?'white':'rgba(255,255,255,0.4)',
                transition:'width 0.3s',
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Hadith ─── */}
      <div style={{padding:'0 16px 12px'}}>
        <Card style={{padding:'16px 18px'}}>
          <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
            <div style={{flex:1,minWidth:0}}>
              {/* Header row */}
              <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:12}}>
                <div style={{
                  width:36,height:36,borderRadius:11,flexShrink:0,
                  background:'rgba(75,94,255,0.1)',border:'1.5px solid rgba(75,94,255,0.2)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <span style={{fontSize:15,fontWeight:750,color:C.ink}}>Hadis Hari Ini</span>
              </div>

              {/* Arabic */}
              {h.arabic_text || h.arabic ? (
                <p style={{
                  direction:'rtl',fontFamily:"'Amiri','Noto Naskh Arabic',Georgia,serif",
                  fontSize:19,color:C.blue,textAlign:'right',
                  margin:'0 0 10px',lineHeight:1.9,
                }}>
                  {h.arabic_text || h.arabic}
                </p>
              ) : null}

              {/* Translation */}
              <p style={{fontSize:13,color:C.sub,lineHeight:1.55,margin:'0 0 8px'}}>
                {h.malay_translation || h.malay || ''}
              </p>
              <p style={{fontSize:12,fontWeight:700,color:C.blue,margin:0}}>
                {h.source || ''}
              </p>
            </div>

            {/* Decorative image */}
            <div style={{width:86,flexShrink:0,borderRadius:14,overflow:'hidden',alignSelf:'center'}}>
              <img
                src="https://images.unsplash.com/photo-1585036156171-384164a8c675?w=200&q=80"
                alt=""
                style={{width:'100%',height:100,objectFit:'cover',display:'block'}}
                onError={e=>e.target.style.display='none'}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Waktu Solat ─── */}
      <div style={{padding:'0 16px 12px'}}>
        <Card style={{padding:'16px 14px'}}>
          {/* Section pill */}
          <div style={{marginBottom:14,paddingLeft:2}}>
            <Pill icon="🕐" color={C.blue} bg='rgba(75,94,255,0.1)'>
              WAKTU SOLAT HARI INI
            </Pill>
          </div>

          {/* 7-col grid — matches reference: icon top, label, big time, AM/PM */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
            {PRAYERS.map(p=>{
              const isNext = nextSolatName === p.label;
              return (
                <div key={p.key} style={{
                  display:'flex',flexDirection:'column',alignItems:'center',
                  padding:'10px 2px 10px',borderRadius:16,
                  background: isNext
                    ? `linear-gradient(160deg,${C.blue},${C.violet})`
                    : 'rgba(75,94,255,0.05)',
                  border: isNext ? 'none' : `1.5px solid rgba(75,94,255,0.08)`,
                  boxShadow: isNext ? '0 8px 22px rgba(75,94,255,0.32)' : 'none',
                }}>
                  {/* SVG icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke={isNext ? 'rgba(255,255,255,0.88)' : 'rgba(107,115,172,0.6)'}
                    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
                    style={{marginBottom:5}}>
                    <path d={p.svg}/>
                  </svg>
                  {/* Label */}
                  <div style={{
                    fontSize:8,fontWeight:750,letterSpacing:'0.03em',textTransform:'uppercase',
                    color: isNext ? 'rgba(255,255,255,0.78)' : C.muted,
                    marginBottom:5,textAlign:'center',lineHeight:1.2,
                  }}>{p.label}</div>
                  {/* Time */}
                  <div style={{
                    fontSize:14,fontWeight:850,lineHeight:1,
                    color: isNext ? 'white' : C.ink,
                    marginBottom:2,textAlign:'center',
                  }}>{fmt12(times?.[p.key])}</div>
                  {/* AM/PM */}
                  <div style={{
                    fontSize:9,fontWeight:650,
                    color: isNext ? 'rgba(255,255,255,0.7)' : C.muted,
                    textAlign:'center',
                  }}>{ampm(times?.[p.key])}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ─── Announcements Carousel ─── */}
      <AnnouncementCarousel />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   JADUAL TAB
   ═══════════════════════════════════════════════════════════════════ */
const SUB_TABS = [
  { id:'solat',    label:'Waktu Solat', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L8 8H4l3 3-1 4 6-3 6 3-1-4 3-3h-4z"/></svg> },
  { id:'jadual',   label:'Jadual',      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { id:'calendar', label:'Kalendar',    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="15" r="1" fill="currentColor"/></svg> },
  { id:'iqamah',   label:'Iqamah',      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
];

const DEFAULT_ACTIVITIES = [
  {id:1,time:'08:30 PM',end:'10:00 PM',title:'Kuliah Maghrib',speaker:'Ustaz Ahmad Farhan',venue:'Dewan Solat Utama',color:'#6B48FF',icon:'📖'},
  {id:2,time:'02:30 PM',end:'05:00 PM',title:'Kelas Fardu Ain',speaker:'Ustazah Nurul Huda',venue:'Bilik Kuliah 2',color:'#10b981',icon:'👥'},
  {id:3,time:'09:00 AM',end:'12:00 PM',title:'Program Gotong-Royong',speaker:'Kawasan Masjid',venue:'Kawasan Masjid',color:'#f59e0b',icon:'⭐'},
  {id:4,time:'07:30 PM',end:'09:00 PM',title:'Majlis Tilawah Al-Quran',speaker:'Qari Masjid',venue:'Dewan Solat Utama',color:'#0ea5e9',icon:'📿'},
];

function JadualTab({ times, nextSolatName }) {
  const [sub, setSub] = useState('calendar');
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selDay,    setSelDay]    = useState(today.getDate());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push({day:prevDays-firstDay+i+1,cur:false});
  for (let i=1;i<=daysInMonth;i++) cells.push({day:i,cur:true});
  while (cells.length%7) cells.push({day:cells.length-daysInMonth-firstDay+1,cur:false});

  const selHoliday = isHoliday(viewYear, viewMonth, selDay);

  return (
    <div style={{paddingBottom:110}}>
      {/* ── Sub tabs ── */}
      <div style={{padding:'18px 16px 0'}}>
        <div style={{
          display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4,
          background:'rgba(255,255,255,0.62)',border:'1.5px solid rgba(255,255,255,0.9)',
          borderRadius:18,padding:5,
          boxShadow:'0 4px 14px rgba(75,94,255,0.08)',
        }}>
          {SUB_TABS.map(t=>{
            const active = sub===t.id;
            return (
              <button key={t.id} onClick={()=>setSub(t.id)} style={{
                display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                padding:'9px 4px',borderRadius:14,border:'none',cursor:'pointer',
                background: active ? 'white' : 'transparent',
                color: active ? C.blue : C.muted,
                boxShadow: active ? '0 3px 10px rgba(75,94,255,0.14)' : 'none',
                transition:'all 0.18s',
              }}>
                <span style={{color:active?C.blue:C.muted}}>{t.icon}</span>
                <span style={{fontSize:10,fontWeight:active?750:450}}>{t.label}</span>
                {active && <div style={{width:16,height:2.5,borderRadius:2,background:`linear-gradient(90deg,${C.blue},${C.violet})`}}/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Calendar sub-tab ── */}
      {sub==='calendar' && (
        <div style={{padding:'14px 16px'}}>
          <Card>
            {/* Header */}
            <div style={{padding:'16px 18px 10px',borderBottom:`1px solid ${C.line}`}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <h3 style={{fontSize:17,fontWeight:800,color:C.ink,margin:'0 0 2px'}}>Kalendar Masjid</h3>
                  <p style={{fontSize:11.5,color:C.muted,margin:0}}>
                    {MALAY_MONTHS[viewMonth]} {viewYear} / {toHijri(new Date(viewYear,viewMonth,1)).monthName} {toHijri(new Date(viewYear,viewMonth,1)).year}H
                  </p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <button onClick={()=>{setViewYear(today.getFullYear());setViewMonth(today.getMonth());setSelDay(today.getDate());}} style={{
                    padding:'5px 10px',borderRadius:9,cursor:'pointer',
                    background:`rgba(75,94,255,0.08)`,border:`1.5px solid rgba(75,94,255,0.18)`,
                    color:C.blue,fontSize:11,fontWeight:700,
                  }}>Hari Ini</button>
                  {[
                    {arrow:'‹',fn:()=>{if(viewMonth===0){setViewYear(y=>y-1);setViewMonth(11);}else setViewMonth(m=>m-1);}},
                    {arrow:'›',fn:()=>{if(viewMonth===11){setViewYear(y=>y+1);setViewMonth(0);}else setViewMonth(m=>m+1);}},
                  ].map(({arrow,fn})=>(
                    <button key={arrow} onClick={fn} style={{
                      width:30,height:30,borderRadius:9,border:`1.5px solid rgba(75,94,255,0.15)`,
                      background:'rgba(255,255,255,0.8)',cursor:'pointer',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:16,color:C.sub,fontWeight:700,
                    }}>{arrow}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Day headers */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'10px 12px 4px'}}>
              {MALAY_DSHORT.map((d,i)=>(
                <div key={d} style={{
                  textAlign:'center',fontSize:11,fontWeight:700,padding:'3px 0',
                  color: i===5 ? C.blue : C.muted,
                }}>{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'0 10px 14px',gap:'3px 0'}}>
              {cells.map((cell,i)=>{
                const holiday = cell.cur ? isHoliday(viewYear, viewMonth, cell.day) : null;
                const isToday = cell.cur && cell.day===today.getDate() && viewMonth===today.getMonth() && viewYear===today.getFullYear();
                const isSel   = cell.cur && cell.day===selDay;
                const hCell   = cell.cur ? toHijri(new Date(viewYear,viewMonth,cell.day)) : null;
                const isFriday= new Date(viewYear,viewMonth,cell.cur?cell.day:1).getDay()===5;
                return (
                  <div key={i} onClick={()=>cell.cur&&setSelDay(cell.day)} style={{
                    textAlign:'center',padding:'5px 1px',borderRadius:12,
                    cursor:cell.cur?'pointer':'default',
                    background: isSel ? `linear-gradient(145deg,${C.blue},${C.violet})` : 'transparent',
                    opacity: cell.cur ? 1 : 0.28,
                    transition:'all 0.15s',
                  }}>
                    <div style={{
                      fontSize:14,fontWeight:isSel||isToday?800:400,lineHeight:1.2,
                      color: isSel?'white' : isToday?C.blue : isFriday&&cell.cur?C.blue : C.ink,
                    }}>{cell.day}</div>
                    {hCell && (
                      <div style={{fontSize:8,color:isSel?'rgba(255,255,255,0.7)':C.faint,lineHeight:1,marginTop:1}}>
                        {hCell.day} {hCell.monthName?.slice(0,3)}
                      </div>
                    )}
                    {/* Dots */}
                    <div style={{display:'flex',justifyContent:'center',gap:2,marginTop:2.5}}>
                      {holiday&&<div style={{width:4,height:4,borderRadius:'50%',background:isSel?'rgba(255,255,255,0.85)':'#f59e0b'}}/>}
                      {isToday&&!isSel&&<div style={{width:4,height:4,borderRadius:'50%',background:C.blue}}/>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{padding:'8px 16px 14px',borderTop:`1px solid ${C.line}`,display:'flex',gap:10,flexWrap:'wrap'}}>
              {[{c:'#6B48FF',l:'Kuliah / Tazkirah'},{c:'#10b981',l:'Program Khas'},{c:'#f59e0b',l:'Cuti Umum'},{c:'#0ea5e9',l:'Lain-lain'}].map(x=>(
                <div key={x.l} style={{display:'flex',alignItems:'center',gap:5}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:x.c}}/>
                  <span style={{fontSize:10,color:C.muted}}>{x.l}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Holiday banner */}
          {selHoliday && (
            <div style={{
              marginTop:10,padding:'11px 16px',borderRadius:14,
              background:'rgba(245,158,11,0.1)',border:'1.5px solid rgba(245,158,11,0.25)',
              display:'flex',gap:10,alignItems:'center',
            }}>
              <span style={{fontSize:18}}>🎉</span>
              <div>
                <div style={{fontSize:13,fontWeight:750,color:'#92400e'}}>{selHoliday.name}</div>
                <div style={{fontSize:11,color:'#b45309'}}>Cuti Umum Malaysia</div>
              </div>
            </div>
          )}

          {/* Activities */}
          <div style={{marginTop:14}}>
            <h4 style={{fontSize:14,fontWeight:800,color:C.ink,margin:'0 0 10px',padding:'0 2px',display:'flex',alignItems:'center',gap:8}}>
              Acara pada {selDay} {MALAY_MONTHS[viewMonth]}
              <span style={{fontSize:12,color:C.blue,fontWeight:600}}>({MALAY_DAYS[new Date(viewYear,viewMonth,selDay).getDay()]})</span>
            </h4>
            {DEFAULT_ACTIVITIES.map(act=>(
              <Card key={act.id} style={{padding:'14px 16px',marginBottom:9,cursor:'pointer'}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{
                    width:46,height:46,borderRadius:14,flexShrink:0,
                    background:`${act.color}18`,border:`1.5px solid ${act.color}28`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
                  }}>{act.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:C.blue,fontWeight:700,marginBottom:2}}>{act.time} – {act.end}</div>
                    <div style={{fontSize:14,fontWeight:800,color:C.ink,marginBottom:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{act.title}</div>
                    <div style={{fontSize:12,color:C.muted}}>{act.speaker}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{act.venue}</div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
            <button style={{
              width:'100%',padding:'13px',borderRadius:16,
              display:'flex',alignItems:'center',justifyContent:'center',gap:7,
              background:'rgba(75,94,255,0.07)',border:'1.5px solid rgba(75,94,255,0.16)',cursor:'pointer',
            }}>
              <span style={{fontSize:13,fontWeight:750,color:C.blue}}>Lihat Semua Acara</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Solat sub-tab ── */}
      {sub==='solat' && (
        <div style={{padding:'14px 16px'}}>
          <Card>
            <div style={{padding:'14px 16px'}}>
              <h3 style={{fontSize:15,fontWeight:800,color:C.ink,margin:'0 0 14px'}}>Waktu Solat Hari Ini</h3>
              {PRAYERS.map((p,i)=>{
                const isNext = nextSolatName===p.label;
                return (
                  <div key={p.key} style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'12px 0',
                    borderBottom: i<PRAYERS.length-1 ? `1px solid ${C.line}` : 'none',
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{
                        width:38,height:38,borderRadius:12,
                        background: isNext ? `linear-gradient(135deg,${C.blue},${C.violet})` : 'rgba(75,94,255,0.08)',
                        display:'flex',alignItems:'center',justifyContent:'center',
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                          stroke={isNext?'white':'rgba(107,115,172,0.7)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d={p.svg}/>
                        </svg>
                      </div>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:C.ink}}>{p.label}</div>
                        {isNext&&<div style={{fontSize:11,color:C.blue,fontWeight:600}}>Seterusnya</div>}
                      </div>
                    </div>
                    <div>
                      <span style={{fontSize:20,fontWeight:850,color:isNext?C.blue:C.ink}}>{fmt12(times?.[p.key])}</span>
                      <span style={{fontSize:11,color:C.muted,marginLeft:4}}>{ampm(times?.[p.key])}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── Placeholder sub-tabs ── */}
      {(sub==='jadual'||sub==='iqamah') && (
        <div style={{padding:'48px 16px 110px',textAlign:'center'}}>
          <div style={{
            width:72,height:72,borderRadius:22,margin:'0 auto 16px',
            background:'rgba(75,94,255,0.08)',border:`1.5px solid rgba(75,94,255,0.15)`,
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            <span style={{fontSize:32}}>{sub==='iqamah'?'⏱':'📋'}</span>
          </div>
          <p style={{fontSize:14,fontWeight:600,color:C.sub,marginBottom:6}}>
            {sub==='iqamah'?'Jadual Iqamah':'Jadual Program'}
          </p>
          <p style={{fontSize:12,color:C.muted}}>Akan dikemaskini melalui panel admin</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   KOMUNITI TAB
   ═══════════════════════════════════════════════════════════════════ */
function KomunitiTab() {
  return (
    <div style={{padding:'24px 16px 110px'}}>
      <h2 style={{fontSize:18,fontWeight:850,color:C.ink,margin:'0 0 16px'}}>Komuniti Masjid</h2>
      {[
        {icon:'📢',title:'Pengumuman Masjid',sub:'Berita & maklumat terkini',color:'#6B48FF'},
        {icon:'💰',title:'Tabung Masjid',sub:'Infaq, zakat & sedekah',color:'#10b981'},
        {icon:'📚',title:'Kelas Pengajian',sub:'Jadual & pendaftaran',color:'#f59e0b'},
        {icon:'🏗',title:'Projek Masjid',sub:'Pembinaan & pengubahsuaian',color:'#0ea5e9'},
      ].map(item=>(
        <Card key={item.title} style={{padding:'16px 18px',marginBottom:10,cursor:'pointer'}}>
          <div style={{display:'flex',alignItems:'center',gap:13}}>
            <div style={{width:46,height:46,borderRadius:14,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,background:`${item.color}15`,border:`1.5px solid ${item.color}25`}}>
              {item.icon}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:750,color:C.ink}}>{item.title}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{item.sub}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROFIL TAB
   ═══════════════════════════════════════════════════════════════════ */
function ProfilTab({ profile }) {
  return (
    <div style={{padding:'24px 16px 110px'}}>
      {/* Profile card */}
      <Card style={{padding:'24px 20px',marginBottom:16,textAlign:'center'}}>
        <div style={{
          width:76,height:76,borderRadius:22,margin:'0 auto 14px',
          background:`linear-gradient(145deg,${C.blue},${C.violet})`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:34,boxShadow:'0 10px 28px rgba(75,94,255,0.35)',
        }><svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 56V30M56 56V30"/>
              <path d="M2 30h60"/>
              <path d="M8 30c0-8 6-14 12-18l4-8 4 8c6 4 12 10 12 18"/>
              <path d="M32 4v6"/>
              <path d="M20 56V38h24v18"/>
              <path d="M27 56V46h10v10"/>
              <circle cx="32" cy="30" r="4"/>
            </svg></div>
        <h3 style={{fontSize:18,fontWeight:850,color:C.ink,margin:'0 0 4px'}}>{profile?.masjid_name||'MasjidTV'}</h3>
        <p style={{fontSize:12,color:C.muted,margin:0}}>{profile?.masjid_description||'Sistem InfoTV Islamik'}</p>
      </Card>
      {[
        {icon:'⚙️',label:'Tetapan',sub:'Konfigurasi masjid'},
        {icon:'🔔',label:'Notifikasi',sub:'Urus pemberitahuan'},
        {icon:'🌐',label:'Zon Solat',sub:profile?.zone_code||'WLY01'},
        {icon:'ℹ️',label:'Tentang MasjidTV',sub:'Versi 1.0 — Khalifah Territory'},
      ].map(item=>(
        <Card key={item.label} style={{padding:'14px 18px',marginBottom:9,cursor:'pointer'}}>
          <div style={{display:'flex',alignItems:'center',gap:13}}>
            <span style={{fontSize:22,flexShrink:0}}>{item.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:650,color:C.ink}}>{item.label}</div>
              <div style={{fontSize:11.5,color:C.muted,marginTop:2}}>{item.sub}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BOTTOM NAV
   ═══════════════════════════════════════════════════════════════════ */
function BottomNav({ active, onChange }) {
  const TABS = [
    { id:'home',     label:'Utama',    d:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
    { id:'jadual',   label:'Jadual',   d:'M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2 M8 2v4 M16 2v4 M3 10h18 M8 14h.01 M12 14h.01 M16 14h.01' },
    { id:'komuniti', label:'Komuniti', d:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
    { id:'profil',   label:'Profil',   d:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ];

  return (
    /* Outer safe-area wrapper */
    <div style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:100,
      padding:'0 12px 14px',
      paddingBottom:'calc(14px + env(safe-area-inset-bottom, 0px))',
      pointerEvents:'none',
    }}>
      {/* Floating pill container */}
      <div style={{
        display:'flex', alignItems:'center',
        background:'rgba(255,255,255,0.88)',
        backdropFilter:'blur(32px) saturate(1.8)',
        WebkitBackdropFilter:'blur(32px) saturate(1.8)',
        borderRadius:36,
        border:'1.5px solid rgba(255,255,255,0.95)',
        boxShadow:'0 8px 32px rgba(75,94,255,0.18), 0 2px 0 rgba(255,255,255,0.8) inset',
        padding:'6px 4px',
        height:64,
        pointerEvents:'all',
        position:'relative',
      }}>

        {/* Left 2 tabs */}
        {TABS.slice(0,2).map(tab => {
          const isActive = active === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              background: isActive ? `${C.blue}12` : 'transparent',
              border:'none', cursor:'pointer',
              padding:'7px 4px', borderRadius:24,
              margin:'0 2px',
              transition:'all 0.18s',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={isActive ? C.blue : C.muted} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                {tab.d.split(' M').map((seg,i) => (
                  <path key={i} d={(i?'M':'')+seg}/>
                ))}
              </svg>
              <span style={{
                fontSize:10, fontWeight:isActive ? 750 : 450,
                color: isActive ? C.blue : C.muted,
                lineHeight:1,
              }}>{tab.label}</span>
            </button>
          );
        })}

        {/* Centre FAB — raised above the pill */}
        <div style={{
          flex:'0 0 72px', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          marginTop:-28,
        }}>
          <div style={{
            width:56, height:56, borderRadius:'50%',
            background:`linear-gradient(145deg,${C.blue},${C.violet})`,
            border:'4px solid white',
            boxShadow:`0 8px 24px rgba(75,94,255,0.45)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:24, cursor:'pointer',
            transition:'transform 0.18s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
          ><svg width="28" height="28" viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 56V30M56 56V30"/>
              <path d="M2 30h60"/>
              <path d="M8 30c0-8 6-14 12-18l4-8 4 8c6 4 12 10 12 18"/>
              <path d="M32 4v6"/>
              <path d="M20 56V38h24v18"/>
              <path d="M27 56V46h10v10"/>
              <circle cx="32" cy="30" r="4"/>
            </svg></div>
        </div>

        {/* Right 2 tabs */}
        {TABS.slice(2).map(tab => {
          const isActive = active === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              background: isActive ? `${C.blue}12` : 'transparent',
              border:'none', cursor:'pointer',
              padding:'7px 4px', borderRadius:24,
              margin:'0 2px',
              transition:'all 0.18s',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={isActive ? C.blue : C.muted} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                {tab.d.split(' M').map((seg,i) => (
                  <path key={i} d={(i?'M':'')+seg}/>
                ))}
              </svg>
              <span style={{
                fontSize:10, fontWeight:isActive ? 750 : 450,
                color: isActive ? C.blue : C.muted,
                lineHeight:1,
              }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT
   ═══════════════════════════════════════════════════════════════════ */
export default function MobileInfoTV(props) {
  const [tab, setTab] = useState('home');

  return (
    <div style={{
      width:'100%', minHeight:'100vh',
      background:'#eceeff',
      overflowX:'hidden',
      fontFamily:"'Plus Jakarta Sans','SF Pro Display','Segoe UI',sans-serif",
      position:'relative', WebkitFontSmoothing:'antialiased',
    }}>
      {/* ── Animated gradient layer ── */}
      <style>{`
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes orbFloat1 {
          0%,100% { transform: translate(0px, 0px) scale(1); }
          33%     { transform: translate(18px,-22px) scale(1.06); }
          66%     { transform: translate(-12px, 14px) scale(0.96); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0px, 0px) scale(1); }
          40%     { transform: translate(-20px, 18px) scale(1.08); }
          70%     { transform: translate(14px,-10px) scale(0.94); }
        }
        @keyframes orbFloat3 {
          0%,100% { transform: translate(0px, 0px) scale(1); }
          30%     { transform: translate(10px, 20px) scale(1.05); }
          60%     { transform: translate(-16px,-8px) scale(0.97); }
        }
        @keyframes orbFloat4 {
          0%,100% { transform: translate(0px, 0px) scale(1); }
          45%     { transform: translate(-14px, 16px) scale(1.1); }
          75%     { transform: translate(18px,-12px) scale(0.93); }
        }
      `}</style>

      {/* Animated gradient mesh background — position:absolute not fixed to avoid mobile repaint glitch */}
      <div style={{
        position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
        background:'linear-gradient(135deg,#eef0ff,#e4e8ff,#ede4ff,#e8f0ff,#f0e8ff,#eceeff)',
        backgroundSize:'300% 300%',
        animation:'gradShift 14s ease infinite',
        minHeight:'100vh',
      }}/>

      {/* Floating ambient orbs — absolute, not fixed */}
      <div style={{
        position:'absolute', top:-100, right:-80, width:340, height:340,
        borderRadius:'50%', pointerEvents:'none', zIndex:0,
        background:'radial-gradient(circle,rgba(123,92,255,0.18) 0%,transparent 70%)',
        animation:'orbFloat1 9s ease-in-out infinite',
        willChange:'transform',
      }}/>
      <div style={{
        position:'absolute', top:'30%', left:-90, width:300, height:300,
        borderRadius:'50%', pointerEvents:'none', zIndex:0,
        background:'radial-gradient(circle,rgba(75,94,255,0.14) 0%,transparent 70%)',
        animation:'orbFloat2 11s ease-in-out infinite',
        willChange:'transform',
      }}/>
      <div style={{
        position:'absolute', bottom:160, right:-60, width:260, height:260,
        borderRadius:'50%', pointerEvents:'none', zIndex:0,
        background:'radial-gradient(circle,rgba(180,140,255,0.13) 0%,transparent 70%)',
        animation:'orbFloat3 13s ease-in-out infinite',
        willChange:'transform',
      }}/>
      <div style={{
        position:'absolute', bottom:-60, left:-40, width:240, height:240,
        borderRadius:'50%', pointerEvents:'none', zIndex:0,
        background:'radial-gradient(circle,rgba(100,160,255,0.12) 0%,transparent 70%)',
        animation:'orbFloat4 10s ease-in-out infinite',
        willChange:'transform',
      }}/>

      {/* Content — isolated stacking context prevents bg layer bleed-through */}
      <div style={{position:'relative', zIndex:1, isolation:'isolate'}}>
        {tab==='home'     && <HomeTab    {...props}/>}
        {tab==='jadual'   && <JadualTab  times={props.times} nextSolatName={props.nextSolatName}/>}
        {tab==='komuniti' && <KomunitiTab/>}
        {tab==='profil'   && <ProfilTab  profile={props.profile}/>}
      </div>

      <BottomNav active={tab} onChange={setTab}/>
    </div>
  );
}
