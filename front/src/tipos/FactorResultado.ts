/** Factor de riesgo evaluado (espejo de `FactorResultado` en app/models/models.py). */
export interface FactorResultado {
  /** Nombre del factor. */
  factor: string;
  /** Valor del usuario, como texto. */
  valor: string;
  /** Puntos que suma al puntaje. */
  puntos: number;
  /** Consejo para el usuario; null si el factor no suma puntos. */
  recomendacion: string | null;
}
