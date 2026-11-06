import type { DatosSeccion } from '../tipos/DatosSeccion';
import type { EstadoBorrador } from '../tipos/EstadoBorrador';
import type { SeccionId } from '../tipos/SeccionId';
import type { CatalogoSecciones } from './CatalogoSecciones';

/** Reglas del borrador: qué secciones están completas y qué se envía. */
export class Borrador {
  constructor(private readonly catalogo: CatalogoSecciones, private readonly estado: EstadoBorrador) {}

  seccion(s: SeccionId): DatosSeccion {
    return this.estado[s];
  }

  actualizar(s: SeccionId, d: DatosSeccion): void {
    this.estado[s] = d;
  }

  /** Solo undefined, null y '' cuentan como vacío (false y 0 son valores válidos). */
  completa(s: SeccionId): boolean {
    return this.catalogo.definicion(s).campos.every((c) => {
      const v = this.estado[s][c];
      return v !== undefined && v !== '' && v !== null;
    });
  }

  todoCompleto(): boolean {
    return this.catalogo.orden().every((s) => this.completa(s));
  }

  payload(): DatosSeccion {
    return Object.assign({}, ...this.catalogo.orden().map((s) => this.estado[s]));
  }

  faltantes(): SeccionId[] {
    return this.catalogo.orden().filter((s) => !this.completa(s));
  }

  cambioDesdeUltimoEnvio(): boolean {
    return JSON.stringify(this.payload()) !== this.estado.ultimo;
  }

  ultimoId(): number | null {
    return this.estado.ultimoId;
  }

  registrarEnvio(payload: DatosSeccion, id: number): void {
    this.estado.ultimo = JSON.stringify(payload);
    this.estado.ultimoId = id;
  }

  aEstado(): EstadoBorrador {
    return this.estado;
  }
}
