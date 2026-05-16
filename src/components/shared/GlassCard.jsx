const VARIANTS = {
  default: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(201,168,76,0.25)',
    borderRadius: '16px',
  },
  active: {
    background: 'rgba(201,168,76,0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(201,168,76,0.5)',
    borderRadius: '16px',
    animation: 'glowPulse 2s ease-in-out infinite',
  },
  dark: {
    background: 'rgba(5,14,26,0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(201,168,76,0.15)',
    borderRadius: '16px',
  },
};

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  style = {},
  onClick,
}) {
  const base = VARIANTS[variant] || VARIANTS.default;

  return (
    <div
      className={className}
      style={{ padding: '24px', ...base, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
