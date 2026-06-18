document.addEventListener('DOMContentLoaded', () => {
    inicializarBD();
    renderizar();
});

function abrirModalArticulo() {
    document.getElementById('modalArticulo').classList.add('activo');
}

function cerrarModal() {
    document.getElementById('modalArticulo').classList.remove('activo');
    document.querySelector('form').reset();
}

function guardarArticulo(e) {
    e.preventDefault();
    
    const articulo = {
        id: generarID(),
        descripcion: document.getElementById('descripcion').value,
        referencia: document.getElementById('referencia').value,
        cantidad: parseInt(document.getElementById('cantidad').value),
        precio: parseFloat(document.getElementById('precio').value),
        factura: document.getElementById('factura').value,
        proveedor: document.getElementById('proveedor').value,
        fecha: new Date().toISOString().split('T')[0]
    };

    if (!sistemaBD.pintura) sistemaBD.pintura = [];
    sistemaBD.pintura.push(articulo);
    guardarBD();
    cerrarModal();
    renderizar();
    alert('✓ Artículo registrado');
}

function renderizar() {
    if (!sistemaBD.pintura) sistemaBD.pintura = [];
    
    const tbody = document.getElementById('tablaBody');
    const articulos = sistemaBD.pintura.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    tbody.innerHTML = articulos.map(a => `
        <tr>
            <td>${a.descripcion}</td>
            <td>${a.referencia || '-'}</td>
            <td>${a.cantidad}</td>
            <td>$${a.precio.toFixed(2)}</td>
            <td>$${(a.cantidad * a.precio).toFixed(2)}</td>
            <td>${a.factura || '-'}</td>
            <td><button class="accion" onclick="eliminar('${a.id}')">🗑</button></td>
        </tr>
    `).join('');

    const total = articulos.length;
    const monto = articulos.reduce((sum, a) => sum + (a.cantidad * a.precio), 0);

    document.getElementById('cardTotal').textContent = total;
    document.getElementById('cardMonto').textContent = `$${monto.toFixed(2)}`;
}

function eliminar(id) {
    if (confirm('¿Eliminar?')) {
        sistemaBD.pintura = sistemaBD.pintura.filter(a => a.id !== id);
        guardarBD();
        renderizar();
    }
}

