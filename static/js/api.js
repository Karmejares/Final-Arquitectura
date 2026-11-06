/* Capa de acceso al backend. Maneja el token JWT y su renovación automática. */
class ApiError extends Error {
  constructor(status, mensajes) {
    super(mensajes.join(' '));
    this.status = status;
    this.mensajes = mensajes;
  }
}

const Api = (() => {
  const K_TOKEN = 'cp_token', K_NOMBRE = 'cp_nombre';   // sessionStorage: se borra al cerrar la pestaña

  const leer = (k) => { try { return sessionStorage.getItem(k); } catch (_) { return null; } };
  const escribir = (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) { /* sin almacenamiento */ } };
  const borrar = (k) => { try { sessionStorage.removeItem(k); } catch (_) { /* sin almacenamiento */ } };
  const token = () => leer(K_TOKEN);

  async function peticion(ruta, { metodo = 'GET', cuerpo = null, blob = false } = {}) {
    const cabeceras = {};
    if (cuerpo) cabeceras['Content-Type'] = 'application/json';
    if (token()) cabeceras['Authorization'] = 'Bearer ' + token();

    let res;
    try {
      res = await fetch(ruta, { method: metodo, headers: cabeceras, body: cuerpo ? JSON.stringify(cuerpo) : null });
    } catch (e) {
      throw new ApiError(0, ['No se pudo conectar con el servidor. Verifica que esté en ejecución.']);
    }

    // Sesión deslizante: el servidor entrega un token nuevo en cada petición válida.
    const renovado = res.headers.get('X-Token-Renovado');
    if (renovado) escribir(K_TOKEN, renovado);

    if (!res.ok) {
      let mensajes = ['Error ' + res.status];
      try {
        const d = await res.json();
        mensajes = Array.isArray(d.detail) ? d.detail : [String(d.detail)];
      } catch (_) { /* respuesta sin JSON */ }
      throw new ApiError(res.status, mensajes);
    }
    return blob ? res.blob() : res.json();
  }

  return {
    haySesion: () => !!token(),
    nombre: () => leer(K_NOMBRE) || '',
    cerrarSesion() { borrar(K_TOKEN); borrar(K_NOMBRE); },

    registro: (datos) => peticion('/api/auth/registro', { metodo: 'POST', cuerpo: datos }),
    async login(correo, password) {
      const r = await peticion('/api/auth/login', { metodo: 'POST', cuerpo: { correo, password } });
      escribir(K_TOKEN, r.token);
      escribir(K_NOMBRE, r.nombre);
      return r;
    },
    crearEvaluacion: (datos) => peticion('/api/evaluaciones', { metodo: 'POST', cuerpo: datos }),
    historial: () => peticion('/api/evaluaciones'),
    presiones: () => peticion('/api/evaluaciones/presiones'),
    evaluacion: (id) => peticion('/api/evaluaciones/' + id),
    pdf: (id) => peticion('/api/evaluaciones/' + id + '/pdf', { blob: true }),
  };
})();
