import {
  ArrowRight,
  EyeOff,
  LockKeyhole,
  Smartphone,
  Vote,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Progress } from '../ui/Progress'

/**
 * Pantalla neutral antes de cada predicción. No muestra el dato, ni
 * votos anteriores, ni pistas sobre el autor.
 */
export function PredictionHandoff({ player, position, total, onContinue }) {
  return (
    <Card className="mx-auto max-w-xl p-6 text-center sm:p-9">
      <div className="mx-auto mb-6 grid size-16 place-items-center rounded-3xl border border-accent-400/25 bg-accent-500/10 text-accent-300">
        <Smartphone className="size-7" aria-hidden="true" />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-300/80">
        Predicción privada
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-mist-100">
        {player.name}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist-400">
        Pasa el dispositivo a{' '}
        <strong className="font-semibold text-mist-200">{player.name}</strong>.
        El dato y los votos anteriores permanecen ocultos.
      </p>

      <Progress
        className="mt-7 text-left"
        value={position - 1}
        max={total}
        label="Predicciones completadas"
        hint={`${position - 1} de ${total}`}
      />

      <Button size="lg" onClick={onContinue} className="mt-7 w-full">
        <LockKeyhole className="size-4" aria-hidden="true" />
        Soy {player.name}, votar
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-mist-500">
        <EyeOff className="size-3.5" aria-hidden="true" />
        Nadie más debería ver esta predicción.
      </p>

      <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-mist-500">
        <Vote className="size-3.5" aria-hidden="true" />
        Turno {position} de {total}
      </p>
    </Card>
  )
}
