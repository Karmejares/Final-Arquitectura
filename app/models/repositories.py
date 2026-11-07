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
    """SQL de la tabla ``usuarios``."""

    def __init__(self, db: Database):
        """Recibe la base de datos.

        Args:
            db: base de datos de la aplicación.
        """
        self._db = db

    def crear(self, nombre: str, correo: str, password_hash: str) -> int:
        """Inserta un usuario.

        Args:
            nombre: nombre del usuario.
            correo: correo, ya normalizado.
            password_hash: contraseña ya hasheada.

        Returns:
            El id del usuario creado.

        Raises:
            sqlite3.IntegrityError: si el correo ya existe.
        """
        with self._db.conexion() as c:
            cur = c.execute(
                "INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?,?,?)",
                (nombre, correo, password_hash))
            return cur.lastrowid

    def por_correo(self, correo: str) -> Optional[dict]:
        """Busca un usuario por correo.

        Args:
            correo: correo, ya normalizado.

        Returns:
            La fila como diccionario, o None si no existe.
        """
        with self._db.conexion() as c:
            fila = c.execute("SELECT * FROM usuarios WHERE correo = ?", (correo,)).fetchone()
        return dict(fila) if fila else None

    def por_id(self, usuario_id: int) -> Optional[dict]:
        """Busca un usuario por id.

        Args:
            usuario_id: id del usuario.

        Returns:
            La fila como diccionario, o None si no existe.
        """
        with self._db.conexion() as c:
            fila = c.execute("SELECT * FROM usuarios WHERE id = ?", (usuario_id,)).fetchone()
        return dict(fila) if fila else None


class EvaluacionRepository:
    """SQL de la tabla ``evaluaciones``; toda consulta se filtra por usuario."""

    def __init__(self, db: Database):
        """Recibe la base de datos.

        Args:
            db: base de datos de la aplicación.
        """
        self._db = db

    def guardar(self, usuario_id: int, datos: DatosEvaluacion,
                resultado: ResultadoEvaluacion) -> int:
        """Inserta una evaluación, con sus datos y su resultado en JSON.

        Args:
            usuario_id: id del usuario evaluado.
            datos: datos que ingresó el usuario.
            resultado: resultado calculado.

        Returns:
            El id de la evaluación creada.
        """
        with self._db.conexion() as c:
            cur = c.execute(
                "INSERT INTO evaluaciones (usuario_id, fecha, puntaje, nivel, color, datos, resultado)"
                " VALUES (?,?,?,?,?,?,?)",
                (usuario_id, resultado.fecha, resultado.puntaje, resultado.nivel,
                 resultado.color, datos.model_dump_json(), resultado.model_dump_json()))
            return cur.lastrowid

    def listar(self, usuario_id: int) -> List[dict]:
        """Resume las evaluaciones del usuario, de la más reciente a la más antigua.

        Args:
            usuario_id: id del usuario.

        Returns:
            Filas con id, fecha, puntaje, nivel y color.
        """
        with self._db.conexion() as c:
            filas = c.execute(
                "SELECT id, fecha, puntaje, nivel, color FROM evaluaciones"
                " WHERE usuario_id = ? ORDER BY id DESC", (usuario_id,)).fetchall()
        return [dict(f) for f in filas]

    def listar_presiones(self, usuario_id: int) -> List[dict]:
        """Registros de presión arterial de las evaluaciones del usuario, del más reciente al más antiguo.

        Args:
            usuario_id: id del usuario.

        Returns:
            Filas con id, fecha, sistolica, diastolica y estado.
        """
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
        """Busca una evaluación del usuario.

        Args:
            usuario_id: id del usuario.
            evaluacion_id: id de la evaluación.

        Returns:
            ``{'datos': {...}, 'resultado': {...}}``, o None si no existe o es de otro usuario.
        """
        with self._db.conexion() as c:
            fila = c.execute(
                "SELECT id, datos, resultado FROM evaluaciones WHERE id = ? AND usuario_id = ?",
                (evaluacion_id, usuario_id)).fetchone()
        if not fila:
            return None
        resultado = json.loads(fila["resultado"])
        resultado["id"] = fila["id"]
        return {"datos": json.loads(fila["datos"]), "resultado": resultado}
