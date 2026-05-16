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
      background: 'var(--bg-card)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
    },
    active: {
      background: 'var(--gradient-active)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border-active)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-active)',
      animation: 'msGlowPulse 3s ease-in-out infinite',
    },
    blue: {
      background: 'linear-gradient(135deg, rgba(0,120,212,0.15), rgba(0,120,212,0.05))',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border-blue)',
      borderRadius: 'var(--radius-lg)',
    },
    dark: {
      background: 'rgba(15,17,23,0.8)',
      backdropFilter: 'var(--glass-blur-heavy)',
      WebkitBackdropFilter: 'var(--glass-blur-heavy)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-lg)',
    },
    purple: {
      background: 'linear-gradient(135deg, rgba(119,25,170,0.15), rgba(119,25,170,0.05))',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid rgba(119,25,170,0.4)',
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
