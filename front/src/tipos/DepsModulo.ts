import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { Campos } from '../interfaz/Campos';
import type { LectorFormulario } from '../interfaz/LectorFormulario';

/** Dependencias de las pantallas de módulo (solo lo que necesita una VISTA: leer el borrador y armar el formulario). */
export interface DepsModulo {
  barra: BarraNavegacion;
  catalogo: CatalogoSecciones;
  repoBorrador: RepositorioBorrador;
  lector: LectorFormulario;
  campos: Campos;
}
