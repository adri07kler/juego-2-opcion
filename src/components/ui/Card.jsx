import { cn } from '../../utils/cn'

const BASE =
  'rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-[0_24px_70px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm'

const INTERACTIVE =
  'transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-accent-400/30 hover:bg-white/[0.055] hover:shadow-[0_30px_80px_-40px_rgba(139,92,246,0.45)]'

/**
 * Superficie elevada reutilizable.
 */
export function Card({
  as: Tag = 'div',
  interactive = false,
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(BASE, interactive && INTERACTIVE, className)}
      {...props}
    >
      {children}
    </Tag>
  )
}
