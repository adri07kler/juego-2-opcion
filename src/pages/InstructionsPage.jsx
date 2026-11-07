import {
  ArrowRight,
  Check,
  Fingerprint,
  Target,
  Trophy,
  Vote,
} from 'lucide-react'
import { ROUTES } from '../app/routes'
import { StepCard } from '../components/game/StepCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Screen } from '../components/ui/Screen'
import { GAME_CONFIG } from '../config/gameConfig'
import { useGame } from '../game/useGame'

const { points, minPlayers, maxPlayers, dataPerPlayer } = GAME_CONFIG

const STEPS = [
  {
    icon: Target,
    title: 'El objetivo',
    body: 'Descubrir quién escribió cada dato. La app muestra un dato anónimo y el equipo conversa, investiga y deduce a qué persona pertenece.',
  },
  {
    icon: Fingerprint,
    title: 'Registro anónimo',
    body: `Cada participante escribe ${dataPerPlayer.min} o ${dataPerPlayer.max} datos sobre sí mismo desde el mismo dispositivo. Entre una persona y la siguiente aparece una pantalla de transición para entregar el dispositivo sin mostrar nada. La app mezcla todo antes de empezar.`,
  },
  {
    icon: Vote,
    title: 'Predicciones individuales',
    body: 'En cada ronda cada jugador vota en privado quién cree que escribió el dato. Después, el equipo acuerda una respuesta conjunta. Las respuestas se bloquean y solo entonces se revela al autor.',
  },
  {
    icon: Trophy,
    title: 'La puntuación',
    body: `Cada acierto individual suma ${points.correct} puntos. Además, cada ${points.streakEvery} aciertos consecutivos otorgan ${points.streakBonus} puntos extra. Un fallo reinicia la racha. Gana quien más puntos acumule al terminar todos los datos.`,
  },
]

const RULES = [
  `Entre ${minPlayers} y ${maxPlayers} participantes.`,
  'Cada persona registra entre 2 y 3 datos, sin vacíos ni repetidos.',
  'Una sola predicción por jugador y ronda: al confirmar queda bloqueada.',
  'El autor de un dato recibe su turno, pero no vota en su propia ronda.',
  'El equipo también fija una respuesta grupal que no puede modificarse.',
  'La partida termina cuando se han revelado todos los datos.',
]

function Stat({ value, label }) {
  return (
    <div className="text-center sm:text-left">
      <p className="font-display text-3xl font-semibold text-gradient">
        {value}
      </p>
      <p className="mt-1 text-sm text-mist-400">{label}</p>
    </div>
  )
}

export function InstructionsPage({ navigate }) {
  const { game } = useGame()

  return (
    <Screen
      width="narrow"
      eyebrow={
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-300/80">
          Reglas del juego
        </p>
      }
      title="Cómo jugar"
      description="Todo lo que el equipo necesita saber antes de empezar. La idea es simple: datos anónimos, conversación y votos secretos."
    >
      <div className="space-y-4">
        {STEPS.map((step, index) => (
          <StepCard
            key={step.title}
            number={index + 1}
            icon={step.icon}
            title={step.title}
          >
            {step.body}
          </StepCard>
        ))}
      </div>

      <Card className="mt-4 p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-mist-100">
          En números
        </h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          <Stat value={`+${points.correct}`} label="puntos por acierto" />
          <Stat
            value={`+${points.streakBonus}`}
            label={`cada ${points.streakEvery} aciertos seguidos`}
          />
          <Stat
            value={`${dataPerPlayer.min}–${dataPerPlayer.max}`}
            label="datos por persona"
          />
        </div>
      </Card>

      <Card className="mt-4 p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-mist-100">
          Reglas rápidas
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {RULES.map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-2.5 text-sm leading-relaxed text-mist-300"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-accent-400"
                aria-hidden="true"
              />
              {rule}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-4 p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-mist-100">
          Privacidad
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mist-400">
          La app oculta los datos y nunca muestra al autor en las pantallas de
          registro ajenas. Todo se guarda en este navegador y no se envía a
          ningún servidor. Es una privacidad <strong className="font-semibold text-mist-300">visual</strong>:
          no hay cifrado frente a alguien con acceso al dispositivo que
          inspeccione el almacenamiento local. El juego asume confianza entre
          los participantes.
        </p>
      </Card>

      <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-3xl border border-accent-400/20 bg-accent-500/[0.07] p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <div>
          <p className="font-display text-lg font-semibold text-mist-100">
            ¿Listo para descubrir a tu equipo?
          </p>
          <p className="mt-1 text-sm text-mist-400">
            Solo hace falta un dispositivo y ganas de conversar.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            onClick={() => navigate(ROUTES.GAME)}
            className="w-full sm:w-auto"
          >
            {game ? 'Continuar partida' : 'Crear partida'}
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.HOME)}
            className="w-full sm:w-auto"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </Screen>
  )
}
