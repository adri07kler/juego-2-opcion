# ¿Quién está detrás del dato?

Juego de integración para equipos. Cada participante registra datos curiosos sobre sí mismo de forma anónima; después, el grupo conversa, vota y descubre quién escribió cada dato.

## Estado del proyecto

**Fase 3 completada: motor de rondas, votación y clasificación final.**

Incluye:

- React 19 + Vite 8 + Tailwind CSS 4 + Lucide React.
- Navegación por rutas hash, con botones atrás/adelante del navegador.
- **Equipo:** nombre del equipo, alta, edición y eliminación de participantes, límite de 2 a 12 personas y validación de nombres repetidos.
- **Registro privado secuencial:** cada persona registra de 2 a 3 datos con categoría opcional, puede editar o eliminar antes de confirmar y recibe validación de campos vacíos y datos repetidos.
- **Entrega del dispositivo:** pantalla neutral antes de cada turno de registro o predicción que no muestra información de la persona anterior.
- **Preparación:** resumen de participantes y total de datos, inicio de partida y bloqueo de todas las modificaciones al comenzar.
- **Rondas:** todos los datos se barajan en una secuencia sin repeticiones y cada ronda muestra un único dato anónimo.
- **Temporizador configurable:** entre 60 y 90 segundos (75 por defecto), con iniciar, pausar y reiniciar. Se detiene al pasar a las predicciones y no avanza durante las fases privadas ni la votación grupal.
- **Predicciones privadas secuenciales:** cada participante vota en su turno sin ver el dato, los votos anteriores ni al autor. La predicción queda bloqueada al confirmar.
- **Respuesta grupal:** tras completar todos los votos, el equipo discute y confirma una única respuesta con diálogo de confirmación.
- **Revelación:** autor real, dato original, respuesta del equipo, resultado de cada predicción y aviso para que el autor cuente su historia.
- **Puntuación:** +10 por acierto individual, +5 extra en cada tercer acierto consecutivo y racha a cero tras un fallo.
- **Clasificación final:** orden por puntos, empates con el mismo puesto y opción de empezar una partida nueva.
- **Persistencia:** guardado automático en LocalStorage, recuperación tras recargar (incluido el temporizador en marcha) y reparación de estados dañados o de versiones anteriores.
- Tests unitarios del dominio, del motor de rondas, de la puntuación y de la persistencia con Vitest.

## Flujo

1. **Equipo** (`#partida`): nombre del equipo y al menos dos participantes.
2. **Registro** (`#partida`): por orden de la lista, cada persona:
   - ve una pantalla neutral con su nombre y confirma que es su turno;
   - escribe entre 2 y 3 datos con categoría opcional;
   - puede editar o quitar datos antes de confirmar;
   - al confirmar, los campos se limpian y vuelve la pantalla neutral para el siguiente turno.
3. **Listo** (`#partida`): se muestra el registro completo, el total de datos y el botón para iniciar.
4. **Dato misterioso** (`#partida`): se muestra la ronda actual y un dato anónimo. El equipo puede conversar y usar el temporizador opcional.
5. **Predicciones privadas** (`#partida`): una por una, cada persona recibe el dispositivo, elige a quién cree que pertenece el dato y bloquea su voto. El dato y los votos anteriores permanecen ocultos.
6. **Respuesta del equipo** (`#partida`): con todos los votos cerrados, el grupo discute y confirma una única respuesta.
7. **Revelación** (`#partida`): se muestran el autor, el dato, la respuesta grupal, los aciertos y fallos individuales y la puntuación acumulada.
8. **Siguiente ronda o final** (`#partida`): se avanza al siguiente dato o, tras el último, se muestra la clasificación final (`#partida`).

Al recargar durante el registro siempre aparece primero la pantalla neutral: el borrador se conserva, pero no se muestra hasta que la persona correcta confirma su turno. Lo mismo ocurre con cada predicción privada: la selección local se descarta y hay que pasar de nuevo por la pantalla de entrega.

## Privacidad

La privacidad es **visual**, no criptográfica:

- La interfaz nunca muestra los datos registrados por otras personas durante el registro.
- En cada turno de registro o predicción solo aparece el nombre de la persona que debe actuar.
- No se muestra la lista de datos durante la preparación.
- Las pantallas de transición ocultan por completo la información anterior.
- Durante las predicciones no se muestran ni el dato misterioso ni los votos ya emitidos.
- El autor y los votos individuales solo se muestran en la revelación, cuando todas las predicciones están confirmadas.
- Los mensajes de error no incluyen el texto de los datos ni nombres de autores.
- Cada dato se vincula internamente a su autor para poder revelarlo en la fase de juego.

Los datos se guardan en el navegador y no se envían a ningún servidor. Una persona con acceso al dispositivo y conocimientos técnicos podría inspeccionar LocalStorage; no hay cifrado. El juego asume confianza entre los participantes.

## Stack

| Área | Tecnología |
|---|---|
| UI | React 19 |
| Bundler | Vite 8 |
| Estilos | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Iconos | Lucide React |
| Tipografía | Fontsource Variable |
| Tests | Vitest |
| Persistencia | LocalStorage |
| Despliegue | Vercel |

Sin backend, sin autenticación, sin base de datos y sin multijugador.

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
│  ├─ game/             # piezas del flujo de equipo, registro y rondas
│  ├─ layout/           # shell, header, footer, fondo
│  └─ ui/               # sistema de componentes reutilizables
├─ config/              # reglas y límites del juego
├─ game/                # dominio puro, contexto y provider
│  └─ __tests__/        # reducer, motor de rondas, puntuación, validación y barajado
├─ hooks/               # navegación, autoguardado y reloj de ronda
├─ pages/               # pantallas
├─ storage/             # persistencia en LocalStorage
│  └─ __tests__/
├─ styles/              # Tailwind, tokens y utilidades CSS
└─ utils/               # helpers sin dependencias
```

## Modelo de estado

La partida es una máquina de estados:

```
team → registration → ready → playing → finished
```

- `team`: se edita el equipo.
- `registration`: turno de registro; el borrador pertenece solo a la persona actual.
- `ready`: todos tienen entre 2 y 3 datos; se puede iniciar.
- `playing`: datos, participantes y borrador bloqueados; hay una ronda activa.
- `finished`: todas las rondas fueron reveladas; se muestra la clasificación final.

Cada ronda avanza por sus propias fases:

```
mystery → predictions → group → reveal
```

- `mystery`: dato anónimo y temporizador opcional.
- `predictions`: votos privados secuenciales, uno por participante.
- `group`: respuesta única del equipo, bloqueada al confirmar.
- `reveal`: autor, comparación de votos, puntuación y aviso de la historia.

El autor de cada dato lo asigna siempre el reducer a partir del turno de registro; la interfaz nunca puede declararlo. Del mismo modo, el voto privado se asigna a la persona del turno actual y no a quien lo envíe desde la interfaz.

## Almacenamiento

- Clave principal: `quien-detras-del-dato/game`.
- Esquema: `1`.
- Respaldo ante contenido dañado: `quien-detras-del-dato/game/backup`.
- Autoguardado con retardo de 250 ms y guardado forzado al cerrar o recargar la página.
- El temporizador guarda `durationSeconds`, `remainingSeconds`, `endsAt` y `running`; al recargar se descuenta el tiempo real transcurrido.
- Al cargar, se corrigen borradores que no pertenecen al turno actual y se promueve a `ready` si ya no queda nadie por registrar.
- También se reconstruyen rondas y puntuaciones ausentes de partidas guardadas por versiones anteriores, se reparan temporizadores y votos inválidos y se degrada a `playing` una partida marcada como finalizada si sus rondas no están completas.

## Reglas resumidas

- Entre 2 y 12 participantes.
- Cada persona registra 2 o 3 datos, sin vacíos ni repetidos.
- Todos los participantes votan en cada ronda, incluida la persona autora del dato.
- Una predicción individual por ronda, bloqueada al confirmar.
- Una única respuesta grupal por ronda, bloqueada al confirmar; al hacerlo se revela al autor.
- +10 puntos por acierto y +5 extra cada 3 aciertos consecutivos; un fallo reinicia la racha.
- La partida termina cuando se revelan todos los datos y se muestra la clasificación por puntos.
- Quienes empatan en puntos comparten puesto.

## Próximas ideas

- Historial de partidas anteriores.
- Exportación de resultados.
- Modo de dos dispositivos o multijugador en red.
