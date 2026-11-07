import { describe, expect, it } from 'vitest'
import { ACTIONS, GAME_STATUS } from '../constants'
import { createGame } from '../factory'
import { gameReducer } from '../reducer'
import { buildDeck } from '../shuffle'
import { getAllRegistered, getTotalData } from '../selectors'

const NOW = '2026-01-01T00:00:00.000Z'

function createTeam(playerNames) {
  let game = createGame({ id: 'g_test', now: NOW })
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

function setDraft(game, texts, categories = []) {
  let next = game
  texts.forEach((text, index) => {
    next = gameReducer(next, {
      type: ACTIONS.SET_DRAFT_TEXT,
      index,
      text,
      now: NOW,
    })
    if (categories[index]) {
      next = gameReducer(next, {
        type: ACTIONS.SET_DRAFT_CATEGORY,
        index,
        category: categories[index],
        now: NOW,
      })
    }
  })
  return next
}

function confirm(game, authorId, count) {
  return gameReducer(game, {
    type: ACTIONS.CONFIRM_REGISTRATION,
    dataIds: Array.from({ length: count }, (_, index) => `d_${authorId}_${index}`),
    now: NOW,
  })
}

function registerEveryone(game) {
  let next = game
  next = setDraft(next, ['Dato uno de Ana', 'Dato dos de Ana'])
  next = confirm(next, 'p1', 2)

  next = setDraft(next, ['Dato uno de Beto', 'Dato dos de Beto'])
  next = gameReducer(next, { type: ACTIONS.ADD_DRAFT_ENTRY, now: NOW })
  next = setDraft(next, ['Dato uno de Beto', 'Dato dos de Beto', 'Dato tres de Beto'], [
    '',
    '',
    'Viaje',
  ])
  next = confirm(next, 'p2', 3)

  next = setDraft(next, ['Dato uno de Carla', 'Dato dos de Carla'])
  next = confirm(next, 'p3', 2)
  return next
}

describe('gameReducer · equipo', () => {
  it('crea una partida nueva aunque todavía no exista ninguna', () => {
    const game = createGame({ id: 'g_new', now: NOW })
    expect(gameReducer(null, { type: ACTIONS.NEW_GAME, game })).toBe(game)
    expect(gameReducer(null, { type: ACTIONS.RESET })).toBeNull()
    expect(
      gameReducer(null, { type: ACTIONS.SET_TEAM_NAME, teamName: 'X', now: NOW }),
    ).toBeNull()
  })

  it('crea el equipo, agrega, edita y elimina participantes', () => {
    let game = createTeam(['Ana', 'Beto'])
    expect(game.status).toBe(GAME_STATUS.TEAM)
    expect(game.players.map((player) => player.name)).toEqual(['Ana', 'Beto'])

    game = gameReducer(game, {
      type: ACTIONS.RENAME_PLAYER,
      playerId: 'p2',
      name: 'Beto Ruiz',
      now: NOW,
    })
    expect(game.players[1].name).toBe('Beto Ruiz')

    game = gameReducer(game, {
      type: ACTIONS.REMOVE_PLAYER,
      playerId: 'p2',
      now: NOW,
    })
    expect(game.players).toHaveLength(1)
  })

  it('rechaza nombres duplicados y vacíos', () => {
    let game = createTeam(['Ana'])
    const duplicated = gameReducer(game, {
      type: ACTIONS.ADD_PLAYER,
      player: { id: 'p2', name: 'ANA', createdAt: NOW },
      now: NOW,
    })
    expect(duplicated.players).toHaveLength(1)

    const empty = gameReducer(game, {
      type: ACTIONS.ADD_PLAYER,
      player: { id: 'p3', name: '   ', createdAt: NOW },
      now: NOW,
    })
    expect(empty.players).toHaveLength(1)
  })

  it('no permite comenzar el registro con menos de 2 participantes', () => {
    const game = createTeam(['Ana'])
    const next = gameReducer(game, {
      type: ACTIONS.START_REGISTRATION,
      now: NOW,
    })
    expect(next.status).toBe(GAME_STATUS.TEAM)
  })

  it('no admite un participante número 13', () => {
    const names = Array.from({ length: 13 }, (_, index) => `Persona ${index}`)
    const game = createTeam(names)
    expect(game.players).toHaveLength(12)
  })
})

describe('gameReducer · registro privado', () => {
  it('recorre a todos los participantes y vincula cada dato a su autor', () => {
    let game = createTeam(['Ana', 'Beto', 'Carla'])
    game = gameReducer(game, {
      type: ACTIONS.START_REGISTRATION,
      now: NOW,
    })
    expect(game.status).toBe(GAME_STATUS.REGISTRATION)
    expect(game.registration.draftPlayerId).toBe('p1')

    game = registerEveryone(game)

    expect(game.status).toBe(GAME_STATUS.READY)
    expect(getAllRegistered(game)).toBe(true)
    expect(getTotalData(game)).toBe(7)
    expect(
      game.data.filter((datum) => datum.authorId === 'p1'),
    ).toHaveLength(2)
    expect(
      game.data.filter((datum) => datum.authorId === 'p2'),
    ).toHaveLength(3)
    expect(
      game.data.find((datum) => datum.text === 'Dato tres de Beto')?.category,
    ).toBe('Viaje')
    expect(game.registration.draftPlayerId).toBeNull()
  })

  it('no confirma registros con datos vacíos', () => {
    let game = createTeam(['Ana', 'Beto'])
    game = gameReducer(game, { type: ACTIONS.START_REGISTRATION, now: NOW })
    game = setDraft(game, ['Solo un dato', ''])
    const next = confirm(game, 'p1', 2)
    expect(next).toBe(game)
    expect(next.data).toHaveLength(0)
  })

  it('no permite datos duplicados entre participantes', () => {
    let game = createTeam(['Ana', 'Beto'])
    game = gameReducer(game, { type: ACTIONS.START_REGISTRATION, now: NOW })
    game = setDraft(game, ['Me encanta el café', 'Viajé a Japón'])
    game = confirm(game, 'p1', 2)

    game = setDraft(game, ['  me ENCANTA el cafe ', 'Otro dato distinto'])
    const next = confirm(game, 'p2', 2)
    expect(next).toBe(game)
    expect(next.data).toHaveLength(2)
    expect(next.status).toBe(GAME_STATUS.REGISTRATION)
  })

  it('permite un tercer dato y no más', () => {
    let game = createTeam(['Ana', 'Beto'])
    game = gameReducer(game, { type: ACTIONS.START_REGISTRATION, now: NOW })
    game = setDraft(game, ['Uno', 'Dos'])
    game = gameReducer(game, { type: ACTIONS.ADD_DRAFT_ENTRY, now: NOW })
    game = gameReducer(game, { type: ACTIONS.ADD_DRAFT_ENTRY, now: NOW })
    expect(game.registration.entries).toHaveLength(3)
  })

  it('descarta el borrador si no pertenece al turno actual', () => {
    let game = createTeam(['Ana', 'Beto'])
    game = gameReducer(game, { type: ACTIONS.START_REGISTRATION, now: NOW })
    game = setDraft(game, ['Dato de Ana uno', 'Dato de Ana dos'])
    game = confirm(game, 'p1', 2)

    const tampered = {
      ...game,
      registration: {
        draftPlayerId: 'p1',
        entries: [{ text: 'Secreto ajeno', category: '' }],
      },
    }
    const next = gameReducer(tampered, {
      type: ACTIONS.SET_DRAFT_TEXT,
      index: 0,
      text: 'Dato de Beto',
      now: NOW,
    })
    expect(next.registration.draftPlayerId).toBe('p2')
    expect(next.registration.entries[0].text).toBe('Dato de Beto')
    expect(next.registration.entries).toHaveLength(2)
  })
})

describe('gameReducer · inicio y bloqueo', () => {
  function readyGame() {
    let game = createTeam(['Ana', 'Beto', 'Carla'])
    game = gameReducer(game, { type: ACTIONS.START_REGISTRATION, now: NOW })
    return registerEveryone(game)
  }

  it('inicia la partida solo con todos los registros completos', () => {
    let game = readyGame()
    const deck = buildDeck(game.data).map((datum) => datum.id)
    game = gameReducer(game, { type: ACTIONS.START_GAME, deck, now: NOW })

    expect(game.status).toBe(GAME_STATUS.PLAYING)
    expect(game.deck).toHaveLength(7)
    expect(new Set(game.deck).size).toBe(7)
  })

  it('no inicia la partida con registros incompletos', () => {
    let game = createTeam(['Ana', 'Beto'])
    game = gameReducer(game, { type: ACTIONS.START_REGISTRATION, now: NOW })
    game = setDraft(game, ['Dato de Ana uno', 'Dato de Ana dos'])
    game = confirm(game, 'p1', 2)

    const next = gameReducer(game, {
      type: ACTIONS.START_GAME,
      deck: game.data.map((datum) => datum.id),
      now: NOW,
    })
    expect(next.status).toBe(GAME_STATUS.REGISTRATION)
  })

  it('bloquea todas las modificaciones después de iniciar', () => {
    let game = readyGame()
    const deck = buildDeck(game.data).map((datum) => datum.id)
    game = gameReducer(game, { type: ACTIONS.START_GAME, deck, now: NOW })
    const frozen = game

    const attempts = [
      { type: ACTIONS.SET_TEAM_NAME, teamName: 'Otro nombre', now: NOW },
      {
        type: ACTIONS.ADD_PLAYER,
        player: { id: 'p4', name: 'Nuevo', createdAt: NOW },
        now: NOW,
      },
      { type: ACTIONS.ADD_DRAFT_ENTRY, now: NOW },
      { type: ACTIONS.CONFIRM_REGISTRATION, dataIds: ['x', 'y'], now: NOW },
    ]

    attempts.forEach((action) => {
      expect(gameReducer(game, action)).toBe(frozen)
    })
  })
})
