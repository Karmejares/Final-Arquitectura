import type { ApiEvaluaciones } from '../../contratos/ApiEvaluaciones';
import { Html } from '../../interfaz/Html';
import type { DatosSeccion } from '../../tipos/DatosSeccion';
import type { DepsModulo } from '../../tipos/DepsModulo';
import type { SeccionId } from '../../tipos/SeccionId';
import { VistaModulo } from './VistaModulo';

const FILA: Record<string, readonly [string, string]> = {
  normal: ['fila-verde', 'Normal'], alta: ['fila-roja', 'Alta'], baja: ['fila-amarilla', 'Baja'], elevada: ['fila-naranja', 'Elevada'],
};

/** Pantalla de presión arterial; fuera del flujo secuencial agrega la tabla de registros. */
export class VistaPresion extends VistaModulo {
  constructor(d: DepsModulo, private readonly api: ApiEvaluaciones) {
    super(d);
  }

  protected seccion(): SeccionId { return 'clinica'; }

  protected titulo(): string { return 'Registro de Presión Arterial'; }

  protected textoBoton(): string { return 'Guardar'; }

  protected override numericos(): string[] { return ['presion_sistolica', 'presion_diastolica', 'colesterol_total', 'colesterol_hdl']; }

  protected cuerpo(d: DatosSeccion): string {
    const c = this.campos;
    return `
      ${c.numero('presion_sistolica', 'Presión sistólica (mmHg)', d.presion_sistolica ?? '', 'min="50" max="260" step="1"')}
      ${c.numero('presion_diastolica', 'Presión diastólica (mmHg)', d.presion_diastolica ?? '', 'min="30" max="160" step="1"')}
      ${c.numero('colesterol_total', 'Colesterol total (mg/dL)', d.colesterol_total ?? '', 'min="50" max="600"')}
      ${c.numero('colesterol_hdl', 'Colesterol HDL (mg/dL)', d.colesterol_hdl ?? '', 'min="10" max="200"')}`;
  }

  protected override async contenido(seq: boolean): Promise<void> {
    super.contenido(seq);
    if (seq) return;
    const esc = Html.esc;
    this.$('.tarjeta').insertAdjacentHTML('afterend', `<div class="tarjeta-plana" style="margin-top:1.4rem"><h2>Historial de registros</h2><div id="tabla-p" class="muted">Cargando…</div></div>`);
    try {
      const p = await this.api.presiones();
      this.$('#tabla-p').outerHTML = p.length ? `<div class="tabla-scroll"><table><thead><tr><th>Fecha</th><th>Sistólica</th><th>Diastólica</th><th>Estado</th></tr></thead><tbody>${
        p.map((r) => { const [cl, tx] = FILA[r.estado] || ['', r.estado]; return `<tr class="${cl}"><td>${esc(String(r.fecha).replace('T', ' ').slice(0, 16))}</td><td>${esc(r.sistolica)}</td><td>${esc(r.diastolica)}</td><td>${esc(tx)}</td></tr>`; }).join('')
      }</tbody></table></div>` : '<p class="muted">Aún no tienes registros. Se agregan al calcular tu evaluación.</p>';
    } catch (e) { this.$('#tabla-p').textContent = 'No se pudo cargar el historial.'; }
  }
}
