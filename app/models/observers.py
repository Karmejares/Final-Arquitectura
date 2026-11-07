"""PATRÓN OBSERVER (HU-09, HU-14).

Rol del patrón:
  - Subject ................... EvaluacionService (app/models/services.py): suscribir / _notificar
  - Observer (interfaz) ....... EvaluacionObserver
  - ConcreteObserver .......... AlertaPresionObserver, HistorialObserver

Al terminar una evaluación el servicio notifica a sus observadores sin saber qué hace
cada uno. Agregar un efecto nuevo (p. ej. enviar un correo) es crear otro observador y
suscribirlo; EvaluacionService no se modifica.

IMPORTANTE: el orden de suscripción importa. AlertaPresionObserver se suscribe antes que
HistorialObserver para que las alertas queden incluidas en lo que se guarda.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from .models import DatosEvaluacion, ResultadoEvaluacion
from .presion import clasificar_presion
from .repositories import EvaluacionRepository


class EvaluacionObserver(ABC):
    """Observer: efecto que se ejecuta al terminar una evaluación."""

    @abstractmethod
    def actualizar(self, usuario_id: int, datos: DatosEvaluacion,
                   resultado: ResultadoEvaluacion) -> None:
        """Reacciona a una evaluación terminada; puede modificar el resultado.

        Args:
            usuario_id: id del usuario evaluado.
            datos: datos que ingresó el usuario.
            resultado: resultado calculado.
        """


class AlertaPresionObserver(EvaluacionObserver):
    """HU-09: agrega una alerta cuando la presión está fuera del rango normal."""

    def actualizar(self, usuario_id, datos, resultado):
        s, d = datos.presion_sistolica, datos.presion_diastolica
        estado = clasificar_presion(s, d)
        if estado == "alta":
            resultado.alertas.append(
                f"Presión arterial alta ({s}/{d} mmHg): consulta a un médico.")
        elif estado == "elevada":
            resultado.alertas.append(
                f"Presión arterial elevada ({s}/{d} mmHg): vigílala y consulta si persiste.")
        elif estado == "baja":
            resultado.alertas.append(
                f"Presión arterial baja ({s}/{d} mmHg): consulta si tienes síntomas.")


class HistorialObserver(EvaluacionObserver):
    """HU-14: guarda automáticamente la evaluación del usuario y asigna ``resultado.id``."""

    def __init__(self, repositorio: EvaluacionRepository):
        """Recibe dónde se guardan las evaluaciones.

        Args:
            repositorio: repositorio de evaluaciones.
        """
        self._repo = repositorio

    def actualizar(self, usuario_id, datos, resultado):
        resultado.id = self._repo.guardar(usuario_id, datos, resultado)
