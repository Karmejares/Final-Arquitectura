import type { DatosSeccion } from '../tipos/DatosSeccion';
import type { ItemHistorial } from '../tipos/ItemHistorial';
import type { RegistroPresion } from '../tipos/RegistroPresion';
import type { ResultadoEvaluacion } from '../tipos/ResultadoEvaluacion';

/** Endpoints de evaluaciones: crear, consultar historial, presiones y PDF. */
export interface ApiEvaluaciones {
  crearEvaluacion(d: DatosSeccion): Promise<ResultadoEvaluacion>;
  historial(): Promise<ItemHistorial[]>;
  presiones(): Promise<RegistroPresion[]>;
  evaluacion(id: string): Promise<ResultadoEvaluacion>;
  pdf(id: string): Promise<Blob>;
}
