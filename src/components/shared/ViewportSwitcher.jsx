const VIEWS = [
  { id: 'tv', icon: '📺', title: 'TV Mode' },
  { id: 'tablet', icon: '⬜', title: 'Tablet Mode' },
  { id: 'mobile', icon: '📱', title: 'Mobile Mode' },
];

export default function ViewportSwitcher({ currentView, onViewChange }) {
  return (
    <div style={{
      position: 'fixed',
      right: 20,
      bottom: 20,
      zIndex: 1000,
      background: 'rgba(15,17,23,0.8)',
      backdropFilter: 'var(--glass-blur-heavy)',
      WebkitBackdropFilter: 'var(--glass-blur-heavy)',
      border: '1px solid var(--glass-border)',
      borderRadius: 20,
      padding: '6px',
      display: 'flex',
      flexDirection: 'row',
      gap: 2,
    }}>
      {VIEWS.map(({ id, icon, title }) => {
        const isActive = currentView === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            title={title}
            style={{
              width: 36,
              height: 28,
              borderRadius: 14,
              border: 'none',
              background: isActive ? 'var(--ms-blue)' : 'transparent',
              color: isActive ? 'white' : 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
