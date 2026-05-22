import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Users, Building2, MapPin, Palette, Images, Music,
  ListMusic, FolderOpen, MessageSquare, BookOpen, Bell, Settings,
  Monitor, LogOut, ChevronRight, Menu, X, ChevronDown,
} from 'lucide-react';
import CrescentIcon from '../shared/CrescentIcon';
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

/* ── Nav groups ─────────────────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Pengurusan',
    items: [
      { id: 'users',      label: 'Pengguna',       icon: Users },
      { id: 'profile',    label: 'Profil Masjid',  icon: Building2 },
      { id: 'zone',       label: 'Zon Waktu Solat',icon: MapPin },
      { id: 'appearance', label: 'Latar & Tema',   icon: Palette },
    ],
  },
  {
    label: 'Media & Kandungan',
    items: [
      { id: 'slider',   label: 'Slider Media',        icon: Images },
      { id: 'audio',    label: 'Pustaka Audio',        icon: Music },
      { id: 'playlist', label: 'Senarai Main',         icon: ListMusic },
      { id: 'gdrive',   label: 'Import Google Drive',  icon: FolderOpen },
    ],
  },
  {
    label: 'Komunikasi',
    items: [
      { id: 'ticker', label: 'Info Ticker',    icon: MessageSquare },
      { id: 'hadith', label: 'Hadith',         icon: BookOpen },
      { id: 'blast',  label: 'Pemberitahuan', icon: Bell },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { id: 'features', label: 'Tetapan Ciri', icon: Settings },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

/* ── ZonePage ────────────────────────────────────────────────────────────── */
function ZonePage() {
  const { profile, setProfile } = useStore();
  const { ZONES } = useWaktuSolat();
  const [zone, setZoneLocal] = useState(profile?.zone_code || 'WLY01');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;
    const { data } = await updateProfile(profile.id, { zone_code: zone });
    if (data) { setProfile(data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <Card title="🌐 Zon Waktu Solat" style={{ maxWidth: 520 }}>
      <label className="field-label">Pilih Zon</label>
      <select value={zone} onChange={e => setZoneLocal(e.target.value)} className="ms-input" style={{ marginBottom: 20 }}>
        {Object.entries(ZONES).map(([state, zones]) => (
          <optgroup key={state} label={state}>
            {Object.entries(zones).map(([code, label]) => (
              <option key={code} value={code}>{code} — {label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <button onClick={handleSave} className="ms-btn" style={{ width: 'auto', padding: '10px 28px' }}>
        {saved ? '✓ Tersimpan' : 'Simpan Zon'}
      </button>
    </Card>
  );
}

/* ── Shared Card ─────────────────────────────────────────────────────────── */
export function Card({ title, children, style }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(32px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
      border: '1px solid rgba(255,255,255,0.9)',
      borderRadius: 20,
      boxShadow: '0 4px 32px rgba(17,50,140,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
      padding: '24px',
      marginBottom: 20,
      ...style,
    }}>
      {title && (
        <h3 style={{
          fontSize: '0.95rem', fontWeight: 700, color: '#0f1f4a',
          margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8,
        }}>{title}</h3>
      )}
      {children}
    </div>
  );
}

/* ── NavItem ──────────────────────────────────────────────────────────────── */
function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 10, marginBottom: 1,
        cursor: 'pointer', border: 'none', textAlign: 'left',
        fontSize: '0.855rem', fontWeight: isActive ? 600 : 450,
        background: isActive
          ? 'linear-gradient(90deg, rgba(17,116,255,0.12), rgba(117,71,255,0.08))'
          : 'transparent',
        color: isActive ? '#1174ff' : '#3f568d',
        borderLeft: isActive ? '3px solid #1174ff' : '3px solid transparent',
        transition: 'all 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(17,116,255,0.06)'; e.currentTarget.style.color = '#071942'; }}}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3f568d'; }}}
    >
      <Icon size={16} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.label}
      </span>
      {isActive && <ChevronRight size={13} style={{ opacity: 0.5, flexShrink: 0 }} />}
    </button>
  );
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
function Sidebar({ currentPage, onNavigate, onLogout, onClose, isMobile }) {
  const { profile } = useStore();

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(40px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
    }}>
      {/* Logo */}
      <div style={{
        height: 56, padding: '0 16px',
        borderBottom: '1px solid rgba(17,116,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg,#1174ff,#7547ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(17,116,255,0.35)',
          }}>
            <CrescentIcon size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#071942', lineHeight: 1.2 }}>MasjidTV</div>
            <div style={{ fontSize: '0.65rem', color: '#7547ff', fontWeight: 600, letterSpacing: '0.06em' }}>CMS ADMIN</div>
          </div>
        </div>
        {isMobile && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3f568d', padding: 4 }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Profile chip */}
      {profile && (
        <div style={{
          margin: '12px 12px 4px',
          padding: '10px 12px',
          background: 'linear-gradient(135deg, rgba(17,116,255,0.07), rgba(117,71,255,0.05))',
          border: '1px solid rgba(17,116,255,0.12)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#1174ff,#7547ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.85rem',
          }}>
            {(profile.full_name || profile.masjid_name || 'A')[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#071942', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.full_name || 'Admin'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#7547ff', fontWeight: 600 }}>
              {profile.role === 'admin' ? '● Admin' : '● Pengguna'}
            </div>
          </div>
        </div>
      )}

      {/* Nav groups */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 12px' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 4 }}>
            {group.label && (
              <div style={{
                fontSize: '0.65rem', fontWeight: 700, color: 'rgba(63,86,141,0.5)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '12px 12px 4px',
              }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => (
              <NavItem
                key={item.id}
                item={item}
                isActive={currentPage === item.id}
                onClick={() => { onNavigate(item.id); if (isMobile) onClose(); }}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div style={{
        padding: '8px 8px 12px',
        borderTop: '1px solid rgba(17,116,255,0.1)',
        display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0,
      }}>
        <button
          onClick={() => window.open('/', '_blank')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
            border: 'none', background: 'transparent',
            fontSize: '0.855rem', fontWeight: 450, color: '#3f568d', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(17,116,255,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Monitor size={16} />
          <span>Pratonton InfoTV</span>
        </button>
        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
            border: 'none', background: 'transparent',
            fontSize: '0.855rem', fontWeight: 450, color: '#dc2626', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} />
          <span>Log Keluar</span>
        </button>
      </div>
    </div>
  );
}

/* ── AdminLayout ──────────────────────────────────────────────────────────── */
export default function AdminLayout({ currentPage = 'dashboard', onNavigate, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentItem = ALL_ITEMS.find(i => i.id === currentPage);
  const currentGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === currentPage));

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return <Dashboard onNavigate={onNavigate} />;
      case 'users':      return <UserManagement />;
      case 'profile':    return <MasjidProfileEditor />;
      case 'zone':       return <ZonePage />;
      case 'appearance': return <AppearanceSettings />;
      case 'slider':     return <SliderManager />;
      case 'audio':      return <AudioLibraryManager />;
      case 'playlist':   return <PlaylistManager />;
      case 'gdrive':     return <GoogleDriveImporter />;
      case 'ticker':     return <TickerManager />;
      case 'hadith':     return <HadithManager />;
      case 'blast':      return <BlastNotification />;
      case 'features':   return <FeatureToggle />;
      default:           return <Dashboard onNavigate={onNavigate} />;
    }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background:
        'radial-gradient(circle at 10% 15%, #ffe4d8 0 18%, transparent 36%),' +
        'radial-gradient(circle at 78% 5%, #0b74db 0 19%, transparent 40%),' +
        'linear-gradient(135deg, #eef3ff 0%, #d8e6ff 45%, #e9ddff 100%)',
    }}>

      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <div style={{
          width: 240, flexShrink: 0,
          borderRight: '1px solid rgba(17,116,255,0.12)',
          boxShadow: '4px 0 40px rgba(17,50,140,0.08)',
          overflow: 'hidden',
        }}>
          <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} isMobile={false} onClose={() => {}} />
        </div>
      )}

      {/* ── Mobile drawer overlay ── */}
      {isMobile && sidebarOpen && (
        <div
          ref={overlayRef}
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(7,25,66,0.4)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* ── Mobile drawer ── */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: 270, zIndex: 201,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(.4,0,.2,1)',
          borderRight: '1px solid rgba(17,116,255,0.12)',
          boxShadow: '8px 0 40px rgba(17,50,140,0.15)',
          overflow: 'hidden',
        }}>
          <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} isMobile onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          height: 56, flexShrink: 0,
          padding: '0 16px',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(32px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
          borderBottom: '1px solid rgba(17,116,255,0.1)',
          boxShadow: '0 2px 20px rgba(17,50,140,0.06)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(v => !v)}
              style={{
                background: 'rgba(17,116,255,0.08)', border: 'none',
                borderRadius: 10, padding: '7px', cursor: 'pointer',
                color: '#1174ff', display: 'flex', alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Menu size={18} />
            </button>
          )}

          {/* Breadcrumb */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', minWidth: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(63,86,141,0.55)', whiteSpace: 'nowrap' }}>CMS</span>
            {currentGroup?.label && (
              <>
                <ChevronRight size={12} style={{ color: 'rgba(63,86,141,0.4)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'rgba(63,86,141,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentGroup.label}
                </span>
              </>
            )}
            <ChevronRight size={12} style={{ color: 'rgba(63,86,141,0.4)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1174ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentItem?.label || 'Dashboard'}
            </span>
          </div>

          {/* ── Right toolbar ── */}
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>

            {/* Pratonton InfoTV */}
            <button
              onClick={() => window.open('/', '_blank')}
              title="Pratonton InfoTV"
              style={{
                display:'flex', alignItems:'center', gap:isMobile?0:6,
                height:34, padding: isMobile ? '0 10px' : '0 14px',
                borderRadius:10,
                background:'linear-gradient(135deg,rgba(17,116,255,0.12),rgba(117,71,255,0.08))',
                border:'1px solid rgba(17,116,255,0.2)',
                color:'#1174ff', fontSize:'0.78rem', fontWeight:700,
                cursor:'pointer', whiteSpace:'nowrap',
                boxShadow:'0 2px 8px rgba(17,116,255,0.1)',
                transition:'all 0.18s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 18px rgba(17,116,255,0.2)';e.currentTarget.style.transform='translateY(-1px)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 8px rgba(17,116,255,0.1)';e.currentTarget.style.transform='none';}}
            >
              <Monitor size={14}/>
              {!isMobile && <span>Pratonton</span>}
            </button>

            {/* Divider */}
            <div style={{ width:1, height:22, background:'rgba(17,116,255,0.12)', flexShrink:0 }}/>

            {/* User avatar + logout */}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {/* Avatar chip */}
              <div style={{
                height:34, padding:'0 10px',
                display:'flex', alignItems:'center', gap:7,
                background:'rgba(255,255,255,0.6)',
                border:'1px solid rgba(17,116,255,0.12)',
                borderRadius:10,
              }}>
                <div style={{
                  width:22, height:22, borderRadius:7, flexShrink:0,
                  background:'linear-gradient(135deg,#1174ff,#7547ff)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'white', fontWeight:800, fontSize:'0.6rem',
                }}>
                  A
                </div>
                {!isMobile && (
                  <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#0f1f4a', whiteSpace:'nowrap', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis' }}>
                    Admin
                  </span>
                )}
              </div>

              {/* Logout icon-button */}
              <button
                onClick={onLogout}
                title="Log Keluar"
                style={{
                  width:34, height:34, borderRadius:10,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:'rgba(220,38,38,0.07)',
                  border:'1px solid rgba(220,38,38,0.15)',
                  color:'#dc2626', cursor:'pointer',
                  transition:'all 0.18s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(220,38,38,0.14)';e.currentTarget.style.transform='scale(1.05)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(220,38,38,0.07)';e.currentTarget.style.transform='none';}}
              >
                <LogOut size={14}/>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: isMobile ? '20px 16px' : '28px 28px',
        }}>
          {/* Page title */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              fontWeight: 800, color: '#0f1f4a', margin: 0,
              letterSpacing: '-0.02em',
            }}>
              {currentItem?.label || 'Dashboard'}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'rgba(63,86,141,0.6)', margin: '4px 0 0' }}>
              {currentGroup?.label ? `${currentGroup.label} · ` : ''}{currentItem?.label || 'Dashboard'}
            </p>
          </div>

          {renderPage()}
        </div>
      </div>
    </div>
  );
}
