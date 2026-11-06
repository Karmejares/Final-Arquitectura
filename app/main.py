"""Punto de entrada de CardioPrev.

Arquitectura en capas:  routers (HTTP)  ->  services (reglas de negocio + patrones)
                        ->  repositories (SQL)  ->  database (SQLite)
"""
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from . import config
from .container import Contenedor
from .database import Database
from .errors import traducir_errores
from .observers import AlertaPresionObserver, HistorialObserver
from .repositories import EvaluacionRepository, UsuarioRepository
from .routers import auth, evaluaciones
from .security import TokenService
from .services import AuthService, EvaluacionService


def create_app(db_path: Optional[str] = None, secreto: Optional[str] = None,
               token_minutos: Optional[int] = None) -> FastAPI:
    db = Database(db_path or config.DB_PATH)
    tokens = TokenService(secreto or config.SECRET_KEY, token_minutos or config.TOKEN_MINUTOS)
    usuarios = UsuarioRepository(db)
    evals_repo = EvaluacionRepository(db)

    servicio = EvaluacionService()
    servicio.suscribir(AlertaPresionObserver())          # 1.º: las alertas quedan en el resultado
    servicio.suscribir(HistorialObserver(evals_repo))    # 2.º: se guarda el resultado completo

    app = FastAPI(title="CardioPrev", version="1.0",
                  description="Estimación orientativa del riesgo cardiovascular")
    app.state.contenedor = Contenedor(tokens=tokens, usuarios=usuarios,
                                      evaluaciones_repo=evals_repo,
                                      auth=AuthService(usuarios, tokens),
                                      evaluaciones=servicio)

    @app.exception_handler(RequestValidationError)
    async def errores_de_validacion(request: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"detail": traducir_errores(exc.errors())})

    @app.middleware("http")
    async def renovar_token(request: Request, call_next):
        """Sesión deslizante: cada petición con token válido recibe uno nuevo en
        la cabecera X-Token-Renovado. Sin actividad, el token vence y la sesión expira."""
        respuesta = await call_next(request)
        cabecera = request.headers.get("authorization", "")
        if cabecera.lower().startswith("bearer "):
            datos = tokens.decodificar(cabecera[7:].strip())
            if datos:
                respuesta.headers["X-Token-Renovado"] = tokens.crear(datos["uid"])
        return respuesta

    app.include_router(auth.router)
    app.include_router(evaluaciones.router)

    @app.get("/api/salud", tags=["sistema"])
    def salud():
        return {"estado": "ok"}

    app.mount("/static", StaticFiles(directory=config.BASE_DIR / "static"), name="static")

    @app.get("/", include_in_schema=False)
    def index():
        return FileResponse(config.BASE_DIR / "static" / "index.html")

    return app


app = create_app()
