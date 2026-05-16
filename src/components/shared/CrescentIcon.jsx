export default function CrescentIcon({ size = 32, color = 'var(--ms-blue)', animated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={animated ? { animation: 'spin 30s linear infinite' } : {}}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12c1.47 0 2.877-.267 4.18-.753C17.237 26.108 14 21.964 14 17c0-4.964 3.237-9.108 6.18-10.247A11.946 11.946 0 0016 4z"
        fill={color}
        opacity="0.9"
      />
      <polygon
        points="22,5 23,8 26,8 23.5,10 24.5,13 22,11 19.5,13 20.5,10 18,8 21,8"
        fill={color}
        opacity="0.8"
      />
    </svg>
  );
}
