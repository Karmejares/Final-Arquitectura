import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { TipoBarra } from '../tipos/TipoBarra';

/**
 * Contrato de pantalla (VISTA en MVC): pinta la barra y el contenido, y avisa de lo que hace el usuario.
 * No decide qué hacer: el CONTROLADOR se registra con `alMostrar` y con los `alXxx` de cada pantalla.
 */
export abstract class Vista {
  private manejadorMostrar: ((seq: boolean) => void) | null = null;

  /** @param barra - Barra de navegación de la pantalla. */
  constructor(protected readonly barra: BarraNavegacion) {}

  /**
   * El controlador pide que le avisen cuando la pantalla ya está pintada (para cargar datos).
   * @param manejador - Recibe si la pantalla se abrió en el flujo secuencial.
   */
  alMostrar(manejador: (seq: boolean) => void): void {
    this.manejadorMostrar = manejador;
  }

  /**
   * Pinta la barra y el contenido, y luego avisa al controlador.
   * @param seq - Si la pantalla se abre en el flujo secuencial.
   */
  mostrar(seq: boolean): void {
    this.barra.mostrar(this.tipoBarra());
    this.contenido(seq);
    this.manejadorMostrar?.(seq);
  }

  /** @returns Variante de barra que usa la pantalla. */
  protected abstract tipoBarra(): TipoBarra;

  /**
   * Pinta el contenido propio de la pantalla.
   * @param seq - Si la pantalla se abre en el flujo secuencial.
   */
  protected abstract contenido(seq: boolean): void;

  /**
   * Reemplaza el contenido de la página.
   * @param html - HTML ya escapado.
   */
  protected pintar(html: string): void {
    this.$('#vista').innerHTML = html;
  }

  /**
   * Busca un elemento de la página, dando por hecho que existe.
   * @typeParam T - Tipo del elemento.
   * @param s - Selector CSS.
   * @returns El primer elemento que coincide.
   */
  protected $<T extends Element = HTMLElement>(s: string): T {
    return document.querySelector(s) as T;
  }
}
