import { describe, expect, it } from 'vitest'
import {
  ACTIONS,
  GAME_STATUS,
  ROUND_PHASE,
  SCHEMA_VERSION,
} from '../../game/constants'
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

function playCurrentRound(game, { correct = true } = {}) {
  const round = game.rounds[game.currentRoundIndex]
  const authorId = game.data.find((datum) => datum.id === round.dataId)
    .authorId
  const wrongTarget = game.players.find(
    (player) => player.id !== authorId,
  ).id
  const target = correct ? authorId : wrongTarget

  let next = gameReducer(game, {
    type: ACTIONS.BEGIN_PREDICTIONS,
    now: NOW,
  })
  next.players.forEach(() => {
    next = gameReducer(next, {
      type: ACTIONS.SUBMIT_PREDICTION,
      predictedAuthorId: target,
      now: NOW,
    })
  })
  next = gameReducer(next, {
    type: ACTIONS.CONFIRM_GROUP_PREDICTION,
    predictedAuthorId: target,
    now: NOW,
  })
  return gameReducer(next, { type: ACTIONS.ADVANCE_ROUND, now: NOW })
}

function finishedGame() {
  let game = playingGame()
  for (let index = 0; index < game.rounds.length; index += 1) {
    game = playCurrentRound(game)
  }
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
      p1: { points: 0, streak: 0, bestStreak: 0, correct: 0, wrong: 0 },
      p2: { points: 0, streak: 0, bestStreak: 0, correct: 0, wrong: 0 },
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

  it('no duplica puntos al guardar y recargar varias veces una partida finalizada', () => {
    const finished = finishedGame()
    expect(finished.status).toBe(GAME_STATUS.FINISHED)
    expect(finished.scores).toEqual({
      p1: { points: 45, streak: 4, bestStreak: 4, correct: 4, wrong: 0 },
      p2: { points: 45, streak: 4, bestStreak: 4, correct: 4, wrong: 0 },
    })

    const storage = createMemoryStorage()
    saveGame(finished, storage)

    const firstLoad = loadGame(storage)
    expect(firstLoad.issue).toBeNull()
    expect(firstLoad.game.scores).toEqual(finished.scores)
    expect(firstLoad.game.rounds.map((round) => round.dataId)).toEqual(
      finished.rounds.map((round) => round.dataId),
    )

    saveGame(firstLoad.game, storage)
    const secondLoad = loadGame(storage)
    expect(secondLoad.game.scores).toEqual(finished.scores)
    expect(secondLoad.game.rounds).toHaveLength(finished.rounds.length)
    expect(
      new Set(secondLoad.game.rounds.map((round) => round.dataId)).size,
    ).toBe(finished.rounds.length)
  })

  it('recalcula las puntuaciones desde las rondas y descarta totales manipulados', () => {
    const finished = finishedGame()
    const tampered = {
      ...finished,
      scores: {
        ...finished.scores,
        p1: {
          points: 9999,
          streak: 4,
          bestStreak: 99,
          correct: 99,
          wrong: 0,
        },
      },
    }
    const storage = createMemoryStorage()
    saveGame(tampered, storage)

    const { game } = loadGame(storage)
    expect(game.scores).toEqual(finished.scores)
    expect(game.scores.p1.points).toBe(45)
    expect(game.scores.p1.bestStreak).toBe(4)
  })

  it('regenera los resultados individuales guardados en vez de confiar en ellos', () => {
    const finished = finishedGame()
    const tampered = {
      ...finished,
      rounds: finished.rounds.map((round, index) =>
        index === 0
          ? {
              ...round,
              result: {
                ...round.result,
                playerResults: [],
                correctCount: 99,
                wrongCount: 99,
                groupCorrect: false,
              },
            }
          : round,
      ),
    }

    const normalized = normalizeGame(tampered)
    expect(normalized.rounds[0].result.playerResults).toHaveLength(2)
    expect(normalized.rounds[0].result.correctCount).toBe(2)
    expect(normalized.rounds[0].result.wrongCount).toBe(0)
    expect(normalized.rounds[0].result.groupCorrect).toBe(true)
    expect(normalized.scores).toEqual(finished.scores)
  })

  it('elimina rondas duplicadas al recuperar una partida', () => {
    const finished = finishedGame()
    const duplicated = {
      ...finished,
      rounds: [...finished.rounds, finished.rounds[0]],
    }

    const normalized = normalizeGame(duplicated)
    expect(normalized.rounds).toHaveLength(finished.rounds.length)
    expect(
      new Set(normalized.rounds.map((round) => round.dataId)).size,
    ).toBe(finished.rounds.length)
    expect(normalized.scores).toEqual(finished.scores)
  })

  it('descarta una revelación cuyo autor no coincide con el dato', () => {
    const playing = playingGame()
    const round = playing.rounds[0]
    const datum = playing.data.find((item) => item.id === round.dataId)
    const wrongAuthorId = playing.players.find(
      (player) => player.id !== datum.authorId,
    ).id
    const tampered = {
      ...playing,
      rounds: playing.rounds.map((item, index) =>
        index === 0
          ? {
              ...item,
              phase: ROUND_PHASE.REVEAL,
              predictions: playing.players.map((player) => ({
                playerId: player.id,
                predictedAuthorId: wrongAuthorId,
                createdAt: NOW,
              })),
              groupPrediction: {
                predictedAuthorId: wrongAuthorId,
                confirmedAt: NOW,
              },
              result: {
                authorId: wrongAuthorId,
                revealedAt: NOW,
                playerResults: [],
                correctCount: 2,
                wrongCount: 0,
                groupCorrect: true,
              },
            }
          : item,
      ),
    }

    const normalized = normalizeGame(tampered)
    expect(normalized.rounds[0].result).toBeNull()
    expect(normalized.rounds[0].phase).toBe(ROUND_PHASE.GROUP)
    expect(normalized.scores.p1.points).toBe(0)
  })

  it('migra una partida de esquema 1 y reconstruye la mejor racha', () => {
    const finished = finishedGame()
    const legacyScores = Object.fromEntries(
      Object.entries(finished.scores).map(([playerId, score]) => [
        playerId,
        {
          points: score.points,
          streak: score.streak,
          correct: score.correct,
          wrong: score.wrong,
        },
      ]),
    )
    const legacyGame = {
      ...finished,
      schemaVersion: 1,
      scores: legacyScores,
    }

    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: 1,
        savedAt: NOW,
        game: legacyGame,
      }),
    })

    const loaded = loadGame(storage)
    expect(loaded.issue).toBeNull()
    expect(loaded.game.schemaVersion).toBe(SCHEMA_VERSION)
    expect(loaded.game.scores).toEqual(finished.scores)
    expect(loaded.game.scores.p1.bestStreak).toBe(4)
  })
})
