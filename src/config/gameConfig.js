/**
 * Reglas y límites del juego en un único lugar.
 */
export const GAME_CONFIG = Object.freeze({
  minPlayers: 2,
  maxPlayers: 12,
  dataPerPlayer: Object.freeze({ min: 2, max: 3 }),
  datum: Object.freeze({ minLength: 1, maxLength: 180 }),
  teamName: Object.freeze({ minLength: 2, maxLength: 40 }),
  playerName: Object.freeze({ minLength: 2, maxLength: 24 }),
  points: Object.freeze({
    correct: 10,
    streakBonus: 5,
    streakEvery: 3,
  }),
})

export const DATUM_CATEGORIES = Object.freeze([
  'Anécdota',
  'Habilidad',
  'Gusto',
  'Viaje',
  'Trabajo',
  'Otro',
])
