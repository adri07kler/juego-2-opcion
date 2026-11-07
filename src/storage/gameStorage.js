import { GAME_CONFIG } from '../config/gameConfig'
import {
  GAME_STATUS,
  SCHEMA_VERSION,
  isGameStatus,
} from '../game/constants'
import { createDraftEntries } from '../game/factory'
import { getCurrentRegistrationPlayer } from '../game/selectors'

export const STORAGE_KEY = 'quien-detras-del-dato/game'
export const BACKUP_KEY = `${STORAGE_KEY}/backup`

function getDefaultStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Guard estructural mínimo. No valida reglas del juego, solo que el
 * objeto tenga la forma esperada para poder restaurarlo sin errores.
 */
export function isGameShape(game) {
  if (!isPlainObject(game)) return false
  if (game.schemaVersion !== SCHEMA_VERSION) return false
  if (typeof game.id !== 'string') return false
  if (!isGameStatus(game.status)) return false
  if (typeof game.teamName !== 'string') return false
  if (!Array.isArray(game.players) || !Array.isArray(game.data)) return false
  if (!Array.isArray(game.deck) || !Array.isArray(game.rounds)) return false
  if (!isPlainObject(game.registration)) return false

  const validPlayers = game.players.every(
    (player) =>
      isPlainObject(player) &&
      typeof player.id === 'string' &&
      typeof player.name === 'string',
  )
  if (!validPlayers) return false

  const validData = game.data.every(
    (datum) =>
      isPlainObject(datum) &&
      typeof datum.id === 'string' &&
      typeof datum.authorId === 'string' &&
      typeof datum.text === 'string' &&
      typeof datum.category === 'string',
  )
  return validData
}

/**
 * Corrige inconsistencias del borrador sin exponer datos ajenos.
 */
export function normalizeGame(game) {
  const next = { ...game, registration: { ...game.registration } }
  if (next.status !== GAME_STATUS.REGISTRATION) return next

  const current = getCurrentRegistrationPlayer(next)
  if (!current) {
    return {
      ...next,
      status: GAME_STATUS.READY,
      registration: { draftPlayerId: null, entries: [] },
    }
  }

  const { draftPlayerId, entries } = next.registration
  const validEntries =
    draftPlayerId === current.id &&
    Array.isArray(entries) &&
    entries.length >= GAME_CONFIG.dataPerPlayer.min &&
    entries.length <= GAME_CONFIG.dataPerPlayer.max &&
    entries.every(
      (entry) =>
        isPlainObject(entry) &&
        typeof entry.text === 'string' &&
        typeof entry.category === 'string',
    )

  if (!validEntries) {
    return {
      ...next,
      registration: {
        draftPlayerId: current.id,
        entries: createDraftEntries(),
      },
    }
  }

  return next
}

export function saveGame(game, storage = getDefaultStorage()) {
  if (!storage) return { ok: false, issue: 'unavailable' }
  try {
    if (!game) {
      storage.removeItem(STORAGE_KEY)
      return { ok: true }
    }
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        game,
      }),
    )
    storage.removeItem(BACKUP_KEY)
    return { ok: true }
  } catch {
    return { ok: false, issue: 'unavailable' }
  }
}

export function loadGame(storage = getDefaultStorage()) {
  if (!storage) return { game: null, issue: 'unavailable' }

  let raw = null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { game: null, issue: 'unavailable' }
  }

  if (!raw) return { game: null, issue: null }

  try {
    const parsed = JSON.parse(raw)
    if (
      !isPlainObject(parsed) ||
      parsed.schemaVersion !== SCHEMA_VERSION ||
      !isGameShape(parsed.game)
    ) {
      throw new Error('invalid-game')
    }
    return { game: normalizeGame(parsed.game), issue: null }
  } catch {
    try {
      storage.setItem(BACKUP_KEY, raw)
      storage.removeItem(STORAGE_KEY)
    } catch {
      /* el respaldo es best-effort */
    }
    return { game: null, issue: 'corrupt' }
  }
}

export function clearStoredGame(storage = getDefaultStorage()) {
  if (!storage) return false
  try {
    storage.removeItem(STORAGE_KEY)
    storage.removeItem(BACKUP_KEY)
    return true
  } catch {
    return false
  }
}
