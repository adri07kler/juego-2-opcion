export const ROUTES = Object.freeze({
  HOME: 'home',
  INSTRUCTIONS: 'instrucciones',
  GAME: 'partida',
})

export const ROUTE_TITLES = Object.freeze({
  [ROUTES.HOME]: 'Inicio',
  [ROUTES.INSTRUCTIONS]: 'Cómo jugar',
  [ROUTES.GAME]: 'Partida',
})

const ROUTE_VALUES = Object.values(ROUTES)

export function isRoute(value) {
  return ROUTE_VALUES.includes(value)
}
