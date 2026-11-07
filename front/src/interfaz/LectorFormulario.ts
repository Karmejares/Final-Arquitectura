import type { DatosSeccion } from '../tipos/DatosSeccion';

/** Lee un formulario y lo convierte en datos de sección (números y booleanos según se indique). */
export class LectorFormulario {
  /**
   * Lee los campos de un formulario.
   * @param f - Formulario a leer.
   * @param numericos - Campos que se convierten a número; vacíos quedan como ''.
   * @param booleanos - Campos que se convierten a booleano ('si' es true).
   * @returns Valores por nombre de campo.
   */
  leer(f: HTMLFormElement, numericos: readonly string[] = [], booleanos: readonly string[] = []): DatosSeccion {
    const out: DatosSeccion = {};
    const fd = new FormData(f);
    for (const [k, valor] of fd.entries()) {
      const v = valor as string;
      out[k] = numericos.includes(k) ? (v === '' ? '' : Number(v)) : (booleanos.includes(k) ? v === 'si' : v);
    }
    return out;
  }
}
