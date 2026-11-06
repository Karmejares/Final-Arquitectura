"""Configuración central. Se puede sobrescribir con variables de entorno."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Clave para firmar los JWT. En producción debe venir de una variable de entorno.
SECRET_KEY = os.getenv("CARDIOPREV_SECRET", "cardioprev-clave-de-desarrollo-cambiala-en-produccion")

# La sesión expira tras estos minutos SIN actividad (cada petición renueva el token).
TOKEN_MINUTOS = int(os.getenv("CARDIOPREV_TOKEN_MIN", "15"))

DB_PATH = os.getenv("CARDIOPREV_DB", str(BASE_DIR / "cardioprev.db"))
