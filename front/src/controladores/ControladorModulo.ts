import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { Avisos } from '../interfaz/Avisos';
import type { Navegador } from '../interfaz/Navegador';
import type { FlujoEvaluacion } from '../servicios/FlujoEvaluacion';
import type { DatosSeccion } from '../tipos/DatosSeccion';
import type { VistaModulo } from '../vistas/modulos/VistaModulo';

/**
 * CONTROLADOR de las pantallas de módulo (datos, alimentación, actividad, consumo, presión).
 * Una sola clase sirve a todas: lee → ordena → reacciona.
 *   leer:     los datos que entrega la vista;
 *   ordenar:  guardar la sección en el borrador (modelo);
 *   reaccionar: seguir al siguiente paso, enviar la evaluación o volver al Dashboard.
 */
export class ControladorModulo {
  constructor(
    protected readonly vista: VistaModulo,
    private readonly repoBorrador: RepositorioBorrador,
    private readonly catalogo: CatalogoSecciones,
    private readonly flujo: FlujoEvaluacion,
    protected readonly avisos: Avisos,
    private readonly navegador: Navegador,
  ) {
    vista.alEnviar((datos, seq) => { void this.guardar(datos, seq); });
  }

  private async guardar(datos: DatosSeccion, seq: boolean): Promise<void> {
    this.avisos.limpiar();
    const seccion = this.vista.seccion();
    const faltan = this.catalogo.definicion(seccion).campos.filter((c) => datos[c] === undefined || datos[c] === '' || Number.isNaN(datos[c]));
    if (faltan.length) return this.avisos.mostrar('Completa todos los campos para continuar.', 'error');
    const borrador = this.repoBorrador.leer();
    borrador.actualizar(seccion, datos);
    this.repoBorrador.guardar(borrador);
    if (seq) {
      const siguiente = this.catalogo.siguiente(seccion);
      return siguiente ? this.navegador.ir(this.catalogo.definicion(siguiente).ruta + '?seq=1') : this.flujo.enviar();
    }
    this.avisos.avisarLuego('Datos guardados correctamente: ' + this.catalogo.definicion(seccion).titulo.toLowerCase() + '.');
    this.navegador.ir('#/inicio');
  }
}
