/*
  ========================================================
  CONFIGURACIÓN DEL FORMULARIO
  - Aquí puedes editar campos iniciales y bloques de riesgos.
  - La interfaz se construye dinámicamente para escalar fácil.
  ========================================================
*/

const AREAS_DISPONIBLES = [
  "Administración",
  "Mensura",
  "Genética",
  "Geomática",
  "Control Calidad Operacional",
  "Huertos",
  "Laboratorio I+D",
  "Centros Logísticos",
  "Silvicultura",
  "Producción",
  "Recepción y Despacho",
  "Trazabilidad",
  "Prevención",
  "DTI",
  "Otro"
];

const TIPOS_TRABAJO = ["Operativo", "Administrativo", "Terreno", "Mixto", "Otro"];
const GENEROS = ["Mujer", "Hombre", "No binario", "Prefiero no indicar", "Otro"];

const camposInicio = [
  { id: "nombreCompleto", etiqueta: "1. Nombre completo", tipo: "text", obligatorio: true },
  { id: "fechaEvaluacion", etiqueta: "2. Fecha (por defecto hoy)", tipo: "date", obligatorio: true, valorPorDefecto: "HOY" },
  { id: "area", etiqueta: "3. Área", tipo: "select", obligatorio: true, opciones: AREAS_DISPONIBLES },
  { id: "areaOtro", etiqueta: "Especifique Área (Otro)", tipo: "text", obligatorio: true, condicionalDe: "area", visibleSi: "Otro" },
  { id: "proceso", etiqueta: "4. Proceso", tipo: "text", obligatorio: true },
  { id: "actividad", etiqueta: "5. Actividad", tipo: "text", obligatorio: true },
  { id: "cargo", etiqueta: "6. Puesto de trabajo o Cargo", tipo: "text", obligatorio: true },
  { id: "tipoTrabajo", etiqueta: "7. Tipo de trabajo", tipo: "select", obligatorio: true, opciones: TIPOS_TRABAJO },
  { id: "tipoTrabajoOtro", etiqueta: "Especifique Tipo de trabajo (Otro)", tipo: "text", obligatorio: true, condicionalDe: "tipoTrabajo", visibleSi: "Otro" },
  { id: "genero", etiqueta: "8. Estereotipo de género", tipo: "select", obligatorio: true, opciones: GENEROS },
  { id: "generoOtro", etiqueta: "Especifique género (Otro)", tipo: "text", obligatorio: true, condicionalDe: "genero", visibleSi: "Otro" },
  { id: "correoPersonal", etiqueta: "9. Correo personal", tipo: "email", obligatorio: true }
];

const bloquesRiesgo = [
  {
    id: "caida_mismo_nivel",
    titulo: "CAÍDA A MISMO NIVEL",
    descripcion: "Factores asociados a tropiezos, deslizamientos y pérdida de equilibrio en superficies de trabajo.",
    factores: [
      "Falta de atención o distracción al caminar",
      "Prisas o movimientos bruscos que afectan el equilibrio",
      "Falta de capacitación sobre prevención de caídas",
      "No uso de calzado adecuado para la actividad laboral",
      "Superficies húmedas o con obstáculos en zonas de paso"
    ]
  },
  {
    id: "riesgo_electrico",
    titulo: "RIESGO ELÉCTRICO",
    descripcion: "Condiciones inseguras por contacto directo o indirecto con energía eléctrica.",
    factores: [
      "Cables expuestos o con aislamiento deteriorado",
      "Uso de extensiones no autorizadas o sobrecargadas",
      "Tableros eléctricos sin señalización o protección",
      "Intervenciones sin bloqueo y etiquetado (LOTO)",
      "Falta de inspecciones periódicas de equipos eléctricos"
    ]
  },
  {
    id: "riesgo_ergonomico",
    titulo: "RIESGO ERGONÓMICO",
    descripcion: "Factores que pueden generar fatiga, lesiones musculoesqueléticas o sobrecarga física.",
    factores: [
      "Posturas forzadas mantenidas durante la jornada",
      "Movimientos repetitivos de alta frecuencia",
      "Manipulación manual de cargas sin técnica adecuada",
      "Diseño inadecuado del puesto de trabajo",
      "Pausas activas insuficientes o inexistentes"
    ]
  }
];

const opcionesLikert = ["Sí", "No", "N/A"];
const STORAGE_CORREOS_USADOS = "correos_registrados_eval_riesgo";

const estado = {
  pasoActual: 0,
  datosInicio: {},
  respuestas: {}
};

const totalPasosNavegables = 1 + bloquesRiesgo.length + 1;

const ui = {
  logoCorporativo: document.getElementById("logoCorporativo"),
  inputLogo: document.getElementById("inputLogo"),
  textoPaso: document.getElementById("textoPaso"),
  textoPorcentaje: document.getElementById("textoPorcentaje"),
  barraRelleno: document.getElementById("barraRelleno"),
  pantallaInicio: document.getElementById("pantallaInicio"),
  contenedorCamposInicio: document.getElementById("contenedorCamposInicio"),
  pantallaBloque: document.getElementById("pantallaBloque"),
  pantallaResumen: document.getElementById("pantallaResumen"),
  contenidoResumen: document.getElementById("contenidoResumen"),
  pantallaExito: document.getElementById("pantallaExito"),
  btnAnterior: document.getElementById("btnAnterior"),
  btnSiguiente: document.getElementById("btnSiguiente")
};

function obtenerFechaHoy() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizarCorreo(correo) {
  return (correo || "").trim().toLowerCase();
}

function obtenerCorreosUsados() {
  const datos = localStorage.getItem(STORAGE_CORREOS_USADOS);
  if (!datos) return [];
  try {
    return JSON.parse(datos);
  } catch {
    return [];
  }
}

function guardarCorreoUsado(correo) {
  const correoNormalizado = normalizarCorreo(correo);
  const lista = obtenerCorreosUsados();
  if (!lista.includes(correoNormalizado)) {
    lista.push(correoNormalizado);
    localStorage.setItem(STORAGE_CORREOS_USADOS, JSON.stringify(lista));
  }
}

function correoYaRegistrado(correo) {
  const correoNormalizado = normalizarCorreo(correo);
  return obtenerCorreosUsados().includes(correoNormalizado);
}

function manejarCambioLogo(evento) {
  const archivo = evento.target.files?.[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = (e) => {
    ui.logoCorporativo.src = e.target.result;
  };
  lector.readAsDataURL(archivo);
}

function construirPantallaInicio() {
  ui.contenedorCamposInicio.innerHTML = "";

  camposInicio.forEach((campo) => {
    const wrapper = document.createElement("div");
    wrapper.className = campo.condicionalDe ? "campo condicional" : "campo";
    wrapper.dataset.campoId = campo.id;

    const label = document.createElement("label");
    label.setAttribute("for", campo.id);
    label.textContent = campo.etiqueta;

    let input;
    if (campo.tipo === "select") {
      input = document.createElement("select");
      const opcionDefault = document.createElement("option");
      opcionDefault.value = "";
      opcionDefault.textContent = "Seleccione una opción";
      input.appendChild(opcionDefault);

      campo.opciones.forEach((opcion) => {
        const opt = document.createElement("option");
        opt.value = opcion;
        opt.textContent = opcion;
        input.appendChild(opt);
      });
    } else {
      input = document.createElement("input");
      input.type = campo.tipo;
    }

    input.id = campo.id;
    input.name = campo.id;
    input.required = campo.obligatorio;
    input.autocomplete = "off";

    if (campo.valorPorDefecto === "HOY") {
      input.value = obtenerFechaHoy();
      estado.datosInicio[campo.id] = input.value;
    }

    input.addEventListener("input", () => manejarCambioCampo(campo, input.value, wrapper));
    input.addEventListener("change", () => manejarCambioCampo(campo, input.value, wrapper));

    const error = document.createElement("span");
    error.className = "error-texto";
    error.textContent = "Este campo es obligatorio.";

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(error);
    ui.contenedorCamposInicio.appendChild(wrapper);
  });

  actualizarVisibilidadCondicionales();
}

function manejarCambioCampo(campo, valor, wrapper) {
  estado.datosInicio[campo.id] = valor;
  wrapper.classList.remove("error");

  if (campo.id === "correoPersonal") {
    if (correoYaRegistrado(valor)) {
      mostrarErrorCampo("correoPersonal", "Este correo ya fue usado. Intente con otro.");
    } else {
      limpiarErrorCampo("correoPersonal");
    }
  }

  actualizarVisibilidadCondicionales();
}

function actualizarVisibilidadCondicionales() {
  camposInicio.forEach((campo) => {
    if (!campo.condicionalDe) return;

    const wrapper = ui.contenedorCamposInicio.querySelector(`[data-campo-id="${campo.id}"]`);
    const valorPadre = estado.datosInicio[campo.condicionalDe] || "";
    const visible = valorPadre === campo.visibleSi;

    wrapper.classList.toggle("visible", visible);
    if (!visible) {
      const input = wrapper.querySelector("input, select");
      input.value = "";
      estado.datosInicio[campo.id] = "";
      wrapper.classList.remove("error");
    }
  });
}

function mostrarErrorCampo(campoId, mensaje) {
  const wrapper = ui.contenedorCamposInicio.querySelector(`[data-campo-id="${campoId}"]`);
  if (!wrapper) return;
  const error = wrapper.querySelector(".error-texto");
  if (error) error.textContent = mensaje;
  wrapper.classList.add("error");
}

function limpiarErrorCampo(campoId) {
  const wrapper = ui.contenedorCamposInicio.querySelector(`[data-campo-id="${campoId}"]`);
  if (!wrapper) return;
  const error = wrapper.querySelector(".error-texto");
  if (error) error.textContent = "Este campo es obligatorio.";
  wrapper.classList.remove("error");
}

function construirPantallaBloque(indiceBloque) {
  const bloque = bloquesRiesgo[indiceBloque];
  if (!bloque) return;

  if (!estado.respuestas[bloque.id]) {
    estado.respuestas[bloque.id] = {};
  }

  let filasHtml = "";
  bloque.factores.forEach((factor, idx) => {
    const claveFila = `factor_${idx}`;
    const nameGrupo = `${bloque.id}_${claveFila}`;
    const valorSeleccionado = estado.respuestas[bloque.id][claveFila] || "";

    const celdasOpciones = opcionesLikert.map((opcion) => {
      const checked = valorSeleccionado === opcion ? "checked" : "";
      const clase = opcion === "Sí" ? "si" : opcion === "No" ? "no" : "na";
      return `
        <td>
          <label class="radio ${clase}">
            <input type="radio" name="${nameGrupo}" value="${opcion}" ${checked} data-bloque-id="${bloque.id}" data-fila="${claveFila}" />
          </label>
        </td>
      `;
    }).join("");

    filasHtml += `
      <tr>
        <td class="col-factor">${factor}</td>
        ${celdasOpciones}
      </tr>
    `;
  });

  ui.pantallaBloque.innerHTML = `
    <h2 class="subtitulo">${bloque.titulo}</h2>
    ${bloque.descripcion ? `<p class="descripcion">${bloque.descripcion}</p>` : ""}
    <div class="bloque-info">Seleccione una opción por cada factor evaluable: <strong>Sí</strong>, <strong>No</strong> o <strong>N/A</strong>.</div>
    <div class="matriz-wrap">
      <table class="matriz" aria-label="Matriz de evaluación de ${bloque.titulo}">
        <thead>
          <tr>
            <th class="col-factor">Factor evaluable</th>
            <th>Sí</th>
            <th>No</th>
            <th>N/A</th>
          </tr>
        </thead>
        <tbody>${filasHtml}</tbody>
      </table>
    </div>
    <p class="mensaje-validacion" id="mensajeBloque">Debe responder todas las filas antes de continuar.</p>
  `;

  ui.pantallaBloque.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", (evento) => {
      const { bloqueId, fila } = evento.target.dataset;
      if (!estado.respuestas[bloqueId]) estado.respuestas[bloqueId] = {};
      estado.respuestas[bloqueId][fila] = evento.target.value;
      const mensaje = document.getElementById("mensajeBloque");
      mensaje?.classList.remove("visible");
    });
  });
}

function construirResumen() {
  const metaMap = Object.fromEntries(camposInicio.map((c) => [c.id, c.etiqueta]));

  let html = '<div class="resumen-meta"><h4>Datos del trabajador</h4><ul class="lista-resumen">';
  camposInicio.forEach((campo) => {
    if (campo.condicionalDe) {
      const padre = estado.datosInicio[campo.condicionalDe] || "";
      if (padre !== campo.visibleSi) return;
    }
    const valor = estado.datosInicio[campo.id] || "(sin dato)";
    html += `<li><strong>${metaMap[campo.id]}:</strong> ${valor}</li>`;
  });
  html += "</ul></div>";

  bloquesRiesgo.forEach((bloque) => {
    html += `<div class="resumen-bloque"><h4>${bloque.titulo}</h4><ul class="lista-resumen">`;
    bloque.factores.forEach((factor, idx) => {
      const respuesta = estado.respuestas[bloque.id]?.[`factor_${idx}`] || "(sin respuesta)";
      html += `<li>${factor}: <strong>${respuesta}</strong></li>`;
    });
    html += "</ul></div>";
  });

  ui.contenidoResumen.innerHTML = html;
}

function validarInicio() {
  let valido = true;

  camposInicio.forEach((campo) => {
    const wrapper = ui.contenedorCamposInicio.querySelector(`[data-campo-id="${campo.id}"]`);
    const input = wrapper?.querySelector("input, select");
    const visible = !campo.condicionalDe || wrapper.classList.contains("visible");
    const valor = (input?.value || "").trim();

    if (!visible) {
      wrapper?.classList.remove("error");
      return;
    }

    if (campo.obligatorio && !valor) {
      valido = false;
      mostrarErrorCampo(campo.id, "Este campo es obligatorio.");
    } else {
      limpiarErrorCampo(campo.id);
      estado.datosInicio[campo.id] = input.value;
    }
  });

  const correo = estado.datosInicio.correoPersonal || "";
  const formatoCorreoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  if (!formatoCorreoValido) {
    valido = false;
    mostrarErrorCampo("correoPersonal", "Ingrese un correo válido.");
  } else if (correoYaRegistrado(correo)) {
    valido = false;
    mostrarErrorCampo("correoPersonal", "Este correo ya fue usado. Intente con otro.");
  }

  return valido;
}

function validarBloque(indiceBloque) {
  const bloque = bloquesRiesgo[indiceBloque];
  const respuestasBloque = estado.respuestas[bloque.id] || {};
  const totalRespondidas = Object.keys(respuestasBloque).length;
  const completo = totalRespondidas === bloque.factores.length;

  const mensaje = document.getElementById("mensajeBloque");
  if (!completo) mensaje?.classList.add("visible");
  return completo;
}

function mostrarPaso() {
  [ui.pantallaInicio, ui.pantallaBloque, ui.pantallaResumen, ui.pantallaExito].forEach((el) => el.classList.remove("activa"));

  if (estado.pasoActual === 0) {
    ui.pantallaInicio.classList.add("activa");
  } else if (estado.pasoActual >= 1 && estado.pasoActual <= bloquesRiesgo.length) {
    ui.pantallaBloque.classList.add("activa");
    construirPantallaBloque(estado.pasoActual - 1);
  } else if (estado.pasoActual === bloquesRiesgo.length + 1) {
    ui.pantallaResumen.classList.add("activa");
    construirResumen();
  } else {
    ui.pantallaExito.classList.add("activa");
  }

  actualizarCabeceraYBotones();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function actualizarCabeceraYBotones() {
  const pasoVisible = Math.min(estado.pasoActual + 1, totalPasosNavegables);
  const porcentaje = Math.round(((pasoVisible - 1) / (totalPasosNavegables - 1)) * 100);

  ui.textoPaso.textContent = `Paso ${pasoVisible} de ${totalPasosNavegables}`;
  ui.textoPorcentaje.textContent = `${porcentaje}%`;
  ui.barraRelleno.style.width = `${porcentaje}%`;

  ui.btnAnterior.disabled = estado.pasoActual === 0 || estado.pasoActual > bloquesRiesgo.length + 1;

  if (estado.pasoActual === bloquesRiesgo.length + 1) {
    ui.btnSiguiente.textContent = "Enviar";
  } else if (estado.pasoActual > bloquesRiesgo.length + 1) {
    ui.btnSiguiente.style.display = "none";
    ui.btnAnterior.style.display = "none";
  } else {
    ui.btnSiguiente.textContent = "Siguiente";
    ui.btnSiguiente.style.display = "inline-block";
    ui.btnAnterior.style.display = "inline-block";
  }
}

function siguientePaso() {
  if (estado.pasoActual === 0 && !validarInicio()) return;

  if (estado.pasoActual >= 1 && estado.pasoActual <= bloquesRiesgo.length) {
    const indiceBloque = estado.pasoActual - 1;
    if (!validarBloque(indiceBloque)) return;
  }

  if (estado.pasoActual === bloquesRiesgo.length + 1) {
    enviarFormulario();
    return;
  }

  estado.pasoActual += 1;
  mostrarPaso();
}

function pasoAnterior() {
  if (estado.pasoActual > 0 && estado.pasoActual <= bloquesRiesgo.length + 1) {
    estado.pasoActual -= 1;
    mostrarPaso();
  }
}

function enviarFormulario() {
  const payload = {
    metadata: {
      formulario: "Evaluación de Riesgos Laborales",
      fechaEnvio: new Date().toISOString(),
      version: "1.2"
    },
    trabajador: { ...estado.datosInicio },
    evaluacion: bloquesRiesgo.map((bloque) => ({
      bloqueId: bloque.id,
      bloqueTitulo: bloque.titulo,
      respuestas: bloque.factores.map((factor, idx) => ({
        factor,
        respuesta: estado.respuestas[bloque.id]?.[`factor_${idx}`] || null
      }))
    }))
  };

  guardarCorreoUsado(estado.datosInicio.correoPersonal);
  simularCorreoConfirmacion(estado.datosInicio.correoPersonal, estado.datosInicio.nombreCompleto);

  console.log("=== DATOS DEL FORMULARIO LISTOS PARA ENVÍO ===");
  console.log(payload);

  estado.pasoActual = bloquesRiesgo.length + 2;
  mostrarPaso();
}

function simularCorreoConfirmacion(correo, nombre) {
  console.log(`Confirmación simulada: se enviaría un correo a ${correo} indicando que ${nombre} respondió el formulario satisfactoriamente.`);
}

function init() {
  construirPantallaInicio();
  ui.inputLogo.addEventListener("change", manejarCambioLogo);
  ui.btnSiguiente.addEventListener("click", siguientePaso);
  ui.btnAnterior.addEventListener("click", pasoAnterior);
  mostrarPaso();
}

init();
