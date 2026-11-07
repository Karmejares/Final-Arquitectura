/** Estimación diaria de calorías y macronutrientes (espejo de `Nutricion` en app/models/models.py). */
export interface Nutricion {
  /** Calorías diarias estimadas (kcal). */
  calorias: number;
  /** Gramos de proteínas al día. */
  proteinas_g: number;
  /** Gramos de grasas al día. */
  grasas_g: number;
  /** Gramos de carbohidratos al día. */
  carbohidratos_g: number;
}
