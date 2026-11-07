/** Respuesta del backend al iniciar sesión. */
export interface RespuestaLogin {
  /** JWT de la sesión. */
  token: string;
  /** Nombre del usuario. */
  nombre: string;
}
