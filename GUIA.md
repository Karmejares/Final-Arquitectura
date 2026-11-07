# Guía: cómo armar y ejecutar CardioPrev en tu computador

## 1. Requisitos
- **Python 3.10 o superior** (verifica con `python --version`; en Mac/Linux puede ser `python3`).
- Un editor (VS Code recomendado). No necesitas instalar base de datos: usa SQLite, que ya viene con Python.

## 2. Estructura de carpetas (crea exactamente esto)

```
cardioprev/
├── requirements.txt          <- librerías para ejecutar
├── requirements-dev.txt      <- librerías para ejecutar + pruebas
├── Dockerfile                <- (opcional) para correr con Docker
├── README.md
├── GUIA.md                   <- este archivo
├── SUSTENTACION.md           <- guion para explicar el código
├── seed_demo.py              <- datos de ejemplo (usuario demo)
├── verificar.py              <- revisa que todo esté en su lugar
├── iniciar.bat / iniciar.sh  <- arranque con un clic
├── app/                      <- BACKEND (Python)
│   ├── __init__.py           <- vacío, pero DEBE existir
│   ├── main.py               <- crea la app, conecta todo y arranca
│   ├── config.py             <- clave secreta, minutos de sesión, ruta de la base de datos
│   ├── errors.py             <- mensajes de validación en español (HU-18)
│   ├── container.py          <- agrupa dependencias y exige sesión iniciada
│   ├── models/               <- MODELO (MVC): datos, reglas, patrones y persistencia
│   │   ├── __init__.py       <- vacío, pero DEBE existir
│   │   ├── database.py       <- conexión SQLite y creación de tablas
│   │   ├── models.py         <- validación de datos de entrada y forma de las respuestas
│   │   ├── security.py       <- hash de contraseñas y tokens JWT
│   │   ├── repositories.py   <- ÚNICO lugar con SQL (usuarios y evaluaciones)
│   │   ├── services.py       <- lógica de negocio: CalculadorRiesgo, EvaluacionService, HistorialService, AuthService
│   │   ├── strategies.py     <- PATRÓN STRATEGY (un puntaje por factor de riesgo)
│   │   ├── factory.py        <- PATRÓN FACTORY METHOD (nivel bajo / medio / alto + semáforo)
│   │   ├── observers.py      <- PATRÓN OBSERVER (alerta de presión + guardado en historial)
│   │   ├── nutrition.py      <- calorías y macronutrientes (HU-07)
│   │   └── presion.py        <- clasificación de la presión (normal / elevada / alta / baja)
│   ├── views/                <- VISTA (MVC): lo que el servidor genera para mostrar
│   │   ├── __init__.py       <- vacío, pero DEBE existir
│   │   └── report.py         <- genera el PDF (HU-16)
│   └── controllers/          <- CONTROLADOR (MVC)
│       ├── __init__.py       <- vacío, pero DEBE existir
│       ├── auth_controller.py          <- /api/auth/registro, /login, /me
│       └── evaluaciones_controller.py  <- /api/evaluaciones (crear, listar, detalle, pdf)
├── static/                   <- FRONTEND (lo que ve el usuario)
│   ├── index.html            <- página única
│   ├── css/estilos.css
│   ├── img/              <- 5 íconos de las tarjetas del Dashboard (alimentos, actividad, consumo, presion, historial .png)
│   └── js/
│       ├── api.js            <- comunicación con el backend y manejo del token
│       └── app.js            <- pantallas: login, registro, dashboard, módulos, resultado, historial, FAQ
└── tests/                    <- pruebas automáticas
    ├── __init__.py           <- vacío, pero DEBE existir
    ├── datos.py
    ├── test_riesgo.py
    ├── test_cuentas_pdf.py
    ├── test_historial.py     <- historial, usuario de la sesión y separación MVC
    └── test_api.py
```
También van en la raíz: `seed_demo.py` (datos de ejemplo), `iniciar.bat` / `iniciar.sh` (arranque con un clic) y `SUSTENTACION.md` (guion).

Recomendación para ir armándolo por capas (así entiendes cada una antes de la siguiente):
1. `config.py`, `database.py`, `models.py`
2. `strategies.py`, `factory.py`, `nutrition.py`, `observers.py`, `services.py` (el corazón del módulo)
3. `security.py`, `repositories.py`, `container.py`, `controllers/`, `errors.py`, `views/report.py`, `main.py`
4. `static/` (frontend)
5. `tests/`

## 2.b Si prefieres crear los archivos tú mismo, uno por uno
1. Crea la carpeta `cardioprev` y, dentro, las subcarpetas `app`, `app/models`, `app/views`, `app/controllers`, `static`, `static/css`, `static/js` y `tests`.
2. Copia cada archivo a la ruta exacta del árbol de arriba. Los archivos `__init__.py` pueden estar **vacíos, pero deben existir** (en `app/`, `app/models/`, `app/views/`, `app/controllers/` y `tests/`): es el error más común.
3. Ejecuta `python verificar.py` desde la carpeta `cardioprev`: te dice qué archivo falta o está vacío, qué librería no está instalada y si la aplicación se puede importar.

## 3. Instalación y ejecución

**Arranque rápido (recomendado para la sustentación):** haz doble clic en `iniciar.bat` (Windows) o ejecuta `./iniciar.sh` (Mac/Linux). La primera vez crea el entorno e instala las dependencias; luego carga datos de ejemplo (`seed_demo.py`: usuario `demo@cardioprev.com`, contraseña `Demo12345`, con 3 evaluaciones) y arranca la app. El guion para explicar el código está en `SUSTENTACION.md`.

Paso a paso manual:

**Windows (PowerShell):**
```powershell
cd cardioprev
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```
**Mac / Linux:**
```bash
cd cardioprev
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```
Abre **http://127.0.0.1:8000** en el navegador. La documentación automática de la API está en **/docs**.

Si PowerShell bloquea el script de activación: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y vuelve a intentar.

**Pruebas:** `python -m pytest` (o `python -m unittest discover -s tests -t .`).

**Con Docker (opcional):** `docker build -t cardioprev .` y luego `docker run -p 8000:8000 cardioprev`.

## 4. Guion sugerido para la demo
1. **Registro** con un correo y contraseña de 8+ caracteres → mensaje de éxito. Intenta registrar el mismo correo otra vez para mostrar el error.
2. **Inicio de sesión** (muestra también un intento con contraseña incorrecta).
3. **Nueva evaluación:** en el Dashboard pulsa «Comenzar Evaluación» y completa los 5 pasos (datos personales, hábitos alimenticios, actividad, consumo, presión/colesterol) con un perfil de riesgo alto (ej.: 1960, 110 kg, 170 cm, comida rápida y bebidas azucaradas a diario, fuma, diabetes, presión 160/100, colesterol 260/35). Muestra que edad, IMC y la valoración de alimentación se calculan solos. Cada tarjeta del Dashboard también permite editar un módulo por separado; «Riesgo Cardiovascular» recalcula con lo guardado.
4. **Resultado:** semáforo rojo, alerta de presión, recomendaciones, calorías y macros.
5. **Segunda evaluación** con un perfil sano (ej.: 2000, 60 kg, 165 cm, activo, presión 110/70) → semáforo verde.
6. **Historial:** ambas evaluaciones con fecha; abre una y descarga el **PDF**.
7. **Aislamiento:** registra un segundo usuario y muestra que su historial está vacío.
8. Muestra los errores de validación (peso negativo, campos vacíos).

## 5. Dónde señalar cada patrón en el código (sustentación)

| Patrón | Archivo | Qué decir |
|---|---|---|
| **Strategy** | `app/models/strategies.py` | `FactorStrategy` es la interfaz; `EdadStrategy`, `ImcStrategy`, `PresionStrategy`... son las estrategias concretas. El contexto es `CalculadorRiesgo` en `services.py`, que solo recorre la lista y suma. Para agregar un factor se crea una clase nueva y no se toca el calculador. |
| **Factory Method** | `app/models/factory.py` | `NivelRiesgoFactory.crear(puntaje)` decide qué objeto crear: `RiesgoBajo`, `RiesgoMedio` o `RiesgoAlto`. Cada uno encapsula su color de semáforo, mensaje y recomendaciones generales; el resto del código no usa `if` sobre el nivel. |
| **Observer** | `app/models/observers.py` | `EvaluacionService` (en `services.py`) es el Subject: tiene `suscribir()` y `_notificar()`. Los observadores concretos son `AlertaPresionObserver` y `HistorialObserver`; se suscriben en `main.py`. |

El flujo está en `EvaluacionService.evaluar()` (`app/models/services.py`): tiene tres líneas comentadas con **# Strategy**, **# Factory Method** y **# Observer**. Empieza la demo del código por ahí.

Principios aplicables para mencionar:
- **S (responsabilidad única):** cada archivo hace una sola cosa (SQL solo en `repositories.py`, reglas en `services.py`, HTTP en `controllers/`).
- **O (abierto/cerrado):** nuevo factor = nueva estrategia; nuevo efecto tras evaluar = nuevo observador. Hay una prueba que lo demuestra (`test_nueva_estrategia_sin_modificar_el_calculador`).
- **D (inversión de dependencias):** el servicio depende de las abstracciones `FactorStrategy` y `EvaluacionObserver`.
- Arquitectura MVC (ver 5.b). Dentro del Modelo hay capas: services → repositories → database.
- Seguridad: contraseñas con PBKDF2 y sal, JWT con expiración, cierre de sesión por inactividad, cada usuario solo ve su historial, validación en servidor y en cliente, salida del HTML escapada (evita XSS).

## 5.b Arquitectura MVC: qué es cada parte

| MVC | Archivos | Qué hace |
|---|---|---|
| **Vista** | `static/index.html`, `static/js/app.js`, `static/js/api.js`, `static/css/`, y `app/views/report.py` (el PDF) | Pinta las pantallas, recoge lo que escribe el usuario y llama a la API. No calcula nada del riesgo. |
| **Controlador** | `app/controllers/auth_controller.py`, `app/controllers/evaluaciones_controller.py` (más `app/container.py`, que le entrega los servicios) | Recibe la petición HTTP, llama a **un servicio** y responde (JSON o PDF). Traduce errores del servicio a códigos HTTP (404, 409, 401). Sin SQL ni reglas de negocio. |
| **Modelo** | la carpeta `app/models/`: `models.py` (datos y validación), `services.py` + `strategies.py` + `factory.py` + `observers.py` (reglas y patrones), `repositories.py` + `database.py` (persistencia) | Todo lo que es dato, regla y almacenamiento. |

Flujo de una evaluación: la **Vista** envía los datos → el **Controlador** (`POST /api/evaluaciones`) los valida con Pydantic y llama a `EvaluacionService.evaluar()` → el **Modelo** calcula (Strategy), clasifica (Factory), notifica (Observer, que guarda con `EvaluacionRepository`) → el Controlador devuelve el resultado → la Vista lo muestra como semáforo.

Regla de oro: **el controlador solo habla con servicios, nunca con repositorios.** Por eso existe `HistorialService` (listar, detalle y presiones) y `AuthService.usuario_desde_token`. La prueba `tests/test_historial.py::TestSeparacionMVC` revisa el código y falla si un controlador o el contenedor tocan un repositorio, o si aparece SQL fuera de `repositories.py` y `database.py`.

## 6. Decisiones técnicas (útiles para la sección 4 del documento)
- **FastAPI:** validación automática con Pydantic (HU-18), documentación en `/docs`, buen rendimiento (RNF < 2 s).
- **SQLite:** cero configuración para la demo. Al estar todo el SQL en `repositories.py`, migrar a PostgreSQL solo cambia esa capa y `database.py`.
- **JWT con renovación en cada petición:** cumple "expiración automática de sesión por inactividad".
- **ReportLab:** genera el PDF en el servidor, sin depender del navegador.
- **Frontend en HTML/CSS/JS:** responsivo (PC, tablet y celular), sin necesidad de Node ni compilación.

## 7. Cambiar la clave secreta y la duración de la sesión
Variables de entorno (opcionales): `CARDIOPREV_SECRET`, `CARDIOPREV_TOKEN_MIN`, `CARDIOPREV_DB`.

## 8. Problemas comunes
- `ModuleNotFoundError: No module named 'app'`: ejecuta los comandos desde la carpeta `cardioprev` (donde está `app/`), y verifica que exista `app/__init__.py`.
- `uvicorn` no se reconoce: activa el entorno virtual (`.venv`) o usa `python -m uvicorn app.main:app --reload`.
- Se borró el historial: está en el archivo `cardioprev.db`; bórralo solo si quieres empezar de cero.
- Cambió el puerto ocupado: `uvicorn app.main:app --port 8001`.
