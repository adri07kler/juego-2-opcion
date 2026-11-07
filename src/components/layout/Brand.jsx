import { Sparkles } from 'lucide-react'

export function Brand({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ir al inicio"
      className="group flex items-center gap-3 rounded-full py-1 pr-2 text-left"
    >
      <span className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#a586ff,#5e34c4)] shadow-[0_10px_30px_-12px_rgba(139,92,246,0.9)] transition-transform duration-300 group-hover:scale-105">
        <span className="font-display text-lg font-bold leading-none text-white">
          ?
        </span>
        <Sparkles
          className="absolute -right-1 -top-1 size-3.5 text-accent-200 transition-transform duration-300 group-hover:rotate-12"
          aria-hidden="true"
        />
      </span>
      <span className="hidden flex-col sm:flex">
        <span className="font-display text-sm font-semibold leading-tight text-mist-100">
          ¿Quién está detrás?
        </span>
        <span className="text-[11px] leading-tight text-mist-500">
          del dato
        </span>
      </span>
    </button>
  )
}
