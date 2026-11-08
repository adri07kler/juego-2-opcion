import { useState } from 'react'
import { EyeOff, LockKeyhole, UserRoundCheck } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { InlineAlert } from '../ui/InlineAlert'
import { PlayerChoiceGrid } from './PlayerChoiceGrid'

export function PredictionForm({
  player,
  players,
  position,
  total,
  onConfirm,
}) {
  const [selected, setSelected] = useState(null)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (selected) onConfirm(selected)
      }}
      className="mx-auto max-w-2xl space-y-4"
    >
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
              Predicción privada
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-mist-100">
              {player.name}
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-mist-300">
            <UserRoundCheck className="size-3.5" aria-hidden="true" />
            Turno {position} de {total}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-mist-400">
          El dato está oculto. Elige a quién crees que pertenece. Tu respuesta
          quedará bloqueada al confirmar.
        </p>
      </Card>

      <Card className="p-5 sm:p-6">
        <PlayerChoiceGrid
          players={players}
          value={selected}
          onChange={setSelected}
          label="¿Quién crees que escribió el dato?"
        />
      </Card>

      <InlineAlert tone="info">
        <span className="inline-flex items-start gap-2">
          <EyeOff className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Nadie verá tu predicción hasta que todo el equipo haya votado.
        </span>
      </InlineAlert>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-mist-500">
          <LockKeyhole
            className="mt-0.5 size-4 shrink-0 text-accent-400/80"
            aria-hidden="true"
          />
          Al confirmar, el dispositivo pasará a la siguiente persona. No podrás
          cambiar tu voto.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!selected}
        className="w-full"
      >
        <LockKeyhole className="size-4" aria-hidden="true" />
        Confirmar predicción
      </Button>
    </form>
  )
}
