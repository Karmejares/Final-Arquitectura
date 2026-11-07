/** Almacenamiento clave-valor de texto (p. ej. localStorage). */
export interface Almacen {
  /**
   * Lee un valor.
   * @param k - Clave del valor.
   * @returns El valor guardado, o null si no existe.
   */
  leer(k: string): string | null;
  /**
   * Guarda un valor, reemplazando el anterior.
   * @param k - Clave del valor.
   * @param v - Texto a guardar.
   */
  escribir(k: string, v: string): void;
  /**
   * Elimina un valor.
   * @param k - Clave del valor.
   */
  borrar(k: string): void;
}
