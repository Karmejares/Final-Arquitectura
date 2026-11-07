import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { TipoBarra } from '../tipos/TipoBarra';

/** Contrato de pantalla: pinta la barra y delega el contenido a la subclase (Template Method). */
export abstract class Vista {
  constructor(protected readonly barra: BarraNavegacion) {}

  mostrar(seq: boolean): void | Promise<void> {
    this.barra.mostrar(this.tipoBarra());
    return this.contenido(seq);
  }

  protected abstract tipoBarra(): TipoBarra;

  protected abstract contenido(seq: boolean): void | Promise<void>;

  /** Reemplaza el contenido de la página. */
  protected pintar(html: string): void {
    this.$('#vista').innerHTML = html;
  }

  protected $<T extends Element = HTMLElement>(s: string): T {
    return document.querySelector(s) as T;
  }
}
