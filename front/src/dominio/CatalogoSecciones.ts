import type { DefinicionSeccion } from '../tipos/DefinicionSeccion';
import type { SeccionId } from '../tipos/SeccionId';

/** Título, ruta y campos de cada sección. */
const SECCIONES: Record<SeccionId, DefinicionSeccion> = {
  datos: { titulo: 'Datos personales', ruta: '#/datos', campos: ['anio_nacimiento', 'genero', 'peso_kg', 'altura_cm'] },
  alimentacion: { titulo: 'Hábitos alimenticios', ruta: '#/habitos-alimenticios', campos: ['frutas', 'verduras', 'comida_rapida', 'bebidas_azucaradas', 'agua'] },
  actividad: { titulo: 'Actividad física', ruta: '#/actividad', campos: ['actividad'] },
  consumo: { titulo: 'Hábitos de consumo', ruta: '#/consumo', campos: ['fuma', 'consume_alcohol', 'diabetes', 'antecedentes_familiares'] },
  clinica: { titulo: 'Presión arterial', ruta: '#/presion', campos: ['presion_sistolica', 'presion_diastolica', 'colesterol_total', 'colesterol_hdl'] },
};
/** Orden de las secciones en el flujo secuencial. */
const ORDEN: readonly SeccionId[] = ['datos', 'alimentacion', 'actividad', 'consumo', 'clinica'];

/** Sabe qué secciones existen: definición, orden y la siguiente. */
export class CatalogoSecciones {
  /** @returns Secciones en el orden del flujo. */
  orden(): readonly SeccionId[] {
    return ORDEN;
  }

  /**
   * @param s - Sección a consultar.
   * @returns Título, ruta y campos de la sección.
   */
  definicion(s: SeccionId): DefinicionSeccion {
    return SECCIONES[s];
  }

  /**
   * Posición de la sección, contando desde 1.
   * @param s - Sección a consultar.
   * @returns Número de paso en el flujo.
   */
  posicion(s: SeccionId): number {
    return ORDEN.indexOf(s) + 1;
  }

  /** @returns Cantidad de secciones. */
  total(): number {
    return ORDEN.length;
  }

  /**
   * @param s - Sección actual.
   * @returns La sección que sigue, o null si es la última.
   */
  siguiente(s: SeccionId): SeccionId | null {
    return ORDEN[ORDEN.indexOf(s) + 1] ?? null;
  }
}
