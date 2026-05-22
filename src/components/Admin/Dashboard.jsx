import { Users, Images, Music, BookOpen, ArrowRight, TrendingUp, Activity, Zap } from 'lucide-react';
import useStore from '../../store/useStore';

const QUICK_LINKS = [
  { id: 'profile',    label: 'Profil Masjid',  color: '#1174ff', bg: 'rgba(17,116,255,0.1)' },
  { id: 'appearance', label: 'Latar & Tema',   color: '#7547ff', bg: 'rgba(117,71,255,0.1)' },
  { id: 'slider',     label: 'Slider Media',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  { id: 'audio',      label: 'Pustaka Audio',  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { id: 'ticker',     label: 'Info Ticker',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { id: 'hadith',     label: 'Hadith',         color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  { id: 'blast',      label: 'Pemberitahuan',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { id: 'features',   label: 'Tetapan Ciri',   color: '#3f568d', bg: 'rgba(63,86,141,0.1)'  },
];

const RECENT_ACTIVITY = [
  { text: 'Profil masjid dikemaskini', time: 'Baru-baru ini', dot: '#1174ff' },
  { text: 'Slaid baharu ditambah',     time: '2 min lepas',  dot: '#10b981' },
  { text: 'Hadith baharu ditambah',    time: '15 min lepas', dot: '#f59e0b' },
  { text: 'Ticker dikemaskini',        time: '1 jam lepas',  dot: '#7547ff' },
];

function StatCard({ label, value, icon: Icon, gradient, accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(32px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
      border: '1px solid rgba(255,255,255,0.9)',
      borderRadius: 20,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(17,50,140,0.07), 0 1px 0 rgba(255,255,255,0.8) inset',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(17,50,140,0.12)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(17,50,140,0.07)'; }}
    >
      {/* Accent strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gradient, borderRadius: '20px 20px 0 0' }} />

      {/* Icon bubble */}
      <div style={{
        position: 'absolute', top: 18, right: 18,
        width: 44, height: 44, borderRadius: 14,
        background: gradient, opacity: 0.13,
      }} />
      <Icon size={22} style={{ position: 'absolute', top: 29, right: 29, color: accent, opacity: 0.7 }} />

      <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f1f4a', letterSpacing: '-0.03em', lineHeight: 1, marginTop: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#3f568d', fontWeight: 500, marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(32px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
      border: '1px solid rgba(255,255,255,0.9)',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(17,50,140,0.07), 0 1px 0 rgba(255,255,255,0.8) inset',
      marginBottom: 20,
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(17,116,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {Icon && <Icon size={16} color="#1174ff" />}
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f1f4a' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { sliderItems, audioItems, hadithItems, tickerMessages, profile } = useStore();

  const stats = [
    { label: 'Jumlah Pengguna',  icon: Users,    gradient: 'linear-gradient(135deg,#1174ff,#7547ff)', accent: '#1174ff', value: 1 },
    { label: 'Slider Aktif',     icon: Images,   gradient: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', accent: '#0ea5e9', value: sliderItems?.length || 0 },
    { label: 'Trek Audio',       icon: Music,    gradient: 'linear-gradient(135deg,#10b981,#34d399)', accent: '#10b981', value: audioItems?.length || 0 },
    { label: 'Hadith Ditambah',  icon: BookOpen, gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', accent: '#f59e0b', value: hadithItems?.length || 0 },
  ];

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(17,116,255,0.9), rgba(117,71,255,0.9))',
        backdropFilter: 'blur(20px)',
        borderRadius: 20,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(17,116,255,0.25)',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>
            Selamat datang, {profile?.full_name?.split(' ')[0] || 'Admin'} 👋
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>
            {profile?.masjid_name || 'MasjidTV'} · Panel Pentadbir CMS
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.18)', padding: '6px 14px',
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.25)',
        }}>
          <Activity size={14} color="white" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'white' }}>Sistem Aktif</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {/* Quick links */}
        <SectionCard title="Akses Pantas" icon={Zap}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate?.(link.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 10, cursor: 'pointer',
                  background: link.bg, border: `1px solid ${link.color}22`,
                  color: link.color, fontSize: '0.8rem', fontWeight: 600,
                  transition: 'transform 0.15s, opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {link.label}
                <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Recent activity */}
        <SectionCard title="Aktiviti Terkini" icon={TrendingUp}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid rgba(17,116,255,0.06)' : 'none',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.835rem', color: '#0f1f4a' }}>{item.text}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(63,86,141,0.5)', whiteSpace: 'nowrap' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
