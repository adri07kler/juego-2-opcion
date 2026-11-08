import { useEffect, useRef } from 'react'
import { useGame } from '../game/useGame'

/**
 * Mantiene el reloj de la ronda activo solo cuando la fase lo permite.
 * Al montar se descuenta el tiempo transcurrido desde `endsAt`, así
 * recargar la página no reinicia la cuenta atrás.
 */
export function useRoundTimer(timer) {
  const { tickRoundTimer } = useGame()
  const tickRef = useRef(tickRoundTimer)

  useEffect(() => {
    tickRef.current = tickRoundTimer
  }, [tickRoundTimer])

  const running = Boolean(timer?.running)

  useEffect(() => {
    if (!running) return undefined

    const tick = () => tickRef.current()
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [running])
}
