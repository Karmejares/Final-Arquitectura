import type { RepositorioBorrador } from '../../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../../dominio/CatalogoSecciones';
import type { Avisos } from '../../interfaz/Avisos';
import type { Campos } from '../../interfaz/Campos';
import type { LectorFormulario } from '../../interfaz/LectorFormulario';
import type { Navegador } from '../../interfaz/Navegador';
import type { FlujoEvaluacion } from '../../servicios/FlujoEvaluacion';
import type { DatosSeccion } from '../../tipos/DatosSeccion';
import type { DepsModulo } from '../../tipos/DepsModulo';
import type { SeccionId } from '../../tipos/SeccionId';
import type { TipoBarra } from '../../tipos/TipoBarra';
import { Vista } from '../Vista';

/** Esqueleto de las pantallas de módulo (Template Method): pinta el formulario y guarda al enviar. */
export abstract class VistaModulo extends Vista {
  protected readonly catalogo: CatalogoSecciones;
  protected readonly repoBorrador: RepositorioBorrador;
  protected readonly avisos: Avisos;
  protected readonly navegador: Navegador;
  protected readonly lector: LectorFormulario;
  protected readonly flujo: FlujoEvaluacion;
  protected readonly campos: Campos;

  constructor(d: DepsModulo) {
    super(d.barra);
    this.catalogo = d.catalogo;
    this.repoBorrador = d.repoBorrador;
    this.avisos = d.avisos;
    this.navegador = d.navegador;
    this.lector = d.lector;
    this.flujo = d.flujo;
    this.campos = d.campos;
  }

  protected abstract seccion(): SeccionId;

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

  protected contenido(seq: boolean): void | Promise<void> {
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
    this.$<HTMLFormElement>('#form').onsubmit = (ev) => this.alEnviar(ev, seq);
  }

  private botonEnvio(seq: boolean): string {
    if (seq) return this.seccion() !== 'clinica' ? 'Guardar y continuar' : 'Guardar y ver resultado';
    return this.textoBoton();
  }

  private async alEnviar(ev: SubmitEvent, seq: boolean): Promise<void> {
    ev.preventDefault();
    this.avisos.limpiar();
    const seccion = this.seccion();
    const datos = this.lector.leer(ev.target as HTMLFormElement, this.numericos(), this.booleanos());
    const faltan = this.catalogo.definicion(seccion).campos.filter((c) => datos[c] === undefined || datos[c] === '' || Number.isNaN(datos[c]));
    if (faltan.length) return this.avisos.mostrar('Completa todos los campos para continuar.', 'error');
    const bor = this.repoBorrador.leer();
    bor.actualizar(seccion, datos);
    this.repoBorrador.guardar(bor);
    if (seq) {
      const sig = this.catalogo.siguiente(seccion);
      return sig ? this.navegador.ir(this.catalogo.definicion(sig).ruta + '?seq=1') : this.flujo.enviar();
    }
    this.avisos.avisarLuego('Datos guardados correctamente: ' + this.catalogo.definicion(seccion).titulo.toLowerCase() + '.');
    this.navegador.ir('#/inicio');
  }
}
