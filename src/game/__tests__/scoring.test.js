import { describe, expect, it } from 'vitest'
import {
  applyPredictionScore,
  ensureScoreboard,
  scoreRound,
} from '../scoring'

describe('scoring · puntuación individual', () => {
  it('suma 10 puntos por acierto y mantiene la racha', () => {
    const first = applyPredictionScore(
      { points: 0, streak: 0, correct: 0, wrong: 0 },
      true,
    )
    expect(first).toEqual({ points: 10, streak: 1, correct: 1, wrong: 0 })

    const second = applyPredictionScore(first, true)
    expect(second).toEqual({ points: 20, streak: 2, correct: 2, wrong: 0 })
  })

  it('entrega 5 extra en los aciertos 3, 6 y 9 de una racha', () => {
    let score = { points: 0, streak: 0, correct: 0, wrong: 0 }
    const history = []
    for (let index = 0; index < 9; index += 1) {
      score = applyPredictionScore(score, true)
      history.push(score.points)
    }

    expect(history).toEqual([10, 20, 35, 45, 55, 70, 80, 90, 105])
    expect(score.streak).toBe(9)
  })

  it('un fallo no suma puntos y reinicia la racha', () => {
    let score = { points: 0, streak: 0, correct: 0, wrong: 0 }
    score = applyPredictionScore(score, true)
    score = applyPredictionScore(score, true)
    score = applyPredictionScore(score, true)
    expect(score).toEqual({ points: 35, streak: 3, correct: 3, wrong: 0 })

    score = applyPredictionScore(score, false)
    expect(score).toEqual({ points: 35, streak: 0, correct: 3, wrong: 1 })

    score = applyPredictionScore(score, true)
    expect(score).toEqual({ points: 45, streak: 1, correct: 4, wrong: 1 })
  })

  it('puntúa toda la ronda sin mezclar rachas entre jugadores', () => {
    const result = scoreRound({
      authorId: 'p2',
      scores: {
        p1: { points: 0, streak: 0, correct: 0, wrong: 0 },
        p2: { points: 0, streak: 0, correct: 0, wrong: 0 },
        p3: { points: 0, streak: 0, correct: 0, wrong: 0 },
      },
      predictions: [
        { playerId: 'p1', predictedAuthorId: 'p2' },
        { playerId: 'p2', predictedAuthorId: 'p2' },
        { playerId: 'p3', predictedAuthorId: 'p1' },
      ],
    })

    expect(result.playerResults).toEqual([
      {
        playerId: 'p1',
        predictedAuthorId: 'p2',
        correct: true,
        pointsAwarded: 10,
        bonusAwarded: 0,
        streakAfter: 1,
        pointsTotal: 10,
      },
      {
        playerId: 'p2',
        predictedAuthorId: 'p2',
        correct: true,
        pointsAwarded: 10,
        bonusAwarded: 0,
        streakAfter: 1,
        pointsTotal: 10,
      },
      {
        playerId: 'p3',
        predictedAuthorId: 'p1',
        correct: false,
        pointsAwarded: 0,
        bonusAwarded: 0,
        streakAfter: 0,
        pointsTotal: 0,
      },
    ])
    expect(result.scores.p3).toEqual({
      points: 0,
      streak: 0,
      correct: 0,
      wrong: 1,
    })
  })

  it('repara puntuaciones ausentes o incompletas', () => {
    const scores = ensureScoreboard(
      [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }],
      { p2: { points: 20 } },
    )
    expect(scores).toEqual({
      p1: { points: 0, streak: 0, correct: 0, wrong: 0 },
      p2: { points: 20, streak: 0, correct: 0, wrong: 0 },
      p3: { points: 0, streak: 0, correct: 0, wrong: 0 },
    })
  })
})
