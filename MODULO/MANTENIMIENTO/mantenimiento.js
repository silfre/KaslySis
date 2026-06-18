let paginaActual = 1;
let registrosPorPagina = 50;

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarBD();
    cargarUnidades();
    cargarEmpleados();
    establecerFechaHoraActual();
    renderizarTabla();
});

// =========================================
// CARGAR SELECTORES
// =========================================
function cargarUnidades() {
    const select = document.getElementById('selectUnidad');
    select.innerHTML = '<option value="">-- Seleccionar Unidad --</option>';

    const unidades = obtenerUnidades();
    unidades.forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = `${u.ficha} - ${u.marca} ${u.anio}`;
        select.appendChild(option);
    });
}

function cargarEmpleados() {
    const select = document.getElementById('selectEmpleado');
    select.innerHTML = '<option value="">-- Seleccionar Empleado --</option>';

    const empleados = obtenerEmpleados();
    empleados.forEach(e => {
        const option = document.createElement('option');
        option.value = e.id;
        option.textContent = `${e.codigo} - ${e.nombre}`;
        select.appendChild(option);
    });
}

// =========================================
// ABRIR/CERRAR MODALES
// =========================================
function abrirModalRegistro() {
    limpiarFormulario();
    establecerFechaHoraActual();
    document.getElementById('modalRegistro').classList.add('activo');
}

function cerrarModal(idModal) {
    document.getElementById(idModal).classList.remove('activo');
}

function establecerFechaHoraActual() {
    const ahora = new Date();
    
    const fecha = ahora.toISOString().split('T')[0];
    const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);

    document.getElementById('inputFecha').value = fecha;
    document.getElementById('inputHora').value = hora;
}

// =========================================
// GUARDAR REGISTRO
// =========================================
function guardarRegistro(event) {
    event.preventDefault();

    const unidad = document.getElementById('selectUnidad').value;
    const tipo = document.getElementById('selectTipo').value;
    const fecha = document.getElementById('inputFecha').value;
    const hora = document.getElementById('inputHora').value;
    const km = document.getElementById('inputKm').value;
    const monto = document.getElementById('inputMonto').value;
    const empleado = document.getElementById('selectEmpleado').value;
    const descripcion = document.getElementById('inputDescripcion').value;

    if (!unidad || !tipo || !km) {
        alert('Por favor, complete los campos obligatorios.');
        return;
    }

    try {
        const registro = registrarMantenimiento({
            tipo: tipo,
            unidad: unidad,
            km: km,
            fecha: fecha,
            hora: hora,
            empleado: empleado,
            descripcion: descripcion,
            monto: monto || 0
        });

        alert(`✓ Mantenimiento registrado.\n✓ KM de unidad actualizado a ${km} km`);
        cerrarModal('modalRegistro');
        renderizarTabla();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// =========================================
// RENDERIZAR TABLA
// =========================================
function renderizarTabla() {
    const tbody = document.getElementById('tablaBody');
    tbody.innerHTML = '';

    const registros = obtenerRegistrosFiltrados();
    const totalPaginas = Math.max(1, Math.ceil(registros.length / registrosPorPagina));

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const visibles = registros.slice(inicio, fin);

    visibles.forEach((registro, index) => {
        const unidad = obtenerUnidad(registro.unidad);
        const empleado = obtenerEmpleado(registro.empleado);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.fecha}</td>
            <td>${registro.hora}</td>
            <td>${unidad ? unidad.ficha : registro.unidad}</td>
            <td>${crearBadgeTipo(registro.tipo)}</td>
            <td class="numero">${formatoNumero(registro.km)}</td>
            <td>${empleado ? empleado.nombre : (registro.empleado || '-')}</td>
            <td>${registro.descripcion || '-'}</td>
            <td class="numero">$${parseFloat(registro.monto || 0).toFixed(2)}</td>
            <td><span class="badge badge-completado">Registrado</span></td>
            <td>
                <div class="acciones">
                    <button class="accion accion-ver" onclick="verDetalles('${registro.id}')">👁</button>
                    <button class="accion accion-editar" onclick="editarRegistro('${registro.id}')">✏️</button>
                    <button class="accion accion-borrar" onclick="eliminarRegistro('${registro.id}')">🗑</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    actualizarCards();
    actualizarPaginacion(registros.length);
}

// =========================================
// FUNCIONES DE FILTRADO Y BÚSQUEDA
// =========================================
function obtenerRegistrosFiltrados() {
    const buscador = document.getElementById('buscador');
    const filtro = (buscador?.value || '').toLowerCase();

    const todosLosRegistros = [
        ...sistemaBD.mantenimiento,
        ...sistemaBD.combustible,
        ...sistemaBD.piezas,
        ...sistemaBD.goma,
        ...sistemaBD.aceite
    ];

    return todosLosRegistros
        .sort((a, b) => new Date(b.fecha + ' ' + b.hora) - new Date(a.fecha + ' ' + a.hora))
        .filter(r => {
            const unidad = obtenerUnidad(r.unidad);
            const empleado = obtenerEmpleado(r.empleado);

            const textoFila = [
                r.fecha,
                r.hora,
                r.tipo,
                r.descripcion || '',
                unidad?.ficha || '',
                unidad?.marca || '',
                empleado?.nombre || ''
            ].join(' ').toLowerCase();

            return !filtro || textoFila.includes(filtro);
        });
}

function buscarEnTabla() {
    paginaActual = 1;
    renderizarTabla();
}

function cambiarRegistrosPorPagina(valor) {
    registrosPorPagina = parseInt(valor, 10) || 50;
    paginaActual = 1;
    renderizarTabla();
}

// =========================================
// PAGINACIÓN
// =========================================
function actualizarPaginacion(totalFiltrado) {
    const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / registrosPorPagina));

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    const inicio = totalFiltrado === 0 ? 0 : ((paginaActual - 1) * registrosPorPagina) + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalFiltrado);

    document.getElementById('textoPaginacion').textContent = `${inicio}-${fin} / ${totalFiltrado}`;

    document.getElementById('btnPrimeraPagina').disabled = paginaActual <= 1;
    document.getElementById('btnPaginaAnterior').disabled = paginaActual <= 1;
    document.getElementById('btnPaginaSiguiente').disabled = paginaActual >= totalPaginas;
    document.getElementById('btnUltimaPagina').disabled = paginaActual >= totalPaginas;
}

function irPrimeraPagina() { paginaActual = 1; renderizarTabla(); }
function irPaginaAnterior() { if (paginaActual > 1) { paginaActual--; renderizarTabla(); } }
function irPaginaSiguiente() {
    const filtrados = obtenerRegistrosFiltrados();
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));
    if (paginaActual < totalPaginas) { paginaActual++; renderizarTabla(); }
}
function irUltimaPagina() {
    const filtrados = obtenerRegistrosFiltrados();
    paginaActual = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));
    renderizarTabla();
}

// =========================================
// ACTUALIZAR TARJETAS DE RESUMEN
// =========================================
function actualizarCards() {
    const registros = obtenerRegistrosFiltrados();
    const ahora = new Date();

    const esteMes = registros.filter(r => {
        const fecha = new Date(r.fecha);
        return fecha.getFullYear() === ahora.getFullYear() && 
               fecha.getMonth() === ahora.getMonth();
    }).length;

    const unidadesSet = new Set(registros.map(r => r.unidad));
    const montoTotal = registros.reduce((sum, r) => sum + (parseFloat(r.monto) || 0), 0);

    document.getElementById('cardTotal').textContent = registros.length;
    document.getElementById('cardEsteMes').textContent = esteMes;
    document.getElementById('cardUnidades').textContent = unidadesSet.size;
    document.getElementById('cardMonto').textContent = `$${montoTotal.toFixed(2)}`;
}

// =========================================
// UTILIDADES
// =========================================
function crearBadgeTipo(tipo) {
    const tipos = {
        'combustible': '⛽ Combustible',
        'piezas': '⚙️ Piezas',
        'goma': '🛞 Goma',
        'aceite': '🛢️ Aceite',
        'mecanica': '🔧 Mecánica',
        'electrico': '⚡ Eléctrico',
        'suspension': '🚗 Suspensión',
        'frenos': '🛑 Frenos',
        'otro': '📌 Otro'
    };

    const etiqueta = tipos[tipo] || tipo;
    return `<span class="badge badge-${tipo}">${etiqueta}</span>`;
}

function verDetalles(idRegistro) {
    alert('Funcionalidad en desarrollo');
}

function editarRegistro(idRegistro) {
    alert('Funcionalidad en desarrollo');
}

function eliminarRegistro(idRegistro) {
    if (!confirm('¿Eliminar este registro?')) return;
    
    // Buscar y eliminar del array correspondiente
    for (const tipo of ['mantenimiento', 'combustible', 'piezas', 'goma', 'aceite']) {
        const index = sistemaBD[tipo].findIndex(r => r.id === idRegistro);
        if (index > -1) {
            sistemaBD[tipo].splice(index, 1);
            guardarBD();
            renderizarTabla();
            return;
        }
    }
}

function limpiarFormulario() {
    document.getElementById('formRegistro').reset();
    establecerFechaHoraActual();
}

function descargarExcel() {
    const registros = obtenerRegistrosFiltrados();
    const datos = registros.map(r => ({
        Fecha: r.fecha,
        Hora: r.hora,
        Unidad: obtenerUnidad(r.unidad)?.ficha || r.unidad,
        Tipo: r.tipo,
        KM: r.km,
        Empleado: obtenerEmpleado(r.empleado)?.nombre || '',
        Descripcion: r.descripcion || '',
        Monto: r.monto || 0
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mantenimiento');
    XLSX.writeFile(wb, 'Mantenimiento.xlsx');
}

function limpiarTabla() {
    if (!confirm('¿Limpiar todos los registros? Esta acción no se puede deshacer.')) return;
    
    sistemaBD.mantenimiento = [];
    sistemaBD.combustible = [];
    sistemaBD.piezas = [];
    sistemaBD.goma = [];
    sistemaBD.aceite = [];
    guardarBD();
    renderizarTabla();
}

function abrirModalFiltros() {
    alert('Función de filtros en desarrollo');
}

function alternarMenu() {
    document.getElementById('sidebar').classList.toggle('cerrado');
    document.getElementById('mainContent').classList.toggle('expandido');
}

// Formateo de números
function formatoNumero(num) {
    return Math.round(convertirNumero(num)).toLocaleString('es-ES');
}

function convertirNumero(valor) {
    if (typeof valor === 'number') return valor;
    const num = parseFloat(String(valor || 0).replace(/,/g, '.'));
    return isNaN(num) ? 0 : num;
}
