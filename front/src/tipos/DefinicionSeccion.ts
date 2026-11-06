/** Metadatos de una sección: título, ruta de la vista y nombres de sus campos. */
export interface DefinicionSeccion {
  titulo: string;
  ruta: string;
  campos: readonly string[];
}
