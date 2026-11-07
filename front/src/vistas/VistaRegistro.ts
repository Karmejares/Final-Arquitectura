import type { ApiAuth } from '../contratos/ApiAuth';
import type { Avisos } from '../interfaz/Avisos';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { Navegador } from '../interfaz/Navegador';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

interface DepsRegistro {
  barra: BarraNavegacion;
  api: ApiAuth;
  avisos: Avisos;
  navegador: Navegador;
  errores: ManejadorErrores;
}

/** Pantalla de registro de cuenta. */
export class VistaRegistro extends Vista {
  private readonly api: ApiAuth;
  private readonly avisos: Avisos;
  private readonly navegador: Navegador;
  private readonly errores: ManejadorErrores;

  constructor(d: DepsRegistro) {
    super(d.barra);
    this.api = d.api;
    this.avisos = d.avisos;
    this.navegador = d.navegador;
    this.errores = d.errores;
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
    this.$<HTMLFormElement>('#form').onsubmit = async (ev) => {
      ev.preventDefault(); this.avisos.limpiar();
      try {
        await this.api.registro({
          nombre: this.$<HTMLInputElement>('#nombre').value.trim(),
          correo: this.$<HTMLInputElement>('#correo').value.trim(),
          password: this.$<HTMLInputElement>('#password').value,
        });
        this.avisos.avisarLuego('Cuenta creada. Ahora inicia sesión.'); this.navegador.ir('#/login');
      } catch (e) { this.errores.mostrar(e); }
    };
  }
}
