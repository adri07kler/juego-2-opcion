import { useCallback, useEffect, useState } from 'react'
import { ROUTES, isRoute } from '../app/routes'

function readRouteFromHash() {
  if (typeof window === 'undefined') return ROUTES.HOME
  const hash = window.location.hash.replace(/^#\/?/, '')
  return isRoute(hash) ? hash : ROUTES.HOME
}

/**
 * Navegación mínima sin router: el hash es la fuente de verdad,
 * así los botones atrás/adelante del navegador funcionan.
 */
export function useScreenNavigation() {
  const [route, setRoute] = useState(readRouteFromHash)

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', `#${ROUTES.HOME}`)
    }

    const handleHashChange = () => setRoute(readRouteFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = useCallback((nextRoute) => {
    if (!isRoute(nextRoute) || nextRoute === readRouteFromHash()) return
    window.location.hash = nextRoute
    window.scrollTo(0, 0)
  }, [])

  return { route, navigate }
}
