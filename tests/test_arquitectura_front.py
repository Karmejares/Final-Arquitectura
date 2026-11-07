"""Pruebas de arquitectura del FRONT (MVC): la Vista dibuja, el Controlador decide.

Leen el código TypeScript como texto; no necesitan Node ni FastAPI.
"""
import re
import unittest
from pathlib import Path

SRC = Path(__file__).resolve().parent.parent / "front" / "src"


def importados(archivo: Path) -> list:
    return re.findall(r"from\s+'([^']+)'", archivo.read_text(encoding="utf-8"))


class TestVistasPasivas(unittest.TestCase):
    """Una vista no consulta la API, no navega, no muestra avisos ni maneja errores: eso es del controlador."""

    PROHIBIDOS = ("contratos/Api", "datos/Api", "ApiError", "interfaz/Navegador", "interfaz/Avisos",
                  "interfaz/ManejadorErrores", "servicios/")

    def test_las_vistas_no_importan_api_navegador_avisos_ni_servicios(self):
        vistas = sorted((SRC / "vistas").rglob("*.ts"))
        self.assertGreaterEqual(len(vistas), 10)
        for v in vistas:
            for ruta in importados(v):
                with self.subTest(vista=v.name, importa=ruta):
                    self.assertFalse(any(p in ruta for p in self.PROHIBIDOS),
                                     f"{v.name} importa {ruta}: la vista no debe saber de eso")

    def test_las_vistas_no_toman_decisiones_de_flujo(self):
        for v in (SRC / "vistas").rglob("*.ts"):
            texto = v.read_text(encoding="utf-8")
            with self.subTest(vista=v.name):
                self.assertNotIn("navegador", texto.lower().replace("navegar", ""), f"{v.name} navega")
                self.assertNotIn("await this.api", texto, f"{v.name} consulta la API")


class TestControladores(unittest.TestCase):
    def test_los_controladores_no_tocan_el_dom(self):
        controladores = sorted((SRC / "controladores").glob("*.ts"))
        self.assertGreaterEqual(len(controladores), 7)
        for c in controladores:
            texto = c.read_text(encoding="utf-8")
            for prohibido in ("document.", "innerHTML", "querySelector", "window.", "<div", "<p"):
                with self.subTest(controlador=c.name, usa=prohibido):
                    self.assertNotIn(prohibido, texto, f"{c.name} toca la pantalla: eso es de la vista")

    def test_los_controladores_no_importan_clases_de_vista_concretas_salvo_su_tipo(self):
        for c in (SRC / "controladores").glob("*.ts"):
            texto = c.read_text(encoding="utf-8")
            for linea in re.findall(r"import[^;]*vistas/[^;]*;", texto):
                with self.subTest(controlador=c.name, linea=linea):
                    self.assertTrue(linea.startswith("import type"),
                                    f"{c.name}: importa una vista como valor; basta con el tipo")

    def test_cada_pantalla_con_eventos_tiene_su_controlador(self):
        esperados = {"ControladorLogin", "ControladorRegistro", "ControladorInicio", "ControladorModulo",
                     "ControladorPresion", "ControladorResultado", "ControladorHistorial"}
        existentes = {p.stem for p in (SRC / "controladores").glob("*.ts")}
        self.assertEqual(esperados, existentes)

    def test_la_fabrica_conecta_cada_vista_con_su_controlador(self):
        texto = (SRC / "interfaz" / "FabricaVistas.ts").read_text(encoding="utf-8")
        for nombre in ("ControladorLogin", "ControladorRegistro", "ControladorInicio", "ControladorModulo",
                       "ControladorPresion", "ControladorResultado", "ControladorHistorial"):
            self.assertIn(f"new {nombre}(", texto)


class TestBundle(unittest.TestCase):
    def test_el_js_generado_contiene_los_controladores(self):
        js = (SRC.parent.parent / "static" / "js" / "app.js").read_text(encoding="utf-8")
        self.assertIn("ControladorLogin", js, "static/js/app.js está viejo: corre `npm run build` en front/")


if __name__ == "__main__":
    unittest.main()
