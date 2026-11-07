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
  constructor(private readonly t: Transporte) {}

  registro(d: DatosRegistro): Promise<RespuestaMensaje> {
    return this.t.peticion('/api/auth/registro', { metodo: 'POST', cuerpo: d });
  }

  login(correo: string, password: string): Promise<RespuestaLogin> {
    return this.t.peticion('/api/auth/login', { metodo: 'POST', cuerpo: { correo, password } });
  }

  crearEvaluacion(d: DatosSeccion): Promise<ResultadoEvaluacion> {
    return this.t.peticion('/api/evaluaciones', { metodo: 'POST', cuerpo: d });
  }

  historial(): Promise<ItemHistorial[]> {
    return this.t.peticion('/api/evaluaciones');
  }

  presiones(): Promise<RegistroPresion[]> {
    return this.t.peticion('/api/evaluaciones/presiones');
  }

  evaluacion(id: string): Promise<ResultadoEvaluacion> {
    return this.t.peticion('/api/evaluaciones/' + id);
  }

  pdf(id: string): Promise<Blob> {
    return this.t.peticion('/api/evaluaciones/' + id + '/pdf', { blob: true });
  }
}
