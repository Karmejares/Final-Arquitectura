"""Capa de servicios (parte del MODELO en MVC): orquesta los patrones y las reglas de negocio.

Los controladores (carpeta controllers/) solo hablan con estas clases; nunca con los repositorios.

  - CalculadorRiesgo ... Context del patrón Strategy.
  - EvaluacionService .. Subject del patrón Observer y fachada del flujo de evaluación.
  - HistorialService ... consulta del historial del usuario (HU-15, HU-16).
  - AuthService ........ registro, inicio de sesión y usuario de la sesión (HU-01, HU-02).
"""
from __future__ import annotations

import sqlite3
from datetime import datetime
from typing import Iterable, List, Optional, Tuple

from .factory import NivelRiesgoFactory
from .models import DatosEvaluacion, ResultadoEvaluacion
from .nutrition import calcular_nutricion
from .observers import EvaluacionObserver
from .repositories import EvaluacionRepository, UsuarioRepository
from .security import TokenService, hashear_password, verificar_password
from .strategies import FactorStrategy, estrategias_por_defecto

AVISO = ("CardioPrev ofrece una estimación orientativa basada en reglas simplificadas; "
         "no reemplaza el diagnóstico ni la consulta con un profesional de la salud.")


# ------------------------------------------------------------- evaluación ---
class CalculadorRiesgo:
    """Context de Strategy: suma los puntajes de las estrategias que recibe."""

    def __init__(self, estrategias: Optional[Iterable[FactorStrategy]] = None):
        """Prepara las estrategias del cálculo.

        Args:
            estrategias: factores a evaluar; por defecto, ``estrategias_por_defecto()``.
        """
        self._estrategias: List[FactorStrategy] = list(estrategias or estrategias_por_defecto())

    @property
    def puntaje_maximo(self) -> int:
        """Máximo puntaje posible con las estrategias activas."""
        return sum(e.puntos_maximos for e in self._estrategias)

    def calcular(self, datos: DatosEvaluacion):
        """Evalúa todos los factores.

        Args:
            datos: datos de la evaluación.

        Returns:
            Tupla con el puntaje total y la lista de ``FactorResultado``.
        """
        factores = [e.evaluar(datos) for e in self._estrategias]
        return sum(f.puntos for f in factores), factores


class EvaluacionService:
    """Subject de Observer + fachada del flujo completo (HU-11 a HU-14)."""

    def __init__(self, calculador: Optional[CalculadorRiesgo] = None):
        """Prepara el servicio, sin observadores.

        Args:
            calculador: calculador de riesgo; por defecto, uno con las estrategias por defecto.
        """
        self._calculador = calculador or CalculadorRiesgo()
        self._observadores: List[EvaluacionObserver] = []

    def suscribir(self, obs: EvaluacionObserver) -> None:
        """Agrega un observador; se notifican en orden de suscripción.

        Args:
            obs: observador que se agrega.
        """
        self._observadores.append(obs)

    def _notificar(self, usuario_id, datos, resultado) -> None:
        """Avisa a todos los observadores de una evaluación terminada."""
        for obs in self._observadores:
            obs.actualizar(usuario_id, datos, resultado)

    def evaluar(self, usuario_id: int, datos: DatosEvaluacion) -> ResultadoEvaluacion:
        """Ejecuta el flujo completo: puntaje, nivel, recomendaciones y notificación.

        Args:
            usuario_id: id del usuario evaluado.
            datos: datos de la evaluación.

        Returns:
            El resultado, con las alertas y el id que agregan los observadores.
        """
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


# ------------------------------------------------------------- historial ---
class EvaluacionNoEncontrada(Exception):
    """La evaluación no existe o pertenece a otro usuario (misma respuesta para ambos casos)."""


class HistorialService:
    """Consulta del historial (HU-15, HU-16). Todo se filtra por usuario: nadie ve lo ajeno."""

    def __init__(self, repositorio: EvaluacionRepository):
        """Recibe de dónde se consultan las evaluaciones.

        Args:
            repositorio: repositorio de evaluaciones.
        """
        self._repo = repositorio

    def listar(self, usuario_id: int) -> List[dict]:
        """Resume las evaluaciones del usuario, de la más reciente a la más antigua.

        Args:
            usuario_id: id del usuario.

        Returns:
            Filas con id, fecha, puntaje, nivel y color.
        """
        return self._repo.listar(usuario_id)

    def presiones(self, usuario_id: int) -> List[dict]:
        """Lista los registros de presión arterial del usuario, del más reciente al más antiguo.

        Args:
            usuario_id: id del usuario.

        Returns:
            Filas con id, fecha, sistolica, diastolica y estado.
        """
        return self._repo.listar_presiones(usuario_id)

    def obtener(self, usuario_id: int, evaluacion_id: int) -> dict:
        """Busca una evaluación del usuario.

        Args:
            usuario_id: id del usuario.
            evaluacion_id: id de la evaluación.

        Returns:
            ``{'datos': {...}, 'resultado': {...}}``.

        Raises:
            EvaluacionNoEncontrada: si no existe o pertenece a otro usuario.
        """
        fila = self._repo.obtener(usuario_id, evaluacion_id)
        if fila is None:
            raise EvaluacionNoEncontrada()
        return fila


# --------------------------------------------------------------- cuentas ---
class CorreoYaRegistrado(Exception):
    """Ya existe una cuenta con ese correo."""


class CredencialesInvalidas(Exception):
    """El correo no existe o la contraseña no coincide (misma respuesta para ambos casos)."""


class AuthService:
    """Registro, inicio de sesión y usuario de la sesión (HU-01, HU-02)."""

    def __init__(self, usuarios: UsuarioRepository, tokens: TokenService):
        """Recibe los usuarios y el servicio de tokens.

        Args:
            usuarios: repositorio de usuarios.
            tokens: servicio que crea y valida los JWT.
        """
        self._usuarios = usuarios
        self._tokens = tokens

    def registrar(self, nombre: str, correo: str, password: str) -> int:
        """Crea una cuenta con el correo normalizado y la contraseña hasheada.

        Args:
            nombre: nombre del usuario.
            correo: correo; se guarda sin espacios y en minúsculas.
            password: contraseña en claro.

        Returns:
            El id del usuario creado.

        Raises:
            CorreoYaRegistrado: si ya existe una cuenta con ese correo.
        """
        correo = correo.strip().lower()
        if self._usuarios.por_correo(correo):
            raise CorreoYaRegistrado()
        try:
            return self._usuarios.crear(nombre.strip(), correo, hashear_password(password))
        except sqlite3.IntegrityError:          # carrera entre dos registros simultáneos
            raise CorreoYaRegistrado()

    def iniciar_sesion(self, correo: str, password: str) -> Tuple[str, str]:
        """Valida las credenciales y crea el token de la sesión.

        Args:
            correo: correo de la cuenta.
            password: contraseña en claro.

        Returns:
            Tupla con el token y el nombre del usuario.

        Raises:
            CredencialesInvalidas: si el correo no existe o la contraseña no coincide.
        """
        usuario = self._usuarios.por_correo(correo.strip().lower())
        if not usuario or not verificar_password(password, usuario["password_hash"]):
            raise CredencialesInvalidas()
        return self._tokens.crear(usuario["id"]), usuario["nombre"]

    def usuario_desde_token(self, token: str) -> Optional[dict]:
        """Busca al dueño de un token.

        Args:
            token: JWT recibido.

        Returns:
            El usuario, o None si el token es inválido, venció o el usuario no existe.
        """
        datos = self._tokens.decodificar(token)
        return self._usuarios.por_id(datos["uid"]) if datos else None
