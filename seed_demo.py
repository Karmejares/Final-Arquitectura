"""Carga un usuario y tres evaluaciones de ejemplo para la demostración.

Usuario:    demo@cardioprev.com
Contraseña: Demo12345

Es seguro ejecutarlo varias veces: no duplica el usuario ni las evaluaciones.
Se ejecuta desde la carpeta del proyecto:  python seed_demo.py
"""
from app import config
from app.database import Database
from app.models import DatosEvaluacion
from app.observers import AlertaPresionObserver, HistorialObserver
from app.repositories import EvaluacionRepository, UsuarioRepository
from app.security import hashear_password
from app.services import EvaluacionService

CORREO = "demo@cardioprev.com"
PASSWORD = "Demo12345"

PERFIL_ALTO = dict(anio_nacimiento=1958, genero="masculino", peso_kg=108, altura_cm=170,
                   alimentacion="poco_saludable", actividad="sedentario", fuma=True,
                   consume_alcohol=True, diabetes=True, antecedentes_familiares=True,
                   presion_sistolica=160, presion_diastolica=100,
                   colesterol_total=260, colesterol_hdl=35)

PERFIL_MEDIO = dict(anio_nacimiento=1980, genero="femenino", peso_kg=80, altura_cm=170,
                    alimentacion="regular", actividad="moderado", fuma=False,
                    consume_alcohol=True, diabetes=False, antecedentes_familiares=True,
                    presion_sistolica=125, presion_diastolica=82,
                    colesterol_total=210, colesterol_hdl=45)

PERFIL_SANO = dict(anio_nacimiento=2000, genero="femenino", peso_kg=60, altura_cm=165,
                   alimentacion="saludable", actividad="activo", fuma=False,
                   consume_alcohol=False, diabetes=False, antecedentes_familiares=False,
                   presion_sistolica=110, presion_diastolica=70,
                   colesterol_total=170, colesterol_hdl=60)


def main() -> None:
    db = Database(config.DB_PATH)
    usuarios = UsuarioRepository(db)
    evaluaciones = EvaluacionRepository(db)

    usuario = usuarios.por_correo(CORREO)
    uid = usuario["id"] if usuario else usuarios.crear(
        "Usuario Demo", CORREO, hashear_password(PASSWORD))

    if evaluaciones.listar(uid):
        print("Los datos de demostración ya existen.")
    else:
        # Mismo cableado que create_app: la alerta primero, el historial después.
        servicio = EvaluacionService()
        servicio.suscribir(AlertaPresionObserver())
        servicio.suscribir(HistorialObserver(evaluaciones))
        for perfil in (PERFIL_ALTO, PERFIL_MEDIO, PERFIL_SANO):
            r = servicio.evaluar(uid, DatosEvaluacion(**perfil))
            print(f"  evaluación {r.id}: riesgo {r.nivel} ({r.color}), {r.puntaje} puntos")
        print("Datos de demostración creados.")

    print(f"\nUsuario: {CORREO}   Contraseña: {PASSWORD}")


if __name__ == "__main__":
    main()
