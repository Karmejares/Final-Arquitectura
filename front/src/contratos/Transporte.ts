import type { OpcionesPeticion } from '../tipos/OpcionesPeticion';

/** Envío de peticiones HTTP al backend. */
export interface Transporte {
  /**
   * Envía una petición al backend.
   * @typeParam T - Tipo de la respuesta esperada.
   * @param ruta - Ruta del backend.
   * @param opciones - Método, cuerpo y formato de la respuesta.
   * @returns Respuesta ya interpretada.
   * @throws ApiError si el servidor responde con error o no se puede conectar.
   */
  peticion<T>(ruta: string, opciones?: OpcionesPeticion): Promise<T>;
}
