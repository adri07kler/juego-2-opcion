import { GAME_CONFIG } from '../config/gameConfig'
import {
  GAME_STATUS,
  ROUND_PHASE,
  SCHEMA_VERSION,
} from './constants'

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
    players.map((player) => [
      player.id,
      { points: 0, streak: 0, correct: 0, wrong: 0 },
    ]),
  )
}
