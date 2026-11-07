# El controlador del front (MVC)

## Por qué existe

Antes, cada pantalla de `front/src/vistas/` dibujaba el HTML **y** decidía qué hacer al enviar el
formulario (llamar a la API, guardar el borrador, navegar, mostrar avisos). Eso es una vista con
responsabilidades de controlador. Ahora se separan:

| MVC | Dónde | Qué hace |
| --- | --- | --- |
| **Vista** | `front/src/vistas/` | Dibuja la pantalla, lee el formulario y **avisa** lo que hizo el usuario. No llama a la API, no navega, no muestra avisos |
| **Controlador** | `front/src/controladores/` | Recibe ese aviso, **ordena** al modelo y **reacciona** (navegar, avisar, pedirle a la vista que dibuje datos) |
| **Modelo** | `front/src/datos/`, `dominio/`, `servicios/` y el backend | Borrador, API, sesión, reglas y persistencia |

Cada método de un controlador hace tres cosas como máximo: **leer → ordenar → reaccionar**.

## Las 7 clases

| Controlador | Pantalla | Qué ordena |
| --- | --- | --- |
| `ControladorLogin` | Login | `api.login` → abre la sesión, borra el borrador, avisa y va al Dashboard; si falla, muestra el error |
| `ControladorRegistro` | Registro | `api.registro` → avisa y va al Login |
| `ControladorInicio` | Dashboard | «Riesgo Cardiovascular» → `FlujoEvaluacion.verRiesgo()` |
| `ControladorModulo` | Datos, alimentación, actividad, consumo | Valida que no falten campos, guarda en el borrador y sigue al siguiente paso, envía la evaluación o vuelve al Dashboard |
| `ControladorPresion` | Presión arterial | Igual que `ControladorModulo` y, fuera del flujo secuencial, consulta los registros y se los entrega a la vista |
| `ControladorResultado` | Resultado | Consulta la evaluación, se la entrega a la vista, atiende el PDF; si no existe (404) vuelve al Dashboard |
| `ControladorHistorial` | Historial | Consulta las evaluaciones, se las entrega a la vista, atiende el PDF de cada fila |

`ControladorPresion` hereda de `ControladorModulo` (misma lógica de guardado, más la tabla).

## Cómo se conectan

La vista expone **ganchos** y el controlador se registra en ellos al crearse (es el mismo estilo del
patrón Observer del backend):

```ts
// Vista: solo avisa
vista.alEnviar((correo, password) => ...)        // VistaLogin
vista.alMostrar(() => ...)                        // todas: "ya me pinté, carga los datos"

// Controlador: se registra y decide
constructor(vista: VistaLogin, ...) {
  vista.alEnviar((correo, password) => { void this.entrar(correo, password); });
}
```

`FabricaVistas` (Factory Method) crea cada vista **junto con su controlador**; después ya no hace falta
tocar el controlador, está registrado dentro de la vista. `Enrutador`, `App` y los servicios no cambiaron.

## Flujo: iniciar sesión

```text
USUARIO pulsa «Entrar»
① VistaLogin      onsubmit → lee correo y contraseña → llama al gancho alEnviar
② ControladorLogin entrar(): avisos.limpiar()  →  api.login()          (ordena al modelo)
③ ControladorLogin sesion.abrir(), repoBorrador.borrar(), avisos.avisarLuego(), navegador.ir('#/inicio')
   └─ si falla: 401 → muestra «Correo o contraseña incorrectos»; otro error → ManejadorErrores
④ Enrutador       muestra el Dashboard
```

## Qué cambió en el repo

- Nuevos: `front/src/controladores/*.ts` (7 clases) y `tests/test_arquitectura_front.py`.
- Vistas pasivas: `Vista`, `VistaLogin`, `VistaRegistro`, `VistaInicio`, `VistaModulo` (y `VistaPresion`),
  `VistaResultado`, `VistaHistorial`. `seccion()` de las vistas de módulo pasó a ser pública.
- `FabricaVistas` crea vista y controlador; `DepsModulo` quedó con lo que necesita una vista.
- `static/js/app.js` se regeneró (`npm run build` en `front/`).
- Corrección menor: con contraseña incorrecta el login ahora muestra «Correo o contraseña incorrectos»
  (antes el 401 se trataba como sesión vencida y no mostraba nada).

## Cómo reconstruir el JS

```bash
cd front && npm ci && npm run build      # revisa los tipos y regenera static/js/app.js
```

## Pruebas

`python -m unittest tests.test_arquitectura_front` comprueba, leyendo el código, que las vistas no
importan la API, el navegador, los avisos ni los servicios, que los controladores no tocan el DOM, que
cada pantalla con eventos tiene su controlador y que `static/js/app.js` no está desactualizado.

## Para la sustentación

- «La vista solo dibuja y avisa; el controlador decide. Es el mismo patrón que `controllers/` en el
  backend: leer, ordenar, reaccionar.»
- «Los controladores no tocan el DOM: si quisiéramos otra interfaz, no se reescriben.»
- «Una prueba automática revisa esa separación.»
- Pregunta probable: *¿por qué `ControladorModulo` sirve a cuatro pantallas?* Porque las cuatro hacen
  lo mismo (guardar una sección del borrador y avanzar); lo que cambia es el formulario, que es de la vista.
