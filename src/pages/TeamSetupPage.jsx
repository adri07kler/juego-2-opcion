import { useState } from 'react'
import {
  ArrowRight,
  LockKeyhole,
  Plus,
  UserPlus,
  Users,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Field } from '../components/ui/Field'
import { InlineAlert } from '../components/ui/InlineAlert'
import { Screen } from '../components/ui/Screen'
import { StepIndicator } from '../components/ui/StepIndicator'
import { TextInput } from '../components/ui/TextInput'
import { GAME_CONFIG } from '../config/gameConfig'
import { useGame } from '../game/useGame'
import { validatePlayerName, validateTeamName } from '../game/validation'
import { PlayerRow } from '../components/game/PlayerRow'

const EMPTY_ERRORS = { teamName: null, addPlayer: null, form: null }

export function TeamSetupPage() {
  const { game, setTeamName, addPlayer, renamePlayer, removePlayer, startRegistration } =
    useGame()
  const [nameDraft, setNameDraft] = useState('')
  const [errors, setErrors] = useState(EMPTY_ERRORS)
  const [playerToRemove, setPlayerToRemove] = useState(null)

  const players = game?.players ?? []
  const teamName = game?.teamName ?? ''
  const isFull = players.length >= GAME_CONFIG.maxPlayers
  const canContinue =
    players.length >= GAME_CONFIG.minPlayers &&
    validateTeamName(teamName) === null

  function handleAddPlayer(event) {
    event.preventDefault()
    if (isFull) return
    const message = validatePlayerName(nameDraft, players)
    if (message) {
      setErrors((current) => ({ ...current, addPlayer: message }))
      return
    }
    addPlayer(nameDraft.trim())
    setNameDraft('')
    setErrors((current) => ({ ...current, addPlayer: null, form: null }))
  }

  function handleContinue() {
    const nameError = validateTeamName(teamName)
    if (nameError) {
      setErrors((current) => ({ ...current, teamName: nameError }))
      return
    }
    if (players.length < GAME_CONFIG.minPlayers) {
      setErrors((current) => ({
        ...current,
        form: `Añade al menos ${GAME_CONFIG.minPlayers} participantes para continuar.`,
      }))
      return
    }
    setErrors(EMPTY_ERRORS)
    startRegistration()
  }

  function handleRemove() {
    if (playerToRemove) removePlayer(playerToRemove.id)
    setPlayerToRemove(null)
    setErrors(EMPTY_ERRORS)
  }

  return (
    <Screen
      width="wide"
      eyebrow={<StepIndicator steps={['Equipo', 'Registro', 'Listo']} current={1} />}
      title="Crea tu equipo"
      description="Ponle un nombre al grupo y añade a todas las personas que van a jugar. Después registrarán sus datos en privado, uno por uno."
    >
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <Card className="p-5 sm:p-6">
            <Field
              id="nombre-equipo"
              label="Nombre del equipo"
              error={errors.teamName}
              hint={`${teamName.length}/${GAME_CONFIG.teamName.maxLength} caracteres`}
            >
              <TextInput
                id="nombre-equipo"
                value={teamName}
                onChange={(event) => {
                  setTeamName(event.target.value)
                  setErrors((current) => ({ ...current, teamName: null }))
                }}
                onBlur={() => {
                  const message = validateTeamName(teamName)
                  if (message) {
                    setErrors((current) => ({ ...current, teamName: message }))
                  }
                }}
                placeholder="Los Curiosos"
                maxLength={GAME_CONFIG.teamName.maxLength}
                autoComplete="off"
              />
            </Field>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="size-4 text-accent-300" aria-hidden="true" />
              <h2 className="font-display text-base font-semibold text-mist-100">
                Añadir participante
              </h2>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-3">
              <Field
                id="nombre-participante"
                label="Nombre"
                error={errors.addPlayer}
                hint={`De ${GAME_CONFIG.playerName.minLength} a ${GAME_CONFIG.playerName.maxLength} caracteres. Sin nombres repetidos.`}
              >
                <div className="flex gap-2">
                  <TextInput
                    id="nombre-participante"
                    value={nameDraft}
                    onChange={(event) => {
                      setNameDraft(event.target.value)
                      setErrors((current) => ({ ...current, addPlayer: null }))
                    }}
                    placeholder="Nombre de la persona"
                    maxLength={GAME_CONFIG.playerName.maxLength}
                    autoComplete="off"
                    invalid={Boolean(errors.addPlayer)}
                  />
                  <Button
                    type="submit"
                    disabled={isFull}
                    className="shrink-0"
                    aria-label="Agregar participante"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Agregar</span>
                  </Button>
                </div>
              </Field>
            </form>

            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mist-500">
              <LockKeyhole
                className="mt-0.5 size-3.5 shrink-0 text-accent-400/80"
                aria-hidden="true"
              />
              Los datos de cada persona se registrarán en privado en el
              siguiente paso.
            </p>
          </Card>
        </div>

        <Card className="flex flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-accent-300" aria-hidden="true" />
              <h2 className="font-display text-base font-semibold text-mist-100">
                Participantes
              </h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-mist-400">
              {players.length} de {GAME_CONFIG.maxPlayers}
            </span>
          </div>

          {players.length === 0 ? (
            <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-mist-500">
                <Users className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium text-mist-300">
                Todavía no hay nadie
              </p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-mist-500">
                Añade al menos {GAME_CONFIG.minPlayers} personas para poder
                empezar el registro.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {players.map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  players={players}
                  onRename={renamePlayer}
                  onRemove={setPlayerToRemove}
                />
              ))}
            </ul>
          )}

          <div className="mt-5 border-t border-white/[0.06] pt-4">
            {errors.form ? (
              <InlineAlert tone="error" className="mb-3">
                {errors.form}
              </InlineAlert>
            ) : null}

            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full"
            >
              Continuar al registro
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>

            <p className="mt-3 text-center text-xs text-mist-500">
              {players.length < GAME_CONFIG.minPlayers
                ? `Faltan ${GAME_CONFIG.minPlayers - players.length} participante(s).`
                : canContinue
                  ? 'Podrás revisar el equipo antes de iniciar la partida.'
                  : 'Escribe un nombre de equipo para continuar.'}
            </p>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(playerToRemove)}
        title="¿Eliminar participante?"
        description={
          playerToRemove
            ? `${playerToRemove.name} saldrá del equipo. Todavía no hay datos registrados, así que no se perderá nada más.`
            : undefined
        }
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={handleRemove}
        onCancel={() => setPlayerToRemove(null)}
      />
    </Screen>
  )
}
