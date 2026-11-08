import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import { getInitials } from '../../utils/text'

export function PlayerChoiceGrid({
  players,
  value,
  onChange,
  disabled = false,
  label = 'Elige una persona',
}) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="sr-only">{label}</legend>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-2 sm:grid-cols-2"
      >
        {players.map((player) => {
          const selected = value === player.id
          return (
            <button
              key={player.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(player.id)}
              className={cn(
                'flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-[border-color,background-color,transform] duration-200 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60',
                selected
                  ? 'border-accent-400/60 bg-accent-500/15 text-mist-100'
                  : 'border-white/[0.08] bg-white/[0.025] text-mist-300 hover:border-accent-400/30 hover:bg-white/[0.05]',
              )}
            >
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-xl border text-xs font-semibold',
                  selected
                    ? 'border-accent-300/40 bg-accent-400/20 text-accent-100'
                    : 'border-white/10 bg-white/[0.04] text-mist-300',
                )}
              >
                {getInitials(player.name)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {player.name}
              </span>
              <span
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full border',
                  selected
                    ? 'border-accent-300/60 bg-accent-400 text-ink-950'
                    : 'border-white/15 bg-transparent',
                )}
              >
                {selected ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
