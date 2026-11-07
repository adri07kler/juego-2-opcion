import { GAME_CONFIG } from '../config/gameConfig'
import { GAME_STATUS, SCHEMA_VERSION } from './constants'

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
    currentRoundIndex: 0,
    startedAt: null,
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
