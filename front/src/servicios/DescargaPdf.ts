import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';

/** Descarga el PDF de una evaluación mediante un enlace temporal. */
export class DescargaPdf {
  constructor(private readonly api: ApiEvaluaciones, private readonly errores: ManejadorErrores) {}

  async descargar(id: string): Promise<void> {
    try {
      const blob = await this.api.pdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'cardioprev-evaluacion-' + id + '.pdf';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { this.errores.mostrar(e); }
  }
}
