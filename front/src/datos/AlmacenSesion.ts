import type { Almacen } from '../contratos/Almacen';

/** Lee, escribe y borra en sessionStorage sin propagar excepciones. */
export class AlmacenSesion implements Almacen {
  /**
   * Lee un valor de sessionStorage.
   * @param k - Clave del valor.
   * @returns El valor, o null si no existe o el almacenamiento no está disponible.
   */
  leer(k: string): string | null {
    try { return sessionStorage.getItem(k); } catch (_) { return null; }
  }

  /**
   * Guarda un valor; si el almacenamiento no está disponible, no hace nada.
   * @param k - Clave del valor.
   * @param v - Texto a guardar.
   */
  escribir(k: string, v: string): void {
    try { sessionStorage.setItem(k, v); } catch (_) { /* sin almacenamiento */ }
  }

  /**
   * Elimina un valor; si el almacenamiento no está disponible, no hace nada.
   * @param k - Clave del valor.
   */
  borrar(k: string): void {
    try { sessionStorage.removeItem(k); } catch (_) { /* sin almacenamiento */ }
  }
}
