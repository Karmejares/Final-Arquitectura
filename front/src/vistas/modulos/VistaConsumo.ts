import type { DatosSeccion } from '../../tipos/DatosSeccion';
import type { SeccionId } from '../../tipos/SeccionId';
import { VistaModulo } from './VistaModulo';

/** Pantalla de hábitos de consumo (preguntas de sí o no). */
export class VistaConsumo extends VistaModulo {
  protected seccion(): SeccionId { return 'consumo'; }

  protected titulo(): string { return 'Hábitos de Consumo'; }

  protected textoBoton(): string { return 'Guardar'; }

  protected override booleanos(): string[] { return ['fuma', 'consume_alcohol', 'diabetes', 'antecedentes_familiares']; }

  protected cuerpo(d: DatosSeccion): string {
    const c = this.campos;
    return `
      ${c.siNo('fuma', '¿Fumas?', d.fuma)}
      ${c.siNo('consume_alcohol', '¿Consumes alcohol?', d.consume_alcohol)}
      ${c.siNo('diabetes', '¿Tienes diabetes?', d.diabetes)}
      ${c.siNo('antecedentes_familiares', '¿Tienes antecedentes familiares de enfermedad cardiovascular?', d.antecedentes_familiares)}`;
  }
}
