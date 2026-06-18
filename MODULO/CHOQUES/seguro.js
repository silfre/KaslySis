/* ======================================================
   MÓDULO SEGURO
====================================================== */

let idSeguroEditando = null;
let idSeguroSeguimiento = null;

let galeriasSeguro = {};
let fotosVisorSeguro = [];
let indiceFotoSeguro = 0;

document.addEventListener("DOMContentLoaded", () => {
    inicializarBD();

    if (!sistemaBD.seguros) {
        sistemaBD.seguros = [];
        guardarBD();
    }

    if (!sistemaBD.choques) {
        sistemaBD.choques = [];
        guardarBD();
    }

    cargarSelectsSeguro();
    establecerFechaSeguro();
    renderizarSeguros();
});

/* ======================================================
   INICIO Y SELECTS
====================================================== */

function establecerFechaSeguro() {
    const hoy = obtenerFechaHoyISO();

    const fechaApertura = document.getElementById("fechaAperturaSeguro");
    const fechaSeguimiento = document.getElementById("fechaSeguimiento");

    if (fechaApertura) fechaApertura.value = hoy;
    if (fechaSeguimiento) fechaSeguimiento.value = hoy;
}

function cargarSelectsSeguro() {
    cargarChoquesRelacionados();
    cargarUnidadesSeguro();
    cargarChoferesSeguro();
}

function cargarChoquesRelacionados() {
    const select = document.getElementById("choqueRelacionado");

    if (!select) return;

    select.innerHTML = '<option value="">-- Sin choque relacionado / manual --</option>';

    sistemaBD.choques.forEach(c => {
        const unidad = obtenerUnidad(c.unidad);
        const chofer = obtenerEmpleado(c.chofer);

        const opt = document.createElement("option");
        opt.value = c.id;
        opt.text = `${formatearFecha(c.fecha)} | ${unidad?.ficha || c.unidad || "-"} | ${obtenerNombreChofer(chofer)} | ${c.tipo || c.severidad || ""}`;

        select.appendChild(opt);
    });
}

function cargarUnidadesSeguro() {
    const select = document.getElementById("unidadSeguro");

    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccionar --</option>';

    obtenerUnidades().forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.text = `${u.ficha || u.id} - ${u.marca || u.categoria || "SIN MARCA"}`;
        select.appendChild(opt);
    });
}

function cargarChoferesSeguro() {
    const select = document.getElementById("choferSeguro");

    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccionar --</option>';

    obtenerEmpleados().forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.id;
        opt.text = obtenerNombreChofer(e);
        select.appendChild(opt);
    });
}

function cargarDatosChoqueSeleccionado() {
    const idChoque = document.getElementById("choqueRelacionado").value;

    if (!idChoque) return;

    const choque = sistemaBD.choques.find(c => String(c.id) === String(idChoque));

    if (!choque) return;

    document.getElementById("fechaChoqueSeguro").value = choque.fecha || "";
    document.getElementById("unidadSeguro").value = choque.unidad || "";
    document.getElementById("choferSeguro").value = choque.chofer || "";

    const comentario = document.getElementById("comentarioSeguro");

    if (comentario && comentario.value.trim() === "") {
        comentario.value = `Reporte relacionado al choque: ${choque.tipo || "-"} | Severidad: ${choque.severidad || "-"}`;
    }
}

/* ======================================================
   MODAL NUEVO / EDITAR
====================================================== */

function abrirModalSeguro() {
    idSeguroEditando = null;

    const form = document.getElementById("formSeguro");
    const titulo = document.getElementById("tituloModalSeguro");
    const btn = document.getElementById("btnGuardarSeguro");

    if (form) form.reset();

    document.getElementById("idReporteSeguro").value = generarIdReporteSeguro();
    document.getElementById("previewFotosSeguro").innerHTML = "";

    if (titulo) titulo.textContent = "Nuevo Reporte de Seguro";
    if (btn) btn.textContent = "💾 Guardar";

    establecerFechaSeguro();

    document.getElementById("modalSeguro").classList.add("activo");

    const cuerpo = document.querySelector("#modalSeguro .modal-cuerpo-form");
    if (cuerpo) cuerpo.scrollTop = 0;
}

function cerrarModalSeguro() {
    idSeguroEditando = null;

    document.getElementById("modalSeguro").classList.remove("activo");

    const form = document.getElementById("formSeguro");
    if (form) form.reset();

    document.getElementById("previewFotosSeguro").innerHTML = "";
    document.getElementById("fotosSeguro").value = "";
}

async function guardarReporteSeguro(e) {
    e.preventDefault();

    const archivos = Array.from(document.getElementById("fotosSeguro").files || []);
    let fotosGuardadas = [];

    if (archivos.length > 0) {
        fotosGuardadas = await convertirFotosABase64(archivos);
    } else if (idSeguroEditando) {
        const actual = sistemaBD.seguros.find(r => r.id === idSeguroEditando);
        fotosGuardadas = actual?.fotos || [];
    }

    const reporte = {
        id: idSeguroEditando || document.getElementById("idReporteSeguro").value || generarIdReporteSeguro(),
        idChoque: document.getElementById("choqueRelacionado").value || "",
        numeroReporte: document.getElementById("numeroReporteSeguro").value.trim(),
        fechaApertura: document.getElementById("fechaAperturaSeguro").value,
        fechaChoque: document.getElementById("fechaChoqueSeguro").value,
        unidad: document.getElementById("unidadSeguro").value,
        chofer: document.getElementById("choferSeguro").value,
        aseguradora: document.getElementById("aseguradoraSeguro").value.trim(),
        numeroPoliza: document.getElementById("numeroPolizaSeguro").value.trim(),
        tipoSeguro: document.getElementById("tipoSeguro").value,
        valeTribunal: document.getElementById("valeTribunalSeguro").value,
        estado: document.getElementById("estadoSeguro").value,
        montoReclamado: Number(document.getElementById("montoReclamadoSeguro").value) || 0,
        montoAprobado: Number(document.getElementById("montoAprobadoSeguro").value) || 0,
        montoPagado: Number(document.getElementById("montoPagadoSeguro").value) || 0,
        deducible: Number(document.getElementById("deducibleSeguro").value) || 0,
        responsable: document.getElementById("responsableSeguro").value.trim(),
        comentario: document.getElementById("comentarioSeguro").value.trim(),
        fotos: fotosGuardadas,
        seguimientos: idSeguroEditando ? obtenerSeguimientosExistentes(idSeguroEditando) : [
            {
                id: generarIDSeguro(),
                fecha: document.getElementById("fechaAperturaSeguro").value,
                estado: document.getElementById("estadoSeguro").value,
                responsable: document.getElementById("responsableSeguro").value.trim(),
                comentario: "Reporte creado.",
                fotos: []
            }
        ],
        fechaCreacion: idSeguroEditando ? obtenerFechaCreacion(idSeguroEditando) : obtenerFechaHoyISO(),
        fechaActualizacion: obtenerFechaHoyISO()
    };

    if (idSeguroEditando) {
        const index = sistemaBD.seguros.findIndex(r => r.id === idSeguroEditando);

        if (index !== -1) {
            sistemaBD.seguros[index] = reporte;
        }

        alert("✓ Reporte de seguro actualizado.");
    } else {
        const existe = sistemaBD.seguros.some(r => String(r.numeroReporte).toUpperCase() === String(reporte.numeroReporte).toUpperCase());

        if (existe) {
            alert("Ya existe un reporte con ese número.");
            return;
        }

        sistemaBD.seguros.unshift(reporte);
        alert("✓ Reporte de seguro registrado.");
    }

    guardarBD();
    cerrarModalSeguro();
    renderizarSeguros();
}

function obtenerSeguimientosExistentes(id) {
    const reporte = sistemaBD.seguros.find(r => r.id === id);
    return reporte?.seguimientos || [];
}

function obtenerFechaCreacion(id) {
    const reporte = sistemaBD.seguros.find(r => r.id === id);
    return reporte?.fechaCreacion || obtenerFechaHoyISO();
}

/* ======================================================
   RENDER TABLA
====================================================== */

function renderizarSeguros() {
    const tbody = document.getElementById("tablaSeguroBody");
    const filtro = document.getElementById("buscadorSeguro").value.toLowerCase().trim();

    if (!tbody) return;

    let datos = sistemaBD.seguros.filter(r => {
        const unidad = obtenerUnidad(r.unidad);
        const chofer = obtenerEmpleado(r.chofer);

        const texto = `
            ${r.id}
            ${r.numeroReporte}
            ${formatearFecha(r.fechaApertura)}
            ${unidad?.ficha || r.unidad || ""}
            ${obtenerNombreChofer(chofer)}
            ${r.aseguradora}
            ${r.tipoSeguro}
            ${r.estado}
            ${r.responsable}
        `.toLowerCase();

        return texto.includes(filtro);
    });

    datos.sort((a, b) => new Date(b.fechaApertura) - new Date(a.fechaApertura));

    if (datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align:center; padding:20px;">
                    No hay reportes de seguro registrados.
                </td>
            </tr>
        `;

        actualizarCardsSeguro([]);
        return;
    }

    tbody.innerHTML = datos.map(r => {
        const unidad = obtenerUnidad(r.unidad);
        const chofer = obtenerEmpleado(r.chofer);
        const ultima = obtenerUltimoSeguimiento(r);

        return `
            <tr>
                <td><strong>${r.id}</strong></td>
                <td>${r.numeroReporte || "-"}</td>
                <td>${formatearFecha(r.fechaApertura)}</td>
                <td><strong>${unidad?.ficha || r.unidad || "-"}</strong></td>
                <td>${obtenerNombreChofer(chofer)}</td>
                <td>${r.aseguradora || "-"}</td>
                <td>${r.tipoSeguro || "-"}</td>
                <td>${badgeEstado(r.estado)}</td>
                <td>${formatearMoneda(r.montoReclamado)}</td>
                <td>${ultima ? `${formatearFecha(ultima.fecha)} - ${ultima.estado}` : "-"}</td>
                <td>
                    <button class="btn-tabla btn-ver" onclick="verDetalleSeguro('${r.id}')">Ver</button>
                    <button class="btn-tabla btn-seguimiento" onclick="abrirSeguimientoSeguro('${r.id}')">Seguimiento</button>
                    <button class="btn-tabla btn-editar" onclick="editarReporteSeguro('${r.id}')">Editar</button>
                    <button class="btn-tabla btn-borrar" onclick="borrarReporteSeguro('${r.id}')">Borrar</button>
                </td>
            </tr>
        `;
    }).join("");

    actualizarCardsSeguro(datos);
}

function actualizarCardsSeguro(datos) {
    const total = sistemaBD.seguros.length;
    const abiertos = sistemaBD.seguros.filter(r => !["CERRADO", "PAGADO", "NO PROCEDE"].includes(r.estado)).length;
    const tribunal = sistemaBD.seguros.filter(r => r.estado === "EN TRIBUNAL" || r.valeTribunal === "SI").length;
    const monto = sistemaBD.seguros.reduce((sum, r) => sum + Number(r.montoReclamado || 0), 0);

    document.getElementById("cardTotalSeguro").textContent = total;
    document.getElementById("cardAbiertos").textContent = abiertos;
    document.getElementById("cardTribunal").textContent = tribunal;
    document.getElementById("cardMontoReclamado").textContent = formatearMoneda(monto);
}

/* ======================================================
   VER DETALLE
====================================================== */

function verDetalleSeguro(id) {
    const r = sistemaBD.seguros.find(item => item.id === id);

    if (!r) {
        alert("No se encontró el reporte.");
        return;
    }

    const unidad = obtenerUnidad(r.unidad);
    const chofer = obtenerEmpleado(r.chofer);

    galeriasSeguro = {};
    galeriasSeguro[`reporte-${r.id}`] = r.fotos || [];

    const contenido = document.getElementById("contenidoDetalleSeguro");

    contenido.innerHTML = `
        <div class="detalle-wrapper">

            <div class="detalle-resumen">
                <div class="detalle-card">
                    <span>ID Reporte</span>
                    <strong>${r.id}</strong>
                </div>

                <div class="detalle-card">
                    <span>No. Reporte Seguro</span>
                    <strong>${r.numeroReporte || "-"}</strong>
                </div>

                <div class="detalle-card">
                    <span>Estado</span>
                    <strong>${badgeEstado(r.estado)}</strong>
                </div>

                <div class="detalle-card">
                    <span>Ficha</span>
                    <strong>${unidad?.ficha || r.unidad || "-"}</strong>
                </div>

                <div class="detalle-card">
                    <span>Chofer</span>
                    <strong>${obtenerNombreChofer(chofer)}</strong>
                </div>

                <div class="detalle-card">
                    <span>Aseguradora</span>
                    <strong>${r.aseguradora || "-"}</strong>
                </div>

                <div class="detalle-card">
                    <span>Tipo seguro</span>
                    <strong>${r.tipoSeguro || "-"}</strong>
                </div>

                <div class="detalle-card">
                    <span>Tribunal</span>
                    <strong>${r.valeTribunal || "-"}</strong>
                </div>
            </div>

            <div class="detalle-resumen">
                <div class="detalle-card">
                    <span>Monto reclamado</span>
                    <strong>${formatearMoneda(r.montoReclamado)}</strong>
                </div>

                <div class="detalle-card">
                    <span>Monto aprobado</span>
                    <strong>${formatearMoneda(r.montoAprobado)}</strong>
                </div>

                <div class="detalle-card">
                    <span>Monto pagado</span>
                    <strong>${formatearMoneda(r.montoPagado)}</strong>
                </div>

                <div class="detalle-card">
                    <span>Deducible</span>
                    <strong>${formatearMoneda(r.deducible)}</strong>
                </div>
            </div>

            <div class="detalle-bloque">
                <h3>Comentario inicial</h3>
                <p>${r.comentario || "Sin comentario."}</p>
            </div>

            <div class="detalle-bloque">
                <h3>Fotos / evidencias del reporte</h3>
                ${generarGridFotos(`reporte-${r.id}`, r.fotos || [])}
            </div>

            <div class="detalle-bloque">
                <h3>Historial de seguimiento</h3>
                <div class="timeline">
                    ${generarTimelineSeguro(r)}
                </div>
            </div>

            <div class="botones">
                <button class="btn btn-morado" onclick="cerrarDetalleSeguro(); abrirSeguimientoSeguro('${r.id}')">
                    Actualizar seguimiento
                </button>
            </div>

        </div>
    `;

    document.getElementById("modalDetalleSeguro").classList.add("activo");
}

function cerrarDetalleSeguro() {
    document.getElementById("modalDetalleSeguro").classList.remove("activo");
}

function generarTimelineSeguro(reporte) {
    const lista = reporte.seguimientos || [];

    if (lista.length === 0) {
        return `<p class="sin-fotos">No hay seguimientos registrados.</p>`;
    }

    return lista.slice().reverse().map(s => {
        const key = `seg-${s.id}`;

        galeriasSeguro[key] = s.fotos || [];

        return `
            <div class="timeline-item">
                <h4>${badgeEstado(s.estado)}</h4>
                <div class="timeline-meta">
                    Fecha: ${formatearFecha(s.fecha)} | Responsable: ${s.responsable || "-"}
                </div>
                <p>${s.comentario || ""}</p>
                ${generarGridFotos(key, s.fotos || [])}
            </div>
        `;
    }).join("");
}

function generarGridFotos(key, fotos) {
    if (!fotos || fotos.length === 0) {
        return `<span class="sin-fotos">Sin fotos.</span>`;
    }

    return `
        <div class="grid-fotos">
            ${fotos.map((foto, index) => `
                <img 
                    src="${foto.data}" 
                    alt="${foto.nombre || "Foto"}"
                    onclick="abrirFotoSeguro('${key}', ${index})"
                >
            `).join("")}
        </div>
    `;
}

/* ======================================================
   EDITAR / BORRAR
====================================================== */

function editarReporteSeguro(id) {
    const r = sistemaBD.seguros.find(item => item.id === id);

    if (!r) {
        alert("No se encontró el reporte.");
        return;
    }

    idSeguroEditando = id;

    document.getElementById("tituloModalSeguro").textContent = "Editar Reporte de Seguro";
    document.getElementById("btnGuardarSeguro").textContent = "Actualizar";

    document.getElementById("idReporteSeguro").value = r.id;
    document.getElementById("choqueRelacionado").value = r.idChoque || "";
    document.getElementById("numeroReporteSeguro").value = r.numeroReporte || "";
    document.getElementById("fechaAperturaSeguro").value = r.fechaApertura || "";
    document.getElementById("fechaChoqueSeguro").value = r.fechaChoque || "";
    document.getElementById("unidadSeguro").value = r.unidad || "";
    document.getElementById("choferSeguro").value = r.chofer || "";
    document.getElementById("aseguradoraSeguro").value = r.aseguradora || "";
    document.getElementById("numeroPolizaSeguro").value = r.numeroPoliza || "";
    document.getElementById("tipoSeguro").value = r.tipoSeguro || "";
    document.getElementById("valeTribunalSeguro").value = r.valeTribunal || "NO";
    document.getElementById("estadoSeguro").value = r.estado || "ABIERTO";
    document.getElementById("montoReclamadoSeguro").value = r.montoReclamado || "";
    document.getElementById("montoAprobadoSeguro").value = r.montoAprobado || "";
    document.getElementById("montoPagadoSeguro").value = r.montoPagado || "";
    document.getElementById("deducibleSeguro").value = r.deducible || "";
    document.getElementById("responsableSeguro").value = r.responsable || "";
    document.getElementById("comentarioSeguro").value = r.comentario || "";

    mostrarPreviewFotosGuardadas("previewFotosSeguro", r.fotos || []);

    document.getElementById("modalSeguro").classList.add("activo");
}

function borrarReporteSeguro(id) {
    const ok = confirm("¿Seguro que deseas borrar este reporte de seguro?");

    if (!ok) return;

    sistemaBD.seguros = sistemaBD.seguros.filter(r => r.id !== id);

    guardarBD();
    renderizarSeguros();

    alert("Reporte borrado correctamente.");
}

/* ======================================================
   SEGUIMIENTO
====================================================== */

function abrirSeguimientoSeguro(id) {
    const r = sistemaBD.seguros.find(item => item.id === id);

    if (!r) {
        alert("No se encontró el reporte.");
        return;
    }

    idSeguroSeguimiento = id;

    const form = document.getElementById("formSeguimientoSeguro");

    if (form) form.reset();

    document.getElementById("fechaSeguimiento").value = obtenerFechaHoyISO();
    document.getElementById("estadoSeguimiento").value = r.estado || "EN PROCESO";
    document.getElementById("responsableSeguimiento").value = r.responsable || "";
    document.getElementById("previewFotosSeguimiento").innerHTML = "";
    document.getElementById("fotosSeguimiento").value = "";

    document.getElementById("modalSeguimientoSeguro").classList.add("activo");
}

function cerrarModalSeguimiento() {
    idSeguroSeguimiento = null;

    document.getElementById("modalSeguimientoSeguro").classList.remove("activo");

    const form = document.getElementById("formSeguimientoSeguro");
    if (form) form.reset();

    document.getElementById("previewFotosSeguimiento").innerHTML = "";
}

async function guardarSeguimientoSeguro(e) {
    e.preventDefault();

    const reporte = sistemaBD.seguros.find(r => r.id === idSeguroSeguimiento);

    if (!reporte) {
        alert("No se encontró el reporte.");
        return;
    }

    const archivos = Array.from(document.getElementById("fotosSeguimiento").files || []);
    const fotos = await convertirFotosABase64(archivos);

    const seguimiento = {
        id: generarIDSeguro(),
        fecha: document.getElementById("fechaSeguimiento").value,
        estado: document.getElementById("estadoSeguimiento").value,
        responsable: document.getElementById("responsableSeguimiento").value.trim(),
        comentario: document.getElementById("comentarioSeguimiento").value.trim(),
        fotos: fotos
    };

    if (!reporte.seguimientos) {
        reporte.seguimientos = [];
    }

    reporte.seguimientos.push(seguimiento);
    reporte.estado = seguimiento.estado;
    reporte.responsable = seguimiento.responsable || reporte.responsable;
    reporte.fechaActualizacion = seguimiento.fecha;

    guardarBD();
    cerrarModalSeguimiento();
    renderizarSeguros();

    alert("✓ Seguimiento actualizado.");
}

/* ======================================================
   FOTOS
====================================================== */

function previewFotosSeguro() {
    const archivos = Array.from(document.getElementById("fotosSeguro").files || []);
    pintarPreviewFotos("previewFotosSeguro", archivos);
}

function previewFotosSeguimiento() {
    const archivos = Array.from(document.getElementById("fotosSeguimiento").files || []);
    pintarPreviewFotos("previewFotosSeguimiento", archivos);
}

function pintarPreviewFotos(idContenedor, archivos) {
    const contenedor = document.getElementById(idContenedor);

    contenedor.innerHTML = "";

    archivos.forEach(archivo => {
        const lector = new FileReader();

        lector.onload = () => {
            const img = document.createElement("img");
            img.src = lector.result;
            contenedor.appendChild(img);
        };

        lector.readAsDataURL(archivo);
    });
}

function mostrarPreviewFotosGuardadas(idContenedor, fotos) {
    const contenedor = document.getElementById(idContenedor);

    if (!contenedor) return;

    contenedor.innerHTML = "";

    fotos.forEach(foto => {
        const img = document.createElement("img");
        img.src = foto.data;
        contenedor.appendChild(img);
    });
}

function convertirFotosABase64(archivos) {
    const promesas = archivos.map(archivo => {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();

            lector.onload = () => {
                resolve({
                    nombre: archivo.name,
                    tipo: archivo.type,
                    data: lector.result
                });
            };

            lector.onerror = () => reject("Error leyendo la foto.");
            lector.readAsDataURL(archivo);
        });
    });

    return Promise.all(promesas);
}

function abrirFotoSeguro(key, index) {
    fotosVisorSeguro = galeriasSeguro[key] || [];
    indiceFotoSeguro = index || 0;

    if (fotosVisorSeguro.length === 0) return;

    actualizarFotoSeguro();

    document.getElementById("visorFotoSeguro").classList.add("activo");
}

function cerrarFotoSeguro() {
    document.getElementById("visorFotoSeguro").classList.remove("activo");
}

function cambiarFotoSeguro(direccion) {
    if (!fotosVisorSeguro || fotosVisorSeguro.length === 0) return;

    indiceFotoSeguro += direccion;

    if (indiceFotoSeguro < 0) {
        indiceFotoSeguro = fotosVisorSeguro.length - 1;
    }

    if (indiceFotoSeguro >= fotosVisorSeguro.length) {
        indiceFotoSeguro = 0;
    }

    actualizarFotoSeguro();
}

function actualizarFotoSeguro() {
    const foto = fotosVisorSeguro[indiceFotoSeguro];

    if (!foto) return;

    const img = document.getElementById("imagenFotoSeguro");
    const contador = document.getElementById("contadorFotoSeguro");
    const flechaIzq = document.querySelector("#visorFotoSeguro .btn-flecha-foto.izquierda");
    const flechaDer = document.querySelector("#visorFotoSeguro .btn-flecha-foto.derecha");

    img.src = foto.data;
    img.alt = foto.nombre || "Foto seguro";

    contador.textContent = `${indiceFotoSeguro + 1} / ${fotosVisorSeguro.length}`;

    if (fotosVisorSeguro.length <= 1) {
        flechaIzq.classList.add("oculto");
        flechaDer.classList.add("oculto");
    } else {
        flechaIzq.classList.remove("oculto");
        flechaDer.classList.remove("oculto");
    }
}

/* ======================================================
   UTILIDADES
====================================================== */

function obtenerUltimoSeguimiento(reporte) {
    const lista = reporte.seguimientos || [];

    if (lista.length === 0) return null;

    return lista[lista.length - 1];
}

function badgeEstado(estado) {
    const clase = String(estado || "")
        .toLowerCase()
        .replaceAll(" ", "-");

    return `<span class="estado-badge estado-${clase}">${estado || "-"}</span>`;
}

function generarIdReporteSeguro() {
    const numero = (sistemaBD.seguros.length + 1).toString().padStart(5, "0");
    return `SEG-${new Date().getFullYear()}-${numero}`;
}

function generarIDSeguro() {
    if (typeof generarID === "function") {
        return generarID();
    }

    return "ID-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}

function obtenerFechaHoyISO() {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, "0");
    const d = String(hoy.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";

    const partes = fechaISO.split("-");

    if (partes.length !== 3) return fechaISO;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearMoneda(valor) {
    return Number(valor || 0).toLocaleString("es-DO", {
        style: "currency",
        currency: "DOP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function obtenerNombreChofer(chofer) {
    if (!chofer) return "-";

    const nombreCompleto = [
        chofer.nombre,
        chofer.apellido
    ].filter(Boolean).join(" ");

    return nombreCompleto || chofer.nombre || "-";
}