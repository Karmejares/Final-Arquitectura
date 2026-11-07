"""Modelos de datos: validación de entrada (HU-18) y estructura de salida.

Cubre HU-01/02 (cuenta), HU-03/04 (datos personales), HU-05/06 (hábitos),
HU-08 (antecedentes) y HU-09/10 (información clínica).
"""
from __future__ import annotations

from datetime import date
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

CORREO_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


# ----------------------------------------------------------------- cuenta ---
class RegistroIn(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=80)
    correo: str = Field(..., pattern=CORREO_REGEX, max_length=120)
    password: str = Field(..., min_length=8, max_length=72)

    @field_validator("nombre", "correo", mode="before")
    @classmethod
    def _limpiar(cls, v):
        return v.strip() if isinstance(v, str) else v


class LoginIn(BaseModel):
    correo: str = Field(..., min_length=3, max_length=120)
    password: str = Field(..., min_length=1, max_length=72)


class TokenOut(BaseModel):
    token: str
    nombre: str


# ------------------------------------------------------------ evaluación ---
class Genero(str, Enum):
    masculino = "masculino"
    femenino = "femenino"
    otro = "otro"


class Alimentacion(str, Enum):
    saludable = "saludable"
    regular = "regular"
    poco_saludable = "poco_saludable"


class ActividadFisica(str, Enum):
    sedentario = "sedentario"
    moderado = "moderado"
    activo = "activo"


class Frecuencia(str, Enum):
    nunca = "nunca"
    ocasionalmente = "ocasionalmente"
    diariamente = "diariamente"


class ConsumoAgua(str, Enum):
    menos_de_1_litro = "menos_de_1_litro"
    de_1_a_2_litros = "de_1_a_2_litros"
    mas_de_2_litros = "mas_de_2_litros"


# Puntos de "mala alimentación" por respuesta (0 = mejor, 2 = peor).
_FRUTAS_VERDURAS = {Frecuencia.diariamente: 0, Frecuencia.ocasionalmente: 1, Frecuencia.nunca: 2}
_COMIDA_RAPIDA_BEBIDAS = {Frecuencia.nunca: 0, Frecuencia.ocasionalmente: 1, Frecuencia.diariamente: 2}
_AGUA = {ConsumoAgua.mas_de_2_litros: 0, ConsumoAgua.de_1_a_2_litros: 1, ConsumoAgua.menos_de_1_litro: 2}


def clasificar_alimentacion(frutas: Frecuencia, verduras: Frecuencia, comida_rapida: Frecuencia,
                            bebidas_azucaradas: Frecuencia, agua: ConsumoAgua) -> Alimentacion:
    """Resume las cinco preguntas de hábitos alimenticios en saludable, regular o poco saludable."""
    puntos = (_FRUTAS_VERDURAS[frutas] + _FRUTAS_VERDURAS[verduras]
              + _COMIDA_RAPIDA_BEBIDAS[comida_rapida] + _COMIDA_RAPIDA_BEBIDAS[bebidas_azucaradas]
              + _AGUA[agua])                       # 0 a 10
    if puntos <= 3:
        return Alimentacion.saludable
    if puntos <= 6:
        return Alimentacion.regular
    return Alimentacion.poco_saludable


class DatosEvaluacion(BaseModel):
    """Datos que ingresa el usuario. La edad y el IMC NO se piden (HU-04).

    Hábitos alimenticios: se envían las cinco respuestas (frutas, verduras, comida rápida,
    bebidas azucaradas y agua) y `alimentacion` se calcula a partir de ellas; también se
    acepta enviar solo `alimentacion` (saludable, regular o poco_saludable).
    """

    anio_nacimiento: int = Field(..., ge=1900, le=date.today().year)
    genero: Genero
    peso_kg: float = Field(..., gt=20, lt=400)
    altura_cm: float = Field(..., gt=80, lt=250)
    alimentacion: Optional[Alimentacion] = None
    frutas: Optional[Frecuencia] = None
    verduras: Optional[Frecuencia] = None
    comida_rapida: Optional[Frecuencia] = None
    bebidas_azucaradas: Optional[Frecuencia] = None
    agua: Optional[ConsumoAgua] = None
    actividad: ActividadFisica
    fuma: bool
    consume_alcohol: bool
    diabetes: bool
    antecedentes_familiares: bool
    presion_sistolica: int = Field(..., ge=50, le=260)
    presion_diastolica: int = Field(..., ge=30, le=160)
    colesterol_total: float = Field(..., gt=50, lt=600)
    colesterol_hdl: float = Field(..., gt=10, lt=200)

    @model_validator(mode="after")
    def _coherencia(self) -> "DatosEvaluacion":
        detalle = [self.frutas, self.verduras, self.comida_rapida, self.bebidas_azucaradas, self.agua]
        if all(x is not None for x in detalle):
            self.alimentacion = clasificar_alimentacion(*detalle)
        elif self.alimentacion is None or any(x is not None for x in detalle):
            raise ValueError("Responde las cinco preguntas de hábitos alimenticios.")
        if self.presion_sistolica <= self.presion_diastolica:
            raise ValueError("La presión sistólica debe ser mayor que la diastólica.")
        if self.colesterol_hdl > self.colesterol_total:
            raise ValueError("El colesterol HDL no puede superar al colesterol total.")
        if date.today().year - self.anio_nacimiento < 18:
            raise ValueError("CardioPrev está dirigido a personas adultas (18 años o más).")
        return self

    # Valores derivados (HU-04): el usuario no los ingresa.
    @property
    def edad(self) -> int:
        return date.today().year - self.anio_nacimiento

    @property
    def imc(self) -> float:
        return round(self.peso_kg / ((self.altura_cm / 100) ** 2), 1)


class FactorResultado(BaseModel):
    factor: str
    valor: str
    puntos: int
    recomendacion: Optional[str] = None


class Nutricion(BaseModel):
    """HU-07: calorías y macronutrientes estimados (gramos por día)."""
    calorias: int
    proteinas_g: int
    grasas_g: int
    carbohidratos_g: int


class ResultadoEvaluacion(BaseModel):
    id: Optional[int] = None
    fecha: str
    edad: int
    imc: float
    puntaje: int
    puntaje_maximo: int
    nivel: str          # bajo | medio | alto
    color: str          # verde | amarillo | rojo
    mensaje: str
    factores: List[FactorResultado]
    recomendaciones: List[str]
    alertas: List[str]
    nutricion: Optional[Nutricion] = None
    aviso: str
