import { useState } from 'react'
import {
  CheckCircle2,
  ClipboardList,
  Crown,
  Database,
  Flame,
  Home,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react'
import { ROUTES } from '../app/routes'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { InlineAlert } from '../components/ui/InlineAlert'
import { Modal } from '../components/ui/Modal'
import { Screen } from '../components/ui/Screen'
import { getGameSummary, getRanking } from '../game/selectors'
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

function SummaryStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
      <p className="font-display text-lg font-semibold text-mist-100">{value}</p>
      <p className="mt-0.5 text-[11px] text-mist-500">{label}</p>
    </div>
  )
}

export function ResultsPage({ navigate }) {
  const { game, playAgain, deleteGame } = useGame()
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!game) {
    return (
      <Screen width="narrow" title="No hay una partida guardada">
        <Button onClick={() => navigate(ROUTES.HOME)}>Volver al inicio</Button>
      </Screen>
    )
  }

  const ranking = getRanking(game)
  const summary = getGameSummary(game)
  const leadingPoints = ranking[0]?.points ?? 0
  const winners =
    leadingPoints > 0
      ? ranking.filter((row) => row.points === leadingPoints)
      : []

  function handlePlayAgain() {
    playAgain()
    navigate(ROUTES.GAME)
  }

  function handleDelete() {
    setConfirmDelete(false)
    deleteGame()
    navigate(ROUTES.HOME)
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
      description={`Se revelaron los ${summary.totalData} datos del equipo. Estas son las puntuaciones acumuladas, con los aciertos, los fallos y la mejor racha de cada persona.`}
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
                  : winners.length === 1
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
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-xl font-semibold text-mist-100">
                      {winner.name}
                    </p>
                    <p className="mt-0.5 text-xs text-mist-500">
                      mayor puntuación · mejor racha {winner.bestStreak}
                    </p>
                  </div>
                  <p className="font-display text-2xl font-semibold text-amber-200">
                    {winner.points}
                    <span className="ml-1 text-xs font-medium text-amber-200/70">
                      pts
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm text-mist-400">
              Nadie sumó puntos en esta partida, pero todas las rondas quedaron
              registradas en el resumen.
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat icon={Users} value={game.players.length} label="participantes" />
            <Stat icon={Database} value={summary.totalData} label="datos utilizados" />
            <Stat
              icon={Trophy}
              value={`${summary.roundsCompleted}/${summary.totalRounds}`}
              label="rondas completadas"
            />
            <Stat
              icon={Target}
              value={`${summary.individualAccuracy}%`}
              label="aciertos individuales"
            />
            <Stat
              icon={CheckCircle2}
              value={`${summary.correctGroupAnswers}/${summary.roundsCompleted}`}
              label="aciertos del equipo"
            />
            <Stat icon={Flame} value={summary.bestStreak} label="mejor racha" />
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
                <span
                  className={
                    row.bestStreak > 0
                      ? 'inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-amber-200'
                      : 'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-mist-500'
                  }
                >
                  <Flame className="size-3" aria-hidden="true" />
                  mejor racha {row.bestStreak}
                </span>
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
          <p>
            Pueden consultar el resumen con todos los datos y autores, jugar
            otra vez con el mismo equipo o volver al inicio.
          </p>
          <p className="mt-2 text-xs opacity-80">
            «Jugar otra vez» conserva el equipo y los participantes, pero
            empieza con datos, rondas y puntuaciones nuevas.
          </p>
        </InlineAlert>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button onClick={handlePlayAgain} className="w-full">
            <RotateCcw className="size-4" aria-hidden="true" />
            Jugar otra vez
          </Button>
          <Button
            variant="secondary"
            onClick={() => setSummaryOpen(true)}
            className="w-full"
          >
            <ClipboardList className="size-4" aria-hidden="true" />
            Ver resumen
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full"
          >
            <Home className="size-4" aria-hidden="true" />
            Volver al inicio
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmDelete(true)}
            className="w-full"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar partida
          </Button>
        </div>
      </div>

      <Modal
        open={summaryOpen}
        title="Resumen de la partida"
        description={`${summary.teamName || 'Tu equipo'} · ${summary.roundsCompleted} de ${summary.totalRounds} rondas completadas`}
        onClose={() => setSummaryOpen(false)}
        className="max-w-2xl"
        footer={
          <Button
            variant="secondary"
            onClick={() => setSummaryOpen(false)}
            className="w-full sm:w-auto"
          >
            Cerrar resumen
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SummaryStat
              value={`${summary.roundsCompleted}/${summary.totalRounds}`}
              label="rondas completadas"
            />
            <SummaryStat value={summary.totalData} label="datos utilizados" />
            <SummaryStat
              value={`${summary.individualAccuracy}%`}
              label="aciertos individuales"
            />
            <SummaryStat
              value={`${summary.correctGroupAnswers}/${summary.roundsCompleted}`}
              label="respuestas grupales correctas"
            />
            <SummaryStat
              value={`${summary.groupAccuracy}%`}
              label="precisión del equipo"
            />
            <SummaryStat value={summary.bestStreak} label="mejor racha" />
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-mist-100">
              Datos y autores revelados
            </h3>
            {summary.revealedData.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {summary.revealedData.map((item) => (
                  <li
                    key={item.dataId}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5"
                  >
                    <p className="text-sm leading-relaxed text-mist-100">
                      “{item.text}”
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-accent-400/25 bg-accent-500/[0.09] px-2.5 py-1 font-medium text-accent-100">
                        {item.authorName}
                      </span>
                      {item.category ? (
                        <span className="text-mist-500">{item.category}</span>
                      ) : null}
                      <span
                        className={
                          item.groupCorrect
                            ? 'ml-auto inline-flex items-center gap-1 font-medium text-emerald-200'
                            : 'ml-auto inline-flex items-center gap-1 font-medium text-red-200'
                        }
                      >
                        {item.groupCorrect ? (
                          <CheckCircle2 className="size-3" aria-hidden="true" />
                        ) : (
                          <XCircle className="size-3" aria-hidden="true" />
                        )}
                        {item.groupCorrect
                          ? 'El equipo acertó'
                          : 'El equipo falló'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-mist-500">
                Todavía no hay datos revelados.
              </p>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar esta partida?"
        description="Se borrarán el equipo, los datos, las predicciones y la clasificación guardados en este dispositivo. Esta acción no se puede deshacer."
        confirmLabel="Eliminar partida"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Screen>
  )
}
