/** Utilidad pura para escapar texto y dar formato de fecha en HTML. */
export class Html {
  static esc(v: unknown): string {
    return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }

  /** Fecha ISO a 'AAAA-MM-DD HH:MM', ya escapada. */
  static fecha(v: unknown): string {
    return Html.esc(String(v).replace('T', ' ').slice(0, 16));
  }
}
