const VIEWS = [
  { id: 'tv', label: '📺 TV' },
  { id: 'tablet', label: '📱 Tablet' },
  { id: 'mobile', label: '📲 Mobile' },
];

export default function ViewportSwitcher({ currentView, onViewChange }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        zIndex: 1000,
      }}
    >
      {VIEWS.map(({ id, label }) => {
        const isActive = currentView === id;
        return (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            style={{
              fontSize: '12px',
              borderRadius: '9999px',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '6px',
              paddingBottom: '6px',
              border: `1px solid ${isActive ? '#C9A84C' : 'rgba(201,168,76,0.25)'}`,
              background: isActive
                ? '#C9A84C'
                : 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              color: isActive ? '#050E1A' : '#C9A84C',
              cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: isActive ? 600 : 400,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
