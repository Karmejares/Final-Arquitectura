import type { RepositorioBorrador } from '../../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../../dominio/CatalogoSecciones';
import type { Campos } from '../../interfaz/Campos';
import type { LectorFormulario } from '../../interfaz/LectorFormulario';
import type { DatosSeccion } from '../../tipos/DatosSeccion';
import type { DepsModulo } from '../../tipos/DepsModulo';
import type { SeccionId } from '../../tipos/SeccionId';
import type { TipoBarra } from '../../tipos/TipoBarra';
import { Vista } from '../Vista';

/**
 * Esqueleto de las pantallas de módulo (VISTA, Template Method): pinta el formulario, lee lo que el
 * usuario escribió y se lo entrega al controlador. No valida, no guarda y no navega: eso es del controlador.
 */
export abstract class VistaModulo extends Vista {
  protected readonly catalogo: CatalogoSecciones;
  protected readonly repoBorrador: RepositorioBorrador;
  protected readonly lector: LectorFormulario;
  protected readonly campos: Campos;
  private manejadorEnvio: ((datos: DatosSeccion, seq: boolean) => void) | null = null;

  constructor(d: DepsModulo) {
    super(d.barra);
    this.catalogo = d.catalogo;
    this.repoBorrador = d.repoBorrador;
    this.lector = d.lector;
    this.campos = d.campos;
  }

  /** El controlador se registra aquí; recibe los datos leídos y si el flujo es secuencial. */
  alEnviar(manejador: (datos: DatosSeccion, seq: boolean) => void): void {
    this.manejadorEnvio = manejador;
  }

  abstract seccion(): SeccionId;

  protected abstract titulo(): string;

  protected abstract cuerpo(d: DatosSeccion): string;

  protected abstract textoBoton(): string;

  protected numericos(): string[] {
    return [];
  }

  protected booleanos(): string[] {
    return [];
  }

  /** HTML opcional entre el título y el formulario. */
  protected antes(): string {
    return '';
  }

  protected tipoBarra(): TipoBarra {
    return 'interna';
  }

  protected contenido(seq: boolean): void {
    const seccion = this.seccion();
    const b = this.repoBorrador.leer();
    const pos = this.catalogo.posicion(seccion);
    this.pintar(`<div class="contenedor-estrecho"><div class="tarjeta">
      <h1>${this.titulo()}</h1>
      ${seq ? `<p class="muted centrado pequeno">Paso ${pos} de ${this.catalogo.total()}</p>` : ''}
      ${this.antes()}
      <form id="form" novalidate>${this.cuerpo(b.seccion(seccion))}
        <button class="btn btn-azul btn-ancho" type="submit">${this.botonEnvio(seq)}</button></form>
      <p class="enlace-centro"><a href="#/inicio">Volver al Dashboard</a></p></div></div>`);
    this.$<HTMLFormElement>('#form').onsubmit = (ev) => {
      ev.preventDefault();
      const datos = this.lector.leer(ev.target as HTMLFormElement, this.numericos(), this.booleanos());
      this.manejadorEnvio?.(datos, seq);
    };
  }

  private botonEnvio(seq: boolean): string {
    if (seq) return this.seccion() !== 'clinica' ? 'Guardar y continuar' : 'Guardar y ver resultado';
    return this.textoBoton();
  }
}
