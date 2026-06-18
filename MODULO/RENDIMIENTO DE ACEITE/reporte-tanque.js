/* ======================================================
   MÓDULO REPORTE DE TANQUE
====================================================== */

const CLAVE_ADMIN_REPORTE = "1234";

let listaReportesTanqueModulo = JSON.parse(localStorage.getItem("reportesTanqueAceite")) || [];

document.addEventListener("DOMContentLoaded", function () {
    iniciarModuloReporteTanque();
});

function iniciarModuloReporteTanque() {
    refrescarListaReportesDesdeMemoria();
    limpiarDuplicadosReportesAntiguos();
    cargarReportesTanque();
}

function refrescarListaReportesDesdeMemoria() {
    listaReportesTanqueModulo = JSON.parse(localStorage.getItem("reportesTanqueAceite")) || [];
}

/* ======================================================
   LIMPIA DUPLICADOS VIEJOS DEL MISMO TANQUE
====================================================== */

function limpiarDuplicadosReportesAntiguos() {
    const mapa = new Map();

    listaReportesTanqueModulo.forEach(reporte => {
        const clave = obtenerClaveTanque(reporte);

        if (!mapa.has(clave)) {
            mapa.set(clave, reporte);
        } else {
            const actual = mapa.get(clave);
            const mejor = escogerReporteMasCompleto(actual, reporte);
            mapa.set(clave, mejor);
        }
    });

    listaReportesTanqueModulo = Array.from(mapa.values());
    guardarReportesTanque();
}

function obtenerClaveTanque(reporte) {
    return `${normalizarReporteTexto(reporte.idTanque)}|${normalizarReporteTexto(reporte.numeroTanque)}`;
}

function escogerReporteMasCompleto(a, b) {
    const scoreA = calcularPuntajeReporte(a);
    const scoreB = calcularPuntajeReporte(b);

    return scoreB >= scoreA ? b : a;
}

function calcularPuntajeReporte(reporte) {
    const detalle = Array.isArray(reporte.detalle) ? reporte.detalle.length : 0;
    const usado = Number(reporte.cuartilloUsadoTotal || 0);

    let estadoPuntos = 0;

    if (reporte.estado === "REACTIVADO") estadoPuntos = 30;
    if (reporte.estado === "REPORTADO") estadoPuntos = 20;
    if (reporte.estado === "TEMPORAL") estadoPuntos = 10;

    return (detalle * 1000) + usado + estadoPuntos;
}

/* ======================================================
   CARGAR HISTORIAL
====================================================== */

function cargarReportesTanque(lista = listaReportesTanqueModulo) {
    const tabla = document.getElementById("tablaReporteTanque");

    if (!tabla) return;

    tabla.innerHTML = "";

    if (lista.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; padding:20px;">
                    No hay reportes de tanque todavía.
                    Primero debes reportar un tanque desde Rendimiento de Aceite.
                </td>
            </tr>
        `;
        return;
    }

    lista.forEach(reporte => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${reporte.idTanque || ""}</td>
            <td>${reporte.numeroTanque || ""}</td>
            <td>${formatearFechaReporteTanque(reporte.fechaReporte)}</td>
            <td>${formatearNumeroReporteTanque(reporte.cuartilloTotalTanque)}</td>
            <td>${formatearNumeroReporteTanque(reporte.cuartilloUsadoTotal)}</td>
            <td>${formatearNumeroReporteTanque(reporte.cuartilloRestante)}</td>
            <td>${reporte.stockRestante || 0}</td>
            <td>${crearEtiquetaEstado(reporte.estado)}</td>
            <td>${reporte.comentario || ""}</td>
            <td>
                <button class="btn-tabla btn-ver" onclick="abrirDetalleReporteTanque('${reporte.idReporte}')">Ver</button>
                <button class="btn-tabla btn-reactivar" onclick="reactivarTanqueDesdeReporte('${reporte.idReporte}')">Reactivar</button>
                <button class="btn-tabla btn-editar" onclick="editarReporteConAdmin('${reporte.idReporte}')">Editar</button>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

/* ======================================================
   VER REPORTE EN VISTA TIPO PÁGINA
====================================================== */

function abrirDetalleReporteTanque(idReporte) {
    const reporte = listaReportesTanqueModulo.find(item => item.idReporte === idReporte);

    if (!reporte) {
        alert("No se encontró el reporte seleccionado.");
        return;
    }

    document.getElementById("vistaListaReportes").classList.add("oculto");
    document.getElementById("vistaDetalleReporte").classList.remove("oculto");

    document.getElementById("detalleIdTanque").value = reporte.idTanque || "";
    document.getElementById("detalleNumeroTanque").value = reporte.numeroTanque || "";
    document.getElementById("detalleNombreAceite").value = reporte.nombreAceite || "";
    document.getElementById("detalleFechaReporte").value = formatearFechaReporteTanque(reporte.fechaReporte);
    document.getElementById("detalleEstado").value = reporte.estado || "";
    document.getElementById("detalleTotal").value = formatearNumeroReporteTanque(reporte.cuartilloTotalTanque);
    document.getElementById("detalleUsado").value = formatearNumeroReporteTanque(reporte.cuartilloUsadoTotal);
    document.getElementById("detalleRestante").value = formatearNumeroReporteTanque(reporte.cuartilloRestante);
    document.getElementById("detalleStock").value = reporte.stockRestante || 0;
    document.getElementById("detalleComentario").value = reporte.comentario || "";

    cargarDetalleConsumosTanque(reporte);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function volverAlHistorialReporte() {
    document.getElementById("vistaDetalleReporte").classList.add("oculto");
    document.getElementById("vistaListaReportes").classList.remove("oculto");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function imprimirReporteTanque() {
    window.print();
}

/* ======================================================
   DETALLE DE CONSUMOS
====================================================== */

function cargarDetalleConsumosTanque(reporte) {
    const tabla = document.getElementById("tablaDetalleConsumosTanque");

    if (!tabla) return;

    tabla.innerHTML = "";

    const detalle = reporte.detalle || [];

    if (detalle.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:20px;">
                    Este reporte no tiene detalle de consumos.
                </td>
            </tr>
        `;
        return;
    }

    detalle.forEach(registro => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${formatearFechaReporteTanque(registro.fecha)}</td>
            <td><strong>${registro.ficha || ""}</strong></td>
            <td>${registro.tipoGuagua || ""}</td>
            <td>${registro.tipoMantenimiento || ""}</td>
            <td>${formatearNumeroReporteTanque(registro.cantidad)}</td>
            <td>${formatearNumeroReporteTanque(registro.kmAnterior)}</td>
            <td>${formatearNumeroReporteTanque(registro.kmActual)}</td>
            <td>${formatearNumeroReporteTanque(registro.kmTotal)}</td>
            <td>${registro.comentario || ""}</td>
        `;

        tabla.appendChild(fila);
    });
}

/* ======================================================
   FILTRO
====================================================== */

function filtrarReportesTanque() {
    refrescarListaReportesDesdeMemoria();

    const texto = normalizarReporteTexto(document.getElementById("buscarReporteTanque").value);
    const estado = normalizarReporteTexto(document.getElementById("filtroEstadoReporte").value);

    const filtrados = listaReportesTanqueModulo.filter(reporte => {
        const coincideTexto =
            normalizarReporteTexto(reporte.idTanque).includes(texto) ||
            normalizarReporteTexto(reporte.numeroTanque).includes(texto) ||
            normalizarReporteTexto(reporte.fechaReporte).includes(texto) ||
            normalizarReporteTexto(reporte.estado).includes(texto) ||
            normalizarReporteTexto(reporte.comentario).includes(texto);

        const coincideEstado = estado === "" || normalizarReporteTexto(reporte.estado) === estado;

        return coincideTexto && coincideEstado;
    });

    cargarReportesTanque(filtrados);
}

/* ======================================================
   REACTIVAR TANQUE
====================================================== */

function reactivarTanqueDesdeReporte(idReporte) {
    const reporte = listaReportesTanqueModulo.find(item => item.idReporte === idReporte);

    if (!reporte) {
        alert("No se encontró el reporte seleccionado.");
        return;
    }

    if (reporte.estado === "REACTIVADO") {
        alert("Este tanque ya está reactivado.");
        return;
    }

    const confirmar = confirm(
        "¿Deseas reactivar este tanque?\n\n" +
        "El tanque activo actual quedará TEMPORAL y este tanque se abrirá en Rendimiento con su información."
    );

    if (!confirmar) return;

    const tanqueActivoActual = JSON.parse(localStorage.getItem("tanqueActivoAceite")) || null;

    if (tanqueActivoActual) {
        const esMismoTanque =
            normalizarReporteTexto(tanqueActivoActual.idTanque) === normalizarReporteTexto(reporte.idTanque) &&
            Number(tanqueActivoActual.numeroTanque) === Number(reporte.numeroTanque);

        if (!esMismoTanque) {
            guardarTanqueActivoComoTemporal(tanqueActivoActual);
        }
    }

    reporte.estado = "REACTIVADO";
    reporte.fechaReactivacion = obtenerFechaHoyReporteTanque();
    reporte.comentario = agregarTextoComentario(
        reporte.comentario,
        "Tanque reactivado desde el módulo Reporte de Tanque."
    );

    const tanqueReactivado = {
        idTanque: reporte.idTanque,
        numeroTanque: reporte.numeroTanque,
        nombreAceite: reporte.nombreAceite || "DURON",
        stockTanque: reporte.stockRestante || 0,
        cuartilloTotalTanque: reporte.cuartilloTotalTanque || 0,
        estado: "REACTIVADO",
        origenReporteId: reporte.idReporte
    };

    localStorage.setItem("tanqueActivoAceite", JSON.stringify(tanqueReactivado));
    localStorage.setItem("idReporteReactivadoActivo", reporte.idReporte);

    abrirTanqueReactivadoEnRendimiento(reporte);

    guardarReportesTanque();

    alert("Tanque reactivado correctamente. Ahora se abrirá en Rendimiento con su información.");

    window.location.href = "RENDIMIENTO_ACEITE.html";
}

function abrirTanqueReactivadoEnRendimiento(reporte) {
    let registrosAceite = JSON.parse(localStorage.getItem("registrosAceite")) || [];

    registrosAceite = registrosAceite.filter(registro => {
        return Number(registro.numeroTanque) !== Number(reporte.numeroTanque);
    });

    const detalle = reporte.detalle || [];

    const detalleRestaurado = detalle.map(registro => {
        return {
            ...registro,
            numeroTanque: reporte.numeroTanque
        };
    });

    registrosAceite = detalleRestaurado.concat(registrosAceite);

    localStorage.setItem("registrosAceite", JSON.stringify(registrosAceite));
}

function guardarTanqueActivoComoTemporal(tanqueActivoActual) {
    const claveActual = `${normalizarReporteTexto(tanqueActivoActual.idTanque)}|${normalizarReporteTexto(tanqueActivoActual.numeroTanque)}`;

    let reporteTemporal = listaReportesTanqueModulo.find(reporte => {
        return obtenerClaveTanque(reporte) === claveActual;
    });

    if (reporteTemporal) {
        reporteTemporal.estado = "TEMPORAL";
        reporteTemporal.comentario = agregarTextoComentario(
            reporteTemporal.comentario,
            "Tanque activo guardado temporalmente al reactivar otro tanque."
        );
    } else {
        reporteTemporal = {
            idReporte: generarIdReporteTanque(),
            idTanque: tanqueActivoActual.idTanque || "SIN-ID",
            numeroTanque: tanqueActivoActual.numeroTanque || "",
            nombreAceite: tanqueActivoActual.nombreAceite || "",
            fechaReporte: obtenerFechaHoyReporteTanque(),
            cuartilloTotalTanque: tanqueActivoActual.cuartilloTotalTanque || 0,
            cuartilloUsadoTotal: 0,
            cuartilloRestante: tanqueActivoActual.cuartilloTotalTanque || 0,
            stockRestante: tanqueActivoActual.stockTanque || 0,
            estado: "TEMPORAL",
            comentario: "Tanque activo guardado temporalmente al reactivar otro tanque.",
            detalle: []
        };

        listaReportesTanqueModulo.unshift(reporteTemporal);
    }

    localStorage.setItem("tanqueTemporalAceite", JSON.stringify(tanqueActivoActual));
}

/* ======================================================
   EDITAR CON ADMIN
====================================================== */

function editarReporteConAdmin(idReporte) {
    const clave = prompt("Ingrese la clave del administrador para editar este reporte:");

    if (clave !== CLAVE_ADMIN_REPORTE) {
        alert("Clave incorrecta. No tiene autorización para editar.");
        return;
    }

    const reporte = listaReportesTanqueModulo.find(item => item.idReporte === idReporte);

    if (!reporte) {
        alert("No se encontró el reporte.");
        return;
    }

    const nuevoTotal = prompt("Cuartillo total tanque:", reporte.cuartilloTotalTanque);
    const nuevoUsado = prompt("Cuartillo usado total:", reporte.cuartilloUsadoTotal);
    const nuevoRestante = prompt("Cuartillo restante:", reporte.cuartilloRestante);
    const nuevoStock = prompt("Stock restante:", reporte.stockRestante);
    const nuevoEstado = prompt("Estado:", reporte.estado);
    const nuevoComentario = prompt("Comentario:", reporte.comentario || "");

    if (
        nuevoTotal === null ||
        nuevoUsado === null ||
        nuevoRestante === null ||
        nuevoStock === null ||
        nuevoEstado === null ||
        nuevoComentario === null
    ) {
        alert("Edición cancelada.");
        return;
    }

    reporte.cuartilloTotalTanque = Number(nuevoTotal) || 0;
    reporte.cuartilloUsadoTotal = Number(nuevoUsado) || 0;
    reporte.cuartilloRestante = Number(nuevoRestante) || 0;
    reporte.stockRestante = Number(nuevoStock) || 0;
    reporte.estado = normalizarReporteTexto(nuevoEstado);
    reporte.comentario = nuevoComentario;

    guardarReportesTanque();
    cargarReportesTanque();

    alert("Reporte editado correctamente.");
}

/* ======================================================
   GUARDAR
====================================================== */

function guardarReportesTanque() {
    localStorage.setItem("reportesTanqueAceite", JSON.stringify(listaReportesTanqueModulo));
}

/* ======================================================
   UTILIDADES
====================================================== */

function crearEtiquetaEstado(estado) {
    const estadoNormal = normalizarReporteTexto(estado);

    let clase = "estado-badge";

    if (estadoNormal === "REPORTADO") clase += " estado-reportado";
    else if (estadoNormal === "REACTIVADO") clase += " estado-reactivado";
    else if (estadoNormal === "TEMPORAL") clase += " estado-temporal";

    return `<span class="${clase}">${estadoNormal}</span>`;
}

function agregarTextoComentario(comentarioActual, textoNuevo) {
    if (!comentarioActual || comentarioActual.trim() === "") {
        return textoNuevo;
    }

    if (comentarioActual.includes(textoNuevo)) {
        return comentarioActual;
    }

    return comentarioActual + " | " + textoNuevo;
}

function obtenerFechaHoyReporteTanque() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function normalizarReporteTexto(texto) {
    return String(texto || "").trim().toUpperCase();
}

function formatearNumeroReporteTanque(valor) {
    return Number(valor || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatearFechaReporteTanque(fechaISO) {
    if (!fechaISO) return "";

    const partes = String(fechaISO).split("-");

    if (partes.length !== 3) return fechaISO;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function generarIdReporteTanque() {
    return "REP-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}