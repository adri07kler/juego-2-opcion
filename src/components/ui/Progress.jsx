import { cn } from '../../utils/cn'

export function Progress({ value, max = 100, label, hint, className }) {
  const safeMax = Math.max(1, max)
  const clamped = Math.min(safeMax, Math.max(0, value))
  const percent = Math.round((clamped / safeMax) * 100)

  return (
    <div className={cn('space-y-2', className)}>
      {label || hint ? (
        <div className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
          {label ? (
            <span className="font-medium text-mist-300">{label}</span>
          ) : null}
          {hint ? <span className="text-mist-500">{hint}</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={label ?? 'Progreso'}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#7443e6,#a586ff)] transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
