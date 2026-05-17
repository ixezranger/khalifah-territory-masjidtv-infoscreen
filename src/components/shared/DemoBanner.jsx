import { isDemoMode } from '../../lib/supabase';

export default function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <a
      href="https://github.com/ixezranger/khalifah-territory-masjidtv-infoscreen#setup"
      target="_blank"
      rel="noreferrer"
      title="Demo Mode — Supabase belum dikonfigurasi. Klik untuk Setup Guide."
      style={{
        position: 'fixed',
        top: '12px',
        right: '12px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 8px',
        borderRadius: '20px',
        background: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.75)',
        fontSize: '0.7rem',
        fontWeight: 600,
        textDecoration: 'none',
        letterSpacing: '0.03em',
        cursor: 'pointer',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,1)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
    >
      <span style={{ fontSize: '0.85rem' }}>⚙️</span>
      <span>Setup</span>
    </a>
  );
}
