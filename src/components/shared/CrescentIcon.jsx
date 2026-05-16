const ROTATION_STYLE = {
  animation: 'crescentSpin 30s linear infinite',
};

// Inject keyframe once
if (typeof document !== 'undefined') {
  const id = '__crescent_keyframe__';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = '@keyframes crescentSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
}

export default function CrescentIcon({ size = 32, color = '#C9A84C', animated = false }) {
  const r = size / 2;
  // Crescent: outer circle minus offset inner circle (clip-path approach via SVG mask)
  const outerR = r * 0.82;
  const innerR = r * 0.65;
  const offsetX = r * 0.22;

  // 5-point star at top-right of crescent
  const starCx = r + outerR * 0.55;
  const starCy = r - outerR * 0.6;
  const starOuter = r * 0.18;
  const starInner = r * 0.075;

  function starPoints(cx, cy, outer, inner) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? outer : inner;
      pts.push(`${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`);
    }
    return pts.join(' ');
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={animated ? ROTATION_STYLE : undefined}
    >
      <defs>
        <mask id={`crescent-mask-${size}`}>
          <circle cx={r} cy={r} r={outerR} fill="white" />
          <circle cx={r + offsetX} cy={r - r * 0.08} r={innerR} fill="black" />
        </mask>
      </defs>
      {/* Crescent body */}
      <circle
        cx={r}
        cy={r}
        r={outerR}
        fill={color}
        mask={`url(#crescent-mask-${size})`}
      />
      {/* 5-point star */}
      <polygon
        points={starPoints(starCx, starCy, starOuter, starInner)}
        fill={color}
      />
    </svg>
  );
}
