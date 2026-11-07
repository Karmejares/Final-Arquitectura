/** Registro de presión arterial del historial. */
export interface RegistroPresion {
  /** Id de la evaluación de la que sale el registro. */
  id: number;
  /** Fecha y hora en formato ISO. */
  fecha: string;
  /** Presión sistólica en mmHg. */
  sistolica: number;
  /** Presión diastólica en mmHg. */
  diastolica: number;
  /** Clasificación: alta, elevada, baja o normal. */
  estado: string;
}
