import { Card } from '../ui/Card'

/**
 * Paso numerado de la explicación de reglas.
 */
export function StepCard({ number, icon: Icon, title, children }) {
  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-accent-400/20 bg-accent-500/10 text-accent-300">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
            Paso {number}
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-mist-100">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mist-400">
            {children}
          </p>
        </div>
      </div>
    </Card>
  )
}
