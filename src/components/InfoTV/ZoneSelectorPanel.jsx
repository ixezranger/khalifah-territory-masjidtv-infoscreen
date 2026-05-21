import { useState, useRef, useEffect } from 'react';
import { ZONES } from '../../hooks/useWaktuSolat';

const COUNTRIES = {
  MY: { label: 'Malaysia', flag: '🇲🇾', zones: ZONES },
};

export default function ZoneSelectorPanel({ currentZone, onZoneChange }) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('MY');
  const [expandedState, setExpandedState] = useState(null);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Auto-expand state that owns currentZone
  useEffect(() => {
    if (!open) return;
    for (const [state, zones] of Object.entries(COUNTRIES[selectedCountry].zones)) {
      if (Object.keys(zones).includes(currentZone)) { setExpandedState(state); break; }
    }
  }, [open, currentZone, selectedCountry]);

  // Short label for button
  let shortLabel = currentZone;
  for (const zones of Object.values(ZONES)) {
    if (zones[currentZone]) { shortLabel = zones[currentZone].split(',')[0].trim(); break; }
  }

  const country = COUNTRIES[selectedCountry];

  return (
    <div ref={panelRef} style={{ position: 'absolute', top: '50%', right: '1.2vw', transform: 'translateY(-50%)', zIndex: 9999 }}>

      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Tukar Zon Waktu Solat"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20,
          background: open ? 'rgba(13,134,255,.15)' : 'rgba(255,255,255,.55)',
          border: `1px solid ${open ? 'rgba(13,134,255,.4)' : 'rgba(54,78,135,.22)'}`,
          backdropFilter: 'blur(12px)',
          cursor: 'pointer', color: open ? '#0d86ff' : '#1a2b5f',
          fontFamily: 'inherit', fontSize: 'clamp(11px,.75vw,14px)',
          fontWeight: 600, whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,.08)',
          transition: 'all .2s',
        }}
      >
        {/* Globe SVG */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span>{currentZone}</span>
        <span style={{ color: open ? '#0d86ff' : '#5a7abf', fontWeight: 400, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          · {shortLabel}
        </span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 330, maxHeight: 480, overflowY: 'auto',
          background: 'rgba(245,248,255,.97)',
          border: '1px solid rgba(54,78,135,.18)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(17,50,140,.18)',
          backdropFilter: 'blur(24px)',
        }}>

          {/* Header */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid rgba(54,78,135,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#0f1f4a', letterSpacing: '.01em' }}>
              Pilih Zon Waktu Solat
            </span>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a7abf', fontSize: 14, lineHeight: 1 }}>
              ✕
            </button>
          </div>

          {/* Country tabs */}
          <div style={{ display: 'flex', gap: 6, padding: '8px 12px 4px', borderBottom: '1px solid rgba(54,78,135,.08)' }}>
            {Object.entries(COUNTRIES).map(([code, info]) => (
              <button key={code}
                onClick={() => { setSelectedCountry(code); setExpandedState(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 8,
                  border: selectedCountry === code ? '1px solid rgba(13,134,255,.5)' : '1px solid rgba(54,78,135,.15)',
                  background: selectedCountry === code ? 'rgba(13,134,255,.1)' : 'transparent',
                  color: selectedCountry === code ? '#0d86ff' : '#7a90bb',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                }}>
                <span>{info.flag}</span><span>{info.label}</span>
              </button>
            ))}
            <span style={{ fontSize: 11, color: '#bcc8e0', alignSelf: 'center', marginLeft: 2 }}>+ akan datang</span>
          </div>

          {/* States & zones */}
          <div style={{ padding: '4px 0' }}>
            {Object.entries(country.zones).map(([state, zones]) => {
              const expanded = expandedState === state;
              const hasActive = Object.keys(zones).includes(currentZone);
              return (
                <div key={state}>
                  <button
                    onClick={() => setExpandedState(expanded ? null : state)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '7px 14px',
                      background: hasActive ? 'rgba(13,134,255,.06)' : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      color: hasActive ? '#0d86ff' : '#1a2b5f',
                      fontSize: 13, fontWeight: hasActive ? 700 : 500,
                      transition: 'background .15s',
                    }}>
                    <span>{state}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {hasActive && (
                        <span style={{
                          background: 'rgba(13,134,255,.12)', border: '1px solid rgba(13,134,255,.3)',
                          borderRadius: 4, padding: '1px 6px', color: '#0d86ff', fontSize: 10, fontWeight: 700,
                        }}>Aktif</span>
                      )}
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </span>
                  </button>

                  {expanded && (
                    <div style={{ background: 'rgba(245,248,255,.7)' }}>
                      {Object.entries(zones).map(([code, label]) => {
                        const active = code === currentZone;
                        return (
                          <button key={code}
                            onClick={() => { onZoneChange(code); setOpen(false); }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10,
                              padding: '7px 14px 7px 24px',
                              background: active ? 'rgba(13,134,255,.1)' : 'transparent',
                              borderLeft: active ? '2px solid #0d86ff' : '2px solid transparent',
                              border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                            }}>
                            <span style={{
                              fontSize: 11, fontWeight: 800, color: active ? '#0d86ff' : '#7a90bb',
                              minWidth: 48, flexShrink: 0, paddingTop: 1,
                            }}>{code}</span>
                            <span style={{
                              fontSize: 12, color: active ? '#1a2b5f' : '#7a90bb', lineHeight: 1.4,
                            }}>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 14px', borderTop: '1px solid rgba(54,78,135,.08)',
            fontSize: 10, color: '#b0bcd8', textAlign: 'center',
          }}>
            Data waktu solat dari e-Solat JAKIM
          </div>
        </div>
      )}
    </div>
  );
}
