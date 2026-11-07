"""Punto de entrada de CardioPrev.

Arquitectura MVC (el Modelo se organiza internamente en capas):

  Vista ........... static/ (HTML, CSS, JS) y el PDF de report.py
  Controlador ..... routers/  (HTTP: reciben la petición, llaman a un servicio, responden)
  Modelo .......... models.py + services.py (con strategies, factory, observers)
                    -> repositories.py (SQL) -> database.py (SQLite)

El flujo siempre es:  Vista -> Controlador -> servicio -> repositorio -> base de datos.
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
from .services import AuthService, EvaluacionService, HistorialService


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
    app.state.contenedor = Contenedor(auth=AuthService(usuarios, tokens),
                                      evaluaciones=servicio,
                                      historial=HistorialService(evals_repo))

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
