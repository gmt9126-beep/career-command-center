import { cn } from '@/lib/utils';

export default function FitRing({ score, size = 40, stroke = 3.5, label = true, className }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone =
    value >= 80 ? 'hsl(165 34% 34%)' : value >= 60 ? 'hsl(32 74% 48%)' : 'hsl(0 62% 52%)';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(230 8% 91%)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      {label && (
        <span
          className="absolute font-mono text-[10px] font-medium tabular-nums"
          style={{ color: tone, fontSize: size <= 34 ? 9 : 11 }}
        >
          {value}
        </span>
      )}
    </div>
  );
}