export default function AudioVisualizer({
  isPlaying = false,
  barCount = 12,
  color = '#C9A84C',
  height = 32,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: '2px',
        height: `${height}px`,
      }}
    >
      {Array.from({ length: barCount }, (_, i) => {
        const animDuration = `${0.6 + (i % 3) * 0.2}s`;
        const animDelay = `${i * 0.1}s`;

        return (
          <div
            key={i}
            style={{
              width: '3px',
              borderRadius: '2px',
              background: color,
              height: isPlaying ? '100%' : `${height * 0.2}px`,
              animation: isPlaying
                ? `visualizerBar ${animDuration} ease-in-out ${animDelay} infinite`
                : 'none',
              transition: 'height 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
}
