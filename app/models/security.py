"""Seguridad: hash de contraseñas y tokens JWT con expiración.

- Contraseñas: PBKDF2-HMAC-SHA256 con sal aleatoria (biblioteca estándar). Nunca se guardan en claro.
- Sesión: JWT firmado (HS256). Expira a los N minutos; cada petición autenticada entrega un
  token nuevo, por lo que la sesión se cierra automáticamente tras N minutos de inactividad.
"""
from __future__ import annotations

import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt

ITERACIONES = 200_000


def hashear_password(password: str) -> str:
    sal = os.urandom(16)
    h = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), sal, ITERACIONES)
    return f"pbkdf2_sha256${ITERACIONES}${sal.hex()}${h.hex()}"


def verificar_password(password: str, almacenado: str) -> bool:
    try:
        _, iteraciones, sal, esperado = almacenado.split("$")
        h = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"),
                                bytes.fromhex(sal), int(iteraciones))
        return hmac.compare_digest(h.hex(), esperado)
    except (ValueError, AttributeError):
        return False


class TokenService:
    def __init__(self, secreto: str, minutos: int):
        self._secreto = secreto
        self._minutos = minutos

    def crear(self, usuario_id: int) -> str:
        ahora = datetime.now(timezone.utc)
        payload = {"sub": str(usuario_id), "iat": ahora,
                   "exp": ahora + timedelta(minutes=self._minutos)}
        return jwt.encode(payload, self._secreto, algorithm="HS256")

    def decodificar(self, token: str) -> Optional[dict]:
        """Devuelve {'uid': id} si el token es válido y no ha expirado; si no, None."""
        try:
            payload = jwt.decode(token, self._secreto, algorithms=["HS256"])
            return {"uid": int(payload["sub"])}
        except (jwt.PyJWTError, KeyError, ValueError):
            return None
