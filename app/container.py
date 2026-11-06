"""Contenedor de dependencias: agrupa los objetos que comparten los routers."""
from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .repositories import EvaluacionRepository, UsuarioRepository
from .security import TokenService
from .services import AuthService, EvaluacionService


@dataclass
class Contenedor:
    tokens: TokenService
    usuarios: UsuarioRepository
    evaluaciones_repo: EvaluacionRepository
    auth: AuthService
    evaluaciones: EvaluacionService


def get_contenedor(request: Request) -> Contenedor:
    return request.app.state.contenedor


_bearer = HTTPBearer(auto_error=False)


def usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(_bearer),
                   c: Contenedor = Depends(get_contenedor)) -> dict:
    """Exige un token válido y devuelve el usuario autenticado (401 si no)."""
    if credenciales is None:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión.")
    datos = c.tokens.decodificar(credenciales.credentials)
    usuario = c.usuarios.por_id(datos["uid"]) if datos else None
    if usuario is None:
        raise HTTPException(status_code=401, detail="Tu sesión expiró. Inicia sesión de nuevo.")
    return usuario
