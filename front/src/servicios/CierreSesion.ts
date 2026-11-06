import type { ObservadorCierre } from '../contratos/ObservadorCierre';
import type { Avisos } from '../interfaz/Avisos';
import type { Navegador } from '../interfaz/Navegador';

/** Sujeto del Observer: al cerrar sesión avisa a sus observadores y vuelve al login. */
export class CierreSesion {
  private readonly observadores: ObservadorCierre[] = [];

  constructor(private readonly avisos: Avisos, private readonly navegador: Navegador) {}

  suscribir(o: ObservadorCierre): void {
    this.observadores.push(o);
  }

  ejecutar(aviso?: string): void {
    this.observadores.forEach((o) => o.alCerrarSesion());
    if (aviso) this.avisos.avisarLuego(aviso, 'aviso');
    this.navegador.ir('#/login');
  }
}
