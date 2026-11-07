import {
  ArrowRight,
  BookOpen,
  Construction,
  Fingerprint,
  Trophy,
  Users,
} from 'lucide-react'
import { ROUTES } from '../app/routes'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Screen } from '../components/ui/Screen'
import { GAME_CONFIG } from '../config/gameConfig'

const { minPlayers, maxPlayers, dataPerPlayer } = GAME_CONFIG

const PREVIEW = [
  {
    icon: Users,
    title: 'Participantes',
    description: `Nombres del equipo, de ${minPlayers} a ${maxPlayers} personas.`,
  },
  {
    icon: Fingerprint,
    title: 'Datos anónimos',
    description: `Cada persona registra ${dataPerPlayer.min} o ${dataPerPlayer.max} datos desde el mismo dispositivo.`,
  },
  {
    icon: Trophy,
    title: 'Rondas y revelación',
    description:
      'Votos privados, respuesta del equipo y clasificación final.',
  },
]

export function NewGamePage({ navigate }) {
  return (
    <Screen
      width="narrow"
      eyebrow={
        <Badge tone="neutral">
          <Construction className="size-3.5" aria-hidden="true" />
          Vista previa del flujo
        </Badge>
      }
      title="Nueva partida"
      description="La configuración completa se activa en la siguiente fase del proyecto. Este es el recorrido que vamos a construir."
    >
      <Card className="overflow-hidden p-6 sm:p-8">
        <ol className="divide-y divide-white/[0.06]">
          {PREVIEW.map((step, index) => {
            const Icon = step.icon
            return (
              <li
                key={step.title}
                className="flex items-start gap-4 py-5 first:pt-0 last:pb-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-accent-300">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="font-display text-base font-semibold text-mist-100">
                      {step.title}
                    </h2>
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-mist-500">
                      Paso {index + 1}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-mist-400">
                    {step.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      <p className="mt-5 text-center text-xs leading-relaxed text-mist-500">
        Todavía no se crea ninguna partida ni se guardan datos.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button
          onClick={() => navigate(ROUTES.INSTRUCTIONS)}
          className="w-full sm:w-auto"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          Entender las reglas
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.HOME)}
          className="w-full sm:w-auto"
        >
          Volver al inicio
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Button>
      </div>
    </Screen>
  )
}
