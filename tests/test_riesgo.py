"""Pruebas de los tres patrones, la nutrición y las validaciones."""
import os
import tempfile
import unittest

from app.models.database import Database
from app.errors import traducir_errores
from app.models.factory import NivelRiesgoFactory, RiesgoAlto, RiesgoBajo, RiesgoMedio
from app.models.models import DatosEvaluacion
from app.models.nutrition import calcular_nutricion
from app.models.observers import AlertaPresionObserver, HistorialObserver
from app.models.repositories import EvaluacionRepository, UsuarioRepository
from app.models.services import CalculadorRiesgo, EvaluacionService
from app.models.strategies import FactorStrategy, TabacoStrategy
from pydantic import ValidationError

from .datos import RIESGOSO, SANO


def datos(**kw):
    return DatosEvaluacion(**{**SANO, **kw})


class TestStrategy(unittest.TestCase):
    def test_perfil_sano_puntaje_cero(self):
        self.assertEqual(CalculadorRiesgo().calcular(datos())[0], 0)

    def test_perfil_riesgoso_puntaje_maximo(self):
        c = CalculadorRiesgo()
        self.assertEqual(c.calcular(DatosEvaluacion(**RIESGOSO))[0], c.puntaje_maximo)
        self.assertEqual(c.puntaje_maximo, 23)

    def test_nueva_estrategia_sin_modificar_el_calculador(self):
        class Extra(FactorStrategy):
            nombre, puntos_maximos = "Extra", 5

            def evaluar(self, d):
                return self._r("x", 5)

        self.assertEqual(CalculadorRiesgo([TabacoStrategy(), Extra()]).calcular(datos(fuma=True))[0], 8)


class TestFactory(unittest.TestCase):
    def test_umbrales(self):
        casos = [(0, RiesgoBajo, "verde"), (6, RiesgoBajo, "verde"), (7, RiesgoMedio, "amarillo"),
                 (12, RiesgoMedio, "amarillo"), (13, RiesgoAlto, "rojo"), (23, RiesgoAlto, "rojo")]
        for puntaje, clase, color in casos:
            with self.subTest(puntaje=puntaje):
                nivel = NivelRiesgoFactory.crear(puntaje)
                self.assertIsInstance(nivel, clase)
                self.assertEqual(nivel.color, color)


class TestObserver(unittest.TestCase):
    def setUp(self):
        self.db = Database(os.path.join(tempfile.mkdtemp(), "t.db"))
        self.usuarios = UsuarioRepository(self.db)
        self.repo = EvaluacionRepository(self.db)
        self.uid = self.usuarios.crear("Ana", "ana@correo.com", "hash")

    def servicio(self):
        s = EvaluacionService()
        s.suscribir(AlertaPresionObserver())
        s.suscribir(HistorialObserver(self.repo))
        return s

    def test_alerta_de_presion(self):
        s = self.servicio()
        self.assertTrue(s.evaluar(self.uid, datos(presion_sistolica=150, presion_diastolica=95)).alertas)
        self.assertFalse(s.evaluar(self.uid, datos()).alertas)

    def test_guarda_automaticamente_con_alertas(self):
        r = self.servicio().evaluar(self.uid, DatosEvaluacion(**RIESGOSO))
        self.assertIsNotNone(r.id)
        guardada = self.repo.obtener(self.uid, r.id)["resultado"]
        self.assertEqual(guardada["nivel"], "alto")
        self.assertEqual(guardada["alertas"], r.alertas)
        self.assertEqual(len(self.repo.listar(self.uid)), 1)

    def test_historial_solo_del_propio_usuario(self):
        otro = self.usuarios.crear("Luis", "luis@correo.com", "hash")
        r = self.servicio().evaluar(self.uid, datos())
        self.assertIsNone(self.repo.obtener(otro, r.id))
        self.assertEqual(self.repo.listar(otro), [])


class TestNutricion(unittest.TestCase):
    def test_macros_coherentes_con_calorias(self):
        n = calcular_nutricion(datos())
        kcal = n.proteinas_g * 4 + n.grasas_g * 9 + n.carbohidratos_g * 4
        self.assertLess(abs(kcal - n.calorias), 12)
        self.assertGreater(n.calorias, 1200)

    def test_mas_actividad_mas_calorias(self):
        self.assertGreater(calcular_nutricion(datos(actividad="activo")).calorias,
                           calcular_nutricion(datos(actividad="sedentario")).calorias)


class TestValidacion(unittest.TestCase):
    def test_datos_invalidos(self):
        malos = [dict(peso_kg=-5), dict(presion_sistolica=70, presion_diastolica=80),
                 dict(colesterol_hdl=300), dict(anio_nacimiento=2015)]
        for cambio in malos:
            with self.subTest(cambio=cambio):
                with self.assertRaises(ValidationError):
                    datos(**cambio)

    def test_mensajes_en_espanol(self):
        try:
            datos(peso_kg=-5)
        except ValidationError as e:
            msgs = traducir_errores(e.errors())
        self.assertEqual(msgs, ["Peso (kg): debe ser mayor que 20"])
        try:
            DatosEvaluacion(**{**SANO, "peso_kg": None})
        except ValidationError as e:
            self.assertEqual(traducir_errores(e.errors()), ["Peso (kg): es obligatorio"])
        try:
            datos(presion_sistolica=70, presion_diastolica=80)
        except ValidationError as e:
            self.assertEqual(traducir_errores(e.errors()),
                             ["La presión sistólica debe ser mayor que la diastólica."])


if __name__ == "__main__":
    unittest.main()
