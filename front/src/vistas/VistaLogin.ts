import type { AperturaSesion } from '../contratos/AperturaSesion';
import type { ApiAuth } from '../contratos/ApiAuth';
import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { Avisos } from '../interfaz/Avisos';
import type { BarraNavegacion } from '../interfaz/BarraNavegacion';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { Navegador } from '../interfaz/Navegador';
import type { TipoBarra } from '../tipos/TipoBarra';
import { Vista } from './Vista';

interface DepsLogin {
  barra: BarraNavegacion;
  api: ApiAuth;
  sesion: AperturaSesion;
  repoBorrador: RepositorioBorrador;
  avisos: Avisos;
  navegador: Navegador;
  errores: ManejadorErrores;
}

/** Pantalla de inicio de sesión. */
export class VistaLogin extends Vista {
  private readonly api: ApiAuth;
  private readonly sesion: AperturaSesion;
  private readonly repoBorrador: RepositorioBorrador;
  private readonly avisos: Avisos;
  private readonly navegador: Navegador;
  private readonly errores: ManejadorErrores;

  constructor(d: DepsLogin) {
    super(d.barra);
    this.api = d.api;
    this.sesion = d.sesion;
    this.repoBorrador = d.repoBorrador;
    this.avisos = d.avisos;
    this.navegador = d.navegador;
    this.errores = d.errores;
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
    this.$<HTMLFormElement>('#form').onsubmit = async (ev) => {
      ev.preventDefault(); this.avisos.limpiar();
      try {
        const r = await this.api.login(this.$<HTMLInputElement>('#correo').value.trim(), this.$<HTMLInputElement>('#password').value);
        this.sesion.abrir(r.token, r.nombre);
        this.repoBorrador.borrar();
        this.avisos.avisarLuego('Bienvenido ' + this.sesion.nombre() + ' 👋');
        this.navegador.ir('#/inicio');
      } catch (e) { this.errores.mostrar(e); }
    };
  }
}
