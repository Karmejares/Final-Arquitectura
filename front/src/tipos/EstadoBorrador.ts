import type { DatosSeccion } from './DatosSeccion';
import type { SeccionId } from './SeccionId';

/** Borrador guardado del formulario, con el último registro usado. */
export type EstadoBorrador = Record<SeccionId, DatosSeccion> & {
  /** JSON de lo último enviado; null si no se ha enviado nada. */
  ultimo: string | null;
  /** Id de la última evaluación creada; null si no hay. */
  ultimoId: number | null;
};
