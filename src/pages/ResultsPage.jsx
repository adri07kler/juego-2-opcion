import { useState } from 'react'
import {
  Crown,
  Database,
  Home,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { ROUTES } from '../app/routes'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { InlineAlert } from '../components/ui/InlineAlert'
import { Screen } from '../components/ui/Screen'
import {
  getRanking,
  getRoundProgress,
  getTotalData,
} from '../game/selectors'
import { useGame } from '../game/useGame'

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <Icon className="size-4 text-accent-300" aria-hidden="true" />
      <p className="mt-3 font-display text-2xl font-semibold text-mist-100">
        {value}
      </p>
      <p className="mt-1 text-xs text-mist-500">{label}</p>
    </div>
  )
}

export function ResultsPage({ navigate }) {
  const { game, startNewGame } = useGame()
  const [confirmNewGame, setConfirmNewGame] = useState(false)

  if (!game) {
    return (
      <Screen width="narrow" title="No hay una partida guardada">
        <Button onClick={() => navigate(ROUTES.HOME)}>Volver al inicio</Button>
      </Screen>
    )
  }

  const ranking = getRanking(game)
  const progress = getRoundProgress(game)
  const leadingPoints = ranking[0]?.points ?? 0
  const winners = ranking.filter((row) => row.points === leadingPoints)

  function handleNewGame() {
    setConfirmNewGame(false)
    startNewGame()
    navigate(ROUTES.GAME)
  }

  return (
    <Screen
      width="narrow"
      eyebrow={
        <Badge>
          <Trophy className="size-3.5" aria-hidden="true" />
          Partida finalizada
        </Badge>
      }
      title="Clasificación final"
      description={`Se revelaron los ${getTotalData(game)} datos del equipo. Estas son las puntuaciones acumuladas, con las rachas de aciertos incluidas.`}
    >
      <div className="space-y-4">
        <Card className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
                {game.teamName || 'Tu equipo'}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-mist-100">
                {winners.length > 1
                  ? 'Empate en el primer lugar'
                  : leadingPoints > 0
                    ? 'Ganador de la partida'
                    : 'Partida completada'}
              </h2>
            </div>
            <Sparkles className="size-6 text-accent-300" aria-hidden="true" />
          </div>

          {winners.length > 0 ? (
            <ul className="mt-5 space-y-2">
              {winners.map((winner) => (
                <li
                  key={winner.playerId}
                  className="flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/[0.08] p-4"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-amber-300/30 bg-amber-400/15 text-amber-200">
                    <Crown className="size-5" aria-hidden="true" />
                  </span>
                  <p className="min-w-0 flex-1 truncate font-display text-xl font-semibold text-mist-100">
                    {winner.name}
                  </p>
                  <p className="font-display text-2xl font-semibold text-amber-200">
                    {winner.points}
                    <span className="ml-1 text-xs font-medium text-amber-200/70">
                      pts
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat icon={Users} value={game.players.length} label="participantes" />
            <Stat icon={Database} value={getTotalData(game)} label="datos revelados" />
            <Stat icon={Trophy} value={progress.total} label="rondas jugadas" />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-mist-100">
            Tabla de posiciones
          </h2>
          <ul className="mt-4 space-y-2">
            {ranking.map((row) => (
              <li
                key={row.playerId}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] font-display text-sm font-semibold text-mist-200">
                  {row.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-mist-100">
                    {row.name}
                  </p>
                  <p className="mt-0.5 text-xs text-mist-500">
                    {row.correct} aciertos · {row.wrong} fallos
                    {row.tied ? ' · empate' : ''}
                  </p>
                </div>
                {row.streak > 0 ? (
                  <span className="rounded-full border border-amber-400/20 bg-amber-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-amber-200">
                    racha {row.streak}
                  </span>
                ) : null}
                <span className="font-display text-lg font-semibold text-mist-100">
                  {row.points}
                  <span className="ml-1 text-[11px] font-medium text-mist-500">
                    pts
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-2xl border border-white/[0.07] bg-ink-900/50 p-3.5 text-xs leading-relaxed text-mist-500">
            +10 puntos por acierto individual y +5 extra en cada tercer acierto
            consecutivo. Un fallo reinicia la racha. Quienes empatan en puntos
            comparten el mismo puesto.
          </p>
        </Card>

        <InlineAlert tone="success" title="Fin de la partida">
          Ya se revelaron todos los datos. Pueden conversar sobre las historias,
          volver al inicio o empezar una partida nueva.
        </InlineAlert>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => setConfirmNewGame(true)}
            className="w-full sm:flex-1"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Nueva partida
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full sm:flex-1"
          >
            <Home className="size-4" aria-hidden="true" />
            Volver al inicio
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmNewGame}
        title="¿Empezar una partida nueva?"
        description="Se borrarán el equipo, los datos y la clasificación actual de este dispositivo. Esta acción no se puede deshacer."
        confirmLabel="Empezar de cero"
        tone="danger"
        onConfirm={handleNewGame}
        onCancel={() => setConfirmNewGame(false)}
      />
    </Screen>
  )
}
