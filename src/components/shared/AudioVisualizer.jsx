export default function AudioVisualizer({
  isPlaying = false,
  barCount = 16,
  color = 'var(--ms-blue)',
  height = 20,
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: '2px',
      height: `${height}px`,
    }}>
      {Array.from({ length: barCount }, (_, i) => {
        const animDuration = `${0.6 + (i % 3) * 0.2}s`;
        const animDelay = `${i * 0.06}s`;
        return (
          <div
            key={i}
            style={{
              width: '3px',
              borderRadius: '2px',
              background: color,
              flex: '0 0 3px',
              height: '100%',
              transformOrigin: 'bottom center',
              transform: isPlaying ? undefined : 'scaleY(0.2)',
              animation: isPlaying
                ? `visualizerBar ${animDuration} ease-in-out ${animDelay} infinite`
                : 'none',
              transition: 'transform 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
}
