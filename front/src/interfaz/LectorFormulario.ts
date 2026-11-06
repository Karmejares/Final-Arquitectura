import type { DatosSeccion } from '../tipos/DatosSeccion';

/** Lee un formulario y lo convierte en datos de sección (números y booleanos según se indique). */
export class LectorFormulario {
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
