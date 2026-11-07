import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import { Html } from '../interfaz/Html';
import type { ResultadoEvaluacion } from '../tipos/ResultadoEvaluacion';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

/** Texto que se muestra para cada nivel de riesgo. */
const NIVELES: Record<string, string> = { bajo: 'Riesgo Bajo', medio: 'Riesgo Medio', alto: 'Riesgo Alto' };

/** Pantalla con el resultado de una evaluación (VISTA): el controlador consulta y ella dibuja. */
export class VistaResultado extends Vista {
  private manejadorPdf: ((id: string) => void) | null = null;

  /**
   * @param barra - Barra de navegación de la pantalla.
   * @param idEvaluacion - Id de la evaluación que se muestra.
   */
  constructor(barra: BarraNavegacion, private readonly idEvaluacion: string) {
    super(barra);
  }

  /** @returns Id de la evaluación que esta pantalla muestra (el controlador lo necesita para consultarla). */
  id(): string {
    return this.idEvaluacion;
  }

  /**
   * Registra quién atiende la descarga del PDF.
   * @param manejador - Recibe el id de la evaluación.
   */
  alDescargarPdf(manejador: (id: string) => void): void {
    this.manejadorPdf = manejador;
  }

  protected tipoBarra(): TipoBarra {
    return 'interna';
  }

  protected contenido(): void {
    this.pintar('<p class="centrado muted">Cargando resultado…</p>');
  }

  /**
   * Dibuja el resultado y conecta el botón del PDF.
   * @param r - Resultado ya consultado.
   */
  mostrarResultado(r: ResultadoEvaluacion): void {
    const esc = Html.esc;
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
    this.$('#pdf').onclick = () => { this.manejadorPdf?.(this.idEvaluacion); };
  }
}
