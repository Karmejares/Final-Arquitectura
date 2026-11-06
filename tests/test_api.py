"""Pruebas de extremo a extremo de la API (requieren fastapi y httpx instalados)."""
import os
import tempfile
import unittest

try:
    from fastapi.testclient import TestClient
    from app.main import create_app
    HAY_FASTAPI = True
except ImportError:          # pragma: no cover
    HAY_FASTAPI = False

from .datos import RIESGOSO, SANO

REG = {"nombre": "Sara", "correo": "sara@correo.com", "password": "clave12345"}


@unittest.skipUnless(HAY_FASTAPI, "fastapi/httpx no instalados")
class TestApi(unittest.TestCase):
    def setUp(self):
        self.c = TestClient(create_app(db_path=os.path.join(tempfile.mkdtemp(), "api.db"),
                                       secreto="test"))

    def entrar(self, reg=REG):
        self.c.post("/api/auth/registro", json=reg)
        r = self.c.post("/api/auth/login", json={"correo": reg["correo"], "password": reg["password"]})
        return {"Authorization": "Bearer " + r.json()["token"]}

    def test_registro_login_y_errores(self):
        self.assertEqual(self.c.post("/api/auth/registro", json=REG).status_code, 201)
        self.assertEqual(self.c.post("/api/auth/registro", json=REG).status_code, 409)
        malo = self.c.post("/api/auth/registro", json={**REG, "correo": "x", "password": "123"})
        self.assertEqual(malo.status_code, 422)
        self.assertTrue(all(isinstance(m, str) for m in malo.json()["detail"]))
        self.assertEqual(self.c.post("/api/auth/login", json={"correo": REG["correo"], "password": "mala"}).status_code, 401)
        self.assertEqual(self.c.post("/api/auth/login", json={"correo": REG["correo"], "password": REG["password"]}).status_code, 200)

    def test_endpoints_protegidos(self):
        self.assertEqual(self.c.get("/api/evaluaciones").status_code, 401)
        self.assertEqual(self.c.post("/api/evaluaciones", json=SANO).status_code, 401)
        self.assertEqual(self.c.get("/api/evaluaciones", headers={"Authorization": "Bearer falso"}).status_code, 401)

    def test_historial_de_presiones(self):
        h = self.entrar()
        self.c.post("/api/evaluaciones", json=RIESGOSO, headers=h)
        r = self.c.get("/api/evaluaciones/presiones", headers=h)   # no debe confundirse con /{id}
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()[0]["estado"], "alta")
        self.assertEqual(self.c.get("/api/evaluaciones/presiones").status_code, 401)

    def test_flujo_completo_y_renovacion_de_token(self):
        h = self.entrar()
        r = self.c.post("/api/evaluaciones", json=RIESGOSO, headers=h)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["color"], "rojo")
        self.assertTrue(r.json()["alertas"] and r.json()["nutricion"])
        self.assertIn("x-token-renovado", r.headers)
        self.assertEqual(len(self.c.get("/api/evaluaciones", headers=h).json()), 1)
        self.assertEqual(self.c.get(f"/api/evaluaciones/{r.json()['id']}", headers=h).status_code, 200)

    def test_validacion_en_espanol(self):
        h = self.entrar()
        r = self.c.post("/api/evaluaciones", json={**SANO, "peso_kg": -1}, headers=h)
        self.assertEqual(r.status_code, 422)
        self.assertEqual(r.json()["detail"], ["Peso (kg): debe ser mayor que 20"])

    def test_aislamiento_entre_usuarios(self):
        h1 = self.entrar()
        h2 = self.entrar({"nombre": "Luis", "correo": "luis@correo.com", "password": "clave12345"})
        id_ = self.c.post("/api/evaluaciones", json=SANO, headers=h1).json()["id"]
        self.assertEqual(self.c.get("/api/evaluaciones", headers=h2).json(), [])
        self.assertEqual(self.c.get(f"/api/evaluaciones/{id_}", headers=h2).status_code, 404)
        self.assertEqual(self.c.get(f"/api/evaluaciones/{id_}/pdf", headers=h2).status_code, 404)

    def test_pdf(self):
        h = self.entrar()
        id_ = self.c.post("/api/evaluaciones", json=SANO, headers=h).json()["id"]
        r = self.c.get(f"/api/evaluaciones/{id_}/pdf", headers=h)
        self.assertEqual(r.headers["content-type"], "application/pdf")
        self.assertTrue(r.content.startswith(b"%PDF"))

    def test_pagina_principal(self):
        self.assertEqual(self.c.get("/").status_code, 200)
        self.assertEqual(self.c.get("/static/js/app.js").status_code, 200)


if __name__ == "__main__":
    unittest.main()
