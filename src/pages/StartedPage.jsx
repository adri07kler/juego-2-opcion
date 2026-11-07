import { Database, LockKeyhole, Sparkles, Users } from 'lucide-react'
import { ROUTES } from '../app/routes'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Screen } from '../components/ui/Screen'
import { getTotalData } from '../game/selectors'
import { useGame } from '../game/useGame'

export function StartedPage({ navigate }) {
  const { game } = useGame()
  const totalData = getTotalData(game)
  const players = game?.players ?? []

  return (
    <Screen
      width="narrow"
      eyebrow={
        <Badge tone="neutral">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          Partida iniciada
        </Badge>
      }
      title="La partida está en marcha"
      description="El equipo y los datos han quedado bloqueados. La ronda de juego se implementará en la siguiente fase del proyecto."
    >
      <Card className="p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
          {game?.teamName || 'Tu equipo'}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-mist-100">
          Preparación cerrada
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <Users className="size-4 text-accent-300" aria-hidden="true" />
            <div>
              <p className="font-display text-xl font-semibold text-mist-100">
                {players.length}
              </p>
              <p className="text-xs text-mist-500">participantes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <Database className="size-4 text-accent-300" aria-hidden="true" />
            <div>
              <p className="font-display text-xl font-semibold text-mist-100">
                {totalData}
              </p>
              <p className="text-xs text-mist-500">datos listos</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-accent-400/20 bg-accent-500/[0.07] p-4">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-accent-100/90">
            <Sparkles
              className="mt-0.5 size-4 shrink-0 text-accent-300"
              aria-hidden="true"
            />
            Todo queda guardado en este dispositivo. Al volver al inicio podrás
            retomar la partida donde la dejaste.
          </p>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mist-500">
          <LockKeyhole
            className="mt-0.5 size-3.5 shrink-0 text-accent-400/80"
            aria-hidden="true"
          />
          No se pueden modificar participantes ni datos una vez iniciada la
          partida.
        </p>
      </Card>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.HOME)}
          className="w-full sm:w-auto"
        >
          Volver al inicio
        </Button>
      </div>
    </Screen>
  )
}
