import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

/** Dependencias del Dashboard. */
interface DepsInicio {
  /** Barra de navegación compartida. */
  barra: BarraNavegacion;
  /** De aquí sale el avance del borrador. */
  repoBorrador: RepositorioBorrador;
  /** Catálogo de secciones. */
  catalogo: CatalogoSecciones;
}

/** Dashboard (VISTA): muestra el avance del borrador y los accesos; avisa si el usuario pide ver su riesgo. */
export class VistaInicio extends Vista {
  private readonly repoBorrador: RepositorioBorrador;
  private readonly catalogo: CatalogoSecciones;
  private manejadorVerRiesgo: (() => void) | null = null;

  /** @param d - Dependencias de la pantalla. */
  constructor(d: DepsInicio) {
    super(d.barra);
    this.repoBorrador = d.repoBorrador;
    this.catalogo = d.catalogo;
  }

  /**
   * Registra quién atiende el botón «Riesgo Cardiovascular».
   * @param manejador - Se llama al pulsar el botón.
   */
  alVerRiesgo(manejador: () => void): void {
    this.manejadorVerRiesgo = manejador;
  }

  protected tipoBarra(): TipoBarra {
    return 'dash';
  }

  protected contenido(): void {
    const b = this.repoBorrador.leer();
    const chips = this.catalogo.orden().map((s) => `<a href="${this.catalogo.definicion(s).ruta}" class="${b.completa(s) ? 'hecho' : ''}">${b.completa(s) ? '✓ ' : ''}${this.catalogo.definicion(s).titulo}</a>`).join('');
    const mod = (img: string, t: string, p: string, ruta: string): string => `<a class="modulo" href="${ruta}"><img src="/static/img/${img}.png" alt=""><h3>${t}</h3><p>${p}</p></a>`;
    this.pintar(`<div class="contenedor-medio">
      <section class="hero"><h1>Previene el Riesgo <span>Cardiovascular</span></h1>
        <p>Evalúa tu salud cardiovascular con una herramienta inteligente que analiza tus hábitos, tus datos y tus antecedentes.</p>
        <div class="fila-botones"><a class="btn btn-rojo" href="#/datos?seq=1">Comenzar Evaluación</a>
          <button class="btn btn-contorno" type="button" id="ver-riesgo">Riesgo Cardiovascular</button></div>
        <div class="progreso" aria-label="Avance de tu evaluación">${chips}</div></section>
      <section class="modulos" aria-label="Módulos">
        ${mod('alimentos', 'Hábitos Alimenticios', 'Registra tu alimentación diaria', '#/habitos-alimenticios')}
        ${mod('actividad', 'Actividad Física', 'Monitorea tu nivel de actividad', '#/actividad')}
        ${mod('consumo', 'Tabaco y Alcohol', 'Registra tus hábitos personales', '#/consumo')}
        ${mod('presion', 'Presión Arterial', 'Consulta tus mediciones recientes', '#/presion')}
        ${mod('historial', 'Historial', 'Revisa tus evaluaciones previas', '#/historial')}
      </section></div>`);
    this.$('#ver-riesgo').onclick = () => { this.manejadorVerRiesgo?.(); };
  }
}
