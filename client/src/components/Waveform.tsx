interface WaveformProps {
  size?: 'sm' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
}

export default function Waveform({ size = 'sm', color = 'primary' }: WaveformProps) {
  // Generate pseudo-random waveform heights
  const heights = [3, 6, 4, 8, 2, 5, 7, 4, 9, 3, 6, 5];
  
  const colorClass = {
    primary: 'text-primary',
    secondary: 'text-secondary', 
    accent: 'text-accent',
  }[color];

  const containerHeight = size === 'lg' ? 'h-16' : 'h-12';
  const maxBarHeight = size === 'lg' ? 48 : 32;

  return (
    <div className={`flex items-center justify-center ${containerHeight}`}>
      <div className={`flex items-end space-x-1 ${colorClass}`}>
        {heights.map((height, index) => (
          <div
            key={index}
            className="waveform-bar"
            style={{ height: `${(height / 10) * maxBarHeight}px` }}
          />
        ))}
      </div>
    </div>
  );
}
