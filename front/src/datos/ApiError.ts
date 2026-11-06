/** Representa un error HTTP del backend con su estado y mensajes. */
export class ApiError extends Error {
  constructor(readonly status: number, readonly mensajes: string[]) {
    super(mensajes.join(' '));
  }
}
