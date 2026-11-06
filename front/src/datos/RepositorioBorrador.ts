import type { Almacen } from '../contratos/Almacen';
import type { ObservadorCierre } from '../contratos/ObservadorCierre';
import { Borrador } from '../dominio/Borrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { EstadoBorrador } from '../tipos/EstadoBorrador';

const K_BORRADOR = 'cp_borrador';

const vacio = (): EstadoBorrador => ({ datos: {}, alimentacion: {}, actividad: {}, consumo: {}, clinica: {}, ultimo: null, ultimoId: null });

/** Carga y guarda el Borrador en el almacén de la pestaña. */
export class RepositorioBorrador implements ObservadorCierre {
  constructor(private readonly almacen: Almacen, private readonly catalogo: CatalogoSecciones) {}

  leer(): Borrador {
    let estado: EstadoBorrador;
    try {
      estado = Object.assign(vacio(), JSON.parse(this.almacen.leer(K_BORRADOR) || '{}'));
    } catch (_) {
      estado = vacio();
    }
    return new Borrador(this.catalogo, estado);
  }

  guardar(b: Borrador): void {
    this.almacen.escribir(K_BORRADOR, JSON.stringify(b.aEstado()));
  }

  borrar(): void {
    this.almacen.borrar(K_BORRADOR);
  }

  alCerrarSesion(): void {
    this.borrar();
  }
}
