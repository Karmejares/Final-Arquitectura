import type { AperturaSesion } from '../contratos/AperturaSesion';
import type { ApiAuth } from '../contratos/ApiAuth';
import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import type { EstadoSesion } from '../contratos/EstadoSesion';
import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { Avisos } from '../interfaz/Avisos';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { Campos } from '../interfaz/Campos';
import type { LectorFormulario } from '../interfaz/LectorFormulario';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { Navegador } from '../interfaz/Navegador';
import type { DescargaPdf } from '../servicios/DescargaPdf';
import type { FlujoEvaluacion } from '../servicios/FlujoEvaluacion';

/** Dependencias que la fábrica reparte a las vistas incluidas las de módulo. */
export interface DepsFabrica {
  barra: BarraNavegacion;
  apiAuth: ApiAuth;
  apiEvaluaciones: ApiEvaluaciones;
  sesion: AperturaSesion & EstadoSesion;
  repoBorrador: RepositorioBorrador;
  catalogo: CatalogoSecciones;
  flujo: FlujoEvaluacion;
  descarga: DescargaPdf;
  avisos: Avisos;
  navegador: Navegador;
  errores: ManejadorErrores;
  lector: LectorFormulario;
  campos: Campos;
  minutos: number;
}
