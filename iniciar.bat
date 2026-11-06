@echo off
REM Arranque con un clic en Windows: prepara el entorno la primera vez, carga datos de ejemplo y abre la app.
cd /d "%~dp0"

REM Busca Python: primero "python"; si no existe, usa el lanzador "py".
set PY=python
where python >nul 2>nul
if errorlevel 1 set PY=py -3

if not exist ".venv\Scripts\activate.bat" (
  echo Creando entorno virtual e instalando dependencias, solo la primera vez...
  %PY% -m venv .venv
  if errorlevel 1 (
    echo.
    echo No se pudo crear el entorno. Verifica que Python 3.10 o superior este instalado
    echo y que marcaste "Add Python to PATH" al instalarlo.
    pause
    exit /b 1
  )
  call ".venv\Scripts\activate.bat"
  pip install -r requirements-dev.txt
) else (
  call ".venv\Scripts\activate.bat"
)

python verificar.py
if errorlevel 1 (
  echo.
  echo Hay problemas que corregir antes de arrancar. Lee los mensajes de arriba.
  pause
  exit /b 1
)

python seed_demo.py
start "" http://127.0.0.1:8000
python -m uvicorn app.main:app
pause
