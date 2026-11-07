# ¿Quién está detrás del dato?

Juego de integración para equipos. Cada participante registra datos curiosos sobre sí mismo de forma anónima; después, el grupo conversa, vota y descubre quién escribió cada dato.

## Estado del proyecto

**Fase 1 completada: base técnica y estructura visual.**

Incluye:

- React 19 + Vite 8.
- Tailwind CSS 4 con tokens de diseño propios.
- Lucide React para iconografía.
- Tipografías autoalojadas (Inter + Space Grotesk).
- Navegación por rutas hash, con botones atrás/adelante del navegador.
- Sistema de componentes reutilizables: botón, tarjeta, badge, pantalla, tarjetas de contenido.
- Pantallas de Inicio, Cómo jugar y una vista previa de Nueva partida.
- Tests unitarios del módulo de utilidades con Vitest.

Todavía **no** existe lógica de partida, registro de datos ni persistencia. La pantalla de Nueva partida es una vista previa honesta del flujo que se implementará en la siguiente fase.

## Stack

| Área | Tecnología |
|---|---|
| UI | React 19 |
| Bundler | Vite 8 |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Iconos | Lucide React |
| Tipografía | Fontsource Variable |
| Tests | Vitest |
| Persistencia | LocalStorage (siguiente fase) |
| Despliegue | Vercel |

Sin backend, sin autenticación, sin base de datos y sin multijugador en esta versión.

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run preview  # previsualizar el build
npm run lint     # ESLint
npm test         # tests (Vitest)
```

## Estructura

```
src/
├─ app/                 # rutas y navegación base
├─ components/
│  ├─ game/             # tarjetas y piezas propias del juego
│  ├─ layout/           # shell, header, footer, fondo
│  └─ ui/               # sistema de componentes reutilizables
├─ config/              # reglas y límites del juego
├─ game/                # lógica pura (fase 2)
├─ hooks/               # hooks de aplicación
├─ pages/               # pantallas
├─ storage/             # persistencia local (fase 2)
├─ styles/              # Tailwind, tokens y utilidades CSS
└─ utils/               # helpers sin dependencias
```

## Reglas resumidas

- Entre 2 y 12 participantes.
- Cada persona registra 2 o 3 datos, sin vacíos ni repetidos.
- Una predicción individual por ronda, bloqueada al confirmar.
- El autor de un dato no vota en su propia ronda.
- +10 puntos por acierto y +5 extra cada 3 aciertos consecutivos.
- La partida termina cuando se revelan todos los datos.

## Privacidad

La privacidad de esta versión es **a nivel de interfaz**: los datos se guardan en el navegador y no se envían a ningún servidor, pero una persona con acceso al dispositivo y conocimientos técnicos podría inspeccionar el almacenamiento local. El juego asume confianza entre los participantes.

## Próxima fase

Lógica pura del juego (reducer, puntuación, rachas, validaciones, barajado), persistencia en LocalStorage y flujo completo de configuración y registro.
