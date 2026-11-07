# CardioPrev

Aplicación web que estima de forma orientativa el riesgo cardiovascular de una persona a partir de sus
datos personales, hábitos y valores clínicos, y entrega semáforo de riesgo, recomendaciones, estimación
nutricional, historial por usuario y reporte en PDF.

- Backend: Python + FastAPI · SQLite · JWT · ReportLab
- Frontend: HTML + CSS + JavaScript (responsivo)
- Arquitectura: **MVC** (el Modelo se organiza internamente en servicios y repositorios)
- Patrones de diseño: **Strategy**, **Factory Method** y **Observer**

Instrucciones completas de armado, ejecución, demo y sustentación: ver **GUIA.md**.

```bash
python -m venv .venv && source .venv/bin/activate     # en Windows: .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload                          # http://127.0.0.1:8000
python -m pytest
```

## Arquitectura (MVC)

| MVC | Dónde está | Responsabilidad |
|---|---|---|
| **Vista** | `static/` (HTML, CSS, JS) y el PDF de `app/report.py` | Mostrar datos y recoger lo que escribe el usuario. No tiene reglas de negocio. |
| **Controlador** | `app/routers/` (`auth.py`, `evaluaciones.py`) | Recibe la petición HTTP, llama a un servicio y devuelve JSON o PDF. Sin SQL ni reglas. |
| **Modelo** | `app/models.py`, `app/services.py` (con `strategies.py`, `factory.py`, `observers.py`), `app/repositories.py`, `app/database.py` | Datos, reglas de negocio, patrones de diseño y persistencia. |

```mermaid
flowchart LR
    V["VISTA<br/>static/ (HTML · CSS · JS)<br/>PDF (report.py)"] -->|HTTP · JSON| C["CONTROLADOR<br/>routers/auth.py<br/>routers/evaluaciones.py"]
    C --> S["MODELO · servicios<br/>AuthService · EvaluacionService<br/>HistorialService<br/>(Strategy · Factory · Observer)"]
    S --> R["MODELO · repositorios<br/>repositories.py (único SQL)"]
    R --> D[("SQLite")]
```

Regla de oro: el controlador **solo habla con servicios**, nunca con repositorios. La prueba
`tests/test_historial.py::TestSeparacionMVC` lo verifica automáticamente.

> CardioPrev no reemplaza el diagnóstico ni la consulta con un profesional de la salud.
