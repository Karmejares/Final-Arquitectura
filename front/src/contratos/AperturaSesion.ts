/** Inicio de sesión y consulta del nombre del usuario. */
export interface AperturaSesion {
  /**
   * Guarda los datos de una sesión recién iniciada.
   * @param token - JWT de la sesión.
   * @param nombre - Nombre del usuario.
   */
  abrir(token: string, nombre: string): void;
  /** @returns Nombre del usuario, o cadena vacía si no hay sesión. */
  nombre(): string;
}
