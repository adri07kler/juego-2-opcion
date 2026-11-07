import { Check, EyeOff, Plus, ShieldCheck } from 'lucide-react'
import { GAME_CONFIG } from '../../config/gameConfig'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { InlineAlert } from '../ui/InlineAlert'
import { DatumEntryCard } from './DatumEntryCard'

export function RegistrationForm({
  playerName,
  entries,
  fieldErrors = {},
  formError,
  onChangeText,
  onChangeCategory,
  onAddEntry,
  onRemoveEntry,
  onConfirm,
}) {
  const canAdd = entries.length < GAME_CONFIG.dataPerPlayer.max
  const canRemove = entries.length > GAME_CONFIG.dataPerPlayer.min

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onConfirm()
      }}
      className="space-y-4"
    >
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-300/80">
              Registro privado
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-mist-100">
              {playerName}
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-mist-300">
            <EyeOff className="size-3.5" aria-hidden="true" />
            Solo tú ves esta pantalla
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-mist-400">
          Escribe entre {GAME_CONFIG.dataPerPlayer.min} y{' '}
          {GAME_CONFIG.dataPerPlayer.max} datos reales sobre ti. El equipo los
          verá después, pero nunca verá quién los escribió.
        </p>
      </Card>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <DatumEntryCard
            key={index}
            index={index}
            entry={entry}
            error={fieldErrors[index]}
            canRemove={canRemove}
            onChangeText={onChangeText}
            onChangeCategory={onChangeCategory}
            onRemove={onRemoveEntry}
          />
        ))}
      </div>

      {canAdd ? (
        <Button
          type="button"
          variant="secondary"
          onClick={onAddEntry}
          className="w-full border-dashed"
        >
          <Plus className="size-4" aria-hidden="true" />
          Agregar un tercer dato
        </Button>
      ) : (
        <p className="text-center text-xs text-mist-500">
          Ya tienes el máximo de {GAME_CONFIG.dataPerPlayer.max} datos.
        </p>
      )}

      {formError ? <InlineAlert tone="error">{formError}</InlineAlert> : null}

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-mist-500">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-accent-400/80"
            aria-hidden="true"
          />
          Al confirmar, tus datos quedan guardados y los campos se limpian
          antes de pasar el dispositivo. Asegúrate de que nadie más esté
          mirando la pantalla.
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full">
        <Check className="size-4" aria-hidden="true" />
        Confirmar mis datos
      </Button>
    </form>
  )
}
