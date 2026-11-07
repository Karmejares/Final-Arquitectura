import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { Campos } from '../interfaz/Campos';
import type { LectorFormulario } from '../interfaz/LectorFormulario';

/** Dependencias de las pantallas de módulo (solo lo que necesita una VISTA: leer el borrador y armar el formulario). */
export interface DepsModulo {
  /** Barra de navegación compartida. */
  barra: BarraNavegacion;
  /** Catálogo de secciones. */
  catalogo: CatalogoSecciones;
  /** Persistencia del borrador. */
  repoBorrador: RepositorioBorrador;
  /** Lector de formularios. */
  lector: LectorFormulario;
  /** Generador de campos de formulario. */
  campos: Campos;
}
