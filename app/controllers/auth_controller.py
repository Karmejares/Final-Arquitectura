"""CONTROLADOR (MVC) · HU-01 registro y HU-02 inicio de sesión.

Traduce HTTP a llamadas a AuthService y las excepciones del servicio a códigos de estado.
No contiene reglas de negocio ni SQL: valida el formato con Pydantic, delega y responde.
"""
from fastapi import APIRouter, Depends, HTTPException

from ..container import Contenedor, get_contenedor, usuario_actual
from ..models.models import LoginIn, MensajeOut, RegistroIn, TokenOut, UsuarioOut
from ..models.services import CorreoYaRegistrado, CredencialesInvalidas

router = APIRouter(prefix="/api/auth", tags=["autenticación"])


@router.post("/registro", status_code=201, response_model=MensajeOut,
             summary="Crear una cuenta (HU-01)",
             responses={409: {"description": "Ese correo ya está registrado."},
                        422: {"description": "Datos inválidos (nombre, correo o contraseña)."}})
def registro(datos: RegistroIn, c: Contenedor = Depends(get_contenedor)):
    try:
        c.auth.registrar(datos.nombre, datos.correo, datos.password)
    except CorreoYaRegistrado:
        raise HTTPException(status_code=409, detail="Ese correo ya está registrado.")
    return {"mensaje": "Registro exitoso. Ya puedes iniciar sesión."}


@router.post("/login", response_model=TokenOut,
             summary="Iniciar sesión y recibir el token (HU-02)",
             responses={401: {"description": "Correo o contraseña incorrectos."}})
def login(datos: LoginIn, c: Contenedor = Depends(get_contenedor)):
    try:
        token, nombre = c.auth.iniciar_sesion(datos.correo, datos.password)
    except CredencialesInvalidas:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")
    return TokenOut(token=token, nombre=nombre)


@router.get("/me", response_model=UsuarioOut,
            summary="Usuario de la sesión actual",
            responses={401: {"description": "Falta el token o la sesión expiró."}})
def me(usuario: dict = Depends(usuario_actual)):
    return {"id": usuario["id"], "nombre": usuario["nombre"], "correo": usuario["correo"]}
