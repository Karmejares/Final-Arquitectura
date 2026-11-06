"""HU-07: cálculo automático de calorías y macronutrientes.

Calorías: ecuación de Mifflin-St Jeor (tasa metabólica basal) x factor de actividad.
Reparto de macros: 20 % proteínas, 30 % grasas, 50 % carbohidratos.
Es una estimación general, no una prescripción dietética.
"""
from .models import ActividadFisica, DatosEvaluacion, Genero, Nutricion

FACTOR_ACTIVIDAD = {ActividadFisica.sedentario: 1.2,
                    ActividadFisica.moderado: 1.55,
                    ActividadFisica.activo: 1.725}
AJUSTE_GENERO = {Genero.masculino: 5, Genero.femenino: -161, Genero.otro: -78}


def calcular_nutricion(d: DatosEvaluacion) -> Nutricion:
    tmb = 10 * d.peso_kg + 6.25 * d.altura_cm - 5 * d.edad + AJUSTE_GENERO[d.genero]
    kcal = round(tmb * FACTOR_ACTIVIDAD[d.actividad])
    return Nutricion(
        calorias=kcal,
        proteinas_g=round(kcal * 0.20 / 4),     # 4 kcal por gramo
        grasas_g=round(kcal * 0.30 / 9),        # 9 kcal por gramo
        carbohidratos_g=round(kcal * 0.50 / 4))
