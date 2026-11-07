import type { Almacen } from '../contratos/Almacen';

/** Lee, escribe y borra en sessionStorage sin propagar excepciones. */
export class AlmacenSesion implements Almacen {
  leer(k: string): string | null {
    try { return sessionStorage.getItem(k); } catch (_) { return null; }
  }

  escribir(k: string, v: string): void {
    try { sessionStorage.setItem(k, v); } catch (_) { /* sin almacenamiento */ }
  }

  borrar(k: string): void {
    try { sessionStorage.removeItem(k); } catch (_) { /* sin almacenamiento */ }
  }
}
