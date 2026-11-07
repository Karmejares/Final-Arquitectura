import type { ApiAuth } from '../contratos/ApiAuth';
import type { Avisos } from '../interfaz/Avisos';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { Navegador } from '../interfaz/Navegador';
import type { DatosRegistro } from '../tipos/DatosRegistro';
import type { VistaRegistro } from '../vistas/VistaRegistro';

/** CONTROLADOR del registro: envía los datos a la API y lleva al usuario al login (o muestra el error). */
export class ControladorRegistro {
  /**
   * Se registra en los eventos de la vista.
   * @param vista - Pantalla de registro.
   * @param api - Endpoints de cuenta.
   * @param avisos - Avisos en pantalla.
   * @param navegador - Cambio de ruta.
   * @param errores - Presenta los errores del registro.
   */
  constructor(
    vista: VistaRegistro,
    private readonly api: ApiAuth,
    private readonly avisos: Avisos,
    private readonly navegador: Navegador,
    private readonly errores: ManejadorErrores,
  ) {
    vista.alEnviar((datos) => { void this.registrar(datos); });
  }

  /**
   * Crea la cuenta y lleva al login.
   * @param datos - Datos escritos por el usuario.
   */
  private async registrar(datos: DatosRegistro): Promise<void> {
    this.avisos.limpiar();
    try {
      await this.api.registro(datos);
      this.avisos.avisarLuego('Cuenta creada. Ahora inicia sesión.');
      this.navegador.ir('#/login');
    } catch (e) { this.errores.mostrar(e); }
  }
}
