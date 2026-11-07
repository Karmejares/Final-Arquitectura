import type { ObservadorCierre } from '../contratos/ObservadorCierre';
import type { Avisos } from '../interfaz/Avisos';
import type { Navegador } from '../interfaz/Navegador';

/** Sujeto del Observer: al cerrar sesión avisa a sus observadores y vuelve al login. */
export class CierreSesion {
  private readonly observadores: ObservadorCierre[] = [];

  /**
   * @param avisos - Guarda el aviso para mostrarlo en el login.
   * @param navegador - Lleva al login.
   */
  constructor(private readonly avisos: Avisos, private readonly navegador: Navegador) {}

  /**
   * Agrega un observador del cierre.
   * @param o - Observador que se agrega.
   */
  suscribir(o: ObservadorCierre): void {
    this.observadores.push(o);
  }

  /**
   * Cierra la sesión: avisa a los observadores y vuelve al login.
   * @param aviso - Mensaje opcional para mostrar en el login.
   */
  ejecutar(aviso?: string): void {
    this.observadores.forEach((o) => o.alCerrarSesion());
    if (aviso) this.avisos.avisarLuego(aviso, 'aviso');
    this.navegador.ir('#/login');
  }
}
