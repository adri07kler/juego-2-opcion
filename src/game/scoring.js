import { GAME_CONFIG } from '../config/gameConfig'

export function createPlayerScore() {
  return { points: 0, streak: 0, bestStreak: 0, correct: 0, wrong: 0 }
}

function toCount(value) {
  return Number.isFinite(value) && value > 0 ? value : 0
}

function normalizeScore(score) {
  const streak = toCount(score?.streak)
  return {
    points: toCount(score?.points),
    streak,
    bestStreak: Math.max(streak, toCount(score?.bestStreak)),
    correct: toCount(score?.correct),
    wrong: toCount(score?.wrong),
  }
}

/**
 * Garantiza una entrada de puntuación por participante. Se usa al
 * recuperar partidas antiguas o parcialmente dañadas.
 */
export function ensureScoreboard(players, scores) {
  return Object.fromEntries(
    players.map((player) => [
      player.id,
      normalizeScore(scores?.[player.id]),
    ]),
  )
}

/**
 * Aplica un único resultado. El bono se entrega en los aciertos 3, 6,
 * 9… de una misma racha; un fallo devuelve la racha a cero.
 */
export function applyPredictionScore(
  score,
  correct,
  points = GAME_CONFIG.points,
) {
  const current = normalizeScore(score)
  if (!correct) {
    return {
      points: current.points,
      streak: 0,
      bestStreak: current.bestStreak,
      correct: current.correct,
      wrong: current.wrong + 1,
    }
  }

  const streak = current.streak + 1
  const bonusAwarded =
    streak % points.streakEvery === 0 ? points.streakBonus : 0

  return {
    points: current.points + points.correct + bonusAwarded,
    streak,
    bestStreak: Math.max(current.bestStreak, streak),
    correct: current.correct + 1,
    wrong: current.wrong,
  }
}

/**
 * Puntúa todas las predicciones de una ronda. No conoce ni muestra
 * nombres: solo identificadores internos.
 */
export function scoreRound({
  predictions,
  scores = {},
  authorId,
  points = GAME_CONFIG.points,
}) {
  const nextScores = { ...scores }
  const playerResults = predictions.map((prediction) => {
    const current = normalizeScore(nextScores[prediction.playerId])
    const correct = prediction.predictedAuthorId === authorId
    const next = applyPredictionScore(current, correct, points)
    nextScores[prediction.playerId] = next

    return {
      playerId: prediction.playerId,
      predictedAuthorId: prediction.predictedAuthorId,
      correct,
      pointsAwarded: correct ? points.correct : 0,
      bonusAwarded: correct
        ? next.points - current.points - points.correct
        : 0,
      streakAfter: next.streak,
      pointsTotal: next.points,
    }
  })

  return { scores: nextScores, playerResults }
}

/**
 * Reconstruye la puntuación a partir de las rondas ya reveladas. Al
 * cargar una partida no se confía en los totales guardados: se recalculan
 * una sola vez y se regeneran los resultados individuales. Así una recarga
 * nunca duplica puntos ni conserva totales manipulados.
 */
export function rebuildScoresFromRounds(
  players,
  rounds,
  points = GAME_CONFIG.points,
) {
  let scores = ensureScoreboard(players, null)

  const nextRounds = (rounds ?? []).map((round) => {
    const result = round?.result
    if (!result) return round

    const predictions = Array.isArray(round.predictions)
      ? round.predictions
      : []
    const complete =
      players.length > 0 &&
      predictions.length === players.length &&
      players.every((player) =>
        predictions.some(
          (prediction) => prediction.playerId === player.id,
        ),
      )

    if (!complete) {
      return { ...round, result: null, groupPrediction: null }
    }

    const { scores: roundScores, playerResults } = scoreRound({
      predictions,
      scores,
      authorId: result.authorId,
      points,
    })
    scores = roundScores

    const correctCount = playerResults.filter((entry) => entry.correct).length
    return {
      ...round,
      result: {
        ...result,
        playerResults,
        correctCount,
        wrongCount: playerResults.length - correctCount,
        groupCorrect:
          round.groupPrediction?.predictedAuthorId === result.authorId,
      },
    }
  })

  return { scores: ensureScoreboard(players, scores), rounds: nextRounds }
}
