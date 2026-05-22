/**
 * MasjidTV Admin — Shared Design System
 * Microsoft 365 glassmorphism tokens, all reusable primitives.
 */

/* ── Colour tokens ─────────────────────────────────────────────────────── */
export const C = {
  blue:     '#1174ff',
  violet:   '#7547ff',
  cyan:     '#0ea5e9',
  green:    '#10b981',
  amber:    '#f59e0b',
  red:      '#ef4444',
  purple:   '#8b5cf6',
  ink:      '#0f1f4a',
  muted:    '#3f568d',
  faint:    'rgba(63,86,141,0.45)',
  line:     'rgba(17,116,255,0.1)',
  glass:    'rgba(255,255,255,0.76)',
  glassBg:  'rgba(255,255,255,0.55)',
  shadow:   '0 4px 28px rgba(17,50,140,0.08)',
  shadowHover: '0 8px 36px rgba(17,50,140,0.14)',
};

/* ── Glass card ────────────────────────────────────────────────────────── */
export function Card({ title, icon: Icon, accent = C.blue, children, style, action }) {
  return (
    <div style={{
      background: C.glass,
      backdropFilter: 'blur(32px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
      border: '1px solid rgba(255,255,255,0.88)',
      borderRadius: 20,
      boxShadow: `${C.shadow}, 0 1px 0 rgba(255,255,255,0.8) inset`,
      marginBottom: 20,
      overflow: 'hidden',
      ...style,
    }}>
      {title && (
        <div style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icon && (
              <div style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg,${accent}22,${accent}11)`,
                border: `1px solid ${accent}33`,
              }}>
                <Icon size={14} color={accent} />
              </div>
            )}
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: C.ink }}>{title}</span>
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

/* ── Form field ────────────────────────────────────────────────────────── */
export function Field({ label, hint, required, children, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: '0.78rem', fontWeight: 700, color: C.muted,
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
        }}>
          {label}
          {required && <span style={{ color: C.red, fontSize: '0.7rem' }}>*</span>}
        </label>
      )}
      {hint && <p style={{ fontSize: '0.75rem', color: C.faint, margin: '0 0 6px' }}>{hint}</p>}
      {children}
    </div>
  );
}

/* ── Input / Textarea / Select ─────────────────────────────────────────── */
const baseInput = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(17,116,255,0.18)',
  color: C.ink,
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box',
};

export function Input({ style, ...props }) {
  return (
    <input
      {...props}
      className="ms-input"
      style={{ ...baseInput, ...style }}
    />
  );
}

export function Textarea({ style, ...props }) {
  return (
    <textarea
      {...props}
      className="ms-input"
      style={{ ...baseInput, resize: 'vertical', ...style }}
    />
  );
}

export function Select({ style, children, ...props }) {
  return (
    <select
      {...props}
      className="ms-input"
      style={{ ...baseInput, cursor: 'pointer', ...style }}
    >
      {children}
    </select>
  );
}

/* ── Buttons ───────────────────────────────────────────────────────────── */
export function Btn({ variant = 'primary', size = 'md', children, style, disabled, onClick, type = 'button' }) {
  const sizes = {
    sm: { padding: '6px 14px', fontSize: '0.78rem', borderRadius: 8 },
    md: { padding: '9px 20px', fontSize: '0.855rem', borderRadius: 10 },
    lg: { padding: '12px 28px', fontSize: '0.95rem', borderRadius: 12 },
  };
  const variants = {
    primary: {
      background: `linear-gradient(135deg,${C.blue},${C.violet})`,
      color: 'white', border: 'none',
      boxShadow: `0 4px 14px ${C.blue}33`,
    },
    secondary: {
      background: `${C.blue}0f`,
      color: C.blue,
      border: `1px solid ${C.blue}28`,
    },
    ghost: {
      background: 'rgba(255,255,255,0.5)',
      color: C.muted,
      border: '1px solid rgba(17,116,255,0.12)',
    },
    danger: {
      background: 'rgba(239,68,68,0.08)',
      color: C.red,
      border: '1px solid rgba(239,68,68,0.2)',
    },
    success: {
      background: 'rgba(16,185,129,0.08)',
      color: C.green,
      border: `1px solid ${C.green}33`,
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontFamily: 'inherit', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'opacity 0.15s, transform 0.1s, box-shadow 0.15s',
        whiteSpace: 'nowrap',
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'none'; }}
    >
      {children}
    </button>
  );
}

/* ── Toggle switch ─────────────────────────────────────────────────────── */
export function Toggle({ value, onChange, label, hint }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: `1px solid ${C.line}`,
    }}>
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: C.ink }}>{label}</div>
        {hint && <div style={{ fontSize: '0.75rem', color: C.faint, marginTop: 2 }}>{hint}</div>}
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0, marginLeft: 16,
          background: value ? `linear-gradient(135deg,${C.blue},${C.violet})` : 'rgba(63,86,141,0.15)',
          border: value ? 'none' : '1px solid rgba(63,86,141,0.2)',
          position: 'relative', transition: 'all 0.22s',
          boxShadow: value ? `0 2px 8px ${C.blue}44` : 'none',
        }}
      >
        <div style={{
          position: 'absolute', top: value ? 3 : 2,
          left: value ? 23 : 2,
          width: 18, height: 18, borderRadius: 9,
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'left 0.22s',
        }} />
      </div>
    </div>
  );
}

/* ── Badge ─────────────────────────────────────────────────────────────── */
export function Badge({ children, color = C.blue, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 20,
      fontSize: '0.72rem', fontWeight: 700,
      color, background: bg || `${color}18`,
      border: `1px solid ${color}28`,
    }}>
      {children}
    </span>
  );
}

/* ── Status / alert banner ─────────────────────────────────────────────── */
export function Alert({ type = 'info', children }) {
  const map = {
    success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', color: '#059669' },
    error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  color: C.red    },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', color: '#d97706' },
    info:    { bg: `${C.blue}0f`,           border: `${C.blue}28`,           color: C.blue   },
  };
  const s = map[type];
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10, marginBottom: 14,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: '0.835rem', fontWeight: 500,
    }}>
      {children}
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────────────────── */
export function Empty({ icon = '📭', text = 'Tiada data', sub }) {
  return (
    <div style={{
      textAlign: 'center', padding: '36px 0',
      color: C.faint, fontSize: '0.855rem',
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 600, color: C.muted }}>{text}</div>
      {sub && <div style={{ fontSize: '0.78rem', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ── Tab bar ───────────────────────────────────────────────────────────── */
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 3, marginBottom: 18,
      background: 'rgba(17,116,255,0.05)',
      border: '1px solid rgba(17,116,255,0.1)',
      borderRadius: 12, padding: 4,
      width: 'fit-content',
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
              background: isActive ? 'white' : 'transparent',
              color: isActive ? C.blue : C.muted,
              boxShadow: isActive ? `0 2px 8px ${C.blue}20` : 'none',
              transition: 'all 0.15s',
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Row (flex list item) ──────────────────────────────────────────────── */
export function Row({ children, last, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 0',
      borderBottom: last ? 'none' : `1px solid ${C.line}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Drag handle ───────────────────────────────────────────────────────── */
export function DragHandle() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" style={{ cursor: 'grab', flexShrink: 0, opacity: 0.35 }}>
      <circle cx="4" cy="4" r="1.5" fill={C.muted}/>
      <circle cx="10" cy="4" r="1.5" fill={C.muted}/>
      <circle cx="4" cy="10" r="1.5" fill={C.muted}/>
      <circle cx="10" cy="10" r="1.5" fill={C.muted}/>
      <circle cx="4" cy="16" r="1.5" fill={C.muted}/>
      <circle cx="10" cy="16" r="1.5" fill={C.muted}/>
    </svg>
  );
}

/* ── Thumbnail box ─────────────────────────────────────────────────────── */
export function Thumb({ src, icon = '🖼', w = 56, h = 40 }) {
  return src ? (
    <img src={src} alt="" style={{ width: w, height: h, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: `1px solid ${C.line}` }} />
  ) : (
    <div style={{
      width: w, height: h, borderRadius: 8, flexShrink: 0,
      background: 'rgba(17,116,255,0.06)', border: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: h * 0.45,
    }}>{icon}</div>
  );
}

/* ── Section divider ───────────────────────────────────────────────────── */
export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
      <div style={{ flex: 1, height: 1, background: C.line }} />
      {label && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: C.line }} />
    </div>
  );
}

/* ── Page max-width wrapper ────────────────────────────────────────────── */
export function PageWrap({ children, maxWidth = 720 }) {
  return <div style={{ maxWidth, width: '100%' }}>{children}</div>;
}
