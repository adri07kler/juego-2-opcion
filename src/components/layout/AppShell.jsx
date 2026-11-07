import { AppFooter } from './AppFooter'
import { AppHeader } from './AppHeader'
import { BackgroundDecor } from './BackgroundDecor'

export function AppShell({ route, navigate, children }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <BackgroundDecor />
      <AppHeader route={route} navigate={navigate} />
      <div className="flex-1">{children}</div>
      <AppFooter />
    </div>
  )
}
