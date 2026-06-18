/* ===============================
   SOPORTE DEL MENÚ LATERAL
================================ */

if (typeof window.toggleSidebar !== "function") {
    window.toggleSidebar = function () {
        const sidebar = document.getElementById("sidebar");

        if (sidebar) {
            sidebar.classList.toggle("cerrado");
        }
    };
}

function moduloProximamente(nombreModulo) {
    alert("El módulo de " + nombreModulo + " se agregará después.");
}

/* ===============================
   CONFIGURACIÓN
================================ */

const STORAGE_KEY = "SHEILA_MODULO_GOMAS_PRUEBA";

const posiciones = ["DLH", "DRH", "TLH", "TRH"];

const marcasGomas = [
    "Bridgestone",
    "Michelin",
    "Goodyear",
    "Dunlop",
    "Hankook",
    "Yokohama",
    "Continental",
    "Pirelli",
    "Firestone",
    "Triangle",
    "LingLong",
    "Double Coin"
];

let dataGomas = cargarDataLocal();

/* ===============================
   INICIO
================================ */

document.addEventListener("DOMContentLoaded", function () {
    iniciarModuloGomas();
});

function iniciarModuloGomas() {
    document.getElementById("txtFechaHoy").value = fechaHoyISO();

    cargarCombosMarcas();
    cargarListaFichas();
    cargarReporte();
    actualizarResumen();

    document.getElementById("btnBuscar").addEventListener("click", buscarFicha);
    document.getElementById("btnGuardarKm").addEventListener("click", guardarKmActual);
    document.getElementById("btnAgregar").addEventListener("click", agregarFicha);
    document.getElementById("btnEditar").addEventListener("click", editarFicha);
    document.getElementById("btnActualizarTodo").addEventListener("click", actualizarTodo);
    document.getElementById("btnLimpiar").addEventListener("click", limpiarFormulario);
    document.getElementById("btnEliminar").addEventListener("click", eliminarFicha);
    document.getElementById("btnReporte").addEventListener("click", function () {
        document.getElementById("panelReporteGomas").scrollIntoView({
            behavior: "smooth"
        });
    });

    document.getElementById("txtBuscarReporte").addEventListener("input", cargarReporte);
    document.getElementById("txtKmActual").addEventListener("input", recalcularRecorridos);

    posiciones.forEach(function (pos) {
        document.getElementById("km_" + pos).addEventListener("input", recalcularRecorridos);
    });
}

/* ===============================
   DATA LOCAL SIN BASE DE DATOS
================================ */

function cargarDataLocal() {
    const guardado = localStorage.getItem(STORAGE_KEY);

    if (guardado) {
        return JSON.parse(guardado);
    }

    const demo = {
        "T-001": {
            ficha: "T-001",
            kmActual: 245000,
            estado: "ACTIVO",
            fechaRegistro: fechaHoyISO(),
            piezas: {
                DLH: {
                    marca: "Bridgestone",
                    fecha: "2026-05-01",
                    kmInicial: 210000,
                    comentario: "Goma delantera izquierda en buen estado."
                },
                DRH: {
                    marca: "Michelin",
                    fecha: "2026-05-01",
                    kmInicial: 212000,
                    comentario: "Desgaste normal."
                },
                TLH: {
                    marca: "Goodyear",
                    fecha: "2026-04-20",
                    kmInicial: 200000,
                    comentario: "Revisar desgaste lateral."
                },
                TRH: {
                    marca: "Bridgestone",
                    fecha: "2026-04-20",
                    kmInicial: 205000,
                    comentario: "En observación."
                }
            }
        },
        "T-002": {
            ficha: "T-002",
            kmActual: 180500,
            estado: "ACTIVO",
            fechaRegistro: fechaHoyISO(),
            piezas: {
                DLH: {
                    marca: "Dunlop",
                    fecha: "2026-03-15",
                    kmInicial: 155000,
                    comentario: "Instalada en mantenimiento preventivo."
                },
                DRH: {
                    marca: "Dunlop",
                    fecha: "2026-03-15",
                    kmInicial: 155000,
                    comentario: "Instalada en mantenimiento preventivo."
                },
                TLH: {
                    marca: "Hankook",
                    fecha: "2026-02-10",
                    kmInicial: 140000,
                    comentario: "Verificar presión semanal."
                },
                TRH: {
                    marca: "Hankook",
                    fecha: "2026-02-10",
                    kmInicial: 140000,
                    comentario: "Verificar presión semanal."
                }
            }
        }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    return demo;
}

function guardarDataLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataGomas));
}

/* ===============================
   COMBOS
================================ */

function cargarCombosMarcas() {
    posiciones.forEach(function (pos) {
        const combo = document.getElementById("marca_" + pos);

        combo.innerHTML = "";

        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = "Seleccione la marca";
        combo.appendChild(opcionInicial);

        marcasGomas.forEach(function (marca) {
            const option = document.createElement("option");
            option.value = marca;
            option.textContent = marca;
            combo.appendChild(option);
        });
    });
}

function cargarListaFichas() {
    const lista = document.getElementById("listaFichas");

    lista.innerHTML = "";

    Object.keys(dataGomas).forEach(function (ficha) {
        const option = document.createElement("option");
        option.value = ficha;
        lista.appendChild(option);
    });
}

/* ===============================
   BUSCAR
================================ */

function buscarFicha() {
    const ficha = obtenerFicha();

    if (ficha === "") {
        alert("Ingrese o seleccione una ficha.");
        return;
    }

    if (!dataGomas[ficha]) {
        alert("La ficha no existe. Puede agregarla con el botón AGREGAR.");
        return;
    }

    cargarFichaEnFormulario(ficha);
}

function cargarFichaEnFormulario(ficha) {
    const registro = dataGomas[ficha];

    document.getElementById("txtFicha").value = registro.ficha;
    document.getElementById("txtKmActual").value = registro.kmActual || "";

    posiciones.forEach(function (pos) {
        const pieza = registro.piezas[pos] || {};

        document.getElementById("marca_" + pos).value = pieza.marca || "";
        document.getElementById("fecha_" + pos).value = pieza.fecha || "";
        document.getElementById("km_" + pos).value = pieza.kmInicial || "";
        document.getElementById("com_" + pos).value = pieza.comentario || "";
    });

    recalcularRecorridos();
    actualizarResumen();
}

/* ===============================
   GUARDAR KM ACTUAL
================================ */

function guardarKmActual() {
    const ficha = obtenerFicha();
    const kmActual = obtenerKmActual();

    if (ficha === "") {
        alert("Seleccione una ficha.");
        return;
    }

    if (kmActual <= 0) {
        alert("Ingrese un KM actual válido.");
        return;
    }

    asegurarFicha(ficha);

    dataGomas[ficha].kmActual = kmActual;
    dataGomas[ficha].estado = "ACTIVO";

    guardarDataLocal();
    cargarListaFichas();
    cargarReporte();
    recalcularRecorridos();
    actualizarResumen();

    alert("KM actual guardado correctamente.");
}

/* ===============================
   AGREGAR
================================ */

function agregarFicha() {
    const ficha = obtenerFicha();

    if (ficha === "") {
        alert("Ingrese la ficha.");
        return;
    }

    if (dataGomas[ficha]) {
        alert("La ficha ya existe. Use EDITAR para modificarla.");
        return;
    }

    dataGomas[ficha] = crearRegistroDesdeFormulario(ficha);

    guardarDataLocal();
    cargarListaFichas();
    cargarReporte();
    actualizarResumen();

    alert("Ficha agregada correctamente.");
}

/* ===============================
   EDITAR
================================ */

function editarFicha() {
    const ficha = obtenerFicha();

    if (ficha === "") {
        alert("Seleccione una ficha.");
        return;
    }

    if (!dataGomas[ficha]) {
        alert("La ficha no existe. Use AGREGAR si es nueva.");
        return;
    }

    dataGomas[ficha] = crearRegistroDesdeFormulario(ficha);

    guardarDataLocal();
    cargarReporte();
    actualizarResumen();

    alert("Ficha editada correctamente.");
}

/* ===============================
   CREAR REGISTRO
================================ */

function crearRegistroDesdeFormulario(ficha) {
    const registro = {
        ficha: ficha,
        kmActual: obtenerKmActual(),
        estado: "ACTIVO",
        fechaRegistro: fechaHoyISO(),
        piezas: {}
    };

    posiciones.forEach(function (pos) {
        registro.piezas[pos] = {
            marca: document.getElementById("marca_" + pos).value,
            fecha: document.getElementById("fecha_" + pos).value,
            kmInicial: toNumber(document.getElementById("km_" + pos).value),
            comentario: document.getElementById("com_" + pos).value.trim()
        };
    });

    return registro;
}

/* ===============================
   GUARDAR UNA POSICIÓN
================================ */

function guardarPosicion(pos) {
    const ficha = obtenerFicha();
    const kmActual = obtenerKmActual();

    if (ficha === "") {
        alert("Seleccione una ficha.");
        return;
    }

    if (kmActual <= 0) {
        alert("Ingrese el KM actual antes de guardar la goma.");
        return;
    }

    const marca = document.getElementById("marca_" + pos).value;

    if (marca === "") {
        alert("Seleccione la marca de goma para " + pos + ".");
        return;
    }

    asegurarFicha(ficha);

    dataGomas[ficha].kmActual = kmActual;
    dataGomas[ficha].estado = "ACTIVO";

    dataGomas[ficha].piezas[pos] = {
        marca: marca,
        fecha: document.getElementById("fecha_" + pos).value || fechaHoyISO(),
        kmInicial: kmActual,
        comentario: document.getElementById("com_" + pos).value.trim()
    };

    document.getElementById("fecha_" + pos).value = dataGomas[ficha].piezas[pos].fecha;
    document.getElementById("km_" + pos).value = kmActual;
    document.getElementById("rec_" + pos).value = "0 KM";

    guardarDataLocal();
    cargarListaFichas();
    cargarReporte();
    actualizarResumen();

    alert("Posición " + pos + " actualizada correctamente.");
}

/* ===============================
   ACTUALIZAR TODO
================================ */

function actualizarTodo() {
    const ficha = obtenerFicha();
    const kmActual = obtenerKmActual();

    if (ficha === "") {
        alert("Seleccione una ficha.");
        return;
    }

    if (kmActual <= 0) {
        alert("Ingrese el KM actual.");
        return;
    }

    asegurarFicha(ficha);

    posiciones.forEach(function (pos) {
        const marca = document.getElementById("marca_" + pos).value;

        if (marca !== "") {
            dataGomas[ficha].piezas[pos] = {
                marca: marca,
                fecha: fechaHoyISO(),
                kmInicial: kmActual,
                comentario: document.getElementById("com_" + pos).value.trim()
            };

            document.getElementById("fecha_" + pos).value = fechaHoyISO();
            document.getElementById("km_" + pos).value = kmActual;
            document.getElementById("rec_" + pos).value = "0 KM";
        }
    });

    dataGomas[ficha].kmActual = kmActual;
    dataGomas[ficha].estado = "ACTIVO";

    guardarDataLocal();
    cargarReporte();
    actualizarResumen();

    alert("Todas las posiciones con marca fueron actualizadas.");
}

/* ===============================
   ELIMINAR LÓGICO
================================ */

function eliminarFicha() {
    const ficha = obtenerFicha();

    if (ficha === "") {
        alert("Seleccione una ficha.");
        return;
    }

    if (!dataGomas[ficha]) {
        alert("La ficha no existe.");
        return;
    }

    const confirmar = confirm("¿Seguro que desea marcar como eliminada la ficha " + ficha + "?");

    if (!confirmar) {
        return;
    }

    dataGomas[ficha].estado = "ELIMINADO";
    dataGomas[ficha].fechaEliminado = fechaHoyISO();

    posiciones.forEach(function (pos) {
        if (!dataGomas[ficha].piezas[pos]) {
            dataGomas[ficha].piezas[pos] = {};
        }

        dataGomas[ficha].piezas[pos].comentario =
            "Este artículo fue eliminado el " + fechaHoyTexto();
    });

    guardarDataLocal();
    cargarFichaEnFormulario(ficha);
    cargarReporte();

    alert("Ficha marcada como eliminada.");
}

/* ===============================
   LIMPIAR
================================ */

function limpiarFormulario() {
    document.getElementById("txtFicha").value = "";
    document.getElementById("txtKmActual").value = "";
    document.getElementById("txtFechaHoy").value = fechaHoyISO();

    posiciones.forEach(function (pos) {
        document.getElementById("marca_" + pos).value = "";
        document.getElementById("fecha_" + pos).value = "";
        document.getElementById("km_" + pos).value = "";
        document.getElementById("rec_" + pos).value = "";
        document.getElementById("com_" + pos).value = "";
    });

    actualizarResumen();
}

/* ===============================
   RECALCULAR KM RECORRIDO
================================ */

function recalcularRecorridos() {
    const kmActual = obtenerKmActual();

    posiciones.forEach(function (pos) {
        const kmInicial = toNumber(document.getElementById("km_" + pos).value);
        const salida = document.getElementById("rec_" + pos);

        if (kmActual > 0 && kmInicial > 0) {
            salida.value = formatoNumero(kmActual - kmInicial) + " KM";
        } else {
            salida.value = "";
        }
    });

    actualizarResumen();
}

/* ===============================
   REPORTE
================================ */

function cargarReporte() {
    const tbody = document.getElementById("tbodyReporteGomas");
    const inputFiltro = document.getElementById("txtBuscarReporte");
    const filtro = inputFiltro ? inputFiltro.value.toLowerCase() : "";

    tbody.innerHTML = "";

    Object.values(dataGomas).forEach(function (registro) {
        const textoBusqueda = JSON.stringify(registro).toLowerCase();

        if (filtro !== "" && !textoBusqueda.includes(filtro)) {
            return;
        }

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${registro.ficha}</td>
            <td>${formatoNumero(registro.kmActual)} KM</td>
            <td>${crearResumenPieza(registro, "DLH")}</td>
            <td>${crearResumenPieza(registro, "DRH")}</td>
            <td>${crearResumenPieza(registro, "TLH")}</td>
            <td>${crearResumenPieza(registro, "TRH")}</td>
            <td>
                <span class="${registro.estado === "ELIMINADO" ? "badge-eliminado" : "badge-activo"}">
                    ${registro.estado}
                </span>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function crearResumenPieza(registro, pos) {
    const pieza = registro.piezas[pos];

    if (!pieza || !pieza.marca) {
        return "---";
    }

    const recorrido = (registro.kmActual || 0) - (pieza.kmInicial || 0);

    return `
        <div class="resumen-pieza">
            <strong>${pieza.marca}</strong><br>
            <small>${formatoNumero(recorrido)} KM</small>
        </div>
    `;
}

/* ===============================
   RESUMEN SUPERIOR
================================ */

function actualizarResumen() {
    const ficha = obtenerFicha();
    const kmActual = obtenerKmActual();

    document.getElementById("lblFichaActual").textContent = ficha || "---";
    document.getElementById("lblKmActual").textContent = kmActual > 0 ? formatoNumero(kmActual) + " KM" : "---";

    let cantidad = 0;

    posiciones.forEach(function (pos) {
        const marca = document.getElementById("marca_" + pos).value;

        if (marca !== "") {
            cantidad++;
        }
    });

    document.getElementById("lblGomasRegistradas").textContent = cantidad;

    if (ficha !== "" && dataGomas[ficha]) {
        document.getElementById("lblEstadoFicha").textContent = dataGomas[ficha].estado;
    } else {
        document.getElementById("lblEstadoFicha").textContent = "---";
    }
}

/* ===============================
   HELPERS
================================ */

function asegurarFicha(ficha) {
    if (!dataGomas[ficha]) {
        dataGomas[ficha] = {
            ficha: ficha,
            kmActual: 0,
            estado: "ACTIVO",
            fechaRegistro: fechaHoyISO(),
            piezas: {
                DLH: {},
                DRH: {},
                TLH: {},
                TRH: {}
            }
        };
    }
}

function obtenerFicha() {
    return document.getElementById("txtFicha").value.trim().toUpperCase();
}

function obtenerKmActual() {
    return toNumber(document.getElementById("txtKmActual").value);
}

function toNumber(valor) {
    return Number(String(valor).replace(/,/g, "").trim()) || 0;
}

function formatoNumero(valor) {
    return Number(valor || 0).toLocaleString("en-US");
}

function fechaHoyISO() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

function fechaHoyTexto() {
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, "0");
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const yyyy = hoy.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
}