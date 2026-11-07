"""Pruebas de los hábitos alimenticios (cinco preguntas), la clasificación de presión y su historial."""
import os
import tempfile
import unittest

from pydantic import ValidationError

from app.models.database import Database
from app.errors import traducir_errores
from app.models.models import DatosEvaluacion, clasificar_alimentacion
from app.models.presion import clasificar_presion
from app.models.repositories import EvaluacionRepository, UsuarioRepository
from app.models.observers import HistorialObserver
from app.views.report import generar_pdf
from app.models.services import EvaluacionService

from .datos import SANO

CINCO_SANAS = dict(frutas="diariamente", verduras="diariamente", comida_rapida="nunca",
                   bebidas_azucaradas="nunca", agua="mas_de_2_litros")
CINCO_MALAS = dict(frutas="nunca", verduras="nunca", comida_rapida="diariamente",
                   bebidas_azucaradas="diariamente", agua="menos_de_1_litro")


def sin_alimentacion(**kw):
    base = {k: v for k, v in SANO.items() if k != "alimentacion"}
    return {**base, **kw}


class TestAlimentacion(unittest.TestCase):
    def test_clasificacion(self):
        self.assertEqual(clasificar_alimentacion("diariamente", "diariamente", "nunca", "nunca", "mas_de_2_litros"), "saludable")
        self.assertEqual(clasificar_alimentacion("nunca", "nunca", "diariamente", "diariamente", "menos_de_1_litro"), "poco_saludable")

    def test_se_deriva_de_las_cinco_respuestas(self):
        self.assertEqual(DatosEvaluacion(**sin_alimentacion(**CINCO_SANAS)).alimentacion.value, "saludable")
        self.assertEqual(DatosEvaluacion(**sin_alimentacion(**CINCO_MALAS)).alimentacion.value, "poco_saludable")

    def test_incompleta_se_rechaza_con_mensaje(self):
        with self.assertRaises(ValidationError) as ctx:
            DatosEvaluacion(**sin_alimentacion(frutas="nunca"))
        self.assertIn("Responde las cinco preguntas de hábitos alimenticios.", traducir_errores(ctx.exception.errors()))

    def test_valor_directo_sigue_valido(self):
        self.assertEqual(DatosEvaluacion(**SANO).alimentacion.value, "saludable")


class TestPresion(unittest.TestCase):
    def test_clasificacion(self):
        casos = [((120, 80), "elevada"), ((115, 75), "normal"), ((145, 85), "alta"), ((120, 95), "alta"),
                 ((85, 70), "baja"), ((110, 55), "baja"), ((132, 78), "elevada")]
        for (s, d), esperado in casos:
            with self.subTest(s=s, d=d):
                self.assertEqual(clasificar_presion(s, d), esperado)

    def test_historial_de_presiones_por_usuario(self):
        db = Database(os.path.join(tempfile.mkdtemp(), "p.db"))
        usuarios, repo = UsuarioRepository(db), EvaluacionRepository(db)
        u1 = usuarios.crear("Ana", "ana@x.com", "h"); u2 = usuarios.crear("Luis", "luis@x.com", "h")
        srv = EvaluacionService(); srv.suscribir(HistorialObserver(repo))
        srv.evaluar(u1, DatosEvaluacion(**SANO))
        srv.evaluar(u1, DatosEvaluacion(**{**SANO, "presion_sistolica": 150, "presion_diastolica": 95}))
        srv.evaluar(u2, DatosEvaluacion(**SANO))
        p = repo.listar_presiones(u1)
        self.assertEqual([r["estado"] for r in p], ["alta", "normal"])   # más reciente primero
        self.assertEqual(len(repo.listar_presiones(u2)), 1)


class TestPdfNuevo(unittest.TestCase):
    def test_pdf_con_cinco_respuestas(self):
        d = DatosEvaluacion(**sin_alimentacion(**CINCO_MALAS))
        r = EvaluacionService().evaluar(1, d)
        pdf = generar_pdf("Sara", r.model_dump(), d.model_dump(mode="json"))
        self.assertTrue(pdf.startswith(b"%PDF"))


if __name__ == "__main__":
    unittest.main()
