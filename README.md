# ¿Quién está detrás del dato?

Juego de integración para equipos. Cada participante registra datos curiosos sobre sí mismo de forma anónima; después, el grupo conversa, vota y descubre quién escribió cada dato.

## Estado del proyecto

**Fase 2 completada: creación de equipos y registro privado de datos.**

Incluye:

- React 19 + Vite 8 + Tailwind CSS 4 + Lucide React.
- Navegación por rutas hash, con botones atrás/adelante del navegador.
- **Equipo:** nombre del equipo, alta, edición y eliminación de participantes, límite de 2 a 12 personas y validación de nombres repetidos.
- **Registro privado secuencial:** cada persona registra de 2 a 3 datos con categoría opcional, puede editar o eliminar antes de confirmar y recibe validación de campos vacíos y datos repetidos.
- **Entrega del dispositivo:** pantalla neutral antes de cada turno que no muestra datos del registro anterior ni del borrador.
- **Preparación:** resumen de participantes y total de datos, inicio de partida y bloqueo de todas las modificaciones al comenzar.
- **Persistencia:** guardado automático en LocalStorage, recuperación tras recargar y respaldo si el contenido está dañado.
- Tests unitarios del dominio y de la persistencia con Vitest.

Las rondas, la votación privada, la revelación de autores y la puntuación quedan para la siguiente fase. La pantalla de partida iniciada muestra el estado bloqueado de forma honesta.

## Flujo

1. **Equipo** (`#partida`): nombre del equipo y al menos dos participantes.
2. **Registro** (`#partida`): por orden de la lista, cada persona:
   - ve una pantalla neutral con su nombre y confirma que es su turno;
   - escribe entre 2 y 3 datos con categoría opcional;
   - puede editar o quitar datos antes de confirmar;
   - al confirmar, los campos se limpian y vuelve la pantalla neutral para el siguiente turno.
3. **Listo** (`#partida`): se muestra el registro completo, el total de datos y el botón para iniciar.
4. **Partida iniciada** (`#partida`): participantes y datos quedan bloqueados.

Al recargar durante el registro siempre aparece primero la pantalla neutral: el borrador se conserva, pero no se muestra hasta que la persona correcta confirma su turno.

## Privacidad

La privacidad es **visual**, no criptográfica:

- La interfaz nunca muestra los datos registrados por otras personas.
- En cada turno solo aparece el nombre de la persona que debe registrar.
- No se muestra la lista de datos durante la preparación.
- La pantalla de transición oculta por completo la información anterior.
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
│  ├─ game/             # piezas del flujo de equipo y registro
│  ├─ layout/           # shell, header, footer, fondo
│  └─ ui/               # sistema de componentes reutilizables
├─ config/              # reglas y límites del juego
├─ game/                # dominio puro, contexto y provider
│  └─ __tests__/        # reducer, validación y barajado
├─ hooks/               # navegación y autoguardado
├─ pages/               # pantallas
├─ storage/             # persistencia en LocalStorage
│  └─ __tests__/
├─ styles/              # Tailwind, tokens y utilidades CSS
└─ utils/               # helpers sin dependencias
```

## Modelo de estado

La partida es una máquina de estados:

```
team → registration → ready → playing
```

- `team`: se edita el equipo.
- `registration`: turno de registro; el borrador pertenece solo a la persona actual.
- `ready`: todos tienen entre 2 y 3 datos; se puede iniciar.
- `playing`: datos, participantes y borrador bloqueados.

El autor de cada dato lo asigna siempre el reducer a partir del turno actual; la interfaz nunca puede declararlo.

## Almacenamiento

- Clave principal: `quien-detras-del-dato/game`.
- Esquema: `1`.
- Respaldo ante contenido dañado: `quien-detras-del-dato/game/backup`.
- Autoguardado con retardo de 250 ms y guardado forzado al cerrar o recargar la página.
- Al cargar, se corrigen borradores que no pertenecen al turno actual y se promueve a `ready` si ya no queda nadie por registrar.

## Reglas resumidas

- Entre 2 y 12 participantes.
- Cada persona registra 2 o 3 datos, sin vacíos ni repetidos.
- Una predicción individual por ronda, bloqueada al confirmar.
- El autor de un dato no vota en su propia ronda.
- +10 puntos por acierto y +5 extra cada 3 aciertos consecutivos.
- La partida termina cuando se revelan todos los datos.

## Próxima fase

Rondas de juego: barajado visible, votación privada por jugador, respuesta grupal, revelación del autor, puntuación con rachas y clasificación final.
