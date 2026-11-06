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
    nombre: str
    color: str
    mensaje: str

    @abstractmethod
    def recomendaciones_generales(self) -> List[str]: ...


class RiesgoBajo(NivelRiesgo):
    nombre, color = "bajo", "verde"
    mensaje = "Tu riesgo estimado es bajo. ¡Sigue cuidando tus hábitos!"

    def recomendaciones_generales(self):
        return ["Mantén tus hábitos saludables y repite esta evaluación periódicamente."]


class RiesgoMedio(NivelRiesgo):
    nombre, color = "medio", "amarillo"
    mensaje = "Tu riesgo estimado es medio. Hay factores que puedes mejorar."

    def recomendaciones_generales(self):
        return ["Prioriza cambios en tus factores modificables y agenda un chequeo médico preventivo."]


class RiesgoAlto(NivelRiesgo):
    nombre, color = "alto", "rojo"
    mensaje = "Tu riesgo estimado es alto. Te recomendamos consultar a un profesional de la salud."

    def recomendaciones_generales(self):
        return ["Consulta a un médico lo antes posible para una valoración completa.",
                "No suspendas ni cambies tratamientos sin indicación médica."]


class NivelRiesgoFactory:
    """Umbrales configurables sin tocar a los productos concretos."""

    UMBRAL_MEDIO = 7
    UMBRAL_ALTO = 13

    @classmethod
    def crear(cls, puntaje: int) -> NivelRiesgo:
        if puntaje >= cls.UMBRAL_ALTO:
            return RiesgoAlto()
        if puntaje >= cls.UMBRAL_MEDIO:
            return RiesgoMedio()
        return RiesgoBajo()
