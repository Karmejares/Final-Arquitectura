import type { DatosRegistro } from '../tipos/DatosRegistro';
import type { RespuestaLogin } from '../tipos/RespuestaLogin';
import type { RespuestaMensaje } from '../tipos/RespuestaMensaje';

/** Endpoints de cuenta: registro e inicio de sesión. */
export interface ApiAuth {
  registro(d: DatosRegistro): Promise<RespuestaMensaje>;
  login(correo: string, password: string): Promise<RespuestaLogin>;
}
