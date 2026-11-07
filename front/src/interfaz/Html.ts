/** Utilidad pura para escapar texto y dar formato de fecha en HTML. */
export class Html {
  /**
   * Escapa un valor para insertarlo en HTML.
   * @param v - Valor a escapar; null y undefined se vuelven cadena vacía.
   * @returns Texto escapado.
   */
  static esc(v: unknown): string {
    return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }

  /**
   * Fecha ISO a 'AAAA-MM-DD HH:MM', ya escapada.
   * @param v - Fecha en formato ISO.
   * @returns Fecha lista para insertar en HTML.
   */
  static fecha(v: unknown): string {
    return Html.esc(String(v).replace('T', ' ').slice(0, 16));
  }
}
