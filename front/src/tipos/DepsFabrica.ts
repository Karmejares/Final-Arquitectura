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
  /** Barra de navegación compartida. */
  barra: BarraNavegacion;
  /** Endpoints de cuenta. */
  apiAuth: ApiAuth;
  /** Endpoints de evaluaciones. */
  apiEvaluaciones: ApiEvaluaciones;
  /** Apertura y estado de la sesión. */
  sesion: AperturaSesion & EstadoSesion;
  /** Persistencia del borrador. */
  repoBorrador: RepositorioBorrador;
  /** Catálogo de secciones. */
  catalogo: CatalogoSecciones;
  /** Flujo de envío de la evaluación. */
  flujo: FlujoEvaluacion;
  /** Descarga de reportes PDF. */
  descarga: DescargaPdf;
  /** Avisos en pantalla. */
  avisos: Avisos;
  /** Cambio de ruta. */
  navegador: Navegador;
  /** Presentación de errores. */
  errores: ManejadorErrores;
  /** Lector de formularios. */
  lector: LectorFormulario;
  /** Generador de campos de formulario. */
  campos: Campos;
  /** Minutos de inactividad antes de cerrar la sesión. */
  minutos: number;
}
