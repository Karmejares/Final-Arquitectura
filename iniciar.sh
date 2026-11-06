#!/usr/bin/env bash
# Arranque con un comando en Mac/Linux: prepara el entorno la primera vez, carga datos de ejemplo y arranca.
cd "$(dirname "$0")" || exit 1

if [ ! -f ".venv/bin/activate" ]; then
  echo "Creando entorno virtual e instalando dependencias, solo la primera vez..."
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r requirements-dev.txt
else
  source .venv/bin/activate
fi

python seed_demo.py
echo "Abre http://127.0.0.1:8000"
python -m uvicorn app.main:app
