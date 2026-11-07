import type { Almacen } from '../contratos/Almacen';
import type { AperturaSesion } from '../contratos/AperturaSesion';
import type { EstadoSesion } from '../contratos/EstadoSesion';
import type { FuenteToken } from '../contratos/FuenteToken';
import type { ObservadorCierre } from '../contratos/ObservadorCierre';

const K_TOKEN = 'cp_token';
const K_NOMBRE = 'cp_nombre';

/** Guarda el token y el nombre del usuario de la sesión actual. */
export class Sesion implements FuenteToken, EstadoSesion, AperturaSesion, ObservadorCierre {
  constructor(private readonly almacen: Almacen) {}

  token(): string | null {
    return this.almacen.leer(K_TOKEN);
  }

  renovar(t: string): void {
    this.almacen.escribir(K_TOKEN, t);
  }

  abrir(token: string, nombre: string): void {
    this.almacen.escribir(K_TOKEN, token);
    this.almacen.escribir(K_NOMBRE, nombre);
  }

  activa(): boolean {
    return !!this.token();
  }

  nombre(): string {
    return this.almacen.leer(K_NOMBRE) || '';
  }

  alCerrarSesion(): void {
    this.almacen.borrar(K_TOKEN);
    this.almacen.borrar(K_NOMBRE);
  }
}
