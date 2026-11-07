import type { DatosSeccion } from '../../tipos/DatosSeccion';
import type { OpcionCampo } from '../../tipos/OpcionCampo';
import type { SeccionId } from '../../tipos/SeccionId';
import { VistaModulo } from './VistaModulo';

/** Opciones de frecuencia de consumo. */
const FREC: readonly OpcionCampo[] = [['nunca', 'Nunca'], ['ocasionalmente', 'Ocasionalmente'], ['diariamente', 'Diariamente']];
/** Opciones de consumo de agua. */
const AGUA: readonly OpcionCampo[] = [['menos_de_1_litro', 'Menos de 1 litro'], ['de_1_a_2_litros', 'De 1 a 2 litros'], ['mas_de_2_litros', 'Más de 2 litros']];

/** Pantalla de hábitos alimenticios. */
export class VistaAlimentacion extends VistaModulo {
  seccion(): SeccionId { return 'alimentacion'; }

  protected titulo(): string { return 'Hábitos Alimenticios'; }

  protected textoBoton(): string { return 'Actualizar respuestas'; }

  protected cuerpo(d: DatosSeccion): string {
    const c = this.campos;
    return `
      ${c.seleccion('frutas', '¿Consumes frutas?', FREC, d.frutas ?? '')}
      ${c.seleccion('verduras', '¿Consumes verduras?', FREC, d.verduras ?? '')}
      ${c.seleccion('comida_rapida', '¿Consumes comida rápida?', FREC, d.comida_rapida ?? '')}
      ${c.seleccion('bebidas_azucaradas', '¿Consumes bebidas azucaradas?', FREC, d.bebidas_azucaradas ?? '')}
      ${c.seleccion('agua', '¿Cuánta agua tomas al día?', AGUA, d.agua ?? '')}`;
  }
}
