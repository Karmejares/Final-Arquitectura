/** Registro de presión arterial del historial. */
export interface RegistroPresion {
  id: number;
  fecha: string;
  sistolica: number;
  diastolica: number;
  estado: string;
}
