import { describe, expect, it } from 'vitest'
import {
  isValidCategory,
  isValidDeck,
  validateDraftEntries,
  validatePlayerName,
  validateTeamName,
} from '../validation'

const PLAYERS = [
  { id: 'p1', name: 'Ana' },
  { id: 'p2', name: 'Beto' },
]

describe('validateTeamName', () => {
  it('exige un nombre', () => {
    expect(validateTeamName('')).not.toBeNull()
    expect(validateTeamName('   ')).not.toBeNull()
  })

  it('rechaza nombres demasiado largos', () => {
    expect(validateTeamName('a'.repeat(41))).not.toBeNull()
  })

  it('acepta un nombre válido', () => {
    expect(validateTeamName('Equipo Genial')).toBeNull()
  })
})

describe('validatePlayerName', () => {
  it('rechaza vacíos y nombres cortos', () => {
    expect(validatePlayerName('', PLAYERS)).not.toBeNull()
    expect(validatePlayerName('A', PLAYERS)).not.toBeNull()
  })

  it('detecta duplicados sin distinguir mayúsculas ni acentos', () => {
    expect(validatePlayerName('ANA', PLAYERS)).not.toBeNull()
    expect(validatePlayerName('Beto', PLAYERS)).not.toBeNull()
  })

  it('permite mantener el propio nombre al editar', () => {
    expect(validatePlayerName('Ana', PLAYERS, { excludePlayerId: 'p1' })).toBeNull()
  })

  it('acepta un nombre nuevo', () => {
    expect(validatePlayerName('Carla', PLAYERS)).toBeNull()
  })
})

describe('validateDraftEntries', () => {
  it('exige al menos dos datos', () => {
    const result = validateDraftEntries([{ text: 'Hola', category: '' }])
    expect(result.ok).toBe(false)
    expect(result.formError).toMatch(/2 datos/)
  })

  it('rechaza más de tres datos', () => {
    const result = validateDraftEntries(
      Array.from({ length: 4 }, (_, index) => ({
        text: `Dato ${index}`,
        category: '',
      })),
    )
    expect(result.ok).toBe(false)
  })

  it('marca los datos vacíos por índice', () => {
    const result = validateDraftEntries([
      { text: 'Válido', category: '' },
      { text: '   ', category: '' },
    ])
    expect(result.ok).toBe(false)
    expect(result.fieldErrors[1]).toMatch(/vacío/)
    expect(result.fieldErrors[0]).toBeUndefined()
  })

  it('rechaza datos repetidos dentro del mismo borrador', () => {
    const result = validateDraftEntries([
      { text: 'Me gusta el café', category: '' },
      { text: 'me GUSTA el cafe', category: '' },
    ])
    expect(result.ok).toBe(false)
    expect(result.fieldErrors[1]).toBeDefined()
  })

  it('rechaza datos ya registrados por otras personas', () => {
    const result = validateDraftEntries(
      [
        { text: 'Viajé a Japón', category: '' },
        { text: 'Toco la guitarra', category: '' },
      ],
      [{ id: 'd1', authorId: 'p1', text: 'viaje a japon', category: '' }],
    )
    expect(result.ok).toBe(false)
    expect(result.fieldErrors[0]).toBeDefined()
  })

  it('no incluye el texto del dato en los mensajes de error', () => {
    const secret = 'Dato confidencial de alguien'
    const result = validateDraftEntries(
      [
        { text: secret, category: '' },
        { text: secret, category: '' },
      ],
      [],
    )
    expect(JSON.stringify(result.fieldErrors)).not.toContain(secret)
  })

  it('acepta un borrador válido de dos o tres datos', () => {
    expect(
      validateDraftEntries([
        { text: 'Un dato', category: '' },
        { text: 'Otro dato', category: 'Viaje' },
      ]).ok,
    ).toBe(true)
    expect(
      validateDraftEntries([
        { text: 'Un dato', category: '' },
        { text: 'Otro dato', category: '' },
        { text: 'Un tercero', category: 'Otro' },
      ]).ok,
    ).toBe(true)
  })
})

describe('isValidCategory', () => {
  it('acepta vacío y categorías conocidas', () => {
    expect(isValidCategory('')).toBe(true)
    expect(isValidCategory('Viaje')).toBe(true)
    expect(isValidCategory('Inventada')).toBe(false)
  })
})

describe('isValidDeck', () => {
  const data = [
    { id: 'd1' },
    { id: 'd2' },
    { id: 'd3' },
  ]

  it('exige todos los datos una sola vez', () => {
    expect(isValidDeck(['d1', 'd2', 'd3'], data)).toBe(true)
    expect(isValidDeck(['d1', 'd3', 'd2'], data)).toBe(true)
    expect(isValidDeck(['d1', 'd2'], data)).toBe(false)
    expect(isValidDeck(['d1', 'd2', 'd2'], data)).toBe(false)
    expect(isValidDeck(['d1', 'd2', 'd4'], data)).toBe(false)
    expect(isValidDeck(null, data)).toBe(false)
  })
})
