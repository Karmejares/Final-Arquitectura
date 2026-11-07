"""Repositorios: único lugar donde se escribe SQL.

Cada consulta de evaluaciones se filtra por usuario_id, de modo que un usuario
solo puede ver su propio historial (HU-15).
"""
from __future__ import annotations

import json
from typing import List, Optional

from .database import Database
from .models import DatosEvaluacion, ResultadoEvaluacion
from .presion import clasificar_presion


class UsuarioRepository:
    def __init__(self, db: Database):
        self._db = db

    def crear(self, nombre: str, correo: str, password_hash: str) -> int:
        with self._db.conexion() as c:
            cur = c.execute(
                "INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?,?,?)",
                (nombre, correo, password_hash))
            return cur.lastrowid

    def por_correo(self, correo: str) -> Optional[dict]:
        with self._db.conexion() as c:
            fila = c.execute("SELECT * FROM usuarios WHERE correo = ?", (correo,)).fetchone()
        return dict(fila) if fila else None

    def por_id(self, usuario_id: int) -> Optional[dict]:
        with self._db.conexion() as c:
            fila = c.execute("SELECT * FROM usuarios WHERE id = ?", (usuario_id,)).fetchone()
        return dict(fila) if fila else None


class EvaluacionRepository:
    def __init__(self, db: Database):
        self._db = db

    def guardar(self, usuario_id: int, datos: DatosEvaluacion,
                resultado: ResultadoEvaluacion) -> int:
        with self._db.conexion() as c:
            cur = c.execute(
                "INSERT INTO evaluaciones (usuario_id, fecha, puntaje, nivel, color, datos, resultado)"
                " VALUES (?,?,?,?,?,?,?)",
                (usuario_id, resultado.fecha, resultado.puntaje, resultado.nivel,
                 resultado.color, datos.model_dump_json(), resultado.model_dump_json()))
            return cur.lastrowid

    def listar(self, usuario_id: int) -> List[dict]:
        with self._db.conexion() as c:
            filas = c.execute(
                "SELECT id, fecha, puntaje, nivel, color FROM evaluaciones"
                " WHERE usuario_id = ? ORDER BY id DESC", (usuario_id,)).fetchall()
        return [dict(f) for f in filas]

    def listar_presiones(self, usuario_id: int) -> List[dict]:
        """Registros de presión arterial de las evaluaciones del usuario, del más reciente al más antiguo."""
        with self._db.conexion() as c:
            filas = c.execute(
                "SELECT id, fecha, datos FROM evaluaciones WHERE usuario_id = ? ORDER BY id DESC",
                (usuario_id,)).fetchall()
        registros = []
        for f in filas:
            d = json.loads(f["datos"])
            s, di = d["presion_sistolica"], d["presion_diastolica"]
            registros.append({"id": f["id"], "fecha": f["fecha"], "sistolica": s,
                              "diastolica": di, "estado": clasificar_presion(s, di)})
        return registros

    def obtener(self, usuario_id: int, evaluacion_id: int) -> Optional[dict]:
        """Devuelve {'datos': {...}, 'resultado': {...}} solo si pertenece al usuario."""
        with self._db.conexion() as c:
            fila = c.execute(
                "SELECT id, datos, resultado FROM evaluaciones WHERE id = ? AND usuario_id = ?",
                (evaluacion_id, usuario_id)).fetchone()
        if not fila:
            return None
        resultado = json.loads(fila["resultado"])
        resultado["id"] = fila["id"]
        return {"datos": json.loads(fila["datos"]), "resultado": resultado}
