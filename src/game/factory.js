import { GAME_CONFIG } from '../config/gameConfig'
import {
  GAME_STATUS,
  ROUND_PHASE,
  SCHEMA_VERSION,
} from './constants'
import { createPlayerScore } from './scoring'

export function createGame({ id, now }) {
  return {
    schemaVersion: SCHEMA_VERSION,
    id,
    createdAt: now,
    updatedAt: now,
    status: GAME_STATUS.TEAM,
    teamName: '',
    players: [],
    data: [],
    registration: { draftPlayerId: null, entries: [] },
    deck: [],
    rounds: [],
    scores: {},
    currentRoundIndex: 0,
    startedAt: null,
    finishedAt: null,
  }
}

export function createDraftEntries() {
  return Array.from({ length: GAME_CONFIG.dataPerPlayer.min }, () => ({
    text: '',
    category: '',
  }))
}

export function createEmptyDraft(playerId) {
  return { draftPlayerId: playerId, entries: createDraftEntries() }
}

export function createRound(
  dataId,
  {
    now = null,
    durationSeconds = GAME_CONFIG.roundTimer.default,
  } = {},
) {
  return {
    dataId,
    phase: ROUND_PHASE.MYSTERY,
    timer: {
      durationSeconds,
      remainingSeconds: durationSeconds,
      endsAt: null,
      running: false,
    },
    predictions: [],
    groupPrediction: null,
    result: null,
    createdAt: now,
  }
}

export function createRounds(deck, options = {}) {
  return deck.map((dataId) => createRound(dataId, options))
}

export function createScoreboard(players) {
  return Object.fromEntries(
    players.map((player) => [player.id, createPlayerScore()]),
  )
}

/**
 * Nueva partida con el mismo equipo y los mismos participantes, pero sin
 * datos, rondas ni puntuaciones anteriores. Vuelve al registro privado
 * para que cada persona escriba datos nuevos.
 */
export function createRematchGame(game, { id, now }) {
  const players = (game?.players ?? []).map((player) => ({ ...player }))
  const registration =
    players.length > 0
      ? createEmptyDraft(players[0].id)
      : { draftPlayerId: null, entries: [] }

  return {
    ...createGame({ id, now }),
    status:
      players.length >= GAME_CONFIG.minPlayers
        ? GAME_STATUS.REGISTRATION
        : GAME_STATUS.TEAM,
    teamName: game?.teamName ?? '',
    players,
    registration,
  }
}
