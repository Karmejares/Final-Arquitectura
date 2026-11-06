"""Clasificación de la presión arterial (HU-09).

Se usa tanto en la alerta que se muestra al evaluar (AlertaPresionObserver) como en
la tabla de registros de presión, para que el criterio esté definido en un solo lugar.
"""


def clasificar_presion(sistolica: int, diastolica: int) -> str:
    """Devuelve 'alta', 'elevada', 'baja' o 'normal' (valores en mmHg)."""
    if sistolica >= 140 or diastolica >= 90:
        return "alta"
    if sistolica >= 130 or diastolica >= 80:
        return "elevada"
    if sistolica < 90 or diastolica < 60:
        return "baja"
    return "normal"
