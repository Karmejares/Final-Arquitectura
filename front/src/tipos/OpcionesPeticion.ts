/** Opciones para una petición HTTP al backend. */
export interface OpcionesPeticion {
  /** Método HTTP; GET por defecto. */
  metodo?: string;
  /** Cuerpo de la petición; se envía como JSON. */
  cuerpo?: unknown;
  /** Si es true, la respuesta se lee como Blob (p. ej. PDF). */
  blob?: boolean;
}
