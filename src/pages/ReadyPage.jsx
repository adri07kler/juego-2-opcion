import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Database,
  LockKeyhole,
  Play,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react'
import { ROUTES } from '../app/routes'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { InlineAlert } from '../components/ui/InlineAlert'
import { Screen } from '../components/ui/Screen'
import { StepIndicator } from '../components/ui/StepIndicator'
import {
  canStartGame,
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

export function ReadyPage({ navigate }) {
  const { game, startGame, resetGame } = useGame()
  const [confirmReset, setConfirmReset] = useState(false)

  const ready = canStartGame(game)
  const totalData = getTotalData(game)
  const players = game?.players ?? []

  return (
    <Screen
      width="narrow"
      eyebrow={<StepIndicator steps={['Equipo', 'Registro', 'Listo']} current={3} />}
      title="Todo listo para jugar"
      description="Los datos de todo el equipo están registrados y vinculados internamente a su autor. Nadie puede ver esa relación desde la interfaz."
    >
      <div className="space-y-4">
        <InlineAlert tone="success" title="Registro completo">
          Ya no queda nadie por registrar. Los datos se mezclarán al iniciar
          la partida.
        </InlineAlert>

        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
                {game?.teamName || 'Tu equipo'}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-mist-100">
                Resumen de la preparación
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Completo
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat icon={Users} value={players.length} label="participantes" />
            <Stat icon={Database} value={totalData} label="datos registrados" />
            <Stat icon={LockKeyhole} value="Sí" label="datos bloqueados al iniciar" />
          </div>

          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-mist-500">
              Participantes
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-mist-300"
                >
                  {player.name}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-2xl border border-white/[0.07] bg-ink-900/50 p-3.5 text-xs leading-relaxed text-mist-500">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-accent-400/80"
              aria-hidden="true"
            />
            La privacidad es visual: los datos se guardan en este navegador y
            no se envían a ningún servidor. No hay cifrado frente a alguien
            que inspeccione el almacenamiento del dispositivo.
          </p>
        </Card>

        {ready ? (
          <Button size="lg" onClick={startGame} className="w-full">
            <Play className="size-4" aria-hidden="true" />
            Iniciar partida
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Button>
        ) : (
          <InlineAlert tone="warning" title="Faltan registros">
            No se puede iniciar la partida hasta que todas las personas hayan
            confirmado sus datos.
          </InlineAlert>
        )}

        <p className="text-center text-xs leading-relaxed text-mist-500">
          Al iniciar la partida, el equipo y los datos quedan bloqueados: no se
          podrán editar ni eliminar.
        </p>

        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="mx-auto flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-mist-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Descartar esta partida
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="¿Descartar la partida?"
        description="Se borrarán el equipo y todos los datos registrados de este dispositivo. Esta acción no se puede deshacer."
        confirmLabel="Descartar"
        tone="danger"
        onConfirm={() => {
          setConfirmReset(false)
          resetGame()
          navigate(ROUTES.HOME)
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </Screen>
  )
}
