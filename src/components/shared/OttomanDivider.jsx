export default function OttomanDivider({ label, size = 'md' }) {
  const heights = { sm: '1px', md: '1px', lg: '2px' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12,
      margin: size === 'sm' ? '8px 0' : '16px 0' }}>
      <div style={{
        flex: 1, height: heights[size] || '1px',
        background: 'linear-gradient(to right, transparent, var(--glass-border), transparent)',
      }} />
      {label ? (
        <span style={{
          fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}>{label}</span>
      ) : (
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--ms-blue)', opacity: 0.6,
        }} />
      )}
      <div style={{
        flex: 1, height: heights[size] || '1px',
        background: 'linear-gradient(to left, transparent, var(--glass-border), transparent)',
      }} />
    </div>
  );
}
