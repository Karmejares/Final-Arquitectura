import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { DatosRegistro } from '../tipos/DatosRegistro';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

/** Pantalla de registro de cuenta (VISTA): dibuja el formulario y avisa cuando el usuario lo envía. */
export class VistaRegistro extends Vista {
  private manejadorEnvio: ((datos: DatosRegistro) => void) | null = null;

  /** @param barra - Barra de navegación de la pantalla. */
  constructor(barra: BarraNavegacion) {
    super(barra);
  }

  /**
   * Registra quién atiende el envío del formulario.
   * @param manejador - Recibe los datos escritos por el usuario.
   */
  alEnviar(manejador: (datos: DatosRegistro) => void): void {
    this.manejadorEnvio = manejador;
  }

  protected tipoBarra(): TipoBarra {
    return 'auth';
  }

  protected contenido(): void {
    this.pintar(`<div class="contenedor-estrecho"><div class="tarjeta"><h1>Registro</h1>
      <form id="form" novalidate>
        <div class="campo"><label for="nombre">Nombre de usuario</label><input id="nombre" name="nombre" type="text" autocomplete="name" required></div>
        <div class="campo"><label for="correo">Correo</label><input id="correo" name="correo" type="email" autocomplete="username" required></div>
        <div class="campo"><label for="password">Contraseña</label><input id="password" name="password" type="password" autocomplete="new-password" aria-describedby="ayuda-pw" required>
          <small id="ayuda-pw" class="muted">Mínimo 8 caracteres, con letras y números.</small></div>
        <button class="btn btn-azul btn-ancho" type="submit">Registrarse</button></form>
      <p class="enlace-centro">¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></p></div></div>`);
    this.$<HTMLFormElement>('#form').onsubmit = (ev) => {
      ev.preventDefault();
      this.manejadorEnvio?.({
        nombre: this.$<HTMLInputElement>('#nombre').value.trim(),
        correo: this.$<HTMLInputElement>('#correo').value.trim(),
        password: this.$<HTMLInputElement>('#password').value,
      });
    };
  }
}
