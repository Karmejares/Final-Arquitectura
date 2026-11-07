import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { DescargaPdf } from '../servicios/DescargaPdf';
import type { VistaHistorial } from '../vistas/VistaHistorial';

/** CONTROLADOR del historial: consulta las evaluaciones del usuario, las entrega a la vista y atiende el PDF de cada fila. */
export class ControladorHistorial {
  /**
   * Se registra en los eventos de la vista.
   * @param vista - Pantalla del historial.
   * @param api - Consulta de evaluaciones.
   * @param descarga - Descarga del PDF de cada fila.
   * @param errores - Presenta los errores de la consulta.
   */
  constructor(
    private readonly vista: VistaHistorial,
    private readonly api: ApiEvaluaciones,
    private readonly descarga: DescargaPdf,
    private readonly errores: ManejadorErrores,
  ) {
    vista.alMostrar(() => { void this.cargar(); });
    vista.alDescargarPdf((id) => { void this.descarga.descargar(id); });
  }

  /** Consulta el historial y lo entrega a la vista. */
  private async cargar(): Promise<void> {
    try {
      this.vista.mostrarHistorial(await this.api.historial());
    } catch (e) { this.errores.mostrar(e); }
  }
}
