import type { DatosSeccion } from '../tipos/DatosSeccion';
import type { ItemHistorial } from '../tipos/ItemHistorial';
import type { RegistroPresion } from '../tipos/RegistroPresion';
import type { ResultadoEvaluacion } from '../tipos/ResultadoEvaluacion';

/** Endpoints de evaluaciones: crear, consultar historial, presiones y PDF. */
export interface ApiEvaluaciones {
  /**
   * Calcula y guarda una evaluación.
   * @param d - Campos de todas las secciones en un solo objeto.
   * @returns Resultado calculado.
   */
  crearEvaluacion(d: DatosSeccion): Promise<ResultadoEvaluacion>;
  /** @returns Evaluaciones del usuario, de la más reciente a la más antigua. */
  historial(): Promise<ItemHistorial[]>;
  /** @returns Registros de presión del usuario, del más reciente al más antiguo. */
  presiones(): Promise<RegistroPresion[]>;
  /**
   * Consulta el resultado de una evaluación.
   * @param id - Id de la evaluación.
   * @returns Resultado guardado.
   * @throws ApiError con estado 404 si no existe o es de otro usuario.
   */
  evaluacion(id: string): Promise<ResultadoEvaluacion>;
  /**
   * Descarga el reporte PDF de una evaluación.
   * @param id - Id de la evaluación.
   * @returns Contenido del PDF.
   */
  pdf(id: string): Promise<Blob>;
}
