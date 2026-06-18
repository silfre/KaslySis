/* ======================================================
   NAVEGACIÓN GENERAL
====================================================== */


function irInicio() {
    window.location.href = "../INICIO/index.html";
}

function irRendimientoAceite() {
    window.location.href = "RENDIMIENTO_ACEITE.html";
}

function irCompraTanque() {
    window.location.href = "compra-tanque.html";
}

function irReporteTanque() {
    window.location.href = "reporte-tanque.html";
}

/* ======================================================
   REGLAS DEL ACEITE POR TIPO DE GUAGUA / MARCA
====================================================== */

const CUARTILLOS_POR_MARCA = {
    "COASTER": 9.5,
    "HIACE CAJA VIEJA": 7,
    "H1": 8,
    "MITSUBISHI": 9.5,
    "HIACE CAJA NUEVA": 7.5
};

/* ======================================================
   DATOS TEMPORALES
====================================================== */

let fichasAceite = JSON.parse(localStorage.getItem("fichasAceite")) || [
    { ficha: "T89", marca: "COASTER", estado: "ACTIVO" },
    { ficha: "T38", marca: "HIACE CAJA NUEVA", estado: "ACTIVO" },
    { ficha: "T83", marca: "HIACE CAJA NUEVA", estado: "ACTIVO" },
    { ficha: "T21", marca: "H1", estado: "ACTIVO" },
    { ficha: "T63", marca: "MITSUBISHI", estado: "ACTIVO" }
];

let registrosAceite = JSON.parse(localStorage.getItem("registrosAceite")) || [
    {
        id: generarId(),
        numeroTanque: 13,
        fecha: "2026-05-08",
        ficha: "T89",
        tipoGuagua: "COASTER",
        tipoMantenimiento: "MANTENIMIENTO FULL",
        cantidad: 9.5,
        kmAnterior: 457013,
        kmActual: 465459,
        kmTotal: 8446,
        comentario: ""
    },
    {
        id: generarId(),
        numeroTanque: 13,
        fecha: "2026-05-08",
        ficha: "T38",
        tipoGuagua: "HIACE CAJA NUEVA",
        tipoMantenimiento: "MANTENIMIENTO FULL",
        cantidad: 7.5,
        kmAnterior: 431609,
        kmActual: 442954,
        kmTotal: 11345,
        comentario: ""
    },
    {
        id: generarId(),
        numeroTanque: 13,
        fecha: "2026-05-08",
        ficha: "T83",
        tipoGuagua: "HIACE CAJA NUEVA",
        tipoMantenimiento: "MANTENIMIENTO FULL",
        cantidad: 7.5,
        kmAnterior: 382191,
        kmActual: 392513,
        kmTotal: 10322,
        comentario: ""
    }
];

let tanqueActivoAceite = JSON.parse(localStorage.getItem("tanqueActivoAceite")) || {
    idTanque: "ACEITE-00000004",
    numeroTanque: 13,
    stockTanque: 9,
    nombreAceite: "DURON",
    cuartilloTotalTanque: 223,
    estado: "ACTIVO"
};

let reportesTanqueAceite = JSON.parse(localStorage.getItem("reportesTanqueAceite")) || [];

let cantidadFueEditadaManual = false;
let kmAnteriorFueEditadoManual = false;
let idRegistroEditando = null;

/* ======================================================
   INICIAR PÁGINA
====================================================== */

document.addEventListener("DOMContentLoaded", function () {
    prepararRegistrosViejos();
    iniciarPaginaRendimientoAceite();
});

function prepararRegistrosViejos() {
    let huboCambio = false;

    registrosAceite.forEach(registro => {
        if (!registro.id) {
            registro.id = generarId();
            huboCambio = true;
        }

        if (!registro.numeroTanque) {
            registro.numeroTanque = tanqueActivoAceite.numeroTanque;
            huboCambio = true;
        }
    });

    if (huboCambio) {
        guardarRegistrosAceite();
    }
}

function iniciarPaginaRendimientoAceite() {
    const fechaActual = document.getElementById("fechaActual");

    if (!fechaActual) {
        return;
    }

    fechaActual.value = obtenerFechaHoyISO();

    cargarListaFichasAceite();
    cargarTablaRendimientoAceite();
    actualizarTarjetasAceite();
}

/* ======================================================
   FECHA AUTOMÁTICA, PERO EDITABLE
====================================================== */

function obtenerFechaHoyISO() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/* ======================================================
   BUSCADOR DE FICHA
====================================================== */

function cargarListaFichasAceite() {
    const lista = document.getElementById("listaFichas");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    fichasAceite.forEach(item => {
        const option = document.createElement("option");
        option.value = item.ficha;
        option.label = `${item.ficha} - ${item.marca}`;
        lista.appendChild(option);
    });
}

function buscarFichaAceite() {
    const fichaInput = document.getElementById("ficha");
    const tipoGuaguaInput = document.getElementById("tipoGuagua");
    const panelFichaNueva = document.getElementById("panelFichaNueva");
    const nuevaFichaInput = document.getElementById("nuevaFicha");

    const fichaEscrita = normalizarTexto(fichaInput.value);

    if (fichaEscrita === "") {
        tipoGuaguaInput.value = "";
        ocultarPanelFichaNueva();
        return;
    }

    const fichaEncontrada = fichasAceite.find(item => {
        return normalizarTexto(item.ficha) === fichaEscrita;
    });

    if (fichaEncontrada) {
        tipoGuaguaInput.value = fichaEncontrada.marca;

        cantidadFueEditadaManual = false;
        kmAnteriorFueEditadoManual = false;

        ocultarPanelFichaNueva();

        calcularCantidadAceite();
        buscarKmAnteriorAceite();
        calcularKmTotalAceite();
    } else {
        tipoGuaguaInput.value = "";

        if (nuevaFichaInput) {
            nuevaFichaInput.value = fichaEscrita;
        }

        if (panelFichaNueva) {
            panelFichaNueva.style.display = "block";
        }

        document.getElementById("cantidad").value = "";
        document.getElementById("kmAnterior").value = "";
        document.getElementById("kmTotal").value = "";
    }
}

function ocultarPanelFichaNueva() {
    const panelFichaNueva = document.getElementById("panelFichaNueva");

    if (panelFichaNueva) {
        panelFichaNueva.style.display = "none";
    }
}

/* ======================================================
   CREAR FICHA DESDE EL MISMO MÓDULO
====================================================== */

function crearFichaDesdeRendimiento(editarLuego) {
    const nuevaFicha = normalizarTexto(document.getElementById("nuevaFicha").value);
    const nuevaMarca = document.getElementById("nuevaMarca").value;

    if (nuevaFicha === "") {
        alert("Debe escribir una ficha.");
        return;
    }

    if (nuevaMarca === "") {
        alert("Debe seleccionar el tipo de guagua o marca.");
        return;
    }

    const existe = fichasAceite.some(item => {
        return normalizarTexto(item.ficha) === nuevaFicha;
    });

    if (existe) {
        alert("Esta ficha ya existe.");
        return;
    }

    const nueva = {
        ficha: nuevaFicha,
        marca: nuevaMarca,
        estado: "ACTIVO"
    };

    fichasAceite.push(nueva);
    guardarFichasAceite();

    cargarListaFichasAceite();

    document.getElementById("ficha").value = nuevaFicha;
    document.getElementById("tipoGuagua").value = nuevaMarca;

    cantidadFueEditadaManual = false;
    kmAnteriorFueEditadoManual = false;

    ocultarPanelFichaNueva();

    calcularCantidadAceite();
    buscarKmAnteriorAceite();
    calcularKmTotalAceite();

    alert("Ficha creada correctamente.");

    if (editarLuego === true) {
        window.location.href = "dato-ficha.html?ficha=" + encodeURIComponent(nuevaFicha);
    }
}

function guardarFichasAceite() {
    localStorage.setItem("fichasAceite", JSON.stringify(fichasAceite));
}

/* ======================================================
   CANTIDAD AUTOMÁTICA, PERO EDITABLE
====================================================== */

function calcularCantidadAceite() {
    const tipoGuagua = normalizarTexto(document.getElementById("tipoGuagua").value);
    const tipoMantenimiento = document.getElementById("tipoMantenimiento").value;
    const cantidadInput = document.getElementById("cantidad");

    if (cantidadFueEditadaManual === true) {
        return;
    }

    if (tipoMantenimiento === "MANTENIMIENTO FULL" || tipoMantenimiento === "MANTENIMIENTO SEMI") {
        const cantidad = CUARTILLOS_POR_MARCA[tipoGuagua] || 0;

        cantidadInput.value = cantidad > 0 ? cantidad : "";
        cantidadInput.placeholder = "Automático, pero editable";
        cantidadInput.readOnly = false;
    } else {
        cantidadInput.value = "";
        cantidadInput.placeholder = "Digite la cantidad usada";
        cantidadInput.readOnly = false;
    }
}

/* ======================================================
   KM ANTERIOR AUTOMÁTICO, PERO EDITABLE
====================================================== */

function buscarKmAnteriorAceite() {
    const ficha = normalizarTexto(document.getElementById("ficha").value);
    const tipoMantenimiento = document.getElementById("tipoMantenimiento").value;
    const kmAnteriorInput = document.getElementById("kmAnterior");

    if (kmAnteriorFueEditadoManual === true) {
        calcularKmTotalAceite();
        return;
    }

    if (ficha === "" || tipoMantenimiento === "") {
        kmAnteriorInput.value = "";
        return;
    }

    const ultimo = buscarUltimoMantenimientoFullOSemi(ficha);

    if (ultimo) {
        kmAnteriorInput.value = ultimo.kmActual;
        kmAnteriorInput.placeholder = "Automático, pero editable";
        kmAnteriorInput.readOnly = false;
    } else {
        kmAnteriorInput.value = "";
        kmAnteriorInput.placeholder = "No hay historial, digite KM inicial";
        kmAnteriorInput.readOnly = false;
    }

    calcularKmTotalAceite();
}

function buscarUltimoMantenimientoFullOSemi(ficha) {
    const historial = registrosAceite.filter(registro => {
        const mismaFicha = normalizarTexto(registro.ficha) === ficha;

        const esFullOSemi =
            registro.tipoMantenimiento === "MANTENIMIENTO FULL" ||
            registro.tipoMantenimiento === "MANTENIMIENTO SEMI";

        if (idRegistroEditando && registro.id === idRegistroEditando) {
            return false;
        }

        return mismaFicha && esFullOSemi;
    });

    if (historial.length === 0) {
        return null;
    }

    historial.sort((a, b) => {
        return new Date(b.fecha) - new Date(a.fecha);
    });

    return historial[0];
}

/* ======================================================
   KM TOTAL AUTOMÁTICO, PERO EDITABLE
====================================================== */

function calcularKmTotalAceite() {
    const kmAnterior = Number(document.getElementById("kmAnterior").value) || 0;
    const kmActual = Number(document.getElementById("kmActual").value) || 0;
    const kmTotalInput = document.getElementById("kmTotal");

    if (kmAnterior <= 0 || kmActual <= 0) {
        kmTotalInput.value = "";
        return;
    }

    const kmTotal = kmActual - kmAnterior;

    kmTotalInput.value = kmTotal >= 0 ? kmTotal.toFixed(2) : "";
}

/* ======================================================
   GUARDAR / ACTUALIZAR CONSUMO
====================================================== */

function guardarConsumoAceite() {
    const fecha = document.getElementById("fechaActual").value;
    const ficha = normalizarTexto(document.getElementById("ficha").value);
    const tipoGuagua = normalizarTexto(document.getElementById("tipoGuagua").value);
    const tipoMantenimiento = document.getElementById("tipoMantenimiento").value;
    const cantidad = Number(document.getElementById("cantidad").value) || 0;
    const kmAnterior = Number(document.getElementById("kmAnterior").value) || 0;
    const kmActual = Number(document.getElementById("kmActual").value) || 0;
    const kmTotal = Number(document.getElementById("kmTotal").value) || 0;
    const comentario = document.getElementById("comentario").value.trim();

    if (fecha === "") {
        alert("La fecha actual es obligatoria.");
        return;
    }

    if (ficha === "") {
        alert("Debe escribir una ficha.");
        return;
    }

    const fichaExiste = fichasAceite.some(item => {
        return normalizarTexto(item.ficha) === ficha;
    });

    if (!fichaExiste) {
        alert("La ficha no existe. Primero debe crearla.");
        return;
    }

    if (tipoGuagua === "") {
        alert("Debe indicar el tipo de guagua o marca.");
        return;
    }

    if (tipoMantenimiento === "") {
        alert("Debe seleccionar el tipo de mantenimiento.");
        return;
    }

    if (cantidad <= 0) {
        alert("La cantidad debe ser mayor que cero.");
        return;
    }

    if (kmActual <= 0) {
        alert("Debe escribir el KM actual.");
        return;
    }

    if (kmAnterior < 0) {
        alert("El KM anterior no puede ser negativo.");
        return;
    }

    if (kmActual < kmAnterior) {
        alert("El KM actual no puede ser menor que el KM anterior.");
        return;
    }

    const registro = {
        id: idRegistroEditando || generarId(),
        numeroTanque: tanqueActivoAceite.numeroTanque,
        fecha: fecha,
        ficha: ficha,
        tipoGuagua: tipoGuagua,
        tipoMantenimiento: tipoMantenimiento,
        cantidad: cantidad,
        kmAnterior: kmAnterior,
        kmActual: kmActual,
        kmTotal: kmTotal,
        comentario: comentario
    };

    if (idRegistroEditando) {
        const index = registrosAceite.findIndex(item => item.id === idRegistroEditando);

        if (index !== -1) {
            registrosAceite[index] = registro;
        }

        alert("Consumo actualizado correctamente.");
    } else {
        registrosAceite.unshift(registro);
        alert("Consumo guardado correctamente.");
    }

    guardarRegistrosAceite();
    cargarTablaRendimientoAceite();
    actualizarTarjetasAceite();
    limpiarFormularioAceite();
}

function guardarRegistrosAceite() {
    localStorage.setItem("registrosAceite", JSON.stringify(registrosAceite));
}

/* ======================================================
   EDITAR Y BORRAR REGISTROS
====================================================== */

function editarRegistroAceite(id) {
    const registro = registrosAceite.find(item => item.id === id);

    if (!registro) {
        alert("No se encontró el registro.");
        return;
    }

    idRegistroEditando = id;

    document.getElementById("fechaActual").value = registro.fecha;
    document.getElementById("ficha").value = registro.ficha;
    document.getElementById("tipoGuagua").value = registro.tipoGuagua;
    document.getElementById("tipoMantenimiento").value = registro.tipoMantenimiento;
    document.getElementById("cantidad").value = registro.cantidad;
    document.getElementById("kmAnterior").value = registro.kmAnterior;
    document.getElementById("kmActual").value = registro.kmActual;
    document.getElementById("kmTotal").value = registro.kmTotal;
    document.getElementById("comentario").value = registro.comentario || "";

    cantidadFueEditadaManual = true;
    kmAnteriorFueEditadoManual = true;

    document.getElementById("btnGuardarConsumo").textContent = "Actualizar consumo";
    document.getElementById("btnCancelarEdicion").style.display = "inline-block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function borrarRegistroAceite(id) {
    const confirmar = confirm("¿Seguro que deseas borrar este registro de rendimiento?");

    if (!confirmar) {
        return;
    }

    registrosAceite = registrosAceite.filter(item => item.id !== id);

    guardarRegistrosAceite();
    cargarTablaRendimientoAceite();
    actualizarTarjetasAceite();

    if (idRegistroEditando === id) {
        limpiarFormularioAceite();
    }

    alert("Registro borrado correctamente.");
}

function cancelarEdicionAceite() {
    limpiarFormularioAceite();
}

/* ======================================================
   CARGAR TABLA
====================================================== */

function cargarTablaRendimientoAceite() {
    const tabla = document.getElementById("tablaRendimientoAceite");

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";

    const registrosDelTanqueActivo = registrosAceite.filter(registro => {
        return Number(registro.numeroTanque) === Number(tanqueActivoAceite.numeroTanque);
    });

    if (registrosDelTanqueActivo.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; padding:20px;">
                    No hay consumos registrados para el tanque activo.
                </td>
            </tr>
        `;
        return;
    }

    registrosDelTanqueActivo.forEach(registro => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${formatearFecha(registro.fecha)}</td>
            <td><strong>${registro.ficha}</strong></td>
            <td>${registro.tipoGuagua}</td>
            <td>${registro.tipoMantenimiento}</td>
            <td>${formatearNumero(registro.cantidad)}</td>
            <td>${formatearNumero(registro.kmAnterior)}</td>
            <td>${formatearNumero(registro.kmActual)}</td>
            <td>${formatearNumero(registro.kmTotal)}</td>
            <td>${registro.comentario || ""}</td>
            <td>
                <button class="btn-tabla btn-editar" onclick="editarRegistroAceite('${registro.id}')">Editar</button>
                <button class="btn-tabla btn-borrar" onclick="borrarRegistroAceite('${registro.id}')">Borrar</button>
            </td>
        `;

        tabla.appendChild(fila);
    });
}

/* ======================================================
   TARJETAS DEL TANQUE
====================================================== */

function actualizarTarjetasAceite() {
    const cardTanqueActual = document.getElementById("cardTanqueActual");
    const cardStockTanque = document.getElementById("cardStockTanque");
    const cardCuartillosUsados = document.getElementById("cardCuartillosUsados");
    const cardCuartillosRestantes = document.getElementById("cardCuartillosRestantes");

    if (!cardTanqueActual) {
        return;
    }

    const registrosDelTanque = registrosAceite.filter(registro => {
        return Number(registro.numeroTanque) === Number(tanqueActivoAceite.numeroTanque);
    });

    const cuartillosUsados = registrosDelTanque.reduce((total, registro) => {
        return total + Number(registro.cantidad || 0);
    }, 0);

    const restante = tanqueActivoAceite.cuartilloTotalTanque - cuartillosUsados;

    cardTanqueActual.textContent = tanqueActivoAceite.numeroTanque;
    cardStockTanque.textContent = tanqueActivoAceite.stockTanque;
    cardCuartillosUsados.textContent = formatearNumero(cuartillosUsados);
    cardCuartillosRestantes.textContent = formatearNumero(restante);
}

/* ======================================================
   REPORTAR TANQUE
====================================================== */

function reportarTanqueAceite() {
    const confirmar = confirm("¿Deseas reportar este tanque y enviar el reporte completo al módulo Reporte de Tanque?");

    if (!confirmar) {
        return;
    }

    const numeroTanqueActivo = Number(tanqueActivoAceite.numeroTanque);

    const registrosDelTanque = registrosAceite.filter(registro => {
        return Number(registro.numeroTanque) === numeroTanqueActivo;
    });

    if (registrosDelTanque.length === 0) {
        alert("No hay consumos registrados para este tanque.");
        return;
    }

    const cuartillosUsados = registrosDelTanque.reduce((total, registro) => {
        return total + Number(registro.cantidad || 0);
    }, 0);

    const cuartillosRestantes = Number(tanqueActivoAceite.cuartilloTotalTanque || 0) - cuartillosUsados;

    let listaReportes = JSON.parse(localStorage.getItem("reportesTanqueAceite")) || [];

    const idReporteReactivado = localStorage.getItem("idReporteReactivadoActivo");

    let reporteExistente = null;

    if (idReporteReactivado) {
        reporteExistente = listaReportes.find(item => item.idReporte === idReporteReactivado);
    }

    if (!reporteExistente) {
        reporteExistente = listaReportes.find(item => {
            return String(item.idTanque || "").toUpperCase() === String(tanqueActivoAceite.idTanque || "").toUpperCase()
                && Number(item.numeroTanque) === Number(tanqueActivoAceite.numeroTanque);
        });
    }

    if (reporteExistente) {
        reporteExistente.fechaReporte = obtenerFechaHoyISO();
        reporteExistente.cuartilloTotalTanque = tanqueActivoAceite.cuartilloTotalTanque;
        reporteExistente.cuartilloUsadoTotal = cuartillosUsados;
        reporteExistente.cuartilloRestante = cuartillosRestantes;
        reporteExistente.stockRestante = tanqueActivoAceite.stockTanque;
        reporteExistente.estado = "REPORTADO";
        reporteExistente.comentario = "Tanque reportado nuevamente después de ser trabajado.";
        reporteExistente.detalle = registrosDelTanque.map(registro => ({ ...registro }));
    } else {
        const nuevoReporte = {
            idReporte: generarId(),
            idTanque: tanqueActivoAceite.idTanque || "SIN-ID",
            numeroTanque: tanqueActivoAceite.numeroTanque,
            nombreAceite: tanqueActivoAceite.nombreAceite || "DURON",
            fechaReporte: obtenerFechaHoyISO(),
            cuartilloTotalTanque: tanqueActivoAceite.cuartilloTotalTanque,
            cuartilloUsadoTotal: cuartillosUsados,
            cuartilloRestante: cuartillosRestantes,
            stockRestante: tanqueActivoAceite.stockTanque,
            estado: "REPORTADO",
            comentario: "Tanque reportado desde el módulo Rendimiento de Aceite.",
            detalle: registrosDelTanque.map(registro => ({ ...registro }))
        };

        listaReportes.unshift(nuevoReporte);
    }

    localStorage.removeItem("idReporteReactivadoActivo");
    localStorage.setItem("reportesTanqueAceite", JSON.stringify(listaReportes));

    registrosAceite = registrosAceite.filter(registro => {
        return Number(registro.numeroTanque) !== numeroTanqueActivo;
    });

    guardarRegistrosAceite();

    tanqueActivoAceite.estado = "REPORTADO";
    localStorage.setItem("tanqueActivoAceite", JSON.stringify(tanqueActivoAceite));

    cargarTablaRendimientoAceite();
    actualizarTarjetasAceite();
    limpiarFormularioAceite();

    actualizarTanqueCompraComoReportado(tanqueActivoAceite.idTanque);
    alert("Reporte enviado correctamente al módulo Reporte de Tanque.");

    window.location.href = "reporte-tanque.html";
}
/* ======================================================
   LIMPIAR FORMULARIO
====================================================== */

function limpiarFormularioAceite() {
    cantidadFueEditadaManual = false;
    kmAnteriorFueEditadoManual = false;
    idRegistroEditando = null;

    document.getElementById("ficha").value = "";
    document.getElementById("tipoGuagua").value = "";
    document.getElementById("tipoMantenimiento").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("kmAnterior").value = "";
    document.getElementById("kmActual").value = "";
    document.getElementById("kmTotal").value = "";
    document.getElementById("comentario").value = "";

    const btnGuardar = document.getElementById("btnGuardarConsumo");
    const btnCancelar = document.getElementById("btnCancelarEdicion");

    if (btnGuardar) {
        btnGuardar.textContent = "Guardar consumo";
    }

    if (btnCancelar) {
        btnCancelar.style.display = "none";
    }

    ocultarPanelFichaNueva();

    const fechaActual = document.getElementById("fechaActual");

    if (fechaActual) {
        fechaActual.value = obtenerFechaHoyISO();
    }
}

/* ======================================================
   UTILIDADES
====================================================== */

function normalizarTexto(texto) {
    return String(texto || "").trim().toUpperCase();
}

function formatearNumero(valor) {
    return Number(valor || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatearFecha(fechaISO) {
    if (!fechaISO) {
        return "";
    }

    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function generarId() {
    return "ID-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
}

function actualizarTanqueCompraComoReportado(idTanque) {
    let inventarioTanquesAceite = JSON.parse(localStorage.getItem("inventarioTanquesAceite")) || [];

    const tanque = inventarioTanquesAceite.find(item => {
        return String(item.idTanque).toUpperCase() === String(idTanque).toUpperCase();
    });

    if (tanque) {
        tanque.estado = "REPORTADO";
        tanque.fechaReporte = obtenerFechaHoyISO();
    }

    localStorage.setItem("inventarioTanquesAceite", JSON.stringify(inventarioTanquesAceite));
}