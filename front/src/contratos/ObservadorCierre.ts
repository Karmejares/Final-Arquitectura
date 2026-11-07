/** Recibe el aviso de que la sesión se cerró. */
export interface ObservadorCierre {
  /** Limpia lo que corresponda a la sesión que terminó. */
  alCerrarSesion(): void;
}
