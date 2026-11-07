"""PATRÓN FACTORY METHOD (HU-11, HU-12, HU-13).

Rol del patrón:
  - Product (interfaz) ......... NivelRiesgo
  - ConcreteProduct ............ RiesgoBajo, RiesgoMedio, RiesgoAlto
  - Creator ................... NivelRiesgoFactory.crear(puntaje)

Una sola decisión (el puntaje) produce el objeto que encapsula nivel, color de
semáforo, mensaje y recomendaciones generales. El resto del sistema no usa `if`
sobre el nivel: delega en el objeto creado (polimorfismo).
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List


class NivelRiesgo(ABC):
    """Product: nivel de riesgo con su semáforo y su mensaje.

    Attributes:
        nombre: "bajo", "medio" o "alto".
        color: color del semáforo: "verde", "amarillo" o "rojo".
        mensaje: texto que se muestra al usuario.
    """

    nombre: str
    color: str
    mensaje: str

    @abstractmethod
    def recomendaciones_generales(self) -> List[str]:
        """Devuelve las recomendaciones propias del nivel, sin importar los factores."""


class RiesgoBajo(NivelRiesgo):
    """Puntaje menor que ``UMBRAL_MEDIO``: semáforo verde."""

    nombre, color = "bajo", "verde"
    mensaje = "Tu riesgo estimado es bajo. ¡Sigue cuidando tus hábitos!"

    def recomendaciones_generales(self):
        return ["Mantén tus hábitos saludables y repite esta evaluación periódicamente."]


class RiesgoMedio(NivelRiesgo):
    """Puntaje desde ``UMBRAL_MEDIO`` y menor que ``UMBRAL_ALTO``: semáforo amarillo."""

    nombre, color = "medio", "amarillo"
    mensaje = "Tu riesgo estimado es medio. Hay factores que puedes mejorar."

    def recomendaciones_generales(self):
        return ["Prioriza cambios en tus factores modificables y agenda un chequeo médico preventivo."]


class RiesgoAlto(NivelRiesgo):
    """Puntaje desde ``UMBRAL_ALTO``: semáforo rojo."""

    nombre, color = "alto", "rojo"
    mensaje = "Tu riesgo estimado es alto. Te recomendamos consultar a un profesional de la salud."

    def recomendaciones_generales(self):
        return ["Consulta a un médico lo antes posible para una valoración completa.",
                "No suspendas ni cambies tratamientos sin indicación médica."]


class NivelRiesgoFactory:
    """Creator: decide el nivel a partir del puntaje.

    Los umbrales son configurables sin tocar a los productos concretos.

    Attributes:
        UMBRAL_MEDIO: puntaje mínimo del riesgo medio.
        UMBRAL_ALTO: puntaje mínimo del riesgo alto.
    """

    UMBRAL_MEDIO = 7
    UMBRAL_ALTO = 13

    @classmethod
    def crear(cls, puntaje: int) -> NivelRiesgo:
        """Crea el nivel que corresponde a un puntaje.

        Args:
            puntaje: suma de los puntos de todos los factores.

        Returns:
            Una instancia de RiesgoAlto, RiesgoMedio o RiesgoBajo.
        """
        if puntaje >= cls.UMBRAL_ALTO:
            return RiesgoAlto()
        if puntaje >= cls.UMBRAL_MEDIO:
            return RiesgoMedio()
        return RiesgoBajo()
