export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-navy)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cinzel Decorative', color: 'var(--color-gold)',
          fontSize: '2rem', marginBottom: '16px' }}>
          🔐 Login
        </h1>
        <p style={{ color: 'var(--color-ivory)' }}>Auth — coming in Prompt 9</p>
      </div>
    </div>
  );
}
