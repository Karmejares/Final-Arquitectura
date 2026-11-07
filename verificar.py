"""Revisa que el proyecto esté completo y bien ubicado, y que las librerías estén instaladas.

Se ejecuta desde la carpeta del proyecto:   python verificar.py
"""
import importlib
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent

ARCHIVOS = [
    "requirements.txt",
    "seed_demo.py",
    "app/__init__.py",
    "app/main.py",
    "app/config.py",
    "app/database.py",
    "app/models.py",
    "app/security.py",
    "app/repositories.py",
    "app/services.py",
    "app/strategies.py",
    "app/factory.py",
    "app/observers.py",
    "app/nutrition.py",
    "app/report.py",
    "app/errors.py",
    "app/presion.py",
    "app/container.py",
    "app/routers/__init__.py",
    "app/routers/auth.py",
    "app/routers/evaluaciones.py",
    "static/index.html",
    "static/css/estilos.css",
    "static/js/app.js",
    "static/img/alimentos.png",
    "static/img/actividad.png",
    "static/img/consumo.png",
    "static/img/presion.png",
    "static/img/historial.png",
    "tests/__init__.py",
    "tests/datos.py",
    "tests/test_riesgo.py",
    "tests/test_cuentas_pdf.py",
    "tests/test_habitos_presion.py",
    "tests/test_historial.py",
    "tests/test_api.py",
]

LIBRERIAS = [("fastapi", "fastapi"), ("uvicorn", "uvicorn"), ("pydantic", "pydantic"),
             ("jwt", "PyJWT"), ("reportlab", "reportlab")]


def main() -> int:
    problemas = 0
    print(f"Carpeta del proyecto: {RAIZ}\n")

    print("1) Versión de Python")
    v = sys.version_info
    if v >= (3, 10):
        print(f"   OK   Python {v.major}.{v.minor}.{v.micro}")
    else:
        print(f"   FALTA Python {v.major}.{v.minor} es antiguo; se necesita 3.10 o superior")
        problemas += 1

    print("\n2) Archivos del proyecto")
    faltan = [a for a in ARCHIVOS if not (RAIZ / a).is_file()]
    if not faltan:
        print(f"   OK   los {len(ARCHIVOS)} archivos están en su lugar")
    for a in faltan:
        problemas += 1
        extra = " (puede estar vacío, pero DEBE existir)" if a.endswith("__init__.py") else ""
        print(f"   FALTA {a}{extra}")
    vacios = [a for a in ARCHIVOS
              if (RAIZ / a).is_file() and not a.endswith("__init__.py") and (RAIZ / a).stat().st_size == 0]
    for a in vacios:
        problemas += 1
        print(f"   VACÍO {a}: el archivo existe pero no tiene contenido")

    print("\n3) Librerías instaladas (en el entorno que estás usando)")
    for modulo, paquete in LIBRERIAS:
        try:
            importlib.import_module(modulo)
            print(f"   OK   {paquete}")
        except ImportError:
            problemas += 1
            print(f"   FALTA {paquete}  ->  pip install -r requirements-dev.txt")

    print("\n4) La aplicación se puede importar")
    sys.path.insert(0, str(RAIZ))
    try:
        importlib.import_module("app.main")
        print("   OK   app.main se importa sin errores")
    except Exception as e:  # noqa: BLE001
        problemas += 1
        print(f"   ERROR {type(e).__name__}: {e}")

    print()
    if problemas:
        print(f"Se encontraron {problemas} problema(s). Corrígelos y vuelve a ejecutar este script.")
        return 1
    print("Todo en orden. Ejecuta:  python -m uvicorn app.main:app   y abre http://127.0.0.1:8000")
    return 0


if __name__ == "__main__":
    sys.exit(main())
