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
      <label style={{
        display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 600,
        color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>Pilih Zon</label>
      <select value={zone} onChange={(e) => setZone(e.target.value)}
        className="ms-input" style={{ marginBottom: 16 }}>
        {Object.entries(ZONES).map(([state, zones]) => (
          <optgroup key={state} label={state}>
            {Object.entries(zones).map(([code, label]) => (
              <option key={code} value={code}>{code} — {label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <button onClick={handleSave} className="ms-btn">
        {saved ? 'Tersimpan ✓' : 'Simpan Zon'}
      </button>
    </GlassCard>
  );
}

export default function AdminLayout({ currentPage = 'dashboard', onNavigate, onLogout }) {
  const getPageLabel = () => {
    const found = NAV_ITEMS.find((item) => !item.divider && item.id === currentPage);
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: 260,
        background: 'rgba(15,17,23,0.95)',
        backdropFilter: 'var(--glass-blur-heavy)',
        WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        borderRight: '1px solid var(--glass-border)',
        overflowY: 'auto',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo area */}
        <div style={{
          height: 56, padding: '0 20px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0,
        }}>
          <CrescentIcon size={20} color="var(--ms-blue)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            MasjidTV
          </span>
          <span style={{
            background: 'rgba(0,120,212,0.2)', color: 'var(--ms-blue)',
            fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10,
            fontWeight: 600,
          }}>
            CMS
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px' }}>
          {NAV_ITEMS.map((item, index) => {
            if (item.divider) {
              return (
                <div key={`div-${index}`} style={{
                  height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 12px',
                }} />
              );
            }

            const Icon = item.icon;
            const isActive = currentPage === item.id && !item.isExternal && !item.isDanger;

            const handleClick = () => {
              if (item.isExternal) window.open('/', '_blank');
              else if (item.isDanger) onLogout?.();
              else onNavigate?.(item.id);
            };

            return (
              <div
                key={item.id}
                onClick={handleClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  marginBottom: 2, cursor: 'pointer',
                  fontSize: '0.875rem', fontWeight: isActive ? 600 : 500,
                  background: isActive ? 'rgba(0,120,212,0.15)' : 'transparent',
                  color: item.isDanger
                    ? 'rgba(255,255,255,0.5)'
                    : isActive
                      ? 'var(--ms-blue)'
                      : 'var(--text-secondary)',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = item.isDanger ? 'var(--ms-red)' : 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = item.isDanger
                      ? 'rgba(255,255,255,0.5)'
                      : 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: 260,
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        padding: 32,
        flex: 1,
      }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {getPageLabel()}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            CMS / {getPageLabel()}
          </p>
        </div>
        {renderPage()}
      </div>
    </div>
  );
}
