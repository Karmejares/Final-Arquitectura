"""Contenedor de dependencias: agrupa los SERVICIOS que usan los controladores (controllers/).

Los controladores no reciben repositorios: toda operación pasa por un servicio.
"""
from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .models.services import AuthService, EvaluacionService, HistorialService


@dataclass
class Contenedor:
    """Servicios que comparten los controladores; se guarda en ``app.state.contenedor``.

    Attributes:
        auth: registro, inicio de sesión y usuario de la sesión.
        evaluaciones: cálculo y guardado de evaluaciones.
        historial: consulta de las evaluaciones del usuario.
    """

    auth: AuthService
    evaluaciones: EvaluacionService
    historial: HistorialService


def get_contenedor(request: Request) -> Contenedor:
    """Dependencia de FastAPI: entrega el contenedor creado en ``create_app``.

    Args:
        request: petición actual, de la que se obtiene la aplicación.

    Returns:
        El contenedor de servicios.
    """
    return request.app.state.contenedor


_bearer = HTTPBearer(auto_error=False)


def usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(_bearer),
                   c: Contenedor = Depends(get_contenedor)) -> dict:
    """Dependencia de FastAPI: exige un token válido y devuelve el usuario autenticado.

    Args:
        credenciales: cabecera ``Authorization: Bearer``; None si no se envió.
        c: contenedor de servicios.

    Returns:
        La fila del usuario como diccionario.

    Raises:
        HTTPException: 401 si falta el token, es inválido, venció o el usuario ya no existe.
    """
    if credenciales is None:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión.")
    usuario = c.auth.usuario_desde_token(credenciales.credentials)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Tu sesión expiró. Inicia sesión de nuevo.")
    return usuario
