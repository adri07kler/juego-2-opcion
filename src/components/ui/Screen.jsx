import { useEffect, useId, useRef } from 'react'
import { cn } from '../../utils/cn'

const WIDTHS = {
  narrow: 'max-w-3xl',
  default: 'max-w-4xl',
  wide: 'max-w-6xl',
}

const HEADING_SIZES = {
  default: 'text-4xl sm:text-5xl',
  hero: 'text-5xl sm:text-6xl lg:text-7xl',
}

/**
 * Envoltorio de pantalla: layout, entrada animada y foco accesible al título.
 */
export function Screen({
  eyebrow,
  title,
  description,
  children,
  align = 'left',
  width = 'default',
  size = 'default',
  className,
}) {
  const headingRef = useRef(null)
  const headingId = useId()
  const isCentered = align === 'center'

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <main
      aria-labelledby={headingId}
      className={cn(
        'mx-auto w-full px-5 pb-20 pt-10 sm:px-8 sm:pt-16',
        WIDTHS[width],
        className,
      )}
    >
      <div className="animate-rise">
        <div
          className={cn(
            'flex flex-col',
            isCentered && 'items-center text-center',
          )}
        >
          {eyebrow ? <div className="mb-5 animate-fade">{eyebrow}</div> : null}
          <h1
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className={cn(
              'max-w-3xl font-display font-semibold leading-[1.05] tracking-tight text-mist-100 outline-none',
              HEADING_SIZES[size],
              isCentered && 'mx-auto',
            )}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={cn(
                'mt-5 max-w-2xl text-base leading-relaxed text-mist-400 sm:text-lg',
                isCentered && 'mx-auto',
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        <div className={cn('mt-10 sm:mt-12', isCentered && 'mt-12 sm:mt-14')}>
          {children}
        </div>
      </div>
    </main>
  )
}
