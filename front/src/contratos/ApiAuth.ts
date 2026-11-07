import type { DatosRegistro } from '../tipos/DatosRegistro';
import type { RespuestaLogin } from '../tipos/RespuestaLogin';
import type { RespuestaMensaje } from '../tipos/RespuestaMensaje';

/** Endpoints de cuenta: registro e inicio de sesión. */
export interface ApiAuth {
  /**
   * Crea una cuenta.
   * @param d - Datos de la cuenta.
   * @returns Mensaje de confirmación del backend.
   * @throws ApiError si el correo ya está registrado o los datos no son válidos.
   */
  registro(d: DatosRegistro): Promise<RespuestaMensaje>;
  /**
   * Inicia sesión.
   * @param correo - Correo de la cuenta.
   * @param password - Contraseña de la cuenta.
   * @returns Token de la sesión y nombre del usuario.
   * @throws ApiError si las credenciales son incorrectas.
   */
  login(correo: string, password: string): Promise<RespuestaLogin>;
}
