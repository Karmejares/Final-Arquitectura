"""PATRÓN STRATEGY (HU-11, HU-13).

Rol del patrón:
  - Strategy (interfaz) ........ FactorStrategy
  - ConcreteStrategy ........... EdadStrategy, ImcStrategy, PresionStrategy, ...
  - Context .................... CalculadorRiesgo (app/models/services.py)

Cada factor de riesgo sabe puntuarse a sí mismo y qué recomendar. Para agregar un
factor nuevo basta crear una clase y registrarla: el calculador no se modifica
(principio Abierto/Cerrado).
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List

from .models import (ActividadFisica, Alimentacion, DatosEvaluacion,
                     FactorResultado)


class FactorStrategy(ABC):
    """Strategy: factor de riesgo que sabe puntuarse y qué recomendar.

    Attributes:
        nombre: nombre visible del factor.
        puntos_maximos: máximo de puntos que puede aportar.
    """

    nombre: str
    puntos_maximos: int

    @abstractmethod
    def evaluar(self, d: DatosEvaluacion) -> FactorResultado:
        """Devuelve el puntaje (y recomendación opcional) de un factor.

        Args:
            d: datos de la evaluación.

        Returns:
            El aporte del factor.
        """

    def _r(self, valor: str, puntos: int, rec: str | None = None) -> FactorResultado:
        """Arma el aporte del factor; la recomendación solo se incluye si suma puntos.

        Args:
            valor: valor del usuario, como texto.
            puntos: puntos que suma el factor.
            rec: recomendación para el usuario.

        Returns:
            El aporte del factor.
        """
        return FactorResultado(factor=self.nombre, valor=valor, puntos=puntos,
                               recomendacion=rec if puntos > 0 else None)


class EdadStrategy(FactorStrategy):
    """0 puntos con menos de 40 años, 1 con menos de 55, 2 con menos de 65 y 3 desde 65."""

    nombre, puntos_maximos = "Edad", 3

    def evaluar(self, d):
        e = d.edad
        p = 0 if e < 40 else 1 if e < 55 else 2 if e < 65 else 3
        return self._r(f"{e} años", p,
                       "Programa chequeos médicos periódicos: el riesgo aumenta con la edad.")


class ImcStrategy(FactorStrategy):
    """0 puntos con IMC menor que 25, 1 con menor que 30 y 2 desde 30."""

    nombre, puntos_maximos = "IMC", 2

    def evaluar(self, d):
        i = d.imc
        p = 0 if i < 25 else 1 if i < 30 else 2
        return self._r(f"{i}", p,
                       "Busca un peso saludable con alimentación balanceada y actividad regular.")


class PresionStrategy(FactorStrategy):
    """3 puntos desde 140/90, 2 desde 130/80, 1 con sistólica desde 120 y 0 en otro caso."""

    nombre, puntos_maximos = "Presión arterial", 3

    def evaluar(self, d):
        s, di = d.presion_sistolica, d.presion_diastolica
        if s >= 140 or di >= 90:
            p = 3
        elif s >= 130 or di >= 80:
            p = 2
        elif s >= 120:
            p = 1
        else:
            p = 0
        return self._r(f"{s}/{di} mmHg", p,
                       "Controla tu presión con regularidad, reduce la sal y consulta a tu médico.")


class ColesterolStrategy(FactorStrategy):
    """0 puntos con total menor que 200, 1 con menor que 240 y 2 desde 240; suma 1 si el HDL es menor que 40."""

    nombre, puntos_maximos = "Colesterol", 3

    def evaluar(self, d):
        t, h = d.colesterol_total, d.colesterol_hdl
        p = 0 if t < 200 else 1 if t < 240 else 2
        if h < 40:
            p += 1
        return self._r(f"total {t:g} / HDL {h:g} mg/dL", p,
                       "Reduce grasas saturadas, aumenta fibra y pide un perfil lipídico de control.")


class TabacoStrategy(FactorStrategy):
    """3 puntos si la persona fuma."""

    nombre, puntos_maximos = "Tabaco", 3

    def evaluar(self, d):
        return self._r("Sí" if d.fuma else "No", 3 if d.fuma else 0,
                       "Dejar de fumar es la acción que más reduce tu riesgo; busca apoyo profesional.")


class AlcoholStrategy(FactorStrategy):
    """1 punto si la persona consume alcohol."""

    nombre, puntos_maximos = "Alcohol", 1

    def evaluar(self, d):
        return self._r("Sí" if d.consume_alcohol else "No", 1 if d.consume_alcohol else 0,
                       "Limita el consumo de alcohol.")


class DiabetesStrategy(FactorStrategy):
    """2 puntos si la persona tiene diabetes."""

    nombre, puntos_maximos = "Diabetes", 2

    def evaluar(self, d):
        return self._r("Sí" if d.diabetes else "No", 2 if d.diabetes else 0,
                       "Mantén controles de glucosa y sigue el tratamiento indicado por tu médico.")


class AntecedentesStrategy(FactorStrategy):
    """2 puntos si hay antecedentes familiares."""

    nombre, puntos_maximos = "Antecedentes familiares", 2

    def evaluar(self, d):
        return self._r("Sí" if d.antecedentes_familiares else "No",
                       2 if d.antecedentes_familiares else 0,
                       "Con antecedentes familiares, haz seguimiento médico más frecuente.")


class AlimentacionStrategy(FactorStrategy):
    """0 puntos con alimentación saludable, 1 con regular y 2 con poco saludable."""

    nombre, puntos_maximos = "Alimentación", 2

    def evaluar(self, d):
        p = {Alimentacion.saludable: 0, Alimentacion.regular: 1,
             Alimentacion.poco_saludable: 2}[d.alimentacion]
        return self._r(d.alimentacion.value.replace("_", " "), p,
                       "Aumenta frutas, verduras y granos integrales; reduce ultraprocesados y azúcar.")


class ActividadStrategy(FactorStrategy):
    """0 puntos con nivel activo, 1 con moderado y 2 con sedentario."""

    nombre, puntos_maximos = "Actividad física", 2

    def evaluar(self, d):
        p = {ActividadFisica.activo: 0, ActividadFisica.moderado: 1,
             ActividadFisica.sedentario: 2}[d.actividad]
        return self._r(d.actividad.value, p,
                       "Busca al menos 150 minutos semanales de actividad física moderada.")


def estrategias_por_defecto() -> List[FactorStrategy]:
    """Crea los diez factores de riesgo del cálculo.

    Returns:
        Una instancia de cada estrategia, en el orden en que se muestran.
    """
    return [EdadStrategy(), ImcStrategy(), PresionStrategy(), ColesterolStrategy(),
            TabacoStrategy(), AlcoholStrategy(), DiabetesStrategy(),
            AntecedentesStrategy(), AlimentacionStrategy(), ActividadStrategy()]
