let compras = [
    { fecha: "2026-03-04", precio: 200.80, galones: 3000 },
    { fecha: "2026-03-06", precio: 198.80, galones: 2000 },
    { fecha: "2026-03-12", precio: 198.80, galones: 3000 },
    { fecha: "2026-03-14", precio: 203.80, galones: 2000 },
    { fecha: "2026-03-19", precio: 203.80, galones: 3000 }
];

document.addEventListener("DOMContentLoaded", function () {
    renderizarCompras();
    calcularTodo();

    const mes = document.getElementById("mes");

    if (mes) {
        mes.addEventListener("change", actualizarMeses);
    }

    actualizarListaCortesGuardados();
    calcularTodo();
     activarFormatoCamposMovimiento();
    formatearCamposMovimientoIniciales();
});


function renderizarCompras() {
    const tbody = document.getElementById("tbodyCompras");
    tbody.innerHTML = "";

    compras.forEach((compra, index) => {
        const total = compra.precio * compra.galones;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <input type="date" value="${compra.fecha}" onchange="actualizarCompra(${index}, 'fecha', this.value)">
            </td>

            <td>
                <input type="text" value="${formatoNumero(compra.precio)}"
                onchange="actualizarCompra(${index}, 'precio', this.value)">
            </td>

            <td>
                <input type="text" value="${formatoNumero(compra.galones)}"
                onchange="actualizarCompra(${index}, 'galones', this.value)">
            </td>

            <td>${formatoDinero(total)}</td>

            <td class="btn-no-pdf">
                <button class="accion-btn" onclick="editarCompra(${index})">✏️</button>
                <button class="accion-btn" onclick="eliminarCompra(${index})">🗑️</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    calcularTodo();
}

function agregarCompra() {
    compras.push({
        fecha: "",
        precio: 0,
        galones: 0
    });

    renderizarCompras();
}

function actualizarCompra(index, campo, valor) {
    if (campo === "precio" || campo === "galones") {
        compras[index][campo] = convertirNumero(valor);
    } else {
        compras[index][campo] = valor;
    }

    renderizarCompras();
}

function editarCompra(index) {
    alert("Puedes editar directamente los campos de la fila.");
}

function eliminarCompra(index) {
    compras.splice(index, 1);
    renderizarCompras();
}

function calcularTodo() {
    const totalGalones = compras.reduce((acc, c) => {
        return acc + convertirNumero(c.galones);
    }, 0);

    const totalDinero = compras.reduce((acc, c) => {
        return acc + convertirNumero(c.precio) * convertirNumero(c.galones);
    }, 0);

    const precioPromedio = totalGalones > 0 ? totalDinero / totalGalones : 0;

    // Resumen de compras
    ponerTexto("totalGalonesComprados", formatoGalones(totalGalones));
    ponerTexto("totalDineroComprado", formatoDinero(totalDinero));
    ponerTexto("precioPromedio", formatoDinero(precioPromedio));

    // Cantidades del movimiento
    const cierreAnteriorGL = obtenerValorNumero("cierreAnteriorGL");
    const calibracionGL = obtenerValorNumero("calibracionGL");
    const consumoGL = obtenerValorNumero("consumoGL");
    const emergenciaGL = obtenerValorNumero("emergenciaGL");
    const cierreActualGL = obtenerValorNumero("cierreActualGL");
    const disponibleGL = obtenerValorNumero("disponibleGL");

    // Aquí está la lógica correcta:
    // VALOR = CANTIDAD * PRECIO PROMEDIO UNITARIO
    const cierreAnteriorRD = cierreAnteriorGL * precioPromedio;
    const calibracionRD = calibracionGL * precioPromedio;
    const consumoRD = consumoGL * precioPromedio;
    const emergenciaRD = emergenciaGL * precioPromedio;
    const cierreActualRD = cierreActualGL * precioPromedio;
    const disponibleRD = disponibleGL * precioPromedio;

    const diferenciaGL = disponibleGL - cierreActualGL;
    const diferenciaRD = diferenciaGL * precioPromedio;

    // Pintar movimiento
    ponerTexto("tdCierreAnteriorRD", formatoDinero(cierreAnteriorRD));

    ponerTexto("tdComprasMesGL", formatoGalones(totalGalones));
    ponerTexto("tdComprasMesRD", formatoDinero(totalDinero));

    ponerTexto("tdCalibracionRD", formatoDinero(calibracionRD));
    ponerTexto("tdConsumoRD", formatoDinero(consumoRD));
    ponerTexto("tdEmergenciaRD", formatoDinero(emergenciaRD));
    ponerTexto("tdCierreActualRD", formatoDinero(cierreActualRD));
    ponerTexto("tdDisponibleRD", formatoDinero(disponibleRD));

    ponerTexto("tdDiferenciaGL", formatoGalones(diferenciaGL));
    ponerTexto("tdDiferenciaRD", formatoDinero(diferenciaRD));
    ponerTexto("tdPrecioPromedioMes", formatoDinero(precioPromedio));

    actualizarMeses();
}



function actualizarMeses() {
    const mes = document.getElementById("mes").value;

    const meses = [
        "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
        "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    const index = meses.indexOf(mes);
    const mesAnterior = index > 0 ? meses[index - 1] : "DICIEMBRE";

    document.getElementById("mesAnteriorTexto").textContent = mesAnterior;
    document.getElementById("mesActualTexto1").textContent = mes;
    document.getElementById("mesActualTexto2").textContent = mes;
    document.getElementById("mesActualTexto3").textContent = mes;
}

function seleccionarImagen(idInput) {
    document.getElementById(idInput).click();
}

function mostrarImagen(event, idPreview) {
    const archivo = event.target.files[0];

    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        comprimirImagen(e.target.result, 1400, 0.80, function (imagenComprimida) {
            const preview = document.getElementById(idPreview);

            preview.innerHTML = `
                <img src="${imagenComprimida}" alt="Evidencia" onclick="abrirModalImagen(this.src)">
                <button class="delete-img btn-no-pdf" onclick="eliminarImagen('${idPreview}')">🗑️</button>
            `;
        });
    };

    reader.readAsDataURL(archivo);
}

function abrirModalImagen(src) {
    const modal = document.getElementById("modalImagen");
    const imagen = document.getElementById("imagenGrande");

    if (!modal || !imagen) return;

    imagen.src = src;
    modal.classList.add("activo");
}

function cerrarModalImagen() {
    const modal = document.getElementById("modalImagen");
    const imagen = document.getElementById("imagenGrande");

    if (!modal || !imagen) return;

    modal.classList.remove("activo");
    imagen.src = "";
}

function comprimirImagen(src, maxWidth, calidad, callback) {
    const img = new Image();

    img.onload = function () {
        const canvas = document.createElement("canvas");

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", calidad);

        callback(dataUrl);
    };

    img.src = src;
}

function eliminarImagen(idPreview) {
    document.getElementById(idPreview).innerHTML = "";
}

function vistaPreviaPDF() {
    window.print();
}









function dibujarTablaSimple(pdf, filas, x, y, anchos) {
    const altoFila = 8;

    pdf.setFontSize(10);

    filas.forEach(fila => {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(x, y, anchos[0], altoFila, "F");
        pdf.rect(x + anchos[0], y, anchos[1], altoFila, "F");

        pdf.setDrawColor(226, 232, 240);
        pdf.rect(x, y, anchos[0], altoFila);
        pdf.rect(x + anchos[0], y, anchos[1], altoFila);

        pdf.setFont("helvetica", "bold");
        pdf.text(String(fila[0]), x + 2, y + 5.4);

        pdf.setFont("helvetica", "normal");
        pdf.text(String(fila[1]), x + anchos[0] + 2, y + 5.4);

        y += altoFila;
    });

    return y;
}

function dibujarTablaMovimientoPDF(pdf, filas, x, y) {
    const anchos = [88, 42, 52];
    const altoFila = 8;

    pdf.setFontSize(9);

    // Encabezado
    pdf.setFillColor(7, 20, 38);
    pdf.rect(x, y, anchos[0], altoFila, "F");
    pdf.rect(x + anchos[0], y, anchos[1], altoFila, "F");
    pdf.rect(x + anchos[0] + anchos[1], y, anchos[2], altoFila, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.text("CONCEPTO", x + 2, y + 5.3);
    pdf.text("CANTIDAD (GL)", x + anchos[0] + 2, y + 5.3);
    pdf.text("VALOR (RD$)", x + anchos[0] + anchos[1] + 2, y + 5.3);

    pdf.setTextColor(0, 0, 0);
    y += altoFila;

    filas.forEach(fila => {
        const concepto = fila[0];

        if (concepto.includes("GL disponible")) {
            pdf.setFillColor(220, 252, 231);
        } else if (concepto.includes("Diferencia")) {
            pdf.setFillColor(254, 226, 226);
        } else if (concepto.includes("Precio promedio")) {
            pdf.setFillColor(255, 247, 204);
        } else {
            pdf.setFillColor(255, 255, 255);
        }

        pdf.rect(x, y, anchos[0], altoFila, "F");
        pdf.rect(x + anchos[0], y, anchos[1], altoFila, "F");
        pdf.rect(x + anchos[0] + anchos[1], y, anchos[2], altoFila, "F");

        pdf.setDrawColor(226, 232, 240);
        pdf.rect(x, y, anchos[0], altoFila);
        pdf.rect(x + anchos[0], y, anchos[1], altoFila);
        pdf.rect(x + anchos[0] + anchos[1], y, anchos[2], altoFila);

        pdf.setFont("helvetica", "bold");
        pdf.text(String(fila[0]), x + 2, y + 5.3);
        pdf.text(String(fila[1]), x + anchos[0] + 2, y + 5.3);
        pdf.text(String(fila[2]), x + anchos[0] + anchos[1] + 2, y + 5.3);

        y += altoFila;
    });

    return y;
}

function agregarImagenGrandeEnPDF(pdf, src, yInicial, margen, pageWidth, pageHeight) {
    return new Promise(resolve => {
        const img = new Image();

        img.onload = function () {
            try {
                const formato = src.includes("image/png") ? "PNG" : "JPEG";

                const maxWidth = pageWidth - margen * 2;
                const maxHeight = pageHeight - yInicial - 12;

                const escala = Math.min(maxWidth / img.width, maxHeight / img.height);

                const finalWidth = img.width * escala;
                const finalHeight = img.height * escala;

                const x = (pageWidth - finalWidth) / 2;

                pdf.addImage(src, formato, x, yInicial, finalWidth, finalHeight);
            } catch (error) {
                console.error("Error agregando imagen al PDF:", error);
            }

            resolve();
        };

        img.onerror = function () {
            console.warn("No se pudo cargar una imagen para el PDF.");
            resolve();
        };

        img.src = src;
    });
}
function ponerTexto(id, texto) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = texto;
    }
}

function obtenerValorNumero(id) {
    const elemento = document.getElementById(id);

    if (!elemento) {
        return 0;
    }

    return convertirNumero(elemento.value);
}

function convertirNumero(valor) {
    let texto = String(valor || "0")
        .replaceAll("RD$", "")
        .replaceAll("GL", "")
        .replaceAll(",", "")
        .replaceAll("$", "")
        .trim();

    const numero = parseFloat(texto);

    return isNaN(numero) ? 0 : numero;
}

function formatoNumero(valor) {
    return convertirNumero(valor).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatoGalones(valor) {
    return formatoNumero(valor) + " GL";
}

function formatoDinero(valor) {
    return "RD$ " + formatoNumero(valor);
}

function valorCampo(id) {
    const elemento = document.getElementById(id);

    if (!elemento) {
        return "";
    }

    return elemento.value;
}



function guardarCorte() {
    try {
        calcularTodo();

        const datos = obtenerDatosDelCorte();
        const clave = crearClaveCorte(datos);

        localStorage.setItem(clave, JSON.stringify(datos));

        let lista = JSON.parse(localStorage.getItem("lista_cortes_combustible") || "[]");

        if (!lista.includes(clave)) {
            lista.push(clave);
        }

        localStorage.setItem("lista_cortes_combustible", JSON.stringify(lista));

        actualizarListaCortesGuardados();

        alert("Corte guardado correctamente:\n\n" + datos.empresa + " - " + datos.mes + " " + datos.anio);

    } catch (error) {
        console.error("Error guardando corte:", error);

        alert(
            "No se pudo guardar el corte.\n\n" +
            "Error real: " + error.message + "\n\n" +
            "Si subiste imágenes muy pesadas, prueba guardar sin imágenes primero."
        );
    }
}

function crearClaveCorte(datos) {
    return "corte_combustible_" +
        limpiarTextoClave(datos.empresa) + "_" +
        limpiarTextoClave(datos.mes) + "_" +
        limpiarTextoClave(datos.anio);
}

function limpiarTextoClave(texto) {
    return String(texto || "")
        .replaceAll(" ", "_")
        .replaceAll("/", "_")
        .replaceAll("-", "_")
        .toUpperCase();
}

function actualizarListaCortesGuardados() {
    const select = document.getElementById("listaCortesGuardados");

    if (!select) return;

    const lista = JSON.parse(localStorage.getItem("lista_cortes_combustible") || "[]");

    select.innerHTML = "";

    if (lista.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No hay cortes guardados";
        select.appendChild(option);
        return;
    }

    lista.forEach(clave => {
        const datosTexto = localStorage.getItem(clave);

        if (!datosTexto) return;

        const datos = JSON.parse(datosTexto);

        const option = document.createElement("option");
        option.value = clave;
        option.textContent = datos.empresa + " - " + datos.mes + " " + datos.anio + " | " + datos.fechaReporte;

        select.appendChild(option);
    });
}

function cargarCorteSeleccionado() {
    const select = document.getElementById("listaCortesGuardados");

    if (!select || !select.value) {
        alert("Selecciona un corte guardado.");
        return;
    }

    const datosTexto = localStorage.getItem(select.value);

    if (!datosTexto) {
        alert("No se encontró el corte guardado.");
        return;
    }

    const datos = JSON.parse(datosTexto);

    aplicarDatosCorte(datos);

    alert("Corte cargado correctamente.");
}

function eliminarCorteSeleccionado() {
    const select = document.getElementById("listaCortesGuardados");

    if (!select || !select.value) {
        alert("Selecciona un corte para eliminar.");
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar este corte guardado?")) {
        return;
    }

    const clave = select.value;

    localStorage.removeItem(clave);

    let lista = JSON.parse(localStorage.getItem("lista_cortes_combustible") || "[]");
    lista = lista.filter(item => item !== clave);

    localStorage.setItem("lista_cortes_combustible", JSON.stringify(lista));

    actualizarListaCortesGuardados();

    alert("Corte eliminado correctamente.");
}

function obtenerDatosDelCorte() {
    return {
        mes: document.getElementById("mes").value,
        anio: document.getElementById("anio").value,
        empresa: document.getElementById("empresa").value,
        fechaReporte: document.getElementById("fechaReporte").value,
        responsable: document.getElementById("responsable").value,
        comentarioGeneral: document.getElementById("comentarioGeneral").value,
        notasAdicionales: document.getElementById("notasAdicionales").value,

        compras: compras,

        movimiento: {
            cierreAnteriorGL: obtenerValorNumero("cierreAnteriorGL"),
            cierreAnteriorRD: obtenerValorNumero("cierreAnteriorRD"),
            calibracionGL: obtenerValorNumero("calibracionGL"),
            calibracionRD: obtenerValorNumero("calibracionRD"),
            consumoGL: obtenerValorNumero("consumoGL"),
            consumoRD: obtenerValorNumero("consumoRD"),
            emergenciaGL: obtenerValorNumero("emergenciaGL"),
            emergenciaRD: obtenerValorNumero("emergenciaRD"),
            cierreActualGL: obtenerValorNumero("cierreActualGL"),
            cierreActualRD: obtenerValorNumero("cierreActualRD"),
            disponibleGL: obtenerValorNumero("disponibleGL"),
            disponibleRD: obtenerValorNumero("disponibleRD")
        },

        evidencias: obtenerEvidencias()
    };
}

function aplicarDatosCorte(datos) {
    document.getElementById("mes").value = datos.mes;
    document.getElementById("anio").value = datos.anio;
    document.getElementById("empresa").value = datos.empresa;
    document.getElementById("fechaReporte").value = datos.fechaReporte;
    document.getElementById("responsable").value = datos.responsable;
    document.getElementById("comentarioGeneral").value = datos.comentarioGeneral || "";
    document.getElementById("notasAdicionales").value = datos.notasAdicionales || "";

    compras = datos.compras || [];

    document.getElementById("cierreAnteriorGL").value = datos.movimiento.cierreAnteriorGL;
    document.getElementById("cierreAnteriorRD").value = datos.movimiento.cierreAnteriorRD;
    document.getElementById("calibracionGL").value = datos.movimiento.calibracionGL;
    document.getElementById("calibracionRD").value = datos.movimiento.calibracionRD;
    document.getElementById("consumoGL").value = datos.movimiento.consumoGL;
    document.getElementById("consumoRD").value = datos.movimiento.consumoRD;
    document.getElementById("emergenciaGL").value = datos.movimiento.emergenciaGL;
    document.getElementById("emergenciaRD").value = datos.movimiento.emergenciaRD;
    document.getElementById("cierreActualGL").value = datos.movimiento.cierreActualGL;
    document.getElementById("cierreActualRD").value = datos.movimiento.cierreActualRD;
    document.getElementById("disponibleGL").value = datos.movimiento.disponibleGL;
    document.getElementById("disponibleRD").value = datos.movimiento.disponibleRD;

    limpiarPreviewsEvidencias();

    if (datos.evidencias) {
        datos.evidencias.forEach(evidencia => {
            const preview = document.getElementById(evidencia.preview);

            if (preview && evidencia.src) {
                preview.innerHTML = `
                    <img src="${evidencia.src}" alt="Evidencia">
                    <button class="delete-img btn-no-pdf" onclick="eliminarImagen('${evidencia.preview}')">🗑️</button>
                `;
            }
        });
    }

    renderizarCompras();
    calcularTodo();
}

function limpiarPreviewsEvidencias() {
    const ids = [
        "previewOdoo",
        "previewPiusiMes",
        "previewPiusiSiguiente",
        "previewTanque",
        "previewOtra"
    ];

    ids.forEach(id => {
        const div = document.getElementById(id);
        if (div) div.innerHTML = "";
    });
}

function obtenerEvidencias() {
    const evidencias = [
        {
            titulo: "Valoración de Stock (Odoo)",
            preview: "previewOdoo"
        },
        {
            titulo: "PIUSI - Consumo del Mes",
            preview: "previewPiusiMes"
        },
        {
            titulo: "PIUSI - Primer día del Mes Siguiente",
            preview: "previewPiusiSiguiente"
        },
        {
            titulo: "Medición Física del Tanque",
            preview: "previewTanque"
        },
        {
            titulo: "Otras Evidencias",
            preview: "previewOtra"
        }
    ];

    return evidencias.map(item => {
        const preview = document.getElementById(item.preview);
        const img = preview ? preview.querySelector("img") : null;

        return {
            titulo: item.titulo,
            preview: item.preview,
            src: img ? img.src : ""
        };
    }).filter(item => item.src !== "");
}

async function generarPDF() {
    try {
        if (typeof window.jspdf === "undefined") {
            alert("No se cargó la librería jsPDF. Revisa la conexión en el HTML.");
            return;
        }

        calcularTodo();

        const datos = obtenerDatosDelCorte();
        const { jsPDF } = window.jspdf;

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margen = 12;

    let y = 14;

    // Título
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Reporte de Combustible - Corte de Mes", margen, y);

    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Registro y control del movimiento mensual de combustible.", margen, y);

    y += 7;

    pdf.setDrawColor(220, 220, 220);
    pdf.line(margen, y, pageWidth - margen, y);

    y += 8;

    // Información general
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("1. Información General", margen, y);

    y += 7;

    const infoGeneral = [
        ["Mes", datos.mes],
        ["Año", datos.anio],
        ["Empresa / Área", datos.empresa],
        ["Fecha del Reporte", datos.fechaReporte],
        ["Responsable", datos.responsable]
    ];

    y = dibujarTablaSimple(pdf, infoGeneral, margen, y, [55, 125]);

    if (datos.comentarioGeneral && datos.comentarioGeneral.trim() !== "") {
        y += 5;

        pdf.setFont("helvetica", "bold");
        pdf.text("Comentario General:", margen, y);

        y += 5;

        pdf.setFont("helvetica", "normal");
        const texto = pdf.splitTextToSize(datos.comentarioGeneral, pageWidth - margen * 2);
        pdf.text(texto, margen, y);

        y += texto.length * 5 + 5;
    }

    y += 5;

    // Resumen compras
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("2. Resumen de Compras", margen, y);

    y += 7;

    const totalGalones = compras.reduce((acc, c) => acc + convertirNumero(c.galones), 0);
    const totalDinero = compras.reduce((acc, c) => acc + convertirNumero(c.precio) * convertirNumero(c.galones), 0);
    const precioPromedio = totalGalones > 0 ? totalDinero / totalGalones : 0;

    const resumenCompras = [
        ["Total galones comprados", formatoNumero(totalGalones) + " GL"],
        ["Total en dinero comprado", formatoDinero(totalDinero)],
        ["Precio promedio unitario", formatoNumero(precioPromedio) + " RD$"]
    ];

    y = dibujarTablaSimple(pdf, resumenCompras, margen, y, [75, 105]);

    y += 8;

    // Movimiento
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("3. Movimiento del Combustible", margen, y);

    y += 7;

    const mov = datos.movimiento;

    const diferenciaGL = mov.disponibleGL - mov.cierreActualGL;
    const diferenciaRD = mov.disponibleRD - mov.cierreActualRD;

    const tablaMovimiento = [
        ["Cierre mes anterior", formatoNumero(mov.cierreAnteriorGL) + " GL", formatoDinero(mov.cierreAnteriorRD)],
        ["Compras del mes", formatoNumero(totalGalones) + " GL", formatoDinero(totalDinero)],
        ["Calibración / mantenimiento", formatoNumero(mov.calibracionGL) + " GL", formatoDinero(mov.calibracionRD)],
        ["Consumo del mes", formatoNumero(mov.consumoGL) + " GL", formatoDinero(mov.consumoRD)],
        ["Uso bomba emergencia", formatoNumero(mov.emergenciaGL) + " GL", formatoDinero(mov.emergenciaRD)],
        ["Cierre mes actual", formatoNumero(mov.cierreActualGL) + " GL", formatoDinero(mov.cierreActualRD)],
        ["GL disponible / cierre según OP", formatoNumero(mov.disponibleGL) + " GL", formatoDinero(mov.disponibleRD)],
        ["Diferencia cierre vs disponible", formatoNumero(diferenciaGL) + " GL", formatoDinero(diferenciaRD)],
        ["Precio promedio unitario del mes", "", formatoNumero(precioPromedio) + " RD$"]
    ];

    y = dibujarTablaMovimientoPDF(pdf, tablaMovimiento, margen, y);

    if (datos.notasAdicionales && datos.notasAdicionales.trim() !== "") {
        y += 8;

        if (y > pageHeight - 40) {
            pdf.addPage();
            y = 14;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("4. Notas Adicionales", margen, y);

        y += 6;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        const notas = pdf.splitTextToSize(datos.notasAdicionales, pageWidth - margen * 2);
        pdf.text(notas, margen, y);
    }

    // Evidencias: una imagen por página
    for (let i = 0; i < datos.evidencias.length; i++) {
        const evidencia = datos.evidencias[i];

        pdf.addPage();

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);
        pdf.text("Evidencia " + (i + 1) + ": " + evidencia.titulo, margen, 15);

        pdf.setDrawColor(220, 220, 220);
        pdf.line(margen, 20, pageWidth - margen, 20);

        await agregarImagenGrandeEnPDF(pdf, evidencia.src, 26, margen, pageWidth, pageHeight);
    }

    const nombreArchivo = "Reporte_Combustible_" +
        limpiarTextoClave(datos.empresa) + "_" +
        limpiarTextoClave(datos.mes) + "_" +
        limpiarTextoClave(datos.anio) + ".pdf";

    pdf.save(nombreArchivo);

            alert("PDF generado correctamente.");

    } catch (error) {
        console.error("Error generando PDF:", error);
        alert("Error generando PDF:\n\n" + error.message);
    }
}

function dibujarTablaSimple(pdf, filas, x, y, anchos) {
    const altoFila = 8;

    pdf.setFontSize(10);

    filas.forEach(fila => {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(x, y, anchos[0], altoFila, "F");
        pdf.rect(x + anchos[0], y, anchos[1], altoFila, "F");

        pdf.setDrawColor(226, 232, 240);
        pdf.rect(x, y, anchos[0], altoFila);
        pdf.rect(x + anchos[0], y, anchos[1], altoFila);

        pdf.setFont("helvetica", "bold");
        pdf.text(String(fila[0]), x + 2, y + 5.4);

        pdf.setFont("helvetica", "normal");
        pdf.text(String(fila[1]), x + anchos[0] + 2, y + 5.4);

        y += altoFila;
    });

    return y;
}

function dibujarTablaMovimientoPDF(pdf, filas, x, y) {
    const anchos = [88, 42, 52];
    const altoFila = 8;

    pdf.setFontSize(9);

    pdf.setFillColor(7, 20, 38);
    pdf.rect(x, y, anchos[0], altoFila, "F");
    pdf.rect(x + anchos[0], y, anchos[1], altoFila, "F");
    pdf.rect(x + anchos[0] + anchos[1], y, anchos[2], altoFila, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.text("CONCEPTO", x + 2, y + 5.3);
    pdf.text("CANTIDAD (GL)", x + anchos[0] + 2, y + 5.3);
    pdf.text("VALOR (RD$)", x + anchos[0] + anchos[1] + 2, y + 5.3);

    pdf.setTextColor(0, 0, 0);
    y += altoFila;

    filas.forEach(fila => {
        const concepto = fila[0];

        if (concepto.includes("GL disponible")) {
            pdf.setFillColor(220, 252, 231);
        } else if (concepto.includes("Diferencia")) {
            pdf.setFillColor(254, 226, 226);
        } else if (concepto.includes("Precio promedio")) {
            pdf.setFillColor(255, 247, 204);
        } else {
            pdf.setFillColor(255, 255, 255);
        }

        pdf.rect(x, y, anchos[0], altoFila, "F");
        pdf.rect(x + anchos[0], y, anchos[1], altoFila, "F");
        pdf.rect(x + anchos[0] + anchos[1], y, anchos[2], altoFila, "F");

        pdf.setDrawColor(226, 232, 240);
        pdf.rect(x, y, anchos[0], altoFila);
        pdf.rect(x + anchos[0], y, anchos[1], altoFila);
        pdf.rect(x + anchos[0] + anchos[1], y, anchos[2], altoFila);

        pdf.setFont("helvetica", "bold");
        pdf.text(String(fila[0]), x + 2, y + 5.3);
        pdf.text(String(fila[1]), x + anchos[0] + 2, y + 5.3);
        pdf.text(String(fila[2]), x + anchos[0] + anchos[1] + 2, y + 5.3);

        y += altoFila;
    });

    return y;
}

function agregarImagenGrandeEnPDF(pdf, src, yInicial, margen, pageWidth, pageHeight) {
    return new Promise(resolve => {
        const img = new Image();

        img.onload = function () {
            const formato = src.includes("image/png") ? "PNG" : "JPEG";

            const maxWidth = pageWidth - margen * 2;
            const maxHeight = pageHeight - yInicial - 12;

            const escala = Math.min(maxWidth / img.width, maxHeight / img.height);

            const finalWidth = img.width * escala;
            const finalHeight = img.height * escala;

            const x = (pageWidth - finalWidth) / 2;

            pdf.addImage(src, formato, x, yInicial, finalWidth, finalHeight);

            resolve();
        };

        img.onerror = function () {
            resolve();
        };

        img.src = src;
    });
}

function activarFormatoCamposMovimiento() {
    const campos = [
        "cierreAnteriorGL",
        "cierreAnteriorRD",
        "calibracionGL",
        "calibracionRD",
        "consumoGL",
        "consumoRD",
        "emergenciaGL",
        "emergenciaRD",
        "cierreActualGL",
        "cierreActualRD",
        "disponibleGL",
        "disponibleRD"
    ];

    campos.forEach(id => {
        const campo = document.getElementById(id);

        if (!campo) return;

        campo.addEventListener("focus", function () {
            this.select();
        });

        campo.addEventListener("blur", function () {
            this.value = formatoNumero(this.value);
            calcularTodo();
        });
    });
}

function formatearCamposMovimientoIniciales() {
    const campos = [
        "cierreAnteriorGL",
        "cierreAnteriorRD",
        "calibracionGL",
        "calibracionRD",
        "consumoGL",
        "consumoRD",
        "emergenciaGL",
        "emergenciaRD",
        "cierreActualGL",
        "cierreActualRD",
        "disponibleGL",
        "disponibleRD"
    ];

    campos.forEach(id => {
        const campo = document.getElementById(id);

        if (campo) {
            campo.value = formatoNumero(campo.value);
        }
    });
}







