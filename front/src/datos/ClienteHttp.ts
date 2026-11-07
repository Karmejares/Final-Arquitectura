import type { FuenteToken } from '../contratos/FuenteToken';
import type { Transporte } from '../contratos/Transporte';
import type { OpcionesPeticion } from '../tipos/OpcionesPeticion';
import { ApiError } from './ApiError';

/** Hace la petición HTTP: cabeceras, token renovado y fallos como ApiError. */
export class ClienteHttp implements Transporte {
  constructor(private readonly fuente: FuenteToken) {}

  async peticion<T>(ruta: string, { metodo = 'GET', cuerpo = null, blob = false }: OpcionesPeticion = {}): Promise<T> {
    const cabeceras: Record<string, string> = {};
    if (cuerpo) cabeceras['Content-Type'] = 'application/json';
    const token = this.fuente.token();
    if (token) cabeceras['Authorization'] = 'Bearer ' + token;

    let res: Response;
    try {
      res = await fetch(ruta, { method: metodo, headers: cabeceras, body: cuerpo ? JSON.stringify(cuerpo) : null });
    } catch (_) {
      throw new ApiError(0, ['No se pudo conectar con el servidor. Verifica que esté en ejecución.']);
    }

    // Sesión deslizante: el servidor entrega un token nuevo en cada petición válida.
    const renovado = res.headers.get('X-Token-Renovado');
    if (renovado) this.fuente.renovar(renovado);

    if (!res.ok) {
      let mensajes = ['Error ' + res.status];
      try {
        const d = await res.json();
        mensajes = Array.isArray(d.detail) ? d.detail : [String(d.detail)];
      } catch (_) { /* respuesta sin JSON */ }
      throw new ApiError(res.status, mensajes);
    }
    return (blob ? res.blob() : res.json()) as Promise<T>;
  }
}
