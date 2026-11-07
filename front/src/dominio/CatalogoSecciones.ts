import type { DefinicionSeccion } from '../tipos/DefinicionSeccion';
import type { SeccionId } from '../tipos/SeccionId';

const SECCIONES: Record<SeccionId, DefinicionSeccion> = {
  datos: { titulo: 'Datos personales', ruta: '#/datos', campos: ['anio_nacimiento', 'genero', 'peso_kg', 'altura_cm'] },
  alimentacion: { titulo: 'Hábitos alimenticios', ruta: '#/habitos-alimenticios', campos: ['frutas', 'verduras', 'comida_rapida', 'bebidas_azucaradas', 'agua'] },
  actividad: { titulo: 'Actividad física', ruta: '#/actividad', campos: ['actividad'] },
  consumo: { titulo: 'Hábitos de consumo', ruta: '#/consumo', campos: ['fuma', 'consume_alcohol', 'diabetes', 'antecedentes_familiares'] },
  clinica: { titulo: 'Presión arterial', ruta: '#/presion', campos: ['presion_sistolica', 'presion_diastolica', 'colesterol_total', 'colesterol_hdl'] },
};
const ORDEN: readonly SeccionId[] = ['datos', 'alimentacion', 'actividad', 'consumo', 'clinica'];

/** Sabe qué secciones existen: definición, orden y la siguiente. */
export class CatalogoSecciones {
  orden(): readonly SeccionId[] {
    return ORDEN;
  }

  definicion(s: SeccionId): DefinicionSeccion {
    return SECCIONES[s];
  }

  /** Posición de la sección, contando desde 1. */
  posicion(s: SeccionId): number {
    return ORDEN.indexOf(s) + 1;
  }

  total(): number {
    return ORDEN.length;
  }

  siguiente(s: SeccionId): SeccionId | null {
    return ORDEN[ORDEN.indexOf(s) + 1] ?? null;
  }
}
