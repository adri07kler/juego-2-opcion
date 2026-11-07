import { ArrowRight, EyeOff, LockKeyhole, Smartphone } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Progress } from '../ui/Progress'

/**
 * Pantalla neutra de entrega del dispositivo. No muestra ningún dato
 * del registro anterior ni del borrador actual.
 */
export function RegistrationHandoff({ player, completed, total, onContinue }) {
  return (
    <Card className="mx-auto max-w-xl p-6 text-center sm:p-9">
      <div className="mx-auto mb-6 grid size-16 place-items-center rounded-3xl border border-accent-400/25 bg-accent-500/10 text-accent-300">
        <Smartphone className="size-7" aria-hidden="true" />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-300/80">
        Turno de registro
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-mist-100">
        {player.name}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist-400">
        Pasa el dispositivo a <strong className="font-semibold text-mist-200">{player.name}</strong>.
        La pantalla solo debe verla esta persona mientras escribe sus datos.
      </p>

      <Progress
        className="mt-7 text-left"
        value={completed}
        max={total}
        label="Registros completados"
        hint={`${completed} de ${total}`}
      />

      <Button size="lg" onClick={onContinue} className="mt-7 w-full">
        <LockKeyhole className="size-4" aria-hidden="true" />
        Soy {player.name}, continuar
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-mist-500">
        <EyeOff className="size-3.5" aria-hidden="true" />
        Nadie más debería mirar la pantalla ahora.
      </p>
    </Card>
  )
}
