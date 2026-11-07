import { useState } from 'react'
import { UserRoundCheck } from 'lucide-react'
import { RegistrationForm } from '../components/game/RegistrationForm'
import { RegistrationHandoff } from '../components/game/RegistrationHandoff'
import { InlineAlert } from '../components/ui/InlineAlert'
import { Screen } from '../components/ui/Screen'
import { StepIndicator } from '../components/ui/StepIndicator'
import {
  getRegistrationDraft,
  getRegistrationProgress,
} from '../game/selectors'
import { useGame } from '../game/useGame'
import { validateDraftEntries } from '../game/validation'

const EMPTY_ERRORS = { fieldErrors: {}, formError: null }

export function RegistrationPage() {
  const { game } = useGame()
  const draft = getRegistrationDraft(game)
  const progress = getRegistrationProgress(game)

  if (!draft) {
    return (
      <Screen width="narrow" title="Registro privado">
        <InlineAlert tone="info">
          No hay ningún registro pendiente en este momento.
        </InlineAlert>
      </Screen>
    )
  }

  return (
    <Screen
      width="narrow"
      eyebrow={<StepIndicator steps={['Equipo', 'Registro', 'Listo']} current={2} />}
      title="Registro privado"
      description="Cada persona escribe sus datos a solas. El resto del equipo no debe mirar la pantalla durante este paso."
    >
      <RegistrationTurn
        key={draft.player.id}
        draft={draft}
        data={game.data}
        progress={progress}
      />
    </Screen>
  )
}

/**
 * Componente por turno. Al cambiar la persona, React lo vuelve a montar
 * con `key`, así la pantalla neutral de entrega siempre aparece primero
 * y nunca se conservan errores ni el estado del turno anterior.
 */
function RegistrationTurn({ draft, data, progress }) {
  const {
    setDraftText,
    setDraftCategory,
    addDraftEntry,
    removeDraftEntry,
    confirmRegistration,
  } = useGame()
  const [activePlayerId, setActivePlayerId] = useState(null)
  const [errors, setErrors] = useState(EMPTY_ERRORS)

  const gateOpen = activePlayerId !== draft.player.id

  function clearError(index) {
    setErrors((currentErrors) => {
      if (!currentErrors.fieldErrors[index] && !currentErrors.formError) {
        return currentErrors
      }
      const fieldErrors = { ...currentErrors.fieldErrors }
      delete fieldErrors[index]
      return { fieldErrors, formError: null }
    })
  }

  function handleTextChange(index, text) {
    clearError(index)
    setDraftText(index, text)
  }

  function handleCategoryChange(index, category) {
    clearError(index)
    setDraftCategory(index, category)
  }

  function handleConfirm() {
    const result = validateDraftEntries(draft.entries, data)
    if (!result.ok) {
      setErrors({
        fieldErrors: result.fieldErrors,
        formError: result.formError,
      })
      return
    }
    setErrors(EMPTY_ERRORS)
    confirmRegistration()
    window.scrollTo(0, 0)
  }

  if (gateOpen) {
    return (
      <RegistrationHandoff
        player={draft.player}
        completed={progress.completed}
        total={progress.total}
        onContinue={() => setActivePlayerId(draft.player.id)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <InlineAlert tone="info">
        <span className="inline-flex items-center gap-2">
          <UserRoundCheck className="size-3.5" aria-hidden="true" />
          Turno {progress.completed + 1} de {progress.total}. Nadie más debería
          ver esta pantalla.
        </span>
      </InlineAlert>

      <RegistrationForm
        playerName={draft.player.name}
        entries={draft.entries}
        fieldErrors={errors.fieldErrors}
        formError={errors.formError}
        onChangeText={handleTextChange}
        onChangeCategory={handleCategoryChange}
        onAddEntry={addDraftEntry}
        onRemoveEntry={removeDraftEntry}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
