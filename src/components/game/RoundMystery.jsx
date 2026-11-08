import {
  ArrowRight,
  Clock3,
  EyeOff,
  Fingerprint,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react'
import { GAME_CONFIG } from '../../config/gameConfig'
import { formatTimer } from '../../game/rounds'
import { useGame } from '../../game/useGame'
import { useRoundTimer } from '../../hooks/useRoundTimer'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { InlineAlert } from '../ui/InlineAlert'
import { Progress } from '../ui/Progress'

export function RoundMystery({ round, datum, roundNumber, totalRounds }) {
  const {
    setRoundTimerDuration,
    startRoundTimer,
    pauseRoundTimer,
    beginPredictions,
  } = useGame()

  useRoundTimer(round.timer)

  const { timer } = round
  const remaining = timer.remainingSeconds
  const expired = remaining <= 0

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
            Dato misterioso
          </p>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-mist-300">
            Ronda {roundNumber} de {totalRounds}
          </span>
        </div>

        <blockquote className="mt-5 rounded-2xl border border-accent-400/20 bg-accent-500/[0.07] p-5 sm:p-6">
          <Fingerprint className="size-5 text-accent-300" aria-hidden="true" />
          <p className="mt-3 font-display text-xl leading-relaxed text-mist-100 sm:text-2xl">
            “{datum.text}”
          </p>
          {datum.category ? (
            <p className="mt-3 text-xs font-medium text-accent-200/80">
              {datum.category}
            </p>
          ) : null}
        </blockquote>

        <p className="mt-4 text-sm leading-relaxed text-mist-400">
          Lean el dato en voz alta y conversen. Pueden usar el temporizador si
          quieren limitar la discusión; no es obligatorio.
        </p>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-accent-300" aria-hidden="true" />
            <p className="text-sm font-medium text-mist-200">
              Tiempo para conversar
            </p>
          </div>
          <p
            role="timer"
            className={
              expired
                ? 'font-display text-3xl font-semibold text-red-300'
                : 'font-display text-3xl font-semibold text-mist-100'
            }
          >
            {formatTimer(remaining)}
          </p>
        </div>

        <Progress
          className="mt-4"
          value={remaining}
          max={timer.durationSeconds}
          label={expired ? 'Tiempo agotado' : 'Cuenta atrás'}
          hint={`${remaining} de ${timer.durationSeconds} s`}
        />

        <div className="mt-5">
          <label
            htmlFor="duracion-ronda"
            className="flex items-center justify-between gap-3 text-xs font-medium text-mist-400"
          >
            <span>Duración de la ronda</span>
            <span className="text-mist-300">{timer.durationSeconds} s</span>
          </label>
          <input
            id="duracion-ronda"
            type="range"
            min={GAME_CONFIG.roundTimer.min}
            max={GAME_CONFIG.roundTimer.max}
            step={GAME_CONFIG.roundTimer.step}
            value={timer.durationSeconds}
            disabled={timer.running}
            onChange={(event) =>
              setRoundTimerDuration(Number(event.target.value))
            }
            className="mt-2 w-full cursor-pointer accent-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="mt-1 flex justify-between text-[10px] text-mist-500">
            <span>{GAME_CONFIG.roundTimer.min} s</span>
            <span>{GAME_CONFIG.roundTimer.max} s</span>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={
            expired
              ? () => setRoundTimerDuration(timer.durationSeconds)
              : timer.running
                ? pauseRoundTimer
                : startRoundTimer
          }
          className="mt-4 w-full"
        >
          {expired ? (
            <>
              <RotateCcw className="size-4" aria-hidden="true" />
              Reiniciar tiempo
            </>
          ) : timer.running ? (
            <>
              <Pause className="size-4" aria-hidden="true" />
              Pausar tiempo
            </>
          ) : (
            <>
              <Play className="size-4" aria-hidden="true" />
              Iniciar tiempo
            </>
          )}
        </Button>
      </Card>

      <InlineAlert tone="info">
        <span className="inline-flex items-start gap-2">
          <EyeOff className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          El temporizador se detiene al pasar a las predicciones privadas.
        </span>
      </InlineAlert>

      <Button size="lg" onClick={beginPredictions} className="w-full">
        Continuar a las predicciones
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Button>
    </div>
  )
}
