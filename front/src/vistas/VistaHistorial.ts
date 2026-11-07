import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import { Html } from '../interfaz/Html';
import type { ItemHistorial } from '../tipos/ItemHistorial';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

const CLASES: Record<string, string> = { verde: 'fila-verde', amarillo: 'fila-amarilla', rojo: 'fila-roja' };

/** Pantalla con la lista de evaluaciones previas (VISTA): el controlador consulta y ella dibuja. */
export class VistaHistorial extends Vista {
  private manejadorPdf: ((id: string) => void) | null = null;

  constructor(barra: BarraNavegacion) {
    super(barra);
  }

  alDescargarPdf(manejador: (id: string) => void): void {
    this.manejadorPdf = manejador;
  }

  protected tipoBarra(): TipoBarra {
    return 'interna';
  }

  protected contenido(): void {
    this.pintar(`<div class="contenedor"><div class="tarjeta-plana"><h1 class="centrado">Historial de evaluaciones</h1><div id="cont" class="muted centrado">Cargando…</div>
      <p class="enlace-centro"><a href="#/inicio">Volver al Dashboard</a></p></div></div>`);
  }

  mostrarHistorial(h: ItemHistorial[]): void {
    const esc = Html.esc;
    this.$('#cont').outerHTML = h.length ? `<div class="tabla-scroll"><table><thead><tr><th>Fecha</th><th>Puntaje</th><th>Nivel</th><th>Acciones</th></tr></thead><tbody>${
      h.map((x) => `<tr class="${CLASES[x.color] || ''}"><td>${Html.fecha(x.fecha)}</td><td>${esc(x.puntaje)}</td><td>${esc(x.nivel)}</td>
        <td><a class="btn btn-azul" href="#/resultado/${esc(x.id)}">Ver</a><button type="button" class="btn btn-gris" data-pdf="${esc(x.id)}">PDF</button></td></tr>`).join('')
    }</tbody></table></div>` : '<p class="centrado muted">Aún no tienes evaluaciones. Pulsa «Comenzar Evaluación» en el Dashboard.</p>';
    document.querySelectorAll<HTMLElement>('[data-pdf]').forEach((bt) => { bt.onclick = () => { this.manejadorPdf?.(bt.dataset.pdf as string); }; });
  }
}
