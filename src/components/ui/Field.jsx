import { cn } from '../../utils/cn'

/**
 * Etiqueta, ayuda y error de un control de formulario.
 */
export function Field({
  id,
  label,
  hint,
  error,
  optional = false,
  className,
  children,
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <label
            htmlFor={id}
            className="text-sm font-medium text-mist-200"
          >
            {label}
          </label>
          {optional ? (
            <span className="text-[11px] uppercase tracking-[0.16em] text-mist-500">
              Opcional
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-mist-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
