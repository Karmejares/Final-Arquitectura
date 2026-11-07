import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { DescargaPdf } from '../servicios/DescargaPdf';
import type { VistaHistorial } from '../vistas/VistaHistorial';

/** CONTROLADOR del historial: consulta las evaluaciones del usuario, las entrega a la vista y atiende el PDF de cada fila. */
export class ControladorHistorial {
  constructor(
    private readonly vista: VistaHistorial,
    private readonly api: ApiEvaluaciones,
    private readonly descarga: DescargaPdf,
    private readonly errores: ManejadorErrores,
  ) {
    vista.alMostrar(() => { void this.cargar(); });
    vista.alDescargarPdf((id) => { void this.descarga.descargar(id); });
  }

  private async cargar(): Promise<void> {
    try {
      this.vista.mostrarHistorial(await this.api.historial());
    } catch (e) { this.errores.mostrar(e); }
  }
}
