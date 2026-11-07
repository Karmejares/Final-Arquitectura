import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { Avisos } from '../interfaz/Avisos';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { Campos } from '../interfaz/Campos';
import type { LectorFormulario } from '../interfaz/LectorFormulario';
import type { Navegador } from '../interfaz/Navegador';
import type { FlujoEvaluacion } from '../servicios/FlujoEvaluacion';

/** Dependencias comunes de las pantallas de módulo. */
export interface DepsModulo {
  barra: BarraNavegacion;
  catalogo: CatalogoSecciones;
  repoBorrador: RepositorioBorrador;
  avisos: Avisos;
  navegador: Navegador;
  lector: LectorFormulario;
  flujo: FlujoEvaluacion;
  campos: Campos;
}
