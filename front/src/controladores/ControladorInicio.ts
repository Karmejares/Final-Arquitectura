import type { FlujoEvaluacion } from '../servicios/FlujoEvaluacion';
import type { VistaInicio } from '../vistas/VistaInicio';

/** CONTROLADOR del Dashboard: cuando el usuario pide «Riesgo Cardiovascular», ordena al flujo de evaluación. */
export class ControladorInicio {
  constructor(vista: VistaInicio, private readonly flujo: FlujoEvaluacion) {
    vista.alVerRiesgo(() => { void this.flujo.verRiesgo(); });
  }
}
