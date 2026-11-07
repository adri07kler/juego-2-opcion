import { describe, expect, it } from 'vitest'
import { ACTIONS, GAME_STATUS, SCHEMA_VERSION } from '../../game/constants'
import { createGame } from '../../game/factory'
import { gameReducer } from '../../game/reducer'
import {
  BACKUP_KEY,
  STORAGE_KEY,
  clearStoredGame,
  isGameShape,
  loadGame,
  normalizeGame,
  saveGame,
} from '../gameStorage'

const NOW = '2026-01-01T00:00:00.000Z'

function createMemoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    get size() {
      return map.size
    },
    dump: () => Object.fromEntries(map),
  }
}

function createFailingStorage() {
  return {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
    removeItem: () => {
      throw new Error('blocked')
    },
  }
}

function buildGame() {
  let game = createGame({ id: 'g1', now: NOW })
  game = gameReducer(game, {
    type: ACTIONS.SET_TEAM_NAME,
    teamName: 'Los Curiosos',
    now: NOW,
  })
  game = gameReducer(game, {
    type: ACTIONS.ADD_PLAYER,
    player: { id: 'p1', name: 'Ana', createdAt: NOW },
    now: NOW,
  })
  game = gameReducer(game, {
    type: ACTIONS.ADD_PLAYER,
    player: { id: 'p2', name: 'Beto', createdAt: NOW },
    now: NOW,
  })
  game = gameReducer(game, { type: ACTIONS.START_REGISTRATION, now: NOW })
  game = gameReducer(game, {
    type: ACTIONS.SET_DRAFT_TEXT,
    index: 0,
    text: 'Toco el piano',
    now: NOW,
  })
  game = gameReducer(game, {
    type: ACTIONS.SET_DRAFT_CATEGORY,
    index: 0,
    category: 'Habilidad',
    now: NOW,
  })
  game = gameReducer(game, {
    type: ACTIONS.SET_DRAFT_TEXT,
    index: 1,
    text: 'Viajé a Japón',
    now: NOW,
  })
  return game
}

describe('saveGame / loadGame', () => {
  it('guarda y recupera la partida con su estado', () => {
    const storage = createMemoryStorage()
    const game = buildGame()

    expect(saveGame(game, storage)).toEqual({ ok: true })
    expect(storage.getItem(STORAGE_KEY)).toBeTruthy()

    const loaded = loadGame(storage)
    expect(loaded.issue).toBeNull()
    expect(loaded.game).toEqual(game)
  })

  it('recupera el borrador privado del turno actual', () => {
    const storage = createMemoryStorage()
    saveGame(buildGame(), storage)
    const { game } = loadGame(storage)
    expect(game.registration.draftPlayerId).toBe('p1')
    expect(game.registration.entries[0].text).toBe('Toco el piano')
    expect(game.registration.entries[0].category).toBe('Habilidad')
  })

  it('devuelve partida nula cuando no hay nada guardado', () => {
    const storage = createMemoryStorage()
    expect(loadGame(storage)).toEqual({ game: null, issue: null })
  })

  it('elimina la partida con saveGame(null)', () => {
    const storage = createMemoryStorage()
    saveGame(buildGame(), storage)
    saveGame(null, storage)
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('mueve el contenido corrupto a un respaldo y limpia la clave principal', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: '{no es json' })
    const result = loadGame(storage)
    expect(result).toEqual({ game: null, issue: 'corrupt' })
    expect(storage.getItem(STORAGE_KEY)).toBeNull()
    expect(storage.getItem(BACKUP_KEY)).toBe('{no es json')
  })

  it('rechaza versiones de esquema distintas sin lanzar errores', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({ schemaVersion: 99, game: {} }),
    })
    expect(loadGame(storage).issue).toBe('corrupt')
  })

  it('rechaza una partida con forma inválida', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        game: { schemaVersion: SCHEMA_VERSION, id: 'g1', status: 'raro' },
      }),
    })
    expect(loadGame(storage).issue).toBe('corrupt')
  })

  it('informa cuando el almacenamiento no está disponible', () => {
    expect(saveGame(buildGame(), null)).toEqual({
      ok: false,
      issue: 'unavailable',
    })
    expect(loadGame(null)).toEqual({ game: null, issue: 'unavailable' })
  })

  it('no lanza excepciones si el almacenamiento falla', () => {
    const storage = createFailingStorage()
    expect(saveGame(buildGame(), storage)).toEqual({
      ok: false,
      issue: 'unavailable',
    })
    expect(loadGame(storage)).toEqual({ game: null, issue: 'unavailable' })
    expect(clearStoredGame(storage)).toBe(false)
  })

  it('limpia la partida y el respaldo', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: 'partida',
      [BACKUP_KEY]: 'respaldo',
    })
    expect(clearStoredGame(storage)).toBe(true)
    expect(storage.size).toBe(0)
  })
})

describe('normalizeGame', () => {
  it('descarta un borrador que no pertenece al turno actual', () => {
    const game = buildGame()
    const tampered = {
      ...game,
      registration: { draftPlayerId: 'p2', entries: game.registration.entries },
    }
    const normalized = normalizeGame(tampered)
    expect(normalized.registration.draftPlayerId).toBe('p1')
    expect(normalized.registration.entries.every((entry) => entry.text === '')).toBe(
      true,
    )
  })

  it('promueve a ready cuando ya no queda nadie por registrar', () => {
    const base = createGame({ id: 'g2', now: NOW })
    const game = {
      ...base,
      status: GAME_STATUS.REGISTRATION,
      players: [
        { id: 'p1', name: 'Ana', createdAt: NOW },
        { id: 'p2', name: 'Beto', createdAt: NOW },
      ],
      data: [
        { id: 'd1', authorId: 'p1', text: 'Uno', category: '', createdAt: NOW },
        { id: 'd2', authorId: 'p1', text: 'Dos', category: '', createdAt: NOW },
        { id: 'd3', authorId: 'p2', text: 'Tres', category: '', createdAt: NOW },
        { id: 'd4', authorId: 'p2', text: 'Cuatro', category: '', createdAt: NOW },
      ],
      registration: { draftPlayerId: 'p2', entries: [] },
    }
    const normalized = normalizeGame(game)
    expect(normalized.status).toBe(GAME_STATUS.READY)
    expect(normalized.registration).toEqual({ draftPlayerId: null, entries: [] })
  })

  it('no toca partidas fuera de la fase de registro', () => {
    const game = createGame({ id: 'g3', now: NOW })
    expect(normalizeGame(game)).toEqual(game)
  })
})

describe('isGameShape', () => {
  it('acepta una partida generada por la factory', () => {
    expect(isGameShape(createGame({ id: 'g4', now: NOW }))).toBe(true)
  })

  it('rechaza valores que no son objetos', () => {
    expect(isGameShape(null)).toBe(false)
    expect(isGameShape([])).toBe(false)
    expect(isGameShape('texto')).toBe(false)
  })
})
