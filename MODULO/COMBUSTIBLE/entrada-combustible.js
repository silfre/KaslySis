document.addEventListener("DOMContentLoaded", () => {
  inicializarBD();           // 🔥 INICIALIZAR BD CENTRALIZADA
  cargarUnidades();          // 🔥 CARGAR UNIDADES
  configurarFechaHoy();
  crearBloquesDeImagenes();
  vincularEventos();
  cargarRegistros();
  recalcularTodo();
});

/* =========================
   CONFIGURACIÓN INICIAL
========================= */
function configurarFechaHoy() {
  const inputFecha = document.getElementById("fechaRegistro");
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  inputFecha.value = `${yyyy}-${mm}-${dd}`;
}

function vincularEventos() {
  const idsCalculo = [
    "cantidadComprada",
    "precioUnitario",
    "galonesAntes",
    "galonesDespues"
  ];

  idsCalculo.forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("input", recalcularTodo);
  });

  document.getElementById("btnGuardar").addEventListener("click", guardarRegistro);
  document.getElementById("btnLimpiar").addEventListener("click", limpiarFormulario);

  document.getElementById("closeModal").addEventListener("click", cerrarModalImagen);
  document.getElementById("imageModal").addEventListener("click", (e) => {
    if (e.target.id === "imageModal") cerrarModalImagen();
  });
}

/* =========================
   CARGAR UNIDADES 🔥
========================= */
function cargarUnidades() {
  const select = document.getElementById("selectUnidad");
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Selecciona Unidad --</option>';
  
  const unidades = sistemaBD.unidades || [];
  unidades.forEach(u => {
    const option = document.createElement("option");
    option.value = u.id;
    option.textContent = `${u.ficha} - ${u.marca} ${u.modelo} (${u.estado})`;
    select.appendChild(option);
  });
}

/* =========================
   CREAR BLOQUES DE IMÁGENES
========================= */
function crearBloquesDeImagenes() {
  generarUploadCards("camionLlenoFotos", [
    "Camión lleno 1",
    "Camión lleno 2",
    "Camión lleno 3",
    "Camión lleno 4",
    "Camión lleno 5"
  ]);

  generarUploadCards("camionLlenoBoquillas", [
    "Boquilla camión 1",
    "Boquilla camión 2"
  ]);

  generarUploadCards("camionLlenoVaras", [
    "Vara boquilla 1",
    "Vara boquilla 2"
  ]);

  generarUploadCards("camionLlenoExtra", [
    "Foto extra / moca"
  ]);

  generarUploadCards("tanqueAntesManguera", [
    "Manguera abajo"
  ]);

  generarUploadCards("tanqueAntesVara", [
    "Vara antes 1",
    "Vara antes 2"
  ]);

  generarUploadCards("tanqueAntesEvidencia", [
    "Captura evidencia"
  ]);

  generarUploadCards("camionVacioBoquillas", [
    "Boquilla vacía 1",
    "Boquilla vacía 2"
  ]);

  generarUploadCards("tanqueDespuesManguera", [
    "Manguera abajo"
  ]);

  generarUploadCards("tanqueDespuesVara", [
    "Vara después 1",
    "Vara después 2"
  ]);

  generarUploadCards("tanqueDespuesEvidencia", [
    "Captura evidencia"
  ]);
}

function generarUploadCards(containerId, labels) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  labels.forEach((label, index) => {
    const cardId = `${containerId}_card_${index}`;
    const inputId = `${containerId}_input_${index}`;
    const imgId = `${containerId}_img_${index}`;

    const card = document.createElement("div");
    card.className = "upload-card";

    card.innerHTML = `
      <div class="upload-title">${label}</div>

      <label class="upload-box" for="${inputId}">
        <input type="file" id="${inputId}" accept="image/*" />
        <span id="${imgId}_placeholder">📷<br>Subir imagen</span>
        <img id="${imgId}" class="upload-preview" style="display:none;" alt="${label}">
      </label>

      <div class="upload-actions">
        <button type="button" class="small-btn btn-upload" onclick="document.getElementById('${inputId}').click()">Subir</button>
        <button type="button" class="small-btn btn-delete" onclick="eliminarImagen('${inputId}', '${imgId}', '${imgId}_placeholder')">Eliminar</button>
      </div>
    `;

    container.appendChild(card);

    const input = card.querySelector(`#${inputId}`);
    input.addEventListener("change", (e) => previewImagen(e, imgId, `${imgId}_placeholder`, label));
  });
}

function previewImagen(event, imgId, placeholderId, label) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = document.getElementById(imgId);
    const placeholder = document.getElementById(placeholderId);

    img.src = e.target.result;
    img.style.display = "block";
    placeholder.style.display = "none";

    img.onclick = () => abrirModalImagen(e.target.result, label);
  };
  reader.readAsDataURL(file);
}

function eliminarImagen(inputId, imgId, placeholderId) {
  const input = document.getElementById(inputId);
  const img = document.getElementById(imgId);
  const placeholder = document.getElementById(placeholderId);

  input.value = "";
  img.src = "";
  img.style.display = "none";
  placeholder.style.display = "block";
}

function abrirModalImagen(src, caption) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const modalCaption = document.getElementById("modalCaption");

  modalImage.src = src;
  modalCaption.textContent = caption;
  modal.classList.add("show");
}

function cerrarModalImagen() {
  document.getElementById("imageModal").classList.remove("show");
}

/* =========================
   CÁLCULOS
========================= */
function recalcularTodo() {
  const cantidadComprada = obtenerNumero("cantidadComprada");
  const precioUnitario = obtenerNumero("precioUnitario");
  const galonesAntes = obtenerNumero("galonesAntes");
  const galonesDespues = obtenerNumero("galonesDespues");

  const montoComprado = cantidadComprada * precioUnitario;
  const glRecibidos = galonesDespues - galonesAntes;
  const diferencia = cantidadComprada - glRecibidos;

  document.getElementById("montoComprado").value = formatearMoneda(montoComprado);

  document.getElementById("resGalAntes").textContent = formatearGL(galonesAntes);
  document.getElementById("resGalDespues").textContent = formatearGL(galonesDespues);
  document.getElementById("resGlRecibidos").textContent = formatearGL(glRecibidos);
  document.getElementById("resDiferencia").textContent = formatearGL(diferencia);
  document.getElementById("resEstado").textContent = obtenerEstado(diferencia);

  document.getElementById("txtGalAntes").textContent = formatearGL(galonesAntes);
  document.getElementById("txtGalDespues").textContent = formatearGL(galonesDespues);
  document.getElementById("txtGlRecibidos").textContent = formatearGL(glRecibidos);
  document.getElementById("txtComprados").textContent = formatearGL(cantidadComprada);
  document.getElementById("txtDiferenciaFinal").textContent = formatearGL(diferencia);
}

function obtenerEstado(diferencia) {
  const absDif = Math.abs(diferencia);

  if (absDif === 0) return "CUADRA EXACTO";
  if (absDif <= 0.50) return "CUADRA";
  if (diferencia > 0.50) return "FALTAN GL";
  return "SOBRAN GL";
}

function obtenerNumero(id) {
  const valor = parseFloat(document.getElementById(id).value);
  return isNaN(valor) ? 0 : valor;
}

function formatearGL(valor) {
  return `${valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} GL`;
}

function formatearMoneda(valor) {
  return `RD$ ${valor.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/* =========================
   GUARDAR REGISTRO
========================= */
function guardarRegistro() {
  const unidad = document.getElementById("selectUnidad").value.trim();
  const fecha = document.getElementById("fechaRegistro").value.trim();
  const suplidor = document.getElementById("suplidor").value.trim();
  const factura = document.getElementById("factura").value.trim();
  const combustibleTipo = document.getElementById("combustibleTipo").value;
  const cantidadComprada = obtenerNumero("cantidadComprada");
  const precioUnitario = obtenerNumero("precioUnitario");
  const kmActual = obtenerNumero("kmActual");
  const observacionGeneral = document.getElementById("observacionGeneral").value.trim();

  // VALIDACIONES
  if (!unidad) {
    alert("Debes seleccionar una unidad.");
    return;
  }

  if (!fecha) {
    alert("Debes seleccionar la fecha.");
    return;
  }

  if (!suplidor) {
    alert("Debes escribir el suplidor.");
    return;
  }

  if (cantidadComprada <= 0) {
    alert("Debes indicar la cantidad comprada.");
    return;
  }

  if (precioUnitario <= 0) {
    alert("Debes indicar el precio unitario.");
    return;
  }

  const montoComprado = cantidadComprada * precioUnitario;
  const medidaAntes = document.getElementById("medidaAntes").value.trim();
  const galonesAntes = obtenerNumero("galonesAntes");
  const notaAntes = document.getElementById("notaAntes").value.trim();

  const medidaDespues = document.getElementById("medidaDespues").value.trim();
  const galonesDespues = obtenerNumero("galonesDespues");
  const notaDespues = document.getElementById("notaDespues").value.trim();

  const glRecibidos = galonesDespues - galonesAntes;
  const diferencia = cantidadComprada - glRecibidos;
  const estado = obtenerEstado(diferencia);

  // 🔥 REGISTRAR EN BD CENTRALIZADA USANDO registrarMantenimiento
  registrarMantenimiento({
    tipo: 'combustible',
    unidad: unidad,
    km: kmActual,  // 🔥 AUTOMÁTICAMENTE ACTUALIZA KM SI ES MÁS ALTO
    fecha: fecha,
    hora: new Date().toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5),
    descripcion: `Carga de ${cantidadComprada} GL de ${combustibleTipo} - Suplidor: ${suplidor}`,
    monto: montoComprado,
    // Campos adicionales específicos de combustible
    suplidor: suplidor,
    factura: factura,
    combustibleTipo: combustibleTipo,
    cantidadComprada: cantidadComprada,
    precioUnitario: precioUnitario,
    medidaAntes: medidaAntes,
    galonesAntes: galonesAntes,
    notaAntes: notaAntes,
    medidaDespues: medidaDespues,
    galonesDespues: galonesDespues,
    notaDespues: notaDespues,
    glRecibidos: glRecibidos,
    diferencia: diferencia,
    estado: estado,
    observacionGeneral: observacionGeneral
  });

  renderizarRegistros();
  limpiarFormulario();
  alert("✓ Registro guardado correctamente.\n✓ KM de la unidad sincronizado.");
}

/* =========================
   LISTADO DE REGISTROS
========================= */
function obtenerRegistros() {
  // 🔥 USA LA BD CENTRALIZADA EN LUGAR DE localStorage
  return sistemaBD.combustible || [];
}

function cargarRegistros() {
  renderizarRegistros();
}

function renderizarRegistros() {
  const registros = obtenerRegistros();
  const tbody = document.getElementById("tbodyRegistros");

  if (registros.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" class="empty-row">No hay registros guardados.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = registros.map(reg => `
    <tr>
      <td>${reg.unidad || '-'}</td>
      <td>${reg.fecha}</td>
      <td>${escaparHTML(reg.suplidor)}</td>
      <td>${escaparHTML(reg.factura || "-")}</td>
      <td>${formatearGL(reg.cantidadComprada)}</td>
      <td>${formatearMoneda(reg.precioUnitario)}</td>
      <td>${formatearMoneda(reg.monto)}</td>
      <td>${formatearGL(reg.glRecibidos)}</td>
      <td>${formatearGL(reg.diferencia)}</td>
      <td>${reg.estado}</td>
      <td>
        <button class="btn-table-delete" onclick="eliminarRegistro('${reg.id}')">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

function eliminarRegistro(id) {
  if (!confirm("¿Seguro que deseas eliminar este registro?")) return;

  let registros = obtenerRegistros();
  registros = registros.filter(r => r.id !== id);
  localStorage.setItem("entradaCombustibleRegistros", JSON.stringify(registros));
  renderizarRegistros();
}

/* =========================
   LIMPIAR
========================= */
function limpiarFormulario() {
  if (!confirm("¿Quieres limpiar el formulario actual?")) return;

  document.getElementById("suplidor").value = "";
  document.getElementById("factura").value = "";
  document.getElementById("combustibleTipo").value = "Gasoil";
  document.getElementById("cantidadComprada").value = "";
  document.getElementById("precioUnitario").value = "";
  document.getElementById("montoComprado").value = "";
  document.getElementById("observacionGeneral").value = "";

  document.getElementById("medidaAntes").value = "";
  document.getElementById("galonesAntes").value = "";
  document.getElementById("notaAntes").value = "";

  document.getElementById("medidaDespues").value = "";
  document.getElementById("galonesDespues").value = "";
  document.getElementById("notaDespues").value = "";

  const inputsFile = document.querySelectorAll('input[type="file"]');
  inputsFile.forEach(input => input.value = "");

  const previews = document.querySelectorAll(".upload-preview");
  previews.forEach(img => {
    img.src = "";
    img.style.display = "none";
  });

  const placeholders = document.querySelectorAll('[id$="_placeholder"]');
  placeholders.forEach(ph => ph.style.display = "block");

  recalcularTodo();
}

/* =========================
   UTILIDAD
========================= */
function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}