import { ArrowRight, BookOpen, CircleOff } from 'lucide-react'
import { ROUTES } from '../app/routes'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Screen } from '../components/ui/Screen'
import { useGame } from '../game/useGame'

export function NoGamePage({ navigate }) {
  const { startNewGame } = useGame()

  return (
    <Screen
      width="narrow"
      align="center"
      eyebrow={
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-mist-400">
          <CircleOff className="size-3.5" aria-hidden="true" />
          Sin partida activa
        </span>
      }
      title="Todavía no hay una partida"
      description="Crea un equipo para empezar. Solo necesitas un nombre de equipo y al menos dos participantes."
    >
      <Card className="mx-auto max-w-md p-6 sm:p-8">
        <Button
          size="lg"
          onClick={startNewGame}
          className="w-full"
        >
          Crear equipo
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.INSTRUCTIONS)}
          className="mt-2 w-full"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          Ver cómo jugar
        </Button>
        <p className="mt-4 text-xs leading-relaxed text-mist-500">
          La partida se guarda automáticamente en este dispositivo.
        </p>
      </Card>
    </Screen>
  )
}
