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
        top: 12,
        right: 12,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 10px',
        borderRadius: 20,
        background: 'rgba(201,168,76,0.15)',
        border: '1px solid rgba(201,168,76,0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#C9A84C',
        fontSize: '0.7rem',
        fontWeight: 600,
        textDecoration: 'none',
        letterSpacing: '0.03em',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.15)'; }}
    >
      <span style={{ fontSize: '0.85rem' }}>⚙️</span>
      <span>Setup</span>
    </a>
  );
}
