export function BackgroundDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="decor-grid absolute inset-0" />
      <div className="animate-drift absolute left-1/2 top-[-22rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-accent-600/20 blur-[140px]" />
      <div className="absolute bottom-[-18rem] right-[-12rem] h-[34rem] w-[34rem] rounded-full bg-accent-500/10 blur-[140px]" />
    </div>
  )
}
