import { GAME_CONFIG } from '../config/gameConfig'

function toMs(value) {
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

export function isValidTimerDuration(value) {
  return (
    Number.isInteger(value) &&
    value >= GAME_CONFIG.roundTimer.min &&
    value <= GAME_CONFIG.roundTimer.max
  )
}

/**
 * Segundos restantes según el reloj. Mientras corre usamos `endsAt`
 * para que una recarga no congele ni reinicie la cuenta atrás.
 */
export function getTimerRemaining(timer, now) {
  if (!timer?.running) return Math.max(0, timer?.remainingSeconds ?? 0)

  const end = toMs(timer.endsAt)
  const current = toMs(now)
  if (end === null || current === null) {
    return Math.max(0, timer.remainingSeconds ?? 0)
  }

  const seconds = Math.ceil((end - current) / 1000)
  return Math.min(
    timer.durationSeconds ?? GAME_CONFIG.roundTimer.default,
    Math.max(0, seconds),
  )
}

export function startRoundTimer(timer, now) {
  if (!timer || timer.running || timer.remainingSeconds <= 0) return timer
  const current = toMs(now)
  if (current === null) return timer

  return {
    ...timer,
    running: true,
    endsAt: new Date(current + timer.remainingSeconds * 1000).toISOString(),
  }
}

export function pauseRoundTimer(timer, now) {
  if (!timer?.running) return timer
  return {
    ...timer,
    running: false,
    endsAt: null,
    remainingSeconds: getTimerRemaining(timer, now),
  }
}

export function tickRoundTimer(timer, now) {
  if (!timer?.running) return timer

  const remainingSeconds = getTimerRemaining(timer, now)
  if (remainingSeconds === timer.remainingSeconds) return timer

  return {
    ...timer,
    remainingSeconds,
    running: remainingSeconds > 0,
    endsAt: remainingSeconds > 0 ? timer.endsAt : null,
  }
}

export function formatTimer(seconds) {
  const safe = Math.max(0, Math.floor(seconds ?? 0))
  const minutes = Math.floor(safe / 60)
  const rest = String(safe % 60).padStart(2, '0')
  return `${minutes}:${rest}`
}
