/** Recibe el aviso de que la sesión se cerró. */
export interface ObservadorCierre {
  alCerrarSesion(): void;
}
