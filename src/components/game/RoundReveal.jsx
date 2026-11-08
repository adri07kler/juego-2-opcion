import {
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  MessageCircle,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { getInitials } from '../../utils/text'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { InlineAlert } from '../ui/InlineAlert'

export function RoundReveal({
  round,
  datum,
  author,
  groupAnswer,
  players,
  roundNumber,
  totalRounds,
  isLast,
  onAdvance,
}) {
  const result = round.result
  if (!result) {
    return (
      <InlineAlert tone="warning" title="La revelación no está disponible">
        Vuelve a confirmar la respuesta grupal para completar la ronda.
      </InlineAlert>
    )
  }

  const playersById = new Map(
    players.map((player) => [player.id, player]),
  )

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
            Revelación
          </p>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-mist-300">
            Ronda {roundNumber} de {totalRounds}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-accent-400/25 bg-accent-500/[0.09] p-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-accent-300/30 bg-accent-400/15 font-display text-lg font-semibold text-accent-100">
            {author ? getInitials(author.name) : '?'}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-200/80">
              Detrás de este dato está
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-mist-100">
              {author?.name ?? 'Autor desconocido'}
            </p>
          </div>
          <Sparkles
            className="ml-auto hidden size-6 shrink-0 text-accent-300 sm:block"
            aria-hidden="true"
          />
        </div>

        <blockquote className="mt-5 rounded-2xl border border-white/[0.08] bg-ink-900/50 p-5">
          <Fingerprint className="size-5 text-accent-300" aria-hidden="true" />
          <p className="mt-3 font-display text-lg leading-relaxed text-mist-100 sm:text-xl">
            “{datum.text}”
          </p>
          {datum.category ? (
            <p className="mt-3 text-xs font-medium text-accent-200/80">
              {datum.category}
            </p>
          ) : null}
        </blockquote>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
              Respuesta del equipo
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-mist-100">
              {groupAnswer?.name ?? 'Sin respuesta registrada'}
            </h2>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium',
              result.groupCorrect
                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                : 'border-red-400/25 bg-red-500/10 text-red-200',
            )}
          >
            {result.groupCorrect ? (
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
            ) : (
              <XCircle className="size-3.5" aria-hidden="true" />
            )}
            {result.groupCorrect ? 'El equipo acertó' : 'El equipo falló'}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-center">
            <p className="font-display text-2xl font-semibold text-emerald-200">
              {result.correctCount}
            </p>
            <p className="mt-0.5 text-[11px] text-mist-500">aciertos</p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-center">
            <p className="font-display text-2xl font-semibold text-red-200">
              {result.wrongCount}
            </p>
            <p className="mt-0.5 text-[11px] text-mist-500">fallos</p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-center">
            <p className="font-display text-2xl font-semibold text-accent-200">
              {players.length}
            </p>
            <p className="mt-0.5 text-[11px] text-mist-500">votos</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-accent-300" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-mist-100">
            Predicciones individuales
          </h2>
        </div>

        <ul className="mt-4 space-y-2">
          {result.playerResults.map((entry) => {
            const voter = playersById.get(entry.playerId)
            const predicted = playersById.get(entry.predictedAuthorId)
            return (
              <li
                key={entry.playerId}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-mist-200">
                  {voter ? getInitials(voter.name) : '?'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-mist-100">
                    {voter?.name ?? 'Participante'}
                  </p>
                  <p className="truncate text-xs text-mist-500">
                    votó por {predicted?.name ?? 'una persona'}
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                    entry.correct
                      ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                      : 'border-red-400/20 bg-red-500/[0.07] text-red-200',
                  )}
                >
                  {entry.correct ? (
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                  ) : (
                    <XCircle className="size-3" aria-hidden="true" />
                  )}
                  {entry.correct ? `+${entry.pointsAwarded}` : '0'}
                </span>
                {entry.bonusAwarded > 0 ? (
                  <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                    racha +{entry.bonusAwarded}
                  </span>
                ) : null}
                <span className="ml-auto whitespace-nowrap text-xs font-medium text-mist-400">
                  {entry.pointsTotal} pts
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

      <InlineAlert tone="info">
        <span className="inline-flex items-start gap-2">
          <MessageCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Antes de continuar, que {author?.name ?? 'el autor'} cuente la
          historia detrás del dato.
        </span>
      </InlineAlert>

      <Button size="lg" onClick={onAdvance} className="w-full">
        {isLast ? 'Ver clasificación final' : 'Siguiente dato'}
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Button>
    </div>
  )
}
