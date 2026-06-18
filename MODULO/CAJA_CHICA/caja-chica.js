document.addEventListener('DOMContentLoaded', () => {
    inicializarBD();
    cargarEmpleados();
    establecerFecha();
    renderizar();
});

function establecerFecha() {
    document.getElementById('fecha').valueAsDate = new Date();
}

function cargarEmpleados() {
    const select = document.getElementById('empleado');
    select.innerHTML = '<option value="">-- Seleccionar --</option>';
    obtenerEmpleados().forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.text = e.nombre;
        select.appendChild(opt);
    });
}

function abrirModalGasto() {
    document.getElementById('modalGasto').classList.add('activo');
    establecerFecha();
}

function cerrarModal() {
    document.getElementById('modalGasto').classList.remove('activo');
    document.querySelector('form').reset();
}

function guardarGasto(e) {
    e.preventDefault();
    const gasto = {
        id: generarID(),
        fecha: document.getElementById('fecha').value,
        descripcion: document.getElementById('descripcion').value,
        categoria: document.getElementById('categoria').value,
        monto: parseFloat(document.getElementById('monto').value),
        empleado: document.getElementById('empleado').value
    };
    sistemaBD.caja_chica.push(gasto);
    guardarBD();
    cerrarModal();
    renderizar();
    alert('✓ Gasto registrado');
}

function renderizar() {
    const tbody = document.getElementById('tablaBody');
    const filtro = document.getElementById('buscador').value.toLowerCase();
    
    let datos = sistemaBD.caja_chica.filter(g => 
        (g.descripcion || '').toLowerCase().includes(filtro) ||
        (g.categoria || '').toLowerCase().includes(filtro)
    ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    tbody.innerHTML = datos.map(g => `
        <tr>
            <td>${g.fecha}</td>
            <td>${g.descripcion}</td>
            <td>${g.categoria}</td>
            <td class="monto">$${g.monto.toFixed(2)}</td>
            <td>${obtenerEmpleado(g.empleado)?.nombre || '-'}</td>
            <td><button class="accion" onclick="eliminarGasto('${g.id}')">🗑</button></td>
        </tr>
    `).join('');

    const total = datos.reduce((sum, g) => sum + g.monto, 0);
    const ahora = new Date();
    const estesMes = datos.filter(g => {
        const f = new Date(g.fecha);
        return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
    }).reduce((sum, g) => sum + g.monto, 0);

    const semana = datos.filter(g => {
        const f = new Date(g.fecha);
        const diff = (ahora - f) / (1000 * 60 * 60 * 24);
        return diff <= 7;
    }).reduce((sum, g) => sum + g.monto, 0);

    document.getElementById('cardTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('cardMes').textContent = `$${estesMes.toFixed(2)}`;
    document.getElementById('cardPromedio').textContent = `$${(total / (datos.length || 1)).toFixed(2)}`;
    document.getElementById('cardSemana').textContent = `$${semana.toFixed(2)}`;
}

function filtrarDatos() {
    renderizar();
}

function eliminarGasto(id) {
    if (confirm('¿Eliminar?')) {
        sistemaBD.caja_chica = sistemaBD.caja_chica.filter(g => g.id !== id);
        guardarBD();
        renderizar();
    }
}

function descargarExcel() {
    const ws = XLSX.utils.json_to_sheet(sistemaBD.caja_chica);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Caja Chica');
    XLSX.writeFile(wb, 'CajaChica.xlsx');
}

function limpiarDatos() {
    if (confirm('¿Limpiar todos los gastos?')) {
        sistemaBD.caja_chica = [];
        guardarBD();
        renderizar();
    }
}

function alternarMenu() {
    document.getElementById('sidebar').classList.toggle('cerrado');
    document.getElementById('mainContent').classList.toggle('expandido');
}
