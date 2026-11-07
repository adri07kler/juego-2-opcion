import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import { CONTROL_BASE, CONTROL_TONE } from './controlStyles'

export function Select({ invalid = false, className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          CONTROL_BASE,
          CONTROL_TONE[invalid ? 'invalid' : 'normal'],
          'h-12 appearance-none px-4 pr-10',
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-mist-500"
        aria-hidden="true"
      />
    </div>
  )
}
