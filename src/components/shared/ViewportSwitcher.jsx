const VIEWS = [
  { id: 'tv', icon: '📺', title: 'TV 1920×1080' },
  { id: 'tablet', icon: '⬜', title: 'Tablet 1024px' },
  { id: 'mobile', icon: '📱', title: 'Mobile 390px' },
];

export default function ViewportSwitcher({ currentView, onViewChange }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9000,
      display: 'flex', gap: 4,
      background: 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(17,116,255,0.2)',
      borderRadius: 20, padding: '4px',
      boxShadow: '0 4px 20px rgba(18,40,91,0.12)',
    }}>
      {VIEWS.map(({ id, icon, title }) => (
        <button key={id} title={title} onClick={() => onViewChange(id)} style={{
          width: 36, height: 28, borderRadius: 14, border: 'none',
          background: currentView === id ? 'linear-gradient(135deg,#1174ff,#7547ff)' : 'transparent',
          color: currentView === id ? '#fff' : '#3f568d',
          fontSize: '0.85rem', cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</button>
      ))}
    </div>
  );
}
