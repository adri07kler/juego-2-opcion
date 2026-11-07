import { GAME_CONFIG } from '../config/gameConfig'
import { GAME_STATUS } from './constants'
import { createDraftEntries } from './factory'

export function getPlayerData(game, playerId) {
  return game.data.filter((datum) => datum.authorId === playerId)
}

export function getPlayerDataCount(game, playerId) {
  return getPlayerData(game, playerId).length
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
    case GAME_STATUS.PLAYING:
      return { label: 'Partida iniciada', detail: 'Los datos están bloqueados' }
    default:
      return { label: 'Partida', detail: '' }
  }
}
