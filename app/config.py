"""Configuración central. Se puede sobrescribir con variables de entorno.

Variables de entorno:
    CARDIOPREV_SECRET: clave que firma los JWT; en producción debe cambiarse.
    CARDIOPREV_TOKEN_MIN: minutos sin actividad antes de que expire la sesión (15 por defecto).
    CARDIOPREV_DB: ruta del archivo SQLite (``cardioprev.db`` en la raíz del proyecto por defecto).
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Clave para firmar los JWT. En producción debe venir de una variable de entorno.
SECRET_KEY = os.getenv("CARDIOPREV_SECRET", "cardioprev-clave-de-desarrollo-cambiala-en-produccion")

# La sesión expira tras estos minutos SIN actividad (cada petición renueva el token).
TOKEN_MINUTOS = int(os.getenv("CARDIOPREV_TOKEN_MIN", "15"))

DB_PATH = os.getenv("CARDIOPREV_DB", str(BASE_DIR / "cardioprev.db"))
