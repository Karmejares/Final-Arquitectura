import { AlmacenSesion } from './datos/AlmacenSesion';
import { Api } from './datos/Api';
import { ClienteHttp } from './datos/ClienteHttp';
import { RepositorioBorrador } from './datos/RepositorioBorrador';
import { Sesion } from './datos/Sesion';
import { CatalogoSecciones } from './dominio/CatalogoSecciones';
import { Avisos } from './interfaz/Avisos';
import { BarraNavegacion } from './interfaz/BarraNavegacion';
import { Campos } from './interfaz/Campos';
import { Enrutador } from './interfaz/Enrutador';
import { FabricaVistas } from './interfaz/FabricaVistas';
import { LectorFormulario } from './interfaz/LectorFormulario';
import { ManejadorErrores } from './interfaz/ManejadorErrores';
import { Navegador } from './interfaz/Navegador';
import { CierreSesion } from './servicios/CierreSesion';
import { DescargaPdf } from './servicios/DescargaPdf';
import { FlujoEvaluacion } from './servicios/FlujoEvaluacion';
import { VigilanteInactividad } from './servicios/VigilanteInactividad';

const MINUTOS_INACTIVIDAD = 15;

/** Raíz de composición: crea los objetos, los conecta y arranca. */
export class App {
  iniciar(): void {
    const almacen = new AlmacenSesion();
    const sesion = new Sesion(almacen);
    const catalogo = new CatalogoSecciones();
    const repoBorrador = new RepositorioBorrador(almacen, catalogo);
    const api = new Api(new ClienteHttp(sesion));

    const avisos = new Avisos(document.querySelector('#flash') as HTMLElement);
    const navegador = new Navegador();
    const cierre = new CierreSesion(avisos, navegador);
    cierre.suscribir(sesion);
    cierre.suscribir(repoBorrador);

    const errores = new ManejadorErrores(avisos, cierre);
    const barra = new BarraNavegacion(document.querySelector('#barra') as HTMLElement, cierre);
    const flujo = new FlujoEvaluacion(repoBorrador, catalogo, api, avisos, navegador, errores);
    const descarga = new DescargaPdf(api, errores);
    const vigilante = new VigilanteInactividad(sesion, cierre, MINUTOS_INACTIVIDAD);

    const fabrica = new FabricaVistas({
      barra, apiAuth: api, apiEvaluaciones: api, sesion, repoBorrador, catalogo,
      flujo, descarga, avisos, navegador, errores, lector: new LectorFormulario(), campos: new Campos(),
      minutos: MINUTOS_INACTIVIDAD,
    });
    const enrutador = new Enrutador(fabrica, sesion, avisos, navegador, vigilante);

    vigilante.iniciar();
    enrutador.iniciar();
  }
}
