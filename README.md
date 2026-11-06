# CardioPrev

Aplicación web que estima de forma orientativa el riesgo cardiovascular de una persona a partir de sus
datos personales, hábitos y valores clínicos, y entrega semáforo de riesgo, recomendaciones, estimación
nutricional, historial por usuario y reporte en PDF.

- Backend: Python + FastAPI · SQLite · JWT · ReportLab
- Frontend: HTML + CSS + JavaScript (responsivo)
- Patrones de diseño: **Strategy**, **Factory Method** y **Observer**

Instrucciones completas de armado, ejecución, demo y sustentación: ver **GUIA.md**.

```bash
python -m venv .venv && source .venv/bin/activate     # en Windows: .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload                          # http://127.0.0.1:8000
python -m pytest
```

> CardioPrev no reemplaza el diagnóstico ni la consulta con un profesional de la salud.
