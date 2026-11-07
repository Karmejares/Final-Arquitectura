"""Pruebas del servicio de historial, del usuario de la sesión y de la separación MVC por capas."""
import ast
import os
import tempfile
import unittest
from pathlib import Path

from app.database import Database
from app.models import DatosEvaluacion
from app.observers import AlertaPresionObserver, HistorialObserver
from app.repositories import EvaluacionRepository, UsuarioRepository
from app.security import TokenService
from app.services import (AuthService, EvaluacionNoEncontrada, EvaluacionService,
                          HistorialService)

from .datos import RIESGOSO, SANO

RAIZ_APP = Path(__file__).resolve().parent.parent / "app"


class TestHistorialService(unittest.TestCase):
    def setUp(self):
        db = Database(os.path.join(tempfile.mkdtemp(), "h.db"))
        usuarios = UsuarioRepository(db)
        repo = EvaluacionRepository(db)
        self.ana = usuarios.crear("Ana", "ana@correo.com", "hash")
        self.luis = usuarios.crear("Luis", "luis@correo.com", "hash")
        evaluador = EvaluacionService()
        evaluador.suscribir(AlertaPresionObserver())
        evaluador.suscribir(HistorialObserver(repo))
        self.evaluador = evaluador
        self.historial = HistorialService(repo)

    def evaluar(self, usuario_id, perfil):
        return self.evaluador.evaluar(usuario_id, DatosEvaluacion(**perfil))

    def test_listar_solo_lo_del_usuario_y_lo_mas_reciente_primero(self):
        primera = self.evaluar(self.ana, SANO)
        segunda = self.evaluar(self.ana, RIESGOSO)
        self.evaluar(self.luis, SANO)
        ids = [f["id"] for f in self.historial.listar(self.ana)]
        self.assertEqual(ids, [segunda.id, primera.id])
        self.assertEqual(len(self.historial.listar(self.luis)), 1)

    def test_listar_vacio_para_usuario_sin_evaluaciones(self):
        self.assertEqual(self.historial.listar(self.luis), [])

    def test_obtener_devuelve_datos_y_resultado_con_id(self):
        r = self.evaluar(self.ana, RIESGOSO)
        fila = self.historial.obtener(self.ana, r.id)
        self.assertEqual(fila["resultado"]["id"], r.id)
        self.assertEqual(fila["resultado"]["color"], "rojo")
        self.assertEqual(fila["datos"]["presion_sistolica"], 160)

    def test_obtener_de_otro_usuario_o_inexistente_lanza_la_misma_excepcion(self):
        r = self.evaluar(self.ana, SANO)
        with self.assertRaises(EvaluacionNoEncontrada):
            self.historial.obtener(self.luis, r.id)        # existe, pero es de Ana
        with self.assertRaises(EvaluacionNoEncontrada):
            self.historial.obtener(self.ana, 9999)         # no existe

    def test_presiones_clasifica_cada_evaluacion(self):
        self.evaluar(self.ana, SANO)
        self.evaluar(self.ana, RIESGOSO)
        estados = [p["estado"] for p in self.historial.presiones(self.ana)]
        self.assertEqual(estados, ["alta", "normal"])      # del más reciente al más antiguo
        self.assertEqual(self.historial.presiones(self.luis), [])


class TestUsuarioDesdeToken(unittest.TestCase):
    def setUp(self):
        db = Database(os.path.join(tempfile.mkdtemp(), "t.db"))
        self.tokens = TokenService("secreto-de-prueba", 15)
        self.auth = AuthService(UsuarioRepository(db), self.tokens)
        self.uid = self.auth.registrar("Sara", "sara@correo.com", "clave12345")

    def test_token_valido_devuelve_al_usuario(self):
        token, _ = self.auth.iniciar_sesion("sara@correo.com", "clave12345")
        usuario = self.auth.usuario_desde_token(token)
        self.assertEqual(usuario["id"], self.uid)
        self.assertEqual(usuario["nombre"], "Sara")

    def test_token_invalido_vencido_o_de_usuario_inexistente_devuelve_none(self):
        self.assertIsNone(self.auth.usuario_desde_token("no.es.un.token"))
        vencido = TokenService("secreto-de-prueba", -1).crear(self.uid)
        self.assertIsNone(self.auth.usuario_desde_token(vencido))
        self.assertIsNone(self.auth.usuario_desde_token(self.tokens.crear(9999)))


class TestSeparacionMVC(unittest.TestCase):
    """Los controladores (routers) y el contenedor no pueden depender de los repositorios:
    todo pasa por un servicio. Se revisa el código fuente, así que no necesita FastAPI."""

    @staticmethod
    def _importa_repositorios(ruta: Path) -> bool:
        return TestSeparacionMVC._toca_repositorios(ruta.read_text(encoding="utf-8"))

    @staticmethod
    def _toca_repositorios(codigo: str) -> bool:
        """True si el código importa un repositorio o accede a uno (p. ej. `c.evaluaciones_repo`)."""
        arbol = ast.parse(codigo)
        for nodo in ast.walk(arbol):
            if isinstance(nodo, ast.Attribute) and "repo" in nodo.attr.lower():
                return True
            if isinstance(nodo, ast.ImportFrom) and nodo.module:
                if nodo.module.split(".")[-1] == "repositories":
                    return True
                if any(a.name in ("EvaluacionRepository", "UsuarioRepository") for a in nodo.names):
                    return True
            if isinstance(nodo, ast.Import) and any("repositories" in a.name for a in nodo.names):
                return True
        return False

    def test_routers_y_contenedor_no_importan_repositorios(self):
        archivos = sorted((RAIZ_APP / "routers").glob("*.py")) + [RAIZ_APP / "container.py"]
        self.assertGreaterEqual(len(archivos), 3)
        for ruta in archivos:
            with self.subTest(archivo=ruta.name):
                self.assertFalse(self._importa_repositorios(ruta),
                                 f"{ruta.name} no debe importar repositorios")

    def test_solo_los_repositorios_contienen_sql(self):
        for ruta in sorted(RAIZ_APP.rglob("*.py")):
            if ruta.name in ("repositories.py", "database.py"):
                continue
            texto = ruta.read_text(encoding="utf-8").upper()
            with self.subTest(archivo=str(ruta.relative_to(RAIZ_APP))):
                self.assertNotIn("SELECT ", texto)
                self.assertNotIn("INSERT INTO", texto)


if __name__ == "__main__":
    unittest.main()
