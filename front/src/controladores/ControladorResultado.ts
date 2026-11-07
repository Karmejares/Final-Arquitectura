import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import { ApiError } from '../datos/ApiError';
import type { Avisos } from '../interfaz/Avisos';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { Navegador } from '../interfaz/Navegador';
import type { DescargaPdf } from '../servicios/DescargaPdf';
import type { VistaResultado } from '../vistas/VistaResultado';

/** CONTROLADOR del resultado: consulta la evaluación, se la entrega a la vista y atiende la descarga del PDF. */
export class ControladorResultado {
  constructor(
    private readonly vista: VistaResultado,
    private readonly api: ApiEvaluaciones,
    private readonly descarga: DescargaPdf,
    private readonly avisos: Avisos,
    private readonly navegador: Navegador,
    private readonly errores: ManejadorErrores,
  ) {
    vista.alMostrar(() => { void this.cargar(); });
    vista.alDescargarPdf((id) => { void this.descarga.descargar(id); });
  }

  private async cargar(): Promise<void> {
    try {
      const resultado = await this.api.evaluacion(this.vista.id());
      this.avisos.limpiar();
      this.vista.mostrarResultado(resultado);
    } catch (e) {
      this.errores.mostrar(e);
      if (e instanceof ApiError && e.status === 404) this.navegador.ir('#/inicio');
    }
  }
}
