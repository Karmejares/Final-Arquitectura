import type { AperturaSesion } from '../contratos/AperturaSesion';
import type { ApiAuth } from '../contratos/ApiAuth';
import { ApiError } from '../datos/ApiError';
import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { Avisos } from '../interfaz/Avisos';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { Navegador } from '../interfaz/Navegador';
import type { VistaLogin } from '../vistas/VistaLogin';

/**
 * CONTROLADOR del inicio de sesión. Lee lo que entrega la vista, ordena al modelo (la API y la sesión)
 * y reacciona: bienvenida y salto al Dashboard, o el error en pantalla.
 */
export class ControladorLogin {
  constructor(
    vista: VistaLogin,
    private readonly api: ApiAuth,
    private readonly sesion: AperturaSesion,
    private readonly repoBorrador: RepositorioBorrador,
    private readonly avisos: Avisos,
    private readonly navegador: Navegador,
    private readonly errores: ManejadorErrores,
  ) {
    vista.alEnviar((correo, password) => { void this.entrar(correo, password); });
  }

  private async entrar(correo: string, password: string): Promise<void> {
    this.avisos.limpiar();
    try {
      const r = await this.api.login(correo, password);
      this.sesion.abrir(r.token, r.nombre);
      this.repoBorrador.borrar();
      this.avisos.avisarLuego('Bienvenido ' + this.sesion.nombre() + ' 👋');
      this.navegador.ir('#/inicio');
    } catch (e) {
      // Credenciales incorrectas también llegan como 401: aquí no es "sesión vencida", es un error del formulario.
      if (e instanceof ApiError && e.status === 401) this.avisos.mostrar(e.mensajes[0], 'error');
      else this.errores.mostrar(e);
    }
  }
}
