import { useCallback, useMemo, useReducer, useState } from 'react'
import { useAutosave } from '../hooks/useAutosave'
import { clearStoredGame, loadGame } from '../storage/gameStorage'
import { createId, nowIso } from '../utils/ids'
import { ACTIONS } from './constants'
import { GameContext } from './GameContext'
import { createGame, createRematchGame } from './factory'
import { gameReducer } from './reducer'
import { getRegistrationDraft } from './selectors'
import { buildDeck } from './shuffle'

export function GameProvider({ children }) {
  const [initial] = useState(() => loadGame())
  const [game, dispatch] = useReducer(gameReducer, initial.game)
  const [storageIssue, setStorageIssue] = useState(initial.issue)

  useAutosave(game, (result) => {
    setStorageIssue(result.ok ? null : result.issue)
  })

  const run = useCallback((action) => {
    dispatch({ ...action, now: nowIso() })
  }, [])

  const actions = useMemo(
    () => ({
      startNewGame() {
        run({
          type: ACTIONS.NEW_GAME,
          game: createGame({ id: createId('partida'), now: nowIso() }),
        })
      },

      /**
       * Conserva equipo y participantes, pero crea una partida limpia:
       * sin datos, rondas, predicciones ni puntuaciones anteriores.
       */
      playAgain() {
        if (!game) return
        run({
          type: ACTIONS.NEW_GAME,
          game: createRematchGame(game, {
            id: createId('partida'),
            now: nowIso(),
          }),
        })
      },

      deleteGame() {
        clearStoredGame()
        dispatch({ type: ACTIONS.RESET })
      },

      resetGame() {
        run({ type: ACTIONS.RESET })
      },

      setTeamName(teamName) {
        run({ type: ACTIONS.SET_TEAM_NAME, teamName })
      },

      addPlayer(name) {
        run({
          type: ACTIONS.ADD_PLAYER,
          player: { id: createId('jugador'), name, createdAt: nowIso() },
        })
      },

      renamePlayer(playerId, name) {
        run({ type: ACTIONS.RENAME_PLAYER, playerId, name })
      },

      removePlayer(playerId) {
        run({ type: ACTIONS.REMOVE_PLAYER, playerId })
      },

      startRegistration() {
        run({ type: ACTIONS.START_REGISTRATION })
      },

      setDraftText(index, text) {
        run({ type: ACTIONS.SET_DRAFT_TEXT, index, text })
      },

      setDraftCategory(index, category) {
        run({ type: ACTIONS.SET_DRAFT_CATEGORY, index, category })
      },

      addDraftEntry() {
        run({ type: ACTIONS.ADD_DRAFT_ENTRY })
      },

      removeDraftEntry(index) {
        run({ type: ACTIONS.REMOVE_DRAFT_ENTRY, index })
      },

      /**
       * Los identificadores se generan aquí, pero el autor siempre lo
       * asigna el reducer a partir del turno actual. La interfaz nunca
       * puede declarar quién es el autor.
       */
      confirmRegistration() {
        const draft = getRegistrationDraft(game)
        if (!draft) return
        run({
          type: ACTIONS.CONFIRM_REGISTRATION,
          dataIds: draft.entries.map(() => createId('dato')),
        })
      },

      startGame() {
        if (!game) return
        run({
          type: ACTIONS.START_GAME,
          deck: buildDeck(game.data).map((datum) => datum.id),
        })
      },

      setRoundTimerDuration(seconds) {
        run({ type: ACTIONS.SET_ROUND_TIMER_DURATION, seconds })
      },

      startRoundTimer() {
        run({ type: ACTIONS.START_ROUND_TIMER })
      },

      pauseRoundTimer() {
        run({ type: ACTIONS.PAUSE_ROUND_TIMER })
      },

      tickRoundTimer() {
        run({ type: ACTIONS.TICK_ROUND_TIMER })
      },

      beginPredictions() {
        run({ type: ACTIONS.BEGIN_PREDICTIONS })
      },

      submitPrediction(predictedAuthorId) {
        run({ type: ACTIONS.SUBMIT_PREDICTION, predictedAuthorId })
      },

      confirmGroupPrediction(predictedAuthorId) {
        run({ type: ACTIONS.CONFIRM_GROUP_PREDICTION, predictedAuthorId })
      },

      advanceRound() {
        run({ type: ACTIONS.ADVANCE_ROUND })
      },
    }),
    [run, game],
  )

  const value = useMemo(
    () => ({
      game,
      storageIssue,
      dismissStorageIssue: () => setStorageIssue(null),
      ...actions,
    }),
    [game, storageIssue, actions],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
