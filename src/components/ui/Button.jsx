import { cn } from '../../utils/cn'

const BASE =
  'group inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-[transform,background-color,border-color,box-shadow,color] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const VARIANTS = {
  primary:
    'bg-accent-500 text-white shadow-[0_12px_32px_-12px_rgba(139,92,246,0.9)] hover:bg-accent-400 hover:shadow-[0_16px_40px_-12px_rgba(139,92,246,0.95)]',
  secondary:
    'border border-white/10 bg-white/[0.04] text-mist-100 hover:border-accent-400/40 hover:bg-white/[0.08]',
  ghost: 'text-mist-300 hover:bg-white/[0.06] hover:text-mist-100',
  danger:
    'border border-red-400/30 bg-red-500/10 text-red-200 hover:border-red-400/50 hover:bg-red-500/20',
}

const SIZES = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
}

/**
 * Botón base del sistema. Todos los botones del juego parten de aquí.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
