/** Metadatos de una sección: título, ruta de la vista y nombres de sus campos. */
export interface DefinicionSeccion {
  /** Título que se muestra al usuario. */
  titulo: string;
  /** Hash de la pantalla, p. ej. `#/datos`. */
  ruta: string;
  /** Nombres de los campos que la sección exige. */
  campos: readonly string[];
}
