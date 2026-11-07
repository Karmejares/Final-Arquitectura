/** Almacenamiento clave-valor de texto (p. ej. localStorage). */
export interface Almacen {
  leer(k: string): string | null;
  escribir(k: string, v: string): void;
  borrar(k: string): void;
}
