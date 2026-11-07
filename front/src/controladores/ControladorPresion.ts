import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { Avisos } from '../interfaz/Avisos';
import type { Navegador } from '../interfaz/Navegador';
import type { FlujoEvaluacion } from '../servicios/FlujoEvaluacion';
import type { VistaPresion } from '../vistas/modulos/VistaPresion';
import { ControladorModulo } from './ControladorModulo';

/** CONTROLADOR de presión arterial: guarda como cualquier módulo y, fuera del flujo secuencial, consulta los registros. */
export class ControladorPresion extends ControladorModulo {
  /**
   * Se registra en los eventos de la vista.
   * @param vista - Pantalla de presión arterial.
   * @param repoBorrador - Persistencia del borrador.
   * @param catalogo - Campos de cada sección y orden del flujo.
   * @param flujo - Envío de la evaluación al terminar el último paso.
   * @param avisos - Avisos en pantalla.
   * @param navegador - Cambio de ruta.
   * @param api - Consulta de los registros de presión.
   */
  constructor(
    protected override readonly vista: VistaPresion,
    repoBorrador: RepositorioBorrador,
    catalogo: CatalogoSecciones,
    flujo: FlujoEvaluacion,
    avisos: Avisos,
    navegador: Navegador,
    private readonly api: ApiEvaluaciones,
  ) {
    super(vista, repoBorrador, catalogo, flujo, avisos, navegador);
    vista.alMostrar((seq) => { if (!seq) void this.cargarRegistros(); });
  }

  /** Consulta los registros de presión; si falla, la vista muestra el error en su tabla. */
  private async cargarRegistros(): Promise<void> {
    try {
      this.vista.mostrarPresiones(await this.api.presiones());
    } catch (_) { this.vista.mostrarErrorPresiones(); }
  }
}
