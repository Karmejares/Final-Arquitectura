import type { FlujoEvaluacion } from '../servicios/FlujoEvaluacion';
import type { VistaInicio } from '../vistas/VistaInicio';

/** CONTROLADOR del Dashboard: cuando el usuario pide «Riesgo Cardiovascular», ordena al flujo de evaluación. */
export class ControladorInicio {
  /**
   * Se registra en los eventos de la vista.
   * @param vista - Pantalla del Dashboard.
   * @param flujo - Flujo que lleva al resultado de la evaluación.
   */
  constructor(vista: VistaInicio, private readonly flujo: FlujoEvaluacion) {
    vista.alVerRiesgo(() => { void this.flujo.verRiesgo(); });
  }
}
