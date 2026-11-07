import type { Almacen } from '../contratos/Almacen';
import type { ObservadorCierre } from '../contratos/ObservadorCierre';
import { Borrador } from '../dominio/Borrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { EstadoBorrador } from '../tipos/EstadoBorrador';

/** Clave del borrador en el almacén. */
const K_BORRADOR = 'cp_borrador';

/** Estado de un borrador sin datos. */
const vacio = (): EstadoBorrador => ({ datos: {}, alimentacion: {}, actividad: {}, consumo: {}, clinica: {}, ultimo: null, ultimoId: null });

/** Carga y guarda el Borrador en el almacén de la pestaña. */
export class RepositorioBorrador implements ObservadorCierre {
  /**
   * @param almacen - Almacén de la pestaña.
   * @param catalogo - Catálogo que necesita cada borrador.
   */
  constructor(private readonly almacen: Almacen, private readonly catalogo: CatalogoSecciones) {}

  /**
   * Carga el borrador guardado.
   * @returns El borrador; vacío si no hay nada guardado o el JSON está dañado.
   */
  leer(): Borrador {
    let estado: EstadoBorrador;
    try {
      estado = Object.assign(vacio(), JSON.parse(this.almacen.leer(K_BORRADOR) || '{}'));
    } catch (_) {
      estado = vacio();
    }
    return new Borrador(this.catalogo, estado);
  }

  /**
   * Guarda el borrador, reemplazando el anterior.
   * @param b - Borrador a guardar.
   */
  guardar(b: Borrador): void {
    this.almacen.escribir(K_BORRADOR, JSON.stringify(b.aEstado()));
  }

  /** Elimina el borrador guardado. */
  borrar(): void {
    this.almacen.borrar(K_BORRADOR);
  }

  /** Elimina el borrador para que no pase a la siguiente sesión. */
  alCerrarSesion(): void {
    this.borrar();
  }
}
