/**
 * Baraja los datos evitando que dos datos del mismo autor queden
 * consecutivos siempre que exista una combinación válida.
 *
 * Estrategia: en cada paso se elige, entre los autores que no son el
 * último usado, el que tiene más datos pendientes. Elegir siempre al más
 * frecuente evita quedarse con un único autor al final.
 */
export function buildDeck(data, random = Math.random) {
  const remaining = [...data]
  const deck = []
  let lastAuthorId = null

  while (remaining.length > 0) {
    const counts = new Map()
    for (const datum of remaining) {
      counts.set(datum.authorId, (counts.get(datum.authorId) ?? 0) + 1)
    }

    let maxCount = 0
    for (const [authorId, count] of counts) {
      if (authorId !== lastAuthorId) {
        maxCount = Math.max(maxCount, count)
      }
    }

    const candidates = remaining.filter(
      (datum) =>
        datum.authorId !== lastAuthorId &&
        counts.get(datum.authorId) === maxCount,
    )
    const pool = candidates.length > 0 ? candidates : remaining
    const index = Math.min(
      pool.length - 1,
      Math.floor(random() * pool.length),
    )
    const [datum] = pool.splice(index, 1)
    remaining.splice(
      remaining.findIndex((item) => item.id === datum.id),
      1,
    )
    deck.push(datum)
    lastAuthorId = datum.authorId
  }

  return deck
}
