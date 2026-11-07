import { useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Fingerprint,
  LockKeyhole,
  Play,
  Smartphone,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { ROUTES } from '../app/routes'
import { FeatureCard } from '../components/game/FeatureCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { InlineAlert } from '../components/ui/InlineAlert'
import { Progress } from '../components/ui/Progress'
import { Screen } from '../components/ui/Screen'
import { GAME_CONFIG } from '../config/gameConfig'
import { GAME_STATUS } from '../game/constants'
import {
  getGameStatusLabel,
  getRegistrationProgress,
  getTotalData,
} from '../game/selectors'
import { useGame } from '../game/useGame'

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

function StorageNotice({ issue, onDismiss }) {
  if (!issue) return null

  const corrupt = issue === 'corrupt'
  return (
    <InlineAlert
      tone="warning"
      title={corrupt ? 'No pudimos recuperar la partida' : 'No se puede guardar'}
      className="mt-8 text-left"
    >
      <p>
        {corrupt
          ? 'El contenido guardado estaba dañado y se movió a un respaldo. Puedes empezar una partida nueva sin problema.'
          : 'Este navegador no permite guardar la partida. El juego funcionará, pero se perderá al recargar la página.'}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-mist-300 transition-colors hover:bg-white/[0.06]"
      >
        Entendido
      </button>
    </InlineAlert>
  )
}

function CurrentGameCard({ game, onContinue, onNewGame }) {
  const status = getGameStatusLabel(game)
  const progress = game.status === GAME_STATUS.REGISTRATION
    ? getRegistrationProgress(game)
    : null

  return (
    <Card className="mt-10 p-5 text-left sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
            Partida guardada
          </p>
          <h2 className="mt-1 truncate font-display text-xl font-semibold text-mist-100">
            {game.teamName || 'Equipo sin nombre'}
          </h2>
          <p className="mt-1 text-sm text-mist-400">
            {status.label}
            {status.detail ? ` · ${status.detail}` : ''}
          </p>

          {progress ? (
            <Progress
              className="mt-4 max-w-sm"
              value={progress.completed}
              max={progress.total}
              label="Registro en curso"
              hint={`${progress.completed} de ${progress.total}`}
            />
          ) : null}
          {game.status === GAME_STATUS.READY ? (
            <p className="mt-2 text-xs text-mist-500">
              {getTotalData(game)} datos registrados y listos para jugar.
            </p>
          ) : null}
          {game.status === GAME_STATUS.PLAYING ? (
            <p className="mt-2 text-xs text-mist-500">
              {getTotalData(game)} datos bloqueados · no se puede editar.
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button onClick={onContinue} className="w-full sm:w-auto">
            <Play className="size-4" aria-hidden="true" />
            Continuar partida
          </Button>
          <Button
            variant="ghost"
            onClick={onNewGame}
            className="w-full sm:w-auto"
          >
            Nueva partida
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function HomePage({ navigate }) {
  const { game, storageIssue, dismissStorageIssue, startNewGame } = useGame()
  const [confirmNewGame, setConfirmNewGame] = useState(false)

  function handleNewGame() {
    if (game) {
      setConfirmNewGame(true)
      return
    }
    startNewGame()
    navigate(ROUTES.GAME)
  }

  function confirmReset() {
    setConfirmNewGame(false)
    startNewGame()
    navigate(ROUTES.GAME)
  }

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
        <Button size="lg" onClick={handleNewGame} className="w-full sm:w-auto">
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

      <StorageNotice issue={storageIssue} onDismiss={dismissStorageIssue} />

      {game ? (
        <CurrentGameCard
          game={game}
          onContinue={() => navigate(ROUTES.GAME)}
          onNewGame={() => setConfirmNewGame(true)}
        />
      ) : null}

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

      <ConfirmDialog
        open={confirmNewGame}
        title="¿Empezar una partida nueva?"
        description="Se borrarán el equipo y todos los datos registrados en este dispositivo. Esta acción no se puede deshacer."
        confirmLabel="Empezar de cero"
        tone="danger"
        onConfirm={confirmReset}
        onCancel={() => setConfirmNewGame(false)}
      />
    </Screen>
  )
}
