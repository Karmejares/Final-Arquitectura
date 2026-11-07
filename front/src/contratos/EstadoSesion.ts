/** Consulta del estado de la sesión actual. */
export interface EstadoSesion {
  /** @returns true si hay un token de sesión guardado. */
  activa(): boolean;
  /** @returns Nombre del usuario, o cadena vacía si no hay sesión. */
  nombre(): string;
}
