import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import { ApiError } from '../datos/ApiError';
import type { RepositorioBorrador } from '../datos/RepositorioBorrador';
import type { CatalogoSecciones } from '../dominio/CatalogoSecciones';
import type { Avisos } from '../interfaz/Avisos';
import type { ManejadorErrores } from '../interfaz/ManejadorErrores';
import type { Navegador } from '../interfaz/Navegador';

/** Orquesta el envío de la evaluación y la ida al resultado más reciente. */
export class FlujoEvaluacion {
  constructor(
    private readonly repo: RepositorioBorrador,
    private readonly catalogo: CatalogoSecciones,
    private readonly api: ApiEvaluaciones,
    private readonly avisos: Avisos,
    private readonly navegador: Navegador,
    private readonly errores: ManejadorErrores,
  ) {}

  /** Calcula si el borrador está completo y cambió; si no, muestra el último resultado. */
  async verRiesgo(): Promise<void> {
    this.avisos.mostrar('');
    const b = this.repo.leer();
    if (b.todoCompleto() && b.cambioDesdeUltimoEnvio()) return this.enviar();
    try {
      const ultimoId = b.ultimoId();
      if (ultimoId) return this.navegador.ir('#/resultado/' + ultimoId);
      const h = await this.api.historial();
      if (h.length) return this.navegador.ir('#/resultado/' + h[0].id);
      const falta = b.faltantes().map((s) => this.catalogo.definicion(s).titulo.toLowerCase());
      this.avisos.mostrar('Aún no tienes una evaluación. Completa: ' + falta.join(', ') + '. Usa «Comenzar Evaluación».', 'aviso');
    } catch (e) { this.errores.mostrar(e); }
  }

  async enviar(): Promise<void> {
    const b = this.repo.leer();
    if (!b.todoCompleto()) { this.avisos.avisarLuego('Completa todos los módulos para calcular tu riesgo.', 'aviso'); return this.navegador.ir('#/inicio'); }
    const payload = b.payload();
    try {
      const r = await this.api.crearEvaluacion(payload);
      b.registrarEnvio(payload, r.id as number);
      this.repo.guardar(b);
      this.navegador.ir('#/resultado/' + r.id);
    } catch (e) { this.errores.mostrar(e); if (!(e instanceof ApiError && e.status === 401)) this.navegador.ir('#/inicio'); }
  }
}
