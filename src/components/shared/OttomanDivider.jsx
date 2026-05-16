const SIZE_MAP = {
  sm: { lineHeight: '1px', textSize: '12px' },
  md: { lineHeight: '1px', textSize: '14px' },
  lg: { lineHeight: '2px', textSize: '16px' },
};

export default function OttomanDivider({ label, size = 'md' }) {
  const { lineHeight, textSize } = SIZE_MAP[size] || SIZE_MAP.md;

  const line = (
    <div
      style={{
        flex: 1,
        height: lineHeight,
        background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5), transparent)',
      }}
    />
  );

  const center = label ? (
    <span
      style={{
        color: '#C9A84C',
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: textSize,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        whiteSpace: 'nowrap',
        padding: '0 12px',
      }}
    >
      {label}
    </span>
  ) : (
    <span
      style={{
        color: '#C9A84C',
        fontSize: textSize,
        padding: '0 8px',
        lineHeight: 1,
      }}
    >
      ✦
    </span>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {line}
      {center}
      {line}
    </div>
  );
}
