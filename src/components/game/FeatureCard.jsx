import { cn } from '../../utils/cn'
import { Card } from '../ui/Card'

/**
 * Tarjeta con icono para presentar una idea del juego.
 */
export function FeatureCard({ icon: Icon, title, description, className }) {
  return (
    <Card interactive className={cn('group p-6 text-left', className)}>
      <div className="mb-5 grid size-11 place-items-center rounded-2xl border border-accent-400/20 bg-accent-500/10 text-accent-300 transition-colors duration-300 group-hover:border-accent-400/40 group-hover:bg-accent-500/15">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h2 className="font-display text-base font-semibold text-mist-100">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-mist-400">{description}</p>
    </Card>
  )
}
