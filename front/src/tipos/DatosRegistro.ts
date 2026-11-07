/** Datos enviados para crear una cuenta. */
export interface DatosRegistro {
  /** Nombre visible del usuario. */
  nombre: string;
  /** Correo de la cuenta. */
  correo: string;
  /** Contraseña en claro; el backend guarda solo su hash. */
  password: string;
}
