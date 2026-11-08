import { GAME_CONFIG } from '../config/gameConfig'
import {
  GAME_STATUS,
  ROUND_PHASE,
  SCHEMA_VERSION,
  isGameStatus,
  isRoundPhase,
} from '../game/constants'
import { createDraftEntries, createRound } from '../game/factory'
import { isValidTimerDuration } from '../game/rounds'
import { ensureScoreboard } from '../game/scoring'
import { getCurrentRegistrationPlayer } from '../game/selectors'
import { isValidDeck } from '../game/validation'

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
 * También reconstruye el estado de las rondas si la partida se guardó
 * con una versión anterior del motor.
 */
export function normalizeGame(game) {
  const next = { ...game, registration: { ...game.registration } }
  if (next.status === GAME_STATUS.REGISTRATION) {
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

  if (
    next.status === GAME_STATUS.PLAYING ||
    next.status === GAME_STATUS.FINISHED
  ) {
    return normalizePlayState(next)
  }

  return {
    ...next,
    scores: isPlainObject(next.scores) ? next.scores : {},
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeTimer(timer, fallbackDuration) {
  const durationSeconds = isValidTimerDuration(timer?.durationSeconds)
    ? timer.durationSeconds
    : fallbackDuration
  const remainingSeconds = Number.isFinite(timer?.remainingSeconds)
    ? clamp(Math.floor(timer.remainingSeconds), 0, durationSeconds)
    : durationSeconds
  const running =
    Boolean(timer?.running) &&
    remainingSeconds > 0 &&
    typeof timer?.endsAt === 'string'

  return {
    durationSeconds,
    remainingSeconds,
    running,
    endsAt: running ? timer.endsAt : null,
  }
}

function normalizeRound(round, players, fallbackDuration) {
  if (!isPlainObject(round) || typeof round.dataId !== 'string') return null

  const playerIds = new Set(players.map((player) => player.id))
  const seenPlayers = new Set()
  const predictions = []

  if (Array.isArray(round.predictions)) {
    round.predictions.forEach((prediction) => {
      if (
        !isPlainObject(prediction) ||
        !playerIds.has(prediction.playerId) ||
        !playerIds.has(prediction.predictedAuthorId) ||
        seenPlayers.has(prediction.playerId)
      ) {
        return
      }
      seenPlayers.add(prediction.playerId)
      predictions.push({
        playerId: prediction.playerId,
        predictedAuthorId: prediction.predictedAuthorId,
        createdAt:
          typeof prediction.createdAt === 'string'
            ? prediction.createdAt
            : null,
      })
    })
  }

  const complete =
    players.length > 0 &&
    predictions.length === players.length &&
    players.every((player) => seenPlayers.has(player.id))

  let result = isPlainObject(round.result) ? round.result : null
  if (
    result &&
    (!complete ||
      !playerIds.has(result.authorId) ||
      !Array.isArray(result.playerResults))
  ) {
    result = null
  }

  let groupPrediction = null
  if (
    isPlainObject(round.groupPrediction) &&
    playerIds.has(round.groupPrediction.predictedAuthorId)
  ) {
    groupPrediction = {
      predictedAuthorId: round.groupPrediction.predictedAuthorId,
      confirmedAt:
        typeof round.groupPrediction.confirmedAt === 'string'
          ? round.groupPrediction.confirmedAt
          : null,
    }
  }
  if (!result) groupPrediction = null

  let phase = isRoundPhase(round.phase) ? round.phase : ROUND_PHASE.MYSTERY
  if (result) {
    phase = ROUND_PHASE.REVEAL
  } else if (phase === ROUND_PHASE.REVEAL) {
    phase = complete ? ROUND_PHASE.GROUP : ROUND_PHASE.PREDICTIONS
  } else if (phase === ROUND_PHASE.MYSTERY && predictions.length > 0) {
    phase = complete ? ROUND_PHASE.GROUP : ROUND_PHASE.PREDICTIONS
  } else if (phase === ROUND_PHASE.PREDICTIONS && complete) {
    phase = ROUND_PHASE.GROUP
  } else if (phase === ROUND_PHASE.GROUP && !complete) {
    phase = ROUND_PHASE.PREDICTIONS
  }

  const timer = normalizeTimer(round.timer, fallbackDuration)

  return {
    ...round,
    phase,
    timer:
      phase === ROUND_PHASE.MYSTERY
        ? timer
        : { ...timer, running: false, endsAt: null },
    predictions,
    groupPrediction,
    result,
  }
}

function normalizePlayState(game) {
  const players = game.players
  const dataIds = new Set(game.data.map((datum) => datum.id))
  const rawRounds = Array.isArray(game.rounds) ? game.rounds : []

  let deck = Array.isArray(game.deck)
    ? game.deck.filter((id) => dataIds.has(id))
    : []

  if (!isValidDeck(deck, game.data)) {
    const roundIds = rawRounds
      .map((round) => round?.dataId)
      .filter((id) => dataIds.has(id))
    deck = isValidDeck(roundIds, game.data)
      ? roundIds
      : game.data.map((datum) => datum.id)
  }

  const roundsById = new Map()
  rawRounds.forEach((round) => {
    if (
      !isPlainObject(round) ||
      !deck.includes(round.dataId) ||
      roundsById.has(round.dataId)
    ) {
      return
    }
    const normalized = normalizeRound(
      round,
      players,
      GAME_CONFIG.roundTimer.default,
    )
    if (normalized) roundsById.set(round.dataId, normalized)
  })

  const rounds = deck.map(
    (dataId) =>
      roundsById.get(dataId) ??
      createRound(dataId, {
        now: game.updatedAt,
        durationSeconds: GAME_CONFIG.roundTimer.default,
      }),
  )

  const scores = ensureScoreboard(players, game.scores)
  let status = game.status
  let currentRoundIndex = Number.isInteger(game.currentRoundIndex)
    ? clamp(game.currentRoundIndex, 0, Math.max(0, rounds.length - 1))
    : 0

  if (status === GAME_STATUS.FINISHED) {
    const allRevealed =
      rounds.length > 0 &&
      rounds.every(
        (round) =>
          round.phase === ROUND_PHASE.REVEAL && Boolean(round.result),
      )
    if (!allRevealed) {
      status = GAME_STATUS.PLAYING
    } else {
      currentRoundIndex = rounds.length - 1
    }
  }

  return {
    ...game,
    status,
    deck,
    rounds,
    scores,
    currentRoundIndex,
    finishedAt:
      status === GAME_STATUS.FINISHED
        ? game.finishedAt ?? game.updatedAt
        : null,
  }
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
