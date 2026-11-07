import type { CierreSesion } from '../servicios/CierreSesion';
import type { TipoBarra } from '../tipos/TipoBarra';

/** Pinta una de las tres barras de navegación y conecta el botón de salir. */
export class BarraNavegacion {
  constructor(private readonly contenedor: HTMLElement, private readonly cierre: CierreSesion) {}

  mostrar(tipo: TipoBarra): void {
    const b = this.contenedor;
    if (tipo === 'auth') {
      b.innerHTML = `<nav class="nav nav-oscura" aria-label="Principal"><a class="marca" href="#/login">CardioPrev</a>
        <div class="enlaces"><a href="#/login">Login</a><a href="#/registro">Registro</a></div></nav>`;
    } else if (tipo === 'dash') {
      b.innerHTML = `<nav class="nav nav-clara" aria-label="Principal"><a class="marca" href="#/inicio">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3v6a4 4 0 0 0 8 0V3"/><path d="M9 13v2a5 5 0 0 0 10 0v-1"/><circle cx="19" cy="12" r="2"/></svg>Cardioprev</a>
        <div class="enlaces"><a href="#/inicio">Inicio</a><a href="#/historial">Historial</a><button type="button" id="salir">Cerrar sesión</button></div></nav>`;
    } else {
      b.innerHTML = `<nav class="nav nav-oscura" aria-label="Principal"><a class="marca" href="#/inicio">CardioPrev</a>
        <div class="enlaces"><a href="#/inicio">Dashboard</a><button type="button" id="salir">Salir</button></div></nav>`;
    }
    const s = b.querySelector<HTMLElement>('#salir');
    if (s) s.onclick = () => this.cierre.ejecutar();
  }
}
