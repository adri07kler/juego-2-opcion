import { GAME_CONFIG } from '../config/gameConfig'
import { ACTIONS, GAME_STATUS, ROUND_PHASE } from './constants'
import {
  createEmptyDraft,
  createRounds,
  createScoreboard,
} from './factory'
import {
  arePredictionsComplete,
  getAllRegistered,
  getCurrentRegistrationPlayer,
  getPredictionTurn,
} from './selectors'
import {
  isValidTimerDuration,
  pauseRoundTimer,
  startRoundTimer,
  tickRoundTimer,
} from './rounds'
import { scoreRound } from './scoring'
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

function getActiveRound(state) {
  return state.rounds?.[state.currentRoundIndex] ?? null
}

function withActiveRound(state, now, round, patch, extra = {}) {
  const rounds = state.rounds.map((candidate, index) =>
    index === state.currentRoundIndex ? { ...round, ...patch } : candidate,
  )
  return committed(state, now, { rounds, ...extra })
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
        rounds: createRounds(action.deck, { now: action.now }),
        scores: createScoreboard(state.players),
        currentRoundIndex: 0,
        startedAt: action.now,
        finishedAt: null,
      })
    }

    case ACTIONS.SET_ROUND_TIMER_DURATION: {
      if (state.status !== GAME_STATUS.PLAYING) return state
      const round = getActiveRound(state)
      if (!round || round.phase !== ROUND_PHASE.MYSTERY) return state
      if (round.timer.running) return state
      if (!isValidTimerDuration(action.seconds)) return state

      return withActiveRound(state, action.now, round, {
        timer: {
          ...round.timer,
          durationSeconds: action.seconds,
          remainingSeconds: action.seconds,
          endsAt: null,
          running: false,
        },
      })
    }

    case ACTIONS.START_ROUND_TIMER: {
      if (state.status !== GAME_STATUS.PLAYING) return state
      const round = getActiveRound(state)
      if (!round || round.phase !== ROUND_PHASE.MYSTERY) return state

      const timer = startRoundTimer(round.timer, action.now)
      if (timer === round.timer) return state
      return withActiveRound(state, action.now, round, { timer })
    }

    case ACTIONS.PAUSE_ROUND_TIMER: {
      if (state.status !== GAME_STATUS.PLAYING) return state
      const round = getActiveRound(state)
      if (!round || round.phase !== ROUND_PHASE.MYSTERY) return state

      const timer = pauseRoundTimer(round.timer, action.now)
      if (timer === round.timer) return state
      return withActiveRound(state, action.now, round, { timer })
    }

    case ACTIONS.TICK_ROUND_TIMER: {
      if (state.status !== GAME_STATUS.PLAYING) return state
      const round = getActiveRound(state)
      if (!round || round.phase !== ROUND_PHASE.MYSTERY) return state

      const timer = tickRoundTimer(round.timer, action.now)
      if (timer === round.timer) return state
      return withActiveRound(state, action.now, round, { timer })
    }

    case ACTIONS.BEGIN_PREDICTIONS: {
      if (state.status !== GAME_STATUS.PLAYING) return state
      const round = getActiveRound(state)
      if (!round || round.phase !== ROUND_PHASE.MYSTERY) return state

      return withActiveRound(state, action.now, round, {
        phase: ROUND_PHASE.PREDICTIONS,
        timer: pauseRoundTimer(round.timer, action.now),
      })
    }

    case ACTIONS.SUBMIT_PREDICTION: {
      if (state.status !== GAME_STATUS.PLAYING) return state

      const turn = getPredictionTurn(state)
      if (!turn) return state
      const target = state.players.find(
        (player) => player.id === action.predictedAuthorId,
      )
      if (!target) return state

      const round = getActiveRound(state)
      if (!round || round.predictions.length >= state.players.length) {
        return state
      }

      const predictions = [
        ...round.predictions,
        {
          playerId: turn.player.id,
          predictedAuthorId: target.id,
          createdAt: action.now,
        },
      ]
      const completed = predictions.length === state.players.length

      return withActiveRound(state, action.now, round, {
        predictions,
        phase: completed ? ROUND_PHASE.GROUP : ROUND_PHASE.PREDICTIONS,
      })
    }

    case ACTIONS.CONFIRM_GROUP_PREDICTION: {
      if (state.status !== GAME_STATUS.PLAYING) return state
      const round = getActiveRound(state)
      if (!round || round.phase !== ROUND_PHASE.GROUP) return state
      if (!arePredictionsComplete(state, round)) return state
      if (round.groupPrediction) return state

      const target = state.players.find(
        (player) => player.id === action.predictedAuthorId,
      )
      if (!target) return state

      const datum = state.data.find((item) => item.id === round.dataId)
      if (!datum) return state

      const { scores, playerResults } = scoreRound({
        predictions: round.predictions,
        scores: state.scores,
        authorId: datum.authorId,
      })

      return withActiveRound(
        state,
        action.now,
        round,
        {
          phase: ROUND_PHASE.REVEAL,
          groupPrediction: {
            predictedAuthorId: target.id,
            confirmedAt: action.now,
          },
          result: {
            authorId: datum.authorId,
            revealedAt: action.now,
            playerResults,
            correctCount: playerResults.filter((entry) => entry.correct)
              .length,
            wrongCount: playerResults.filter((entry) => !entry.correct)
              .length,
            groupCorrect: target.id === datum.authorId,
          },
        },
        { scores },
      )
    }

    case ACTIONS.ADVANCE_ROUND: {
      if (state.status !== GAME_STATUS.PLAYING) return state
      const round = getActiveRound(state)
      if (!round || round.phase !== ROUND_PHASE.REVEAL) return state

      const nextIndex = state.currentRoundIndex + 1
      if (nextIndex < state.rounds.length) {
        return committed(state, action.now, { currentRoundIndex: nextIndex })
      }

      return committed(state, action.now, {
        status: GAME_STATUS.FINISHED,
        currentRoundIndex: state.rounds.length - 1,
        finishedAt: action.now,
      })
    }

    default:
      return state
  }
}
