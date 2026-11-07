/** Cambia la ruta del navegador (hash). */
export class Navegador {
  /**
   * Cambia el hash de la URL; el enrutador reacciona al cambio.
   * @param ruta - Ruta con `#`, p. ej. `#/inicio`.
   */
  ir(ruta: string): void {
    location.hash = ruta;
  }
}
