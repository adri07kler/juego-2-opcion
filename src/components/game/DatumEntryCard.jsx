import { Trash2 } from 'lucide-react'
import { DATUM_CATEGORIES, GAME_CONFIG } from '../../config/gameConfig'
import { Field } from '../ui/Field'
import { Select } from '../ui/Select'
import { TextArea } from '../ui/TextArea'

export function DatumEntryCard({
  index,
  entry,
  error,
  canRemove,
  onChangeText,
  onChangeCategory,
  onRemove,
}) {
  const id = `dato-${index}`

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-ink-900/50 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-300/80">
          Dato {index + 1}
        </p>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-mist-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Quitar
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        <Field
          id={`${id}-texto`}
          label="Tu dato"
          error={error}
          hint={`${entry.text.length}/${GAME_CONFIG.datum.maxLength} caracteres`}
        >
          <TextArea
            id={`${id}-texto`}
            value={entry.text}
            onChange={(event) => onChangeText(index, event.target.value)}
            invalid={Boolean(error)}
            placeholder="Algo que el equipo no sepa de ti…"
            maxLength={GAME_CONFIG.datum.maxLength}
            rows={3}
          />
        </Field>

        <Field
          id={`${id}-categoria`}
          label="Categoría"
          optional
          hint="Sirve solo para ordenar el dato. No revela al autor."
        >
          <Select
            id={`${id}-categoria`}
            value={entry.category}
            onChange={(event) => onChangeCategory(index, event.target.value)}
          >
            <option value="">Sin categoría</option>
            {DATUM_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  )
}
