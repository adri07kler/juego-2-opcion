export const ROUTES = Object.freeze({
  HOME: 'home',
  INSTRUCTIONS: 'instrucciones',
  NEW_GAME: 'nueva-partida',
})

export const ROUTE_TITLES = Object.freeze({
  [ROUTES.HOME]: 'Inicio',
  [ROUTES.INSTRUCTIONS]: 'Cómo jugar',
  [ROUTES.NEW_GAME]: 'Nueva partida',
})

const ROUTE_VALUES = Object.values(ROUTES)

export function isRoute(value) {
  return ROUTE_VALUES.includes(value)
}
