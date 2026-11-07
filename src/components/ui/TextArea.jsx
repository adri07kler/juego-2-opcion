import { cn } from '../../utils/cn'
import { CONTROL_BASE, CONTROL_TONE } from './controlStyles'

export function TextArea({ invalid = false, className, ...props }) {
  return (
    <textarea
      className={cn(
        CONTROL_BASE,
        CONTROL_TONE[invalid ? 'invalid' : 'normal'],
        'min-h-28 resize-y px-4 py-3 leading-relaxed',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}
