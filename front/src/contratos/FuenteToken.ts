/** Fuente y renovación del token de sesión. */
export interface FuenteToken {
  token(): string | null;
  renovar(t: string): void;
}
