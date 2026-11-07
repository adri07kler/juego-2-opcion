import { useEffect } from 'react'
import { ROUTES, ROUTE_TITLES } from './app/routes'
import { AppShell } from './components/layout/AppShell'
import { useScreenNavigation } from './hooks/useScreenNavigation'
import { GamePage } from './pages/GamePage'
import { HomePage } from './pages/HomePage'
import { InstructionsPage } from './pages/InstructionsPage'

const GAME_TITLE = '¿Quién está detrás del dato?'

const SCREENS = {
  [ROUTES.HOME]: HomePage,
  [ROUTES.INSTRUCTIONS]: InstructionsPage,
  [ROUTES.GAME]: GamePage,
}

export default function App() {
  const { route, navigate } = useScreenNavigation()
  const Page = SCREENS[route] ?? HomePage

  useEffect(() => {
    document.title =
      route === ROUTES.HOME
        ? GAME_TITLE
        : `${ROUTE_TITLES[route]} · ${GAME_TITLE}`
  }, [route])

  return (
    <AppShell route={route} navigate={navigate}>
      <Page key={route} navigate={navigate} />
    </AppShell>
  )
}
