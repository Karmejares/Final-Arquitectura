"""Capa de servicios: orquesta los patrones y las reglas de negocio.

  - CalculadorRiesgo ... Context del patrón Strategy.
  - EvaluacionService .. Subject del patrón Observer y fachada del flujo de evaluación.
  - AuthService ........ registro e inicio de sesión (HU-01, HU-02).
"""
from __future__ import annotations

import sqlite3
from datetime import datetime
from typing import Iterable, List, Optional, Tuple

from .factory import NivelRiesgoFactory
from .models import DatosEvaluacion, ResultadoEvaluacion
from .nutrition import calcular_nutricion
from .observers import EvaluacionObserver
from .repositories import UsuarioRepository
from .security import TokenService, hashear_password, verificar_password
from .strategies import FactorStrategy, estrategias_por_defecto

AVISO = ("CardioPrev ofrece una estimación orientativa basada en reglas simplificadas; "
         "no reemplaza el diagnóstico ni la consulta con un profesional de la salud.")


# ------------------------------------------------------------- evaluación ---
class CalculadorRiesgo:
    """Context de Strategy: suma los puntajes de las estrategias que recibe."""

    def __init__(self, estrategias: Optional[Iterable[FactorStrategy]] = None):
        self._estrategias: List[FactorStrategy] = list(estrategias or estrategias_por_defecto())

    @property
    def puntaje_maximo(self) -> int:
        return sum(e.puntos_maximos for e in self._estrategias)

    def calcular(self, datos: DatosEvaluacion):
        factores = [e.evaluar(datos) for e in self._estrategias]
        return sum(f.puntos for f in factores), factores


class EvaluacionService:
    """Subject de Observer + fachada del flujo completo (HU-11 a HU-14)."""

    def __init__(self, calculador: Optional[CalculadorRiesgo] = None):
        self._calculador = calculador or CalculadorRiesgo()
        self._observadores: List[EvaluacionObserver] = []

    def suscribir(self, obs: EvaluacionObserver) -> None:
        self._observadores.append(obs)

    def _notificar(self, usuario_id, datos, resultado) -> None:
        for obs in self._observadores:
            obs.actualizar(usuario_id, datos, resultado)

    def evaluar(self, usuario_id: int, datos: DatosEvaluacion) -> ResultadoEvaluacion:
        puntaje, factores = self._calculador.calcular(datos)      # Strategy
        nivel = NivelRiesgoFactory.crear(puntaje)                  # Factory Method

        recomendaciones = nivel.recomendaciones_generales() + [
            f.recomendacion for f in factores if f.recomendacion]

        resultado = ResultadoEvaluacion(
            fecha=datetime.now().isoformat(timespec="seconds"),
            edad=datos.edad, imc=datos.imc,
            puntaje=puntaje, puntaje_maximo=self._calculador.puntaje_maximo,
            nivel=nivel.nombre, color=nivel.color, mensaje=nivel.mensaje,
            factores=factores, recomendaciones=recomendaciones,
            alertas=[], nutricion=calcular_nutricion(datos), aviso=AVISO)

        self._notificar(usuario_id, datos, resultado)              # Observer
        return resultado


# --------------------------------------------------------------- cuentas ---
class CorreoYaRegistrado(Exception):
    pass


class CredencialesInvalidas(Exception):
    pass


class AuthService:
    def __init__(self, usuarios: UsuarioRepository, tokens: TokenService):
        self._usuarios = usuarios
        self._tokens = tokens

    def registrar(self, nombre: str, correo: str, password: str) -> int:
        correo = correo.strip().lower()
        if self._usuarios.por_correo(correo):
            raise CorreoYaRegistrado()
        try:
            return self._usuarios.crear(nombre.strip(), correo, hashear_password(password))
        except sqlite3.IntegrityError:          # carrera entre dos registros simultáneos
            raise CorreoYaRegistrado()

    def iniciar_sesion(self, correo: str, password: str) -> Tuple[str, str]:
        usuario = self._usuarios.por_correo(correo.strip().lower())
        if not usuario or not verificar_password(password, usuario["password_hash"]):
            raise CredencialesInvalidas()
        return self._tokens.crear(usuario["id"]), usuario["nombre"]
