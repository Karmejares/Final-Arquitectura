"""Clasificación de la presión arterial (HU-09).

Se usa tanto en la alerta que se muestra al evaluar (AlertaPresionObserver) como en
la tabla de registros de presión, para que el criterio esté definido en un solo lugar.
"""


def clasificar_presion(sistolica: int, diastolica: int) -> str:
    """Clasifica una medición de presión arterial (sistólica/diastólica).

    Args:
        sistolica: presión sistólica en mmHg.
        diastolica: presión diastólica en mmHg.

    Returns:
        'alta' (desde 140 o desde 90), 'elevada' (desde 130 o desde 80),
        'baja' (menos de 90 o menos de 60) o 'normal'.
    """
    if sistolica >= 140 or diastolica >= 90:
        return "alta"
    if sistolica >= 130 or diastolica >= 80:
        return "elevada"
    if sistolica < 90 or diastolica < 60:
        return "baja"
    return "normal"
