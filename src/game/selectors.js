import { GAME_CONFIG } from '../config/gameConfig'
import { GAME_STATUS, ROUND_PHASE } from './constants'
import { createDraftEntries } from './factory'

export function getPlayerData(game, playerId) {
  return game.data.filter((datum) => datum.authorId === playerId)
}

export function getPlayerDataCount(game, playerId) {
  return getPlayerData(game, playerId).length
}

export function getPlayerById(game, playerId) {
  return game?.players?.find((player) => player.id === playerId) ?? null
}

export function getDatumById(game, dataId) {
  return game?.data?.find((datum) => datum.id === dataId) ?? null
}

export function isPlayerRegistered(game, playerId) {
  const count = getPlayerDataCount(game, playerId)
  return (
    count >= GAME_CONFIG.dataPerPlayer.min &&
    count <= GAME_CONFIG.dataPerPlayer.max
  )
}

export function getRegisteredCount(game) {
  return game.players.filter((player) => isPlayerRegistered(game, player.id))
    .length
}

export function getCurrentRegistrationPlayer(game) {
  return (
    game.players.find((player) => !isPlayerRegistered(game, player.id)) ?? null
  )
}

/**
 * Nunca devuelve el borrador de otra persona: si el dueño no coincide
 * con el turno actual, entrega un borrador vacío.
 */
export function getRegistrationDraft(game) {
  const player = getCurrentRegistrationPlayer(game)
  if (!player) return null

  const registration = game.registration
  const entries =
    registration?.draftPlayerId === player.id &&
    Array.isArray(registration.entries) &&
    registration.entries.length >= GAME_CONFIG.dataPerPlayer.min &&
    registration.entries.length <= GAME_CONFIG.dataPerPlayer.max
      ? registration.entries
      : createDraftEntries()

  return { player, entries }
}

export function getRegistrationProgress(game) {
  const total = game.players.length
  const completed = getRegisteredCount(game)
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

export function getAllRegistered(game) {
  return (
    game.players.length >= GAME_CONFIG.minPlayers &&
    game.players.every((player) => isPlayerRegistered(game, player.id))
  )
}

export function getTotalData(game) {
  return game.data.length
}

export function canStartGame(game) {
  return game.status === GAME_STATUS.READY && getAllRegistered(game)
}

export function getCurrentRound(game) {
  if (
    !game ||
    (game.status !== GAME_STATUS.PLAYING &&
      game.status !== GAME_STATUS.FINISHED)
  ) {
    return null
  }
  return game.rounds?.[game.currentRoundIndex] ?? null
}

export function getRoundProgress(game) {
  const total = game?.rounds?.length ?? 0
  const index = total
    ? Math.min((game.currentRoundIndex ?? 0) + 1, total)
    : 0
  const completed =
    game?.rounds?.filter((round) => Boolean(round?.result)).length ?? 0
  return {
    index,
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

export function getPredictionTurn(game) {
  const round = getCurrentRound(game)
  if (
    !game ||
    game.status !== GAME_STATUS.PLAYING ||
    !round ||
    round.phase !== ROUND_PHASE.PREDICTIONS
  ) {
    return null
  }

  const predictedPlayerIds = new Set(
    (round.predictions ?? []).map((prediction) => prediction.playerId),
  )
  const player = game.players.find(
    (candidate) => !predictedPlayerIds.has(candidate.id),
  )
  if (!player) return null

  return {
    player,
    position: predictedPlayerIds.size + 1,
    total: game.players.length,
    remaining: game.players.length - predictedPlayerIds.size,
  }
}

export function arePredictionsComplete(game, round) {
  if (!game || !round || !Array.isArray(round.predictions)) return false
  if (round.predictions.length !== game.players.length) return false

  const ids = new Set(round.predictions.map((prediction) => prediction.playerId))
  return (
    ids.size === game.players.length &&
    game.players.every((player) => ids.has(player.id))
  )
}

export function getRoundAuthor(game, round) {
  const datum = getDatumById(game, round?.dataId)
  if (!datum) return null
  return getPlayerById(game, datum.authorId)
}

export function getGroupAnswerPlayer(game, round) {
  return getPlayerById(game, round?.groupPrediction?.predictedAuthorId)
}

export function getScoreForPlayer(game, playerId) {
  const score = game?.scores?.[playerId]
  const streak = score?.streak ?? 0
  return {
    points: score?.points ?? 0,
    streak,
    bestStreak: Math.max(score?.bestStreak ?? 0, streak),
    correct: score?.correct ?? 0,
    wrong: score?.wrong ?? 0,
  }
}

/**
 * Clasificación final por puntos. Quienes empatan comparten puesto y
 * el siguiente puesto salta (1, 1, 3…).
 */
export function getRanking(game) {
  const rows = (game?.players ?? [])
    .map((player) => ({
      playerId: player.id,
      name: player.name,
      ...getScoreForPlayer(game, player.id),
    }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, 'es'))

  let rank = 0
  let previousPoints = null
  const ranked = rows.map((row, index) => {
    if (previousPoints === null || row.points !== previousPoints) {
      rank = index + 1
      previousPoints = row.points
    }
    return { ...row, rank }
  })

  return ranked.map((row) => ({
    ...row,
    tied: ranked.filter((other) => other.rank === row.rank).length > 1,
  }))
}

/**
 * Rondas ya reveladas junto con su dato y autor. El resumen final solo
 * muestra información que el equipo ya vio durante la partida.
 */
export function getRevealedRounds(game) {
  return (game?.rounds ?? [])
    .filter((round) => Boolean(round?.result))
    .map((round) => {
      const datum = getDatumById(game, round.dataId)
      return {
        round,
        datum,
        author: datum ? getPlayerById(game, datum.authorId) : null,
      }
    })
}

export function getGameSummary(game) {
  const revealed = getRevealedRounds(game)
  const players = game?.players ?? []

  const correctPredictions = revealed.reduce(
    (total, { round }) => total + (round.result.correctCount ?? 0),
    0,
  )
  const wrongPredictions = revealed.reduce(
    (total, { round }) => total + (round.result.wrongCount ?? 0),
    0,
  )
  const totalPredictions = correctPredictions + wrongPredictions
  const correctGroupAnswers = revealed.filter(
    ({ round }) => round.result.groupCorrect,
  ).length
  const bestStreak = players.reduce(
    (best, player) =>
      Math.max(best, getScoreForPlayer(game, player.id).bestStreak),
    0,
  )

  return {
    teamName: game?.teamName ?? '',
    roundsCompleted: revealed.length,
    totalRounds: game?.rounds?.length ?? 0,
    totalData: game?.data?.length ?? 0,
    correctPredictions,
    wrongPredictions,
    totalPredictions,
    individualAccuracy:
      totalPredictions > 0
        ? Math.round((correctPredictions / totalPredictions) * 100)
        : 0,
    correctGroupAnswers,
    groupAccuracy:
      revealed.length > 0
        ? Math.round((correctGroupAnswers / revealed.length) * 100)
        : 0,
    bestStreak,
    revealedData: revealed.map(({ round, datum, author }) => ({
      dataId: round.dataId,
      text: datum?.text ?? '',
      category: datum?.category ?? '',
      authorId: author?.id ?? null,
      authorName: author?.name ?? 'Autor desconocido',
      groupCorrect: Boolean(round.result.groupCorrect),
    })),
  }
}

export function getGameStatusLabel(game) {
  switch (game.status) {
    case GAME_STATUS.TEAM:
      return { label: 'Equipo en preparación', detail: 'Faltan participantes' }
    case GAME_STATUS.REGISTRATION: {
      const progress = getRegistrationProgress(game)
      return {
        label: 'Registro privado',
        detail: `${progress.completed} de ${progress.total} personas · ${getTotalData(game)} datos`,
      }
    }
    case GAME_STATUS.READY:
      return {
        label: 'Registro completo',
        detail: `${getTotalData(game)} datos listos para jugar`,
      }
    case GAME_STATUS.PLAYING: {
      const progress = getRoundProgress(game)
      return {
        label: 'Partida en curso',
        detail: `Ronda ${progress.index} de ${progress.total} · ${getTotalData(game)} datos`,
      }
    }
    case GAME_STATUS.FINISHED:
      return {
        label: 'Partida finalizada',
        detail: `${getTotalData(game)} datos revelados`,
      }
    default:
      return { label: 'Partida', detail: '' }
  }
}
