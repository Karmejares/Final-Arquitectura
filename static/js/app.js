/* GENERADO por front/build.mjs desde front/src. No editar a mano: edita front/src y corre `npm run build` en front/. */
"use strict";
(() => {
  // src/datos/AlmacenSesion.ts
  var AlmacenSesion = class {
    /**
     * Lee un valor de sessionStorage.
     * @param k - Clave del valor.
     * @returns El valor, o null si no existe o el almacenamiento no está disponible.
     */
    leer(k) {
      try {
        return sessionStorage.getItem(k);
      } catch (_) {
        return null;
      }
    }
    /**
     * Guarda un valor; si el almacenamiento no está disponible, no hace nada.
     * @param k - Clave del valor.
     * @param v - Texto a guardar.
     */
    escribir(k, v) {
      try {
        sessionStorage.setItem(k, v);
      } catch (_) {
      }
    }
    /**
     * Elimina un valor; si el almacenamiento no está disponible, no hace nada.
     * @param k - Clave del valor.
     */
    borrar(k) {
      try {
        sessionStorage.removeItem(k);
      } catch (_) {
      }
    }
  };

  // src/datos/Api.ts
  var Api = class {
    /** @param t - Transporte que envía las peticiones. */
    constructor(t) {
      this.t = t;
    }
    /**
     * `POST /api/auth/registro`: crea una cuenta.
     * @param d - Datos de la cuenta.
     * @returns Mensaje de confirmación del backend.
     */
    registro(d) {
      return this.t.peticion("/api/auth/registro", { metodo: "POST", cuerpo: d });
    }
    /**
     * `POST /api/auth/login`: inicia sesión.
     * @param correo - Correo de la cuenta.
     * @param password - Contraseña de la cuenta.
     * @returns Token de la sesión y nombre del usuario.
     */
    login(correo, password) {
      return this.t.peticion("/api/auth/login", { metodo: "POST", cuerpo: { correo, password } });
    }
    /**
     * `POST /api/evaluaciones`: calcula y guarda una evaluación.
     * @param d - Campos de todas las secciones en un solo objeto.
     * @returns Resultado calculado.
     */
    crearEvaluacion(d) {
      return this.t.peticion("/api/evaluaciones", { metodo: "POST", cuerpo: d });
    }
    /**
     * `GET /api/evaluaciones`: consulta el historial.
     * @returns Evaluaciones del usuario, de la más reciente a la más antigua.
     */
    historial() {
      return this.t.peticion("/api/evaluaciones");
    }
    /**
     * `GET /api/evaluaciones/presiones`: consulta los registros de presión.
     * @returns Registros del usuario, del más reciente al más antiguo.
     */
    presiones() {
      return this.t.peticion("/api/evaluaciones/presiones");
    }
    /**
     * `GET /api/evaluaciones/{id}`: consulta una evaluación.
     * @param id - Id de la evaluación.
     * @returns Resultado guardado.
     */
    evaluacion(id) {
      return this.t.peticion("/api/evaluaciones/" + id);
    }
    /**
     * `GET /api/evaluaciones/{id}/pdf`: descarga el reporte.
     * @param id - Id de la evaluación.
     * @returns Contenido del PDF.
     */
    pdf(id) {
      return this.t.peticion("/api/evaluaciones/" + id + "/pdf", { blob: true });
    }
  };

  // src/datos/ApiError.ts
  var ApiError = class extends Error {
    /**
     * @param status - Código HTTP; 0 si no se pudo conectar con el servidor.
     * @param mensajes - Mensajes para mostrar al usuario.
     */
    constructor(status, mensajes) {
      super(mensajes.join(" "));
      this.status = status;
      this.mensajes = mensajes;
    }
  };

  // src/datos/ClienteHttp.ts
  var ClienteHttp = class {
    /** @param fuente - De dónde sale el token y a dónde va el renovado. */
    constructor(fuente) {
      this.fuente = fuente;
    }
    /**
     * Envía una petición con el token de la sesión, si lo hay, y guarda el token renovado.
     * @typeParam T - Tipo de la respuesta esperada.
     * @param ruta - Ruta del backend.
     * @param opciones - Método (GET por defecto), cuerpo JSON y si la respuesta se lee como Blob.
     * @returns Respuesta JSON, o Blob si se pidió.
     * @throws ApiError si no se puede conectar (estado 0) o el servidor responde con error.
     */
    async peticion(ruta, { metodo = "GET", cuerpo = null, blob = false } = {}) {
      const cabeceras = {};
      if (cuerpo) cabeceras["Content-Type"] = "application/json";
      const token = this.fuente.token();
      if (token) cabeceras["Authorization"] = "Bearer " + token;
      let res;
      try {
        res = await fetch(ruta, { method: metodo, headers: cabeceras, body: cuerpo ? JSON.stringify(cuerpo) : null });
      } catch (_) {
        throw new ApiError(0, ["No se pudo conectar con el servidor. Verifica que est\xE9 en ejecuci\xF3n."]);
      }
      const renovado = res.headers.get("X-Token-Renovado");
      if (renovado) this.fuente.renovar(renovado);
      if (!res.ok) {
        let mensajes = ["Error " + res.status];
        try {
          const d = await res.json();
          mensajes = Array.isArray(d.detail) ? d.detail : [String(d.detail)];
        } catch (_) {
        }
        throw new ApiError(res.status, mensajes);
      }
      return blob ? res.blob() : res.json();
    }
  };

  // src/dominio/Borrador.ts
  var Borrador = class {
    /**
     * @param catalogo - Define las secciones y sus campos.
     * @param estado - Estado guardado del borrador.
     */
    constructor(catalogo, estado) {
      this.catalogo = catalogo;
      this.estado = estado;
    }
    /**
     * @param s - Sección a consultar.
     * @returns Campos guardados de la sección.
     */
    seccion(s) {
      return this.estado[s];
    }
    /**
     * Reemplaza los campos de una sección.
     * @param s - Sección a actualizar.
     * @param d - Campos nuevos.
     */
    actualizar(s, d) {
      this.estado[s] = d;
    }
    /**
     * Indica si una sección tiene todos sus campos.
     * Solo undefined, null y '' cuentan como vacío (false y 0 son valores válidos).
     * @param s - Sección a revisar.
     * @returns true si no falta ningún campo.
     */
    completa(s) {
      return this.catalogo.definicion(s).campos.every((c) => {
        const v = this.estado[s][c];
        return v !== void 0 && v !== "" && v !== null;
      });
    }
    /** @returns true si todas las secciones están completas. */
    todoCompleto() {
      return this.catalogo.orden().every((s) => this.completa(s));
    }
    /** @returns Campos de todas las secciones en un solo objeto, listos para enviar. */
    payload() {
      return Object.assign({}, ...this.catalogo.orden().map((s) => this.estado[s]));
    }
    /** @returns Secciones incompletas, en el orden del flujo. */
    faltantes() {
      return this.catalogo.orden().filter((s) => !this.completa(s));
    }
    /** @returns true si el payload actual difiere del último enviado. */
    cambioDesdeUltimoEnvio() {
      return JSON.stringify(this.payload()) !== this.estado.ultimo;
    }
    /** @returns Id de la última evaluación enviada, o null si no hay. */
    ultimoId() {
      return this.estado.ultimoId;
    }
    /**
     * Recuerda lo último enviado y la evaluación que creó.
     * @param payload - Campos enviados.
     * @param id - Id de la evaluación creada.
     */
    registrarEnvio(payload, id) {
      this.estado.ultimo = JSON.stringify(payload);
      this.estado.ultimoId = id;
    }
    /** @returns Estado para persistir. */
    aEstado() {
      return this.estado;
    }
  };

  // src/datos/RepositorioBorrador.ts
  var K_BORRADOR = "cp_borrador";
  var vacio = () => ({ datos: {}, alimentacion: {}, actividad: {}, consumo: {}, clinica: {}, ultimo: null, ultimoId: null });
  var RepositorioBorrador = class {
    /**
     * @param almacen - Almacén de la pestaña.
     * @param catalogo - Catálogo que necesita cada borrador.
     */
    constructor(almacen, catalogo) {
      this.almacen = almacen;
      this.catalogo = catalogo;
    }
    /**
     * Carga el borrador guardado.
     * @returns El borrador; vacío si no hay nada guardado o el JSON está dañado.
     */
    leer() {
      let estado;
      try {
        estado = Object.assign(vacio(), JSON.parse(this.almacen.leer(K_BORRADOR) || "{}"));
      } catch (_) {
        estado = vacio();
      }
      return new Borrador(this.catalogo, estado);
    }
    /**
     * Guarda el borrador, reemplazando el anterior.
     * @param b - Borrador a guardar.
     */
    guardar(b) {
      this.almacen.escribir(K_BORRADOR, JSON.stringify(b.aEstado()));
    }
    /** Elimina el borrador guardado. */
    borrar() {
      this.almacen.borrar(K_BORRADOR);
    }
    /** Elimina el borrador para que no pase a la siguiente sesión. */
    alCerrarSesion() {
      this.borrar();
    }
  };

  // src/datos/Sesion.ts
  var K_TOKEN = "cp_token";
  var K_NOMBRE = "cp_nombre";
  var Sesion = class {
    /** @param almacen - Almacén de la pestaña. */
    constructor(almacen) {
      this.almacen = almacen;
    }
    /** @returns Token actual, o null si no hay sesión. */
    token() {
      return this.almacen.leer(K_TOKEN);
    }
    /**
     * Reemplaza el token por el que entregó el servidor.
     * @param t - Token nuevo.
     */
    renovar(t) {
      this.almacen.escribir(K_TOKEN, t);
    }
    /**
     * Guarda los datos de una sesión recién iniciada.
     * @param token - JWT de la sesión.
     * @param nombre - Nombre del usuario.
     */
    abrir(token, nombre) {
      this.almacen.escribir(K_TOKEN, token);
      this.almacen.escribir(K_NOMBRE, nombre);
    }
    /** @returns true si hay un token guardado. */
    activa() {
      return !!this.token();
    }
    /** @returns Nombre del usuario, o cadena vacía si no hay sesión. */
    nombre() {
      return this.almacen.leer(K_NOMBRE) || "";
    }
    /** Elimina el token y el nombre del usuario. */
    alCerrarSesion() {
      this.almacen.borrar(K_TOKEN);
      this.almacen.borrar(K_NOMBRE);
    }
  };

  // src/dominio/CatalogoSecciones.ts
  var SECCIONES = {
    datos: { titulo: "Datos personales", ruta: "#/datos", campos: ["anio_nacimiento", "genero", "peso_kg", "altura_cm"] },
    alimentacion: { titulo: "H\xE1bitos alimenticios", ruta: "#/habitos-alimenticios", campos: ["frutas", "verduras", "comida_rapida", "bebidas_azucaradas", "agua"] },
    actividad: { titulo: "Actividad f\xEDsica", ruta: "#/actividad", campos: ["actividad"] },
    consumo: { titulo: "H\xE1bitos de consumo", ruta: "#/consumo", campos: ["fuma", "consume_alcohol", "diabetes", "antecedentes_familiares"] },
    clinica: { titulo: "Presi\xF3n arterial", ruta: "#/presion", campos: ["presion_sistolica", "presion_diastolica", "colesterol_total", "colesterol_hdl"] }
  };
  var ORDEN = ["datos", "alimentacion", "actividad", "consumo", "clinica"];
  var CatalogoSecciones = class {
    /** @returns Secciones en el orden del flujo. */
    orden() {
      return ORDEN;
    }
    /**
     * @param s - Sección a consultar.
     * @returns Título, ruta y campos de la sección.
     */
    definicion(s) {
      return SECCIONES[s];
    }
    /**
     * Posición de la sección, contando desde 1.
     * @param s - Sección a consultar.
     * @returns Número de paso en el flujo.
     */
    posicion(s) {
      return ORDEN.indexOf(s) + 1;
    }
    /** @returns Cantidad de secciones. */
    total() {
      return ORDEN.length;
    }
    /**
     * @param s - Sección actual.
     * @returns La sección que sigue, o null si es la última.
     */
    siguiente(s) {
      return ORDEN[ORDEN.indexOf(s) + 1] ?? null;
    }
  };

  // src/interfaz/Html.ts
  var Html = class _Html {
    /**
     * Escapa un valor para insertarlo en HTML.
     * @param v - Valor a escapar; null y undefined se vuelven cadena vacía.
     * @returns Texto escapado.
     */
    static esc(v) {
      return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    }
    /**
     * Fecha ISO a 'AAAA-MM-DD HH:MM', ya escapada.
     * @param v - Fecha en formato ISO.
     * @returns Fecha lista para insertar en HTML.
     */
    static fecha(v) {
      return _Html.esc(String(v).replace("T", " ").slice(0, 16));
    }
  };

  // src/interfaz/Avisos.ts
  var Avisos = class {
    /** @param caja - Elemento donde se pintan los avisos. */
    constructor(caja) {
      this.caja = caja;
      this.pendiente = null;
    }
    /**
     * Con mensaje vacío solo limpia; con mensaje pinta y sube al inicio.
     * @param msg - Texto del aviso; vacío para limpiar.
     * @param tipo - Estilo del aviso.
     * @param lista - Si trae más de un mensaje, se muestran todos en vez de `msg`.
     */
    mostrar(msg, tipo = "ok", lista = null) {
      if (!msg) {
        this.caja.innerHTML = "";
        return;
      }
      const items = lista && lista.length > 1 ? "<ul>" + lista.map((m) => `<li>${Html.esc(m)}</li>`).join("") + "</ul>" : "";
      this.caja.innerHTML = `<div class="alerta alerta-${tipo}">${items ? Html.esc(lista.length + " datos por corregir:") + items : Html.esc(msg)}</div>`;
      window.scrollTo(0, 0);
    }
    /** Borra el aviso visible. No toca el aviso pendiente. */
    limpiar() {
      this.mostrar("");
    }
    /**
     * Deja un aviso para mostrarlo después del próximo cambio de ruta.
     * @param msg - Texto del aviso.
     * @param tipo - Estilo del aviso.
     */
    avisarLuego(msg, tipo = "ok") {
      this.pendiente = { msg, tipo };
    }
    /** Muestra el aviso pendiente, si lo hay, y lo descarta. */
    mostrarPendiente() {
      if (this.pendiente) {
        this.mostrar(this.pendiente.msg, this.pendiente.tipo);
        this.pendiente = null;
      }
    }
  };

  // src/interfaz/BarraNavegacion.ts
  var BarraNavegacion = class {
    /**
     * @param contenedor - Elemento donde se pinta la barra.
     * @param cierre - Se ejecuta al pulsar el botón de salir.
     */
    constructor(contenedor, cierre) {
      this.contenedor = contenedor;
      this.cierre = cierre;
    }
    /**
     * Pinta la barra y conecta el botón de salir, si la variante lo tiene.
     * @param tipo - Variante de la barra.
     */
    mostrar(tipo) {
      const b = this.contenedor;
      if (tipo === "auth") {
        b.innerHTML = `<nav class="nav nav-oscura" aria-label="Principal"><a class="marca" href="#/login">CardioPrev</a>
        <div class="enlaces"><a href="#/login">Login</a><a href="#/registro">Registro</a></div></nav>`;
      } else if (tipo === "dash") {
        b.innerHTML = `<nav class="nav nav-clara" aria-label="Principal"><a class="marca" href="#/inicio">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3v6a4 4 0 0 0 8 0V3"/><path d="M9 13v2a5 5 0 0 0 10 0v-1"/><circle cx="19" cy="12" r="2"/></svg>Cardioprev</a>
        <div class="enlaces"><a href="#/inicio">Inicio</a><a href="#/historial">Historial</a><button type="button" id="salir">Cerrar sesi\xF3n</button></div></nav>`;
      } else {
        b.innerHTML = `<nav class="nav nav-oscura" aria-label="Principal"><a class="marca" href="#/inicio">CardioPrev</a>
        <div class="enlaces"><a href="#/inicio">Dashboard</a><button type="button" id="salir">Salir</button></div></nav>`;
      }
      const s = b.querySelector("#salir");
      if (s) s.onclick = () => this.cierre.ejecutar();
    }
  };

  // src/interfaz/Campos.ts
  var Campos = class {
    /**
     * Genera un campo numérico.
     * @param n - Nombre e id del campo.
     * @param etiqueta - Texto de la etiqueta (HTML sin escapar).
     * @param v - Valor actual.
     * @param extra - Atributos HTML adicionales, p. ej. min, max o step.
     * @returns HTML del campo.
     */
    numero(n, etiqueta, v, extra = "") {
      return `<div class="campo"><label for="${n}">${etiqueta}</label><input id="${n}" name="${n}" type="number" step="any" ${extra} value="${Html.esc(v)}" required></div>`;
    }
    /**
     * Genera una lista desplegable.
     * @param n - Nombre e id del campo.
     * @param etiqueta - Texto de la etiqueta (HTML sin escapar).
     * @param lista - Opciones disponibles.
     * @param v - Valor actual.
     * @returns HTML del campo.
     */
    seleccion(n, etiqueta, lista, v) {
      return `<div class="campo"><label for="${n}">${etiqueta}</label><select id="${n}" name="${n}" required>${this.opciones(lista, v)}</select></div>`;
    }
    /**
     * Genera una pregunta de sí o no con botones de opción.
     * @param n - Nombre del campo.
     * @param etiqueta - Texto de la pregunta (HTML sin escapar).
     * @param v - Valor actual: true, false o sin responder.
     * @returns HTML del grupo.
     */
    siNo(n, etiqueta, v) {
      return `<div class="grupo"><span class="pregunta" id="l-${n}">${etiqueta}</span>
    <div class="radios" role="radiogroup" aria-labelledby="l-${n}">
      <label><input type="radio" name="${n}" value="si"${v === true ? " checked" : ""} required> S\xED</label>
      <label><input type="radio" name="${n}" value="no"${v === false ? " checked" : ""}> No</label></div></div>`;
    }
    /**
     * Genera las opciones de una lista desplegable, con la actual seleccionada.
     * @param lista - Opciones disponibles.
     * @param actual - Valor actual.
     * @returns HTML de las opciones.
     */
    opciones(lista, actual) {
      return `<option value="">Selecciona\u2026</option>` + lista.map(([v, t]) => `<option value="${v}"${String(actual) === v ? " selected" : ""}>${Html.esc(t)}</option>`).join("");
    }
  };

  // src/interfaz/Enrutador.ts
  var PUBLICAS = ["/login", "/registro", "/faq"];
  var Enrutador = class {
    /**
     * @param fabrica - Crea la vista de cada ruta.
     * @param sesion - Estado de la sesión.
     * @param avisos - Avisos en pantalla.
     * @param navegador - Cambio de ruta.
     * @param vigilante - Reinicia su conteo en cada cambio de vista.
     */
    constructor(fabrica, sesion, avisos, navegador, vigilante) {
      this.fabrica = fabrica;
      this.sesion = sesion;
      this.avisos = avisos;
      this.navegador = navegador;
      this.vigilante = vigilante;
    }
    /** Escucha los cambios de hash y enruta la ruta actual una vez. */
    iniciar() {
      window.addEventListener("hashchange", () => this.enrutar());
      this.enrutar();
    }
    /**
     * Muestra la vista de la ruta actual.
     * Sin sesión, una ruta privada lleva al login; con sesión, el login y el registro llevan al Dashboard.
     * Una ruta desconocida lleva al Dashboard o al login, según haya sesión.
     */
    enrutar() {
      const [ruta, query = ""] = (location.hash.slice(1) || "/login").split("?");
      const seq = new URLSearchParams(query).get("seq") === "1";
      this.avisos.limpiar();
      if (!PUBLICAS.includes(ruta) && !this.sesion.activa()) return this.navegador.ir("#/login");
      if ((ruta === "/login" || ruta === "/registro") && this.sesion.activa()) return this.navegador.ir("#/inicio");
      const vista = this.fabrica.crear(ruta);
      if (vista) vista.mostrar(seq);
      else this.navegador.ir(this.sesion.activa() ? "#/inicio" : "#/login");
      this.avisos.mostrarPendiente();
      this.vigilante.reiniciar();
      if (!seq || ruta !== "/inicio") window.scrollTo(0, 0);
    }
  };

  // src/controladores/ControladorHistorial.ts
  var ControladorHistorial = class {
    /**
     * Se registra en los eventos de la vista.
     * @param vista - Pantalla del historial.
     * @param api - Consulta de evaluaciones.
     * @param descarga - Descarga del PDF de cada fila.
     * @param errores - Presenta los errores de la consulta.
     */
    constructor(vista, api, descarga, errores) {
      this.vista = vista;
      this.api = api;
      this.descarga = descarga;
      this.errores = errores;
      vista.alMostrar(() => {
        void this.cargar();
      });
      vista.alDescargarPdf((id) => {
        void this.descarga.descargar(id);
      });
    }
    /** Consulta el historial y lo entrega a la vista. */
    async cargar() {
      try {
        this.vista.mostrarHistorial(await this.api.historial());
      } catch (e) {
        this.errores.mostrar(e);
      }
    }
  };

  // src/controladores/ControladorInicio.ts
  var ControladorInicio = class {
    /**
     * Se registra en los eventos de la vista.
     * @param vista - Pantalla del Dashboard.
     * @param flujo - Flujo que lleva al resultado de la evaluación.
     */
    constructor(vista, flujo) {
      this.flujo = flujo;
      vista.alVerRiesgo(() => {
        void this.flujo.verRiesgo();
      });
    }
  };

  // src/controladores/ControladorLogin.ts
  var ControladorLogin = class {
    /**
     * Se registra en los eventos de la vista.
     * @param vista - Pantalla de inicio de sesión.
     * @param api - Endpoints de cuenta.
     * @param sesion - Guarda la sesión abierta.
     * @param repoBorrador - Borrador que se descarta al entrar.
     * @param avisos - Avisos en pantalla.
     * @param navegador - Cambio de ruta.
     * @param errores - Presenta los errores que no son de credenciales.
     */
    constructor(vista, api, sesion, repoBorrador, avisos, navegador, errores) {
      this.api = api;
      this.sesion = sesion;
      this.repoBorrador = repoBorrador;
      this.avisos = avisos;
      this.navegador = navegador;
      this.errores = errores;
      vista.alEnviar((correo, password) => {
        void this.entrar(correo, password);
      });
    }
    /**
     * Inicia sesión, descarta el borrador anterior y lleva al Dashboard.
     * @param correo - Correo escrito por el usuario.
     * @param password - Contraseña escrita por el usuario.
     */
    async entrar(correo, password) {
      this.avisos.limpiar();
      try {
        const r = await this.api.login(correo, password);
        this.sesion.abrir(r.token, r.nombre);
        this.repoBorrador.borrar();
        this.avisos.avisarLuego("Bienvenido " + this.sesion.nombre() + " \u{1F44B}");
        this.navegador.ir("#/inicio");
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) this.avisos.mostrar(e.mensajes[0], "error");
        else this.errores.mostrar(e);
      }
    }
  };

  // src/controladores/ControladorModulo.ts
  var ControladorModulo = class {
    /**
     * Se registra en los eventos de la vista.
     * @param vista - Pantalla del módulo.
     * @param repoBorrador - Persistencia del borrador.
     * @param catalogo - Campos de cada sección y orden del flujo.
     * @param flujo - Envío de la evaluación al terminar el último paso.
     * @param avisos - Avisos en pantalla.
     * @param navegador - Cambio de ruta.
     */
    constructor(vista, repoBorrador, catalogo, flujo, avisos, navegador) {
      this.vista = vista;
      this.repoBorrador = repoBorrador;
      this.catalogo = catalogo;
      this.flujo = flujo;
      this.avisos = avisos;
      this.navegador = navegador;
      vista.alEnviar((datos, seq) => {
        void this.guardar(datos, seq);
      });
    }
    /**
     * Comprueba que no falten campos, guarda la sección y decide el paso siguiente.
     * @param datos - Campos leídos del formulario.
     * @param seq - Si el usuario va en el flujo secuencial (paso a paso).
     */
    async guardar(datos, seq) {
      this.avisos.limpiar();
      const seccion = this.vista.seccion();
      const faltan = this.catalogo.definicion(seccion).campos.filter((c) => datos[c] === void 0 || datos[c] === "" || Number.isNaN(datos[c]));
      if (faltan.length) return this.avisos.mostrar("Completa todos los campos para continuar.", "error");
      const borrador = this.repoBorrador.leer();
      borrador.actualizar(seccion, datos);
      this.repoBorrador.guardar(borrador);
      if (seq) {
        const siguiente = this.catalogo.siguiente(seccion);
        return siguiente ? this.navegador.ir(this.catalogo.definicion(siguiente).ruta + "?seq=1") : this.flujo.enviar();
      }
      this.avisos.avisarLuego("Datos guardados correctamente: " + this.catalogo.definicion(seccion).titulo.toLowerCase() + ".");
      this.navegador.ir("#/inicio");
    }
  };

  // src/controladores/ControladorPresion.ts
  var ControladorPresion = class extends ControladorModulo {
    /**
     * Se registra en los eventos de la vista.
     * @param vista - Pantalla de presión arterial.
     * @param repoBorrador - Persistencia del borrador.
     * @param catalogo - Campos de cada sección y orden del flujo.
     * @param flujo - Envío de la evaluación al terminar el último paso.
     * @param avisos - Avisos en pantalla.
     * @param navegador - Cambio de ruta.
     * @param api - Consulta de los registros de presión.
     */
    constructor(vista, repoBorrador, catalogo, flujo, avisos, navegador, api) {
      super(vista, repoBorrador, catalogo, flujo, avisos, navegador);
      this.vista = vista;
      this.api = api;
      vista.alMostrar((seq) => {
        if (!seq) void this.cargarRegistros();
      });
    }
    /** Consulta los registros de presión; si falla, la vista muestra el error en su tabla. */
    async cargarRegistros() {
      try {
        this.vista.mostrarPresiones(await this.api.presiones());
      } catch (_) {
        this.vista.mostrarErrorPresiones();
      }
    }
  };

  // src/controladores/ControladorRegistro.ts
  var ControladorRegistro = class {
    /**
     * Se registra en los eventos de la vista.
     * @param vista - Pantalla de registro.
     * @param api - Endpoints de cuenta.
     * @param avisos - Avisos en pantalla.
     * @param navegador - Cambio de ruta.
     * @param errores - Presenta los errores del registro.
     */
    constructor(vista, api, avisos, navegador, errores) {
      this.api = api;
      this.avisos = avisos;
      this.navegador = navegador;
      this.errores = errores;
      vista.alEnviar((datos) => {
        void this.registrar(datos);
      });
    }
    /**
     * Crea la cuenta y lleva al login.
     * @param datos - Datos escritos por el usuario.
     */
    async registrar(datos) {
      this.avisos.limpiar();
      try {
        await this.api.registro(datos);
        this.avisos.avisarLuego("Cuenta creada. Ahora inicia sesi\xF3n.");
        this.navegador.ir("#/login");
      } catch (e) {
        this.errores.mostrar(e);
      }
    }
  };

  // src/controladores/ControladorResultado.ts
  var ControladorResultado = class {
    /**
     * Se registra en los eventos de la vista.
     * @param vista - Pantalla del resultado.
     * @param api - Consulta de evaluaciones.
     * @param descarga - Descarga del PDF.
     * @param avisos - Avisos en pantalla.
     * @param navegador - Cambio de ruta.
     * @param errores - Presenta los errores de la consulta.
     */
    constructor(vista, api, descarga, avisos, navegador, errores) {
      this.vista = vista;
      this.api = api;
      this.descarga = descarga;
      this.avisos = avisos;
      this.navegador = navegador;
      this.errores = errores;
      vista.alMostrar(() => {
        void this.cargar();
      });
      vista.alDescargarPdf((id) => {
        void this.descarga.descargar(id);
      });
    }
    /** Consulta la evaluación y la entrega a la vista; si no existe (404), vuelve al Dashboard. */
    async cargar() {
      try {
        const resultado = await this.api.evaluacion(this.vista.id());
        this.avisos.limpiar();
        this.vista.mostrarResultado(resultado);
      } catch (e) {
        this.errores.mostrar(e);
        if (e instanceof ApiError && e.status === 404) this.navegador.ir("#/inicio");
      }
    }
  };

  // src/vistas/Vista.ts
  var Vista = class {
    /** @param barra - Barra de navegación de la pantalla. */
    constructor(barra) {
      this.barra = barra;
      this.manejadorMostrar = null;
    }
    /**
     * El controlador pide que le avisen cuando la pantalla ya está pintada (para cargar datos).
     * @param manejador - Recibe si la pantalla se abrió en el flujo secuencial.
     */
    alMostrar(manejador) {
      this.manejadorMostrar = manejador;
    }
    /**
     * Pinta la barra y el contenido, y luego avisa al controlador.
     * @param seq - Si la pantalla se abre en el flujo secuencial.
     */
    mostrar(seq) {
      this.barra.mostrar(this.tipoBarra());
      this.contenido(seq);
      this.manejadorMostrar?.(seq);
    }
    /**
     * Reemplaza el contenido de la página.
     * @param html - HTML ya escapado.
     */
    pintar(html) {
      this.$("#vista").innerHTML = html;
    }
    /**
     * Busca un elemento de la página, dando por hecho que existe.
     * @typeParam T - Tipo del elemento.
     * @param s - Selector CSS.
     * @returns El primer elemento que coincide.
     */
    $(s) {
      return document.querySelector(s);
    }
  };

  // src/vistas/VistaFaq.ts
  var VistaFaq = class extends Vista {
    /** @param d - Dependencias de la pantalla. */
    constructor(d) {
      super(d.barra);
      this.sesion = d.sesion;
      this.minutos = d.minutos;
    }
    tipoBarra() {
      return this.sesion.activa() ? "dash" : "auth";
    }
    contenido() {
      const q = [
        ["\xBFQu\xE9 calcula CardioPrev?", "Una estimaci\xF3n orientativa de tu riesgo cardiovascular (bajo, medio o alto) con 10 factores: edad, IMC, presi\xF3n, colesterol, alimentaci\xF3n, actividad, tabaquismo, alcohol, diabetes y antecedentes."],
        ["\xBFReemplaza a un m\xE9dico?", "No. Es una herramienta educativa; ante cualquier duda consulta a un profesional de la salud."],
        ["\xBFD\xF3nde se guardan mis evaluaciones?", "En el servidor, asociadas solo a tu cuenta. Nadie m\xE1s puede ver tu historial."],
        ["\xBFPor qu\xE9 se cerr\xF3 mi sesi\xF3n?", "Por seguridad, la sesi\xF3n se cierra tras " + this.minutos + " minutos sin actividad."]
      ];
      this.pintar(`<div class="contenedor"><div class="tarjeta-plana"><h1 class="centrado">Preguntas frecuentes</h1>${q.map(([a, b]) => `<details class="detalle"><summary>${Html.esc(a)}</summary><p>${Html.esc(b)}</p></details>`).join("")}
      <p class="enlace-centro"><a href="${this.sesion.activa() ? "#/inicio" : "#/login"}">Volver</a></p></div></div>`);
    }
  };

  // src/vistas/VistaHistorial.ts
  var CLASES = { verde: "fila-verde", amarillo: "fila-amarilla", rojo: "fila-roja" };
  var VistaHistorial = class extends Vista {
    /** @param barra - Barra de navegación de la pantalla. */
    constructor(barra) {
      super(barra);
      this.manejadorPdf = null;
    }
    /**
     * Registra quién atiende la descarga del PDF.
     * @param manejador - Recibe el id de la evaluación.
     */
    alDescargarPdf(manejador) {
      this.manejadorPdf = manejador;
    }
    tipoBarra() {
      return "interna";
    }
    contenido() {
      this.pintar(`<div class="contenedor"><div class="tarjeta-plana"><h1 class="centrado">Historial de evaluaciones</h1><div id="cont" class="muted centrado">Cargando\u2026</div>
      <p class="enlace-centro"><a href="#/inicio">Volver al Dashboard</a></p></div></div>`);
    }
    /**
     * Dibuja la tabla del historial, o un mensaje si está vacío.
     * @param h - Evaluaciones ya consultadas.
     */
    mostrarHistorial(h) {
      const esc = Html.esc;
      this.$("#cont").outerHTML = h.length ? `<div class="tabla-scroll"><table><thead><tr><th>Fecha</th><th>Puntaje</th><th>Nivel</th><th>Acciones</th></tr></thead><tbody>${h.map((x) => `<tr class="${CLASES[x.color] || ""}"><td>${Html.fecha(x.fecha)}</td><td>${esc(x.puntaje)}</td><td>${esc(x.nivel)}</td>
        <td><a class="btn btn-azul" href="#/resultado/${esc(x.id)}">Ver</a><button type="button" class="btn btn-gris" data-pdf="${esc(x.id)}">PDF</button></td></tr>`).join("")}</tbody></table></div>` : '<p class="centrado muted">A\xFAn no tienes evaluaciones. Pulsa \xABComenzar Evaluaci\xF3n\xBB en el Dashboard.</p>';
      document.querySelectorAll("[data-pdf]").forEach((bt) => {
        bt.onclick = () => {
          this.manejadorPdf?.(bt.dataset.pdf);
        };
      });
    }
  };

  // src/vistas/VistaInicio.ts
  var VistaInicio = class extends Vista {
    /** @param d - Dependencias de la pantalla. */
    constructor(d) {
      super(d.barra);
      this.manejadorVerRiesgo = null;
      this.repoBorrador = d.repoBorrador;
      this.catalogo = d.catalogo;
    }
    /**
     * Registra quién atiende el botón «Riesgo Cardiovascular».
     * @param manejador - Se llama al pulsar el botón.
     */
    alVerRiesgo(manejador) {
      this.manejadorVerRiesgo = manejador;
    }
    tipoBarra() {
      return "dash";
    }
    contenido() {
      const b = this.repoBorrador.leer();
      const chips = this.catalogo.orden().map((s) => `<a href="${this.catalogo.definicion(s).ruta}" class="${b.completa(s) ? "hecho" : ""}">${b.completa(s) ? "\u2713 " : ""}${this.catalogo.definicion(s).titulo}</a>`).join("");
      const mod = (img, t, p, ruta) => `<a class="modulo" href="${ruta}"><img src="/static/img/${img}.png" alt=""><h3>${t}</h3><p>${p}</p></a>`;
      this.pintar(`<div class="contenedor-medio">
      <section class="hero"><h1>Previene el Riesgo <span>Cardiovascular</span></h1>
        <p>Eval\xFAa tu salud cardiovascular con una herramienta inteligente que analiza tus h\xE1bitos, tus datos y tus antecedentes.</p>
        <div class="fila-botones"><a class="btn btn-rojo" href="#/datos?seq=1">Comenzar Evaluaci\xF3n</a>
          <button class="btn btn-contorno" type="button" id="ver-riesgo">Riesgo Cardiovascular</button></div>
        <div class="progreso" aria-label="Avance de tu evaluaci\xF3n">${chips}</div></section>
      <section class="modulos" aria-label="M\xF3dulos">
        ${mod("alimentos", "H\xE1bitos Alimenticios", "Registra tu alimentaci\xF3n diaria", "#/habitos-alimenticios")}
        ${mod("actividad", "Actividad F\xEDsica", "Monitorea tu nivel de actividad", "#/actividad")}
        ${mod("consumo", "Tabaco y Alcohol", "Registra tus h\xE1bitos personales", "#/consumo")}
        ${mod("presion", "Presi\xF3n Arterial", "Consulta tus mediciones recientes", "#/presion")}
        ${mod("historial", "Historial", "Revisa tus evaluaciones previas", "#/historial")}
      </section></div>`);
      this.$("#ver-riesgo").onclick = () => {
        this.manejadorVerRiesgo?.();
      };
    }
  };

  // src/vistas/VistaLogin.ts
  var VistaLogin = class extends Vista {
    /** @param barra - Barra de navegación de la pantalla. */
    constructor(barra) {
      super(barra);
      this.manejadorEnvio = null;
    }
    /**
     * Registra quién atiende el envío del formulario.
     * @param manejador - Recibe el correo sin espacios en los extremos y la contraseña.
     */
    alEnviar(manejador) {
      this.manejadorEnvio = manejador;
    }
    tipoBarra() {
      return "auth";
    }
    contenido() {
      this.pintar(`<div class="contenedor-estrecho"><div class="tarjeta"><h1>Login</h1>
      <form id="form" novalidate>
        <div class="campo"><label for="correo">Correo</label><input id="correo" name="correo" type="email" autocomplete="username" required></div>
        <div class="campo"><label for="password">Contrase\xF1a</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
        <button class="btn btn-oscuro btn-ancho" type="submit">Entrar</button></form>
      <p class="enlace-centro">\xBFNo tienes cuenta? <a href="#/registro">Reg\xEDstrate</a></p></div></div>`);
      this.$("#form").onsubmit = (ev) => {
        ev.preventDefault();
        this.manejadorEnvio?.(this.$("#correo").value.trim(), this.$("#password").value);
      };
    }
  };

  // src/vistas/VistaRegistro.ts
  var VistaRegistro = class extends Vista {
    /** @param barra - Barra de navegación de la pantalla. */
    constructor(barra) {
      super(barra);
      this.manejadorEnvio = null;
    }
    /**
     * Registra quién atiende el envío del formulario.
     * @param manejador - Recibe los datos escritos por el usuario.
     */
    alEnviar(manejador) {
      this.manejadorEnvio = manejador;
    }
    tipoBarra() {
      return "auth";
    }
    contenido() {
      this.pintar(`<div class="contenedor-estrecho"><div class="tarjeta"><h1>Registro</h1>
      <form id="form" novalidate>
        <div class="campo"><label for="nombre">Nombre de usuario</label><input id="nombre" name="nombre" type="text" autocomplete="name" required></div>
        <div class="campo"><label for="correo">Correo</label><input id="correo" name="correo" type="email" autocomplete="username" required></div>
        <div class="campo"><label for="password">Contrase\xF1a</label><input id="password" name="password" type="password" autocomplete="new-password" aria-describedby="ayuda-pw" required>
          <small id="ayuda-pw" class="muted">M\xEDnimo 8 caracteres, con letras y n\xFAmeros.</small></div>
        <button class="btn btn-azul btn-ancho" type="submit">Registrarse</button></form>
      <p class="enlace-centro">\xBFYa tienes cuenta? <a href="#/login">Inicia sesi\xF3n</a></p></div></div>`);
      this.$("#form").onsubmit = (ev) => {
        ev.preventDefault();
        this.manejadorEnvio?.({
          nombre: this.$("#nombre").value.trim(),
          correo: this.$("#correo").value.trim(),
          password: this.$("#password").value
        });
      };
    }
  };

  // src/vistas/VistaResultado.ts
  var NIVELES = { bajo: "Riesgo Bajo", medio: "Riesgo Medio", alto: "Riesgo Alto" };
  var VistaResultado = class extends Vista {
    /**
     * @param barra - Barra de navegación de la pantalla.
     * @param idEvaluacion - Id de la evaluación que se muestra.
     */
    constructor(barra, idEvaluacion) {
      super(barra);
      this.idEvaluacion = idEvaluacion;
      this.manejadorPdf = null;
    }
    /** @returns Id de la evaluación que esta pantalla muestra (el controlador lo necesita para consultarla). */
    id() {
      return this.idEvaluacion;
    }
    /**
     * Registra quién atiende la descarga del PDF.
     * @param manejador - Recibe el id de la evaluación.
     */
    alDescargarPdf(manejador) {
      this.manejadorPdf = manejador;
    }
    tipoBarra() {
      return "interna";
    }
    contenido() {
      this.pintar('<p class="centrado muted">Cargando resultado\u2026</p>');
    }
    /**
     * Dibuja el resultado y conecta el botón del PDF.
     * @param r - Resultado ya consultado.
     */
    mostrarResultado(r) {
      const esc = Html.esc;
      const nombreNivel = NIVELES[r.nivel] || r.nivel;
      const n = r.nutricion;
      this.pintar(`<div class="contenedor resultado">
        <h1>Evaluaci\xF3n del Riesgo Cardiovascular</h1>
        <div class="circulo ${esc(r.color)}" role="img" aria-label="Indicador de color: ${esc(r.color)}"></div>
        <p class="nivel">Tu nivel de riesgo es: <b class="${esc(r.color)}">${esc(nombreNivel)}</b></p>
        <p class="muted">${esc(r.puntaje)} de ${esc(r.puntaje_maximo)} puntos \xB7 IMC ${esc(r.imc)} \xB7 ${esc(r.edad)} a\xF1os</p>
        ${r.alertas.length ? `<div class="alertas">${r.alertas.map((a) => `<div class="alerta alerta-aviso">\u26A0 ${esc(a)}</div>`).join("")}</div>` : ""}
        <h2>Recomendaciones:</h2>
        <ul class="lista-grupo">${r.recomendaciones.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        ${n ? `<h2>Estimaci\xF3n nutricional diaria</h2><div class="macros"><div><strong>${esc(n.calorias)}</strong>kcal</div><div><strong>${esc(n.proteinas_g)} g</strong>prote\xEDnas</div><div><strong>${esc(n.grasas_g)} g</strong>grasas</div><div><strong>${esc(n.carbohidratos_g)} g</strong>carbohidratos</div></div>` : ""}
        <details class="detalle"><summary>Ver el aporte de cada factor</summary>
          <div class="tabla-scroll"><table><thead><tr><th>Factor</th><th>Valor</th><th>Puntos</th></tr></thead><tbody>${r.factores.map((f) => `<tr><td>${esc(f.factor)}</td><td>${esc(f.valor)}</td><td>${esc(f.puntos)}</td></tr>`).join("")}</tbody></table></div></details>
        <p class="muted pequeno">Tu evaluaci\xF3n ya qued\xF3 guardada en el historial.</p>
        <div class="fila-botones"><button class="btn btn-verde" id="pdf" type="button">Descargar reporte PDF</button>
          <a class="btn btn-gris" href="#/historial">Ver historial</a><a class="btn btn-gris" href="#/inicio">Volver al Dashboard</a></div>
        <p class="muted pequeno" style="margin-top:1rem">${esc(r.aviso || "")}</p></div>`);
      this.$("#pdf").onclick = () => {
        this.manejadorPdf?.(this.idEvaluacion);
      };
    }
  };

  // src/vistas/modulos/VistaModulo.ts
  var VistaModulo = class extends Vista {
    /** @param d - Dependencias de la pantalla. */
    constructor(d) {
      super(d.barra);
      this.manejadorEnvio = null;
      this.catalogo = d.catalogo;
      this.repoBorrador = d.repoBorrador;
      this.lector = d.lector;
      this.campos = d.campos;
    }
    /**
     * El controlador se registra aquí; recibe los datos leídos y si el flujo es secuencial.
     * @param manejador - Se llama al enviar el formulario.
     */
    alEnviar(manejador) {
      this.manejadorEnvio = manejador;
    }
    /** @returns Campos que se leen como número. */
    numericos() {
      return [];
    }
    /** @returns Campos que se leen como booleano. */
    booleanos() {
      return [];
    }
    /**
     * HTML opcional entre el título y el formulario.
     * @returns HTML para insertar; vacío por defecto.
     */
    antes() {
      return "";
    }
    tipoBarra() {
      return "interna";
    }
    contenido(seq) {
      const seccion = this.seccion();
      const b = this.repoBorrador.leer();
      const pos = this.catalogo.posicion(seccion);
      this.pintar(`<div class="contenedor-estrecho"><div class="tarjeta">
      <h1>${this.titulo()}</h1>
      ${seq ? `<p class="muted centrado pequeno">Paso ${pos} de ${this.catalogo.total()}</p>` : ""}
      ${this.antes()}
      <form id="form" novalidate>${this.cuerpo(b.seccion(seccion))}
        <button class="btn btn-azul btn-ancho" type="submit">${this.botonEnvio(seq)}</button></form>
      <p class="enlace-centro"><a href="#/inicio">Volver al Dashboard</a></p></div></div>`);
      this.$("#form").onsubmit = (ev) => {
        ev.preventDefault();
        const datos = this.lector.leer(ev.target, this.numericos(), this.booleanos());
        this.manejadorEnvio?.(datos, seq);
      };
    }
    /**
     * Elige el texto del botón de envío.
     * @param seq - Si la pantalla se abre en el flujo secuencial.
     * @returns Texto del botón.
     */
    botonEnvio(seq) {
      if (seq) return this.seccion() !== "clinica" ? "Guardar y continuar" : "Guardar y ver resultado";
      return this.textoBoton();
    }
  };

  // src/vistas/modulos/VistaActividad.ts
  var ACT = [["sedentario", "Sedentario (poco o nada de ejercicio)"], ["moderado", "Moderado (ejercicio 1 a 3 veces por semana)"], ["activo", "Activo (ejercicio 4 o m\xE1s veces por semana)"]];
  var VistaActividad = class extends VistaModulo {
    seccion() {
      return "actividad";
    }
    titulo() {
      return "Selecciona tu nivel de actividad f\xEDsica";
    }
    textoBoton() {
      return "Guardar";
    }
    cuerpo(d) {
      return this.campos.seleccion("actividad", "Nivel de actividad", ACT, d.actividad ?? "");
    }
  };

  // src/vistas/modulos/VistaAlimentacion.ts
  var FREC = [["nunca", "Nunca"], ["ocasionalmente", "Ocasionalmente"], ["diariamente", "Diariamente"]];
  var AGUA = [["menos_de_1_litro", "Menos de 1 litro"], ["de_1_a_2_litros", "De 1 a 2 litros"], ["mas_de_2_litros", "M\xE1s de 2 litros"]];
  var VistaAlimentacion = class extends VistaModulo {
    seccion() {
      return "alimentacion";
    }
    titulo() {
      return "H\xE1bitos Alimenticios";
    }
    textoBoton() {
      return "Actualizar respuestas";
    }
    cuerpo(d) {
      const c = this.campos;
      return `
      ${c.seleccion("frutas", "\xBFConsumes frutas?", FREC, d.frutas ?? "")}
      ${c.seleccion("verduras", "\xBFConsumes verduras?", FREC, d.verduras ?? "")}
      ${c.seleccion("comida_rapida", "\xBFConsumes comida r\xE1pida?", FREC, d.comida_rapida ?? "")}
      ${c.seleccion("bebidas_azucaradas", "\xBFConsumes bebidas azucaradas?", FREC, d.bebidas_azucaradas ?? "")}
      ${c.seleccion("agua", "\xBFCu\xE1nta agua tomas al d\xEDa?", AGUA, d.agua ?? "")}`;
    }
  };

  // src/vistas/modulos/VistaConsumo.ts
  var VistaConsumo = class extends VistaModulo {
    seccion() {
      return "consumo";
    }
    titulo() {
      return "H\xE1bitos de Consumo";
    }
    textoBoton() {
      return "Guardar";
    }
    booleanos() {
      return ["fuma", "consume_alcohol", "diabetes", "antecedentes_familiares"];
    }
    cuerpo(d) {
      const c = this.campos;
      return `
      ${c.siNo("fuma", "\xBFFumas?", d.fuma)}
      ${c.siNo("consume_alcohol", "\xBFConsumes alcohol?", d.consume_alcohol)}
      ${c.siNo("diabetes", "\xBFTienes diabetes?", d.diabetes)}
      ${c.siNo("antecedentes_familiares", "\xBFTienes antecedentes familiares de enfermedad cardiovascular?", d.antecedentes_familiares)}`;
    }
  };

  // src/vistas/modulos/VistaDatos.ts
  var GEN = [["masculino", "Masculino"], ["femenino", "Femenino"], ["otro", "Otro"]];
  var VistaDatos = class extends VistaModulo {
    /**
     * @param d - Dependencias de la pantalla.
     * @param sesion - De aquí sale el nombre para el saludo.
     */
    constructor(d, sesion) {
      super(d);
      this.sesion = sesion;
    }
    seccion() {
      return "datos";
    }
    titulo() {
      return "Registrar Datos Personales";
    }
    textoBoton() {
      return "Guardar Datos";
    }
    numericos() {
      return ["anio_nacimiento", "peso_kg", "altura_cm"];
    }
    /** @returns Saludo con el nombre del usuario. */
    antes() {
      return `<div class="alerta alerta-ok">Bienvenido ${Html.esc(this.sesion.nombre())} \u{1F44B}</div>`;
    }
    cuerpo(d) {
      const c = this.campos;
      return `
      ${c.numero("anio_nacimiento", "A\xF1o de nacimiento", d.anio_nacimiento ?? "", 'min="1900" max="' + (/* @__PURE__ */ new Date()).getFullYear() + '" step="1"')}
      ${c.seleccion("genero", "G\xE9nero", GEN, d.genero ?? "")}
      ${c.numero("peso_kg", "Peso (kg)", d.peso_kg ?? "", 'min="20" max="400"')}
      ${c.numero("altura_cm", "Altura (cm)", d.altura_cm ?? "", 'min="80" max="250"')}`;
    }
  };

  // src/vistas/modulos/VistaPresion.ts
  var FILA = {
    normal: ["fila-verde", "Normal"],
    alta: ["fila-roja", "Alta"],
    baja: ["fila-amarilla", "Baja"],
    elevada: ["fila-naranja", "Elevada"]
  };
  var VistaPresion = class extends VistaModulo {
    seccion() {
      return "clinica";
    }
    titulo() {
      return "Registro de Presi\xF3n Arterial";
    }
    textoBoton() {
      return "Guardar";
    }
    numericos() {
      return ["presion_sistolica", "presion_diastolica", "colesterol_total", "colesterol_hdl"];
    }
    cuerpo(d) {
      const c = this.campos;
      return `
      ${c.numero("presion_sistolica", "Presi\xF3n sist\xF3lica (mmHg)", d.presion_sistolica ?? "", 'min="50" max="260" step="1"')}
      ${c.numero("presion_diastolica", "Presi\xF3n diast\xF3lica (mmHg)", d.presion_diastolica ?? "", 'min="30" max="160" step="1"')}
      ${c.numero("colesterol_total", "Colesterol total (mg/dL)", d.colesterol_total ?? "", 'min="50" max="600"')}
      ${c.numero("colesterol_hdl", "Colesterol HDL (mg/dL)", d.colesterol_hdl ?? "", 'min="10" max="200"')}`;
    }
    /**
     * Pinta el formulario y, fuera del flujo secuencial, el sitio de la tabla de registros.
     * @param seq - Si la pantalla se abre en el flujo secuencial.
     */
    contenido(seq) {
      super.contenido(seq);
      if (seq) return;
      this.$(".tarjeta").insertAdjacentHTML("afterend", `<div class="tarjeta-plana" style="margin-top:1.4rem"><h2>Historial de registros</h2><div id="tabla-p" class="muted">Cargando\u2026</div></div>`);
    }
    /**
     * El controlador entrega los registros ya consultados; la vista solo los dibuja.
     * @param p - Registros de presión.
     */
    mostrarPresiones(p) {
      const esc = Html.esc;
      this.$("#tabla-p").outerHTML = p.length ? `<div class="tabla-scroll"><table><thead><tr><th>Fecha</th><th>Sist\xF3lica</th><th>Diast\xF3lica</th><th>Estado</th></tr></thead><tbody>${p.map((r) => {
        const [cl, tx] = FILA[r.estado] || ["", r.estado];
        return `<tr class="${cl}"><td>${esc(String(r.fecha).replace("T", " ").slice(0, 16))}</td><td>${esc(r.sistolica)}</td><td>${esc(r.diastolica)}</td><td>${esc(tx)}</td></tr>`;
      }).join("")}</tbody></table></div>` : '<p class="muted">A\xFAn no tienes registros. Se agregan al calcular tu evaluaci\xF3n.</p>';
    }
    /** Indica en la tabla que no se pudieron cargar los registros. */
    mostrarErrorPresiones() {
      this.$("#tabla-p").textContent = "No se pudo cargar el historial.";
    }
  };

  // src/interfaz/FabricaVistas.ts
  var FabricaVistas = class {
    /** @param d - Dependencias que se reparten a vistas y controladores. */
    constructor(d) {
      this.d = d;
    }
    /**
     * Crea la pantalla de una ruta con su controlador ya conectado.
     * @param ruta - Ruta sin `#` y sin query, p. ej. `/inicio`.
     * @returns La vista, o null si la ruta no existe.
     */
    crear(ruta) {
      const d = this.d;
      const mod = { barra: d.barra, catalogo: d.catalogo, repoBorrador: d.repoBorrador, lector: d.lector, campos: d.campos };
      const m = ruta.match(/^\/resultado\/(\d+)$/);
      if (m) {
        const vista = new VistaResultado(d.barra, m[1]);
        new ControladorResultado(vista, d.apiEvaluaciones, d.descarga, d.avisos, d.navegador, d.errores);
        return vista;
      }
      switch (ruta) {
        case "/login": {
          const vista = new VistaLogin(d.barra);
          new ControladorLogin(vista, d.apiAuth, d.sesion, d.repoBorrador, d.avisos, d.navegador, d.errores);
          return vista;
        }
        case "/registro": {
          const vista = new VistaRegistro(d.barra);
          new ControladorRegistro(vista, d.apiAuth, d.avisos, d.navegador, d.errores);
          return vista;
        }
        case "/inicio": {
          const vista = new VistaInicio({ barra: d.barra, repoBorrador: d.repoBorrador, catalogo: d.catalogo });
          new ControladorInicio(vista, d.flujo);
          return vista;
        }
        case "/faq":
          return new VistaFaq({ barra: d.barra, sesion: d.sesion, minutos: d.minutos });
        case "/historial": {
          const vista = new VistaHistorial(d.barra);
          new ControladorHistorial(vista, d.apiEvaluaciones, d.descarga, d.errores);
          return vista;
        }
        case "/datos":
          return this.conControlador(new VistaDatos(mod, d.sesion));
        case "/habitos-alimenticios":
          return this.conControlador(new VistaAlimentacion(mod));
        case "/actividad":
          return this.conControlador(new VistaActividad(mod));
        case "/consumo":
          return this.conControlador(new VistaConsumo(mod));
        case "/presion": {
          const vista = new VistaPresion(mod);
          new ControladorPresion(vista, d.repoBorrador, d.catalogo, d.flujo, d.avisos, d.navegador, d.apiEvaluaciones);
          return vista;
        }
        default:
          return null;
      }
    }
    /**
     * Pantallas de módulo sin lógica propia: todas comparten ControladorModulo.
     * @param vista - Pantalla del módulo.
     * @returns La misma vista, ya conectada.
     */
    conControlador(vista) {
      const d = this.d;
      new ControladorModulo(vista, d.repoBorrador, d.catalogo, d.flujo, d.avisos, d.navegador);
      return vista;
    }
  };

  // src/interfaz/LectorFormulario.ts
  var LectorFormulario = class {
    /**
     * Lee los campos de un formulario.
     * @param f - Formulario a leer.
     * @param numericos - Campos que se convierten a número; vacíos quedan como ''.
     * @param booleanos - Campos que se convierten a booleano ('si' es true).
     * @returns Valores por nombre de campo.
     */
    leer(f, numericos = [], booleanos = []) {
      const out = {};
      const fd = new FormData(f);
      for (const [k, valor] of fd.entries()) {
        const v = valor;
        out[k] = numericos.includes(k) ? v === "" ? "" : Number(v) : booleanos.includes(k) ? v === "si" : v;
      }
      return out;
    }
  };

  // src/interfaz/ManejadorErrores.ts
  var ManejadorErrores = class {
    /**
     * @param avisos - Avisos en pantalla.
     * @param cierre - Cierra la sesión cuando venció.
     */
    constructor(avisos, cierre) {
      this.avisos = avisos;
      this.cierre = cierre;
    }
    /**
     * Muestra un error; un 401 cierra la sesión por vencimiento.
     * @param e - Error capturado.
     */
    mostrar(e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          this.cierre.ejecutar("Tu sesi\xF3n expir\xF3. Inicia sesi\xF3n de nuevo.");
          return;
        }
        this.avisos.mostrar(e.mensajes[0], "error", e.mensajes);
        return;
      }
      this.avisos.mostrar("Ocurri\xF3 un error inesperado.", "error");
    }
  };

  // src/interfaz/Navegador.ts
  var Navegador = class {
    /**
     * Cambia el hash de la URL; el enrutador reacciona al cambio.
     * @param ruta - Ruta con `#`, p. ej. `#/inicio`.
     */
    ir(ruta) {
      location.hash = ruta;
    }
  };

  // src/servicios/CierreSesion.ts
  var CierreSesion = class {
    /**
     * @param avisos - Guarda el aviso para mostrarlo en el login.
     * @param navegador - Lleva al login.
     */
    constructor(avisos, navegador) {
      this.avisos = avisos;
      this.navegador = navegador;
      this.observadores = [];
    }
    /**
     * Agrega un observador del cierre.
     * @param o - Observador que se agrega.
     */
    suscribir(o) {
      this.observadores.push(o);
    }
    /**
     * Cierra la sesión: avisa a los observadores y vuelve al login.
     * @param aviso - Mensaje opcional para mostrar en el login.
     */
    ejecutar(aviso) {
      this.observadores.forEach((o) => o.alCerrarSesion());
      if (aviso) this.avisos.avisarLuego(aviso, "aviso");
      this.navegador.ir("#/login");
    }
  };

  // src/servicios/DescargaPdf.ts
  var DescargaPdf = class {
    /**
     * @param api - Consulta del PDF.
     * @param errores - Presenta los errores de la descarga.
     */
    constructor(api, errores) {
      this.api = api;
      this.errores = errores;
    }
    /**
     * Descarga el PDF; los errores se muestran al usuario.
     * @param id - Id de la evaluación.
     */
    async descargar(id) {
      try {
        const blob = await this.api.pdf(id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cardioprev-evaluacion-" + id + ".pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1e3);
      } catch (e) {
        this.errores.mostrar(e);
      }
    }
  };

  // src/servicios/FlujoEvaluacion.ts
  var FlujoEvaluacion = class {
    /**
     * @param repo - Persistencia del borrador.
     * @param catalogo - Títulos de las secciones.
     * @param api - Endpoints de evaluaciones.
     * @param avisos - Avisos en pantalla.
     * @param navegador - Cambio de ruta.
     * @param errores - Presenta los errores de las peticiones.
     */
    constructor(repo, catalogo, api, avisos, navegador, errores) {
      this.repo = repo;
      this.catalogo = catalogo;
      this.api = api;
      this.avisos = avisos;
      this.navegador = navegador;
      this.errores = errores;
    }
    /** Calcula si el borrador está completo y cambió; si no, muestra el último resultado. */
    async verRiesgo() {
      this.avisos.mostrar("");
      const b = this.repo.leer();
      if (b.todoCompleto() && b.cambioDesdeUltimoEnvio()) return this.enviar();
      try {
        const ultimoId = b.ultimoId();
        if (ultimoId) return this.navegador.ir("#/resultado/" + ultimoId);
        const h = await this.api.historial();
        if (h.length) return this.navegador.ir("#/resultado/" + h[0].id);
        const falta = b.faltantes().map((s) => this.catalogo.definicion(s).titulo.toLowerCase());
        this.avisos.mostrar("A\xFAn no tienes una evaluaci\xF3n. Completa: " + falta.join(", ") + ". Usa \xABComenzar Evaluaci\xF3n\xBB.", "aviso");
      } catch (e) {
        this.errores.mostrar(e);
      }
    }
    /** Envía el borrador completo y lleva al resultado. Si está incompleto, o el envío falla sin que la sesión haya vencido, vuelve al Dashboard. */
    async enviar() {
      const b = this.repo.leer();
      if (!b.todoCompleto()) {
        this.avisos.avisarLuego("Completa todos los m\xF3dulos para calcular tu riesgo.", "aviso");
        return this.navegador.ir("#/inicio");
      }
      const payload = b.payload();
      try {
        const r = await this.api.crearEvaluacion(payload);
        b.registrarEnvio(payload, r.id);
        this.repo.guardar(b);
        this.navegador.ir("#/resultado/" + r.id);
      } catch (e) {
        this.errores.mostrar(e);
        if (!(e instanceof ApiError && e.status === 401)) this.navegador.ir("#/inicio");
      }
    }
  };

  // src/servicios/VigilanteInactividad.ts
  var VigilanteInactividad = class {
    /**
     * @param sesion - Estado de la sesión.
     * @param cierre - Se ejecuta al vencer el conteo.
     * @param minutos - Minutos de inactividad permitidos.
     */
    constructor(sesion, cierre, minutos) {
      this.sesion = sesion;
      this.cierre = cierre;
      this.minutos = minutos;
      this.temporizador = null;
    }
    /** Registra los eventos de actividad que reinician el conteo. */
    iniciar() {
      ["click", "keydown", "touchstart"].forEach((ev) => document.addEventListener(ev, () => this.reiniciar(), { passive: true }));
    }
    /** Reinicia el conteo si hay sesión activa; sin sesión, solo lo detiene. */
    reiniciar() {
      if (this.temporizador !== null) clearTimeout(this.temporizador);
      if (!this.sesion.activa()) return;
      this.temporizador = setTimeout(() => this.cierre.ejecutar("Tu sesi\xF3n se cerr\xF3 por inactividad."), this.minutos * 60 * 1e3);
    }
  };

  // src/App.ts
  var MINUTOS_INACTIVIDAD = 15;
  var App = class {
    /** Crea las dependencias, suscribe los observadores de cierre y arranca el vigilante y el enrutador. */
    iniciar() {
      const almacen = new AlmacenSesion();
      const sesion = new Sesion(almacen);
      const catalogo = new CatalogoSecciones();
      const repoBorrador = new RepositorioBorrador(almacen, catalogo);
      const api = new Api(new ClienteHttp(sesion));
      const avisos = new Avisos(document.querySelector("#flash"));
      const navegador = new Navegador();
      const cierre = new CierreSesion(avisos, navegador);
      cierre.suscribir(sesion);
      cierre.suscribir(repoBorrador);
      const errores = new ManejadorErrores(avisos, cierre);
      const barra = new BarraNavegacion(document.querySelector("#barra"), cierre);
      const flujo = new FlujoEvaluacion(repoBorrador, catalogo, api, avisos, navegador, errores);
      const descarga = new DescargaPdf(api, errores);
      const vigilante = new VigilanteInactividad(sesion, cierre, MINUTOS_INACTIVIDAD);
      const fabrica = new FabricaVistas({
        barra,
        apiAuth: api,
        apiEvaluaciones: api,
        sesion,
        repoBorrador,
        catalogo,
        flujo,
        descarga,
        avisos,
        navegador,
        errores,
        lector: new LectorFormulario(),
        campos: new Campos(),
        minutos: MINUTOS_INACTIVIDAD
      });
      const enrutador = new Enrutador(fabrica, sesion, avisos, navegador, vigilante);
      vigilante.iniciar();
      enrutador.iniciar();
    }
  };

  // src/main.ts
  new App().iniciar();
})();
