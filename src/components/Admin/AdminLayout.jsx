import { useState } from 'react';
import {
  LayoutDashboard, Users, Building2, MapPin, Palette, Images, Music,
  ListMusic, FolderOpen, MessageSquare, BookOpen, Bell, Settings, Monitor, LogOut,
} from 'lucide-react';
import CrescentIcon from '../shared/CrescentIcon';
import GlassCard from '../shared/GlassCard';
import useStore from '../../store/useStore';
import { updateProfile } from '../../lib/supabase';
import useWaktuSolat from '../../hooks/useWaktuSolat';
import Dashboard from './Dashboard';
import MasjidProfileEditor from './MasjidProfileEditor';
import AppearanceSettings from './AppearanceSettings';
import SliderManager from './SliderManager';
import AudioLibraryManager from './AudioLibraryManager';
import PlaylistManager from './PlaylistManager';
import GoogleDriveImporter from './GoogleDriveImporter';
import TickerManager from './TickerManager';
import HadithManager from './HadithManager';
import BlastNotification from './BlastNotification';
import FeatureToggle from './FeatureToggle';
import UserManagement from './UserManagement';

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,168,76,0.3)',
  color: '#F5EDD6', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px',
  outline: 'none', boxSizing: 'border-box',
};
const btnPrimary = {
  background: '#C9A84C', color: '#050E1A', border: 'none',
  borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '14px',
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { divider: true },
  { id: 'users', label: 'Pengguna', icon: Users },
  { divider: true },
  { id: 'profile', label: 'Profil Masjid', icon: Building2 },
  { id: 'zone', label: 'Zon Waktu Solat', icon: MapPin },
  { id: 'appearance', label: 'Latar & Tema', icon: Palette },
  { divider: true },
  { id: 'slider', label: 'Slider Media', icon: Images },
  { id: 'audio', label: 'Pustaka Audio', icon: Music },
  { id: 'playlist', label: 'Senarai Main', icon: ListMusic },
  { id: 'gdrive', label: 'Import Google Drive', icon: FolderOpen },
  { divider: true },
  { id: 'ticker', label: 'Info Ticker', icon: MessageSquare },
  { id: 'hadith', label: 'Hadith', icon: BookOpen },
  { id: 'blast', label: 'Pemberitahuan', icon: Bell },
  { divider: true },
  { id: 'features', label: 'Tetapan Ciri', icon: Settings },
  { divider: true },
  { id: 'preview', label: 'Pratonton InfoTV', icon: Monitor, isExternal: true },
  { id: 'logout', label: 'Log Keluar', icon: LogOut, isDanger: true },
];

function ZonePage() {
  const { profile, setProfile } = useStore();
  const { ZONES } = useWaktuSolat();
  const [zone, setZone] = useState(profile?.zone_code || 'WLY01');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;
    const { data } = await updateProfile(profile.id, { zone_code: zone });
    if (data) { setProfile(data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <GlassCard style={{ maxWidth: 480 }}>
      <label style={{ color: '#C9A84C', fontSize: 13, display: 'block', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Pilih Zon</label>
      <select value={zone} onChange={e => setZone(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }}>
        {Object.entries(ZONES).map(([state, zones]) => (
          <optgroup key={state} label={state}>
            {Object.entries(zones).map(([code, label]) => (
              <option key={code} value={code}>{code} — {label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <button onClick={handleSave} style={btnPrimary}>{saved ? 'Tersimpan ✓' : 'Simpan Zon'}</button>
    </GlassCard>
  );
}

export default function AdminLayout({ currentPage = 'dashboard', onNavigate, onLogout }) {
  const getPageLabel = () => {
    const found = NAV_ITEMS.find(item => !item.divider && item.id === currentPage);
    return found ? found.label : 'Dashboard';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={onNavigate} />;
      case 'users': return <UserManagement />;
      case 'profile': return <MasjidProfileEditor />;
      case 'zone': return <ZonePage />;
      case 'appearance': return <AppearanceSettings />;
      case 'slider': return <SliderManager />;
      case 'audio': return <AudioLibraryManager />;
      case 'playlist': return <PlaylistManager />;
      case 'gdrive': return <GoogleDriveImporter />;
      case 'ticker': return <TickerManager />;
      case 'hadith': return <HadithManager />;
      case 'blast': return <BlastNotification />;
      case 'features': return <FeatureToggle />;
      default: return <Dashboard onNavigate={onNavigate} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: '260px',
        background: 'rgba(5,14,26,0.95)',
        borderRight: '1px solid rgba(201,168,76,0.15)',
        overflowY: 'auto',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CrescentIcon size={24} />
          <span style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#C9A84C',
            fontSize: '13px',
            fontWeight: 700,
            lineHeight: 1.2,
          }}>
            MasjidTV CMS
          </span>
        </div>

        <div style={{ height: '1px', background: 'rgba(201,168,76,0.2)', margin: '0 16px 8px' }} />

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '4px 8px' }}>
          {NAV_ITEMS.map((item, index) => {
            if (item.divider) {
              return <div key={`div-${index}`} style={{ height: '1px', background: 'rgba(201,168,76,0.1)', margin: '6px 8px' }} />;
            }

            const Icon = item.icon;
            const isActive = currentPage === item.id && !item.isExternal && !item.isDanger;

            const handleClick = () => {
              if (item.isExternal) {
                window.open('/', '_blank');
              } else if (item.isDanger) {
                onLogout && onLogout();
              } else {
                onNavigate && onNavigate(item.id);
              }
            };

            return (
              <div
                key={item.id}
                onClick={handleClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  paddingLeft: '13px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  fontSize: '14px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
                  background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                  color: item.isDanger
                    ? 'rgba(239,68,68,0.8)'
                    : isActive
                      ? '#C9A84C'
                      : 'rgba(245,237,214,0.7)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'var(--color-navy, #050E1A)',
        padding: '32px',
        flex: 1,
      }}>
        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#C9A84C',
          fontSize: '1.4rem',
          margin: '0 0 28px 0',
        }}>
          {getPageLabel()}
        </h2>
        {renderPage()}
      </div>
    </div>
  );
}
