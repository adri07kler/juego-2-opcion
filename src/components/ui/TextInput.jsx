import { cn } from '../../utils/cn'
import { CONTROL_BASE, CONTROL_TONE } from './controlStyles'

export function TextInput({ invalid = false, className, ...props }) {
  return (
    <input
      className={cn(
        CONTROL_BASE,
        CONTROL_TONE[invalid ? 'invalid' : 'normal'],
        'h-12 px-4',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}
