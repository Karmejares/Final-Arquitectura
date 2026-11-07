/** Factor de riesgo evaluado (espejo de `FactorResultado` en app/models.py). */
export interface FactorResultado {
  factor: string;
  valor: string;
  puntos: number;
  recomendacion: string | null;
}
