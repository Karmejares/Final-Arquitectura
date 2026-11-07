import type { DatosSeccion } from '../tipos/DatosSeccion';
import type { EstadoBorrador } from '../tipos/EstadoBorrador';
import type { SeccionId } from '../tipos/SeccionId';
import type { CatalogoSecciones } from './CatalogoSecciones';

/** Reglas del borrador: qué secciones están completas y qué se envía. */
export class Borrador {
  /**
   * @param catalogo - Define las secciones y sus campos.
   * @param estado - Estado guardado del borrador.
   */
  constructor(private readonly catalogo: CatalogoSecciones, private readonly estado: EstadoBorrador) {}

  /**
   * @param s - Sección a consultar.
   * @returns Campos guardados de la sección.
   */
  seccion(s: SeccionId): DatosSeccion {
    return this.estado[s];
  }

  /**
   * Reemplaza los campos de una sección.
   * @param s - Sección a actualizar.
   * @param d - Campos nuevos.
   */
  actualizar(s: SeccionId, d: DatosSeccion): void {
    this.estado[s] = d;
  }

  /**
   * Indica si una sección tiene todos sus campos.
   * Solo undefined, null y '' cuentan como vacío (false y 0 son valores válidos).
   * @param s - Sección a revisar.
   * @returns true si no falta ningún campo.
   */
  completa(s: SeccionId): boolean {
    return this.catalogo.definicion(s).campos.every((c) => {
      const v = this.estado[s][c];
      return v !== undefined && v !== '' && v !== null;
    });
  }

  /** @returns true si todas las secciones están completas. */
  todoCompleto(): boolean {
    return this.catalogo.orden().every((s) => this.completa(s));
  }

  /** @returns Campos de todas las secciones en un solo objeto, listos para enviar. */
  payload(): DatosSeccion {
    return Object.assign({}, ...this.catalogo.orden().map((s) => this.estado[s]));
  }

  /** @returns Secciones incompletas, en el orden del flujo. */
  faltantes(): SeccionId[] {
    return this.catalogo.orden().filter((s) => !this.completa(s));
  }

  /** @returns true si el payload actual difiere del último enviado. */
  cambioDesdeUltimoEnvio(): boolean {
    return JSON.stringify(this.payload()) !== this.estado.ultimo;
  }

  /** @returns Id de la última evaluación enviada, o null si no hay. */
  ultimoId(): number | null {
    return this.estado.ultimoId;
  }

  /**
   * Recuerda lo último enviado y la evaluación que creó.
   * @param payload - Campos enviados.
   * @param id - Id de la evaluación creada.
   */
  registrarEnvio(payload: DatosSeccion, id: number): void {
    this.estado.ultimo = JSON.stringify(payload);
    this.estado.ultimoId = id;
  }

  /** @returns Estado para persistir. */
  aEstado(): EstadoBorrador {
    return this.estado;
  }
}
