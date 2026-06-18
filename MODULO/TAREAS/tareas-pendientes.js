document.addEventListener('DOMContentLoaded', () => {
    inicializarBD();
    cargarEmpleados();
    renderizar();
});

function cargarEmpleados() {
    const select = document.getElementById('asignado');
    select.innerHTML = '<option value="">-- Sin asignar --</option>';
    obtenerEmpleados().forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.text = e.nombre;
        select.appendChild(opt);
    });
}

function abrirModalTarea() {
    document.getElementById('modalTarea').classList.add('activo');
    document.getElementById('vencimiento').valueAsDate = new Date();
}

function cerrarModal() {
    document.getElementById('modalTarea').classList.remove('activo');
    document.querySelector('form').reset();
}

function guardarTarea(e) {
    e.preventDefault();
    const tarea = crearTarea({
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        tipo: document.getElementById('tipo').value,
        asignado: document.getElementById('asignado').value,
        prioridad: document.getElementById('prioridad').value,
        fechaVencimiento: document.getElementById('vencimiento').value,
        proximaActualizacion: document.getElementById('actualizacion').value
    });
    cerrarModal();
    renderizar();
    alert('✓ Tarea creada');
}

function renderizar() {
    const tbody = document.getElementById('tablaBody');
    const filtro = document.getElementById('buscador').value.toLowerCase();
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroTipo = document.getElementById('filtroTipo').value;

    let tareas = sistemaBD.tareas_pendientes.filter(t => {
        const matches = (t.titulo || '').toLowerCase().includes(filtro);
        const matchEstado = !filtroEstado || t.estado === filtroEstado;
        const matchTipo = !filtroTipo || t.tipo === filtroTipo;
        return matches && matchEstado && matchTipo;
    }).sort((a, b) => {
        const prioridades = { alta: 3, normal: 2, baja: 1 };
        return (prioridades[b.prioridad] || 0) - (prioridades[a.prioridad] || 0);
    });

    tbody.innerHTML = tareas.map(t => {
        const empleado = obtenerEmpleado(t.asignado);
        return `
            <tr class="estado-${t.estado}">
                <td>${t.titulo}</td>
                <td><span class="badge badge-${t.tipo}">${t.tipo === 'individual' ? '👤' : '👥'} ${t.tipo}</span></td>
                <td>${empleado?.nombre || '-'}</td>
                <td><span class="estado ${t.estado}">${t.estado}</span></td>
                <td><span class="prioridad ${t.prioridad}">${t.prioridad}</span></td>
                <td>${t.fechaVencimiento || '-'}</td>
                <td>
                    <button class="accion" onclick="cambiarEstado('${t.id}')">→</button>
                    <button class="accion" onclick="editarTarea('${t.id}')">✏</button>
                    <button class="accion" onclick="eliminarTarea('${t.id}')">🗑</button>
                </td>
            </tr>
        `;
    }).join('');

    const total = sistemaBD.tareas_pendientes.length;
    const pendientes = sistemaBD.tareas_pendientes.filter(t => t.estado === 'pendiente').length;
    const progreso = sistemaBD.tareas_pendientes.filter(t => t.estado === 'en_progreso').length;
    const completadas = sistemaBD.tareas_pendientes.filter(t => t.estado === 'completada').length;

    document.getElementById('cardTotal').textContent = total;
    document.getElementById('cardPendientes').textContent = pendientes;
    document.getElementById('cardProgreso').textContent = progreso;
    document.getElementById('cardCompletadas').textContent = completadas;
}

function filtrarDatos() {
    renderizar();
}

function cambiarEstado(id) {
    const tarea = sistemaBD.tareas_pendientes.find(t => t.id === id);
    if (!tarea) return;

    const estados = ['pendiente', 'en_progreso', 'completada'];
    const indexActual = estados.indexOf(tarea.estado);
    tarea.estado = estados[(indexActual + 1) % estados.length];
    
    guardarBD();
    renderizar();
}

function editarTarea(id) {
    alert('Función en desarrollo');
}

function eliminarTarea(id) {
    if (confirm('¿Eliminar tarea?')) {
        sistemaBD.tareas_pendientes = sistemaBD.tareas_pendientes.filter(t => t.id !== id);
        guardarBD();
        renderizar();
    }
}

function descargarExcel() {
    const datos = sistemaBD.tareas_pendientes.map(t => ({
        'Título': t.titulo,
        'Tipo': t.tipo,
        'Asignado': obtenerEmpleado(t.asignado)?.nombre || '-',
        'Estado': t.estado,
        'Prioridad': t.prioridad,
        'Vencimiento': t.fechaVencimiento || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tareas');
    XLSX.writeFile(wb, 'TareasPendientes.xlsx');
}

function filtrarPor(tipo) {
    alert('Filtrados por: ' + tipo);
}

function alternarMenu() {
    document.getElementById('sidebar').classList.toggle('cerrado');
    document.getElementById('mainContent').classList.toggle('expandido');
}
