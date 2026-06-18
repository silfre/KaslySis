let paginaActual = 1;
let registrosPorPagina = 50;
let permitirEditarMantenimientoPasado = false;
let unidadesSeleccionadasCaptura = new Set();

const STORAGE_MANT_UNIDADES = "kashly_mantenimiento_unidades";
const STORAGE_HISTORIAL_MANT = "kashly_historial_mantenimiento";

const KM_POR_VENCER = 8000;
const KM_PENDIENTE = 10000;
const KM_VENCIDO = 11000;

let datosMantenimiento = [];
let historialMantenimiento = [];

document.addEventListener("DOMContentLoaded", function () {
    if (typeof inicializarBD === "function") {
        inicializarBD();
    }

    cargarDatosMantenimiento();
    sincronizarUnidadesBase();
    recalcularTodosLosEstados();
    establecerFechaActual();
    renderizarTablaPendiente();
});

function cargarDatosMantenimiento() {
    datosMantenimiento = JSON.parse(localStorage.getItem(STORAGE_MANT_UNIDADES)) || [];
    historialMantenimiento = JSON.parse(localStorage.getItem(STORAGE_HISTORIAL_MANT)) || [];

    const datosViejos = JSON.parse(localStorage.getItem("kashly_mantenimiento_pendiente")) || [];

    if (datosMantenimiento.length === 0 && datosViejos.length > 0) {
        datosMantenimiento = datosViejos.map(r => normalizarRegistroUnidad({
            id: r.id,
            ficha: r.ficha,
            fechaUltimoMantenimiento: r.fechaUltimoMantenimiento || r.fechaMantenimiento || "",
            kmUltimoMantenimiento: r.kmUltimoMantenimiento || r.kmActualManual || 0,
            kmActualAutomatico: r.kmActualAutomatico || r.kmActualManual || 0,
            tipo: r.tipo || "",
            actualizadoPor: r.actualizadoPor || "Migrado",
            fechaActualizacion: r.fechaActualizacion || r.fechaCreacion || ""
        }));

        guardarDatosMantenimiento();
    }
}

function guardarDatosMantenimiento() {
    localStorage.setItem(STORAGE_MANT_UNIDADES, JSON.stringify(datosMantenimiento));
    localStorage.setItem(STORAGE_HISTORIAL_MANT, JSON.stringify(historialMantenimiento));
}

function sincronizarUnidadesBase() {
    const unidades = obtenerUnidadesBase();

    unidades.forEach(unidad => {
        const ficha = obtenerFichaUnidad(unidad);
        if (!ficha) return;

        let registro = datosMantenimiento.find(r => normalizarFicha(r.ficha) === normalizarFicha(ficha));

        if (!registro) {
            registro = normalizarRegistroUnidad({
                id: generarId("UNIDAD"),
                ficha: ficha,
                fechaUltimoMantenimiento: "",
                kmUltimoMantenimiento: 0,
               kmActualAutomatico: obtenerKmUnidad(unidad),
                kmActualManual: obtenerKmUnidad(unidad),
                tipo: "",
                actualizadoPor: "",
                fechaActualizacion: ""
            });

            datosMantenimiento.push(registro);
        } else {
            const kmBase = obtenerKmUnidad(unidad);

if (kmBase > 0) {
    registro.kmActualAutomatico = kmBase;

    if (!registro.kmActualManual || convertirNumero(registro.kmActualManual) <= 0) {
        registro.kmActualManual = kmBase;
    }
}
        }
    });

    guardarDatosMantenimiento();
}

function obtenerUnidadesBase() {
    if (typeof obtenerUnidades === "function") {
        try {
            const lista = obtenerUnidades();
            if (Array.isArray(lista)) return lista;
        } catch (error) {}
    }

    if (typeof sistemaBD !== "undefined" && Array.isArray(sistemaBD.unidades)) {
        return sistemaBD.unidades;
    }

    return [];
}

function obtenerFichaUnidad(unidad) {
    return normalizarFicha(unidad.ficha || unidad.numeroFicha || unidad.numero || unidad.idUnidad || unidad.id || "");
}

function obtenerKmUnidad(unidad) {
    return convertirNumero(unidad.kmActual || unidad.kilometrajeActual || unidad.km || unidad.kilometraje || unidad.odometro || 0);
}

function normalizarRegistroUnidad(registro) {
    const kmActualManual = convertirNumero(registro.kmActualManual || registro.kmActualAutomatico || 0);
    const diferencia = calcularDiferenciaKm(kmActualManual, registro.kmUltimoMantenimiento);

    return {
        id: registro.id || generarId("UNIDAD"),
        ficha: normalizarFicha(registro.ficha),

        fechaUltimoMantenimiento: registro.fechaUltimoMantenimiento || "",
        kmUltimoMantenimiento: convertirNumero(registro.kmUltimoMantenimiento),

        kmActualAutomatico: convertirNumero(registro.kmActualAutomatico),
        kmActualManual: kmActualManual,

        diferenciaKm: diferencia,
        estado: calcularEstadoMantenimiento(diferencia),

        tipo: registro.tipo || "",
        actualizadoPor: registro.actualizadoPor || "",
        fechaActualizacion: registro.fechaActualizacion || "",
        comentario: registro.comentario || ""
    };
}

function actualizarTablaMantenimiento() {
    sincronizarUnidadesBase();
    recalcularTodosLosEstados();
    guardarDatosMantenimiento();
    renderizarTablaPendiente();
    mostrarMensaje("Tabla actualizada con los KM actuales de las unidades.");
}

function abrirModalActualizar(id = "") {
    limpiarFormulario();
    establecerFechaActual();
    ponerFormularioModoEditar();

    document.getElementById("tituloModalMantenimiento").textContent = "Actualizar Mantenimiento";

    if (id) {
        cargarRegistroEnModal(id, false);
    } else {
        document.getElementById("textoUltimoMantenimiento").textContent = "Escribe la ficha. Si ya existe historial, el último mantenimiento se llenará automático.";
    }

    document.getElementById("modalActualizarMantenimiento").classList.add("activo");
}

function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) modal.classList.remove("activo");
}

function limpiarFormulario() {
    const form = document.getElementById("formActualizarMantenimiento");
    if (form) form.reset();

    permitirEditarMantenimientoPasado = false;

    document.getElementById("inputIdRegistro").value = "";
    document.getElementById("bloquePrimeraVez").style.display = "none";
    document.getElementById("inputFechaUltimoManual").required = false;
    document.getElementById("inputKmUltimoManual").required = false;

    document.getElementById("inputFechaUltimo").readOnly = true;
    document.getElementById("inputKmUltimo").readOnly = true;

    const btnEditarPasado = document.getElementById("btnEditarMantenimientoPasado");
    if (btnEditarPasado) {
        btnEditarPasado.style.display = "none";
    }

    const texto = document.getElementById("textoUltimoMantenimiento");
    texto.textContent = "El último mantenimiento se busca automático por ficha.";
    texto.style.color = "#64748b";
}

function establecerFechaActual() {
    const inputFecha = document.getElementById("inputFecha");
    if (inputFecha && !inputFecha.value) inputFecha.value = new Date().toISOString().split("T")[0];

    const usuario = document.getElementById("inputUsuarioActualiza");
    if (usuario && !usuario.value) {
        usuario.value = localStorage.getItem("kashly_nombre") || localStorage.getItem("kashly_usuario") || "Administrador";
    }
}

function cargarRegistroEnModal(id, modoVista) {
    const registro = datosMantenimiento.find(r => r.id === id);

    if (!registro) {
        alert("Registro no encontrado.");
        return;
    }

    permitirEditarMantenimientoPasado = false;

    document.getElementById("inputIdRegistro").value = registro.id;
    document.getElementById("inputFicha").value = registro.ficha || "";
    document.getElementById("inputFechaUltimo").value = registro.fechaUltimoMantenimiento || "";
    document.getElementById("inputKmUltimo").value = registro.kmUltimoMantenimiento || "";
    document.getElementById("inputKmAutomatico").value = registro.kmActualAutomatico || "";
    document.getElementById("inputKmMantenimiento").value = "";
    document.getElementById("selectTipoMantenimiento").value = registro.tipo || "";
    document.getElementById("inputUsuarioActualiza").value =
        localStorage.getItem("kashly_nombre") ||
        localStorage.getItem("kashly_usuario") ||
        "Administrador";

    const primeraVez = !registro.fechaUltimoMantenimiento || convertirNumero(registro.kmUltimoMantenimiento) <= 0;

    const btnEditarPasado = document.getElementById("btnEditarMantenimientoPasado");

    if (primeraVez) {
        mostrarBloquePrimeraVez(true);

        document.getElementById("inputFechaUltimo").readOnly = true;
        document.getElementById("inputKmUltimo").readOnly = true;

        if (btnEditarPasado) {
            btnEditarPasado.style.display = "none";
        }

        document.getElementById("textoUltimoMantenimiento").textContent =
            "Primera vez de esta ficha. Debes colocar fecha y KM anterior manualmente.";

        document.getElementById("textoUltimoMantenimiento").style.color = "#92400e";

    } else {
        mostrarBloquePrimeraVez(false);

        document.getElementById("inputFechaUltimo").readOnly = true;
        document.getElementById("inputKmUltimo").readOnly = true;

        if (btnEditarPasado && !modoVista) {
            btnEditarPasado.style.display = "inline-block";
        }

        document.getElementById("textoUltimoMantenimiento").textContent =
            "Último mantenimiento cargado automáticamente. Si está incorrecto, puedes editar el mantenimiento pasado.";

        document.getElementById("textoUltimoMantenimiento").style.color = "#166534";
    }

    if (modoVista) {
        ponerFormularioModoVista();
    } else {
        ponerFormularioModoEditar();
    }
}

function cargarUnidadEnModalPorFicha() {
    const ficha = normalizarFicha(document.getElementById("inputFicha").value);
    if (!ficha) return;

    let registro = datosMantenimiento.find(r => normalizarFicha(r.ficha) === ficha);

    if (!registro) {
        const unidad = obtenerUnidadesBase().find(u => normalizarFicha(obtenerFichaUnidad(u)) === ficha);

        registro = normalizarRegistroUnidad({
            id: generarId("UNIDAD"),
            ficha: ficha,
            fechaUltimoMantenimiento: "",
            kmUltimoMantenimiento: 0,
            kmActualAutomatico: unidad ? obtenerKmUnidad(unidad) : 0,
            tipo: "",
            actualizadoPor: "",
            fechaActualizacion: ""
        });

        datosMantenimiento.push(registro);
        guardarDatosMantenimiento();
    }

    cargarRegistroEnModal(registro.id, false);
}

function mostrarBloquePrimeraVez(mostrar) {
    const bloque = document.getElementById("bloquePrimeraVez");
    const fechaManual = document.getElementById("inputFechaUltimoManual");
    const kmManual = document.getElementById("inputKmUltimoManual");

    bloque.style.display = mostrar ? "block" : "none";
    fechaManual.required = mostrar;
    kmManual.required = mostrar;
}

function guardarActualizacionMantenimiento(event) {
    event.preventDefault();

    const idRegistro = document.getElementById("inputIdRegistro").value;
    const ficha = normalizarFicha(document.getElementById("inputFicha").value);
    const fechaMantenimiento = document.getElementById("inputFecha").value;
    const kmMantenimiento = convertirNumero(document.getElementById("inputKmMantenimiento").value);
    const tipo = document.getElementById("selectTipoMantenimiento").value;
    const usuario = document.getElementById("inputUsuarioActualiza").value.trim();
    const comentario = document.getElementById("inputComentario").value.trim();

    if (!ficha || !fechaMantenimiento || !kmMantenimiento || !tipo || !usuario) {
        alert("Complete todos los campos obligatorios.");
        return;
    }

    let registro = datosMantenimiento.find(r => r.id === idRegistro) || datosMantenimiento.find(r => normalizarFicha(r.ficha) === ficha);

    if (!registro) {
        registro = normalizarRegistroUnidad({
            id: generarId("UNIDAD"),
            ficha: ficha,
            fechaUltimoMantenimiento: "",
            kmUltimoMantenimiento: 0,
            kmActualAutomatico: kmMantenimiento,
            tipo: "",
            actualizadoPor: "",
            fechaActualizacion: ""
        });
        datosMantenimiento.push(registro);
    }

  let fechaAnterior = registro.fechaUltimoMantenimiento;
let kmAnterior = convertirNumero(registro.kmUltimoMantenimiento);

const primeraVez = !fechaAnterior || kmAnterior <= 0;

if (primeraVez) {
    const fechaManual = document.getElementById("inputFechaUltimoManual").value;
    const kmManual = convertirNumero(document.getElementById("inputKmUltimoManual").value);

    if (!fechaManual || !kmManual) {
        alert("Como es la primera vez de esta unidad, debe colocar fecha y KM anterior.");
        return;
    }

    fechaAnterior = fechaManual;
    kmAnterior = kmManual;
}

if (!primeraVez && permitirEditarMantenimientoPasado) {
    const fechaCorregida = document.getElementById("inputFechaUltimo").value;
    const kmCorregido = convertirNumero(document.getElementById("inputKmUltimo").value);

    if (!fechaCorregida || !kmCorregido) {
        alert("Debe colocar la fecha y el KM del mantenimiento pasado.");
        return;
    }

    fechaAnterior = fechaCorregida;
    kmAnterior = kmCorregido;
}




    if (kmMantenimiento < kmAnterior) {
        alert("El KM donde se dio mantenimiento no puede ser menor que el KM anterior.");
        return;
    }

    const kmAutomaticoBase = Math.max(convertirNumero(registro.kmActualAutomatico), buscarKmAutomaticoUnidad(ficha), kmMantenimiento);

    historialMantenimiento.push({
        id: generarId("HIST"),
        ficha: ficha,
        tipo: tipo,
        fechaAnterior: fechaAnterior,
        kmAnterior: kmAnterior,
        fechaNueva: fechaMantenimiento,
        kmNuevo: kmMantenimiento,
        kmAutomaticoAntes: registro.kmActualAutomatico,
        kmAutomaticoDespues: kmAutomaticoBase,
        usuario: usuario,
        comentario: comentario,
        fechaHoraRegistro: new Date().toISOString()
    });

 registro.fechaUltimoMantenimiento = fechaMantenimiento;
registro.kmUltimoMantenimiento = kmMantenimiento;

// Cuando das mantenimiento, el KM actual manual también queda en ese KM,
// porque desde ahí comienza el nuevo conteo.
registro.kmActualManual = kmMantenimiento;

registro.kmActualAutomatico = Math.max(
    convertirNumero(registro.kmActualAutomatico),
    buscarKmAutomaticoUnidad(ficha),
    kmMantenimiento
);

registro.diferenciaKm = calcularDiferenciaKm(
    registro.kmActualManual,
    registro.kmUltimoMantenimiento
);
    registro.estado = calcularEstadoMantenimiento(registro.diferenciaKm);
    registro.tipo = tipo;
    registro.actualizadoPor = usuario;
    registro.fechaActualizacion = new Date().toISOString();
    registro.comentario = comentario;

    guardarDatosMantenimiento();
    cerrarModal("modalActualizarMantenimiento");
    limpiarFormulario();
    renderizarTablaPendiente();

    mostrarMensaje(`Mantenimiento actualizado. Último mantenimiento de ${ficha}: ${formatearFecha(fechaMantenimiento)} / ${formatoNumero(kmMantenimiento)} KM.`);
}

function renderizarTablaPendiente() {
    recalcularTodosLosEstados();

    const tbody = document.getElementById("tablaBodyMantenimiento");
    if (!tbody) return;

    tbody.innerHTML = "";

    const registrosFiltrados = obtenerRegistrosFiltradosPendiente();
    const totalPaginas = Math.max(1, Math.ceil(registrosFiltrados.length / registrosPorPagina));

    if (paginaActual > totalPaginas) paginaActual = totalPaginas;

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const visibles = registrosFiltrados.slice(inicio, fin);

    visibles.forEach(registro => {
        const tr = document.createElement("tr");
      const kmActualVisual = obtenerKmActualVisual(registro);

tr.innerHTML = `
    <td>
        <input 
            type="checkbox" 
            class="check-captura" 
            value="${registro.id}"
            ${unidadesSeleccionadasCaptura.has(registro.id) ? "checked" : ""}
            onchange="toggleSeleccionCaptura('${registro.id}', this.checked)"
        >
    </td>

    <td>${registro.ficha}</td>
    <td>${formatearFecha(registro.fechaUltimoMantenimiento)}</td>
    <td class="numero">${formatoNumero(registro.kmUltimoMantenimiento)}</td>
    <td class="numero">${formatoNumero(registro.kmActualAutomatico)}</td>
    <td class="numero">${formatoNumero(kmActualVisual)}</td>
    <td class="numero">${formatoNumero(registro.diferenciaKm)}</td>
    <td>${crearBadgeEstado(registro.estado)}</td>
    <td>${formatearFechaHora(registro.fechaActualizacion)}</td>
    <td>${registro.actualizadoPor || "-"}</td>

    <td>
        <div class="acciones">
            <button type="button" class="accion accion-ver" title="Ver" onclick="verRegistroPendiente('${registro.id}')">👁</button>
            <button type="button" class="accion accion-editar" title="Actualizar KM actual" onclick="abrirModalKmActual('${registro.id}')">🚗</button>
            <button type="button" class="accion accion-editar" title="Dar mantenimiento" onclick="abrirModalActualizar('${registro.id}')">🔄</button>
            <button type="button" class="accion accion-borrar" title="Historial" onclick="abrirHistorialUnidad('${registro.ficha}')">📜</button>
        </div>
    </td>
`;
        tbody.appendChild(tr);
    });

    actualizarCardsPendiente();
    actualizarPaginacion(registrosFiltrados.length);
    guardarDatosMantenimiento();
}

function recalcularTodosLosEstados() {
    datosMantenimiento.forEach(registro => {
        const kmAutomatico = buscarKmAutomaticoUnidad(registro.ficha);

        if (kmAutomatico > 0) {
            registro.kmActualAutomatico = kmAutomatico;
        }

        const kmActualVisual = obtenerKmActualVisual(registro);

        registro.diferenciaKm = calcularDiferenciaKm(
            kmActualVisual,
            registro.kmUltimoMantenimiento
        );

        registro.estado = calcularEstadoMantenimiento(registro.diferenciaKm);
    });
}

function obtenerKmActualVisual(registro) {
    return Math.max(
        convertirNumero(registro.kmActualManual),
        convertirNumero(registro.kmActualAutomatico)
    );
}

function calcularDiferenciaKm(kmActual, kmUltimo) {
    return Math.max(0, convertirNumero(kmActual) - convertirNumero(kmUltimo));
}

function obtenerRegistrosFiltradosPendiente() {
    const texto = (document.getElementById("buscadorMantenimiento")?.value || "").toLowerCase();
    const estadoFiltro = document.getElementById("filtroEstadoMantenimiento")?.value || "";

    return datosMantenimiento
        .slice()
        .filter(registro => {
            const textoFila = [
                registro.ficha,
                textoEstado(registro.estado),
                registro.tipo,
                registro.actualizadoPor
            ].join(" ").toLowerCase();

            const coincideTexto = !texto || textoFila.includes(texto);
            const coincideEstado = !estadoFiltro || registro.estado === estadoFiltro;

            return coincideTexto && coincideEstado;
        })
        .sort((a, b) => {
            const recorridoA = convertirNumero(a.diferenciaKm);
            const recorridoB = convertirNumero(b.diferenciaKm);

            return recorridoB - recorridoA;
        });
}

function filtrarDatosMantenimiento() {
    paginaActual = 1;
    renderizarTablaPendiente();
}

function verRegistroPendiente(id) {
    const registro = datosMantenimiento.find(r => r.id === id);
    if (!registro) {
        alert("Registro no encontrado.");
        return;
    }

    document.getElementById("tituloModalMantenimiento").textContent = "Ver Mantenimiento";
    cargarRegistroEnModal(id, true);
    document.getElementById("inputKmMantenimiento").value = registro.kmUltimoMantenimiento || "";
    document.getElementById("inputFecha").value = registro.fechaUltimoMantenimiento || "";

    const texto = document.getElementById("textoUltimoMantenimiento");
    texto.textContent = "Vista de la unidad. Presiona Editar para actualizar el mantenimiento.";
    texto.style.color = "#64748b";

    document.getElementById("modalActualizarMantenimiento").classList.add("activo");
}

function ponerFormularioModoVista() {
    document.getElementById("inputFicha").readOnly = true;
    document.getElementById("inputFecha").readOnly = true;
    document.getElementById("inputFechaUltimo").readOnly = true;
    document.getElementById("inputKmUltimo").readOnly = true;
    document.getElementById("inputKmAutomatico").readOnly = true;
    document.getElementById("inputKmMantenimiento").readOnly = true;
    document.getElementById("inputUsuarioActualiza").readOnly = true;
    document.getElementById("inputComentario").readOnly = true;
    document.getElementById("selectTipoMantenimiento").disabled = true;
    document.getElementById("btnGuardarRegistro").style.display = "none";
    document.getElementById("btnEditarDesdeVer").style.display = "inline-block";
}

function ponerFormularioModoEditar() {
    document.getElementById("inputFicha").readOnly = false;
    document.getElementById("inputFecha").readOnly = false;

    // Estos se quedan bloqueados, excepto si el usuario presiona "Editar mantenimiento pasado"
    document.getElementById("inputFechaUltimo").readOnly = true;
    document.getElementById("inputKmUltimo").readOnly = true;

    document.getElementById("inputKmAutomatico").readOnly = true;

    // Este siempre se puede agregar manual
    document.getElementById("inputKmMantenimiento").readOnly = false;

    document.getElementById("inputUsuarioActualiza").readOnly = false;
    document.getElementById("inputComentario").readOnly = false;

    document.getElementById("selectTipoMantenimiento").disabled = false;

    document.getElementById("btnGuardarRegistro").style.display = "inline-block";
    document.getElementById("btnEditarDesdeVer").style.display = "none";

    const btnEditarPasado = document.getElementById("btnEditarMantenimientoPasado");
    if (btnEditarPasado) {
        btnEditarPasado.style.display = "inline-block";
    }
}

function activarEdicionDesdeVista() {
    document.getElementById("tituloModalMantenimiento").textContent = "Actualizar Mantenimiento";
    ponerFormularioModoEditar();
    const texto = document.getElementById("textoUltimoMantenimiento");
    texto.textContent = "Actualizando mantenimiento. Al guardar, la fecha y el KM actual pasarán a ser el último mantenimiento.";
    texto.style.color = "#991b1b";
}

function abrirHistorialGeneral() {
    renderizarHistorial();
    document.getElementById("tituloHistorial").textContent = "Historial de Actualizaciones";
    document.getElementById("modalHistorialMantenimiento").classList.add("activo");
}

function abrirHistorialUnidad(ficha) {
    renderizarHistorial(ficha);
    document.getElementById("tituloHistorial").textContent = `Historial de ${ficha}`;
    document.getElementById("modalHistorialMantenimiento").classList.add("activo");
}

function renderizarHistorial(ficha = "") {
    const tbody = document.getElementById("tablaBodyHistorial");
    if (!tbody) return;

    tbody.innerHTML = "";
    const registros = historialMantenimiento
        .filter(h => !ficha || normalizarFicha(h.ficha) === normalizarFicha(ficha))
        .sort((a, b) => new Date(b.fechaHoraRegistro) - new Date(a.fechaHoraRegistro));

    if (registros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9">No hay historial registrado.</td></tr>`;
        return;
    }

    registros.forEach(h => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatearFechaHora(h.fechaHoraRegistro)}</td>
            <td>${h.ficha}</td>
            <td>${h.tipo}</td>
            <td>${formatearFecha(h.fechaAnterior)}</td>
            <td class="numero">${formatoNumero(h.kmAnterior)}</td>
            <td>${formatearFecha(h.fechaNueva)}</td>
            <td class="numero">${formatoNumero(h.kmNuevo)}</td>
            <td>${h.usuario}</td>
            <td>${h.comentario || "-"}</td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarCardsPendiente() {
    const ahora = new Date();
    const pendientes = datosMantenimiento.filter(r => r.estado === "pendiente").length;
    const vencidas = datosMantenimiento.filter(r => r.estado === "vencido").length;
    const porVencer = datosMantenimiento.filter(r => r.estado === "por_vencer").length;
    const esteMes = historialMantenimiento.filter(h => {
        const fecha = new Date(h.fechaNueva || h.fechaHoraRegistro);
        return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth();
    }).length;

    document.getElementById("cardTotalPendientes").textContent = pendientes;
    document.getElementById("cardMantenimientosMes").textContent = esteMes;
    document.getElementById("cardUnidadesVencidas").textContent = vencidas;
    document.getElementById("cardPorVencer").textContent = porVencer;
}

function cambiarRegistrosPorPagina(valor) { registrosPorPagina = parseInt(valor, 10) || 50; paginaActual = 1; renderizarTablaPendiente(); }
function actualizarPaginacion(totalFiltrado) {
    const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / registrosPorPagina));
    const inicio = totalFiltrado === 0 ? 0 : ((paginaActual - 1) * registrosPorPagina) + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalFiltrado);
    document.getElementById("textoPaginacion").textContent = `${inicio}-${fin} / ${totalFiltrado}`;
    document.getElementById("btnPrimeraPagina").disabled = paginaActual <= 1;
    document.getElementById("btnPaginaAnterior").disabled = paginaActual <= 1;
    document.getElementById("btnPaginaSiguiente").disabled = paginaActual >= totalPaginas;
    document.getElementById("btnUltimaPagina").disabled = paginaActual >= totalPaginas;
}
function irPrimeraPagina() { paginaActual = 1; renderizarTablaPendiente(); }
function irPaginaAnterior() { if (paginaActual > 1) { paginaActual--; renderizarTablaPendiente(); } }
function irPaginaSiguiente() { const total = obtenerRegistrosFiltradosPendiente().length; const totalPaginas = Math.max(1, Math.ceil(total / registrosPorPagina)); if (paginaActual < totalPaginas) { paginaActual++; renderizarTablaPendiente(); } }
function irUltimaPagina() { const total = obtenerRegistrosFiltradosPendiente().length; paginaActual = Math.max(1, Math.ceil(total / registrosPorPagina)); renderizarTablaPendiente(); }

function descargarExcelMantenimiento() {
    const datos = obtenerRegistrosFiltradosPendiente().map(r => ({
        Ficha: r.ficha,
        "Último Mantenimiento": r.fechaUltimoMantenimiento,
        "KM Último Mantenimiento": r.kmUltimoMantenimiento,
        "KM Actual Automático": r.kmActualAutomatico,
        "KM Recorrido": r.diferenciaKm,
        Estado: textoEstado(r.estado),
        Tipo: r.tipo,
        "Última Actualización": r.fechaActualizacion,
        "Actualizado Por": r.actualizadoPor
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mantenimiento");
    XLSX.writeFile(wb, "Mantenimiento_Pendiente.xlsx");
}

function limpiarDatosMantenimiento() {
    if (!confirm("¿Seguro que desea limpiar los datos de mantenimiento? Esta acción no borra las unidades de la base, pero sí reinicia mantenimiento e historial.")) return;
    datosMantenimiento = [];
    historialMantenimiento = [];
    guardarDatosMantenimiento();
    sincronizarUnidadesBase();
    renderizarTablaPendiente();
}

function calcularEstadoMantenimiento(diferenciaKm) {
    const km = convertirNumero(diferenciaKm);
    if (km >= KM_VENCIDO) return "vencido";
    if (km >= KM_PENDIENTE) return "pendiente";
    if (km >= KM_POR_VENCER) return "por_vencer";
    return "al_dia";
}

function crearBadgeEstado(estado) {
    if (estado === "vencido") return `<span class="badge badge-rojo">Vencido</span>`;
    if (estado === "pendiente") return `<span class="badge badge-azul">Pendiente</span>`;
    if (estado === "por_vencer") return `<span class="badge badge-amarillo">Por vencer</span>`;
    return `<span class="badge badge-verde">Al día</span>`;
}

function textoEstado(estado) {
    const estados = { vencido: "Vencido", pendiente: "Pendiente", por_vencer: "Por vencer", al_dia: "Al día" };
    return estados[estado] || estado;
}

function buscarKmAutomaticoUnidad(ficha) {
    const unidad = obtenerUnidadesBase().find(u => normalizarFicha(obtenerFichaUnidad(u)) === normalizarFicha(ficha));
    if (!unidad) return 0;
    return obtenerKmUnidad(unidad);
}
function normalizarFicha(valor) { return String(valor || "").trim().toUpperCase(); }
function generarId(prefijo = "ID") { return `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`; }
function convertirNumero(valor) { if (typeof valor === "number") return valor; const limpio = String(valor || "0").replace(/,/g, "").replace(/\s/g, ""); const num = parseFloat(limpio); return isNaN(num) ? 0 : num; }
function formatoNumero(valor) { return Math.round(convertirNumero(valor)).toLocaleString("es-DO"); }
function formatearFecha(fecha) { if (!fecha) return "-"; const partes = String(fecha).split("T")[0].split("-"); if (partes.length !== 3) return fecha; return `${partes[2]}/${partes[1]}/${partes[0]}`; }
function formatearFechaHora(valor) { if (!valor) return "-"; const fecha = new Date(valor); if (isNaN(fecha.getTime())) return valor; return fecha.toLocaleString("es-DO", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
function mostrarMensaje(texto) { const mensaje = document.getElementById("mensajeMantenimiento"); if (mensaje) mensaje.textContent = texto; }


function habilitarEdicionMantenimientoPasado() {
    permitirEditarMantenimientoPasado = true;

    const inputFechaUltimo = document.getElementById("inputFechaUltimo");
    const inputKmUltimo = document.getElementById("inputKmUltimo");
    const texto = document.getElementById("textoUltimoMantenimiento");

    inputFechaUltimo.readOnly = false;
    inputKmUltimo.readOnly = false;

    inputFechaUltimo.required = true;
    inputKmUltimo.required = true;

    texto.textContent = "Edición activada. Puedes corregir la fecha y el KM del mantenimiento pasado.";
    texto.style.color = "#c2410c";
}

function abrirModalKmActual(id) {
    const registro = datosMantenimiento.find(r => r.id === id);

    if (!registro) {
        alert("Registro no encontrado.");
        return;
    }

    document.getElementById("inputIdKmActual").value = registro.id;
    document.getElementById("inputFichaKmActual").value = registro.ficha;
    document.getElementById("inputKmUltimoVista").value = registro.kmUltimoMantenimiento || 0;
    document.getElementById("inputKmActualManual").value = obtenerKmActualVisual(registro);
    document.getElementById("inputKmRecorridoVista").value = calcularDiferenciaKm(
        obtenerKmActualVisual(registro),
        registro.kmUltimoMantenimiento
    );

    document.getElementById("inputUsuarioKmActual").value =
        localStorage.getItem("kashly_nombre") ||
        localStorage.getItem("kashly_usuario") ||
        "Administrador";

    document.getElementById("inputComentarioKmActual").value = "";

    document.getElementById("inputKmActualManual").oninput = function () {
        const kmActual = convertirNumero(this.value);
        const kmUltimo = convertirNumero(document.getElementById("inputKmUltimoVista").value);

        document.getElementById("inputKmRecorridoVista").value = calcularDiferenciaKm(
            kmActual,
            kmUltimo
        );
    };

    document.getElementById("modalKmActual").classList.add("activo");
}

function guardarKmActualManual(event) {
    event.preventDefault();

    const id = document.getElementById("inputIdKmActual").value;
    const kmActualManual = convertirNumero(document.getElementById("inputKmActualManual").value);
    const usuario = document.getElementById("inputUsuarioKmActual").value.trim();
    const comentario = document.getElementById("inputComentarioKmActual").value.trim();

    const registro = datosMantenimiento.find(r => r.id === id);

    if (!registro) {
        alert("Registro no encontrado.");
        return;
    }

    if (!kmActualManual || !usuario) {
        alert("Debe colocar KM actual manual y usuario.");
        return;
    }

    const kmUltimo = convertirNumero(registro.kmUltimoMantenimiento);

    if (kmUltimo > 0 && kmActualManual < kmUltimo) {
        alert("El KM actual manual no puede ser menor que el KM del último mantenimiento.");
        return;
    }

    const kmAnteriorManual = convertirNumero(registro.kmActualManual);

    registro.kmActualManual = kmActualManual;
    registro.diferenciaKm = calcularDiferenciaKm(kmActualManual, registro.kmUltimoMantenimiento);
    registro.estado = calcularEstadoMantenimiento(registro.diferenciaKm);
    registro.actualizadoPor = usuario;
    registro.fechaActualizacion = new Date().toISOString();
    registro.comentario = comentario;

    historialMantenimiento.push({
        id: generarId("KM"),
        ficha: registro.ficha,
        tipo: "ACTUALIZACIÓN KM ACTUAL",
        fechaAnterior: registro.fechaUltimoMantenimiento,
        kmAnterior: registro.kmUltimoMantenimiento,
        fechaNueva: registro.fechaUltimoMantenimiento,
        kmNuevo: registro.kmUltimoMantenimiento,
        kmActualManualAntes: kmAnteriorManual,
        kmActualManualDespues: kmActualManual,
        kmRecorrido: registro.diferenciaKm,
        usuario: usuario,
        comentario: comentario,
        fechaHoraRegistro: new Date().toISOString()
    });

    guardarDatosMantenimiento();
    cerrarModal("modalKmActual");
    renderizarTablaPendiente();

    mostrarMensaje(
        `KM actual de ${registro.ficha} actualizado. Recorrido desde último mantenimiento: ${formatoNumero(registro.diferenciaKm)} KM.`
    );
}

function toggleSeleccionCaptura(id, seleccionado) {
    if (seleccionado) {
        unidadesSeleccionadasCaptura.add(id);
    } else {
        unidadesSeleccionadasCaptura.delete(id);
    }
}

function seleccionarTodoCaptura(check) {
    const registros = obtenerRegistrosFiltradosPendiente();

    if (check.checked) {
        registros.forEach(r => unidadesSeleccionadasCaptura.add(r.id));
    } else {
        registros.forEach(r => unidadesSeleccionadasCaptura.delete(r.id));
    }

    renderizarTablaPendiente();
}

function abrirCapturaSeleccion() {
    const seleccionadas = datosMantenimiento.filter(r => unidadesSeleccionadasCaptura.has(r.id));

    if (seleccionadas.length === 0) {
        alert("Debe seleccionar al menos una unidad para capturar.");
        return;
    }

    const tbody = document.getElementById("tablaBodyCaptura");

    tbody.innerHTML = "";

    seleccionadas
        .slice()
        .sort((a, b) => convertirNumero(b.diferenciaKm) - convertirNumero(a.diferenciaKm))
        .forEach(registro => {
            const kmActualVisual = obtenerKmActualVisual(registro);

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${registro.ficha}</td>
                <td class="numero">${formatoNumero(registro.kmUltimoMantenimiento)}</td>
                <td class="numero">${formatoNumero(kmActualVisual)}</td>
                <td class="numero recorrido-alerta">${formatoNumero(registro.diferenciaKm)}</td>
                <td>${textoEstado(registro.estado)}</td>
            `;

            tbody.appendChild(tr);
        });

    document.getElementById("totalCaptura").textContent = seleccionadas.length;

    document.getElementById("fechaCaptura").value = new Date().toISOString().split("T")[0];

    document.getElementById("usuarioCaptura").value =
        localStorage.getItem("kashly_nombre") ||
        localStorage.getItem("kashly_usuario") ||
        "Administrador";

    document.getElementById("modalCapturaSeleccion").classList.add("activo");
}

function limpiarSeleccionCaptura() {
    unidadesSeleccionadasCaptura.clear();

    const check = document.getElementById("checkSeleccionarTodo");
    if (check) check.checked = false;

    renderizarTablaPendiente();
}

function obtenerKmActualVisual(registro) {
    return Math.max(
        convertirNumero(registro.kmActualManual),
        convertirNumero(registro.kmActualAutomatico)
    );
}