"""Genera la documentación HTML del backend con pydoc (biblioteca estándar).

Uso:     python generar_docs.py
Salida:  docs/api/python/ (abrir app.html)
"""
import importlib
import os
import pkgutil
import pydoc
import pydoc_data
import shutil
from pathlib import Path

SALIDA = Path(__file__).resolve().parent / "docs" / "api" / "python"
ESTILOS = Path(pydoc_data.__file__).parent / "_pydoc.css"

# pydoc importa los módulos e imprime el valor de sus constantes. Estos valores evitan que un
# secreto real termine en el HTML y que importar app.main cree el archivo de la base de datos.
os.environ["CARDIOPREV_SECRET"] = "definida-por-variable-de-entorno"
os.environ["CARDIOPREV_DB"] = ":memory:"


class HtmlConEstilos(pydoc.HTMLDoc):
    """HTML de pydoc con su hoja de estilos: ``pydoc.writedoc`` no enlaza ninguna."""

    def page(self, title, contents):
        """Arma la página de pydoc y agrega el enlace a la hoja de estilos."""
        enlace = f'<link rel="stylesheet" href="{ESTILOS.name}">\n</head>'
        return super().page(title, contents).replace("</head>", enlace, 1)


def nombres_de_modulos() -> list:
    """Devuelve el paquete ``app`` y todos sus submódulos."""
    app = importlib.import_module("app")
    return ["app"] + [m.name for m in pkgutil.walk_packages(app.__path__, "app.")]


def main() -> None:
    """Regenera la carpeta de salida; falla si algún módulo no se puede importar."""
    nombres = nombres_de_modulos()
    for nombre in nombres:             # pydoc solo imprime los errores de importación: aquí detienen todo
        importlib.import_module(nombre)
    shutil.rmtree(SALIDA, ignore_errors=True)
    SALIDA.mkdir(parents=True)
    shutil.copy(ESTILOS, SALIDA)
    os.chdir(SALIDA)                   # pydoc.writedoc escribe en el directorio actual
    pydoc.html = HtmlConEstilos()      # pydoc.writedoc arma cada página con este objeto
    for nombre in nombres:
        pydoc.writedoc(nombre)
    print(f"{len(nombres)} páginas en {SALIDA}")


if __name__ == "__main__":
    main()
