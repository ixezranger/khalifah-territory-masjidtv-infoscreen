import { useState, useRef, useEffect } from 'react';
import { ZONES } from '../../hooks/useWaktuSolat';

const COUNTRIES = {
  MY: {
    label: 'Malaysia',
    flag: '🇲🇾',
    zones: ZONES,
  },
};

export default function ZoneSelectorPanel({ currentZone, onZoneChange }) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('MY');
  const [expandedState, setExpandedState] = useState(null);
  const panelRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Auto-expand the state that owns currentZone when panel opens
  useEffect(() => {
    if (!open) return;
    const country = COUNTRIES[selectedCountry];
    for (const [state, zones] of Object.entries(country.zones)) {
      if (Object.keys(zones).includes(currentZone)) {
        setExpandedState(state);
        break;
      }
    }
  }, [open, currentZone, selectedCountry]);

  const currentCountry = COUNTRIES[selectedCountry];

  // Find display label for current zone
  let currentZoneLabel = currentZone;
  for (const zones of Object.values(ZONES)) {
    if (zones[currentZone]) {
      currentZoneLabel = zones[currentZone].split(',')[0].trim();
      break;
    }
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Tukar Zon Waktu Solat"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: open ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: '8px',
          padding: '4px 10px',
          cursor: 'pointer',
          color: '#C9A84C',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.72rem',
          letterSpacing: '0.04em',
          transition: 'background 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Globe icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentZone} · {currentZoneLabel}
        </span>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '320px',
          maxHeight: '480px',
          overflowY: 'auto',
          background: 'rgba(5,14,26,0.97)',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: '12px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
          zIndex: 9999,
          backdropFilter: 'blur(20px)',
        }}>

          {/* Panel header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(201,168,76,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#C9A84C',
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
            }}>
              Pilih Zon Waktu Solat
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(201,168,76,0.6)', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          {/* Country tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            padding: '10px 12px 6px',
            borderBottom: '1px solid rgba(201,168,76,0.1)',
          }}>
            {Object.entries(COUNTRIES).map(([code, info]) => (
              <button
                key={code}
                onClick={() => { setSelectedCountry(code); setExpandedState(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: selectedCountry === code
                    ? '1px solid rgba(201,168,76,0.6)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: selectedCountry === code ? 'rgba(201,168,76,0.14)' : 'transparent',
                  color: selectedCountry === code ? '#C9A84C' : 'rgba(245,237,214,0.5)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span>{info.flag}</span>
                <span>{info.label}</span>
              </button>
            ))}
            {/* Placeholder for future countries */}
            <span style={{
              padding: '4px 8px',
              fontSize: '0.7rem',
              color: 'rgba(245,237,214,0.25)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              alignSelf: 'center',
            }}>
              + akan datang
            </span>
          </div>

          {/* State + Zone list */}
          <div style={{ padding: '8px 0' }}>
            {Object.entries(currentCountry.zones).map(([state, zones]) => {
              const isExpanded = expandedState === state;
              const hasActive = Object.keys(zones).includes(currentZone);

              return (
                <div key={state}>
                  {/* State header */}
                  <button
                    onClick={() => setExpandedState(isExpanded ? null : state)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '7px 16px',
                      background: hasActive ? 'rgba(201,168,76,0.06)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: hasActive ? '#C9A84C' : 'rgba(245,237,214,0.7)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.8rem',
                      fontWeight: hasActive ? 600 : 400,
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span>{state}</span>
                    <span style={{
                      fontSize: '0.65rem',
                      color: 'rgba(201,168,76,0.5)',
                      marginLeft: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      {hasActive && (
                        <span style={{
                          background: 'rgba(201,168,76,0.2)',
                          border: '1px solid rgba(201,168,76,0.4)',
                          borderRadius: '4px',
                          padding: '1px 5px',
                          color: '#C9A84C',
                          fontSize: '0.6rem',
                        }}>
                          Aktif
                        </span>
                      )}
                      <svg
                        width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  {/* Zone options */}
                  {isExpanded && (
                    <div style={{ background: 'rgba(0,0,0,0.2)' }}>
                      {Object.entries(zones).map(([code, label]) => {
                        const isActive = code === currentZone;
                        return (
                          <button
                            key={code}
                            onClick={() => { onZoneChange(code); setOpen(false); }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              padding: '8px 24px',
                              background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
                              border: 'none',
                              borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.15s',
                            }}
                          >
                            <span style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: '0.72rem',
                              color: isActive ? '#C9A84C' : 'rgba(201,168,76,0.7)',
                              fontWeight: 700,
                              minWidth: '48px',
                              flexShrink: 0,
                              paddingTop: '1px',
                            }}>
                              {code}
                            </span>
                            <span style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: '0.72rem',
                              color: isActive ? '#F5EDD6' : 'rgba(245,237,214,0.55)',
                              lineHeight: '1.4',
                            }}>
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid rgba(201,168,76,0.1)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.65rem',
            color: 'rgba(245,237,214,0.3)',
            textAlign: 'center',
          }}>
            Data waktu solat dari e-Solat JAKIM
          </div>
        </div>
      )}
    </div>
  );
}
