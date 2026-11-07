import type { OpcionesPeticion } from '../tipos/OpcionesPeticion';

/** Envío de peticiones HTTP al backend. */
export interface Transporte {
  peticion<T>(ruta: string, opciones?: OpcionesPeticion): Promise<T>;
}
