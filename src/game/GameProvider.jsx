import { useCallback, useMemo, useReducer, useState } from 'react'
import { useAutosave } from '../hooks/useAutosave'
import { loadGame } from '../storage/gameStorage'
import { createId, nowIso } from '../utils/ids'
import { ACTIONS } from './constants'
import { GameContext } from './GameContext'
import { createGame } from './factory'
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
