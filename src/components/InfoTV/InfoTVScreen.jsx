import { useState, useEffect, useRef } from 'react';
import useWaktuSolat from '../../hooks/useWaktuSolat';
import useCountdown from '../../hooks/useCountdown';
import useDateTime from '../../hooks/useDateTime';
import useStore from '../../store/useStore';
import { isDemoMode, getActiveBlastNotifications } from '../../lib/supabase';
import ViewportSwitcher from '../shared/ViewportSwitcher';
import DemoBanner from '../shared/DemoBanner';
import ZoneSelectorPanel from './ZoneSelectorPanel';
import MobileInfoTV from './MobileInfoTV';

/* ── Default content ─────────────────────────────────────────────── */
const DEFAULT_SLIDES = [
  { pill: 'Tazkirah Hari Ini', title: 'Jangan Lupa,\nAllah Sentiasa\nBersama Kita',
    accent: 'Allah Sentiasa\nBersama Kita',
    text: "Ingatlah, dengan mengingati Allah hati akan menjadi tenang.\n\n– Surah Ar-Ra'd (13:28)", media_url: '', media_type: 'text' },
  { pill: 'Tazkirah Hari Ini', title: 'Indahnya Masjid,\nApabila Ummah\nBersatu',
    accent: 'Apabila Ummah\nBersatu',
    text: 'Jadikan masjid sebagai pusat ilmu, ibadah dan kasih sayang.', media_url: '', media_type: 'text' },
];

const DEFAULT_HADITH = {
  arabic: 'مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ',
  malay: '"Sesiapa yang menunjukkan kepada kebaikan, maka baginya pahala seperti orang yang melakukannya."',
  source: '– Riwayat Muslim (2674)',
};

const DEFAULT_TICKER = [
  { id:'1', icon:'🔷', title:'MasjidTV',             text:'Sistem InfoTV Islamik — Khalifah Territory' },
  { id:'2', icon:'📚', title:'Kelas Pengajian Kitab', text:'Setiap Khamis, 8:30 Malam' },
  { id:'3', icon:'🏦', title:'Tabung Infaq Masjid',   text:'Maybank 5642 7654 3210' },
  { id:'4', icon:'🤲', title:'Jom Menyumbang,',       text:'Jom Beramal Jariah' },
];

const PRAYER_KEYS = [
  { key:'imsak',   name:'IMSAK',   svg:'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4v6l4 2' },
  { key:'subuh',   name:'SUBUH',   svg:'M12 3L9 9H3l5 4-2 7 6-4 6 4-2-7 5-4h-6z' },
  { key:'syuruk',  name:'SYURUK',  svg:'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z' },
  { key:'zohor',   name:'ZOHOR',   svg:'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z' },
  { key:'asar',    name:'ASAR',    svg:'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01' },
  { key:'maghrib', name:'MAGHRIB', svg:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' },
  { key:'isyak',   name:'ISYAK',   svg:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79zM14 16l2 2 4-4' },
];

function pad(n) { return String(Math.max(0,n)).padStart(2,'0'); }
function fmt12(t) {
  if (!t) return '--:--';
  const [h,m] = t.split(':').map(Number);
  return `${pad(h%12||12)}:${pad(m)}`;
}
function ampmOf(t) { if (!t) return ''; return t.split(':')[0]*1>=12?'PM':'AM'; }

/* ── Prayer SVG icon ─────────────────────────────────────────────── */
function PrayerIcon({ d, color='currentColor', size=22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════════════════════════════ */
export default function InfoTVScreen() {
  const {
    profile, currentZone, setZone,
    hadithItems, tickerMessages, sliderItems,
    viewportMode, setViewportMode,
  } = useStore();

  const [manualZone, setManualZone] = useState(() => {
    const pz = profile?.zone_code || 'WLY01';
    return currentZone && currentZone !== pz ? currentZone : null;
  });
  const zone = manualZone || currentZone || profile?.zone_code || 'WLY01';

  const { times, nextSolat, nextSolatName, prevSolat, loading: solatLoading, apiStatus } = useWaktuSolat(zone);
  const { hours, minutes, seconds, isImminent, progressPct } = useCountdown(nextSolat, nextSolatName, prevSolat);
  const { time, gregorianDate, hijriDate, dayName } = useDateTime();

  const [slideIndex, setSlideIndex] = useState(0);
  const [blasts, setBlasts] = useState([]);
  const slideTimer = useRef(null);

  const masjidName = profile?.masjid_name || 'MasjidTV';
  const masjidDesc = profile?.masjid_description || 'Sistem InfoTV Islamik — Khalifah Territory';
  const bgImage    = profile?.background_image_url || null;
  const masjidIcon = profile?.icon_url || null;
  const bgOverlay  = profile?.bg_overlay_opacity ?? 40;

  /* Slides */
  const slides = sliderItems?.length ? sliderItems.map(s => ({
    pill:       s.title || 'Tazkirah Hari Ini',
    title:      s.title || '',
    accent:     '',
    text:       s.description || s.text || '',
    media_url:  s.media_url  || '',
    media_type: s.media_type || 'image',
    youtube_id: s.youtube_id || '',
    duration:   s.duration   || 8,
  })) : DEFAULT_SLIDES;

  const hadith = hadithItems?.length ? {
    arabic: hadithItems[0].arabic_text || '',
    malay:  hadithItems[0].malay_translation || '',
    source: hadithItems[0].source || '',
  } : DEFAULT_HADITH;

  const ticker = tickerMessages?.length
    ? tickerMessages.map(m => ({ id: m.id, icon: '📢', title: '', text: m.message }))
    : DEFAULT_TICKER;

  /* Blasts */
  useEffect(() => {
    if (isDemoMode) return;
    getActiveBlastNotifications().then(({ data }) => { if (data?.length) setBlasts(data); });
  }, []);

  /* Auto-advance slides */
  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setSlideIndex(i => (i + 1) % slides.length);
    }, 9000);
    return () => clearInterval(slideTimer.current);
  }, [slides.length]);

  const prevSlide = () => { clearInterval(slideTimer.current); setSlideIndex(i => (i - 1 + slides.length) % slides.length); };
  const nextSlide = () => { clearInterval(slideTimer.current); setSlideIndex(i => (i + 1) % slides.length); };

  const cur = slides[slideIndex] || DEFAULT_SLIDES[0];
  const hasImage = !!(cur.media_url && cur.media_type === 'image');
  const timeHH = parseInt(time.substring(0, 2), 10);
  const ampm   = timeHH >= 12 ? 'PM' : 'AM';
  const isMobileView = viewportMode === 'mobile';
  const isTabletView = viewportMode === 'tablet';

  /* Scroll unlock for mobile */
  useEffect(() => {
    if (isMobileView) {
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height   = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.height   = 'auto';
    } else {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height   = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.height   = '100vh';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.height   = '';
      document.body.style.overflow = '';
      document.body.style.height   = '';
    };
  }, [isMobileView]);

  const mobileProps = {
    times, nextSolatName, nextSolat,
    hours, minutes, seconds, isImminent, progressPct,
    time, gregorianDate, hijriDate, dayName,
    hadith: hadithItems?.length
      ? hadithItems.map(h => ({ arabic_text:h.arabic_text, arabic:h.arabic_text, malay_translation:h.malay_translation, malay:h.malay_translation, source:h.source }))
      : [hadith],
    slides, slideIndex, setSlideIndex,
    profile, masjidIcon,
    viewportMode,
    onViewChange: mode => setViewportMode(mode),
  };

  if (isMobileView) {
    return (
      <div style={{ width:'100%', minHeight:'100vh', overflowX:'hidden' }}>
        <MobileInfoTV {...mobileProps} />
        <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     TV / DESKTOP — reference-matching layout
     ═══════════════════════════════════════════ */
  const TVLayout = (
    <div style={{
      width:'100%', height:'100%',
      background: bgImage
        ? `url(${bgImage}) center/cover no-repeat`
        : 'linear-gradient(160deg,#dce8ff 0%,#e8e4ff 35%,#cfd9ff 65%,#dce8ff 100%)',
      position:'relative', overflow:'hidden',
      fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif",
    }}>
      {/* Background overlay if bgImage */}
      {bgImage && <div style={{ position:'absolute', inset:0, background:`rgba(0,0,0,${bgOverlay/100})`, zIndex:0 }}/>}

      {/* CSS */}
      <style>{`
        @keyframes pulse { 0%,100%{box-shadow:0 12px 36px rgba(13,134,255,.38)} 50%{box-shadow:0 18px 52px rgba(139,72,255,.55)} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .tv-glass {
          background: rgba(255,255,255,0.62);
          border: 1.5px solid rgba(255,255,255,0.88);
          backdrop-filter: blur(28px) saturate(1.5);
          -webkit-backdrop-filter: blur(28px) saturate(1.5);
          border-radius: 22px;
          box-shadow: 0 4px 32px rgba(75,94,255,0.09), 0 1px 0 rgba(255,255,255,0.9) inset;
        }
      `}</style>

      {/* Zone selector */}
      <ZoneSelectorPanel currentZone={zone} onZoneChange={code => { setManualZone(code); setZone(code); }} />
      <DemoBanner />

      {/* ── MAIN GRID ── */}
      <div style={{
        position:'relative', zIndex:2,
        width:'100%', height:'100%',
        padding:'1.4vh 1.4vw 0',
        display:'grid',
        gridTemplateColumns:'minmax(0,1.38fr) minmax(0,.82fr)',
        gridTemplateRows:'auto minmax(0,1fr) auto auto',
        gap:'1vh .9vw',
        boxSizing:'border-box',
      }}>

        {/* ── ROW 1 LEFT: Header ── */}
        <div style={{ display:'flex', alignItems:'center', gap:'1.2vw', minWidth:0 }}>
          {/* Logo */}
          <div style={{
            width:'clamp(64px,5.5vw,100px)', height:'clamp(64px,5.5vw,100px)',
            borderRadius:22, flexShrink:0,
            background: masjidIcon ? 'transparent' : 'linear-gradient(145deg,#1678ff,#7360ff)',
            boxShadow: masjidIcon ? 'none' : '0 14px 38px rgba(32,98,230,.32)',
            display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
          }}>
            {masjidIcon
              ? <img src={masjidIcon} alt="Logo" style={{width:'100%',height:'100%',objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>
              : <svg width="54%" height="54%" viewBox="0 0 48 48" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 42V22M42 42V22M2 22h44M6 22c0-6 4-11 9-14l3-6 3 6c5 3 9 8 9 14M24 3v4M15 42V30h18v12M21 42v-8h6v8"/>
                </svg>
            }
          </div>
          {/* Name & desc */}
          <div style={{ minWidth:0 }}>
            <h1 style={{
              fontSize:'clamp(24px,2.8vw,58px)', fontWeight:860, letterSpacing:'-.04em',
              color: bgImage ? 'white' : '#0f1f4a', margin:'0 0 4px', lineHeight:.95,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{masjidName}</h1>
            <p style={{ fontSize:'clamp(12px,1.05vw,20px)', color: bgImage ? 'rgba(255,255,255,.85)' : '#2e477c', margin:'0 0 6px' }}>{masjidDesc}</p>
            <div style={{ width:48, height:4, borderRadius:10, background:'linear-gradient(90deg,#1678ff,#7360ff)', marginBottom:5 }}/>
            <p style={{ fontSize:'clamp(10px,.78vw,14px)', color: bgImage ? 'rgba(255,255,255,.7)' : '#7a82ac', margin:0 }}>
              {apiStatus==='online'   && '✓ Data waktu solat rasmi JAKIM dikemaskini'}
              {apiStatus==='cached'   && '◷ Menggunakan data cache hari ini'}
              {apiStatus==='fallback' && '⚠ Waktu anggaran — semak sambungan internet'}
            </p>
          </div>
        </div>

        {/* ── ROW 1 RIGHT: Clock ── */}
        <div className="tv-glass" style={{
          display:'grid',
          gridTemplateColumns:'auto 1fr 1px 1fr auto',
          gap:'.8vw', alignItems:'center',
          padding:'.9vw 1.2vw',
        }}>
          {/* Clock bubble */}
          <div style={{ width:'clamp(52px,4.6vw,84px)', height:'clamp(52px,4.6vw,84px)', borderRadius:18, background:'rgba(255,255,255,.55)', border:'1.5px solid rgba(255,255,255,.85)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="44%" height="44%" viewBox="0 0 24 24" fill="none" stroke="#4B5EFF" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          {/* Time */}
          <div>
            <div style={{ fontSize:'clamp(38px,4.2vw,78px)', fontWeight:850, letterSpacing:'-.06em', color:'#0f1f4a', lineHeight:1 }}>
              {time.substring(0,5)}
            </div>
            <div style={{ fontSize:'clamp(14px,1.3vw,24px)', color:'#4B5EFF', fontWeight:800 }}>{ampm}</div>
          </div>
          {/* Divider */}
          <div style={{ height:'clamp(60px,5vw,88px)', background:'rgba(75,94,255,.15)' }}/>
          {/* Dates */}
          <div style={{ fontSize:'clamp(12px,.95vw,17px)', lineHeight:1.45 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4B5EFF" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <strong style={{ display:'block', color:'#0f1f4a' }}>{gregorianDate.replace(/^[A-Za-z]+,\s*/,'')}</strong>
                <small style={{ color:'#7a82ac' }}>{dayName}</small>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4B5EFF" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <div>
                <strong style={{ display:'block', color:'#0f1f4a' }}>{hijriDate}</strong>
                <small style={{ color:'#7a82ac' }}>Tarikh Hijrah</small>
              </div>
            </div>
          </div>
          {/* Calendar icon */}
          <div style={{ width:'clamp(52px,4.6vw,84px)', height:'clamp(52px,4.6vw,84px)', borderRadius:18, background:'rgba(255,255,255,.55)', border:'1.5px solid rgba(255,255,255,.85)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="44%" height="44%" viewBox="0 0 24 24" fill="none" stroke="#4B5EFF" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
        </div>

        {/* ── ROW 2 LEFT: Main Slider ── */}
        <div className="tv-glass" style={{
          position:'relative', overflow:'hidden',
          display:'flex', flexDirection:'column', justifyContent:'flex-end',
          minHeight:0,
        }}>
          {/* Background: image OR gradient */}
          {hasImage ? (
            <img src={cur.media_url} alt={cur.title||'Slide'} style={{
              position:'absolute', inset:0, width:'100%', height:'100%',
              objectFit:'cover', display:'block',
            }} onError={e=>e.target.style.opacity='0'}/>
          ) : (
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(135deg,rgba(10,18,80,.94),rgba(55,35,190,.88))',
            }}/>
          )}

          {/* Dark gradient scrim over image for text readability */}
          <div style={{
            position:'absolute', inset:0,
            background: hasImage
              ? 'linear-gradient(to top, rgba(5,10,50,.88) 0%, rgba(5,10,50,.45) 45%, rgba(0,0,0,.12) 100%)'
              : 'none',
            pointerEvents:'none',
          }}/>

          {/* Left prev arrow */}
          <button onClick={prevSlide} style={{
            position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
            width:38, height:38, borderRadius:'50%', border:'none', cursor:'pointer', zIndex:5,
            background:'rgba(255,255,255,.18)', color:'white', fontSize:22, display:'flex', alignItems:'center', justifyContent:'center',
          }}>‹</button>
          {/* Right next arrow */}
          <button onClick={nextSlide} style={{
            position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
            width:38, height:38, borderRadius:'50%', border:'none', cursor:'pointer', zIndex:5,
            background:'rgba(255,255,255,.18)', color:'white', fontSize:22, display:'flex', alignItems:'center', justifyContent:'center',
          }}>›</button>

          {/* Content overlay */}
          <div style={{ position:'relative', zIndex:3, padding:'clamp(18px,2vw,36px)', paddingTop:0 }}>
            {/* Pill */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'7px 14px', borderRadius:12, marginBottom:'clamp(12px,1.4vh,22px)',
              background:'linear-gradient(90deg,#147dff,#514dff)',
              fontSize:'clamp(11px,.88vw,16px)', fontWeight:700, color:'white',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              {cur.pill || 'Tazkirah Hari Ini'}
            </div>

            {/* Title */}
            <h2 style={{
              margin:'0 0 clamp(10px,1.2vh,18px)',
              fontSize:'clamp(22px,2.8vw,52px)', fontWeight:860,
              lineHeight:1.08, letterSpacing:'-.035em', color:'white',
              whiteSpace:'pre-line',
            }}>
              {cur.title.split('\n').map((line,i)=>{
                const accents = cur.accent?.split('\n')||[];
                return accents.includes(line)
                  ? <span key={i} style={{ background:'linear-gradient(90deg,#7fdcff,#ba83ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', display:'block' }}>{line}</span>
                  : <span key={i} style={{ display:'block' }}>{line}</span>;
              })}
            </h2>

            {/* Body text — only if no image */}
            {!hasImage && cur.text && (
              <p style={{ maxWidth:560, fontSize:'clamp(13px,.95vw,18px)', lineHeight:1.5, color:'rgba(255,255,255,.85)', margin:0, whiteSpace:'pre-line' }}>
                {cur.text}
              </p>
            )}
          </div>

          {/* Dots */}
          <div style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, zIndex:4 }}>
            {slides.map((_,i)=>(
              <span key={i} onClick={()=>setSlideIndex(i)} style={{
                width:i===slideIndex?26:10, height:10, borderRadius:9999,
                background:i===slideIndex?'white':'rgba(255,255,255,.4)',
                cursor:'pointer', transition:'width .3s', display:'block',
              }}/>
            ))}
          </div>
        </div>

        {/* ── ROW 2 RIGHT: Countdown + Hadith ── */}
        <div style={{ display:'grid', gridTemplateRows:'1fr auto', gap:'1vh', minHeight:0 }}>

          {/* Countdown */}
          <div className="tv-glass" style={{ padding:'clamp(14px,1.4vw,26px)', display:'flex', flexDirection:'column', justifyContent:'center', overflow:'hidden' }}>
            <div style={{ fontSize:'clamp(11px,.8vw,15px)', fontWeight:700, color:'#7a82ac', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>
              COUNTDOWN KE
            </div>
            <div style={{ fontSize:'clamp(22px,2.2vw,40px)', fontWeight:860, color:isImminent?'#e05c00':'#5446e8', marginBottom:'clamp(8px,1vh,16px)', letterSpacing:'-.02em' }}>
              {nextSolatName||'--'}
            </div>

            {/* Big digits */}
            <div style={{ display:'flex', alignItems:'flex-end', gap:'clamp(4px,.5vw,10px)', marginBottom:'clamp(6px,.8vh,12px)' }}>
              {[{n:pad(hours),l:'JAM'},{n:pad(minutes),l:'MINIT'},{n:pad(seconds),l:'SAAT'}].map((it,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-end', gap:0 }}>
                  <div style={{ textAlign:'center', minWidth:'clamp(32px,3vw,58px)' }}>
                    <div style={{ fontSize:'clamp(38px,4.2vw,80px)', fontWeight:850, color:isImminent?'#e05c00':'#0f1f4a', lineHeight:1, letterSpacing:'-.02em', fontVariantNumeric:'tabular-nums' }}>{it.n}</div>
                    <div style={{ fontSize:'clamp(9px,.72vw,13px)', fontWeight:700, color:'#7a82ac', textTransform:'uppercase', letterSpacing:'.06em', marginTop:3 }}>{it.l}</div>
                  </div>
                  {i<2 && <div style={{ fontSize:'clamp(28px,3vw,58px)', fontWeight:300, color:'rgba(15,31,74,.25)', paddingBottom:'clamp(16px,2vh,28px)', lineHeight:1 }}>:</div>}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ height:5, borderRadius:10, background:'rgba(75,94,255,.12)', overflow:'hidden', marginBottom:'clamp(8px,.9vh,14px)' }}>
              <div style={{ height:'100%', width:`${progressPct}%`, background:'linear-gradient(90deg,#1678ff,#7360ff)', borderRadius:10, transition:'width 1s linear' }}/>
            </div>

            {/* Jadual link */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'clamp(6px,.7vh,11px) clamp(10px,.9vw,16px)',
              background:'rgba(75,94,255,.07)', border:'1px solid rgba(75,94,255,.13)', borderRadius:12,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4B5EFF" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span style={{ fontSize:'clamp(10px,.78vw,14px)', color:'#0f1f4a', fontWeight:500 }}>Jadual hari ini</span>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7a82ac" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* Hadith */}
          <div className="tv-glass" style={{ padding:'clamp(12px,1.2vw,22px)', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:'clamp(8px,.9vh,14px)' }}>
              <div style={{ width:32, height:32, borderRadius:10, background:'rgba(75,94,255,.1)', border:'1px solid rgba(75,94,255,.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5EFF" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3 style={{ margin:0, fontSize:'clamp(13px,1vw,18px)', color:'#0f1f4a', fontWeight:750 }}>Hadis Hari Ini</h3>
            </div>
            {hadith.arabic && (
              <p style={{ direction:'rtl', fontFamily:"'Amiri','Noto Naskh Arabic',Georgia,serif", fontSize:'clamp(16px,1.5vw,26px)', color:'#4B5EFF', textAlign:'right', margin:'0 0 8px', lineHeight:1.8 }}>
                {hadith.arabic}
              </p>
            )}
            <p style={{ fontSize:'clamp(11px,.82vw,14px)', lineHeight:1.45, color:'#1a2b5f', margin:0 }}>
              {hadith.malay}
              {hadith.source && <><br/><em style={{ color:'#7a82ac', fontSize:'.9em' }}>{hadith.source}</em></>}
            </p>
          </div>
        </div>

        {/* ── ROW 3: Prayer Times ── */}
        <div className="tv-glass" style={{
          gridColumn:'1/3',
          display:'grid',
          gridTemplateColumns:'auto repeat(7,minmax(0,1fr))',
          gap:'.5vw',
          padding:'.8vh .8vw',
          alignItems:'stretch',
        }}>
          {/* Label pill */}
          <div style={{ display:'flex', alignItems:'center', paddingRight:'.8vw', borderRight:'1.5px solid rgba(75,94,255,.12)' }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'6px 12px', borderRadius:20,
              background:'rgba(75,94,255,.1)', border:'1px solid rgba(75,94,255,.18)',
              whiteSpace:'nowrap',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4B5EFF" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize:'clamp(9px,.72vw,13px)', fontWeight:750, color:'#4B5EFF', letterSpacing:'.04em', textTransform:'uppercase' }}>WAKTU SOLAT</span>
            </div>
          </div>

          {/* Prayer cards */}
          {solatLoading && !times
            ? PRAYER_KEYS.map(p=>(
                <div key={p.key} style={{ textAlign:'center', padding:'8px' }}>
                  <div style={{ height:24, background:'rgba(75,94,255,.1)', borderRadius:6, marginBottom:6 }}/>
                  <div style={{ height:14, background:'rgba(75,94,255,.08)', borderRadius:4, width:'70%', margin:'0 auto 6px' }}/>
                  <div style={{ height:28, background:'rgba(75,94,255,.1)', borderRadius:6, width:'80%', margin:'0 auto' }}/>
                </div>
              ))
            : PRAYER_KEYS.map(p=>{
                const isNext = nextSolatName === p.name;
                return (
                  <div key={p.key} style={{
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    padding:'clamp(8px,.9vh,14px) .4vw',
                    borderRadius:16, textAlign:'center',
                    borderRight:'1px solid rgba(75,94,255,.1)',
                    background:     isNext ? 'linear-gradient(145deg,#0d86ff,#8b48ff)' : 'transparent',
                    boxShadow:      isNext ? '0 10px 32px rgba(13,134,255,.32)' : 'none',
                    animation:      isNext ? 'pulse 2.8s ease-in-out infinite' : 'none',
                    margin:         isNext ? '-0.8vh 0' : '0',
                    transition:     'all .3s',
                  }}>
                    <div style={{ marginBottom:5, color:isNext?'rgba(255,255,255,.9)':'rgba(75,94,255,.65)' }}>
                      <PrayerIcon d={p.svg} color={isNext?'rgba(255,255,255,.9)':'rgba(75,94,255,.65)'} size={22}/>
                    </div>
                    <div style={{ fontSize:'clamp(9px,.72vw,13px)', fontWeight:750, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:5, color:isNext?'rgba(255,255,255,.8)':'#7a82ac' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize:'clamp(16px,1.7vw,30px)', fontWeight:860, letterSpacing:'-.03em', color:isNext?'white':'#0f1f4a', lineHeight:1, marginBottom:2 }}>
                      {fmt12(times?.[p.key])}
                    </div>
                    <div style={{ fontSize:'clamp(8px,.65vw,11px)', fontWeight:600, color:isNext?'rgba(255,255,255,.72)':'#7a82ac' }}>
                      {ampmOf(times?.[p.key])}
                    </div>
                    {isNext && <div style={{ fontSize:'clamp(7px,.6vw,10px)', fontWeight:750, color:'rgba(255,255,255,.85)', marginTop:3, letterSpacing:'.06em' }}>SETERUSNYA</div>}
                  </div>
                );
              })
          }
        </div>

        {/* ── ROW 4: Ticker Footer ── */}
        <div style={{
          gridColumn:'1/3',
          margin:'0 -1.4vw',
          display:'grid',
          gridTemplateColumns:'repeat(4,1fr) minmax(200px,.5fr)',
          background:'rgba(240,245,255,.72)',
          borderTop:'1px solid rgba(255,255,255,.6)',
          backdropFilter:'blur(24px)',
          WebkitBackdropFilter:'blur(24px)',
        }}>
          {ticker.slice(0,4).map((t,i)=>(
            <div key={t.id} style={{
              padding:'.7vh 1.1vw', borderRight:'1px solid rgba(75,94,255,.1)',
              display:'flex', alignItems:'center', gap:'.7vw',
              fontSize:'clamp(11px,.82vw,15px)', minWidth:0,
            }}>
              <span style={{ fontSize:'clamp(18px,1.5vw,26px)', flexShrink:0 }}>{t.icon}</span>
              <span style={{ minWidth:0 }}>
                {t.title && <strong style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#0f1f4a' }}>{t.title}</strong>}
                <span style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#7a82ac', fontSize:'.88em' }}>{t.text}</span>
              </span>
            </div>
          ))}
          {/* Quote tile */}
          <div style={{
            padding:'.7vh 1.2vw',
            display:'flex', alignItems:'center', gap:10,
            background:'linear-gradient(135deg,#6947ff,#147cff)',
            color:'white',
          }}>
            <span style={{ fontSize:20, opacity:.85 }}>"</span>
            <div>
              <div style={{ fontSize:'clamp(11px,.82vw,15px)', fontWeight:700, fontStyle:'italic' }}>Ingat Mati, Ingat Allah</div>
              <div style={{ fontSize:'clamp(9px,.68vw,12px)', opacity:.8 }}>Kunci Kebahagiaan Dunia & Akhirat</div>
            </div>
            <div style={{ marginLeft:'auto', width:32, height:32, borderRadius:10, background:'rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
          </div>
        </div>

      </div>{/* end grid */}

      <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />

      {/* Blast toast */}
      {blasts.length > 0 && (
        <div style={{ position:'fixed', top:60, left:'50%', transform:'translateX(-50%)', zIndex:9999, background:'rgba(255,255,255,.94)', backdropFilter:'blur(20px)', border:'1px solid rgba(75,94,255,.25)', borderRadius:16, padding:'16px 24px', maxWidth:480, boxShadow:'0 8px 32px rgba(75,94,255,.18)' }}>
          <button onClick={()=>setBlasts([])} style={{ position:'absolute', top:10, right:12, background:'none', border:'none', cursor:'pointer', fontSize:16 }}>✕</button>
          <strong style={{ color:'#4B5EFF', display:'block', marginBottom:4 }}>{blasts[0].title}</strong>
          <p style={{ margin:0, fontSize:'.875rem', color:'#0f1f4a' }}>{blasts[0].message}</p>
        </div>
      )}
    </div>
  );

  if (isTabletView) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f1422', overflow:'auto', padding:20 }}>
        <div style={{ width:1024, height:768, overflow:'hidden', borderRadius:16, boxShadow:'0 0 0 6px #222840, 0 40px 80px rgba(0,0,0,.6)', position:'relative', flexShrink:0 }}>
          {TVLayout}
        </div>
        <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />
      </div>
    );
  }

  return (
    <div style={{ width:'100%', height:'100vh', overflow:'hidden' }}>
      {TVLayout}
    </div>
  );
}
