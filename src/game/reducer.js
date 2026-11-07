import { GAME_CONFIG } from '../config/gameConfig'
import { ACTIONS, GAME_STATUS } from './constants'
import { createEmptyDraft } from './factory'
import {
  getAllRegistered,
  getCurrentRegistrationPlayer,
} from './selectors'
import {
  isValidCategory,
  isValidDeck,
  validateDraftEntries,
  validatePlayerName,
  validateTeamName,
} from './validation'

function committed(state, now, patch = {}) {
  return { ...state, ...patch, updatedAt: now }
}

/**
 * Asegura que el borrador pertenece a la persona del turno actual.
 * Si no coincide, se descarta para no exponer datos de otra persona.
 */
function ensureCurrentDraft(state) {
  const current = getCurrentRegistrationPlayer(state)
  if (!current) return state

  const registration = state.registration
  const entries = registration?.entries
  const isValidDraft =
    registration?.draftPlayerId === current.id &&
    Array.isArray(entries) &&
    entries.length >= GAME_CONFIG.dataPerPlayer.min &&
    entries.length <= GAME_CONFIG.dataPerPlayer.max

  if (isValidDraft) return state
  return { ...state, registration: createEmptyDraft(current.id) }
}

function draftPatch(state, entries) {
  return {
    registration: { ...state.registration, entries },
  }
}

export function gameReducer(state, action) {
  if (!state) {
    return action.type === ACTIONS.NEW_GAME ? action.game : state
  }

  switch (action.type) {
    case ACTIONS.NEW_GAME:
      return action.game

    case ACTIONS.RESET:
      return null

    case ACTIONS.SET_TEAM_NAME: {
      if (state.status !== GAME_STATUS.TEAM) return state
      return committed(state, action.now, {
        teamName: String(action.teamName ?? '').slice(
          0,
          GAME_CONFIG.teamName.maxLength,
        ),
      })
    }

    case ACTIONS.ADD_PLAYER: {
      if (state.status !== GAME_STATUS.TEAM) return state
      if (state.players.length >= GAME_CONFIG.maxPlayers) return state
      if (
        !action.player ||
        validatePlayerName(action.player.name, state.players)
      ) {
        return state
      }
      return committed(state, action.now, {
        players: [
          ...state.players,
          { ...action.player, name: action.player.name.trim() },
        ],
      })
    }

    case ACTIONS.RENAME_PLAYER: {
      if (state.status !== GAME_STATUS.TEAM) return state
      const target = state.players.find(
        (player) => player.id === action.playerId,
      )
      if (!target) return state
      const error = validatePlayerName(action.name, state.players, {
        excludePlayerId: target.id,
      })
      if (error) return state

      return committed(state, action.now, {
        players: state.players.map((player) =>
          player.id === target.id
            ? { ...player, name: action.name.trim() }
            : player,
        ),
      })
    }

    case ACTIONS.REMOVE_PLAYER: {
      if (state.status !== GAME_STATUS.TEAM) return state
      if (!state.players.some((player) => player.id === action.playerId)) {
        return state
      }
      return committed(state, action.now, {
        players: state.players.filter(
          (player) => player.id !== action.playerId,
        ),
      })
    }

    case ACTIONS.START_REGISTRATION: {
      if (state.status !== GAME_STATUS.TEAM) return state
      if (validateTeamName(state.teamName)) return state
      if (state.players.length < GAME_CONFIG.minPlayers) return state
      if (state.players.length > GAME_CONFIG.maxPlayers) return state

      return committed(state, action.now, {
        status: GAME_STATUS.REGISTRATION,
        registration: createEmptyDraft(state.players[0].id),
      })
    }

    case ACTIONS.SET_DRAFT_TEXT:
    case ACTIONS.SET_DRAFT_CATEGORY:
    case ACTIONS.ADD_DRAFT_ENTRY:
    case ACTIONS.REMOVE_DRAFT_ENTRY: {
      if (state.status !== GAME_STATUS.REGISTRATION) return state
      const withDraft = ensureCurrentDraft(state)
      const entries = withDraft.registration.entries

      if (action.type === ACTIONS.ADD_DRAFT_ENTRY) {
        if (entries.length >= GAME_CONFIG.dataPerPlayer.max) return state
        return committed(
          withDraft,
          action.now,
          draftPatch(withDraft, [
            ...entries,
            { text: '', category: '' },
          ]),
        )
      }

      if (action.type === ACTIONS.REMOVE_DRAFT_ENTRY) {
        if (entries.length <= GAME_CONFIG.dataPerPlayer.min) return state
        if (!entries[action.index]) return state
        return committed(
          withDraft,
          action.now,
          draftPatch(
            withDraft,
            entries.filter((_, index) => index !== action.index),
          ),
        )
      }

      if (!entries[action.index]) return state
      const nextEntries = entries.map((entry, index) => {
        if (index !== action.index) return entry
        if (action.type === ACTIONS.SET_DRAFT_TEXT) {
          return {
            ...entry,
            text: String(action.text ?? '').slice(
              0,
              GAME_CONFIG.datum.maxLength,
            ),
          }
        }
        return isValidCategory(action.category)
          ? { ...entry, category: action.category }
          : entry
      })

      return committed(
        withDraft,
        action.now,
        draftPatch(withDraft, nextEntries),
      )
    }

    case ACTIONS.CONFIRM_REGISTRATION: {
      if (state.status !== GAME_STATUS.REGISTRATION) return state

      const current = getCurrentRegistrationPlayer(state)
      if (!current) return state
      if (state.registration?.draftPlayerId !== current.id) return state

      const entries = state.registration.entries
      if (!validateDraftEntries(entries, state.data).ok) return state

      const dataIds = action.dataIds
      if (!Array.isArray(dataIds) || dataIds.length !== entries.length) {
        return state
      }

      const existingIds = new Set(state.data.map((datum) => datum.id))
      if (
        new Set(dataIds).size !== dataIds.length ||
        dataIds.some(
          (id) => typeof id !== 'string' || existingIds.has(id),
        )
      ) {
        return state
      }

      const now = action.now
      const newData = entries.map((entry, index) => ({
        id: dataIds[index],
        authorId: current.id,
        text: entry.text.trim(),
        category: entry.category || '',
        createdAt: now,
      }))
      const data = [...state.data, ...newData]
      const nextPlayer = getCurrentRegistrationPlayer({ ...state, data })

      if (nextPlayer) {
        return committed(state, now, {
          data,
          registration: createEmptyDraft(nextPlayer.id),
        })
      }

      return committed(state, now, {
        data,
        status: GAME_STATUS.READY,
        registration: { draftPlayerId: null, entries: [] },
      })
    }

    case ACTIONS.START_GAME: {
      if (state.status !== GAME_STATUS.READY) return state
      if (!getAllRegistered(state)) return state
      if (!isValidDeck(action.deck, state.data)) return state

      return committed(state, action.now, {
        status: GAME_STATUS.PLAYING,
        deck: action.deck,
        rounds: [],
        currentRoundIndex: 0,
        startedAt: action.now,
      })
    }

    default:
      return state
  }
}
