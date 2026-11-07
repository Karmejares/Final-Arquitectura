import type { ApiAuth } from '../contratos/ApiAuth';
import type { ApiEvaluaciones } from '../contratos/ApiEvaluaciones';
import type { Transporte } from '../contratos/Transporte';
import type { DatosRegistro } from '../tipos/DatosRegistro';
import type { DatosSeccion } from '../tipos/DatosSeccion';
import type { ItemHistorial } from '../tipos/ItemHistorial';
import type { RegistroPresion } from '../tipos/RegistroPresion';
import type { RespuestaLogin } from '../tipos/RespuestaLogin';
import type { RespuestaMensaje } from '../tipos/RespuestaMensaje';
import type { ResultadoEvaluacion } from '../tipos/ResultadoEvaluacion';

/** Traduce operaciones de negocio a endpoints del backend. */
export class Api implements ApiAuth, ApiEvaluaciones {
  /** @param t - Transporte que envía las peticiones. */
  constructor(private readonly t: Transporte) {}

  /**
   * `POST /api/auth/registro`: crea una cuenta.
   * @param d - Datos de la cuenta.
   * @returns Mensaje de confirmación del backend.
   */
  registro(d: DatosRegistro): Promise<RespuestaMensaje> {
    return this.t.peticion('/api/auth/registro', { metodo: 'POST', cuerpo: d });
  }

  /**
   * `POST /api/auth/login`: inicia sesión.
   * @param correo - Correo de la cuenta.
   * @param password - Contraseña de la cuenta.
   * @returns Token de la sesión y nombre del usuario.
   */
  login(correo: string, password: string): Promise<RespuestaLogin> {
    return this.t.peticion('/api/auth/login', { metodo: 'POST', cuerpo: { correo, password } });
  }

  /**
   * `POST /api/evaluaciones`: calcula y guarda una evaluación.
   * @param d - Campos de todas las secciones en un solo objeto.
   * @returns Resultado calculado.
   */
  crearEvaluacion(d: DatosSeccion): Promise<ResultadoEvaluacion> {
    return this.t.peticion('/api/evaluaciones', { metodo: 'POST', cuerpo: d });
  }

  /**
   * `GET /api/evaluaciones`: consulta el historial.
   * @returns Evaluaciones del usuario, de la más reciente a la más antigua.
   */
  historial(): Promise<ItemHistorial[]> {
    return this.t.peticion('/api/evaluaciones');
  }

  /**
   * `GET /api/evaluaciones/presiones`: consulta los registros de presión.
   * @returns Registros del usuario, del más reciente al más antiguo.
   */
  presiones(): Promise<RegistroPresion[]> {
    return this.t.peticion('/api/evaluaciones/presiones');
  }

  /**
   * `GET /api/evaluaciones/{id}`: consulta una evaluación.
   * @param id - Id de la evaluación.
   * @returns Resultado guardado.
   */
  evaluacion(id: string): Promise<ResultadoEvaluacion> {
    return this.t.peticion('/api/evaluaciones/' + id);
  }

  /**
   * `GET /api/evaluaciones/{id}/pdf`: descarga el reporte.
   * @param id - Id de la evaluación.
   * @returns Contenido del PDF.
   */
  pdf(id: string): Promise<Blob> {
    return this.t.peticion('/api/evaluaciones/' + id + '/pdf', { blob: true });
  }
}
