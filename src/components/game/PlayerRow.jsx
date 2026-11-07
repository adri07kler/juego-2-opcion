import { useState } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { getInitials } from '../../utils/text'
import { validatePlayerName } from '../../game/validation'
import { Button } from '../ui/Button'
import { TextInput } from '../ui/TextInput'

export function PlayerRow({ player, players, disabled, onRename, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(player.name)
  const [error, setError] = useState(null)

  function startEditing() {
    setValue(player.name)
    setError(null)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setError(null)
  }

  function save() {
    const message = validatePlayerName(value, players, {
      excludePlayerId: player.id,
    })
    if (message) {
      setError(message)
      return
    }
    onRename(player.id, value.trim())
    setEditing(false)
    setError(null)
  }

  if (editing) {
    return (
      <li className="rounded-2xl border border-accent-400/25 bg-accent-500/[0.06] p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
          className="flex flex-col gap-2"
        >
          <label htmlFor={`editar-${player.id}`} className="sr-only">
            Nuevo nombre para {player.name}
          </label>
          <div className="flex gap-2">
            <TextInput
              id={`editar-${player.id}`}
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                setError(null)
              }}
              invalid={Boolean(error)}
              autoFocus
              maxLength={24}
            />
            <Button
              type="submit"
              size="sm"
              aria-label="Guardar nombre"
              className="shrink-0 px-3"
            >
              <Check className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              aria-label="Cancelar edición"
              className="shrink-0 px-3"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
          {error ? (
            <p role="alert" className="text-xs text-red-300">
              {error}
            </p>
          ) : null}
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 transition-colors hover:border-white/10">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent-400/20 bg-accent-500/10 text-xs font-semibold text-accent-200">
        {getInitials(player.name)}
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-mist-100">
        {player.name}
      </p>
      {disabled ? null : (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={startEditing}
            aria-label={`Editar a ${player.name}`}
            className="grid size-9 place-items-center rounded-full text-mist-400 transition-colors hover:bg-white/[0.06] hover:text-mist-100"
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(player)}
            aria-label={`Eliminar a ${player.name}`}
            className="grid size-9 place-items-center rounded-full text-mist-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </li>
  )
}
