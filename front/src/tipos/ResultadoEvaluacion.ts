import type { FactorResultado } from './FactorResultado';
import type { Nutricion } from './Nutricion';

/** Resultado de una evaluación (espejo de `ResultadoEvaluacion` en app/models.py). */
export interface ResultadoEvaluacion {
  id: number | null;
  fecha: string;
  edad: number;
  imc: number;
  puntaje: number;
  puntaje_maximo: number;
  nivel: string;
  color: string;
  mensaje: string;
  factores: FactorResultado[];
  recomendaciones: string[];
  alertas: string[];
  nutricion: Nutricion | null;
  aviso: string;
}
