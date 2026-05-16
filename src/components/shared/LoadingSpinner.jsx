import CrescentIcon from './CrescentIcon';

const SIZE_MAP = { sm: 24, md: 40, lg: 56 };

// Inject spin keyframe once
if (typeof document !== 'undefined') {
  const id = '__spinner_keyframe__';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = '@keyframes spinnerRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
}

export default function LoadingSpinner({ size = 'md', text }) {
  const iconSize = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      <div style={{ animation: 'spinnerRotate 1.5s linear infinite' }}>
        <CrescentIcon size={iconSize} color="#C9A84C" animated={false} />
      </div>
      {text && (
        <span
          style={{
            color: '#C9A84C',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}
