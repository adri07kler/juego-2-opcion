import { useState } from 'react'
import { GAME_STATUS, ROUND_PHASE } from '../game/constants'
import {
  getCurrentRound,
  getDatumById,
  getGroupAnswerPlayer,
  getPredictionTurn,
  getRoundAuthor,
  getRoundProgress,
} from '../game/selectors'
import { useGame } from '../game/useGame'
import { ROUTES } from '../app/routes'
import { GroupVote } from '../components/game/GroupVote'
import { PredictionForm } from '../components/game/PredictionForm'
import { PredictionHandoff } from '../components/game/PredictionHandoff'
import { RoundMystery } from '../components/game/RoundMystery'
import { RoundReveal } from '../components/game/RoundReveal'
import { Button } from '../components/ui/Button'
import { InlineAlert } from '../components/ui/InlineAlert'
import { Screen } from '../components/ui/Screen'
import { StepIndicator } from '../components/ui/StepIndicator'

const PHASE_STEP = {
  [ROUND_PHASE.MYSTERY]: 1,
  [ROUND_PHASE.PREDICTIONS]: 2,
  [ROUND_PHASE.GROUP]: 3,
  [ROUND_PHASE.REVEAL]: 4,
}

const PHASE_COPY = {
  [ROUND_PHASE.MYSTERY]: {
    title: '¿Quién está detrás de este dato?',
    description:
      'El dato es anónimo. El equipo puede conversar y usar el temporizador antes de pasar a las predicciones privadas.',
  },
  [ROUND_PHASE.PREDICTIONS]: {
    title: 'Predicciones privadas',
    description:
      'Cada persona vota en secreto. El dato y los votos anteriores permanecen ocultos durante cada turno.',
  },
  [ROUND_PHASE.GROUP]: {
    title: 'La respuesta del equipo',
    description:
      'Las predicciones individuales ya están cerradas. Discutan juntos y confirmen una única respuesta grupal.',
  },
  [ROUND_PHASE.REVEAL]: {
    title: 'Se revela el autor',
    description:
      'Todas las predicciones estaban confirmadas. Ahora pueden comparar los votos y escuchar la historia del autor.',
  },
}

export function StartedPage({ navigate }) {
  const { game, advanceRound, confirmGroupPrediction } = useGame()
  const round = getCurrentRound(game)

  if (!game || game.status !== GAME_STATUS.PLAYING || !round) {
    return (
      <Screen
        width="narrow"
        title="No hay una ronda activa"
        description="La partida no tiene datos pendientes o todavía no ha comenzado."
      >
        <div className="space-y-4">
          <InlineAlert tone="warning">
            Vuelve al inicio y revisa el estado de la partida guardada.
          </InlineAlert>
          <Button variant="secondary" onClick={() => navigate(ROUTES.HOME)}>
            Volver al inicio
          </Button>
        </div>
      </Screen>
    )
  }

  const progress = getRoundProgress(game)
  const datum = getDatumById(game, round.dataId)
  const copy = PHASE_COPY[round.phase] ?? PHASE_COPY[ROUND_PHASE.MYSTERY]

  if (!datum) {
    return (
      <Screen width="narrow" title="No encontramos el dato de esta ronda">
        <InlineAlert tone="error">
          El contenido guardado no coincide con la ronda actual.
        </InlineAlert>
      </Screen>
    )
  }

  const isLast = game.currentRoundIndex === game.rounds.length - 1
  const turn = getPredictionTurn(game)

  function handleAdvance() {
    advanceRound()
    window.scrollTo(0, 0)
  }

  function renderPhase() {
    switch (round.phase) {
      case ROUND_PHASE.PREDICTIONS:
        if (!turn) {
          return (
            <InlineAlert tone="info">
              No queda ninguna predicción pendiente en este turno.
            </InlineAlert>
          )
        }
        return (
          <PredictionTurn
            key={turn.player.id}
            turn={turn}
            players={game.players}
          />
        )
      case ROUND_PHASE.GROUP:
        return (
          <GroupVote
            datum={datum}
            players={game.players}
            roundNumber={progress.index}
            totalRounds={progress.total}
            onConfirm={confirmGroupPrediction}
          />
        )
      case ROUND_PHASE.REVEAL:
        return (
          <RoundReveal
            round={round}
            datum={datum}
            author={getRoundAuthor(game, round)}
            groupAnswer={getGroupAnswerPlayer(game, round)}
            players={game.players}
            roundNumber={progress.index}
            totalRounds={progress.total}
            isLast={isLast}
            onAdvance={handleAdvance}
          />
        )
      case ROUND_PHASE.MYSTERY:
      default:
        return (
          <RoundMystery
            round={round}
            datum={datum}
            roundNumber={progress.index}
            totalRounds={progress.total}
          />
        )
    }
  }

  return (
    <Screen
      key={`${game.currentRoundIndex}:${round.phase}`}
      width="narrow"
      eyebrow={
        <StepIndicator
          steps={['Dato', 'Votos', 'Equipo', 'Revelación']}
          current={PHASE_STEP[round.phase] ?? 1}
        />
      }
      title={copy.title}
      description={copy.description}
    >
      {renderPhase()}
    </Screen>
  )
}

/**
 * La puerta neutral se muestra antes de cada predicción y se reinicia
 * con `key` al cambiar de jugador o al recargar la página.
 */
function PredictionTurn({ turn, players }) {
  const { submitPrediction } = useGame()
  const [activePlayerId, setActivePlayerId] = useState(null)

  if (activePlayerId !== turn.player.id) {
    return (
      <PredictionHandoff
        player={turn.player}
        position={turn.position}
        total={turn.total}
        onContinue={() => setActivePlayerId(turn.player.id)}
      />
    )
  }

  return (
    <PredictionForm
      player={turn.player}
      players={players}
      position={turn.position}
      total={turn.total}
      onConfirm={submitPrediction}
    />
  )
}
