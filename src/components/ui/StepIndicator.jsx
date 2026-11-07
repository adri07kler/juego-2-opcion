import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

export function StepIndicator({ steps, current }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Pasos">
      {steps.map((step, index) => {
        const number = index + 1
        const isDone = number < current
        const isCurrent = number === current

        return (
          <li key={step} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isCurrent &&
                  'border-accent-400/40 bg-accent-500/15 text-accent-100',
                isDone && 'border-white/10 bg-white/[0.04] text-mist-300',
                !isCurrent &&
                  !isDone &&
                  'border-white/[0.06] bg-transparent text-mist-500',
              )}
            >
              <span
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold',
                  isCurrent && 'bg-accent-400 text-ink-950',
                  isDone && 'bg-white/10 text-mist-200',
                  !isCurrent && !isDone && 'bg-white/[0.06] text-mist-500',
                )}
              >
                {isDone ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : (
                  number
                )}
              </span>
              <span className="truncate">{step}</span>
            </div>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  'h-px flex-1 rounded-full',
                  number < current ? 'bg-accent-400/40' : 'bg-white/[0.08]',
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
