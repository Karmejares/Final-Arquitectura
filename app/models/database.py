"""Acceso a la base de datos (SQLite).

SQLite no necesita instalar nada, ideal para la demo. Como todo el acceso pasa por
los repositorios (app/models/repositories.py), cambiar a PostgreSQL solo afecta a esta capa.
"""
import sqlite3
from contextlib import contextmanager

ESQUEMA = """
CREATE TABLE IF NOT EXISTS usuarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT NOT NULL,
    correo        TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    creado        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS evaluaciones (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    fecha      TEXT NOT NULL,
    puntaje    INTEGER NOT NULL,
    nivel      TEXT NOT NULL,
    color      TEXT NOT NULL,
    datos      TEXT NOT NULL,
    resultado  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_eval_usuario ON evaluaciones(usuario_id, id);
"""


class Database:
    """Conexiones a un archivo SQLite; al crearse asegura que las tablas existan."""

    def __init__(self, ruta: str):
        """Crea las tablas e índices que falten.

        Args:
            ruta: ruta del archivo SQLite.
        """
        self.ruta = ruta
        with self.conexion() as c:
            c.executescript(ESQUEMA)

    @contextmanager
    def conexion(self):
        """Abre una conexión de vida acotada (administrador de contexto).

        Activa las llaves foráneas y entrega filas accesibles por nombre de columna. Confirma si
        no hubo errores, revierte si hubo una excepción y siempre cierra la conexión.

        Yields:
            La conexión ``sqlite3`` abierta.
        """
        conn = sqlite3.connect(self.ruta)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
