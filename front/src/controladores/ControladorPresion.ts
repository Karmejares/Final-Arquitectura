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

  private async cargarRegistros(): Promise<void> {
    try {
      this.vista.mostrarPresiones(await this.api.presiones());
    } catch (_) { this.vista.mostrarErrorPresiones(); }
  }
}
