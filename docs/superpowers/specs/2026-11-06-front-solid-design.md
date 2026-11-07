# Refactor del front de CardioPrev a TypeScript y clases SOLID

Fecha: 2026-11-06. Base: commit `2c4506d` en `main`.

Marcas: **[Usuario]** lo decidió el usuario. **[Supuesto]** se le planteó y no lo objetó. **[Diseño]** decisión de quien escribe este documento; el usuario la revisa aquí.

## 1. Intención

`static/js/app.js` (350 líneas) es una sola clausura sin clases que mezcla enrutador, vistas, borrador, avisos, inactividad y PDF. `static/js/api.js` mezcla sesión, HTTP y endpoints. El usuario quiere ordenarlo siguiendo SOLID: cada clase con una única responsabilidad, cada clase en su archivo, en TypeScript.

El front se va a defender en la sustentación, igual que el backend (`SUSTENTACION.md`). Por eso importa tanto poder explicarlo como que funcione: cada clase se describe en una frase y cada patrón nombrado es real.

## 2. Metas

- **[Usuario]** Una responsabilidad por clase. Un archivo por clase.
- **[Usuario]** TypeScript, sin React.
- **[Usuario]** Fuente en `front/`. El resultado es un solo `static/js/app.js`, generado y guardado en git. Para ejecutar la app basta Python; Node solo hace falta para editar el front.
- **[Supuesto]** La conducta visible queda idéntica.
- **[Diseño]** Mismo esquema mental del backend: raíz de composición, capas, fábrica parametrizada, sujeto con `suscribir`.

## 3. No metas y antimetas

No metas:
- **[Supuesto]** Arreglar bugs existentes (sección 10). Van aparte, después.
- **[Supuesto]** Tocar `static/css/estilos.css`.
- **[Diseño]** Sacar el HTML de los template strings a archivos o `<template>`.
- **[Diseño]** Agregar dependencias de ejecución. Solo `typescript` y `esbuild`, de desarrollo.
- **[Diseño]** Agregar pruebas al repo. El arnés de verificación vive fuera (sección 11).

Sería un fracaso aunque funcione:
- Un patrón o interfaz metidos a la fuerza que no se puedan justificar frente a un jurado.
- Clases creadas solo para sumar archivos, sin responsabilidad propia.
- Cualquier cambio visible de pantallas, textos, rutas o mensajes.
- Que correr la app pase a requerir Node.

## 4. Enfoques considerados

| Enfoque | A favor | En contra | Resultado |
|---|---|---|---|
| TypeScript + esbuild, un solo `app.js` clásico | `import` e interfaces reales. Sin riesgo de tipo MIME. Un solo `<script>`. `iniciar.bat` y `Dockerfile` no cambian. | Sale de `static`. JS generado en git; si se olvida compilar, queda viejo. | **Elegido por el usuario** |
| TypeScript + React | No escapar HTML a mano. Componentes. | React moderno usa funciones y hooks, no las clases que se piden. Es reescritura de 11 pantallas, no refactor. Difícil de justificar para formularios y tablas. | Descartado por el usuario |
| TypeScript solo con `tsc`, un JS por clase | Sin bundler. La salida refleja la fuente. | Exige `type="module"`: si el registro de Windows sirve `.js` como `text/plain`, la app no arranca. | Descartado |
| JS con scripts clásicos globales | Sin Node ni build. Se queda en `static`. | 35 `<script>`. La inversión de dependencias sería solo convención. | Elegido primero; el usuario cambió de idea |

El bundle se sirve como script clásico, que no sufre el bloqueo MIME porque el backend no envía `X-Content-Type-Options: nosniff`.

## 5. Herramientas

**[Diseño]**

- `front/package.json`, `front/package-lock.json` y `front/tsconfig.json`. `node_modules` en `front/`, nunca en `static/`, porque todo lo de `static/` se sirve al público.
- `tsconfig`: `strict`, `noImplicitOverride`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noEmit`, `target: ES2020`, `module: ESNext`, `moduleResolution: bundler`, `lib: [ES2020, DOM, DOM.Iterable]`.
- `npm run check`: `tsc --noEmit`. esbuild no revisa tipos, así que este paso es obligatorio.
- `npm run build`: corre `check` y luego esbuild con `src/main.ts`, `--bundle --format=iife --target=es2020`, salida `../static/js/app.js`, **sin minificar** para que siga legible. Lleva un encabezado que diga que es generado y no se edita a mano.
- Prohibido `any`, `as any` y `@ts-ignore`.

## 6. Estructura

Son 35 clases, 8 contratos y los tipos de datos. Cada archivo se llama como lo que contiene. Hay más archivos que clases, y es esperado. **[Diseño]**

```
front/src/
  main.ts       (solo: new App().iniciar())
  App.ts
  contratos/    Almacen  FuenteToken  EstadoSesion  AperturaSesion
                ObservadorCierre  Transporte  ApiAuth  ApiEvaluaciones
  tipos/        formas de datos, un tipo por archivo
  datos/        Api  ApiError  ClienteHttp  AlmacenSesion  Sesion  RepositorioBorrador
  dominio/      CatalogoSecciones  Borrador
  servicios/    CierreSesion  FlujoEvaluacion  DescargaPdf  VigilanteInactividad
  interfaz/     Html  Avisos  Navegador  ManejadorErrores  BarraNavegacion  Campos
                LectorFormulario  FabricaVistas  Enrutador
  vistas/       Vista  VistaLogin  VistaRegistro  VistaInicio  VistaResultado
                VistaHistorial  VistaFaq
  vistas/modulos/  VistaModulo  VistaDatos  VistaAlimentacion  VistaActividad
                   VistaConsumo  VistaPresion
```

### Clases

Colaboradores = lo que recibe por constructor.

| Clase | Única responsabilidad | Colaboradores |
|---|---|---|
| `App` | Crear todos los objetos, conectarlos y arrancar | ninguno |
| `Api` | Traducir operaciones a endpoints. Implementa `ApiAuth` y `ApiEvaluaciones` | `Transporte` |
| `ApiError` | Representar un error HTTP con `status` y `mensajes` | ninguno |
| `ClienteHttp` | Hacer la petición: cabeceras, token renovado, convertir fallos en `ApiError`. Implementa `Transporte` | `FuenteToken` |
| `AlmacenSesion` | Leer, escribir y borrar en `sessionStorage` sin propagar excepciones. Implementa `Almacen` | ninguno |
| `Sesion` | Guardar token y nombre: `abrir, renovar, token, nombre, activa, alCerrarSesion` | `Almacen` |
| `RepositorioBorrador` | Cargar y persistir el `Borrador`: `leer, guardar, borrar, alCerrarSesion` | `Almacen, catalogo` |
| `CatalogoSecciones` | Saber qué secciones existen: título, ruta, campos, orden, siguiente | ninguno |
| `Borrador` | Reglas del borrador: `completa, todoCompleto, payload, faltantes`, y `ultimo`/`ultimoId` | `catalogo` |
| `CierreSesion` | Sujeto Observer del cierre: `suscribir, ejecutar(aviso?)` | `avisos, navegador` |
| `FlujoEvaluacion` | Enviar la evaluación y decidir qué hace "Riesgo Cardiovascular": `enviar, verRiesgo` | `repoBorrador, catalogo, ApiEvaluaciones, avisos, navegador, errores` |
| `DescargaPdf` | Bajar el PDF al navegador | `ApiEvaluaciones, errores` |
| `VigilanteInactividad` | Cerrar la sesión tras N minutos sin actividad: `iniciar, reiniciar` | `EstadoSesion, cierre, minutos` |
| `Html` | Convertir valores en texto seguro: `esc`, `fecha`. Solo estáticos, sin estado | ninguno |
| `Avisos` | Mostrar y limpiar avisos, y guardar el pendiente: `mostrar, limpiar, avisarLuego, mostrarPendiente` | elemento `#flash` |
| `Navegador` | Cambiar de ruta: `ir` | ninguno |
| `ManejadorErrores` | Decidir qué ve el usuario ante un error: `mostrar` | `avisos, cierre` |
| `BarraNavegacion` | Pintar una de las tres barras: `mostrar(tipo)` | elemento `#barra`, `cierre` |
| `Campos` | Generar el HTML de campos: `numero, seleccion, siNo` | ninguno |
| `LectorFormulario` | Leer un formulario con conversión de tipos: `leer` | ninguno |
| `FabricaVistas` | Crear la vista de una ruta: `crear(ruta)`, o `null` | las dependencias de todas las vistas |
| `Enrutador` | Traducir el hash en una vista: `iniciar, enrutar` | `fabrica, EstadoSesion, avisos, navegador, vigilante` |
| `Vista` | Clase abstracta, contrato de pantalla: `mostrar(seq)` pinta la barra y llama a `contenido(seq)`. Abstractos: `tipoBarra`, `contenido`. Da `pintar(html)` y `$(selector)` | `barra` |
| `VistaLogin`, `VistaRegistro`, `VistaInicio`, `VistaResultado`, `VistaHistorial`, `VistaFaq` | Una pantalla cada una | solo lo que usa |
| `VistaModulo` | Clase abstracta, esqueleto de una pantalla de módulo: formulario, validación, guardado y paso siguiente | `barra, catalogo, repoBorrador, avisos, navegador, lector, flujo, campos` |
| `VistaDatos`, `VistaAlimentacion`, `VistaActividad`, `VistaConsumo`, `VistaPresion` | Los campos de un módulo. `VistaPresion` además lista el historial cuando `seq` es falso | lo de `VistaModulo`, más `EstadoSesion` en `VistaDatos` y `ApiEvaluaciones` en `VistaPresion` |

### Contratos

Una interfaz existe solo si da una cara reducida de una clase (I), o si separa una capa alta de un detalle de red o almacenamiento (D). El resto se inyecta con el tipo de su clase: en TypeScript los tipos son estructurales, así que sigue siendo reemplazable. **[Diseño]**

| Contrato | Métodos | Lo implementa | Lo usa |
|---|---|---|---|
| `Almacen` | `leer, escribir, borrar` | `AlmacenSesion` | `Sesion, RepositorioBorrador` |
| `FuenteToken` | `token, renovar` | `Sesion` | `ClienteHttp` |
| `EstadoSesion` | `activa, nombre` | `Sesion` | `Enrutador, VigilanteInactividad, VistaDatos, VistaFaq` |
| `AperturaSesion` | `abrir, nombre` | `Sesion` | `VistaLogin` |
| `ObservadorCierre` | `alCerrarSesion` | `Sesion, RepositorioBorrador` | `CierreSesion` |
| `Transporte` | `peticion` | `ClienteHttp` | `Api` |
| `ApiAuth` | `registro, login` | `Api` | `VistaLogin, VistaRegistro` |
| `ApiEvaluaciones` | `crearEvaluacion, historial, presiones, evaluacion, pdf` | `Api` | `FlujoEvaluacion, DescargaPdf, VistaResultado, VistaHistorial, VistaPresion` |

### Tipos de datos

Se copian a mano de `app/models.py`, `listar` y `listar_presiones` de `app/repositories.py`. No se genera código desde el backend. Hay riesgo de desalineo si cambia el backend; es aceptable porque el backend no cambia aquí. **[Diseño]**

### Reparto del código actual que no es obvio

**[Diseño]**
- `Api.login` deja de guardar el token. `VistaLogin` llama a `sesion.abrir(r.token, r.nombre)`, luego borra el borrador, avisa y navega. `haySesion/nombre/cerrarSesion` pasan a `Sesion`.
- Las listas `FREC, AGUA, ACT, GEN` van en la vista que las usa. `FILA` en `VistaPresion`.
- `MINUTOS_INACTIVIDAD` (15) es constante de `App`, pasada a `VigilanteInactividad` y `VistaFaq`.
- `Borrador` se serializa al mismo JSON plano de hoy: `{datos, alimentacion, actividad, consumo, clinica, ultimo, ultimoId}`.

## 7. Reglas de dependencia

1. Solo `App` y `FabricaVistas` hacen `new` de clases de la aplicación.
2. Las clases reciben sus colaboradores por constructor.
3. Con `verbatimModuleSyntax`, los colaboradores se importan con `import type`. Un `import` de valor solo se permite para:
   - `extends` de `Vista` y `VistaModulo`.
   - `Html`, utilidad pura sin estado.
   - `ApiError`: lo lanza `ClienteHttp`; `ManejadorErrores`, `FlujoEvaluacion` y `VistaResultado` lo consultan con `instanceof`.
   - `RepositorioBorrador` crea `Borrador`.
   - `App` y `FabricaVistas`, que crean los objetos, y `main.ts`.
4. Las vistas reciben un objeto con nombres: `constructor({ barra, api, avisos })`. Ese objeto trae solo lo que la vista usa.

Comprobación: `grep -rnE "new [A-Z]" front/src` solo muestra `main.ts`, `App`, `FabricaVistas`, `RepositorioBorrador`, `new ApiError` en `ClienteHttp`, y nativos (`Date, FormData, URLSearchParams, Error, Blob`). `grep -rnE "^import \{" front/src` solo muestra los casos de la regla 3.

## 8. SOLID y patrones, para defender

| Principio | Dónde se ve |
|---|---|
| S | La tabla de clases: cada una tiene una frase. |
| O | Pantalla nueva = clase nueva + una línea en `FabricaVistas`. `Enrutador` no cambia. Limpieza nueva al salir = otro `ObservadorCierre` suscrito. |
| L | Toda `Vista` responde a `mostrar(seq)` y `Enrutador` las trata igual. `VistaPresion` agrega su tabla sin romper a `VistaModulo`. |
| I | Tres caras de `Sesion`: `ClienteHttp` solo ve `FuenteToken`, `Enrutador` solo `EstadoSesion`, `VistaLogin` solo `AperturaSesion`. Dos de `Api`: `ApiAuth` y `ApiEvaluaciones`, como los routers del backend. |
| D | `Api` depende de `Transporte`, no de `fetch`. `Sesion` depende de `Almacen`, no de `sessionStorage`. `Enrutador` depende de la abstracta `Vista`. El compilador lo revisa. |

| Patrón | En el front | En el backend |
|---|---|---|
| Factory Method parametrizado | `FabricaVistas.crear(ruta)` | `NivelRiesgoFactory.crear(puntaje)` |
| Observer | `CierreSesion` + `ObservadorCierre`. Además, `hashchange` y los eventos de actividad tienen al navegador como sujeto | `EvaluacionService` + `EvaluacionObserver` |
| Template Method | `VistaModulo`, `Vista.mostrar` | no existe |
| Repository | `RepositorioBorrador` | `EvaluacionRepository` |
| Strategy | **No se usa.** En el front no hay algoritmos intercambiables; inventarlo sería forzado | `FactorStrategy` |

`App` conecta el Observer así, y el orden importa como en el backend: primero `cierre.suscribir(sesion)`, luego `cierre.suscribir(repoBorrador)`. `ejecutar(aviso)` notifica; si hay aviso llama a `avisos.avisarLuego(aviso, 'aviso')`; y navega a `#/login`.

## 9. Lo que no puede cambiar

- Claves de `sessionStorage`: `cp_token`, `cp_nombre`, `cp_borrador`.
- Rutas, endpoints, cabeceras (`Authorization`, `Content-Type`, `X-Token-Renovado`) y todos los textos.
- El HTML generado, salvo espacios en blanco entre etiquetas.
- `/static/js/app.js` responde 200 (`tests/test_api.py:84`).

Detalles fáciles de romper:

- **`Enrutador.enrutar`**, en este orden exacto:
  1. Separar ruta y query de `location.hash.slice(1) || '/login'`. `seq` es `query.seq === '1'`.
  2. `avisos.limpiar()`.
  3. Sin sesión y ruta no pública (`/login, /registro, /faq`): ir a `#/login` y salir. Con sesión en `/login` o `/registro`: ir a `#/inicio` y salir. Estos dos casos no muestran el aviso pendiente ni reinician el vigilante.
  4. `fabrica.crear(ruta)` y `vista.mostrar(seq)` **sin `await`**. Si no hay vista, ir a `#/inicio` o `#/login` según la sesión.
  5. `avisos.mostrarPendiente()`, `vigilante.reiniciar()`, y `if (!seq || ruta !== '/inicio') window.scrollTo(0, 0)`.
- Arranque: `App` registra los oyentes del vigilante, luego `hashchange`, y luego llama una vez a `enrutar()`.
- `/resultado/<dígitos>` usa `/^\/resultado\/(\d+)$/`. El id llega como cadena al constructor de `VistaResultado`.
- `ClienteHttp` guarda `X-Token-Renovado` **antes** de mirar `res.ok`. Fallo de red: `ApiError(0, ['No se pudo conectar con el servidor. Verifica que esté en ejecución.'])`. Error sin JSON: `['Error ' + status]`. `detail` puede ser lista o texto.
- `Avisos.mostrar(msg, tipo, lista)` hace `scrollTo(0, 0)` solo si hay mensaje. Con más de un elemento en `lista`, pinta `N datos por corregir:` y una `<ul>`.
- `VistaResultado`, al cargar bien, limpia `#flash` directamente, incluido un aviso recién mostrado.
- `FlujoEvaluacion.enviar` con error: `errores.mostrar(e)` y luego `ir('#/inicio')`, salvo 401. `VistaResultado` con 404: `errores.mostrar(e)` y luego `ir('#/inicio')`.
- `VistaModulo`: `Number.isNaN` cuenta como campo faltante. Botón: con `seq`, `Guardar y continuar`, o `Guardar y ver resultado` en `clinica`; sin `seq`, el texto de cada módulo.
- `VistaDatos` siempre muestra `Bienvenido <nombre>`, con o sin `seq`. Su `max` de año usa `new Date().getFullYear()`.
- `VistaPresion` con `seq` no pinta la tabla ni llama a `presiones()`.
- `VigilanteInactividad`: escucha `click, keydown, touchstart` en `document` con `{ passive: true }`. Sin sesión, no programa temporizador.
- Formularios y botones siguen usando `onsubmit` y `onclick`, para no acumular oyentes al repintar.

## 10. Bugs que se conservan

Encontrados leyendo el código; la captura de referencia los confirma o los descarta. No se arreglan aquí **[Supuesto]**, para que el refactor sea comprobable contra la base.

1. **Clave incorrecta sin mensaje.** El login responde 401, `ManejadorErrores` lo trata como sesión vencida y navega a `#/login`, donde ya está el usuario. No hay `hashchange`, así que no aparece nada. "Tu sesión expiró" sale en la siguiente navegación.
2. **Error del último paso se borra.** Al fallar el envío desde `#/presion?seq=1`, el aviso se pinta, `ir('#/inicio')` dispara el enrutador y `limpiar()` lo borra. Igual con `#/resultado/<id>` inexistente.

Arreglarlos es trabajo aparte, más fácil tras el refactor.

## 11. Verificación

No hay pruebas de front: el único chequeo es que `app.js` responda 200, y está en `tests/test_api.py`, que hoy no carga porque al venv le falta `httpx2`. Base medida: 27 pruebas pasan, `tests.test_api` da error de importación. **[Diseño]** No se instala `httpx2`; se comprueba el 200 pidiendo el archivo al servidor.

**Comparación contra la base.** En la carpeta temporal de la sesión, fuera del repo:
1. Exportar `2c4506d` y servirlo en un puerto, y la rama en otro, con `CARDIOPREV_DB` apuntando a dos copias de la misma base temporal sembrada. Nunca sobre `cardioprev.db`.
2. Recorrer en el navegador los escenarios de abajo en ambos servidores.
3. Comparar `#barra`, `#flash` y `#vista` (`innerHTML` con espacios colapsados) y `sessionStorage`, ignorando el valor del token.

Escenarios:
- Sin sesión: login, registro, FAQ, ruta protegida, ruta desconocida.
- Login correcto. Login incorrecto (bug 1). Registro con correo repetido y con varios errores 422.
- Inicio con borrador vacío, parcial y completo.
- Los cinco módulos con y sin `?seq=1`: pantalla, envío vacío, envío correcto.
- Flujo secuencial completo hasta resultado. Error en el último paso (bug 2).
- "Riesgo Cardiovascular": sin datos ni historial, sin cambios, con cambios, con historial previo.
- Presiones e historial, con y sin registros. Resultado con alertas y con nutrición. Resultado inexistente (bug 2).
- PDF desde resultado y desde historial.
- Token vencido (401). Botón de salir en cada barra. FAQ con sesión.
- Inactividad: parchear `setTimeout`, comprobar 900000 ms y disparar el callback.

**Además:**
- Consola del navegador sin errores.
- `npm run build` pasa, y repetirlo no cambia `static/js/app.js` (`git diff --exit-code`).
- Los `grep` de la sección 7 limpios. Ningún `any`, `as any` ni `@ts-ignore`.
- `python verificar.py` pasa.
- `python -m unittest discover -s tests -t .` da el mismo resultado que la base.
- `/static/js/app.js` responde 200.
- Sin Node en el camino: la app arranca con `front/node_modules` ausente.
- Si hay Docker disponible, la imagen construye y sirve la app. Si no, se dice que no se probó.

## 12. Entrega

**[Diseño]** Rama `refactor/front-typescript` desde `main`. Cada commit deja la app funcionando: el `app.js` viejo sigue activo hasta el commit que lo reemplaza con el generado. Mensajes con formato convencional, que el hook del usuario exige. Fusionar a `main` lo decide el usuario.

**Archivos que cambian fuera de `front/`:**

| Archivo | Cambio | Origen |
|---|---|---|
| `static/js/app.js` | Pasa a ser generado | [Usuario] |
| `static/js/api.js` | Se borra | [Usuario] |
| `static/index.html` | Quita el `<script>` de `api.js` | [Usuario] |
| `verificar.py:35` | Quita la línea de `api.js` | [Usuario] |
| `.gitignore` | Agrega `front/node_modules/` | [Usuario] |
| `.dockerignore` (nuevo) | `front/` y `.git/`. `.git/` entra porque ahora existe repo y `COPY . .` lo copiaría | [Usuario] `front/`; [Diseño] `.git/` |
| `docs/superpowers/specs/` | Este documento | [Diseño] |

**No cambian:** `app/`, `tests/`, `Dockerfile`, `iniciar.bat`, `iniciar.sh`, `static/css/`, `static/img/`.

**No se tocan sin que el usuario lo pida:**
- `GUIA.md:41-47` queda desactualizada.
- `SUSTENTACION.md` no tiene sección del front, y le hará falta para defender.
- Los dos bugs de la sección 10.
- `.venv` y `cardioprev.db` entran hoy a la imagen de Docker. Ya pasaba antes.

## 13. Queda a criterio de quien construye

- Nombres de métodos privados y ayudantes internos.
- Nombres exactos de los archivos de `tipos/`, y cómo modelar los datos de cada sección sin `any`.
- Cómo pasar el encabezado a esbuild de forma que funcione en Windows y Linux.
- Comentarios: en español, breves, con la responsabilidad al inicio de cada archivo.
- División en commits y orden de migración, cumpliendo que cada commit funcione.
- Detalles del arnés de comparación.
