import { ArrowLeft, BookOpen } from 'lucide-react'
import { ROUTES } from '../../app/routes'
import { Button } from '../ui/Button'
import { Brand } from './Brand'

export function AppHeader({ route, navigate }) {
  const isHome = route === ROUTES.HOME

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Brand onClick={() => navigate(ROUTES.HOME)} />

        <nav aria-label="Navegación principal">
          {isHome ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.INSTRUCTIONS)}
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Cómo jugar
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.HOME)}
            >
              <ArrowLeft
                className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              Inicio
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
