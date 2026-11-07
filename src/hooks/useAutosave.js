import { useEffect, useRef } from 'react'
import { saveGame } from '../storage/gameStorage'

const SAVE_DELAY = 250

/**
 * Guarda la partida con un pequeño retardo para no escribir en cada tecla.
 * No guarda en el montaje inicial: si la partida guardada estaba dañada,
 * el aviso debe seguir visible hasta que la persona haga algo.
 */
export function useAutosave(game, onResult) {
  const gameRef = useRef(game)
  const onResultRef = useRef(onResult)
  const lastSavedRef = useRef(game)

  useEffect(() => {
    gameRef.current = game
  }, [game])

  useEffect(() => {
    onResultRef.current = onResult
  })

  useEffect(() => {
    if (lastSavedRef.current === game) return undefined

    const timeout = setTimeout(() => {
      lastSavedRef.current = game
      onResultRef.current?.(saveGame(game))
    }, SAVE_DELAY)
    return () => clearTimeout(timeout)
  }, [game])

  useEffect(() => {
    const flush = () => {
      if (lastSavedRef.current === gameRef.current) return
      lastSavedRef.current = gameRef.current
      onResultRef.current?.(saveGame(gameRef.current))
    }
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
    }
  }, [])
}
