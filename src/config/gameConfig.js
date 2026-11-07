/**
 * Reglas y límites del juego en un único lugar.
 * La lógica de la partida (fase 2) consumirá estos mismos valores.
 */
export const GAME_CONFIG = Object.freeze({
  minPlayers: 2,
  maxPlayers: 12,
  dataPerPlayer: Object.freeze({ min: 2, max: 3 }),
  datum: Object.freeze({ minLength: 5, maxLength: 180 }),
  playerName: Object.freeze({ maxLength: 24 }),
  points: Object.freeze({
    correct: 10,
    streakBonus: 5,
    streakEvery: 3,
  }),
})
