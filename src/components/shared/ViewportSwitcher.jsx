import { useState, useEffect, useRef } from 'react';

const VIEWS = [
  { id: 'tv',     icon: '📺', title: 'TV 1920×1080' },
  { id: 'tablet', icon: '⬜', title: 'Tablet 1024px' },
  { id: 'mobile', icon: '📱', title: 'Mobile 390px' },
];

export default function ViewportSwitcher({ currentView, onViewChange }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  const active = VIEWS.find(v => v.id === currentView) || VIEWS[0];

  // Collapse on outside click
  useEffect(() => {
    if (!expanded) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setExpanded(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  const handleSelect = (id) => {
    onViewChange(id);
    setExpanded(false);
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9000,
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(17,116,255,0.2)',
        borderRadius: 20,
        padding: '4px',
        boxShadow: '0 4px 20px rgba(18,40,91,0.12)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        // Animate width between collapsed (single btn) and expanded (3 btns)
        width: expanded ? `${VIEWS.length * 44 + 8}px` : '44px',
        transition: 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        whiteSpace: 'nowrap',
      }}
    >
      {expanded ? (
        // All 3 buttons visible
        VIEWS.map(({ id, icon, title }) => (
          <button
            key={id}
            title={title}
            onClick={() => handleSelect(id)}
            style={{
              width: 36, height: 28, borderRadius: 14, border: 'none',
              background: currentView === id
                ? 'linear-gradient(135deg,#1174ff,#7547ff)'
                : 'transparent',
              color: currentView === id ? '#fff' : '#3f568d',
              fontSize: '0.85rem', cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </button>
        ))
      ) : (
        // Collapsed — single button showing active device
        <button
          title={`${active.title} — click to switch`}
          onClick={() => setExpanded(true)}
          style={{
            width: 36, height: 28, borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg,#1174ff,#7547ff)',
            color: '#fff',
            fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 2, flexShrink: 0,
          }}
        >
          {active.icon}
        </button>
      )}
    </div>
  );
}
