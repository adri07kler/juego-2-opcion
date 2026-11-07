import { describe, expect, it } from 'vitest'
import { buildDeck } from '../shuffle'

function makeData() {
  const data = []
  for (let author = 1; author <= 4; author += 1) {
    for (let index = 0; index < 3; index += 1) {
      data.push({ id: `d${author}_${index}`, authorId: `p${author}` })
    }
  }
  return data
}

function hasConsecutiveSameAuthor(deck) {
  return deck.some(
    (datum, index) => index > 0 && datum.authorId === deck[index - 1].authorId,
  )
}

describe('buildDeck', () => {
  it('incluye todos los datos exactamente una vez', () => {
    const data = makeData()
    const deck = buildDeck(data)
    expect(deck).toHaveLength(data.length)
    expect(new Set(deck.map((datum) => datum.id)).size).toBe(data.length)
  })

  it('no muta el arreglo original', () => {
    const data = makeData()
    const copy = [...data]
    buildDeck(data, () => 0)
    expect(data).toEqual(copy)
  })

  it('evita autores consecutivos cuando es posible', () => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      expect(hasConsecutiveSameAuthor(buildDeck(makeData()))).toBe(false)
    }
  })

  it('funciona con un solo dato', () => {
    const deck = buildDeck([{ id: 'd1', authorId: 'p1' }])
    expect(deck.map((datum) => datum.id)).toEqual(['d1'])
  })

  it('devuelve un arreglo vacío sin datos', () => {
    expect(buildDeck([])).toEqual([])
  })

  it('es determinista con una función aleatoria fija', () => {
    const first = buildDeck(makeData(), () => 0.42).map((datum) => datum.id)
    const second = buildDeck(makeData(), () => 0.42).map((datum) => datum.id)
    expect(first).toEqual(second)
  })
})
