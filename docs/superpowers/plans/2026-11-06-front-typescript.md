# Front de CardioPrev en TypeScript: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar `static/js/app.js` y `api.js` por 35 clases TypeScript en `front/src/`, compiladas a un solo `static/js/app.js`, sin ningún cambio visible.

**Architecture:** Raíz de composición (`App`) que inyecta por constructor; capas `datos`, `dominio`, `servicios`, `interfaz`, `vistas`. El JS viejo sigue activo hasta la Tarea 7. Antes de eso, cada entrega se compara contra la base sirviendo el bundle candidato por intercepción de red.

**Tech Stack:** TypeScript 7.0.2, esbuild 0.28.2 (desarrollo). Arnés fuera del repo: playwright-core 1.65.0 con el Edge instalado, sin bajar navegadores.

**Spec:** `docs/superpowers/specs/2026-11-06-front-solid-design.md`. Léela: las secciones 6, 7 y 9 son requisitos de cada tarea y este plan no las repite.

## Global Constraints

- Un archivo por clase, llamado como la clase. Un tipo o contrato por archivo.
- Prohibido `any`, `as any` y `@ts-ignore`.
- Colaboradores con `import type`. Los `import` de valor permitidos están en la spec, sección 7.
- Solo `App` y `FabricaVistas` hacen `new` de clases de la aplicación (excepciones en spec, sección 7).
- HTML y textos se copian tal cual de la fuente indicada. Los números `app.js:N` y `api.js:N` se refieren a `git show 2c4506d:static/js/<archivo>`.
- Los bugs de la spec, sección 10, se conservan. No se arreglan al pasar.
- Commits en rama `refactor/front-typescript`, con formato convencional (el hook lo exige) y este cierre:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- `$ARNES` = `C:\Users\james\AppData\Local\Temp\claude\fc304b6e014434ef\48221211-cd4e-4b00-a37d-7c9388245fae\scratchpad\arnes`. Nada de ahí entra al repo.
- Nunca usar `cardioprev.db`; solo bases temporales con `CARDIOPREV_DB`.

## Review Focus

1. `sessionStorage` bloqueado, que lanza al acceder: la app pinta login sin romperse. Prueba en Tareas 1 y 3.
2. `cp_borrador` con JSON corrupto o parcial: Inicio carga con borrador vacío o completado con valores por defecto. Prueba en Tareas 1 y 3.
3. Nombre de usuario con HTML (`<img src=x onerror=...>`): se ve escapado y no se ejecuta. Prueba en Tarea 1.
4. Servidor caído con sesión abierta: sale `No se pudo conectar con el servidor...`. Prueba en Tareas 1 y 3.
5. Respuestas `No` (`false`) y `0`: cuentan como respondidas. Un `!valor` las rompería al pasar a TS. Prueba en Tareas 1 y 3.

---

### Task 1: Rama, arnés y captura de la base

**Files:**
- Create fuera del repo: `$ARNES/package.json`, `$ARNES/arnes.mjs`, `$ARNES/comparar.mjs`
- Commit: la spec y este plan

**Interfaces:**
- Produces: `node arnes.mjs <nombre> <raiz> <puerto> [--bundle <ruta>] [--grupos a,b]` escribe `$ARNES/<nombre>.json`. `node comparar.mjs <a.json> <b.json> [--grupos a,b]` imprime diferencias y sale con 1 si hay.

- [ ] **Step 1: Crear rama y guardar documentos**

```bash
git switch -c refactor/front-typescript
git add docs/
git commit -m "docs: diseño y plan del front en TypeScript" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 2: Exportar la base y sembrar**

`git archive 2c4506d` a `$ARNES/base/`. Con `cwd` en `$ARNES/base` y `CARDIOPREV_DB=$ARNES/semilla.db`, correr `seed_demo.py` con el Python de `.venv`.

Expected: existe `semilla.db`. `git status` no muestra cambios en `cardioprev.db`.

- [ ] **Step 3: Instalar y escribir `arnes.mjs`**

`playwright-core@1.65.0` con versión exacta. Por cada corrida: copiar `semilla.db` a `<nombre>.db`, levantar `uvicorn app.main:app --port <puerto>` con `cwd=<raiz>` y ese `CARDIOPREV_DB`, abrir Edge con `channel: 'msedge'` headless, correr los escenarios y matar el servidor al salir, también si falla.

- Cada escenario usa contexto nuevo. Espera `networkidle` y captura: `hash`, `#barra`, `#flash`, `#vista`, `sessionStorage` sin el valor de `cp_token`, errores de consola y `pageerror`.
- Normalizar HTML: colapsar espacios, quitar espacios entre `>` y `<`, cambiar fechas `\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?` por `<FECHA>`.
- `--bundle`: con `page.route`, responder `**/static/js/app.js` con ese archivo y `**/static/js/api.js` con vacío.
- Credenciales demo: leerlas de `seed_demo.py`, no copiarlas. Usuarios nuevos por escenario, con correo fijo para que los ids coincidan.

- [ ] **Step 4: Escribir escenarios**

Son los de la spec, sección 11, agrupados:

| Grupo | Escenarios |
|---|---|
| `sesion` | login, registro y FAQ sin sesión; ruta protegida; ruta desconocida con y sin sesión; login correcto; login incorrecto, y luego ir a registro; registro con correo repetido y con varios errores 422; salir desde cada barra; FAQ con sesión; token falso (401); inactividad con `page.clock`: a los 14:59 sigue, a los 15:00 va a login; **almacén bloqueado** (`addInitScript` que hace lanzar a `sessionStorage`); **nombre con HTML**; **red caída** (`page.route('**/api/**', abort)`) |
| `inicio` | borrador vacío; borrador corrupto; borrador parcial sembrado en `sessionStorage` |
| `resultado` | resultado con alertas y nutrición; resultado inexistente; historial con y sin registros; PDF desde resultado y desde historial, comprobando nombre sugerido y que empiece por `%PDF` |
| `modulos` | los 5 módulos con y sin `?seq=1`: pantalla, envío vacío, envío correcto; flujo secuencial completo; error en el último paso (sistólica menor que diastólica); los 4 casos de "Riesgo Cardiovascular"; presiones con y sin registros; **todo `No`**; **peso `0`** |

- [ ] **Step 5: Probar que el arnés es determinista**

Run: `node arnes.mjs base <raiz-base> 8101` y `node arnes.mjs base2 <raiz-base> 8101`, luego `node comparar.mjs base.json base2.json`

Expected: 0 diferencias. Si hay, arreglar la normalización antes de seguir.

- [ ] **Step 6: Confirmar los bugs de la spec**

En `base.json`: login incorrecto con `#flash` vacío, y registro posterior con "Tu sesión expiró". Último paso con error: `#/inicio` con `#flash` vacío.

Si un bug no se confirma, avisar al usuario y anotarlo en la spec, sección 10. El arnés sigue mandando: la rama debe igualar a la base.

---

### Task 2: Herramientas, tipos y contratos

**Files:**
- Create: `front/package.json`, `front/package-lock.json`, `front/tsconfig.json`, `front/src/contratos/*.ts`, `front/src/tipos/*.ts`
- Modify: `.gitignore` (agregar `front/node_modules/`)

**Interfaces:**
- Produces, en `tipos/`:
  - `SeccionId = 'datos'|'alimentacion'|'actividad'|'consumo'|'clinica'`
  - `ValorCampo = string|number|boolean`
  - `DatosSeccion = Record<string, ValorCampo>`
  - `DefinicionSeccion {titulo: string; ruta: string; campos: readonly string[]}`
  - `EstadoBorrador = Record<SeccionId, DatosSeccion> & {ultimo: string|null; ultimoId: number|null}`
  - `TipoAviso = 'ok'|'error'|'aviso'`
  - `TipoBarra = 'auth'|'dash'|'interna'`
  - `OpcionCampo = readonly [string, string]`
  - `OpcionesPeticion {metodo?: string; cuerpo?: unknown; blob?: boolean}`
  - `DatosRegistro {nombre, correo, password: string}`
  - `RespuestaLogin {token, nombre: string}`
  - `RespuestaMensaje {mensaje: string}`
  - `FactorResultado`, `Nutricion`, `ResultadoEvaluacion`: de `app/models.py`, con `id: number|null` y `nutricion: Nutricion|null`
  - `ItemHistorial {id: number; fecha: string; puntaje: number; nivel: string; color: string}`
  - `RegistroPresion {id: number; fecha: string; sistolica: number; diastolica: number; estado: string}`
- Produces, en `contratos/`:
  - `Almacen`: `leer(k: string): string|null; escribir(k: string, v: string): void; borrar(k: string): void`
  - `FuenteToken`: `token(): string|null; renovar(t: string): void`
  - `EstadoSesion`: `activa(): boolean; nombre(): string`
  - `AperturaSesion`: `abrir(token: string, nombre: string): void; nombre(): string`
  - `ObservadorCierre`: `alCerrarSesion(): void`
  - `Transporte`: `peticion<T>(ruta: string, opciones?: OpcionesPeticion): Promise<T>`
  - `ApiAuth`: `registro(d: DatosRegistro): Promise<RespuestaMensaje>; login(correo: string, password: string): Promise<RespuestaLogin>`
  - `ApiEvaluaciones`: `crearEvaluacion(d: DatosSeccion): Promise<ResultadoEvaluacion>; historial(): Promise<ItemHistorial[]>; presiones(): Promise<RegistroPresion[]>; evaluacion(id: string): Promise<ResultadoEvaluacion>; pdf(id: string): Promise<Blob>`

- [ ] **Step 1: Crear `package.json` y `tsconfig.json`**

Versiones exactas `typescript@7.0.2` y `esbuild@0.28.2`. `tsconfig` como dice la spec, sección 5, con `include: ["src"]`. Script `check`: `tsc --noEmit`. **Todavía no** definir `build`.

Si TS 7.0.2 rechaza una opción de la spec, parar y avisar; no aflojar la configuración.

- [ ] **Step 2: Instalar**

Run: `npm install` en `front/`

Expected: `git status` no muestra `front/node_modules`.

- [ ] **Step 3: Escribir tipos y contratos**

- [ ] **Step 4: Comprobar**

Run: `npm run check`

Expected: 0 errores.

- [ ] **Step 5: Commit**

`build: herramientas de TypeScript, tipos y contratos del front`

---

### Task 3: Datos y dominio

**Files:**
- Create: `front/src/datos/{ApiError,AlmacenSesion,Sesion,ClienteHttp,Api,RepositorioBorrador}.ts`, `front/src/dominio/{CatalogoSecciones,Borrador}.ts`
- Test fuera del repo: `$ARNES/unidad/datos.test.ts`

**Interfaces:**
- Consumes: contratos y tipos de la Tarea 2.
- Produces:

| Clase | Firma | Fuente |
|---|---|---|
| `ApiError extends Error` | `constructor(readonly status: number, readonly mensajes: string[])` | `api.js:2-8` |
| `AlmacenSesion implements Almacen` | sin constructor | `api.js:13-15` |
| `Sesion implements FuenteToken, EstadoSesion, AperturaSesion, ObservadorCierre` | `constructor(almacen: Almacen)`. Claves `cp_token`, `cp_nombre` | `api.js:11,16,46-48,53-54` |
| `ClienteHttp implements Transporte` | `constructor(fuente: FuenteToken)` | `api.js:18-43` |
| `Api implements ApiAuth, ApiEvaluaciones` | `constructor(t: Transporte)`. `login` no guarda nada | `api.js:50-61` |
| `CatalogoSecciones` | `orden(): readonly SeccionId[]; definicion(s): DefinicionSeccion; posicion(s): number` (desde 1); `total(): number; siguiente(s): SeccionId\|null` | `app.js:17-24` |
| `Borrador` | `constructor(catalogo, estado: EstadoBorrador); seccion(s): DatosSeccion; actualizar(s, d): void; completa(s): boolean; todoCompleto(): boolean; payload(): DatosSeccion; faltantes(): SeccionId[]; cambioDesdeUltimoEnvio(): boolean; ultimoId(): number\|null; registrarEnvio(payload: DatosSeccion, id: number): void; aEstado(): EstadoBorrador` | `app.js:25-27` |
| `RepositorioBorrador implements ObservadorCierre` | `constructor(almacen, catalogo); leer(): Borrador; guardar(b): void; borrar(): void; alCerrarSesion(): void`. Clave `cp_borrador` | `app.js:11-15` |

- [ ] **Step 1: Escribir las pruebas que fallan**

Compilan con `esbuild --bundle --platform=node --format=esm` y corren con `node --test`. Con `Almacen` falso en memoria y `fetch` falso:

```ts
// Borrador.completa: solo undefined, null y '' son vacío
completa con {fuma:false, consume_alcohol:false, diabetes:false, antecedentes_familiares:false} === true
completa con {presion_sistolica:0, ...} === true
completa con un campo '' === false
payload() une las secciones en el orden de CatalogoSecciones
cambioDesdeUltimoEnvio(): false tras registrarEnvio con el mismo payload
// RepositorioBorrador
leer() con JSON corrupto: todoCompleto() === false y seccion('datos') vacía
leer() con '{"ultimoId":7}': ultimoId() === 7 y seccion('datos') vacía
guardar() deja JSON con claves datos, alimentacion, actividad, consumo, clinica, ultimo, ultimoId
// AlmacenSesion con sessionStorage que lanza
leer() === null, y escribir() y borrar() no lanzan
// Sesion
activa() === false sin token; nombre() === ''
alCerrarSesion() borra cp_token y cp_nombre
// ClienteHttp
respuesta 400 con X-Token-Renovado: el token queda renovado y lanza ApiError(400, ...)
fetch rechazado: ApiError(0, ['No se pudo conectar con el servidor. Verifica que esté en ejecución.'])
500 sin JSON: mensajes === ['Error 500']
detail lista y detail texto: mensajes es lista
sin cuerpo no manda Content-Type; con token manda 'Authorization: Bearer <t>'
// CatalogoSecciones
siguiente('clinica') === null; siguiente('datos') === 'alimentacion'; posicion('datos') === 1; total() === 5
```

- [ ] **Step 2: Comprobar que fallan**

Expected: esbuild falla porque las clases no existen.

- [ ] **Step 3: Implementar las 8 clases**

- [ ] **Step 4: Comprobar**

Run: `node --test` y `npm run check`

Expected: todas pasan, 0 errores de tipos.

- [ ] **Step 5: Commit**

`feat: capa de datos y dominio del front`

---

### Task 4: Servicios y piezas de interfaz

**Files:**
- Create: `front/src/servicios/{CierreSesion,FlujoEvaluacion,DescargaPdf,VigilanteInactividad}.ts`, `front/src/interfaz/{Html,Avisos,Navegador,ManejadorErrores,BarraNavegacion,Campos,LectorFormulario}.ts`
- Test fuera del repo: `$ARNES/unidad/servicios.test.ts`

**Interfaces:**
- Consumes: Tarea 3.
- Produces:

| Clase | Firma | Fuente |
|---|---|---|
| `Html` | `static esc(v: unknown): string; static fecha(v: unknown): string` | `app.js:8`; `fecha` = `esc(String(v).replace('T',' ').slice(0,16))` |
| `Avisos` | `constructor(caja: HTMLElement); mostrar(msg: string, tipo: TipoAviso='ok', lista: string[]\|null=null): void; limpiar(): void; avisarLuego(msg: string, tipo: TipoAviso='ok'): void; mostrarPendiente(): void`. `mostrar` con mensaje vacío limpia | `app.js:30-38` |
| `Navegador` | `ir(ruta: string): void` | `app.js:46` |
| `CierreSesion` | `constructor(avisos, navegador); suscribir(o: ObservadorCierre): void; ejecutar(aviso?: string): void` | `app.js:47-51` |
| `ManejadorErrores` | `constructor(avisos, cierre); mostrar(e: unknown): void` | `app.js:39-45` |
| `BarraNavegacion` | `constructor(contenedor: HTMLElement, cierre); mostrar(tipo: TipoBarra): void` | `app.js:54-68` |
| `Campos` | `numero(n: string, etiqueta: string, v: unknown, extra=''): string; seleccion(n, etiqueta, lista: readonly OpcionCampo[], v: unknown): string; siNo(n, etiqueta, v: unknown): string` | `app.js:71-72,77-82` |
| `LectorFormulario` | `leer(f: HTMLFormElement, numericos: readonly string[]=[], booleanos: readonly string[]=[]): DatosSeccion` | `app.js:83-87` |
| `VigilanteInactividad` | `constructor(sesion: EstadoSesion, cierre, minutos: number); iniciar(): void; reiniciar(): void` | `app.js:320-326` |
| `DescargaPdf` | `constructor(api: ApiEvaluaciones, errores); descargar(id: string): Promise<void>` | `app.js:282-289` |
| `FlujoEvaluacion` | `constructor(repo, catalogo, api: ApiEvaluaciones, avisos, navegador, errores); enviar(): Promise<void>; verRiesgo(): Promise<void>` | `app.js:173-195` |

- [ ] **Step 1: Escribir las pruebas que fallan**

Con colaboradores falsos que registran llamadas, y `mock.timers` de `node:test`:

```ts
Html.esc(`<&>"'`) === '&lt;&amp;&gt;&quot;&#39;'; Html.esc(null) === ''
Html.fecha('2026-11-06T10:20:30') === '2026-11-06 10:20'
Campos.seleccion: marca selected la opción con String(actual) === valor; primera opción 'Selecciona…'
Campos.siNo con v === false marca 'no'; con undefined no marca ninguna
CierreSesion.ejecutar('x'): notifica en orden de suscripción, luego avisarLuego('x','aviso'), luego ir('#/login')
CierreSesion.ejecutar(): no llama a avisarLuego
ManejadorErrores ApiError 401: cierre.ejecutar('Tu sesión expiró. Inicia sesión de nuevo.')
ManejadorErrores ApiError 422 con 2 mensajes: avisos.mostrar(m[0],'error',m)
ManejadorErrores Error común: avisos.mostrar('Ocurrió un error inesperado.','error')
FlujoEvaluacion.enviar incompleto: avisarLuego('Completa todos los módulos para calcular tu riesgo.','aviso') e ir('#/inicio')
FlujoEvaluacion.enviar correcto: guarda ultimo y ultimoId, e ir('#/resultado/<id>')
FlujoEvaluacion.enviar con 422: errores.mostrar e ir('#/inicio'); con 401: errores.mostrar y NO ir
verRiesgo completo y cambiado: envía
verRiesgo sin cambios con ultimoId: ir('#/resultado/<ultimoId>')
verRiesgo sin ultimoId con historial: ir al primero
verRiesgo sin nada: avisos.mostrar('Aún no tienes una evaluación. Completa: ...','aviso')
Vigilante sin sesión: reiniciar no programa nada
Vigilante con sesión: a los 15 min, cierre.ejecutar('Tu sesión se cerró por inactividad.')
```

- [ ] **Step 2: Comprobar que fallan**

- [ ] **Step 3: Implementar las 11 clases**

- [ ] **Step 4: Comprobar**

Run: `node --test` y `npm run check`

Expected: todas pasan, 0 errores de tipos.

- [ ] **Step 5: Commit**

`feat: servicios y piezas de interfaz del front`

---

### Task 5: Pantallas, fábrica, enrutador y arranque

**Files:**
- Create: `front/src/vistas/{Vista,VistaLogin,VistaRegistro,VistaInicio,VistaResultado,VistaHistorial,VistaFaq}.ts`, `front/src/interfaz/{FabricaVistas,Enrutador}.ts`, `front/src/App.ts`, `front/src/main.ts`, `front/src/tipos/DepsFabrica.ts`

**Interfaces:**
- Consumes: Tareas 3 y 4.
- Produces:

| Clase | Firma | Fuente |
|---|---|---|
| `Vista` (abstracta) | `constructor(protected readonly barra: BarraNavegacion); mostrar(seq: boolean): void\|Promise<void>; protected abstract tipoBarra(): TipoBarra; protected abstract contenido(seq: boolean): void\|Promise<void>; protected pintar(html: string): void; protected $<T extends Element = HTMLElement>(s: string): T` | nueva |
| `VistaLogin` | `{barra, api: ApiAuth, sesion: AperturaSesion, repoBorrador, avisos, navegador, errores}` | `app.js:115-129` |
| `VistaRegistro` | `{barra, api: ApiAuth, avisos, navegador, errores}` | `app.js:131-149` |
| `VistaInicio` | `{barra, repoBorrador, catalogo, flujo}` | `app.js:151-170` |
| `VistaResultado` | `{barra, api: ApiEvaluaciones, descarga, avisos, navegador, errores}, id: string` | `app.js:254-280` |
| `VistaHistorial` | `{barra, api: ApiEvaluaciones, descarga, errores}` | `app.js:291-304` |
| `VistaFaq` | `{barra, sesion: EstadoSesion, minutos}` | `app.js:306-317` |
| `FabricaVistas` | `constructor(d: DepsFabrica); crear(ruta: string): Vista\|null` | `app.js:336-343` |
| `Enrutador` | `constructor(fabrica, sesion: EstadoSesion, avisos, navegador, vigilante); iniciar(): void; enrutar(): void` | spec, sección 9; públicas de `app.js:329` |
| `App` | `iniciar(): void`. `MINUTOS_INACTIVIDAD = 15` | nueva |
| `main.ts` | `new App().iniciar();` | nueva |

`App` suscribe primero `sesion`, luego `repoBorrador`. Arranca `vigilante.iniciar()` y luego `enrutador.iniciar()`.

- [ ] **Step 1: Comprobar que aún no pasa**

Compilar candidato con `esbuild front/src/main.ts --bundle --format=iife --target=es2020 --outfile=$ARNES/candidato.js`.

Expected: falla, `main.ts` no existe.

- [ ] **Step 2: Implementar las 9 clases y `main.ts`**

- [ ] **Step 3: Comparar contra la base**

Run: `npm run check`, compilar candidato, luego `node arnes.mjs cand <raiz-rama> 8102 --bundle $ARNES/candidato.js --grupos sesion,inicio,resultado` y `node comparar.mjs base.json cand.json --grupos sesion,inicio,resultado`

Expected: 0 diferencias. El borrador corrupto, el almacén bloqueado, el nombre con HTML y la red caída incluidos.

- [ ] **Step 4: Commit**

`feat: pantallas, fábrica de vistas, enrutador y raíz de composición`

---

### Task 6: Módulos

**Files:**
- Create: `front/src/vistas/modulos/{VistaModulo,VistaDatos,VistaAlimentacion,VistaActividad,VistaConsumo,VistaPresion}.ts`, `front/src/tipos/DepsModulo.ts`
- Modify: `front/src/interfaz/FabricaVistas.ts`, `front/src/tipos/DepsFabrica.ts`, `front/src/App.ts`

**Interfaces:**
- Consumes: `Vista`, `FabricaVistas`, Tareas 3 y 4.
- Produces:

| Clase | Firma | Fuente |
|---|---|---|
| `DepsModulo` | `{barra, catalogo, repoBorrador, avisos, navegador, lector, flujo, campos}` | nueva |
| `VistaModulo` (abstracta) | `constructor(d: DepsModulo)`. Abstractos: `seccion(): SeccionId; titulo(): string; cuerpo(d: DatosSeccion): string; textoBoton(): string`. Por defecto: `numericos()` y `booleanos()` devuelven `[]`, `antes()` devuelve `''`. `tipoBarra()` es `'interna'` | `app.js:90-112` |
| `VistaDatos` | `constructor(d: DepsModulo, sesion: EstadoSesion)`; lleva `GEN` | `app.js:76,197-206` |
| `VistaAlimentacion` | `constructor(d: DepsModulo)`; lleva `FREC, AGUA` | `app.js:73-74,208-217` |
| `VistaActividad` | `constructor(d: DepsModulo)`; lleva `ACT` | `app.js:75,219-223` |
| `VistaConsumo` | `constructor(d: DepsModulo)` | `app.js:225-233` |
| `VistaPresion` | `constructor(d: DepsModulo, api: ApiEvaluaciones)`; lleva `FILA`; `override contenido` llama a `super.contenido(seq)`, y si no hay `seq` agrega la tabla | `app.js:235-252` |

Rutas en `FabricaVistas`: `/datos`, `/habitos-alimenticios`, `/actividad`, `/consumo`, `/presion`.

- [ ] **Step 1: Comprobar que falla**

Run: `node arnes.mjs cand <raiz-rama> 8102 --bundle $ARNES/candidato.js --grupos modulos` y `comparar`

Expected: diferencias, porque esas rutas aún no tienen vista.

- [ ] **Step 2: Implementar las 6 clases y conectarlas**

- [ ] **Step 3: Comparar contra la base, todos los grupos**

Run: `npm run check`, compilar candidato, correr `arnes.mjs` sin `--grupos` y `comparar`

Expected: 0 diferencias, incluidos todo `No`, peso `0` y los dos bugs conservados.

- [ ] **Step 4: Commit**

`feat: pantallas de módulos del front`

---

### Task 7: Cambio al JS generado

**Files:**
- Create: `.dockerignore`
- Modify: `front/package.json`, `static/js/app.js` (generado), `static/index.html:22`, `verificar.py:35`
- Delete: `static/js/api.js`

**Interfaces:**
- Produces: `npm run build`, según la spec, sección 5.

- [ ] **Step 1: Agregar `build` y generar**

Run: `npm run build` en `front/`

Expected: `static/js/app.js` con el encabezado de generado, sin minificar, formato IIFE.

- [ ] **Step 2: Quitar lo viejo**

Borrar `static/js/api.js`, quitar su `<script>` de `index.html` y la línea de `verificar.py:35`. Crear `.dockerignore` con `front/` y `.git/`.

- [ ] **Step 3: Comparar sin intercepción**

Run: `node arnes.mjs rama <raiz-rama> 8102` y `node comparar.mjs base.json rama.json`

Expected: 0 diferencias y ningún `pageerror`. Los errores de consola por respuestas 4xx son iguales en ambas.

- [ ] **Step 4: Comprobar lo demás**

Run: `python verificar.py`, y `python -m unittest discover -s tests -t .` con el Python de `.venv`

Expected: `verificar.py` pasa. `unittest`: 27 pruebas pasan y `tests.test_api` sigue dando el error de `httpx2`, igual que la base.

- [ ] **Step 5: Commit**

`refactor: reemplazar el front por el bundle generado desde TypeScript`

---

### Task 8: Verificación final

**Files:** ninguno, salvo arreglos que salgan.

- [ ] **Step 1: Reglas de dependencia**

Run:

```bash
grep -rnE "new [A-Z]" front/src
grep -rnE "^import \{" front/src
grep -rnE ": any\b|as any|<any>|@ts-ignore" front/src
```

Expected: los dos primeros solo muestran lo permitido por la spec, sección 7. El tercero, nada.

- [ ] **Step 2: Conteo**

Expected: 35 clases en 35 archivos. `grep -rnE "^(export )?(abstract )?class " front/src` da 35 líneas y un archivo por línea.

- [ ] **Step 3: Compilación repetible**

Run: `npm run build` y `git diff --exit-code static/js/app.js`

Expected: sin diferencias.

- [ ] **Step 4: Sin Node**

Exportar `git archive HEAD` a `$ARNES/limpia/`, que no trae `node_modules`. Correr `node arnes.mjs limpia <esa-raiz> 8103` y `comparar` contra `base.json`.

Expected: 0 diferencias, y `/static/js/app.js` responde 200.

- [ ] **Step 5: Mirar pantallas**

Guardar capturas de login, inicio y resultado de `rama`, y mirarlas.

Expected: se ven bien.

- [ ] **Step 6: Docker**

Docker no está instalado en este PC. Decir al usuario que `.dockerignore` y la imagen **no se probaron**.

- [ ] **Step 7: Revisión de toda la rama e informe**

Un revisor nuevo lee la rama completa contra la spec. Corregir lo confirmado. Reportar y dejar la fusión a `main` al usuario.
