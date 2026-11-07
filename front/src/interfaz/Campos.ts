import type { OpcionCampo } from '../tipos/OpcionCampo';
import { Html } from './Html';

/** Genera el HTML de los campos reutilizables de los formularios. */
export class Campos {
  /**
   * Genera un campo numérico.
   * @param n - Nombre e id del campo.
   * @param etiqueta - Texto de la etiqueta (HTML sin escapar).
   * @param v - Valor actual.
   * @param extra - Atributos HTML adicionales, p. ej. min, max o step.
   * @returns HTML del campo.
   */
  numero(n: string, etiqueta: string, v: unknown, extra = ''): string {
    return `<div class="campo"><label for="${n}">${etiqueta}</label><input id="${n}" name="${n}" type="number" step="any" ${extra} value="${Html.esc(v)}" required></div>`;
  }

  /**
   * Genera una lista desplegable.
   * @param n - Nombre e id del campo.
   * @param etiqueta - Texto de la etiqueta (HTML sin escapar).
   * @param lista - Opciones disponibles.
   * @param v - Valor actual.
   * @returns HTML del campo.
   */
  seleccion(n: string, etiqueta: string, lista: readonly OpcionCampo[], v: unknown): string {
    return `<div class="campo"><label for="${n}">${etiqueta}</label><select id="${n}" name="${n}" required>${this.opciones(lista, v)}</select></div>`;
  }

  /**
   * Genera una pregunta de sí o no con botones de opción.
   * @param n - Nombre del campo.
   * @param etiqueta - Texto de la pregunta (HTML sin escapar).
   * @param v - Valor actual: true, false o sin responder.
   * @returns HTML del grupo.
   */
  siNo(n: string, etiqueta: string, v: unknown): string {
    return `<div class="grupo"><span class="pregunta" id="l-${n}">${etiqueta}</span>
    <div class="radios" role="radiogroup" aria-labelledby="l-${n}">
      <label><input type="radio" name="${n}" value="si"${v === true ? ' checked' : ''} required> Sí</label>
      <label><input type="radio" name="${n}" value="no"${v === false ? ' checked' : ''}> No</label></div></div>`;
  }

  /**
   * Genera las opciones de una lista desplegable, con la actual seleccionada.
   * @param lista - Opciones disponibles.
   * @param actual - Valor actual.
   * @returns HTML de las opciones.
   */
  private opciones(lista: readonly OpcionCampo[], actual: unknown): string {
    return `<option value="">Selecciona…</option>` +
      lista.map(([v, t]) => `<option value="${v}"${String(actual) === v ? ' selected' : ''}>${Html.esc(t)}</option>`).join('');
  }
}
