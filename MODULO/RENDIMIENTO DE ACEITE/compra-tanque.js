/* ======================================================
   MÓDULO COMPRA DE TANQUES DE ACEITE
====================================================== */

let comprasAceite = JSON.parse(localStorage.getItem("comprasAceite")) || [];
let inventarioTanquesAceite = JSON.parse(localStorage.getItem("inventarioTanquesAceite")) || [];

document.addEventListener("DOMContentLoaded", function () {
    iniciarModuloCompraTanque();
});

function iniciarModuloCompraTanque() {
    const idCompra = document.getElementById("idCompra");
    const fechaCompra = document.getElementById("fechaCompra");

    if (!idCompra) {
        return;
    }

    idCompra.value = generarIdCompraAceite();
    fechaCompra.value = obtenerFechaHoyCompra();

    cargarTablaCompraTanques();
    actualizarTarjetasCompra();
}

/* ======================================================
   CALCULAR TOTAL
====================================================== */

function calcularTotalCuartillosCompra() {
    const cantidadTanques = Number(document.getElementById("cantidadTanques").value) || 0;
    const cuartillosPorTanque = Number(document.getElementById("cuartillosPorTanque").value) || 0;

    const total = cantidadTanques * cuartillosPorTanque;

    document.getElementById("totalCuartillos").value = total > 0 ? total.toFixed(2) : "";
}

/* ======================================================
   GUARDAR COMPRA
====================================================== */

function guardarCompraTanques() {
    const idCompra = document.getElementById("idCompra").value;
    const fechaCompra = document.getElementById("fechaCompra").value;
    const marcaAceite = normalizarCompraTexto(document.getElementById("marcaAceite").value);
    const cantidadTanques = Number(document.getElementById("cantidadTanques").value) || 0;
    const cuartillosPorTanque = Number(document.getElementById("cuartillosPorTanque").value) || 0;
    const totalCuartillos = cantidadTanques * cuartillosPorTanque;
    const comentarioCompra = document.getElementById("comentarioCompra").value.trim();

    if (fechaCompra === "") {
        alert("Debe seleccionar la fecha de compra.");
        return;
    }

    if (marcaAceite === "") {
        alert("Debe escribir la marca o nombre del aceite.");
        return;
    }

    if (cantidadTanques <= 0) {
        alert("Debe escribir una cantidad de tanques válida.");
        return;
    }

    if (cuartillosPorTanque <= 0) {
        alert("Debe escribir los cuartillos por tanque.");
        return;
    }

    const compra = {
        idCompra: idCompra,
        fechaCompra: fechaCompra,
        marcaAceite: marcaAceite,
        cantidadTanques: cantidadTanques,
        cuartillosPorTanque: cuartillosPorTanque,
        totalCuartillos: totalCuartillos,
        estadoInicial: "INACTIVO",
        comentario: comentarioCompra
    };

    comprasAceite.unshift(compra);

    /*
        Si se compran 10 tanques, aquí se crean 10 entradas individuales.
        Todos entran INACTIVOS hasta que el usuario active uno.
    */
    for (let i = 1; i <= cantidadTanques; i++) {
        const tanque = {
            idCompra: idCompra,
            idTanque: generarIdTanqueAceite(),
            numeroTanque: obtenerProximoNumeroTanque(),
            fechaCompra: fechaCompra,
            marcaAceite: marcaAceite,
            cuartillosPorTanque: cuartillosPorTanque,
            estado: "INACTIVO",
            fechaActivacion: "",
            fechaReporte: "",
            comentario: comentarioCompra
        };

        inventarioTanquesAceite.push(tanque);
    }

    guardarDatosCompraTanques();

    cargarTablaCompraTanques();
    actualizarTarjetasCompra();
    limpiarCompraTanques();

    alert("Compra guardada correctamente. Se crearon " + cantidadTanques + " tanques individuales.");
}

function guardarDatosCompraTanques() {
    localStorage.setItem("comprasAceite", JSON.stringify(comprasAceite));
    localStorage.setItem("inventarioTanquesAceite", JSON.stringify(inventarioTanquesAceite));
}

/* ======================================================
   ACTIVAR TANQUE
====================================================== */

function activarTanqueComprado(idTanque) {
    const tanque = inventarioTanquesAceite.find(item => item.idTanque === idTanque);

    if (!tanque) {
        alert("No se encontró el tanque.");
        return;
    }

    if (tanque.estado === "REPORTADO") {
        alert("Este tanque ya fue reportado. Para volver a usarlo, debe reactivarse desde Reporte de Tanque.");
        return;
    }

    const tanqueActivoActual = JSON.parse(localStorage.getItem("tanqueActivoAceite")) || null;

    if (tanqueActivoActual && tanqueActivoActual.estado !== "REPORTADO") {
        const confirmar = confirm(
            "Ya existe un tanque activo o temporal.\n\n" +
            "¿Deseas poner el tanque actual como TEMPORAL y activar este tanque?"
        );

        if (!confirmar) {
            return;
        }

        marcarTanqueInventarioComoTemporal(tanqueActivoActual.idTanque);
    }

    tanque.estado = "ACTIVO";
    tanque.fechaActivacion = obtenerFechaHoyCompra();

    const tanqueActivo = {
        idTanque: tanque.idTanque,
        numeroTanque: tanque.numeroTanque,
        nombreAceite: tanque.marcaAceite,
        stockTanque: contarTanquesPendientes(),
        cuartilloTotalTanque: tanque.cuartillosPorTanque,
        estado: "ACTIVO",
        idCompra: tanque.idCompra
    };

    localStorage.setItem("tanqueActivoAceite", JSON.stringify(tanqueActivo));

    guardarDatosCompraTanques();

    cargarTablaCompraTanques();
    actualizarTarjetasCompra();

    alert("Tanque activado correctamente. Ahora se abrirá en Rendimiento de Aceite.");

    window.location.href = "RENDIMIENTO_ACEITE.html";
}

function marcarTanqueInventarioComoTemporal(idTanque) {
    if (!idTanque) {
        return;
    }

    const tanque = inventarioTanquesAceite.find(item => item.idTanque === idTanque);

    if (tanque && tanque.estado === "ACTIVO") {
        tanque.estado = "TEMPORAL";
    }
}

/* ======================================================
   TABLA
====================================================== */

function cargarTablaCompraTanques(lista = inventarioTanquesAceite) {
    const tabla = document.getElementById("tablaCompraTanques");

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";

    if (lista.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="11" style="text-align:center; padding:20px;">
                    No hay tanques comprados registrados.
                </td>
            </tr>
        `;
        return;
    }

    lista.forEach(tanque => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${tanque.idCompra}</td>
            <td>${tanque.idTanque}</td>
            <td>${tanque.numeroTanque}</td>
            <td>${formatearFechaCompra(tanque.fechaCompra)}</td>
            <td>${tanque.marcaAceite}</td>
            <td>${formatearNumeroCompra(tanque.cuartillosPorTanque)}</td>
            <td>${crearEtiquetaEstadoCompra(tanque.estado)}</td>
            <td>${formatearFechaCompra(tanque.fechaActivacion)}</td>
            <td>${formatearFechaCompra(tanque.fechaReporte)}</td>
            <td>${tanque.comentario || ""}</td>
            <td>
                ${crearBotonActivarTanque(tanque)}
            </td>
        `;

        tabla.appendChild(fila);
    });
}

function crearBotonActivarTanque(tanque) {
    if (tanque.estado === "INACTIVO" || tanque.estado === "TEMPORAL") {
        return `<button class="btn-tabla btn-reactivar" onclick="activarTanqueComprado('${tanque.idTanque}')">Activar</button>`;
    }

    if (tanque.estado === "ACTIVO") {
        return `<span class="texto-activo">Tanque activo</span>`;
    }

    if (tanque.estado === "REPORTADO") {
        return `<span class="texto-reportado">Reportado</span>`;
    }

    return "";
}

/* ======================================================
   BUSCAR / FILTRAR
====================================================== */

function filtrarTanquesComprados() {
    const texto = normalizarCompraTexto(document.getElementById("buscarCompraTanque").value);
    const estado = normalizarCompraTexto(document.getElementById("filtroEstadoTanque").value);

    const filtrados = inventarioTanquesAceite.filter(tanque => {
        const coincideTexto =
            normalizarCompraTexto(tanque.idCompra).includes(texto) ||
            normalizarCompraTexto(tanque.idTanque).includes(texto) ||
            normalizarCompraTexto(tanque.numeroTanque).includes(texto) ||
            normalizarCompraTexto(tanque.fechaCompra).includes(texto) ||
            normalizarCompraTexto(tanque.marcaAceite).includes(texto) ||
            normalizarCompraTexto(tanque.comentario).includes(texto);

        const coincideEstado = estado === "" || normalizarCompraTexto(tanque.estado) === estado;

        return coincideTexto && coincideEstado;
    });

    cargarTablaCompraTanques(filtrados);
}

/* ======================================================
   TARJETAS
====================================================== */

function actualizarTarjetasCompra() {
    const total = inventarioTanquesAceite.length;

    const pendientes = inventarioTanquesAceite.filter(t => t.estado === "INACTIVO").length;
    const activos = inventarioTanquesAceite.filter(t => t.estado === "ACTIVO" || t.estado === "TEMPORAL").length;
    const reportados = inventarioTanquesAceite.filter(t => t.estado === "REPORTADO").length;

    document.getElementById("cardTotalTanques").textContent = total;
    document.getElementById("cardPendientes").textContent = pendientes;
    document.getElementById("cardActivos").textContent = activos;
    document.getElementById("cardReportados").textContent = reportados;
}

function contarTanquesPendientes() {
    return inventarioTanquesAceite.filter(t => t.estado === "INACTIVO").length;
}

/* ======================================================
   LIMPIAR
====================================================== */

function limpiarCompraTanques() {
    document.getElementById("idCompra").value = generarIdCompraAceite();
    document.getElementById("fechaCompra").value = obtenerFechaHoyCompra();
    document.getElementById("marcaAceite").value = "";
    document.getElementById("cantidadTanques").value = "";
    document.getElementById("cuartillosPorTanque").value = "";
    document.getElementById("totalCuartillos").value = "";
    document.getElementById("estadoInicial").value = "INACTIVO";
    document.getElementById("comentarioCompra").value = "";
}

/* ======================================================
   UTILIDADES
====================================================== */

function generarIdCompraAceite() {
    const numero = comprasAceite.length + 1;
    return "COMPRA-" + String(numero).padStart(6, "0");
}

function generarIdTanqueAceite() {
    const numero = inventarioTanquesAceite.length + 1;
    return "ACEITE-" + String(numero).padStart(8, "0");
}

function obtenerProximoNumeroTanque() {
    if (inventarioTanquesAceite.length === 0) {
        return 1;
    }

    const maximo = Math.max(...inventarioTanquesAceite.map(t => Number(t.numeroTanque) || 0));
    return maximo + 1;
}

function obtenerFechaHoyCompra() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function normalizarCompraTexto(texto) {
    return String(texto || "").trim().toUpperCase();
}

function formatearNumeroCompra(valor) {
    return Number(valor || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatearFechaCompra(fechaISO) {
    if (!fechaISO) {
        return "";
    }

    const partes = String(fechaISO).split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function crearEtiquetaEstadoCompra(estado) {
    const estadoNormal = normalizarCompraTexto(estado);

    let clase = "estado-badge";

    if (estadoNormal === "INACTIVO") {
        clase += " estado-temporal";
    } else if (estadoNormal === "ACTIVO") {
        clase += " estado-reactivado";
    } else if (estadoNormal === "TEMPORAL") {
        clase += " estado-temporal";
    } else if (estadoNormal === "REPORTADO") {
        clase += " estado-reportado";
    }

    return `<span class="${clase}">${estadoNormal}</span>`;
}