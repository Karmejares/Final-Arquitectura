/** Opciones para una petición HTTP al backend. */
export interface OpcionesPeticion {
  metodo?: string;
  cuerpo?: unknown;
  /** Si es true, la respuesta se lee como Blob (p. ej. PDF). */
  blob?: boolean;
}
