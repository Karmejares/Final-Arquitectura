import type { OpcionCampo } from '../tipos/OpcionCampo';
import { Html } from './Html';

/** Genera el HTML de los campos reutilizables de los formularios. */
export class Campos {
  numero(n: string, etiqueta: string, v: unknown, extra = ''): string {
    return `<div class="campo"><label for="${n}">${etiqueta}</label><input id="${n}" name="${n}" type="number" step="any" ${extra} value="${Html.esc(v)}" required></div>`;
  }

  seleccion(n: string, etiqueta: string, lista: readonly OpcionCampo[], v: unknown): string {
    return `<div class="campo"><label for="${n}">${etiqueta}</label><select id="${n}" name="${n}" required>${this.opciones(lista, v)}</select></div>`;
  }

  siNo(n: string, etiqueta: string, v: unknown): string {
    return `<div class="grupo"><span class="pregunta" id="l-${n}">${etiqueta}</span>
    <div class="radios" role="radiogroup" aria-labelledby="l-${n}">
      <label><input type="radio" name="${n}" value="si"${v === true ? ' checked' : ''} required> Sí</label>
      <label><input type="radio" name="${n}" value="no"${v === false ? ' checked' : ''}> No</label></div></div>`;
  }

  private opciones(lista: readonly OpcionCampo[], actual: unknown): string {
    return `<option value="">Selecciona…</option>` +
      lista.map(([v, t]) => `<option value="${v}"${String(actual) === v ? ' selected' : ''}>${Html.esc(t)}</option>`).join('');
  }
}
