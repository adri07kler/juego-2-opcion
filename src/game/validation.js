import { DATUM_CATEGORIES, GAME_CONFIG } from '../config/gameConfig'
import { normalizeText } from '../utils/text'

export function validateTeamName(value) {
  const name = String(value ?? '').trim()
  if (!name) return 'Ponle un nombre al equipo.'
  if (name.length < GAME_CONFIG.teamName.minLength) {
    return `El nombre debe tener al menos ${GAME_CONFIG.teamName.minLength} caracteres.`
  }
  if (name.length > GAME_CONFIG.teamName.maxLength) {
    return `El nombre no puede superar los ${GAME_CONFIG.teamName.maxLength} caracteres.`
  }
  return null
}

export function validatePlayerName(value, players, { excludePlayerId } = {}) {
  const name = String(value ?? '').trim()
  if (!name) return 'Escribe un nombre.'
  if (name.length < GAME_CONFIG.playerName.minLength) {
    return `El nombre debe tener al menos ${GAME_CONFIG.playerName.minLength} caracteres.`
  }
  if (name.length > GAME_CONFIG.playerName.maxLength) {
    return `El nombre no puede superar los ${GAME_CONFIG.playerName.maxLength} caracteres.`
  }

  const normalized = normalizeText(name)
  const duplicated = players.some(
    (player) =>
      player.id !== excludePlayerId && normalizeText(player.name) === normalized,
  )
  if (duplicated) return 'Ya hay un participante con ese nombre.'
  return null
}

export function validateDatumText(value) {
  const text = String(value ?? '').trim()
  if (!text) return 'El dato no puede estar vacío.'
  if (text.length > GAME_CONFIG.datum.maxLength) {
    return `El dato no puede superar los ${GAME_CONFIG.datum.maxLength} caracteres.`
  }
  return null
}

export function isValidCategory(value) {
  return value === '' || DATUM_CATEGORIES.includes(value)
}

/**
 * Valida el borrador de un participante. Nunca incluye el texto del dato
 * en el mensaje de error para no filtrar información.
 */
export function validateDraftEntries(entries, existingData = []) {
  const fieldErrors = {}

  if (!Array.isArray(entries) || entries.length < 2) {
    return {
      ok: false,
      fieldErrors,
      formError: 'Registra al menos 2 datos.',
    }
  }

  if (entries.length > 3) {
    return {
      ok: false,
      fieldErrors,
      formError: 'Puedes registrar como máximo 3 datos.',
    }
  }

  const seen = new Set(existingData.map((datum) => normalizeText(datum.text)))

  entries.forEach((entry, index) => {
    const error = validateDatumText(entry?.text)
    if (error) {
      fieldErrors[index] = error
      return
    }

    const key = normalizeText(entry.text)
    if (seen.has(key)) {
      fieldErrors[index] =
        'Ese dato ya está registrado en la partida. Prueba con otro.'
      return
    }
    seen.add(key)
  })

  const ok = Object.keys(fieldErrors).length === 0
  return {
    ok,
    fieldErrors,
    formError: ok ? null : 'Revisa los datos marcados antes de confirmar.',
  }
}

export function isValidDeck(deck, data) {
  if (!Array.isArray(deck) || deck.length !== data.length) return false
  const dataIds = new Set(data.map((datum) => datum.id))
  const seen = new Set()
  for (const id of deck) {
    if (typeof id !== 'string' || !dataIds.has(id) || seen.has(id)) return false
    seen.add(id)
  }
  return seen.size === dataIds.size
}
