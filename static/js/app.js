/* CardioPrev - interfaz (SPA con rutas por hash). Sigue las pantallas del manual de usuario.
   Flujo: el usuario completa módulos (datos, alimentación, actividad, consumo, presión);
   con todo completo se envía UNA evaluación al backend (Strategy + Factory + Observer). */
(() => {
  'use strict';
  const MINUTOS_INACTIVIDAD = 15;
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- borrador (se guarda solo en la pestaña) ---------- */
  const K_BORRADOR = 'cp_borrador';
  const vacio = () => ({ datos: {}, alimentacion: {}, actividad: {}, consumo: {}, clinica: {}, ultimo: null, ultimoId: null });
  const leerBorrador = () => { try { return Object.assign(vacio(), JSON.parse(sessionStorage.getItem(K_BORRADOR) || '{}')); } catch (_) { return vacio(); } };
  const guardarBorrador = (b) => { try { sessionStorage.setItem(K_BORRADOR, JSON.stringify(b)); } catch (_) { /* sin almacenamiento */ } };
  const borrarBorrador = () => { try { sessionStorage.removeItem(K_BORRADOR); } catch (_) { /* nada */ } };

  const SECCIONES = {
    datos: { titulo: 'Datos personales', ruta: '#/datos', campos: ['anio_nacimiento', 'genero', 'peso_kg', 'altura_cm'] },
    alimentacion: { titulo: 'Hábitos alimenticios', ruta: '#/habitos-alimenticios', campos: ['frutas', 'verduras', 'comida_rapida', 'bebidas_azucaradas', 'agua'] },
    actividad: { titulo: 'Actividad física', ruta: '#/actividad', campos: ['actividad'] },
    consumo: { titulo: 'Hábitos de consumo', ruta: '#/consumo', campos: ['fuma', 'consume_alcohol', 'diabetes', 'antecedentes_familiares'] },
    clinica: { titulo: 'Presión arterial', ruta: '#/presion', campos: ['presion_sistolica', 'presion_diastolica', 'colesterol_total', 'colesterol_hdl'] },
  };
  const ORDEN = ['datos', 'alimentacion', 'actividad', 'consumo', 'clinica'];
  const completa = (b, s) => SECCIONES[s].campos.every((c) => b[s][c] !== undefined && b[s][c] !== '' && b[s][c] !== null);
  const todoCompleto = (b) => ORDEN.every((s) => completa(b, s));
  const armarPayload = (b) => Object.assign({}, ...ORDEN.map((s) => b[s]));

  /* ---------- utilidades de interfaz ---------- */
  function flash(msg, tipo = 'ok', lista = null) {
    const caja = $('#flash');
    if (!msg) { caja.innerHTML = ''; return; }
    const items = lista && lista.length > 1 ? '<ul>' + lista.map((m) => `<li>${esc(m)}</li>`).join('') + '</ul>' : '';
    caja.innerHTML = `<div class="alerta alerta-${tipo}">${items ? esc(lista.length + ' datos por corregir:') + items : esc(msg)}</div>`;
    window.scrollTo(0, 0);
  }
  let flashPendiente = null;
  const avisarLuego = (msg, tipo = 'ok') => { flashPendiente = { msg, tipo }; };
  function mostrarError(e) {
    if (e instanceof ApiError) {
      if (e.status === 401) return salir('Tu sesión expiró. Inicia sesión de nuevo.');
      return flash(e.mensajes[0], 'error', e.mensajes);
    }
    flash('Ocurrió un error inesperado.', 'error');
  }
  const ir = (ruta) => { location.hash = ruta; };
  function salir(aviso) {
    Api.cerrarSesion(); borrarBorrador();
    if (aviso) avisarLuego(aviso, 'aviso');
    ir('#/login');
  }

  /* ---------- barras de navegación ---------- */
  function barra(tipo) {
    const b = $('#barra');
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
    const s = $('#salir'); if (s) s.onclick = () => salir();
  }

  /* ---------- campos reutilizables ---------- */
  const opciones = (lista, actual) => `<option value="">Selecciona…</option>` +
    lista.map(([v, t]) => `<option value="${v}"${String(actual) === v ? ' selected' : ''}>${esc(t)}</option>`).join('');
  const FREC = [['nunca', 'Nunca'], ['ocasionalmente', 'Ocasionalmente'], ['diariamente', 'Diariamente']];
  const AGUA = [['menos_de_1_litro', 'Menos de 1 litro'], ['de_1_a_2_litros', 'De 1 a 2 litros'], ['mas_de_2_litros', 'Más de 2 litros']];
  const ACT = [['sedentario', 'Sedentario (poco o nada de ejercicio)'], ['moderado', 'Moderado (ejercicio 1 a 3 veces por semana)'], ['activo', 'Activo (ejercicio 4 o más veces por semana)']];
  const GEN = [['masculino', 'Masculino'], ['femenino', 'Femenino'], ['otro', 'Otro']];
  const campoNum = (n, etiqueta, v, extra = '') => `<div class="campo"><label for="${n}">${etiqueta}</label><input id="${n}" name="${n}" type="number" step="any" ${extra} value="${esc(v)}" required></div>`;
  const campoSel = (n, etiqueta, lista, v) => `<div class="campo"><label for="${n}">${etiqueta}</label><select id="${n}" name="${n}" required>${opciones(lista, v)}</select></div>`;
  const radioSiNo = (n, etiqueta, v) => `<div class="grupo"><span class="pregunta" id="l-${n}">${etiqueta}</span>
    <div class="radios" role="radiogroup" aria-labelledby="l-${n}">
      <label><input type="radio" name="${n}" value="si"${v === true ? ' checked' : ''} required> Sí</label>
      <label><input type="radio" name="${n}" value="no"${v === false ? ' checked' : ''}> No</label></div></div>`;
  const leerForm = (f, numericos = [], booleanos = []) => {
    const out = {}; const fd = new FormData(f);
    for (const [k, v] of fd.entries()) out[k] = numericos.includes(k) ? (v === '' ? '' : Number(v)) : (booleanos.includes(k) ? v === 'si' : v);
    return out;
  };

  /* ---------- pantalla base para módulos ---------- */
  function pantallaModulo(seccion, seq, titulo, cuerpo, textoBoton, numericos, booleanos, antes) {
    const b = leerBorrador();
    const pos = ORDEN.indexOf(seccion) + 1;
    $('#vista').innerHTML = `<div class="contenedor-estrecho"><div class="tarjeta">
      <h1>${titulo}</h1>
      ${seq ? `<p class="muted centrado pequeno">Paso ${pos} de ${ORDEN.length}</p>` : ''}
      ${antes || ''}
      <form id="form" novalidate>${cuerpo(b[seccion])}
        <button class="btn btn-azul btn-ancho" type="submit">${seq && seccion !== 'clinica' ? 'Guardar y continuar' : (seq ? 'Guardar y ver resultado' : textoBoton)}</button></form>
      <p class="enlace-centro"><a href="#/inicio">Volver al Dashboard</a></p></div></div>`;
    $('#form').onsubmit = async (ev) => {
      ev.preventDefault(); flash('');
      const datos = leerForm(ev.target, numericos, booleanos);
      const faltan = SECCIONES[seccion].campos.filter((c) => datos[c] === undefined || datos[c] === '' || Number.isNaN(datos[c]));
      if (faltan.length) return flash('Completa todos los campos para continuar.', 'error');
      const bor = leerBorrador(); bor[seccion] = datos; guardarBorrador(bor);
      if (seq) {
        const sig = ORDEN[ORDEN.indexOf(seccion) + 1];
        return sig ? ir(SECCIONES[sig].ruta + '?seq=1') : enviar();
      }
      avisarLuego('Datos guardados correctamente: ' + SECCIONES[seccion].titulo.toLowerCase() + '.'); ir('#/inicio');
    };
  }

  /* ---------- vistas ---------- */
  function vistaLogin() {
    barra('auth');
    $('#vista').innerHTML = `<div class="contenedor-estrecho"><div class="tarjeta"><h1>Login</h1>
      <form id="form" novalidate>
        <div class="campo"><label for="correo">Correo</label><input id="correo" name="correo" type="email" autocomplete="username" required></div>
        <div class="campo"><label for="password">Contraseña</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
        <button class="btn btn-oscuro btn-ancho" type="submit">Entrar</button></form>
      <p class="enlace-centro">¿No tienes cuenta? <a href="#/registro">Regístrate</a></p></div></div>`;
    $('#form').onsubmit = async (ev) => {
      ev.preventDefault(); flash('');
      const f = ev.target;
      try { await Api.login(f.correo.value.trim(), f.password.value); borrarBorrador(); avisarLuego('Bienvenido ' + Api.nombre() + ' 👋'); ir('#/inicio'); }
      catch (e) { mostrarError(e); }
    };
  }

  function vistaRegistro() {
    barra('auth');
    $('#vista').innerHTML = `<div class="contenedor-estrecho"><div class="tarjeta"><h1>Registro</h1>
      <form id="form" novalidate>
        <div class="campo"><label for="nombre">Nombre de usuario</label><input id="nombre" name="nombre" type="text" autocomplete="name" required></div>
        <div class="campo"><label for="correo">Correo</label><input id="correo" name="correo" type="email" autocomplete="username" required></div>
        <div class="campo"><label for="password">Contraseña</label><input id="password" name="password" type="password" autocomplete="new-password" aria-describedby="ayuda-pw" required>
          <small id="ayuda-pw" class="muted">Mínimo 8 caracteres, con letras y números.</small></div>
        <button class="btn btn-azul btn-ancho" type="submit">Registrarse</button></form>
      <p class="enlace-centro">¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></p></div></div>`;
    $('#form').onsubmit = async (ev) => {
      ev.preventDefault(); flash('');
      const f = ev.target;
      try {
        await Api.registro({ nombre: f.nombre.value.trim(), correo: f.correo.value.trim(), password: f.password.value });
        avisarLuego('Cuenta creada. Ahora inicia sesión.'); ir('#/login');
      } catch (e) { mostrarError(e); }
    };
  }

  function vistaInicio() {
    barra('dash');
    const b = leerBorrador();
    const chips = ORDEN.map((s) => `<a href="${SECCIONES[s].ruta}" class="${completa(b, s) ? 'hecho' : ''}">${completa(b, s) ? '✓ ' : ''}${SECCIONES[s].titulo}</a>`).join('');
    const mod = (img, t, p, ruta) => `<a class="modulo" href="${ruta}"><img src="/static/img/${img}.png" alt=""><h3>${t}</h3><p>${p}</p></a>`;
    $('#vista').innerHTML = `<div class="contenedor-medio">
      <section class="hero"><h1>Previene el Riesgo <span>Cardiovascular</span></h1>
        <p>Evalúa tu salud cardiovascular con una herramienta inteligente que analiza tus hábitos, tus datos y tus antecedentes.</p>
        <div class="fila-botones"><a class="btn btn-rojo" href="#/datos?seq=1">Comenzar Evaluación</a>
          <button class="btn btn-contorno" type="button" id="ver-riesgo">Riesgo Cardiovascular</button></div>
        <div class="progreso" aria-label="Avance de tu evaluación">${chips}</div></section>
      <section class="modulos" aria-label="Módulos">
        ${mod('alimentos', 'Hábitos Alimenticios', 'Registra tu alimentación diaria', '#/habitos-alimenticios')}
        ${mod('actividad', 'Actividad Física', 'Monitorea tu nivel de actividad', '#/actividad')}
        ${mod('consumo', 'Tabaco y Alcohol', 'Registra tus hábitos personales', '#/consumo')}
        ${mod('presion', 'Presión Arterial', 'Consulta tus mediciones recientes', '#/presion')}
        ${mod('historial', 'Historial', 'Revisa tus evaluaciones previas', '#/historial')}
      </section></div>`;
    $('#ver-riesgo').onclick = verRiesgo;
  }

  /* "Riesgo Cardiovascular": calcula si el borrador está completo y cambió; si no, muestra el último resultado. */
  async function verRiesgo() {
    flash('');
    const b = leerBorrador();
    if (todoCompleto(b) && JSON.stringify(armarPayload(b)) !== b.ultimo) return enviar();
    try {
      if (b.ultimoId) return ir('#/resultado/' + b.ultimoId);
      const h = await Api.historial();
      if (h.length) return ir('#/resultado/' + h[0].id);
      const falta = ORDEN.filter((s) => !completa(b, s)).map((s) => SECCIONES[s].titulo.toLowerCase());
      flash('Aún no tienes una evaluación. Completa: ' + falta.join(', ') + '. Usa «Comenzar Evaluación».', 'aviso');
    } catch (e) { mostrarError(e); }
  }

  async function enviar() {
    const b = leerBorrador();
    if (!todoCompleto(b)) { avisarLuego('Completa todos los módulos para calcular tu riesgo.', 'aviso'); return ir('#/inicio'); }
    const payload = armarPayload(b);
    try {
      const r = await Api.crearEvaluacion(payload);
      b.ultimo = JSON.stringify(payload); b.ultimoId = r.id; guardarBorrador(b);
      ir('#/resultado/' + r.id);
    } catch (e) { mostrarError(e); if (!(e instanceof ApiError && e.status === 401)) ir('#/inicio'); }
  }

  function vistaDatos(seq) {
    barra('interna');
    pantallaModulo('datos', seq, 'Registrar Datos Personales', (d) => `
      ${campoNum('anio_nacimiento', 'Año de nacimiento', d.anio_nacimiento ?? '', 'min="1900" max="' + new Date().getFullYear() + '" step="1"')}
      ${campoSel('genero', 'Género', GEN, d.genero ?? '')}
      ${campoNum('peso_kg', 'Peso (kg)', d.peso_kg ?? '', 'min="20" max="400"')}
      ${campoNum('altura_cm', 'Altura (cm)', d.altura_cm ?? '', 'min="80" max="250"')}`,
      'Guardar Datos', ['anio_nacimiento', 'peso_kg', 'altura_cm'], [],
      `<div class="alerta alerta-ok">Bienvenido ${esc(Api.nombre())} 👋</div>`);
  }

  function vistaAlimentacion(seq) {
    barra('interna');
    pantallaModulo('alimentacion', seq, 'Hábitos Alimenticios', (d) => `
      ${campoSel('frutas', '¿Consumes frutas?', FREC, d.frutas ?? '')}
      ${campoSel('verduras', '¿Consumes verduras?', FREC, d.verduras ?? '')}
      ${campoSel('comida_rapida', '¿Consumes comida rápida?', FREC, d.comida_rapida ?? '')}
      ${campoSel('bebidas_azucaradas', '¿Consumes bebidas azucaradas?', FREC, d.bebidas_azucaradas ?? '')}
      ${campoSel('agua', '¿Cuánta agua tomas al día?', AGUA, d.agua ?? '')}`,
      'Actualizar respuestas', [], []);
  }

  function vistaActividad(seq) {
    barra('interna');
    pantallaModulo('actividad', seq, 'Selecciona tu nivel de actividad física', (d) =>
      campoSel('actividad', 'Nivel de actividad', ACT, d.actividad ?? ''), 'Guardar', [], []);
  }

  function vistaConsumo(seq) {
    barra('interna');
    pantallaModulo('consumo', seq, 'Hábitos de Consumo', (d) => `
      ${radioSiNo('fuma', '¿Fumas?', d.fuma)}
      ${radioSiNo('consume_alcohol', '¿Consumes alcohol?', d.consume_alcohol)}
      ${radioSiNo('diabetes', '¿Tienes diabetes?', d.diabetes)}
      ${radioSiNo('antecedentes_familiares', '¿Tienes antecedentes familiares de enfermedad cardiovascular?', d.antecedentes_familiares)}`,
      'Guardar', [], ['fuma', 'consume_alcohol', 'diabetes', 'antecedentes_familiares']);
  }

  const FILA = { normal: ['fila-verde', 'Normal'], alta: ['fila-roja', 'Alta'], baja: ['fila-amarilla', 'Baja'], elevada: ['fila-naranja', 'Elevada'] };
  async function vistaPresion(seq) {
    barra('interna');
    pantallaModulo('clinica', seq, 'Registro de Presión Arterial', (d) => `
      ${campoNum('presion_sistolica', 'Presión sistólica (mmHg)', d.presion_sistolica ?? '', 'min="50" max="260" step="1"')}
      ${campoNum('presion_diastolica', 'Presión diastólica (mmHg)', d.presion_diastolica ?? '', 'min="30" max="160" step="1"')}
      ${campoNum('colesterol_total', 'Colesterol total (mg/dL)', d.colesterol_total ?? '', 'min="50" max="600"')}
      ${campoNum('colesterol_hdl', 'Colesterol HDL (mg/dL)', d.colesterol_hdl ?? '', 'min="10" max="200"')}`,
      'Guardar', ['presion_sistolica', 'presion_diastolica', 'colesterol_total', 'colesterol_hdl'], []);
    if (seq) return;
    $('.tarjeta').insertAdjacentHTML('afterend', `<div class="tarjeta-plana" style="margin-top:1.4rem"><h2>Historial de registros</h2><div id="tabla-p" class="muted">Cargando…</div></div>`);
    try {
      const p = await Api.presiones();
      $('#tabla-p').outerHTML = p.length ? `<div class="tabla-scroll"><table><thead><tr><th>Fecha</th><th>Sistólica</th><th>Diastólica</th><th>Estado</th></tr></thead><tbody>${
        p.map((r) => { const [cl, tx] = FILA[r.estado] || ['', r.estado]; return `<tr class="${cl}"><td>${esc(String(r.fecha).replace('T', ' ').slice(0, 16))}</td><td>${esc(r.sistolica)}</td><td>${esc(r.diastolica)}</td><td>${esc(tx)}</td></tr>`; }).join('')
      }</tbody></table></div>` : '<p class="muted">Aún no tienes registros. Se agregan al calcular tu evaluación.</p>';
    } catch (e) { $('#tabla-p').textContent = 'No se pudo cargar el historial.'; }
  }

  async function vistaResultado(id) {
    barra('interna');
    $('#vista').innerHTML = '<p class="centrado muted">Cargando resultado…</p>';
    try {
      const r = await Api.evaluacion(id);
      $('#flash').innerHTML = '';
      const nombreNivel = { bajo: 'Riesgo Bajo', medio: 'Riesgo Medio', alto: 'Riesgo Alto' }[r.nivel] || r.nivel;
      const n = r.nutricion;
      $('#vista').innerHTML = `<div class="contenedor resultado">
        <h1>Evaluación del Riesgo Cardiovascular</h1>
        <div class="circulo ${esc(r.color)}" role="img" aria-label="Indicador de color: ${esc(r.color)}"></div>
        <p class="nivel">Tu nivel de riesgo es: <b class="${esc(r.color)}">${esc(nombreNivel)}</b></p>
        <p class="muted">${esc(r.puntaje)} de ${esc(r.puntaje_maximo)} puntos · IMC ${esc(r.imc)} · ${esc(r.edad)} años</p>
        ${r.alertas.length ? `<div class="alertas">${r.alertas.map((a) => `<div class="alerta alerta-aviso">⚠ ${esc(a)}</div>`).join('')}</div>` : ''}
        <h2>Recomendaciones:</h2>
        <ul class="lista-grupo">${r.recomendaciones.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        ${n ? `<h2>Estimación nutricional diaria</h2><div class="macros"><div><strong>${esc(n.calorias)}</strong>kcal</div><div><strong>${esc(n.proteinas_g)} g</strong>proteínas</div><div><strong>${esc(n.grasas_g)} g</strong>grasas</div><div><strong>${esc(n.carbohidratos_g)} g</strong>carbohidratos</div></div>` : ''}
        <details class="detalle"><summary>Ver el aporte de cada factor</summary>
          <div class="tabla-scroll"><table><thead><tr><th>Factor</th><th>Valor</th><th>Puntos</th></tr></thead><tbody>${
            r.factores.map((f) => `<tr><td>${esc(f.factor)}</td><td>${esc(f.valor)}</td><td>${esc(f.puntos)}</td></tr>`).join('')}</tbody></table></div></details>
        <p class="muted pequeno">Tu evaluación ya quedó guardada en el historial.</p>
        <div class="fila-botones"><button class="btn btn-verde" id="pdf" type="button">Descargar reporte PDF</button>
          <a class="btn btn-gris" href="#/historial">Ver historial</a><a class="btn btn-gris" href="#/inicio">Volver al Dashboard</a></div>
        <p class="muted pequeno" style="margin-top:1rem">${esc(r.aviso || '')}</p></div>`;
      $('#pdf').onclick = () => descargarPdf(id);
    } catch (e) { mostrarError(e); if (e instanceof ApiError && e.status === 404) ir('#/inicio'); }
  }

  async function descargarPdf(id) {
    try {
      const blob = await Api.pdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'cardioprev-evaluacion-' + id + '.pdf';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { mostrarError(e); }
  }

  async function vistaHistorial() {
    barra('interna');
    $('#vista').innerHTML = `<div class="contenedor"><div class="tarjeta-plana"><h1 class="centrado">Historial de evaluaciones</h1><div id="cont" class="muted centrado">Cargando…</div>
      <p class="enlace-centro"><a href="#/inicio">Volver al Dashboard</a></p></div></div>`;
    try {
      const h = await Api.historial();
      const cls = { verde: 'fila-verde', amarillo: 'fila-amarilla', rojo: 'fila-roja' };
      $('#cont').outerHTML = h.length ? `<div class="tabla-scroll"><table><thead><tr><th>Fecha</th><th>Puntaje</th><th>Nivel</th><th>Acciones</th></tr></thead><tbody>${
        h.map((x) => `<tr class="${cls[x.color] || ''}"><td>${esc(String(x.fecha).replace('T', ' ').slice(0, 16))}</td><td>${esc(x.puntaje)}</td><td>${esc(x.nivel)}</td>
          <td><a class="btn btn-azul" href="#/resultado/${esc(x.id)}">Ver</a><button type="button" class="btn btn-gris" data-pdf="${esc(x.id)}">PDF</button></td></tr>`).join('')
      }</tbody></table></div>` : '<p class="centrado muted">Aún no tienes evaluaciones. Pulsa «Comenzar Evaluación» en el Dashboard.</p>';
      document.querySelectorAll('[data-pdf]').forEach((bt) => { bt.onclick = () => descargarPdf(bt.dataset.pdf); });
    } catch (e) { mostrarError(e); }
  }

  function vistaFaq() {
    barra(Api.haySesion() ? 'dash' : 'auth');
    const q = [
      ['¿Qué calcula CardioPrev?', 'Una estimación orientativa de tu riesgo cardiovascular (bajo, medio o alto) con 10 factores: edad, IMC, presión, colesterol, alimentación, actividad, tabaquismo, alcohol, diabetes y antecedentes.'],
      ['¿Reemplaza a un médico?', 'No. Es una herramienta educativa; ante cualquier duda consulta a un profesional de la salud.'],
      ['¿Dónde se guardan mis evaluaciones?', 'En el servidor, asociadas solo a tu cuenta. Nadie más puede ver tu historial.'],
      ['¿Por qué se cerró mi sesión?', 'Por seguridad, la sesión se cierra tras ' + MINUTOS_INACTIVIDAD + ' minutos sin actividad.'],
    ];
    $('#vista').innerHTML = `<div class="contenedor"><div class="tarjeta-plana"><h1 class="centrado">Preguntas frecuentes</h1>${
      q.map(([a, b]) => `<details class="detalle"><summary>${esc(a)}</summary><p>${esc(b)}</p></details>`).join('')}
      <p class="enlace-centro"><a href="${Api.haySesion() ? '#/inicio' : '#/login'}">Volver</a></p></div></div>`;
  }

  /* ---------- inactividad ---------- */
  let temporizador = null;
  function reiniciarInactividad() {
    clearTimeout(temporizador);
    if (!Api.haySesion()) return;
    temporizador = setTimeout(() => salir('Tu sesión se cerró por inactividad.'), MINUTOS_INACTIVIDAD * 60 * 1000);
  }
  ['click', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, reiniciarInactividad, { passive: true }));

  /* ---------- enrutador ---------- */
  const PUBLICAS = ['/login', '/registro', '/faq'];
  function enrutar() {
    const [ruta, query = ''] = (location.hash.slice(1) || '/login').split('?');
    const seq = new URLSearchParams(query).get('seq') === '1';
    flash('');
    if (!PUBLICAS.includes(ruta) && !Api.haySesion()) return ir('#/login');
    if ((ruta === '/login' || ruta === '/registro') && Api.haySesion()) return ir('#/inicio');
    const m = ruta.match(/^\/resultado\/(\d+)$/);
    if (m) vistaResultado(m[1]);
    else ({
      '/login': vistaLogin, '/registro': vistaRegistro, '/inicio': vistaInicio, '/faq': vistaFaq,
      '/datos': () => vistaDatos(seq), '/habitos-alimenticios': () => vistaAlimentacion(seq),
      '/actividad': () => vistaActividad(seq), '/consumo': () => vistaConsumo(seq),
      '/presion': () => vistaPresion(seq), '/historial': vistaHistorial,
    }[ruta] || (() => ir(Api.haySesion() ? '#/inicio' : '#/login')))();
    if (flashPendiente) { flash(flashPendiente.msg, flashPendiente.tipo); flashPendiente = null; }
    reiniciarInactividad();
    if (!seq || ruta !== '/inicio') window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', enrutar);
  enrutar();
})();
