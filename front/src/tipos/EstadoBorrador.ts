import type { DatosSeccion } from './DatosSeccion';
import type { SeccionId } from './SeccionId';

/** Borrador guardado del formulario, con el último registro usado. */
export type EstadoBorrador = Record<SeccionId, DatosSeccion> & {
  ultimo: string | null;
  ultimoId: number | null;
};
