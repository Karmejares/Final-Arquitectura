/** Inicio de sesión y consulta del nombre del usuario. */
export interface AperturaSesion {
  abrir(token: string, nombre: string): void;
  nombre(): string;
}
