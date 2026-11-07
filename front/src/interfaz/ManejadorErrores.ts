import { ApiError } from '../datos/ApiError';
import type { CierreSesion } from '../servicios/CierreSesion';
import type { Avisos } from './Avisos';

/** Decide qué ve el usuario ante un error: sesión vencida, mensajes del backend o genérico. */
export class ManejadorErrores {
  /**
   * @param avisos - Avisos en pantalla.
   * @param cierre - Cierra la sesión cuando venció.
   */
  constructor(private readonly avisos: Avisos, private readonly cierre: CierreSesion) {}

  /**
   * Muestra un error; un 401 cierra la sesión por vencimiento.
   * @param e - Error capturado.
   */
  mostrar(e: unknown): void {
    if (e instanceof ApiError) {
      if (e.status === 401) { this.cierre.ejecutar('Tu sesión expiró. Inicia sesión de nuevo.'); return; }
      this.avisos.mostrar(e.mensajes[0], 'error', e.mensajes);
      return;
    }
    this.avisos.mostrar('Ocurrió un error inesperado.', 'error');
  }
}
