import { GAME_CONFIG } from '../config/gameConfig'

export function createPlayerScore() {
  return { points: 0, streak: 0, correct: 0, wrong: 0 }
}

function normalizeScore(score) {
  return {
    points: Number.isFinite(score?.points) ? score.points : 0,
    streak: Number.isFinite(score?.streak) ? score.streak : 0,
    correct: Number.isFinite(score?.correct) ? score.correct : 0,
    wrong: Number.isFinite(score?.wrong) ? score.wrong : 0,
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
