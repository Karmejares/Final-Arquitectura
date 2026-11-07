import type { EstadoSesion } from '../contratos/EstadoSesion';
import type { VigilanteInactividad } from '../servicios/VigilanteInactividad';
import type { Avisos } from './Avisos';
import type { FabricaVistas } from './FabricaVistas';
import type { Navegador } from './Navegador';

/** Rutas que no exigen sesión. */
const PUBLICAS = ['/login', '/registro', '/faq'];

/** Traduce el hash de la URL en una vista y la muestra. */
export class Enrutador {
  /**
   * @param fabrica - Crea la vista de cada ruta.
   * @param sesion - Estado de la sesión.
   * @param avisos - Avisos en pantalla.
   * @param navegador - Cambio de ruta.
   * @param vigilante - Reinicia su conteo en cada cambio de vista.
   */
  constructor(
    private readonly fabrica: FabricaVistas,
    private readonly sesion: EstadoSesion,
    private readonly avisos: Avisos,
    private readonly navegador: Navegador,
    private readonly vigilante: VigilanteInactividad,
  ) {}

  /** Escucha los cambios de hash y enruta la ruta actual una vez. */
  iniciar(): void {
    window.addEventListener('hashchange', () => this.enrutar());
    this.enrutar();
  }

  /**
   * Muestra la vista de la ruta actual.
   * Sin sesión, una ruta privada lleva al login; con sesión, el login y el registro llevan al Dashboard.
   * Una ruta desconocida lleva al Dashboard o al login, según haya sesión.
   */
  enrutar(): void {
    const [ruta, query = ''] = (location.hash.slice(1) || '/login').split('?');
    const seq = new URLSearchParams(query).get('seq') === '1';
    this.avisos.limpiar();
    if (!PUBLICAS.includes(ruta) && !this.sesion.activa()) return this.navegador.ir('#/login');
    if ((ruta === '/login' || ruta === '/registro') && this.sesion.activa()) return this.navegador.ir('#/inicio');
    const vista = this.fabrica.crear(ruta);
    if (vista) vista.mostrar(seq);
    else this.navegador.ir(this.sesion.activa() ? '#/inicio' : '#/login');
    this.avisos.mostrarPendiente();
    this.vigilante.reiniciar();
    if (!seq || ruta !== '/inicio') window.scrollTo(0, 0);
  }
}
