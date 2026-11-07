import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { TipoBarra } from '../tipos/TipoBarra';

/**
 * Contrato de pantalla (VISTA en MVC): pinta la barra y el contenido, y avisa de lo que hace el usuario.
 * No decide qué hacer: el CONTROLADOR se registra con `alMostrar` y con los `alXxx` de cada pantalla.
 */
export abstract class Vista {
  private manejadorMostrar: ((seq: boolean) => void) | null = null;

  constructor(protected readonly barra: BarraNavegacion) {}

  /** El controlador pide que le avisen cuando la pantalla ya está pintada (para cargar datos). */
  alMostrar(manejador: (seq: boolean) => void): void {
    this.manejadorMostrar = manejador;
  }

  mostrar(seq: boolean): void {
    this.barra.mostrar(this.tipoBarra());
    this.contenido(seq);
    this.manejadorMostrar?.(seq);
  }

  protected abstract tipoBarra(): TipoBarra;

  protected abstract contenido(seq: boolean): void;

  /** Reemplaza el contenido de la página. */
  protected pintar(html: string): void {
    this.$('#vista').innerHTML = html;
  }

  protected $<T extends Element = HTMLElement>(s: string): T {
    return document.querySelector(s) as T;
  }
}
