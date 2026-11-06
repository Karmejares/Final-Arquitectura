/** Consulta del estado de la sesión actual. */
export interface EstadoSesion {
  activa(): boolean;
  nombre(): string;
}
