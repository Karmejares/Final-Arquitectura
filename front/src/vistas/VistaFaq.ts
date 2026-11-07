import type { EstadoSesion } from '../contratos/EstadoSesion';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import { Html } from '../interfaz/Html';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

interface DepsFaq {
  barra: BarraNavegacion;
  sesion: EstadoSesion;
  minutos: number;
}

/** Pantalla de preguntas frecuentes. */
export class VistaFaq extends Vista {
  private readonly sesion: EstadoSesion;
  private readonly minutos: number;

  constructor(d: DepsFaq) {
    super(d.barra);
    this.sesion = d.sesion;
    this.minutos = d.minutos;
  }

  protected tipoBarra(): TipoBarra {
    return this.sesion.activa() ? 'dash' : 'auth';
  }

  protected contenido(): void {
    const q = [
      ['¿Qué calcula CardioPrev?', 'Una estimación orientativa de tu riesgo cardiovascular (bajo, medio o alto) con 10 factores: edad, IMC, presión, colesterol, alimentación, actividad, tabaquismo, alcohol, diabetes y antecedentes.'],
      ['¿Reemplaza a un médico?', 'No. Es una herramienta educativa; ante cualquier duda consulta a un profesional de la salud.'],
      ['¿Dónde se guardan mis evaluaciones?', 'En el servidor, asociadas solo a tu cuenta. Nadie más puede ver tu historial.'],
      ['¿Por qué se cerró mi sesión?', 'Por seguridad, la sesión se cierra tras ' + this.minutos + ' minutos sin actividad.'],
    ];
    this.pintar(`<div class="contenedor"><div class="tarjeta-plana"><h1 class="centrado">Preguntas frecuentes</h1>${
      q.map(([a, b]) => `<details class="detalle"><summary>${Html.esc(a)}</summary><p>${Html.esc(b)}</p></details>`).join('')}
      <p class="enlace-centro"><a href="${this.sesion.activa() ? '#/inicio' : '#/login'}">Volver</a></p></div></div>`);
  }
}
