import { ControladorHistorial } from '../controladores/ControladorHistorial';
import { ControladorInicio } from '../controladores/ControladorInicio';
import { ControladorLogin } from '../controladores/ControladorLogin';
import { ControladorModulo } from '../controladores/ControladorModulo';
import { ControladorPresion } from '../controladores/ControladorPresion';
import { ControladorRegistro } from '../controladores/ControladorRegistro';
import { ControladorResultado } from '../controladores/ControladorResultado';
import type { DepsFabrica } from '../tipos/DepsFabrica';
import type { DepsModulo } from '../tipos/DepsModulo';
import type { Vista } from '../vistas/Vista';
import { VistaFaq } from '../vistas/VistaFaq';
import { VistaHistorial } from '../vistas/VistaHistorial';
import { VistaInicio } from '../vistas/VistaInicio';
import { VistaLogin } from '../vistas/VistaLogin';
import { VistaRegistro } from '../vistas/VistaRegistro';
import { VistaResultado } from '../vistas/VistaResultado';
import { VistaActividad } from '../vistas/modulos/VistaActividad';
import { VistaAlimentacion } from '../vistas/modulos/VistaAlimentacion';
import { VistaConsumo } from '../vistas/modulos/VistaConsumo';
import { VistaDatos } from '../vistas/modulos/VistaDatos';
import { VistaPresion } from '../vistas/modulos/VistaPresion';
import type { VistaModulo } from '../vistas/modulos/VistaModulo';

/**
 * Factory Method: crea la pantalla de una ruta (o null si no existe) y le conecta su CONTROLADOR.
 * La vista y el controlador se crean juntos: el controlador se registra en la vista y ya no hace falta tocarlo.
 */
export class FabricaVistas {
  constructor(private readonly d: DepsFabrica) {}

  crear(ruta: string): Vista | null {
    const d = this.d;
    const mod: DepsModulo = { barra: d.barra, catalogo: d.catalogo, repoBorrador: d.repoBorrador, lector: d.lector, campos: d.campos };
    const m = ruta.match(/^\/resultado\/(\d+)$/);
    if (m) {
      const vista = new VistaResultado(d.barra, m[1]);
      new ControladorResultado(vista, d.apiEvaluaciones, d.descarga, d.avisos, d.navegador, d.errores);
      return vista;
    }
    switch (ruta) {
      case '/login': {
        const vista = new VistaLogin(d.barra);
        new ControladorLogin(vista, d.apiAuth, d.sesion, d.repoBorrador, d.avisos, d.navegador, d.errores);
        return vista;
      }
      case '/registro': {
        const vista = new VistaRegistro(d.barra);
        new ControladorRegistro(vista, d.apiAuth, d.avisos, d.navegador, d.errores);
        return vista;
      }
      case '/inicio': {
        const vista = new VistaInicio({ barra: d.barra, repoBorrador: d.repoBorrador, catalogo: d.catalogo });
        new ControladorInicio(vista, d.flujo);
        return vista;
      }
      case '/faq': return new VistaFaq({ barra: d.barra, sesion: d.sesion, minutos: d.minutos });
      case '/historial': {
        const vista = new VistaHistorial(d.barra);
        new ControladorHistorial(vista, d.apiEvaluaciones, d.descarga, d.errores);
        return vista;
      }
      case '/datos': return this.conControlador(new VistaDatos(mod, d.sesion));
      case '/habitos-alimenticios': return this.conControlador(new VistaAlimentacion(mod));
      case '/actividad': return this.conControlador(new VistaActividad(mod));
      case '/consumo': return this.conControlador(new VistaConsumo(mod));
      case '/presion': {
        const vista = new VistaPresion(mod);
        new ControladorPresion(vista, d.repoBorrador, d.catalogo, d.flujo, d.avisos, d.navegador, d.apiEvaluaciones);
        return vista;
      }
      default: return null;
    }
  }

  /** Pantallas de módulo sin lógica propia: todas comparten ControladorModulo. */
  private conControlador(vista: VistaModulo): VistaModulo {
    const d = this.d;
    new ControladorModulo(vista, d.repoBorrador, d.catalogo, d.flujo, d.avisos, d.navegador);
    return vista;
  }
}
