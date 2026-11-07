import type { FactorResultado } from './FactorResultado';
import type { Nutricion } from './Nutricion';

/** Resultado de una evaluación (espejo de `ResultadoEvaluacion` en app/models/models.py). */
export interface ResultadoEvaluacion {
  /** Id en el historial. */
  id: number | null;
  /** Fecha y hora en formato ISO. */
  fecha: string;
  /** Edad calculada. */
  edad: number;
  /** IMC calculado. */
  imc: number;
  /** Suma de los puntos de los factores. */
  puntaje: number;
  /** Máximo posible. */
  puntaje_maximo: number;
  /** Nivel de riesgo: bajo, medio o alto. */
  nivel: string;
  /** Color del semáforo: verde, amarillo o rojo. */
  color: string;
  /** Mensaje general del nivel. */
  mensaje: string;
  /** Aporte de cada factor. */
  factores: FactorResultado[];
  /** Las generales del nivel, seguidas de las de cada factor. */
  recomendaciones: string[];
  /** Alertas de presión arterial. */
  alertas: string[];
  /** Estimación diaria de calorías y macronutrientes. */
  nutricion: Nutricion | null;
  /** Advertencia de que la estimación no reemplaza la consulta médica. */
  aviso: string;
}
