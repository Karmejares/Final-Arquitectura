/** Representa un error HTTP del backend con su estado y mensajes. */
export class ApiError extends Error {
  /**
   * @param status - Código HTTP; 0 si no se pudo conectar con el servidor.
   * @param mensajes - Mensajes para mostrar al usuario.
   */
  constructor(readonly status: number, readonly mensajes: string[]) {
    super(mensajes.join(' '));
  }
}
