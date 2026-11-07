/** Cambia la ruta del navegador (hash). */
export class Navegador {
  ir(ruta: string): void {
    location.hash = ruta;
  }
}
