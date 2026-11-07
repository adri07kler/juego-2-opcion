import { cn } from '../../utils/cn'

const TONES = {
  accent: 'border-accent-400/25 bg-accent-500/10 text-accent-200',
  neutral: 'border-white/10 bg-white/[0.04] text-mist-300',
}

/**
 * Etiqueta compacta para contextos y estados.
 */
export function Badge({ tone = 'accent', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
