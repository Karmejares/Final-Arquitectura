import type { EstadoSesion } from '../contratos/EstadoSesion';
import type { CierreSesion } from './CierreSesion';

/** Cierra la sesión tras N minutos sin actividad del usuario. */
export class VigilanteInactividad {
  private temporizador: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly sesion: EstadoSesion, private readonly cierre: CierreSesion, private readonly minutos: number) {}

  /** Registra los eventos de actividad que reinician el conteo. */
  iniciar(): void {
    ['click', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => this.reiniciar(), { passive: true }));
  }

  reiniciar(): void {
    if (this.temporizador !== null) clearTimeout(this.temporizador);
    if (!this.sesion.activa()) return;
    this.temporizador = setTimeout(() => this.cierre.ejecutar('Tu sesión se cerró por inactividad.'), this.minutos * 60 * 1000);
  }
}
