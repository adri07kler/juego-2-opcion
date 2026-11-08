import { describe, expect, it } from 'vitest'
import { ACTIONS, GAME_STATUS, ROUND_PHASE } from '../constants'
import { createGame, createRematchGame } from '../factory'
import { gameReducer } from '../reducer'
import {
  getGameSummary,
  getPredictionTurn,
  getRanking,
  getRoundAuthor,
} from '../selectors'
import { buildDeck } from '../shuffle'

const NOW = '2026-01-01T00:00:00.000Z'

function at(seconds) {
  return new Date(Date.parse(NOW) + seconds * 1000).toISOString()
}

function createTeam(playerNames) {
  let game = createGame({ id: 'g_rounds', now: NOW })
  game = gameReducer(game, {
    type: ACTIONS.SET_TEAM_NAME,
    teamName: 'Equipo de prueba',
    now: NOW,
  })
  playerNames.forEach((name, index) => {
    game = gameReducer(game, {
      type: ACTIONS.ADD_PLAYER,
      player: { id: `p${index + 1}`, name, createdAt: NOW },
      now: NOW,
    })
  })
  return game
}

function setDraft(game, texts) {
  return texts.reduce(
    (next, text, index) =>
      gameReducer(next, {
        type: ACTIONS.SET_DRAFT_TEXT,
        index,
        text,
        now: NOW,
      }),
    game,
  )
}

function confirm(game, authorId, count) {
  return gameReducer(game, {
    type: ACTIONS.CONFIRM_REGISTRATION,
    dataIds: Array.from(
      { length: count },
      (_, index) => `d_${authorId}_${index}`,
    ),
    now: NOW,
  })
}

function readyGame() {
  let game = createTeam(['Ana', 'Beto', 'Carla'])
  game = gameReducer(game, { type: ACTIONS.START_REGISTRATION, now: NOW })
  game = setDraft(game, ['Dato uno de Ana', 'Dato dos de Ana'])
  game = confirm(game, 'p1', 2)
  game = setDraft(game, ['Dato uno de Beto', 'Dato dos de Beto'])
  game = gameReducer(game, { type: ACTIONS.ADD_DRAFT_ENTRY, now: NOW })
  game = setDraft(game, [
    'Dato uno de Beto',
    'Dato dos de Beto',
    'Dato tres de Beto',
  ])
  game = confirm(game, 'p2', 3)
  game = setDraft(game, ['Dato uno de Carla', 'Dato dos de Carla'])
  game = confirm(game, 'p3', 2)
  return game
}

function startPlaying(game) {
  return gameReducer(game, {
    type: ACTIONS.START_GAME,
    deck: buildDeck(game.data).map((datum) => datum.id),
    now: NOW,
  })
}

function currentAuthorId(game) {
  const round = game.rounds[game.currentRoundIndex]
  return game.data.find((datum) => datum.id === round.dataId).authorId
}

function begin(game) {
  return gameReducer(game, {
    type: ACTIONS.BEGIN_PREDICTIONS,
    now: NOW,
  })
}

function submitAll(game, targetFor) {
  return game.players.reduce(
    (next, player) =>
      gameReducer(next, {
        type: ACTIONS.SUBMIT_PREDICTION,
        predictedAuthorId: targetFor(player, next),
        now: NOW,
      }),
    begin(game),
  )
}

function confirmGroup(game, predictedAuthorId) {
  return gameReducer(game, {
    type: ACTIONS.CONFIRM_GROUP_PREDICTION,
    predictedAuthorId,
    now: NOW,
  })
}

function playCurrentRound(game, { correct = true, target } = {}) {
  const authorId = currentAuthorId(game)
  const fallbackTarget = game.players.find(
    (player) => player.id !== authorId,
  ).id
  const targetFor = () =>
    correct ? authorId : (target ?? fallbackTarget)
  return confirmGroup(submitAll(game, targetFor), targetFor())
}

describe('motor de rondas · preparación', () => {
  it('crea una ronda por dato, sin repetir y con el autor oculto', () => {
    const ready = readyGame()
    const game = startPlaying(ready)
    const round = game.rounds[0]

    expect(game.status).toBe(GAME_STATUS.PLAYING)
    expect(game.rounds).toHaveLength(game.data.length)
    expect(game.rounds.map((item) => item.dataId)).toEqual(game.deck)
    expect(new Set(game.deck).size).toBe(game.data.length)
    expect(round.phase).toBe(ROUND_PHASE.MYSTERY)
    expect(round.predictions).toEqual([])
    expect(round.groupPrediction).toBeNull()
    expect(round.result).toBeNull()
    expect(round).not.toHaveProperty('authorId')
    expect(game.scores).toEqual({
      p1: { points: 0, streak: 0, bestStreak: 0, correct: 0, wrong: 0 },
      p2: { points: 0, streak: 0, bestStreak: 0, correct: 0, wrong: 0 },
      p3: { points: 0, streak: 0, bestStreak: 0, correct: 0, wrong: 0 },
    })
  })

  it('no vuelve a iniciar la partida ni acepta un mazo incompleto', () => {
    const game = startPlaying(readyGame())
    expect(
      gameReducer(game, {
        type: ACTIONS.START_GAME,
        deck: game.deck,
        now: NOW,
      }),
    ).toBe(game)

    const ready = readyGame()
    expect(
      gameReducer(ready, {
        type: ACTIONS.START_GAME,
        deck: ready.data.slice(1).map((datum) => datum.id),
        now: NOW,
      }),
    ).toBe(ready)
  })
})

describe('motor de rondas · temporizador', () => {
  it('inicia, pausa y reanuda descontando el tiempo real', () => {
    let game = startPlaying(readyGame())
    game = gameReducer(game, {
      type: ACTIONS.SET_ROUND_TIMER_DURATION,
      seconds: 90,
      now: NOW,
    })
    expect(game.rounds[0].timer).toMatchObject({
      durationSeconds: 90,
      remainingSeconds: 90,
      running: false,
    })

    game = gameReducer(game, {
      type: ACTIONS.START_ROUND_TIMER,
      now: NOW,
    })
    game = gameReducer(game, {
      type: ACTIONS.TICK_ROUND_TIMER,
      now: at(10),
    })
    expect(game.rounds[0].timer.remainingSeconds).toBe(80)
    expect(game.rounds[0].timer.running).toBe(true)

    game = gameReducer(game, {
      type: ACTIONS.PAUSE_ROUND_TIMER,
      now: at(10),
    })
    expect(game.rounds[0].timer).toMatchObject({
      remainingSeconds: 80,
      running: false,
      endsAt: null,
    })

    game = gameReducer(game, {
      type: ACTIONS.START_ROUND_TIMER,
      now: at(10),
    })
    game = gameReducer(game, {
      type: ACTIONS.TICK_ROUND_TIMER,
      now: at(20),
    })
    expect(game.rounds[0].timer.remainingSeconds).toBe(70)
  })

  it('se detiene al llegar a cero y rechaza duraciones fuera de rango', () => {
    let game = startPlaying(readyGame())
    game = gameReducer(game, {
      type: ACTIONS.SET_ROUND_TIMER_DURATION,
      seconds: 60,
      now: NOW,
    })
    game = gameReducer(game, {
      type: ACTIONS.START_ROUND_TIMER,
      now: NOW,
    })
    game = gameReducer(game, {
      type: ACTIONS.TICK_ROUND_TIMER,
      now: at(60),
    })
    expect(game.rounds[0].timer).toMatchObject({
      remainingSeconds: 0,
      running: false,
      endsAt: null,
    })

    const frozen = game
    const invalid = [59, 91, 75.5, '80', null]
    invalid.forEach((seconds) => {
      expect(
        gameReducer(game, {
          type: ACTIONS.SET_ROUND_TIMER_DURATION,
          seconds,
          now: NOW,
        }),
      ).toBe(frozen)
    })
  })

  it('no avanza durante las predicciones ni durante la votación grupal', () => {
    let game = startPlaying(readyGame())
    game = gameReducer(game, {
      type: ACTIONS.START_ROUND_TIMER,
      now: NOW,
    })
    game = begin(game)
    const frozen = game

    expect(
      gameReducer(game, {
        type: ACTIONS.TICK_ROUND_TIMER,
        now: at(30),
      }),
    ).toBe(frozen)
    expect(
      gameReducer(game, {
        type: ACTIONS.START_ROUND_TIMER,
        now: at(30),
      }),
    ).toBe(frozen)
    expect(
      gameReducer(game, {
        type: ACTIONS.SET_ROUND_TIMER_DURATION,
        seconds: 90,
        now: at(30),
      }),
    ).toBe(frozen)
  })
})

describe('motor de rondas · predicciones y revelación', () => {
  it('recorre a todos en orden y no revela antes de completar los votos', () => {
    let game = startPlaying(readyGame())
    const authorId = currentAuthorId(game)
    game = begin(game)

    expect(getPredictionTurn(game).player.id).toBe('p1')
    expect(getPredictionTurn(game).position).toBe(1)

    game = gameReducer(game, {
      type: ACTIONS.SUBMIT_PREDICTION,
      predictedAuthorId: authorId,
      now: NOW,
    })
    expect(game.rounds[0].predictions).toHaveLength(1)
    expect(game.rounds[0].predictions[0]).toMatchObject({
      playerId: 'p1',
      predictedAuthorId: authorId,
    })
    expect(getPredictionTurn(game).player.id).toBe('p2')

    const partial = game
    expect(
      gameReducer(partial, {
        type: ACTIONS.CONFIRM_GROUP_PREDICTION,
        predictedAuthorId: authorId,
        now: NOW,
      }),
    ).toBe(partial)
    expect(
      gameReducer(partial, {
        type: ACTIONS.ADVANCE_ROUND,
        now: NOW,
      }),
    ).toBe(partial)

    game = gameReducer(game, {
      type: ACTIONS.SUBMIT_PREDICTION,
      predictedAuthorId: authorId,
      now: NOW,
    })
    game = gameReducer(game, {
      type: ACTIONS.SUBMIT_PREDICTION,
      predictedAuthorId: authorId,
      now: NOW,
    })

    expect(game.rounds[0].phase).toBe(ROUND_PHASE.GROUP)
    expect(getPredictionTurn(game)).toBeNull()
    expect(game.rounds[0].result).toBeNull()

    const repeatedPrediction = game
    expect(
      gameReducer(game, {
        type: ACTIONS.SUBMIT_PREDICTION,
        predictedAuthorId: authorId,
        now: NOW,
      }),
    ).toBe(repeatedPrediction)

    game = confirmGroup(game, authorId)
    expect(game.rounds[0].phase).toBe(ROUND_PHASE.REVEAL)
    expect(game.rounds[0].result.correctCount).toBe(3)
    expect(game.rounds[0].result.wrongCount).toBe(0)
    expect(game.rounds[0].result.groupCorrect).toBe(true)
    expect(game.rounds[0].result.authorId).toBe(authorId)
    expect(getRoundAuthor(game, game.rounds[0]).id).toBe(authorId)
    expect(game.scores.p1.points).toBe(10)
    expect(game.scores.p2.points).toBe(10)
    expect(game.scores.p3.points).toBe(10)

    const revealed = game
    expect(
      gameReducer(revealed, {
        type: ACTIONS.CONFIRM_GROUP_PREDICTION,
        predictedAuthorId: authorId,
        now: NOW,
      }),
    ).toBe(revealed)
  })

  it('bloquea la respuesta grupal y rechaza objetivos ajenos', () => {
    let game = startPlaying(readyGame())
    const authorId = currentAuthorId(game)
    game = submitAll(game, () => authorId)

    const invalid = gameReducer(game, {
      type: ACTIONS.CONFIRM_GROUP_PREDICTION,
      predictedAuthorId: 'p_inexistente',
      now: NOW,
    })
    expect(invalid).toBe(game)

    game = confirmGroup(game, authorId)
    const locked = game
    expect(
      gameReducer(game, {
        type: ACTIONS.CONFIRM_GROUP_PREDICTION,
        predictedAuthorId: game.players[0].id,
        now: NOW,
      }),
    ).toBe(locked)
  })

  it('puntúa fallos, reinicia rachas y muestra aciertos individuales', () => {
    let game = startPlaying(readyGame())
    const authorId = currentAuthorId(game)
    const wrongTarget = game.players.find(
      (player) => player.id !== authorId,
    ).id

    game = submitAll(game, (player) =>
      player.id === 'p1' ? authorId : wrongTarget,
    )
    game = confirmGroup(game, wrongTarget)

    const result = game.rounds[0].result
    expect(result.correctCount).toBe(1)
    expect(result.wrongCount).toBe(2)
    expect(result.groupCorrect).toBe(false)
    expect(
      result.playerResults.find((entry) => entry.playerId === 'p1'),
    ).toMatchObject({
      correct: true,
      pointsAwarded: 10,
      streakAfter: 1,
    })
    expect(
      result.playerResults.find((entry) => entry.playerId === 'p2'),
    ).toMatchObject({
      correct: false,
      pointsAwarded: 0,
      streakAfter: 0,
    })
    expect(game.scores.p1).toEqual({
      points: 10,
      streak: 1,
      bestStreak: 1,
      correct: 1,
      wrong: 0,
    })
    expect(game.scores.p2).toEqual({
      points: 0,
      streak: 0,
      bestStreak: 0,
      correct: 0,
      wrong: 1,
    })
  })
})

describe('motor de rondas · avance y clasificación', () => {
  it('avanza de ronda sin perder resultados y termina en la clasificación final', () => {
    let game = startPlaying(readyGame())
    const totalRounds = game.rounds.length

    for (let index = 0; index < totalRounds; index += 1) {
      game = playCurrentRound(game, { correct: true })
      expect(game.rounds[index].phase).toBe(ROUND_PHASE.REVEAL)

      if (index < totalRounds - 1) {
        game = gameReducer(game, {
          type: ACTIONS.ADVANCE_ROUND,
          now: NOW,
        })
        expect(game.currentRoundIndex).toBe(index + 1)
        expect(game.rounds[index + 1].phase).toBe(ROUND_PHASE.MYSTERY)
        expect(game.rounds[index].result).not.toBeNull()
      }
    }

    expect(game.status).toBe(GAME_STATUS.PLAYING)
    game = gameReducer(game, {
      type: ACTIONS.ADVANCE_ROUND,
      now: NOW,
    })

    expect(game.status).toBe(GAME_STATUS.FINISHED)
    expect(game.finishedAt).toBe(NOW)
    expect(game.currentRoundIndex).toBe(totalRounds - 1)

    const ranking = getRanking(game)
    expect(ranking).toHaveLength(3)
    expect(ranking.every((row) => row.points === 80)).toBe(true)
    expect(ranking.every((row) => row.bestStreak === totalRounds)).toBe(true)
    expect(ranking.every((row) => row.rank === 1)).toBe(true)
    expect(ranking.every((row) => row.tied)).toBe(true)

    const summary = getGameSummary(game)
    expect(summary).toMatchObject({
      teamName: 'Equipo de prueba',
      roundsCompleted: totalRounds,
      totalRounds,
      totalData: totalRounds,
      correctGroupAnswers: totalRounds,
      individualAccuracy: 100,
      groupAccuracy: 100,
      bestStreak: totalRounds,
    })
    expect(summary.revealedData).toHaveLength(totalRounds)
    expect(
      summary.revealedData.every(
        (item) => Boolean(item.text) && Boolean(item.authorName),
      ),
    ).toBe(true)
  })

  it('ordena por puntos y comparte puesto cuando hay empate', () => {
    const game = {
      players: [
        { id: 'p1', name: 'Ana' },
        { id: 'p2', name: 'Beto' },
        { id: 'p3', name: 'Carla' },
      ],
      scores: {
        p1: { points: 20, streak: 1, correct: 2, wrong: 1 },
        p2: { points: 20, streak: 2, correct: 2, wrong: 0 },
        p3: { points: 10, streak: 0, correct: 1, wrong: 2 },
      },
    }

    const ranking = getRanking(game)
    expect(ranking.map((row) => row.playerId)).toEqual(['p1', 'p2', 'p3'])
    expect(ranking.map((row) => row.rank)).toEqual([1, 1, 3])
    expect(ranking.map((row) => row.tied)).toEqual([true, true, false])
  })

  it('rechaza avanzar sin revelación y no avanza más allá del final', () => {
    let game = startPlaying(readyGame())
    const mystery = game
    expect(
      gameReducer(game, { type: ACTIONS.ADVANCE_ROUND, now: NOW }),
    ).toBe(mystery)

    game = playCurrentRound(game)
    game = gameReducer(game, { type: ACTIONS.ADVANCE_ROUND, now: NOW })
    const secondRound = game
    expect(
      gameReducer(secondRound, {
        type: ACTIONS.ADVANCE_ROUND,
        now: NOW,
      }),
    ).toBe(secondRound)
  })
})

describe('motor de rondas · jugar otra vez', () => {
  it('conserva equipo y participantes, pero limpia datos, rondas y puntos', () => {
    let game = startPlaying(readyGame())
    game = playCurrentRound(game)

    const rematch = createRematchGame(game, {
      id: 'g_rematch',
      now: at(120),
    })

    expect(rematch.id).toBe('g_rematch')
    expect(rematch.teamName).toBe(game.teamName)
    expect(rematch.players).toEqual(game.players)
    expect(rematch.status).toBe(GAME_STATUS.REGISTRATION)
    expect(rematch.data).toEqual([])
    expect(rematch.deck).toEqual([])
    expect(rematch.rounds).toEqual([])
    expect(rematch.scores).toEqual({})
    expect(rematch.currentRoundIndex).toBe(0)
    expect(rematch.startedAt).toBeNull()
    expect(rematch.finishedAt).toBeNull()
    expect(rematch.registration.draftPlayerId).toBe('p1')
    expect(rematch.registration.entries).toHaveLength(2)
    expect(
      rematch.registration.entries.every((entry) => entry.text === ''),
    ).toBe(true)
  })
})
