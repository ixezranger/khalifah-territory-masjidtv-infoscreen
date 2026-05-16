import { isDemoMode } from '../../lib/supabase';

export default function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99999,
      background: 'rgba(201,168,76,0.15)',
      borderBottom: '1px solid rgba(201,168,76,0.4)',
      padding: '6px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      fontSize: '0.75rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: '#C9A84C',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      height: '32px',
      boxSizing: 'border-box',
    }}>
      <span>🔔</span>
      <span>
        <strong>Demo Mode</strong> — Supabase & Cloudflare R2 belum dikonfigurasi.
        Data adalah contoh sahaja.
      </span>
      <a
        href="https://github.com/ixezranger/khalifah-territory-masjidtv-infoscreen#-setup"
        target="_blank"
        rel="noreferrer"
        style={{ color: '#C9A84C', textDecoration: 'underline', marginLeft: '8px' }}
      >
        Setup Guide →
      </a>
    </div>
  );
}
