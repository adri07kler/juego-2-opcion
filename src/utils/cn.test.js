import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('une clases válidas con un espacio', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('descarta valores falsy', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('aplana arreglos anidados', () => {
    expect(cn(['a', ['b', false, ['c']]])).toBe('a b c')
  })

  it('devuelve una cadena vacía sin clases', () => {
    expect(cn()).toBe('')
  })
})
