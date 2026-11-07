# Guion de sustentación – CardioPrev

Objetivo: mostrar la aplicación funcionando y, sobre todo, **señalar cada patrón en el código**.
Duración sugerida: unos 10 minutos. Ensáyalo en voz alta al menos una vez.

---

## 0. Lista de verificación (hazla hoy y otra vez antes de salir)

- [ ] Ejecuta `iniciar.bat` (Windows) o `./iniciar.sh` (Mac/Linux) **con internet**: la primera vez instala las dependencias. Después ya no necesita internet.
- [ ] Se abre http://127.0.0.1:8000 e inicias sesión con `demo@cardioprev.com` / `Demo12345`. Ves 3 evaluaciones (roja, amarilla y verde) en el historial.
- [ ] Haces una evaluación nueva, abres el resultado y **descargas el PDF**.
- [ ] En otra terminal (con el entorno activado): `python -m pytest` → todas las pruebas en verde.
- [ ] VS Code abierto en la carpeta del proyecto, con estas pestañas en este orden: `services.py`, `strategies.py`, `factory.py`, `observers.py`, `main.py`. Letra grande (Ctrl + `+`).
- [ ] Cargador, notificaciones desactivadas, modo "no molestar", otras aplicaciones cerradas.
- [ ] Copia del proyecto en la nube o en una USB.
- [ ] Un video corto de respaldo (30–60 s) de la demo, por si algo falla.
- [ ] El documento a mano (PDF o abierto en una pestaña).

> Si borras el archivo `cardioprev.db`, se pierden los datos. Al volver a ejecutar `iniciar.bat` se recrean los de ejemplo.

---

## 1. Orden de la sustentación

| Min | Qué haces | Qué dices |
| --- | --- | --- |
| 1 | Pantalla de inicio de la app | Qué es CardioPrev, qué módulo elegiste (evaluación de riesgo) y por qué: es el núcleo del sistema y el que más justifica patrones. |
| 2 | **Demo.** Inicias sesión con el usuario de demostración, abres el historial (3 evaluaciones) y pulsas **Comenzar Evaluación** y recorres los 5 pasos con los valores de la tabla de abajo (también puedes entrar por cada tarjeta del Dashboard) | Edad e IMC se calculan solos; semáforo; alerta de presión; recomendaciones; calorías. Descargas el PDF. |
| 5 | **Código.** Abres `services.py` en `evaluar` | "Aquí están los tres patrones juntos" (ver sección 2). |
| 1 | `python -m pytest` y mostrar `test_nueva_estrategia_sin_modificar_el_calculador` y `TestSeparacionMVC` | Abierto/cerrado y separación MVC (el controlador no toca repositorios), demostrados con pruebas. |
| 1 | Cierre | Limitaciones honestas (sección 3, última pregunta) y qué mejorarías. |

**Valores para la evaluación en vivo** (perfil de riesgo medio; así se ve el amarillo y la alerta):

| Campo | Valor |
| --- | --- |
| Año de nacimiento / Género | 1980 / Femenino |
| Peso / Altura | 80 kg / 170 cm |
| Hábitos alimenticios (frutas / verduras / comida rápida / bebidas azucaradas / agua) | Ocasionalmente en las cuatro primeras / De 1 a 2 litros (el sistema lo clasifica como «regular») |
| Actividad | Moderado |
| Fuma / Alcohol / Diabetes / Antecedentes | No / Sí / No / Sí |
| Presión | 125 / 82 |
| Colesterol total / HDL | 210 / 45 |

Resultado esperado: **riesgo medio, 10 de 23 puntos, semáforo amarillo, alerta de presión elevada.**
(Para el rojo ya tienes la evaluación 1 en el historial: 23 puntos.)

---

## 2. Qué decir y qué señalar en el código

Usa `Ctrl + P` para saltar a cada archivo y `Ctrl + F` para buscar la clase.

### MVC (30 segundos, antes de entrar a los patrones)
Abre el árbol de carpetas y señala:
- "**Vista:** `static/` (HTML, CSS y JS) y `views/` (el PDF de `report.py`). Solo muestra datos y recoge entradas."
- "**Controlador:** `controllers/`. Recibe HTTP, llama a un servicio y responde. No tiene reglas ni SQL."
- "**Modelo:** la carpeta `models/`: `models.py`, `services.py` (con Strategy, Factory y Observer) y `repositories.py`. Aquí viven los datos, las reglas y la persistencia."
- "El controlador **solo habla con servicios**, nunca con repositorios, y hay una prueba que lo verifica."

### a) `services.py` → método `EvaluacionService.evaluar`  (empieza aquí)
"Este método es el flujo completo de una evaluación y tiene los tres patrones, marcados con comentarios."
1. `# Strategy` → `self._calculador.calcular(datos)`: calcula el puntaje.
2. `# Factory Method` → `NivelRiesgoFactory.crear(puntaje)`: crea el nivel de riesgo.
3. `# Observer` → `self._notificar(...)`: avisa a quienes reaccionan al resultado.

### b) `strategies.py` → Strategy
- "`FactorStrategy` es la **interfaz**: un método `evaluar`."
- "`EdadStrategy`, `ImcStrategy`, `PresionStrategy`... son las **estrategias concretas**: cada factor de riesgo sabe puntuarse a sí mismo."
- "`CalculadorRiesgo` (en `services.py`) es el **contexto**: recibe la lista de estrategias, las recorre y suma. **No conoce ningún factor concreto.**"
- "Para agregar un factor, creo una clase nueva y la agrego a la lista. No toco el calculador." (abierto/cerrado)
- Muestra `estrategias_por_defecto()`: 10 estrategias, 23 puntos como máximo.

### c) `factory.py` → Factory Method
- "`NivelRiesgo` es el **producto** (clase abstracta): nombre, color, mensaje y recomendaciones."
- "`RiesgoBajo`, `RiesgoMedio` y `RiesgoAlto` son los **productos concretos**."
- "`NivelRiesgoFactory.crear(puntaje)` es el **método fábrica**: de 13 puntos en adelante crea `RiesgoAlto`, de 7 `RiesgoMedio`, y si no `RiesgoBajo`."
- "Con esa sola decisión salen la clasificación, el color del semáforo y las recomendaciones, y **el resto del código no usa `if` sobre el nivel**."

### d) `observers.py` → Observer
- "`EvaluacionObserver` es la **interfaz** con `actualizar`."
- "`AlertaPresionObserver` agrega la alerta si la presión es anormal; `HistorialObserver` guarda la evaluación en la base de datos. Son los **observadores concretos**."
- "El **sujeto** es `EvaluacionService`: tiene `suscribir` y `_notificar`."
- Ve a `main.py` → `create_app`: "Aquí se **suscriben** los dos observadores. **El orden importa:** la alerta va primero para que se guarde con la evaluación."
- "Si mañana quiero enviar un correo, creo otro observador y lo suscribo. `EvaluacionService` no cambia."

### e) Principios (30 segundos)
- **S:** cada archivo hace una sola cosa (SQL solo en `repositories.py`, HTTP solo en `controllers/`).
- **O:** nuevo factor o efecto = clase nueva, sin modificar lo existente.
- **D:** el servicio depende de las abstracciones `FactorStrategy` y `EvaluacionObserver`, no de las concretas.
- **MVC:** Vista (`static/`) → Controlador (`controllers/`) → Modelo (servicios → repositorios → base de datos).
- **Seguridad:** contraseñas con PBKDF2 y sal, sesión JWT que expira por inactividad, cada usuario solo ve su historial.

---

## 3. Preguntas probables y respuestas

**¿Por qué Strategy y no un `if/else` grande?**
Cada regla clínica queda aislada, se prueba por separado y se cambia sin tocar las demás. Con `if` todo el cálculo cambia cada vez que cambia una regla.

**¿Por qué Observer y no llamar directamente a guardar y a alertar?**
Para que el cálculo no dependa de lo que se hace con el resultado. Agregar un efecto nuevo no modifica el servicio.

**¿Es realmente Factory Method? No veo subclases de la fábrica.**
Es un método fábrica **parametrizado y estático**: la clase concreta que se crea depende del argumento `puntaje`. El catálogo de GoF describe esta variante. No hay jerarquía de creadores porque la única variación es el puntaje, y una jerarquía no aportaría nada.

**¿Por qué los observadores modifican el resultado (alertas, id)?**
Es una decisión práctica: así el resultado final ya incluye lo que aportó cada observador. La alternativa más pura sería que cada observador devolviera su efecto por separado; se descartó por simplicidad. Por eso importa el orden de suscripción y hay una prueba que lo verifica.

**¿Dónde se ve el principio abierto/cerrado?**
En la prueba `test_nueva_estrategia_sin_modificar_el_calculador`: se agrega un factor y `CalculadorRiesgo` no cambia.

**¿Qué pasa si falla el cálculo? ¿Se pierden los datos?**
Se valida antes de calcular, el formulario sigue en pantalla si hay error y la escritura en base de datos usa transacción con `rollback`. El usuario reenvía sin volver a escribir todo.

**¿Por qué SQLite? ¿Y 100 usuarios a la vez?**
SQLite es para la demostración (cero instalación). Para 100 usuarios concurrentes iría PostgreSQL, y como todo el SQL está en `repositories.py` y `database.py`, la migración solo toca esas dos capas.

**¿Qué tan válido es el cálculo del riesgo?**
Es una heurística académica con reglas simplificadas, **no un modelo clínico validado**. La aplicación lo advierte en cada resultado y no reemplaza a un médico.

**¿Esto es realmente MVC si el front consume una API?**
Sí, es la variante de MVC para aplicaciones web con el front separado. La Vista vive en el navegador (HTML/JS) y pinta lo que el Controlador le devuelve en JSON. El Controlador (los archivos de `controllers/`, que usan los routers de FastAPI) solo traduce HTTP a llamadas a servicios. El Modelo concentra datos, reglas y persistencia. La diferencia con el MVC clásico de servidor es que las pantallas no las renderiza el servidor con plantillas; el único contenido que genera el servidor como vista es el PDF.

**¿Por qué el Modelo tiene tantos archivos?**
Para que no sea un solo bloque: los servicios tienen las reglas y los patrones, y los repositorios son el único lugar con SQL. Así se puede cambiar SQLite por PostgreSQL tocando solo los repositorios. Una prueba impide que el controlador salte esa separación.

**¿Qué pasa con la clave secreta del JWT?**
Hay un valor por defecto pensado para desarrollo. En un despliegue real se define la variable de entorno `CARDIOPREV_SECRET`. Es una limitación reconocida: hoy el sistema no obliga a definirla.

**¿Qué mejorarías?**
Medir el rendimiento con una prueba de carga, migrar a PostgreSQL, agregar `desuscribir` al sujeto del Observer, y validar las reglas de puntaje con un profesional de la salud.

**¿Cómo se protege la sesión y la contraseña?**
La contraseña se guarda con PBKDF2 y sal, nunca en claro. La sesión es un JWT que se renueva con cada petición y vence tras 15 minutos de inactividad.

---

## 4. Si algo falla (plan B)

| Problema | Qué hacer |
| --- | --- |
| La aplicación no abre | Terminal en la carpeta del proyecto: `python -m uvicorn app.main:app`. Si dice que no encuentra `app`, estás en la carpeta equivocada. |
| Puerto ocupado | `python -m uvicorn app.main:app --port 8001` y abre `http://127.0.0.1:8001`. |
| Falla una librería | Con el entorno activado: `pip install -r requirements-dev.txt`. |
| El historial salió vacío o raro | Cierra la app, borra `cardioprev.db` y vuelve a ejecutar `iniciar.bat`. |
| Nada funciona | Reproduce el **video de respaldo** y explica el código igual: lo que se evalúa es dónde y cómo están los patrones. |
