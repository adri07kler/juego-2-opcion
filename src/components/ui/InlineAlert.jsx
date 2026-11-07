import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const TONES = {
  info: {
    icon: Info,
    styles: 'border-accent-400/25 bg-accent-500/[0.08] text-accent-100',
    iconStyles: 'text-accent-300',
  },
  success: {
    icon: CheckCircle2,
    styles: 'border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-100',
    iconStyles: 'text-emerald-300',
  },
  warning: {
    icon: AlertTriangle,
    styles: 'border-amber-400/25 bg-amber-500/[0.08] text-amber-100',
    iconStyles: 'text-amber-300',
  },
  error: {
    icon: XCircle,
    styles: 'border-red-400/25 bg-red-500/[0.08] text-red-100',
    iconStyles: 'text-red-300',
  },
}

export function InlineAlert({ tone = 'info', title, children, className }) {
  const config = TONES[tone] ?? TONES.info
  const Icon = config.icon

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm',
        config.styles,
        className,
      )}
    >
      <Icon
        className={cn('mt-0.5 size-4 shrink-0', config.iconStyles)}
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? (
          <div className="leading-relaxed opacity-90">{children}</div>
        ) : null}
      </div>
    </div>
  )
}
