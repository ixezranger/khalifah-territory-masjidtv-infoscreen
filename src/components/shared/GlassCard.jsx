export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  style = {},
  onClick,
  padding = '20px',
}) {
  const variants = {
    default: {
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(26px)',
      WebkitBackdropFilter: 'blur(26px)',
      border: '1px solid rgba(255,255,255,0.7)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 8px 32px rgba(18,40,91,0.1)',
    },
    active: {
      background: 'linear-gradient(135deg, rgba(17,116,255,0.12), rgba(117,71,255,0.08))',
      backdropFilter: 'blur(26px)',
      WebkitBackdropFilter: 'blur(26px)',
      border: '1px solid rgba(17,116,255,0.35)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 0 24px rgba(17,116,255,0.2)',
    },
    blue: {
      background: 'linear-gradient(135deg, rgba(17,116,255,0.1), rgba(17,116,255,0.04))',
      backdropFilter: 'blur(26px)',
      WebkitBackdropFilter: 'blur(26px)',
      border: '1px solid rgba(17,116,255,0.25)',
      borderRadius: 'var(--radius-lg)',
    },
    dark: {
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(26px)',
      WebkitBackdropFilter: 'blur(26px)',
      border: '1px solid rgba(17,116,255,0.15)',
      borderRadius: 'var(--radius-lg)',
    },
    purple: {
      background: 'linear-gradient(135deg, rgba(117,71,255,0.1), rgba(117,71,255,0.04))',
      backdropFilter: 'blur(26px)',
      WebkitBackdropFilter: 'blur(26px)',
      border: '1px solid rgba(117,71,255,0.3)',
      borderRadius: 'var(--radius-lg)',
    },
  };

  return (
    <div
      onClick={onClick}
      style={{
        ...(variants[variant] || variants.default),
        padding,
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}
