/**
 * MobileInfoTV.jsx
 * Mobile-first InfoTV layout (390px wide)
 * Follows the Masjid As-Salam app layout from design reference.
 * Tabs: Utama | Jadual | Komuniti | Profil (+ centre masjid FAB)
 */
import { useState, useEffect, useRef } from 'react';
import { getHolidaysForMonth, isHoliday, toHijri } from '../../lib/myHolidays';

/* ── Design tokens ──────────────────────────────────────────────── */
const T = {
  bg:     'linear-gradient(170deg,#eef1ff 0%,#e8ecff 40%,#f0edff 100%)',
  blue:   '#4B5EFF',
  violet: '#7B5CFF',
  ink:    '#1a1f3d',
  muted:  '#6b7399',
  faint:  'rgba(107,115,153,0.45)',
  line:   'rgba(75,94,255,0.1)',
  glass:  'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.88)',
};

const PRAYER_KEYS = [
  { key: 'imsak',   name: 'IMSAK',   icon: '🌙' },
  { key: 'subuh',   name: 'SUBUH',   icon: '🌅' },
  { key: 'syuruk',  name: 'SYURUK',  icon: '☀️' },
  { key: 'zohor',   name: 'ZUHUR',   icon: '🕛' },
  { key: 'asar',    name: 'ASAR',    icon: '🌤' },
  { key: 'maghrib', name: 'MAGHRIB', icon: '🌇' },
  { key: 'isyak',   name: 'ISYAK',   icon: '🌙' },
];

const MALAY_DAYS_SHORT = ['Ahd','Isn','Sel','Rab','Kha','Jum','Sab'];
const MALAY_DAYS_FULL  = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
const MALAY_MONTHS     = ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const MALAY_MONTHS_SH  = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogos','Sep','Okt','Nov','Dis'];

function fmt12(t) {
  if (!t) return '--:--';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}
function fmt12NoAmPm(t) {
  if (!t) return '--:--';
  const [h, m] = t.split(':').map(Number);
  const hh = h % 12 || 12;
  return `${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function fmt12AmPm(t) {
  if (!t) return '';
  const [h] = t.split(':').map(Number);
  return h >= 12 ? 'PM' : 'AM';
}
function pad(n) { return String(n).padStart(2, '0'); }

/* ── DEFAULT ACTIVITIES ─────────────────────────────────────────── */
const DEFAULT_ACTIVITIES = [
  { id: 1, time: '08:30 PM', end: '10:00 PM', title: 'Kuliah Maghrib', speaker: 'Ustaz Ahmad Farhan', venue: 'Dewan Solat Utama', color: '#6B48FF', icon: '📖' },
  { id: 2, time: '02:30 PM', end: '05:00 PM', title: 'Kelas Fardu Ain', speaker: 'Ustazah Nurul Huda', venue: 'Bilik Kuliah 2', color: '#10b981', icon: '👥' },
  { id: 3, time: '09:00 AM', end: '12:00 PM', title: 'Program Gotong-Royong', speaker: 'Kawasan Masjid', venue: 'Kawasan Masjid', color: '#f59e0b', icon: '⭐' },
  { id: 4, time: '07:30 PM', end: '09:00 PM', title: 'Majlis Tilawah Al-Quran', speaker: 'Qari Masjid', venue: 'Dewan Solat Utama', color: '#0ea5e9', icon: '📿' },
];

const ANNOUNCEMENT_ITEMS = [
  { id: 1, icon: '📢', label: 'PENGUMUMAN' },
  { id: 2, icon: '📚', label: 'Kelas Pengajian Kitab', sub: 'Setiap Khamis, 8:30 Malam' },
  { id: 3, icon: '🏦', label: 'Tabung Infaq Masjid', sub: 'Maybank 5642 7654 3210' },
  { id: 4, icon: '🤲', label: 'Jom Menyumbang,', sub: 'Jom Beramal Jariah' },
];

/* ── Glass card ─────────────────────────────────────────────────── */
function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: T.glass,
      backdropFilter: 'blur(24px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
      border: `1px solid ${T.glassBorder}`,
      borderRadius: 20,
      boxShadow: '0 4px 24px rgba(75,94,255,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Bottom tab bar ─────────────────────────────────────────────── */
const TABS = [
  { id: 'home',      icon: '🏠', label: 'Utama' },
  { id: 'jadual',    icon: '📅', label: 'Jadual' },
  { id: 'masjid',    icon: null,  label: '' },       // Centre FAB
  { id: 'komuniti',  icon: '👥', label: 'Komuniti' },
  { id: 'profil',    icon: '👤', label: 'Profil' },
];

function TabBar({ active, onChange }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(75,94,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      height: 72,
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
    }}>
      {TABS.map(tab => {
        if (!tab.icon) {
          // Centre FAB — masjid button
          return (
            <div key="masjid" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -24 }}>
              <button style={{
                width: 60, height: 60, borderRadius: '50%',
                background: `linear-gradient(135deg,${T.blue},${T.violet})`,
                border: '4px solid white',
                boxShadow: '0 8px 24px rgba(75,94,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 26,
              }}>🕌</button>
            </div>
          );
        }
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            background: 'none', border: 'none', cursor: 'pointer',
            flex: 1, padding: '6px 0',
          }}>
            <span style={{ fontSize: 20, filter: isActive ? 'none' : 'grayscale(1) opacity(0.5)' }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 400,
              color: isActive ? T.blue : T.muted,
            }}>
              {tab.label}
            </span>
            {isActive && (
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.blue, marginTop: 1 }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HOME TAB
   ══════════════════════════════════════════════════════════════════ */
function HomeTab({ times, nextSolatName, nextSolat, hours, minutes, seconds, isImminent, progressPct, time, gregorianDate, hijriDate, dayName, hadith, slides, slideIndex, setSlideIndex, profile, masjidIcon }) {
  const timeHH = parseInt(time.substring(0, 2), 10);
  const ampm = timeHH >= 12 ? 'PM' : 'AM';
  const currentSlide = slides[slideIndex];

  // Rotate hadith every 10s
  const [hadithIdx, setHadithIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHadithIdx(i => (i + 1) % (hadith.length || 1)), 10000);
    return () => clearInterval(t);
  }, [hadith.length]);
  const currentHadith = Array.isArray(hadith) ? (hadith[hadithIdx] || hadith[0]) : hadith;

  return (
    <div style={{ paddingBottom: 88 }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 18px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1 }}>
          {/* Icon */}
          <div style={{
            width: 70, height: 70, borderRadius: 18, flexShrink: 0,
            background: masjidIcon ? 'transparent' : `linear-gradient(135deg,${T.blue},${T.violet})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: masjidIcon ? 'none' : '0 8px 24px rgba(75,94,255,0.35)',
            overflow: 'hidden',
          }}>
            {masjidIcon
              ? <img src={masjidIcon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: 34, color: 'white' }}>🕌</span>
            }
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: T.ink, margin: '0 0 3px', lineHeight: 1.1 }}>
              {profile?.masjid_name || 'MasjidTV'}
            </h1>
            <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.4 }}>
              {profile?.masjid_description || 'Sistem InfoTV Islamik'}
            </p>
            <p style={{ fontSize: 11, color: T.faint, margin: '4px 0 0', fontStyle: 'italic' }}>
              Menyatukan Ummah, Mengimarahkan Masjid
            </p>
          </div>
        </div>
        {/* Bell */}
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(75,94,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', boxShadow: '0 2px 12px rgba(75,94,255,0.08)',
        }}>
          🔔
          <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: T.violet, border: '2px solid white' }} />
        </div>
      </div>

      {/* ── Time & Date card ── */}
      <div style={{ padding: '0 16px 12px' }}>
        <Card style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Clock icon */}
            <div style={{
              width: 54, height: 54, borderRadius: 16, flexShrink: 0,
              background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(75,94,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              boxShadow: '0 4px 12px rgba(75,94,255,0.1)',
            }}>◷</div>

            {/* Time */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: T.ink, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {time.substring(0, 5)}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.blue }}>{ampm}</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 52, background: 'rgba(75,94,255,0.12)' }} />

            {/* Date */}
            <div style={{ fontSize: 13, lineHeight: 1.5, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>📅</span>
                <div>
                  <strong style={{ display: 'block', color: T.ink, fontSize: 14 }}>{gregorianDate.replace(/^[^,]+,\s*/, '')}</strong>
                  <span style={{ color: T.muted, fontSize: 12 }}>{dayName}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>🌙</span>
                <div>
                  <strong style={{ display: 'block', color: T.ink, fontSize: 13 }}>{hijriDate}</strong>
                  <span style={{ color: T.muted, fontSize: 12 }}>{dayName}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Countdown card ── */}
      <div style={{ padding: '0 16px 12px' }}>
        <Card style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Countdown Ke
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: isImminent ? '#e05c00' : T.blue, marginBottom: 12 }}>
                {nextSolatName || '--'}
              </div>
              {/* Time digits */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                {[{ n: pad(hours), label: 'JAM' }, { n: pad(minutes), label: 'MINIT' }, { n: pad(seconds), label: 'SAAT' }].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 46, fontWeight: 800, color: isImminent ? '#e05c00' : T.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {item.n}
                    </span>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', marginTop: 2 }}>
                      {item.label}
                    </div>
                    {i < 2 && <span style={{ fontSize: 36, fontWeight: 700, color: T.muted, position: 'absolute', marginLeft: 4, marginTop: -6 }}>:</span>}
                  </div>
                ))}
                {/* Colons between digits */}
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 14, height: 5, borderRadius: 10, background: 'rgba(75,94,255,0.12)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg,${T.blue},${T.violet})`, borderRadius: 10, transition: 'width 1s linear' }} />
              </div>
            </div>
            {/* Decorative icon */}
            <div style={{ fontSize: 56, opacity: 0.18, marginTop: -4 }}>🕌</div>
          </div>
          <button style={{
            marginTop: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderRadius: 12, background: 'rgba(75,94,255,0.07)',
            border: '1px solid rgba(75,94,255,0.12)', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔔</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>Jadual hari ini</span>
            </div>
            <span style={{ fontSize: 16, color: T.muted }}>›</span>
          </button>
        </Card>
      </div>

      {/* ── Tazkirah Slider ── */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          borderRadius: 20, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg,rgba(13,25,90,0.92),rgba(75,60,200,0.85))`,
          boxShadow: '0 8px 32px rgba(75,94,255,0.25)',
          minHeight: 220,
        }}>
          {/* Background image from slide if available */}
          {currentSlide?.media_url && (
            <img src={currentSlide.media_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
          )}
          <div style={{ position: 'relative', padding: '20px 20px 28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              background: 'rgba(255,255,255,0.18)', marginBottom: 14,
            }}>
              <span style={{ fontSize: 12 }}>📖</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>
                {currentSlide?.pill || 'Tazkirah Hari Ini'}
              </span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', lineHeight: 1.2, margin: '0 0 10px', whiteSpace: 'pre-line' }}>
              {currentSlide?.title?.split('\n').map((line, i) => {
                const accentLines = currentSlide?.accent?.split('\n') || [];
                const isAccent = accentLines.includes(line);
                return (
                  <span key={i} style={isAccent ? { background: 'linear-gradient(90deg,#7fdcff,#ba83ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' } : { display: 'block' }}>
                    {line}
                  </span>
                );
              }) || 'Jangan Lupa, Allah Sentiasa Bersama Kita'}
            </h2>
            {currentSlide?.text && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                {currentSlide.text}
              </p>
            )}
          </div>
          {/* Dots */}
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setSlideIndex(i)} style={{
                width: i === slideIndex ? 20 : 8, height: 8, borderRadius: 4,
                background: i === slideIndex ? 'white' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', transition: 'width 0.3s',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Hadith card ── */}
      <div style={{ padding: '0 16px 12px' }}>
        <Card style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${T.blue}15`, border: `1px solid ${T.blue}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📿</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>Hadis Hari Ini</span>
              </div>
              {currentHadith?.arabic && (
                <p style={{ direction: 'rtl', fontFamily: "'Amiri', Georgia, serif", fontSize: 18, color: T.blue, textAlign: 'right', margin: '0 0 8px', lineHeight: 1.8 }}>
                  {currentHadith.arabic}
                </p>
              )}
              <p style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.5, margin: '0 0 6px' }}>
                {currentHadith?.malay || currentHadith?.malay_translation || ''}
              </p>
              <p style={{ fontSize: 11, color: T.blue, fontWeight: 600, margin: 0 }}>
                {currentHadith?.source || ''}
              </p>
            </div>
            <div style={{ width: 90, flexShrink: 0, borderRadius: 12, overflow: 'hidden', alignSelf: 'center' }}>
              <img src="https://images.unsplash.com/photo-1585036156171-384164a8c675?w=200&q=80" alt="" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Prayer Times ── */}
      <div style={{ padding: '0 16px 12px' }}>
        <Card style={{ padding: '14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '0 4px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: `${T.blue}12`, border: `1px solid ${T.blue}20` }}>
              <span style={{ fontSize: 14 }}>🕐</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.blue, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Waktu Solat Hari Ini</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {PRAYER_KEYS.map(p => {
              const isNext = nextSolatName === p.name;
              return (
                <div key={p.key} style={{
                  textAlign: 'center', padding: '10px 2px',
                  borderRadius: 14,
                  background: isNext ? `linear-gradient(135deg,${T.blue},${T.violet})` : 'rgba(75,94,255,0.05)',
                  border: isNext ? 'none' : '1px solid rgba(75,94,255,0.08)',
                  boxShadow: isNext ? '0 6px 18px rgba(75,94,255,0.3)' : 'none',
                }}>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>{p.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: isNext ? 'rgba(255,255,255,0.85)' : T.muted, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 5 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isNext ? 'white' : T.ink, lineHeight: 1 }}>
                    {fmt12NoAmPm(times?.[p.key])}
                  </div>
                  <div style={{ fontSize: 9, color: isNext ? 'rgba(255,255,255,0.7)' : T.muted, marginTop: 2 }}>
                    {fmt12AmPm(times?.[p.key])}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Announcements row ── */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {ANNOUNCEMENT_ITEMS.map(item => (
            <Card key={item.id} style={{ padding: '12px 8px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.ink, lineHeight: 1.3 }}>{item.label}</div>
              {item.sub && <div style={{ fontSize: 9, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{item.sub}</div>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   JADUAL TAB — Calendar + Activities
   ══════════════════════════════════════════════════════════════════ */
const JADUAL_SUB_TABS = [
  { id: 'solat',    icon: '🕌', label: 'Waktu Solat' },
  { id: 'jadual',   icon: '📋', label: 'Jadual' },
  { id: 'calendar', icon: '📅', label: 'Kalendar' },
  { id: 'iqamah',   icon: '⏱', label: 'Iqamah' },
];

function JadualTab({ times, nextSolatName, hadith, gregorianDate, hijriDate }) {
  const [sub, setSub] = useState('calendar');
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const holidays = getHolidaysForMonth(viewYear, viewMonth);
  const hijriToday = toHijri(today);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: prevMonthDays - firstDay + i + 1, current: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
  while (cells.length % 7) cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false });

  const goToPrev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // Selected day activities (from DEFAULT_ACTIVITIES for now)
  const selectedActivities = DEFAULT_ACTIVITIES;

  return (
    <div style={{ paddingBottom: 88 }}>
      {/* Sub-tabs */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: 'rgba(255,255,255,0.6)', borderRadius: 16, padding: 4, border: '1px solid rgba(75,94,255,0.1)' }}>
          {JADUAL_SUB_TABS.map(t => {
            const isActive = sub === t.id;
            return (
              <button key={t.id} onClick={() => setSub(t.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 4px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: isActive ? 'white' : 'transparent',
                boxShadow: isActive ? '0 2px 8px rgba(75,94,255,0.15)' : 'none',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? T.blue : T.muted }}>{t.label}</span>
                {isActive && <div style={{ width: 16, height: 2, borderRadius: 1, background: T.blue }} />}
              </button>
            );
          })}
        </div>
      </div>

      {sub === 'calendar' && (
        <div style={{ padding: '14px 16px' }}>
          <Card>
            {/* Calendar header */}
            <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(75,94,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: T.ink, margin: 0 }}>Kalendar Masjid</h3>
                  <p style={{ fontSize: 12, color: T.muted, margin: '2px 0 0' }}>
                    {MALAY_MONTHS[viewMonth]} {viewYear} / {hijriToday.monthName} {hijriToday.year}H
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDay(today.getDate()); }} style={{
                    padding: '5px 10px', borderRadius: 8, border: `1px solid ${T.blue}28`, background: `${T.blue}0c`,
                    color: T.blue, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}>Hari Ini</button>
                  <button onClick={goToPrev} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(75,94,255,0.15)', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                  <button onClick={goToNext} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(75,94,255,0.15)', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                </div>
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '10px 12px 4px' }}>
              {MALAY_DAYS_SHORT.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: d === 'Jum' ? T.blue : T.muted, padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 8px 12px', gap: '2px 0' }}>
              {cells.map((cell, i) => {
                const holiday = cell.current ? isHoliday(viewYear, viewMonth, cell.day) : null;
                const isToday = cell.current && cell.day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const isSelected = cell.current && cell.day === selectedDay;
                const hijriCell = cell.current ? toHijri(new Date(viewYear, viewMonth, cell.day)) : null;

                return (
                  <div key={i} onClick={() => cell.current && setSelectedDay(cell.day)} style={{
                    textAlign: 'center', padding: '5px 2px', borderRadius: 10, cursor: cell.current ? 'pointer' : 'default',
                    background: isSelected ? `linear-gradient(135deg,${T.blue},${T.violet})` : 'transparent',
                    opacity: cell.current ? 1 : 0.3,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: isToday || isSelected ? 800 : 400, color: isSelected ? 'white' : isToday ? T.blue : T.ink, lineHeight: 1.2 }}>
                      {cell.day}
                    </div>
                    {hijriCell && (
                      <div style={{ fontSize: 8, color: isSelected ? 'rgba(255,255,255,0.75)' : T.faint, lineHeight: 1 }}>
                        {hijriCell.day} {hijriCell.monthName?.slice(0, 3)}
                      </div>
                    )}
                    {/* Dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                      {holiday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? 'white' : '#f59e0b' }} />}
                      {isToday && !isSelected && <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.blue }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ padding: '8px 16px 14px', borderTop: '1px solid rgba(75,94,255,0.07)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[{ color: '#6B48FF', label: 'Kuliah / Tazkirah' },{ color: '#10b981', label: 'Program Khas' },{ color: '#f59e0b', label: 'Cuti Umum' },{ color: '#0ea5e9', label: 'Lain-lain' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                  <span style={{ fontSize: 10, color: T.muted }}>{l.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Holiday banner if today is holiday */}
          {(() => {
            const h = isHoliday(viewYear, viewMonth, selectedDay);
            if (!h) return null;
            return (
              <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>🎉</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: '#b45309' }}>Cuti Umum Malaysia</div>
                </div>
              </div>
            );
          })()}

          {/* Activities for selected day */}
          <div style={{ marginTop: 14 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: T.ink, margin: '0 0 10px', padding: '0 4px' }}>
              Acara pada {selectedDay} {MALAY_MONTHS[viewMonth]} {viewYear}{' '}
              <span style={{ color: T.blue, fontSize: 12 }}>({MALAY_DAYS_FULL[new Date(viewYear, viewMonth, selectedDay).getDay()]})</span>
            </h4>
            {selectedActivities.map(act => (
              <Card key={act.id} style={{ padding: '14px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: `${act.color}20`, border: `1px solid ${act.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {act.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginBottom: 2 }}>
                      {act.time} – {act.end}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginBottom: 1 }}>{act.title}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{act.speaker}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{act.venue}</div>
                    <span style={{ fontSize: 16, color: T.muted }}>›</span>
                  </div>
                </div>
              </Card>
            ))}
            <button style={{
              width: '100%', padding: '12px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'rgba(75,94,255,0.07)', border: '1px solid rgba(75,94,255,0.15)', cursor: 'pointer',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.blue }}>Lihat Semua Acara</span>
              <span style={{ fontSize: 16, color: T.blue }}>›</span>
            </button>
          </div>
        </div>
      )}

      {sub === 'solat' && (
        <div style={{ padding: '14px 16px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 12 }}>Waktu Solat Hari Ini</h3>
          {PRAYER_KEYS.map(p => {
            const isNext = nextSolatName === p.name;
            return (
              <Card key={p.key} style={{ padding: '14px 18px', marginBottom: 8, borderLeft: isNext ? `4px solid ${T.blue}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{p.name}</div>
                      {isNext && <div style={{ fontSize: 11, color: T.blue, fontWeight: 600 }}>Seterusnya</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: isNext ? T.blue : T.ink }}>
                    {fmt12(times?.[p.key])}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(sub === 'jadual' || sub === 'iqamah') && (
        <div style={{ padding: '40px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{sub === 'iqamah' ? '⏱' : '📋'}</div>
          <p style={{ fontSize: 14, color: T.muted }}>
            {sub === 'iqamah' ? 'Jadual Iqamah akan dikemaskini' : 'Jadual program akan dikemaskini'}
          </p>
          <p style={{ fontSize: 12, color: T.faint }}>Sila kemaskini melalui panel admin</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   KOMUNITI TAB (placeholder)
   ══════════════════════════════════════════════════════════════════ */
function KomunitiTab() {
  return (
    <div style={{ padding: '24px 16px 88px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🤲</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginBottom: 8 }}>Komuniti Masjid</h3>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>Papan komuniti, program, dan aktiviti masjid</p>
      {[{ icon: '📢', title: 'Pengumuman', sub: 'Berita terkini masjid' }, { icon: '💰', title: 'Tabung Masjid', sub: 'Infaq & Sedekah' }, { icon: '📚', title: 'Kelas Pengajian', sub: 'Daftar & Jadual' }].map(item => (
        <Card key={item.title} style={{ padding: '16px 18px', marginBottom: 10, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div><div style={{ fontWeight: 700, color: T.ink }}>{item.title}</div><div style={{ fontSize: 12, color: T.muted }}>{item.sub}</div></div>
            <span style={{ marginLeft: 'auto', color: T.muted, fontSize: 18 }}>›</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PROFIL TAB (placeholder)
   ══════════════════════════════════════════════════════════════════ */
function ProfilTab({ profile }) {
  return (
    <div style={{ padding: '24px 16px 88px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 22, margin: '0 auto 12px', background: `linear-gradient(135deg,${T.blue},${T.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🕌</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.ink, margin: '0 0 4px' }}>{profile?.masjid_name || 'MasjidTV'}</h3>
        <p style={{ fontSize: 12, color: T.muted }}>{profile?.masjid_description || 'Sistem InfoTV Islamik'}</p>
      </div>
      {[{ icon: '⚙️', label: 'Tetapan', sub: 'Konfigurasi masjid' }, { icon: '🔔', label: 'Notifikasi', sub: 'Urus pemberitahuan' }, { icon: '🌐', label: 'Zon Solat', sub: profile?.zone_code || 'WLY01' }, { icon: 'ℹ️', label: 'Tentang', sub: 'MasjidTV v1.0' }].map(item => (
        <Card key={item.label} style={{ padding: '14px 18px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <div><div style={{ fontWeight: 600, color: T.ink, fontSize: 14 }}>{item.label}</div><div style={{ fontSize: 12, color: T.muted }}>{item.sub}</div></div>
            <span style={{ marginLeft: 'auto', color: T.muted, fontSize: 18 }}>›</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function MobileInfoTV({
  times, nextSolatName, nextSolat,
  hours, minutes, seconds, isImminent, progressPct,
  time, gregorianDate, hijriDate, dayName,
  hadith, slides, slideIndex, setSlideIndex,
  profile, masjidIcon,
}) {
  const [tab, setTab] = useState('home');

  return (
    <div style={{
      width: '100%', height: '100%',
      background: T.bg,
      overflowY: 'auto', overflowX: 'hidden',
      fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
      position: 'relative',
    }}>
      {/* Ambient background orbs */}
      <div style={{ position: 'fixed', top: -60, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(123,92,255,0.12)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: 100, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(75,94,255,0.1)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {tab === 'home'     && <HomeTab times={times} nextSolatName={nextSolatName} nextSolat={nextSolat} hours={hours} minutes={minutes} seconds={seconds} isImminent={isImminent} progressPct={progressPct} time={time} gregorianDate={gregorianDate} hijriDate={hijriDate} dayName={dayName} hadith={Array.isArray(hadith) ? hadith : [hadith]} slides={slides} slideIndex={slideIndex} setSlideIndex={setSlideIndex} profile={profile} masjidIcon={masjidIcon} />}
        {tab === 'jadual'   && <JadualTab times={times} nextSolatName={nextSolatName} hadith={hadith} gregorianDate={gregorianDate} hijriDate={hijriDate} />}
        {tab === 'komuniti' && <KomunitiTab />}
        {tab === 'profil'   && <ProfilTab profile={profile} />}
      </div>

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
