import { useState } from 'react'
import {
  Fingerprint,
  LockKeyhole,
  Users,
  Vote,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { InlineAlert } from '../ui/InlineAlert'
import { PlayerChoiceGrid } from './PlayerChoiceGrid'

export function GroupVote({
  datum,
  players,
  roundNumber,
  totalRounds,
  onConfirm,
}) {
  const [started, setStarted] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!started) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center sm:p-9">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-3xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-300">
          <Vote className="size-7" aria-hidden="true" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
          Predicciones completadas
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-mist-100">
          Es momento de hablar en equipo
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist-400">
          Todos los votos individuales están bloqueados. Reúnan al equipo
          alrededor del dispositivo para discutir y elegir una única respuesta.
        </p>
        <Button size="lg" onClick={() => setStarted(true)} className="mt-7 w-full">
          <Users className="size-4" aria-hidden="true" />
          El equipo está listo
        </Button>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
            Dato misterioso
          </p>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-mist-300">
            Ronda {roundNumber} de {totalRounds}
          </span>
        </div>

        <blockquote className="mt-4 rounded-2xl border border-accent-400/20 bg-accent-500/[0.07] p-5">
          <Fingerprint
            className="size-5 text-accent-300"
            aria-hidden="true"
          />
          <p className="mt-3 font-display text-lg leading-relaxed text-mist-100 sm:text-xl">
            “{datum.text}”
          </p>
          {datum.category ? (
            <p className="mt-3 text-xs font-medium text-accent-200/80">
              {datum.category}
            </p>
          ) : null}
        </blockquote>

        <p className="mt-4 text-sm leading-relaxed text-mist-400">
          Discutan quién pudo escribirlo. Cuando el equipo tenga una respuesta
          común, selecciónenla y confirmen.
        </p>
      </Card>

      <Card className="p-5 sm:p-6">
        <PlayerChoiceGrid
          players={players}
          value={selected}
          onChange={setSelected}
          label="Respuesta grupal: ¿quién escribió el dato?"
        />
      </Card>

      <InlineAlert tone="warning">
        Solo hay una respuesta grupal por ronda. Al confirmarla se revela al
        autor y ya no se puede cambiar.
      </InlineAlert>

      <Button
        size="lg"
        disabled={!selected}
        onClick={() => setConfirmOpen(true)}
        className="w-full"
      >
        <LockKeyhole className="size-4" aria-hidden="true" />
        Confirmar respuesta del equipo
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Confirmar la respuesta grupal?"
        description="Esta es la única respuesta del equipo para esta ronda. Al confirmar se revelará el autor y el voto no se podrá modificar."
        confirmLabel="Confirmar y revelar"
        onConfirm={() => {
          setConfirmOpen(false)
          if (selected) onConfirm(selected)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
