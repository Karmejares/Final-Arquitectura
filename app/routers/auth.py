"""CONTROLADOR (MVC) · HU-01 registro y HU-02 inicio de sesión.

Traduce HTTP a llamadas a AuthService y las excepciones del servicio a códigos de estado.
"""
from fastapi import APIRouter, Depends, HTTPException

from ..container import Contenedor, get_contenedor, usuario_actual
from ..models import LoginIn, RegistroIn, TokenOut
from ..services import CorreoYaRegistrado, CredencialesInvalidas

router = APIRouter(prefix="/api/auth", tags=["autenticación"])


@router.post("/registro", status_code=201)
def registro(datos: RegistroIn, c: Contenedor = Depends(get_contenedor)):
    try:
        c.auth.registrar(datos.nombre, datos.correo, datos.password)
    except CorreoYaRegistrado:
        raise HTTPException(status_code=409, detail="Ese correo ya está registrado.")
    return {"mensaje": "Registro exitoso. Ya puedes iniciar sesión."}


@router.post("/login", response_model=TokenOut)
def login(datos: LoginIn, c: Contenedor = Depends(get_contenedor)):
    try:
        token, nombre = c.auth.iniciar_sesion(datos.correo, datos.password)
    except CredencialesInvalidas:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")
    return TokenOut(token=token, nombre=nombre)


@router.get("/me")
def me(usuario: dict = Depends(usuario_actual)):
    return {"id": usuario["id"], "nombre": usuario["nombre"], "correo": usuario["correo"]}
