"""Acceso a la base de datos (SQLite).

SQLite no necesita instalar nada, ideal para la demo. Como todo el acceso pasa por
los repositorios (app/repositories.py), cambiar a PostgreSQL solo afecta a esta capa.
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
    def __init__(self, ruta: str):
        self.ruta = ruta
        with self.conexion() as c:
            c.executescript(ESQUEMA)

    @contextmanager
    def conexion(self):
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
