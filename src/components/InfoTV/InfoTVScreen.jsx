import { useState, useEffect, useRef } from 'react';
import useWaktuSolat from '../../hooks/useWaktuSolat';
import useCountdown from '../../hooks/useCountdown';
import useDateTime from '../../hooks/useDateTime';
import useStore from '../../store/useStore';
import {
  isDemoMode,
  getActiveBlastNotifications,
} from '../../lib/supabase';
import ViewportSwitcher from '../shared/ViewportSwitcher';
import DemoBanner from '../shared/DemoBanner';
import ZoneSelectorPanel from './ZoneSelectorPanel';
import MobileInfoTV from './MobileInfoTV';

// ── Default content ───────────────────────────────────────────────────────────
const DEFAULT_SLIDES = [
  {
    pill: '▣ Tazkirah Hari Ini',
    title: 'Jangan Lupa,\nAllah Sentiasa\nBersama Kita',
    accent: 'Allah Sentiasa\nBersama Kita',
    text: "Ingatlah, dengan mengingati Allah hati akan menjadi tenang.\n\n– Surah Ar-Ra'd (13:28)",
  },
  {
    pill: '▣ Tazkirah Hari Ini',
    title: 'Indahnya Masjid,\nApabila Ummah\nBersatu',
    accent: 'Apabila Ummah\nBersatu',
    text: 'Jadikan masjid sebagai pusat ilmu, ibadah dan kasih sayang.',
  },
  {
    pill: '▣ Tazkirah Hari Ini',
    title: 'Sedekah Tidak\nMengurangkan\nHarta',
    accent: 'Mengurangkan\nHarta',
    text: 'Setiap kebaikan yang diberi akan kembali sebagai keberkatan.',
  },
  {
    pill: '▣ Tazkirah Hari Ini',
    title: 'Mulakan Hari\nDengan Solat\nBerjemaah',
    accent: 'Dengan Solat\nBerjemaah',
    text: 'Solat pada waktunya membina disiplin dan ketenangan jiwa.',
  },
];

const DEFAULT_HADITH = {
  arabic: 'مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ',
  malay: '"Sesiapa yang menunjukkan kepada kebaikan, maka baginya pahala seperti orang yang melakukannya."',
  source: '– Riwayat Muslim (2674)',
};

const DEFAULT_TICKER = [
  { id: '1', icon: '🔷', title: 'MasjidTV', text: 'Sistem InfoTV Islamik — Khalifah Territory' },
  { id: '2', icon: '▣',  title: 'Kelas Pengajian Kitab', text: 'Setiap Khamis, 8:30 Malam' },
  { id: '3', icon: '🤲', title: 'Tabung Infaq Masjid', text: 'Sumbangan anda sangat dihargai' },
  { id: '4', icon: '💙', title: 'Jom Menyumbang,', text: 'Jom Beramal Jariah' },
];

const PRAYER_KEYS = [
  { key: 'imsak',   name: 'Imsak',   ico: '☼' },
  { key: 'subuh',   name: 'Subuh',   ico: '◒' },
  { key: 'syuruk',  name: 'Syuruk',  ico: '☀' },
  { key: 'zohor',   name: 'Zohor',   ico: '☼' },
  { key: 'asar',    name: 'Asar',    ico: '♧' },
  { key: 'maghrib', name: 'Maghrib', ico: '◉' },
  { key: 'isyak',   name: 'Isyak',   ico: '☾' },
];

function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

function fmt12(t) {
  if (!t) return '--:--';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${pad(h % 12 || 12)}:${pad(m)} ${ap}`;
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function InfoTVScreen() {
  const {
    profile, currentZone, setZone,
    hadithItems, tickerMessages, sliderItems,
    viewportMode, setViewportMode,
  } = useStore();

  // manualZone: tracks user's manual zone pick; persisted via setZone in store.
  // If currentZone in store differs from profile.zone_code, the user had previously picked a different zone.
  const [manualZone, setManualZone] = useState(() => {
    const profileZone = profile?.zone_code || 'WLY01';
    return currentZone && currentZone !== profileZone ? currentZone : null;
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
  const bgImage     = profile?.background_image_url || null;
  const masjidIcon  = profile?.icon_url || null;
  const bgOverlay   = profile?.bg_overlay_opacity ?? 40;

  // Derive slides: use real slider items if available, else defaults
  const slides = sliderItems?.length ? sliderItems.map(s => ({
    pill: '▣ ' + (s.title || 'Tazkirah'),
    title: s.title || '',
    accent: '',
    text: s.description || '',
  })) : DEFAULT_SLIDES;

  // Derive hadith
  const hadith = hadithItems?.length ? {
    arabic: hadithItems[0].arabic_text || '',
    malay: hadithItems[0].malay_translation || '',
    source: hadithItems[0].source || '',
  } : DEFAULT_HADITH;

  // Derive ticker
  const ticker = tickerMessages?.length
    ? tickerMessages.map(m => ({ id: m.id, icon: '📢', title: '', text: m.message }))
    : DEFAULT_TICKER;

  // Load blast notifications
  useEffect(() => {
    if (isDemoMode) return;
    getActiveBlastNotifications().then(({ data }) => { if (data?.length) setBlasts(data); });
  }, []);

  // Auto-advance slides every 9 s
  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setSlideIndex(i => (i + 1) % slides.length);
    }, 9000);
    return () => clearInterval(slideTimer.current);
  }, [slides.length]);

  const prevSlide = () => {
    clearInterval(slideTimer.current);
    setSlideIndex(i => (i - 1 + slides.length) % slides.length);
  };
  const nextSlide = () => {
    clearInterval(slideTimer.current);
    setSlideIndex(i => (i + 1) % slides.length);
  };


  const currentSlide = slides[slideIndex] || DEFAULT_SLIDES[0];
  const timeHH = parseInt(time.substring(0, 2), 10);
  const ampm = timeHH >= 12 ? 'PM' : 'AM';

  const isMobileView = viewportMode === 'mobile';
  const isTabletView = viewportMode === 'tablet';

  /* ── Scroll unlock for mobile ── */
  useEffect(() => {
    if (isMobileView) {
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height   = 'auto';
      document.body.style.overflow  = 'auto';
      document.body.style.height    = 'auto';
    } else {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height   = '100%';
      document.body.style.overflow  = 'hidden';
      document.body.style.height    = '100vh';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.height   = '';
      document.body.style.overflow  = '';
      document.body.style.height    = '';
    };
  }, [isMobileView]);

  /* ── Shared props for mobile layout ── */
  const mobileProps = {
    times, nextSolatName, nextSolat,
    hours, minutes, seconds, isImminent, progressPct,
    time, gregorianDate, hijriDate, dayName,
    hadith: hadithItems?.length
      ? hadithItems.map(h => ({ arabic_text: h.arabic_text, arabic: h.arabic_text, malay_translation: h.malay_translation, malay: h.malay_translation, source: h.source }))
      : [hadith],
    slides, slideIndex, setSlideIndex,
    profile, masjidIcon,
  };

  /* ── Mobile: full-page app layout ── */
  if (isMobileView) {
    return (
      <div style={{ width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
        <MobileInfoTV {...mobileProps} />
        <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />
      </div>
    );
  }

  /* ── Tablet: TV layout in constrained frame ── */
  if (isTabletView) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f1422', overflow:'auto', padding:20 }}>
        <div style={{ width:'1024px', height:'768px', overflow:'hidden', borderRadius:16, boxShadow:'0 0 0 6px #222840, 0 40px 80px rgba(0,0,0,0.6)', position:'relative', flexShrink:0 }}>
          {/* TV content renders below */}
        </div>
        <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />
      </div>
    );
  }

  /* ── TV / fullscreen ── */
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <DemoBanner />

      {/* ── Background: custom image OR default orbs ── */}
      {bgImage ? (
        <>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }} />
          {/* Dark overlay for readability */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1,
            background: `rgba(0,0,0,${bgOverlay / 100})`,
          }} />
        </>
      ) : (
        <>
          <div className="orb" style={{ width:'34vw', height:'34vw', background:'#4aa3ff', right:'-8vw', top:'-8vh' }} />
          <div className="orb" style={{ width:'25vw', height:'25vw', background:'#ffcfb1', left:0, top:'6vh' }} />
          <div className="orb" style={{ width:'20vw', height:'20vw', background:'#8c5bff', right:'18vw', bottom:0 }} />
        </>
      )}

      {/* Main grid */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100vh',
        padding: '1.2vh 1.2vw',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.36fr) minmax(360px,.84fr)',
        gridTemplateRows: 'minmax(120px,18vh) minmax(0,1fr) minmax(105px,15vh) minmax(58px,8vh)',
        gap: '.9vh .8vw',
        isolation: 'isolate',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}>

        {/* Zone selector — fixed top right */}
        <ZoneSelectorPanel
          currentZone={zone}
          onZoneChange={(code) => {
            setManualZone(code);
            setZone(code);
          }}
        />

        {/* ── HEADER: Masjid branding ── */}
        <header style={{
          gridColumn: '1/2',
          display: 'grid',
          gridTemplateColumns: 'clamp(80px,6vw,120px) 1fr',
          gap: '1.4vw',
          alignItems: 'center',
        }}>
          <div style={{
            marginTop: -30,
            width: 'clamp(72px,6vw,112px)',
            height: 'clamp(72px,6vw,112px)',
            borderRadius: 26,
            display: 'grid',
            placeItems: 'center',
            background: masjidIcon ? 'transparent' : 'linear-gradient(145deg,#1678ff,#7360ff)',
            boxShadow: masjidIcon ? 'none' : '0 18px 45px rgba(32,98,230,.35)',
            overflow: 'hidden',
          }}>
            {masjidIcon
              ? <img src={masjidIcon} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; }} />
              : <span style={{ color: '#fff', fontSize: 'clamp(36px,3.1vw,56px)' }}>🕌</span>
            }
          </div>

          <div>
            <h1 style={{
              fontSize: 'clamp(28px,2.6vw,72px)',
              lineHeight: .9, margin: '0 0 8px',
              fontWeight: 850, letterSpacing: '-.05em',
              color: 'var(--ink)',
            }}>{masjidName}</h1>
            <p style={{ fontSize: 'clamp(13px,1.1vw,22px)', margin: 0, color: '#061846' }}>{masjidDesc}</p>
            <div style={{
              width: 52, height: 4,
              background: 'linear-gradient(90deg,var(--blue),var(--violet))',
              borderRadius: 10, margin: '10px 0',
            }} />
            <p style={{ fontSize: 'clamp(11px,.85vw,16px)', color: 'var(--muted)', margin: 0 }}>
              {apiStatus === 'online'   && '✓ Data waktu solat rasmi JAKIM dikemaskini'}
              {apiStatus === 'cached'   && '◷ Menggunakan data cache hari ini'}
              {apiStatus === 'fallback' && '⚠ Waktu anggaran — semak sambungan internet'}
            </p>
          </div>
        </header>

        {/* ── TOP CLOCK ── */}
        <section className="glass" style={{
          gridColumn: '2/3',
          borderRadius: 26,
          padding: '1.2vw 1.5vw',
          display: 'grid',
          gridTemplateColumns: 'clamp(64px,5vw,98px) 1fr 1px 1fr clamp(54px,4vw,78px)',
          gap: '1vw',
          alignItems: 'center',
        }}>
          {/* Clock icon */}
          <div style={{
            height: 'clamp(58px,5vw,88px)', borderRadius: 20,
            display: 'grid', placeItems: 'center',
            background: 'rgba(255,255,255,.25)',
            border: '1px solid rgba(255,255,255,.36)',
            fontSize: 'clamp(28px,2.5vw,44px)',
          }}>◷</div>

          {/* Time */}
          <div>
            <div style={{
              fontSize: 'clamp(42px,4.6vw,86px)',
              fontWeight: 760, letterSpacing: '-.06em',
              color: 'var(--ink)', lineHeight: 1,
            }}>
              {time.substring(0, 5)}
            </div>
            <div style={{ fontSize: 22, color: '#3550c9', fontWeight: 700 }}>{ampm}</div>
          </div>

          {/* Vertical divider */}
          <div style={{ height: 88, background: 'rgba(60,90,155,.22)' }} />

          {/* Dates */}
          <div style={{ fontSize: 'clamp(13px,1.05vw,20px)', lineHeight: 1.35 }}>
            <strong style={{ display: 'block' }}>{gregorianDate.split(',')[1]?.trim() || gregorianDate}</strong>
            <small style={{ display: 'block', color: '#2e477c' }}>{dayName}</small>
            <strong style={{ display: 'block', marginTop: 4 }}>{hijriDate}</strong>
            <small style={{ display: 'block', color: '#2e477c' }}>Tarikh Hijrah</small>
          </div>

          {/* Calendar icon */}
          <div style={{
            height: 'clamp(58px,5vw,88px)', borderRadius: 20,
            display: 'grid', placeItems: 'center',
            background: 'rgba(255,255,255,.25)',
            border: '1px solid rgba(255,255,255,.36)',
            fontSize: 'clamp(28px,2.5vw,44px)',
          }}>▣</div>
        </section>

        {/* ── MAIN SLIDER ── */}
        <main style={{ display: 'grid', gridTemplateColumns: '1fr', alignItems: 'center' }}>
          <section className="glass" style={{
            width: '100%', height: '100%',
            borderRadius: 28,
            padding: 'clamp(22px,2.4vw,44px)',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            background: 'linear-gradient(90deg,rgba(5,22,64,.88),rgba(13,35,86,.48))',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            {/* Radial highlight */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 72% 18%,rgba(255,255,255,.22),transparent 34%)',
              pointerEvents: 'none',
            }} />

            {/* Prev/Next */}
            <button onClick={prevSlide} style={{ display: 'none' }}>‹</button>
            <button onClick={nextSlide} style={{ display: 'none' }}>›</button>

            {/* Pill */}
            <div style={{
              position: 'relative',
              display: 'inline-flex', gap: 10, alignItems: 'center',
              width: 'max-content', padding: '10px 16px', borderRadius: 12,
              background: 'linear-gradient(90deg,#147dff,#514dff)',
              fontSize: 'clamp(14px,1vw,19px)', fontWeight: 700,
            }}>
              {currentSlide.pill || '▣ Tazkirah Hari Ini'}
            </div>

            {/* Title */}
            <h2 style={{
              position: 'relative',
              margin: 'clamp(16px,2vh,30px) 0 clamp(12px,1.5vh,22px)',
              fontSize: 'clamp(30px,3vw,58px)',
              lineHeight: 1.08, letterSpacing: '-.035em',
            }}>
              {currentSlide.title.split('\n').map((line, i) => {
                const accentLines = currentSlide.accent?.split('\n') || [];
                const isAccent = accentLines.includes(line);
                return (
                  <span key={i} style={isAccent ? {
                    background: 'linear-gradient(90deg,#7fdcff,#ba83ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'block',
                  } : { display: 'block' }}>{line}</span>
                );
              })}
            </h2>

            {/* Body text */}
            {currentSlide.text && (
              <p style={{
                position: 'relative',
                maxWidth: 560, fontSize: 'clamp(15px,1vw,20px)', lineHeight: 1.45,
                whiteSpace: 'pre-line',
              }}>
                {currentSlide.text}
              </p>
            )}

            {/* Dots */}
            <div style={{
              position: 'absolute', bottom: 34, left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', gap: 12,
            }}>
              {slides.map((_, i) => (
                <span key={i} onClick={() => setSlideIndex(i)} style={{
                  width: i === slideIndex ? 28 : 14,
                  height: 14, borderRadius: 9999,
                  background: i === slideIndex ? '#fff' : 'rgba(255,255,255,.45)',
                  cursor: 'pointer', transition: 'width 0.3s',
                  display: 'block',
                }} />
              ))}
            </div>
          </section>
        </main>

        {/* ── ASIDE: Countdown + Hadith ── */}
        <aside style={{
          display: 'grid',
          gridTemplateRows: 'minmax(0,1fr) minmax(145px,34%)',
          gap: '.8vh', height: '100%', minHeight: 0,
        }}>
          {/* Countdown */}
          <section className="glass" style={{
            borderRadius: 28,
            padding: 'clamp(18px,1.5vw,30px)',
            display: 'grid',
            gridTemplateRows: 'auto auto minmax(0,1fr) auto',
            alignContent: 'center',
            textAlign: 'center',
            maxHeight: 250,
          }}>
            <div style={{
              fontSize: 'clamp(13px,.9vw,17px)',
              color: '#344978', textTransform: 'uppercase', letterSpacing: '.03em',
            }}>Countdown ke</div>

            <div style={{
              fontSize: 'clamp(28px,2.4vw,42px)',
              color: isImminent ? '#e05c00' : '#5446e8',
              fontWeight: 850, margin: '0 0 .5vh',
            }}>
              {nextSolatName || '--'}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
              gap: '.6vw', alignItems: 'center',
              fontSize: 'clamp(46px,5vw,92px)',
              fontWeight: 800, letterSpacing: '.01em', lineHeight: .92,
              color: isImminent ? '#e05c00' : 'var(--ink)',
            }}>
              <div>{pad(hours)}<small style={{ display:'block', fontSize:'clamp(11px,.8vw,15px)', fontWeight:700, textTransform:'uppercase', textAlign:'center', marginTop:'.6vh' }}>Jam</small></div>
              <div>{pad(minutes)}<small style={{ display:'block', fontSize:'clamp(11px,.8vw,15px)', fontWeight:700, textTransform:'uppercase', textAlign:'center', marginTop:'.6vh' }}>Minit</small></div>
              <div>{pad(seconds)}<small style={{ display:'block', fontSize:'clamp(11px,.8vw,15px)', fontWeight:700, textTransform:'uppercase', textAlign:'center', marginTop:'.6vh' }}>Saat</small></div>
            </div>

            {/* Progress bar */}
            <div style={{
              height: 6, borderRadius: 20,
              background: 'rgba(55,80,150,.2)', marginTop: '.8vh', overflow: 'hidden',
            }}>
              <span style={{
                display: 'block', height: '100%',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg,#0b72ff,#7b47ff)',
                transition: 'width 1s linear',
              }} />
            </div>
          </section>

          {/* Hadith */}
          <section className="glass" style={{
            borderRadius: 24,
            padding: 'clamp(16px,1.4vw,26px)',
            background: 'rgba(255,255,255,.42)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, color: 'var(--ink)' }}>Hadis Hari Ini</h3>
            {hadith.arabic && (
              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(18px,1.6vw,28px)',
                textAlign: 'right', margin: '0 0 8px', color: 'var(--ink)',
              }}>{hadith.arabic}</p>
            )}
            <p style={{ fontSize: 'clamp(12px,.85vw,15px)', lineHeight: 1.35, margin: 0, color: '#1a2b5f' }}>
              {hadith.malay}
              {hadith.source && (
                <><br /><em style={{ color: 'var(--muted)', fontSize: '0.85em' }}>{hadith.source}</em></>
              )}
            </p>
          </section>
        </aside>

        {/* ── PRAYER ROW ── */}
        <section className="glass" style={{
          gridColumn: '1/3',
          borderRadius: 28,
          padding: '1.2vh 1vw',
          display: 'grid',
          gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
          gap: '.5vw',
          alignItems: 'stretch',
        }}>
          {solatLoading && !times
            ? PRAYER_KEYS.map(p => (
                <div key={p.key} style={{ textAlign:'center', padding:'8px', display:'flex', flexDirection:'column', gap:6 }}>
                  <div className="skeleton" style={{ height:30, width:30, margin:'0 auto', borderRadius:'50%' }} />
                  <div className="skeleton" style={{ height:14, width:'60%', margin:'0 auto' }} />
                  <div className="skeleton" style={{ height:28, width:'80%', margin:'0 auto' }} />
                </div>
              ))
            : PRAYER_KEYS.map(p => {
                const isNext = nextSolatName === p.name;
                return (
                  <article key={p.key} style={{
                    position: 'relative', textAlign: 'center',
                    padding: 'clamp(8px,1vh,14px) .5vw',
                    borderRight: '1px solid rgba(54,78,135,.18)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    ...(isNext ? {
                      margin: '-1.2vh 0',
                      border: '2px solid rgba(255,255,255,.72)',
                      borderRadius: 24,
                      background: 'linear-gradient(135deg,#0d86ff,#8b48ff)',
                      color: '#fff',
                      boxShadow: '0 18px 42px rgba(75,77,255,.32)',
                      animation: 'pulse 2.8s infinite',
                    } : {}),
                  }}>
                    <div style={{ fontSize: 'clamp(20px,1.6vw,30px)' }}>{p.ico}</div>
                    <b style={{ display:'block', margin:'4px 0 2px', fontSize:'clamp(11px,.85vw,16px)', textTransform:'uppercase' }}>{p.name}</b>
                    <time style={{ fontSize:'clamp(18px,1.8vw,32px)', fontWeight:780, letterSpacing:'-.03em' }}>
                      {fmt12(times?.[p.key])}
                    </time>
                    {isNext && (
                      <div style={{ fontSize: '0.65rem', marginTop: 4, opacity: 0.9, fontWeight: 700 }}>SETERUSNYA</div>
                    )}
                  </article>
                );
              })
          }
        </section>

        {/* ── TICKER FOOTER ── */}
        <footer style={{
          gridColumn: '1/3',
          margin: '0 -1.2vw -1.2vh',
          display: 'grid',
          gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
          background: 'rgba(242,247,255,.55)',
          borderTop: '1px solid rgba(255,255,255,.5)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
        }}>
          {ticker.slice(0, 4).map(t => (
            <div key={t.id} style={{
              padding: '.8vh 1.2vw',
              borderRight: '1px solid rgba(68,88,135,.15)',
              display: 'flex', alignItems: 'center', gap: '.8vw',
              fontSize: 'clamp(12px,.86vw,17px)', minWidth: 0,
            }}>
              <span style={{ flexShrink: 0 }}>{t.icon}</span>
              <span style={{ minWidth: 0 }}>
                {t.title && (
                  <strong style={{ display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {t.title}
                  </strong>
                )}
                <span style={{ display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'var(--muted)', fontSize:'0.9em' }}>
                  {t.text}
                </span>
              </span>
            </div>
          ))}
          {/* Quote tile */}
          <div style={{
            padding: '.8vh 1.2vw',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#6947ff,#147cff)',
            color: '#fff', fontStyle: 'italic', fontWeight: 700,
            fontSize: 'clamp(12px,.86vw,17px)',
            borderRadius: '22px 0 0 0',
          }}>
            "Ingat Mati, Ingat Allah"
          </div>
        </footer>

      </div>{/* end grid */}

      {/* Viewport switcher */}
      <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />

      {/* Blast toast */}
      {blasts.length > 0 && (
        <div style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'rgba(255,255,255,.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(17,116,255,.3)',
          borderRadius: 16, padding: '16px 24px', maxWidth: 480,
          boxShadow: '0 8px 32px rgba(17,116,255,.2)',
        }}>
          <button
            onClick={() => setBlasts([])}
            style={{ position:'absolute', top:10, right:12, background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#3f568d' }}
          >✕</button>
          <strong style={{ color: 'var(--blue)', display: 'block', marginBottom: 4 }}>{blasts[0].title}</strong>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ink)' }}>{blasts[0].message}</p>
        </div>
      )}

      <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />

    </div>
  );
}
