import type { DatosSeccion } from '../../tipos/DatosSeccion';
import type { OpcionCampo } from '../../tipos/OpcionCampo';
import type { SeccionId } from '../../tipos/SeccionId';
import { VistaModulo } from './VistaModulo';

/** Opciones del nivel de actividad. */
const ACT: readonly OpcionCampo[] = [['sedentario', 'Sedentario (poco o nada de ejercicio)'], ['moderado', 'Moderado (ejercicio 1 a 3 veces por semana)'], ['activo', 'Activo (ejercicio 4 o más veces por semana)']];

/** Pantalla de actividad física. */
export class VistaActividad extends VistaModulo {
  seccion(): SeccionId { return 'actividad'; }

  protected titulo(): string { return 'Selecciona tu nivel de actividad física'; }

  protected textoBoton(): string { return 'Guardar'; }

  protected cuerpo(d: DatosSeccion): string {
    return this.campos.seleccion('actividad', 'Nivel de actividad', ACT, d.actividad ?? '');
  }
}
