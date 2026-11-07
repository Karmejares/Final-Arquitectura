import { Html } from '../../interfaz/Html';
import type { DatosSeccion } from '../../tipos/DatosSeccion';
import type { RegistroPresion } from '../../tipos/RegistroPresion';
import type { SeccionId } from '../../tipos/SeccionId';
import { VistaModulo } from './VistaModulo';

/** Clase CSS y texto de cada estado de presión. */
const FILA: Record<string, readonly [string, string]> = {
  normal: ['fila-verde', 'Normal'], alta: ['fila-roja', 'Alta'], baja: ['fila-amarilla', 'Baja'], elevada: ['fila-naranja', 'Elevada'],
};

/** Pantalla de presión arterial (VISTA); fuera del flujo secuencial reserva el sitio de la tabla de registros. */
export class VistaPresion extends VistaModulo {
  seccion(): SeccionId { return 'clinica'; }

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

  /**
   * Pinta el formulario y, fuera del flujo secuencial, el sitio de la tabla de registros.
   * @param seq - Si la pantalla se abre en el flujo secuencial.
   */
  protected override contenido(seq: boolean): void {
    super.contenido(seq);
    if (seq) return;
    this.$('.tarjeta').insertAdjacentHTML('afterend', `<div class="tarjeta-plana" style="margin-top:1.4rem"><h2>Historial de registros</h2><div id="tabla-p" class="muted">Cargando…</div></div>`);
  }

  /**
   * El controlador entrega los registros ya consultados; la vista solo los dibuja.
   * @param p - Registros de presión.
   */
  mostrarPresiones(p: RegistroPresion[]): void {
    const esc = Html.esc;
    this.$('#tabla-p').outerHTML = p.length ? `<div class="tabla-scroll"><table><thead><tr><th>Fecha</th><th>Sistólica</th><th>Diastólica</th><th>Estado</th></tr></thead><tbody>${
      p.map((r) => { const [cl, tx] = FILA[r.estado] || ['', r.estado]; return `<tr class="${cl}"><td>${esc(String(r.fecha).replace('T', ' ').slice(0, 16))}</td><td>${esc(r.sistolica)}</td><td>${esc(r.diastolica)}</td><td>${esc(tx)}</td></tr>`; }).join('')
    }</tbody></table></div>` : '<p class="muted">Aún no tienes registros. Se agregan al calcular tu evaluación.</p>';
  }

  /** Indica en la tabla que no se pudieron cargar los registros. */
  mostrarErrorPresiones(): void {
    this.$('#tabla-p').textContent = 'No se pudo cargar el historial.';
  }
}
