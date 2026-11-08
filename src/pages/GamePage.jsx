import { GAME_STATUS } from '../game/constants'
import { useGame } from '../game/useGame'
import { NoGamePage } from './NoGamePage'
import { ReadyPage } from './ReadyPage'
import { RegistrationPage } from './RegistrationPage'
import { ResultsPage } from './ResultsPage'
import { StartedPage } from './StartedPage'
import { TeamSetupPage } from './TeamSetupPage'

export function GamePage({ navigate }) {
  const { game } = useGame()

  if (!game) return <NoGamePage navigate={navigate} />

  switch (game.status) {
    case GAME_STATUS.TEAM:
      return <TeamSetupPage />
    case GAME_STATUS.REGISTRATION:
      return <RegistrationPage />
    case GAME_STATUS.READY:
      return <ReadyPage navigate={navigate} />
    case GAME_STATUS.PLAYING:
      return <StartedPage navigate={navigate} />
    case GAME_STATUS.FINISHED:
      return <ResultsPage navigate={navigate} />
    default:
      return <NoGamePage navigate={navigate} />
  }
}
