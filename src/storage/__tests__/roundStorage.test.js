import { describe, expect, it } from 'vitest'
import { ACTIONS, GAME_STATUS, ROUND_PHASE } from '../../game/constants'
import { createGame } from '../../game/factory'
import { gameReducer } from '../../game/reducer'
import { STORAGE_KEY, loadGame, normalizeGame, saveGame } from '../gameStorage'

const NOW = '2026-01-01T00:00:00.000Z'

function createMemoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    dump: () => Object.fromEntries(map),
  }
}

function playingGame() {
  let game = createGame({ id: 'g_round_storage', now: NOW })
  game = gameReducer(game, {
    type: ACTIONS.SET_TEAM_NAME,
    teamName: 'Equipo guardado',
    now: NOW,
  })
  ;['Ana', 'Beto'].forEach((name, index) => {
    game = gameReducer(game, {
      type: ACTIONS.ADD_PLAYER,
      player: { id: `p${index + 1}`, name, createdAt: NOW },
      now: NOW,
    })
  })
  game = gameReducer(game, { type: ACTIONS.START_REGISTRATION, now: NOW })

  ;[
    ['p1', ['Dato uno de Ana', 'Dato dos de Ana']],
    ['p2', ['Dato uno de Beto', 'Dato dos de Beto']],
  ].forEach(([playerId, texts]) => {
    texts.forEach((text, index) => {
      game = gameReducer(game, {
        type: ACTIONS.SET_DRAFT_TEXT,
        index,
        text,
        now: NOW,
      })
    })
    game = gameReducer(game, {
      type: ACTIONS.CONFIRM_REGISTRATION,
      dataIds: [0, 1].map((index) => `d_${playerId}_${index}`),
      now: NOW,
    })
  })

  game = gameReducer(game, {
    type: ACTIONS.START_GAME,
    deck: game.data.map((datum) => datum.id),
    now: NOW,
  })
  return game
}

describe('persistencia del motor de rondas', () => {
  it('recupera una predicción privada en curso sin revelar al autor', () => {
    let game = playingGame()
    const authorId = game.data.find(
      (datum) => datum.id === game.rounds[0].dataId,
    ).authorId
    game = gameReducer(game, {
      type: ACTIONS.BEGIN_PREDICTIONS,
      now: NOW,
    })
    game = gameReducer(game, {
      type: ACTIONS.SUBMIT_PREDICTION,
      predictedAuthorId: authorId,
      now: NOW,
    })

    const storage = createMemoryStorage()
    saveGame(game, storage)
    const loaded = loadGame(storage)

    expect(loaded.issue).toBeNull()
    expect(loaded.game).toEqual(game)
    expect(loaded.game.rounds[0].phase).toBe(ROUND_PHASE.PREDICTIONS)
    expect(loaded.game.rounds[0].predictions).toHaveLength(1)
    expect(loaded.game.rounds[0].result).toBeNull()
    expect(loaded.game.rounds[0]).not.toHaveProperty('authorId')
  })

  it('conserva el temporizador en marcha y el reloj de la ronda', () => {
    let game = playingGame()
    game = gameReducer(game, {
      type: ACTIONS.START_ROUND_TIMER,
      now: NOW,
    })

    const storage = createMemoryStorage()
    saveGame(game, storage)
    const { game: loaded } = loadGame(storage)

    expect(loaded.rounds[0].timer.running).toBe(true)
    expect(loaded.rounds[0].timer.endsAt).toBe(game.rounds[0].timer.endsAt)
    expect(loaded.rounds[0].timer.remainingSeconds).toBe(75)
  })

  it('reconstruye las rondas de una partida guardada por la versión anterior', () => {
    const playing = playingGame()
    const legacy = {
      ...playing,
      rounds: [],
      scores: undefined,
      currentRoundIndex: 0,
    }

    const normalized = normalizeGame(legacy)
    expect(normalized.rounds).toHaveLength(playing.data.length)
    expect(normalized.rounds.map((round) => round.dataId)).toEqual(playing.deck)
    expect(
      normalized.rounds.every((round) => round.phase === ROUND_PHASE.MYSTERY),
    ).toBe(true)
    expect(normalized.scores).toEqual({
      p1: { points: 0, streak: 0, correct: 0, wrong: 0 },
      p2: { points: 0, streak: 0, correct: 0, wrong: 0 },
    })
  })

  it('no permite recuperar una revelación sin votos completos', () => {
    const playing = playingGame()
    const tampered = {
      ...playing,
      rounds: playing.rounds.map((round, index) =>
        index === 0
          ? {
              ...round,
              phase: ROUND_PHASE.REVEAL,
              predictions: [],
              result: {
                authorId: playing.data[0].authorId,
                playerResults: [],
              },
            }
          : round,
      ),
    }

    const normalized = normalizeGame(tampered)
    expect(normalized.rounds[0].phase).toBe(ROUND_PHASE.PREDICTIONS)
    expect(normalized.rounds[0].result).toBeNull()
  })

  it('degrada una partida finalizada con rondas incompletas', () => {
    const playing = playingGame()
    const normalized = normalizeGame({
      ...playing,
      status: GAME_STATUS.FINISHED,
      finishedAt: NOW,
    })

    expect(normalized.status).toBe(GAME_STATUS.PLAYING)
    expect(normalized.finishedAt).toBeNull()
  })

  it('acepta el guardado de una partida con motor de rondas', () => {
    const storage = createMemoryStorage()
    const game = playingGame()
    saveGame(game, storage)
    expect(storage.getItem(STORAGE_KEY)).toBeTruthy()
    expect(loadGame(storage).issue).toBeNull()
  })
})
