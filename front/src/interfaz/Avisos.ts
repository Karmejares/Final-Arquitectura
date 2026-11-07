import type { TipoAviso } from '../tipos/TipoAviso';
import { Html } from './Html';

/** Muestra avisos en la caja de la página y guarda uno pendiente para la próxima vista. */
export class Avisos {
  private pendiente: { msg: string; tipo: TipoAviso } | null = null;

  constructor(private readonly caja: HTMLElement) {}

  /** Con mensaje vacío solo limpia; con mensaje pinta y sube al inicio. */
  mostrar(msg: string, tipo: TipoAviso = 'ok', lista: string[] | null = null): void {
    if (!msg) { this.caja.innerHTML = ''; return; }
    const items = lista && lista.length > 1 ? '<ul>' + lista.map((m) => `<li>${Html.esc(m)}</li>`).join('') + '</ul>' : '';
    this.caja.innerHTML = `<div class="alerta alerta-${tipo}">${items ? Html.esc((lista as string[]).length + ' datos por corregir:') + items : Html.esc(msg)}</div>`;
    window.scrollTo(0, 0);
  }

  /** No toca el aviso pendiente. */
  limpiar(): void {
    this.mostrar('');
  }

  avisarLuego(msg: string, tipo: TipoAviso = 'ok'): void {
    this.pendiente = { msg, tipo };
  }

  mostrarPendiente(): void {
    if (this.pendiente) {
      this.mostrar(this.pendiente.msg, this.pendiente.tipo);
      this.pendiente = null;
    }
  }
}
