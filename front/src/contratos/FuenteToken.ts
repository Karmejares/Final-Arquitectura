/** Fuente y renovación del token de sesión. */
export interface FuenteToken {
  /** @returns Token actual, o null si no hay sesión. */
  token(): string | null;
  /**
   * Reemplaza el token por el que entregó el servidor.
   * @param t - Token nuevo.
   */
  renovar(t: string): void;
}
