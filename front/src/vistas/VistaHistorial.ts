import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import { Html } from '../interfaz/Html';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { DescargaPdf } from '../servicios/DescargaPdf';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

interface DepsHistorial {
  barra: BarraNavegacion;
  api: ApiEvaluaciones;
  descarga: DescargaPdf;
  errores: ManejadorErrores;
}

const CLASES: Record<string, string> = { verde: 'fila-verde', amarillo: 'fila-amarilla', rojo: 'fila-roja' };

/** Pantalla con la lista de evaluaciones previas. */
export class VistaHistorial extends Vista {
  private readonly api: ApiEvaluaciones;
  private readonly descarga: DescargaPdf;
  private readonly errores: ManejadorErrores;

  constructor(d: DepsHistorial) {
    super(d.barra);
    this.api = d.api;
    this.descarga = d.descarga;
    this.errores = d.errores;
  }

  protected tipoBarra(): TipoBarra {
    return 'interna';
  }

  protected async contenido(): Promise<void> {
    const esc = Html.esc;
    this.pintar(`<div class="contenedor"><div class="tarjeta-plana"><h1 class="centrado">Historial de evaluaciones</h1><div id="cont" class="muted centrado">Cargando…</div>
      <p class="enlace-centro"><a href="#/inicio">Volver al Dashboard</a></p></div></div>`);
    try {
      const h = await this.api.historial();
      this.$('#cont').outerHTML = h.length ? `<div class="tabla-scroll"><table><thead><tr><th>Fecha</th><th>Puntaje</th><th>Nivel</th><th>Acciones</th></tr></thead><tbody>${
        h.map((x) => `<tr class="${CLASES[x.color] || ''}"><td>${Html.fecha(x.fecha)}</td><td>${esc(x.puntaje)}</td><td>${esc(x.nivel)}</td>
          <td><a class="btn btn-azul" href="#/resultado/${esc(x.id)}">Ver</a><button type="button" class="btn btn-gris" data-pdf="${esc(x.id)}">PDF</button></td></tr>`).join('')
      }</tbody></table></div>` : '<p class="centrado muted">Aún no tienes evaluaciones. Pulsa «Comenzar Evaluación» en el Dashboard.</p>';
      document.querySelectorAll<HTMLElement>('[data-pdf]').forEach((bt) => { bt.onclick = () => { this.descarga.descargar(bt.dataset.pdf as string); }; });
    } catch (e) { this.errores.mostrar(e); }
  }
}
