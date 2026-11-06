import type { DepsFabrica } from '../tipos/DepsFabrica';
import type { Vista } from '../vistas/Vista';
import { VistaFaq } from '../vistas/VistaFaq';
import { VistaHistorial } from '../vistas/VistaHistorial';
import { VistaInicio } from '../vistas/VistaInicio';
import { VistaLogin } from '../vistas/VistaLogin';
import { VistaRegistro } from '../vistas/VistaRegistro';
import { VistaResultado } from '../vistas/VistaResultado';

/** Factory Method: crea la vista de una ruta, o null si la ruta no existe. */
export class FabricaVistas {
  constructor(private readonly d: DepsFabrica) {}

  crear(ruta: string): Vista | null {
    const d = this.d;
    const m = ruta.match(/^\/resultado\/(\d+)$/);
    if (m) return new VistaResultado({ barra: d.barra, api: d.apiEvaluaciones, descarga: d.descarga, avisos: d.avisos, navegador: d.navegador, errores: d.errores }, m[1]);
    switch (ruta) {
      case '/login': return new VistaLogin({ barra: d.barra, api: d.apiAuth, sesion: d.sesion, repoBorrador: d.repoBorrador, avisos: d.avisos, navegador: d.navegador, errores: d.errores });
      case '/registro': return new VistaRegistro({ barra: d.barra, api: d.apiAuth, avisos: d.avisos, navegador: d.navegador, errores: d.errores });
      case '/inicio': return new VistaInicio({ barra: d.barra, repoBorrador: d.repoBorrador, catalogo: d.catalogo, flujo: d.flujo });
      case '/faq': return new VistaFaq({ barra: d.barra, sesion: d.sesion, minutos: d.minutos });
      case '/historial': return new VistaHistorial({ barra: d.barra, api: d.apiEvaluaciones, descarga: d.descarga, errores: d.errores });
      default: return null;
    }
  }
}
