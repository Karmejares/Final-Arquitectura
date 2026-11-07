import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import { ApiError } from '../datos/ApiError';
import type { Avisos } from '../interfaz/Avisos';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import { Html } from '../interfaz/Html';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { Navegador } from '../interfaz/Navegador';
import type { DescargaPdf } from '../servicios/DescargaPdf';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

interface DepsResultado {
  barra: BarraNavegacion;
  api: ApiEvaluaciones;
  descarga: DescargaPdf;
  avisos: Avisos;
  navegador: Navegador;
  errores: ManejadorErrores;
}

const NIVELES: Record<string, string> = { bajo: 'Riesgo Bajo', medio: 'Riesgo Medio', alto: 'Riesgo Alto' };

/** Pantalla con el resultado de una evaluación. */
export class VistaResultado extends Vista {
  private readonly api: ApiEvaluaciones;
  private readonly descarga: DescargaPdf;
  private readonly avisos: Avisos;
  private readonly navegador: Navegador;
  private readonly errores: ManejadorErrores;

  constructor(d: DepsResultado, private readonly id: string) {
    super(d.barra);
    this.api = d.api;
    this.descarga = d.descarga;
    this.avisos = d.avisos;
    this.navegador = d.navegador;
    this.errores = d.errores;
  }

  protected tipoBarra(): TipoBarra {
    return 'interna';
  }

  protected async contenido(): Promise<void> {
    const esc = Html.esc;
    this.pintar('<p class="centrado muted">Cargando resultado…</p>');
    try {
      const r = await this.api.evaluacion(this.id);
      this.avisos.limpiar();
      const nombreNivel = NIVELES[r.nivel] || r.nivel;
      const n = r.nutricion;
      this.pintar(`<div class="contenedor resultado">
        <h1>Evaluación del Riesgo Cardiovascular</h1>
        <div class="circulo ${esc(r.color)}" role="img" aria-label="Indicador de color: ${esc(r.color)}"></div>
        <p class="nivel">Tu nivel de riesgo es: <b class="${esc(r.color)}">${esc(nombreNivel)}</b></p>
        <p class="muted">${esc(r.puntaje)} de ${esc(r.puntaje_maximo)} puntos · IMC ${esc(r.imc)} · ${esc(r.edad)} años</p>
        ${r.alertas.length ? `<div class="alertas">${r.alertas.map((a) => `<div class="alerta alerta-aviso">⚠ ${esc(a)}</div>`).join('')}</div>` : ''}
        <h2>Recomendaciones:</h2>
        <ul class="lista-grupo">${r.recomendaciones.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        ${n ? `<h2>Estimación nutricional diaria</h2><div class="macros"><div><strong>${esc(n.calorias)}</strong>kcal</div><div><strong>${esc(n.proteinas_g)} g</strong>proteínas</div><div><strong>${esc(n.grasas_g)} g</strong>grasas</div><div><strong>${esc(n.carbohidratos_g)} g</strong>carbohidratos</div></div>` : ''}
        <details class="detalle"><summary>Ver el aporte de cada factor</summary>
          <div class="tabla-scroll"><table><thead><tr><th>Factor</th><th>Valor</th><th>Puntos</th></tr></thead><tbody>${
            r.factores.map((f) => `<tr><td>${esc(f.factor)}</td><td>${esc(f.valor)}</td><td>${esc(f.puntos)}</td></tr>`).join('')}</tbody></table></div></details>
        <p class="muted pequeno">Tu evaluación ya quedó guardada en el historial.</p>
        <div class="fila-botones"><button class="btn btn-verde" id="pdf" type="button">Descargar reporte PDF</button>
          <a class="btn btn-gris" href="#/historial">Ver historial</a><a class="btn btn-gris" href="#/inicio">Volver al Dashboard</a></div>
        <p class="muted pequeno" style="margin-top:1rem">${esc(r.aviso || '')}</p></div>`);
      this.$('#pdf').onclick = () => { this.descarga.descargar(this.id); };
    } catch (e) { this.errores.mostrar(e); if (e instanceof ApiError && e.status === 404) this.navegador.ir('#/inicio'); }
  }
}
