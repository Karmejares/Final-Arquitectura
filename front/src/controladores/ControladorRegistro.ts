import type { ApiAuth } from '../contratos/ApiAuth';
import type { Avisos } from '../interfaz/Avisos';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { Navegador } from '../interfaz/Navegador';
import type { DatosRegistro } from '../tipos/DatosRegistro';
import type { VistaRegistro } from '../vistas/VistaRegistro';

/** CONTROLADOR del registro: envía los datos a la API y lleva al usuario al login (o muestra el error). */
export class ControladorRegistro {
  constructor(
    vista: VistaRegistro,
    private readonly api: ApiAuth,
    private readonly avisos: Avisos,
    private readonly navegador: Navegador,
    private readonly errores: ManejadorErrores,
  ) {
    vista.alEnviar((datos) => { void this.registrar(datos); });
  }

  private async registrar(datos: DatosRegistro): Promise<void> {
    this.avisos.limpiar();
    try {
      await this.api.registro(datos);
      this.avisos.avisarLuego('Cuenta creada. Ahora inicia sesión.');
      this.navegador.ir('#/login');
    } catch (e) { this.errores.mostrar(e); }
  }
}
