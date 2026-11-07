import type { Almacen } from '../contratos/Almacen';
import type { AperturaSesion } from '../contratos/AperturaSesion';
import type { EstadoSesion } from '../contratos/EstadoSesion';
import type { FuenteToken } from '../contratos/FuenteToken';
import type { ObservadorCierre } from '../contratos/ObservadorCierre';

/** Clave del token en el almacén. */
const K_TOKEN = 'cp_token';
/** Clave del nombre del usuario en el almacén. */
const K_NOMBRE = 'cp_nombre';

/** Guarda el token y el nombre del usuario de la sesión actual. */
export class Sesion implements FuenteToken, EstadoSesion, AperturaSesion, ObservadorCierre {
  /** @param almacen - Almacén de la pestaña. */
  constructor(private readonly almacen: Almacen) {}

  /** @returns Token actual, o null si no hay sesión. */
  token(): string | null {
    return this.almacen.leer(K_TOKEN);
  }

  /**
   * Reemplaza el token por el que entregó el servidor.
   * @param t - Token nuevo.
   */
  renovar(t: string): void {
    this.almacen.escribir(K_TOKEN, t);
  }

  /**
   * Guarda los datos de una sesión recién iniciada.
   * @param token - JWT de la sesión.
   * @param nombre - Nombre del usuario.
   */
  abrir(token: string, nombre: string): void {
    this.almacen.escribir(K_TOKEN, token);
    this.almacen.escribir(K_NOMBRE, nombre);
  }

  /** @returns true si hay un token guardado. */
  activa(): boolean {
    return !!this.token();
  }

  /** @returns Nombre del usuario, o cadena vacía si no hay sesión. */
  nombre(): string {
    return this.almacen.leer(K_NOMBRE) || '';
  }

  /** Elimina el token y el nombre del usuario. */
  alCerrarSesion(): void {
    this.almacen.borrar(K_TOKEN);
    this.almacen.borrar(K_NOMBRE);
  }
}
