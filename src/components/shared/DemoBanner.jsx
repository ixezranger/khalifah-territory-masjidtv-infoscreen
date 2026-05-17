import { isDemoMode } from '../../lib/supabase';

export default function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      background: 'rgba(17,116,255,0.1)',
      borderBottom: '1px solid rgba(17,116,255,0.25)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      padding: '5px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      fontSize: '0.75rem', color: '#1174ff', height: 32,
    }}>
      <span>🔔</span>
      <span><strong>Demo Mode</strong> — Supabase belum dikonfigurasi. Data adalah contoh sahaja.</span>
      <a
        href="https://github.com/ixezranger/khalifah-territory-masjidtv-infoscreen#setup"
        target="_blank" rel="noreferrer"
        style={{ color: '#1174ff', textDecoration: 'underline', marginLeft: 8 }}
      >
        Setup Guide →
      </a>
    </div>
  );
}
