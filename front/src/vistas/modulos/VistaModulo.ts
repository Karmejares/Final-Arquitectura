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
  /** Catálogo de secciones. */
  protected readonly catalogo: CatalogoSecciones;
  /** De aquí salen los valores guardados de la sección. */
  protected readonly repoBorrador: RepositorioBorrador;
  /** Lee el formulario al enviarlo. */
  protected readonly lector: LectorFormulario;
  /** Genera los campos del formulario. */
  protected readonly campos: Campos;
  private manejadorEnvio: ((datos: DatosSeccion, seq: boolean) => void) | null = null;

  /** @param d - Dependencias de la pantalla. */
  constructor(d: DepsModulo) {
    super(d.barra);
    this.catalogo = d.catalogo;
    this.repoBorrador = d.repoBorrador;
    this.lector = d.lector;
    this.campos = d.campos;
  }

  /**
   * El controlador se registra aquí; recibe los datos leídos y si el flujo es secuencial.
   * @param manejador - Se llama al enviar el formulario.
   */
  alEnviar(manejador: (datos: DatosSeccion, seq: boolean) => void): void {
    this.manejadorEnvio = manejador;
  }

  /** @returns Sección del borrador que edita la pantalla. */
  abstract seccion(): SeccionId;

  /** @returns Título de la pantalla. */
  protected abstract titulo(): string;

  /**
   * Genera los campos del formulario.
   * @param d - Valores guardados de la sección.
   * @returns HTML de los campos.
   */
  protected abstract cuerpo(d: DatosSeccion): string;

  /** @returns Texto del botón fuera del flujo secuencial. */
  protected abstract textoBoton(): string;

  /** @returns Campos que se leen como número. */
  protected numericos(): string[] {
    return [];
  }

  /** @returns Campos que se leen como booleano. */
  protected booleanos(): string[] {
    return [];
  }

  /**
   * HTML opcional entre el título y el formulario.
   * @returns HTML para insertar; vacío por defecto.
   */
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

  /**
   * Elige el texto del botón de envío.
   * @param seq - Si la pantalla se abre en el flujo secuencial.
   * @returns Texto del botón.
   */
  private botonEnvio(seq: boolean): string {
    if (seq) return this.seccion() !== 'clinica' ? 'Guardar y continuar' : 'Guardar y ver resultado';
    return this.textoBoton();
  }
}
