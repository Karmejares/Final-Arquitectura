import type { EstadoSesion } from '../../contratos/EstadoSesion';
import { Html } from '../../interfaz/Html';
import type { DatosSeccion } from '../../tipos/DatosSeccion';
import type { DepsModulo } from '../../tipos/DepsModulo';
import type { OpcionCampo } from '../../tipos/OpcionCampo';
import type { SeccionId } from '../../tipos/SeccionId';
import { VistaModulo } from './VistaModulo';

/** Opciones de género. */
const GEN: readonly OpcionCampo[] = [['masculino', 'Masculino'], ['femenino', 'Femenino'], ['otro', 'Otro']];

/** Pantalla de datos personales. */
export class VistaDatos extends VistaModulo {
  /**
   * @param d - Dependencias de la pantalla.
   * @param sesion - De aquí sale el nombre para el saludo.
   */
  constructor(d: DepsModulo, private readonly sesion: EstadoSesion) {
    super(d);
  }

  seccion(): SeccionId { return 'datos'; }

  protected titulo(): string { return 'Registrar Datos Personales'; }

  protected textoBoton(): string { return 'Guardar Datos'; }

  protected override numericos(): string[] { return ['anio_nacimiento', 'peso_kg', 'altura_cm']; }

  /** @returns Saludo con el nombre del usuario. */
  protected override antes(): string {
    return `<div class="alerta alerta-ok">Bienvenido ${Html.esc(this.sesion.nombre())} 👋</div>`;
  }

  protected cuerpo(d: DatosSeccion): string {
    const c = this.campos;
    return `
      ${c.numero('anio_nacimiento', 'Año de nacimiento', d.anio_nacimiento ?? '', 'min="1900" max="' + new Date().getFullYear() + '" step="1"')}
      ${c.seleccion('genero', 'Género', GEN, d.genero ?? '')}
      ${c.numero('peso_kg', 'Peso (kg)', d.peso_kg ?? '', 'min="20" max="400"')}
      ${c.numero('altura_cm', 'Altura (cm)', d.altura_cm ?? '', 'min="80" max="250"')}`;
  }
}
