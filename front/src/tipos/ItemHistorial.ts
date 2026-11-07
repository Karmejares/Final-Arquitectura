/** Fila del historial de evaluaciones. */
export interface ItemHistorial {
  /** Id de la evaluación. */
  id: number;
  /** Fecha y hora en formato ISO. */
  fecha: string;
  /** Puntaje obtenido. */
  puntaje: number;
  /** Nivel de riesgo: bajo, medio o alto. */
  nivel: string;
  /** Color del semáforo: verde, amarillo o rojo. */
  color: string;
}
