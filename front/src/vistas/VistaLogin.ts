import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

/** Pantalla de inicio de sesión (VISTA): dibuja el formulario y avisa cuando el usuario lo envía. */
export class VistaLogin extends Vista {
  private manejadorEnvio: ((correo: string, password: string) => void) | null = null;

  /** @param barra - Barra de navegación de la pantalla. */
  constructor(barra: BarraNavegacion) {
    super(barra);
  }

  /**
   * Registra quién atiende el envío del formulario.
   * @param manejador - Recibe el correo sin espacios en los extremos y la contraseña.
   */
  alEnviar(manejador: (correo: string, password: string) => void): void {
    this.manejadorEnvio = manejador;
  }

  protected tipoBarra(): TipoBarra {
    return 'auth';
  }

  protected contenido(): void {
    this.pintar(`<div class="contenedor-estrecho"><div class="tarjeta"><h1>Login</h1>
      <form id="form" novalidate>
        <div class="campo"><label for="correo">Correo</label><input id="correo" name="correo" type="email" autocomplete="username" required></div>
        <div class="campo"><label for="password">Contraseña</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
        <button class="btn btn-oscuro btn-ancho" type="submit">Entrar</button></form>
      <p class="enlace-centro">¿No tienes cuenta? <a href="#/registro">Regístrate</a></p></div></div>`);
    this.$<HTMLFormElement>('#form').onsubmit = (ev) => {
      ev.preventDefault();
      this.manejadorEnvio?.(this.$<HTMLInputElement>('#correo').value.trim(), this.$<HTMLInputElement>('#password').value);
    };
  }
}
