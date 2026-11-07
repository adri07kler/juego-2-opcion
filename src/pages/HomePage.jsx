import {
  ArrowRight,
  BookOpen,
  Fingerprint,
  LockKeyhole,
  Smartphone,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { ROUTES } from '../app/routes'
import { FeatureCard } from '../components/game/FeatureCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Screen } from '../components/ui/Screen'
import { GAME_CONFIG } from '../config/gameConfig'

const { points, minPlayers, maxPlayers, dataPerPlayer } = GAME_CONFIG

const FEATURES = [
  {
    icon: Fingerprint,
    title: 'Datos anónimos',
    description:
      'Cada persona escribe entre 2 y 3 datos. La app los mezcla y oculta a su autor hasta la revelación.',
  },
  {
    icon: LockKeyhole,
    title: 'Predicciones secretas',
    description:
      'El equipo conversa, pero cada jugador vota en privado sin ver la respuesta de los demás.',
  },
  {
    icon: Trophy,
    title: 'Puntos y rachas',
    description: `+${points.correct} por acierto y +${points.streakBonus} extra cada ${points.streakEvery} aciertos consecutivos.`,
  },
]

export function HomePage({ navigate }) {
  return (
    <Screen
      align="center"
      width="wide"
      size="hero"
      eyebrow={
        <Badge>
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-300 opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent-300" />
          </span>
          Juego de integración para equipos
        </Badge>
      }
      title={
        <>
          ¿Quién está{' '}
          <span className="text-gradient">detrás del dato</span>?
        </>
      }
      description="Cada persona escribe datos curiosos sobre sí misma. La app los mezcla y el equipo tiene que descubrir quién se esconde detrás de cada uno."
    >
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          size="lg"
          onClick={() => navigate(ROUTES.NEW_GAME)}
          className="w-full sm:w-auto"
        >
          Nueva partida
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate(ROUTES.INSTRUCTIONS)}
          className="w-full sm:w-auto"
        >
          <BookOpen className="size-4" aria-hidden="true" />
          Cómo jugar
        </Button>
      </div>

      <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className="animate-rise"
            style={{ animationDelay: `${160 + index * 90}ms` }}
          >
            <FeatureCard {...feature} className="h-full" />
          </div>
        ))}
      </div>

      <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-medium text-mist-500">
        <li className="flex items-center gap-2">
          <Users className="size-3.5 text-accent-400/80" aria-hidden="true" />
          {minPlayers}–{maxPlayers} jugadores
        </li>
        <li className="flex items-center gap-2">
          <Smartphone
            className="size-3.5 text-accent-400/80"
            aria-hidden="true"
          />
          Un solo dispositivo
        </li>
        <li className="flex items-center gap-2">
          <LockKeyhole
            className="size-3.5 text-accent-400/80"
            aria-hidden="true"
          />
          Sin cuentas ni registro
        </li>
        <li className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-accent-400/80" aria-hidden="true" />
          {dataPerPlayer.min}–{dataPerPlayer.max} datos por persona
        </li>
      </ul>
    </Screen>
  )
}
