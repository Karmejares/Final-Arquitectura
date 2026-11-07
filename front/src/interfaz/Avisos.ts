import type { TipoAviso } from '../tipos/TipoAviso';
import { Html } from './Html';

/** Muestra avisos en la caja de la página y guarda uno pendiente para la próxima vista. */
export class Avisos {
  private pendiente: { msg: string; tipo: TipoAviso } | null = null;

  /** @param caja - Elemento donde se pintan los avisos. */
  constructor(private readonly caja: HTMLElement) {}

  /**
   * Con mensaje vacío solo limpia; con mensaje pinta y sube al inicio.
   * @param msg - Texto del aviso; vacío para limpiar.
   * @param tipo - Estilo del aviso.
   * @param lista - Si trae más de un mensaje, se muestran todos en vez de `msg`.
   */
  mostrar(msg: string, tipo: TipoAviso = 'ok', lista: string[] | null = null): void {
    if (!msg) { this.caja.innerHTML = ''; return; }
    const items = lista && lista.length > 1 ? '<ul>' + lista.map((m) => `<li>${Html.esc(m)}</li>`).join('') + '</ul>' : '';
    this.caja.innerHTML = `<div class="alerta alerta-${tipo}">${items ? Html.esc((lista as string[]).length + ' datos por corregir:') + items : Html.esc(msg)}</div>`;
    window.scrollTo(0, 0);
  }

  /** Borra el aviso visible. No toca el aviso pendiente. */
  limpiar(): void {
    this.mostrar('');
  }

  /**
   * Deja un aviso para mostrarlo después del próximo cambio de ruta.
   * @param msg - Texto del aviso.
   * @param tipo - Estilo del aviso.
   */
  avisarLuego(msg: string, tipo: TipoAviso = 'ok'): void {
    this.pendiente = { msg, tipo };
  }

  /** Muestra el aviso pendiente, si lo hay, y lo descarta. */
  mostrarPendiente(): void {
    if (this.pendiente) {
      this.mostrar(this.pendiente.msg, this.pendiente.tipo);
      this.pendiente = null;
    }
  }
}
