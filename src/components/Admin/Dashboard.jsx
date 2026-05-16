import GlassCard from '../shared/GlassCard';
import useStore from '../../store/useStore';
import { Users, Images, Music, BookOpen, ArrowRight, LayoutDashboard } from 'lucide-react';

const btnSecondary = {
  background: 'transparent',
  color: '#C9A84C',
  border: '1px solid rgba(201,168,76,0.4)',
  borderRadius: '8px',
  padding: '10px 20px',
  cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const QUICK_LINKS = [
  { id: 'profile', label: 'Profil Masjid' },
  { id: 'slider', label: 'Slider Media' },
  { id: 'audio', label: 'Pustaka Audio' },
  { id: 'ticker', label: 'Info Ticker' },
  { id: 'hadith', label: 'Hadith' },
  { id: 'features', label: 'Tetapan Ciri' },
];

const RECENT_ACTIVITY = [
  { text: 'Profil masjid dikemaskini', time: 'Baru-baru ini' },
  { text: 'Slaid baharu ditambah', time: '2 minit lepas' },
  { text: 'Hadith baharu ditambah', time: '15 minit lepas' },
  { text: 'Ticker dikemaskini', time: '1 jam lepas' },
];

export default function Dashboard({ onNavigate }) {
  const { sliderItems, audioItems, hadithItems } = useStore();

  const stats = [
    { label: 'Jumlah Pengguna', icon: Users, color: '#C9A84C', value: 1 },
    { label: 'Slider Aktif', icon: Images, color: '#1A7A5E', value: sliderItems?.length || 0 },
    { label: 'Trek Audio', icon: Music, color: '#0D4F4F', value: audioItems?.length || 0 },
    { label: 'Hadith Ditambah', icon: BookOpen, color: '#F5EDD6', value: hadithItems?.length || 0 },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} style={{ position: 'relative' }}>
              <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', color: '#C9A84C', fontWeight: 700 }}>
                {stat.value}
              </div>
              <div style={{ color: '#F5EDD6', fontSize: '0.85rem', marginTop: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stat.label}
              </div>
              <Icon
                size={32}
                color={stat.color}
                style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.3 }}
              />
            </GlassCard>
          );
        })}
      </div>

      {/* Quick Links */}
      <GlassCard style={{ marginTop: '24px' }}>
        <h3 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#C9A84C',
          fontSize: '1rem',
          marginBottom: '16px',
          margin: '0 0 16px 0',
        }}>
          Akses Pantas
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {QUICK_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate && onNavigate(link.id)}
              style={btnSecondary}
            >
              {link.label}
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Recent Activity */}
      <GlassCard style={{ marginTop: '16px' }}>
        <h3 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#C9A84C',
          fontSize: '1rem',
          margin: '0 0 16px 0',
        }}>
          Aktiviti Terkini
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {RECENT_ACTIVITY.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid rgba(201,168,76,0.1)' : 'none',
              }}
            >
              <span style={{ color: '#F5EDD6', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {item.text}
              </span>
              <span style={{ color: 'rgba(245,237,214,0.45)', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap', marginLeft: '16px' }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
