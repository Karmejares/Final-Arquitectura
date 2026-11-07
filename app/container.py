"""Contenedor de dependencias: agrupa los SERVICIOS que usan los controladores (controllers/).

Los controladores no reciben repositorios: toda operación pasa por un servicio.
"""
from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .models.services import AuthService, EvaluacionService, HistorialService


@dataclass
class Contenedor:
    auth: AuthService
    evaluaciones: EvaluacionService
    historial: HistorialService


def get_contenedor(request: Request) -> Contenedor:
    return request.app.state.contenedor


_bearer = HTTPBearer(auto_error=False)


def usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(_bearer),
                   c: Contenedor = Depends(get_contenedor)) -> dict:
    """Exige un token válido y devuelve el usuario autenticado (401 si no)."""
    if credenciales is None:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión.")
    usuario = c.auth.usuario_desde_token(credenciales.credentials)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Tu sesión expiró. Inicia sesión de nuevo.")
    return usuario
