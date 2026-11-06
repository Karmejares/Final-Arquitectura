"""Traduce los errores de validación de Pydantic a mensajes claros en español (HU-18)."""
from __future__ import annotations

from typing import Dict, List

ETIQUETAS: Dict[str, str] = {
    "nombre": "Nombre", "correo": "Correo", "password": "Contraseña",
    "anio_nacimiento": "Año de nacimiento", "genero": "Género",
    "peso_kg": "Peso (kg)", "altura_cm": "Altura (cm)",
    "alimentacion": "Alimentación", "actividad": "Actividad física",
    "frutas": "Frutas", "verduras": "Verduras", "comida_rapida": "Comida rápida",
    "bebidas_azucaradas": "Bebidas azucaradas", "agua": "Consumo de agua",
    "fuma": "¿Fuma?", "consume_alcohol": "Consumo de alcohol",
    "diabetes": "Diabetes", "antecedentes_familiares": "Antecedentes familiares",
    "presion_sistolica": "Presión sistólica", "presion_diastolica": "Presión diastólica",
    "colesterol_total": "Colesterol total", "colesterol_hdl": "Colesterol HDL",
}


def _num(v) -> str:
    return f"{v:g}" if isinstance(v, (int, float)) else str(v)


def _mensaje(err: dict) -> str:
    tipo = err.get("type", "")
    ctx = err.get("ctx") or {}
    if err.get("input") is None and tipo != "value_error":
        return "es obligatorio"
    if tipo == "missing":
        return "es obligatorio"
    if tipo == "greater_than":
        return f"debe ser mayor que {_num(ctx.get('gt'))}"
    if tipo == "greater_than_equal":
        return f"debe ser mayor o igual a {_num(ctx.get('ge'))}"
    if tipo == "less_than":
        return f"debe ser menor que {_num(ctx.get('lt'))}"
    if tipo == "less_than_equal":
        return f"debe ser menor o igual a {_num(ctx.get('le'))}"
    if tipo == "string_too_short":
        return f"debe tener al menos {ctx.get('min_length')} caracteres"
    if tipo == "string_too_long":
        return f"no puede superar {ctx.get('max_length')} caracteres"
    if tipo == "string_pattern_mismatch":
        return "no tiene un formato válido"
    if tipo == "enum":
        return "no es una opción válida"
    if tipo == "value_error":
        return str(err.get("msg", "")).replace("Value error, ", "")
    if tipo.endswith("_parsing") or tipo.endswith("_type"):
        return "no tiene un formato válido"
    return "contiene un valor no válido"


def traducir_errores(errores: List[dict]) -> List[str]:
    mensajes = []
    for e in errores:
        campo = next((str(p) for p in reversed(e.get("loc", ())) if str(p) in ETIQUETAS), None)
        texto = _mensaje(e)
        mensajes.append(f"{ETIQUETAS[campo]}: {texto}" if campo else texto[:1].upper() + texto[1:])
    return mensajes
