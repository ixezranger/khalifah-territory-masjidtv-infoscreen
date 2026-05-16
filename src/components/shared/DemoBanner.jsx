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
      background: 'rgba(0,120,212,0.12)',
      borderBottom: '1px solid rgba(0,120,212,0.3)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '32px',
      boxSizing: 'border-box',
      fontSize: '0.75rem',
      fontFamily: "'Segoe UI', 'Plus Jakarta Sans', sans-serif",
    }}>
      <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--ms-blue)', fontSize: '14px' }}>ℹ</span>
        Demo Mode — Supabase belum dikonfigurasi
      </span>
      <a
        href="https://github.com/ixezranger/khalifah-territory-masjidtv-infoscreen#-setup"
        target="_blank"
        rel="noreferrer"
        style={{ color: 'var(--ms-blue)', textDecoration: 'none', fontSize: '0.75rem' }}
      >
        Setup Guide →
      </a>
    </div>
  );
}
