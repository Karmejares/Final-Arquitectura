"""Pruebas de seguridad, registro/login y generación del PDF."""
import os
import tempfile
import time
import unittest

from app.models.database import Database
from app.models.models import DatosEvaluacion, RegistroIn
from app.views.report import generar_pdf
from app.models.repositories import UsuarioRepository
from app.models.security import TokenService, hashear_password, verificar_password
from app.models.services import (AuthService, CorreoYaRegistrado, CredencialesInvalidas,
                          EvaluacionService)
from pydantic import ValidationError

from .datos import RIESGOSO, SANO


class TestSeguridad(unittest.TestCase):
    def test_hash_no_es_texto_plano_y_verifica(self):
        h = hashear_password("MiClave123")
        self.assertNotIn("MiClave123", h)
        self.assertTrue(verificar_password("MiClave123", h))
        self.assertFalse(verificar_password("otra", h))
        self.assertNotEqual(h, hashear_password("MiClave123"))   # sal distinta

    def test_hash_corrupto_no_verifica(self):
        self.assertFalse(verificar_password("x", "basura"))

    def test_token_valido_invalido_y_expirado(self):
        t = TokenService("secreto", 15)
        self.assertEqual(t.decodificar(t.crear(7)), {"uid": 7})
        self.assertIsNone(t.decodificar("no.es.un.token"))
        self.assertIsNone(TokenService("otro-secreto", 15).decodificar(t.crear(7)))
        vencido = TokenService("secreto", -1)
        self.assertIsNone(t.decodificar(vencido.crear(7)))


class TestAuthService(unittest.TestCase):
    def setUp(self):
        db = Database(os.path.join(tempfile.mkdtemp(), "a.db"))
        self.auth = AuthService(UsuarioRepository(db), TokenService("s", 15))

    def test_registro_y_login(self):
        self.auth.registrar("Sara", "Sara@Correo.com", "clave12345")
        token, nombre = self.auth.iniciar_sesion("sara@correo.com", "clave12345")
        self.assertEqual(nombre, "Sara")
        self.assertTrue(token)

    def test_correo_duplicado(self):
        self.auth.registrar("Sara", "sara@correo.com", "clave12345")
        with self.assertRaises(CorreoYaRegistrado):
            self.auth.registrar("Otra", "SARA@correo.com", "clave12345")

    def test_credenciales_incorrectas(self):
        self.auth.registrar("Sara", "sara@correo.com", "clave12345")
        with self.assertRaises(CredencialesInvalidas):
            self.auth.iniciar_sesion("sara@correo.com", "mala")
        with self.assertRaises(CredencialesInvalidas):
            self.auth.iniciar_sesion("noexiste@correo.com", "clave12345")

    def test_validacion_de_registro(self):
        for malo in [dict(correo="sin-arroba"), dict(password="corta"), dict(nombre=" ")]:
            with self.subTest(malo=malo):
                with self.assertRaises(ValidationError):
                    RegistroIn(**{**dict(nombre="Sara", correo="a@b.co", password="clave12345"), **malo})


class TestPdf(unittest.TestCase):
    def test_genera_pdf_valido(self):
        r = EvaluacionService().evaluar(1, DatosEvaluacion(**RIESGOSO)).model_dump()
        r["id"] = 1
        pdf = generar_pdf("Sara <Henao> & Cía", r, RIESGOSO)   # caracteres especiales
        self.assertTrue(pdf.startswith(b"%PDF"))
        self.assertGreater(len(pdf), 2000)

    def test_pdf_perfil_sano_sin_alertas(self):
        r = EvaluacionService().evaluar(1, DatosEvaluacion(**SANO)).model_dump()
        self.assertTrue(generar_pdf("Ana", r, SANO).startswith(b"%PDF"))


if __name__ == "__main__":
    unittest.main()
