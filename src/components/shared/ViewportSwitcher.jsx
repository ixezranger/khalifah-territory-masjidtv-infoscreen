import { useState, useEffect, useRef } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

const VIEWS = [
  { id: 'tv',     Icon: Monitor,    title: 'TV 1920×1080',  label: 'TV' },
  { id: 'tablet', Icon: Tablet,     title: 'Tablet 1024px', label: 'Tablet' },
  { id: 'mobile', Icon: Smartphone, title: 'Mobile 390px',  label: 'Mobile' },
];

export default function ViewportSwitcher({ currentView, onViewChange }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  const active = VIEWS.find(v => v.id === currentView) || VIEWS[0];

  useEffect(() => {
    if (!expanded) return;
    const h = e => { if (!ref.current?.contains(e.target)) setExpanded(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [expanded]);

  return (
    <div ref={ref} style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9000,
    }}>
      {/* Expanded panel */}
      {expanded && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', right: 0,
          background: 'rgba(246,249,255,0.97)',
          backdropFilter: 'blur(32px) saturate(1.6)',
          border: '1px solid rgba(17,116,255,0.18)',
          borderRadius: 16,
          boxShadow: '0 16px 48px rgba(17,50,140,0.18)',
          overflow: 'hidden',
          minWidth: 160,
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(17,116,255,0.08)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(63,86,141,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Mod Paparan
            </span>
          </div>
          {VIEWS.map(({ id, Icon, title, label }) => {
            const isActive = currentView === id;
            return (
              <button key={id} onClick={() => { onViewChange(id); setExpanded(false); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: isActive ? 'rgba(17,116,255,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid #1174ff' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(17,116,255,0.04)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'rgba(17,116,255,0.12)' : 'rgba(63,86,141,0.06)',
                  border: isActive ? '1px solid rgba(17,116,255,0.25)' : '1px solid rgba(63,86,141,0.1)',
                }}>
                  <Icon size={14} color={isActive ? '#1174ff' : '#3f568d'} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#1174ff' : '#0f1f4a' }}>{label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(63,86,141,0.5)' }}>{title}</div>
                </div>
                {isActive && (
                  <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#1174ff', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Collapsed FAB */}
      <button
        onClick={() => setExpanded(v => !v)}
        title={`${active.title} — klik untuk tukar`}
        style={{
          width: 44, height: 44, borderRadius: 14,
          background: expanded
            ? 'linear-gradient(135deg,#1174ff,#7547ff)'
            : 'rgba(246,249,255,0.92)',
          backdropFilter: 'blur(20px)',
          border: expanded ? 'none' : '1px solid rgba(17,116,255,0.2)',
          boxShadow: expanded
            ? '0 8px 24px rgba(17,116,255,0.35)'
            : '0 4px 16px rgba(17,50,140,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: expanded ? 'white' : '#1174ff',
          transition: 'all 0.22s cubic-bezier(.34,1.56,.64,1)',
          transform: expanded ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <active.Icon size={18} />
      </button>
    </div>
  );
}
