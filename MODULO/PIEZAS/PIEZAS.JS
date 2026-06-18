// =========================================
// MÓDULO DE PIEZAS - INTEGRACIÓN BD CENTRAL
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarBD();           // 🔥 INICIALIZAR BD CENTRALIZADA
    cargarUnidades();
    cargarEmpleados();
    renderizarUI();
});

function renderizarUI() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <!-- TOPBAR -->
        <section class="topbar card">
            <div>
                <h1>🧩 Módulo de Piezas</h1>
                <p>Registro y control de piezas de repuesto</p>
            </div>
            <div class="top-actions">
                <button class="btn btn-primary" onclick="abrirModalPieza()" style="background: #2196F3; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;">➕ Nueva Pieza</button>
            </div>
        </section>

        <!-- RESUMEN -->
        <section class="summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; padding: 20px; background: white; margin: 20px; border-radius: 8px;">
            <div class="summary-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;"><span>Total Piezas</span><strong id="totalPiezas" style="display: block; font-size: 28px; margin-top: 10px;">0</strong></div>
            <div class="summary-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;"><span>Valor Total</span><strong id="valorTotal" style="display: block; font-size: 28px; margin-top: 10px;">$0.00</strong></div>
            <div class="summary-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;"><span>Registros Este Mes</span><strong id="registrosMes" style="display: block; font-size: 28px; margin-top: 10px;">0</strong></div>
        </section>

        <!-- TABLA -->
        <section class="card" style="background: white; padding: 20px; margin: 20px; border-radius: 8px;">
            <div class="section-header" style="margin-bottom: 15px;">
                <input type="text" id="buscarPieza" placeholder="Buscar pieza..." onkeyup="filtrarTabla()" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            </div>
            <table class="tabla-datos" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Fecha</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Unidad</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Descripción</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Referencia</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Cantidad</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Precio Unit.</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Total</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">KM</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="tablaPiezas" style="background: white;">
                    <tr><td colspan="9" style="text-align: center; padding: 20px;">Cargando...</td></tr>
                </tbody>
            </table>
        </section>
    `;

    renderizarTabla();
}

function abrirModalPieza() {
    const modal = `
        <div id="modal" class="modal" style="display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; overflow-y: auto;">
            <div class="modal-contenido" style="background: white; margin: 50px auto; padding: 30px; width: 90%; max-width: 600px; border-radius: 8px;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Nueva Pieza</h2>
                    <button class="btn-cerrar" onclick="cerrarModal()" style="background: #f5f5f5; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 20px;">✕</button>
                </div>
                <form onsubmit="guardarPieza(event)">
                    <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Unidad *</label>
                            <select id="selectUnidad" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                                <option value="">-- Selecciona Unidad --</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Fecha *</label>
                            <input type="date" id="fecha" required value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Descripción *</label>
                            <input type="text" id="descripcion" placeholder="Ej: Filtro de aire" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Referencia</label>
                            <input type="text" id="referencia" placeholder="Ej: FA-2021-001" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cantidad *</label>
                            <input type="number" id="cantidad" step="0.01" placeholder="0.00" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Precio Unit. *</label>
                            <input type="number" id="precioUnitario" step="0.01" placeholder="0.00" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">KM Actual 📊</label>
                            <input type="number" id="kmActual" placeholder="Ej: 150500" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        </div>
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Empleado</label>
                            <select id="selectEmpleado" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                                <option value="">-- Selecciona Empleado --</option>
                            </select>
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Notas Adicionales</label>
                            <textarea id="descripcionAdicional" placeholder="Notas..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; height: 60px;"></textarea>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <button type="submit" class="btn btn-primary" style="width: 100%; background: #2196F3; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">💾 Guardar Pieza</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    cargarUnidadesEnSelect('selectUnidad');
    cargarEmpleadosEnSelect('selectEmpleado');
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.remove();
}

function cargarUnidadesEnSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Selecciona Unidad --</option>';
    
    const unidades = sistemaBD.unidades || [];
    unidades.forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = `${u.ficha} - ${u.marca} ${u.modelo}`;
        select.appendChild(option);
    });
}

function cargarEmpleadosEnSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Selecciona Empleado --</option>';
    
    const empleados = sistemaBD.empleados || [];
    empleados.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.nombre}`;
        select.appendChild(option);
    });
}

function guardarPieza(event) {
    event.preventDefault();

    const unidad = document.getElementById('selectUnidad').value.trim();
    const fecha = document.getElementById('fecha').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const referencia = document.getElementById('referencia').value.trim();
    const cantidad = parseFloat(document.getElementById('cantidad').value) || 0;
    const precioUnitario = parseFloat(document.getElementById('precioUnitario').value) || 0;
    const kmActual = parseFloat(document.getElementById('kmActual').value) || 0;
    const empleado = document.getElementById('selectEmpleado').value.trim();
    const descripcionAdicional = document.getElementById('descripcionAdicional').value.trim();

    // VALIDACIONES
    if (!unidad) {
        alert('❌ Debes seleccionar una unidad');
        return;
    }
    if (!descripcion) {
        alert('❌ Debes ingresar una descripción');
        return;
    }
    if (cantidad <= 0) {
        alert('❌ La cantidad debe ser mayor a 0');
        return;
    }
    if (precioUnitario <= 0) {
        alert('❌ El precio unitario debe ser mayor a 0');
        return;
    }

    const monto = cantidad * precioUnitario;

    // 🔥 REGISTRAR EN BD CENTRALIZADA
    registrarMantenimiento({
        tipo: 'piezas',
        unidad: unidad,
        km: kmActual,  // 🔥 AUTOMÁTICAMENTE ACTUALIZA KM
        fecha: fecha,
        hora: new Date().toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5),
        descripcion: `${descripcion} (Ref: ${referencia}) - Qty: ${cantidad} x $${precioUnitario}`,
        monto: monto,
        // Campos adicionales
        referencia: referencia,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        empleado: empleado,
        descripcionAdicional: descripcionAdicional
    });

    cerrarModal();
    renderizarUI();
    alert('✓ Pieza registrada correctamente.\n✓ KM de la unidad sincronizado.');
}

function renderizarTabla() {
    const tbody = document.getElementById('tablaPiezas');
    const piezas = sistemaBD.piezas || [];

    if (piezas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No hay piezas registradas</td></tr>';
        actualizarResumen();
        return;
    }

    tbody.innerHTML = piezas.map(p => `
        <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 12px;">${p.fecha}</td>
            <td style="padding: 12px;">${p.unidad}</td>
            <td style="padding: 12px;">${p.descripcion}</td>
            <td style="padding: 12px;">${p.referencia || '-'}</td>
            <td style="padding: 12px;">${p.cantidad}</td>
            <td style="padding: 12px;">$${p.precioUnitario?.toFixed(2) || '0.00'}</td>
            <td style="padding: 12px;">$${p.monto?.toFixed(2) || '0.00'}</td>
            <td style="padding: 12px;">${p.km || '-'}</td>
            <td style="padding: 12px;">
                <button class="btn-small btn-delete" onclick="eliminarPieza('${p.id}')" style="background: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">🗑</button>
            </td>
        </tr>
    `).join('');

    actualizarResumen();
}

function filtrarTabla() {
    const termino = document.getElementById('buscarPieza').value.toLowerCase();
    const piezas = sistemaBD.piezas || [];

    const filtradas = piezas.filter(p =>
        p.descripcion?.toLowerCase().includes(termino) ||
        p.referencia?.toLowerCase().includes(termino) ||
        p.unidad?.toLowerCase().includes(termino)
    );

    const tbody = document.getElementById('tablaPiezas');
    if (filtradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">No hay resultados</td></tr>';
        return;
    }

    tbody.innerHTML = filtradas.map(p => `
        <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 12px;">${p.fecha}</td>
            <td style="padding: 12px;">${p.unidad}</td>
            <td style="padding: 12px;">${p.descripcion}</td>
            <td style="padding: 12px;">${p.referencia || '-'}</td>
            <td style="padding: 12px;">${p.cantidad}</td>
            <td style="padding: 12px;">$${p.precioUnitario?.toFixed(2) || '0.00'}</td>
            <td style="padding: 12px;">$${p.monto?.toFixed(2) || '0.00'}</td>
            <td style="padding: 12px;">${p.km || '-'}</td>
            <td style="padding: 12px;">
                <button class="btn-small btn-delete" onclick="eliminarPieza('${p.id}')" style="background: #f44336; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer;">🗑</button>
            </td>
        </tr>
    `).join('');
}

function eliminarPieza(id) {
    if (!confirm('¿Seguro que deseas eliminar esta pieza?')) return;

    const piezas = sistemaBD.piezas || [];
    const index = piezas.findIndex(p => p.id === id);
    if (index > -1) {
        piezas.splice(index, 1);
        guardarBD();
    }

    renderizarUI();
}

function actualizarResumen() {
    const piezas = sistemaBD.piezas || [];
    const total = piezas.length;
    const valor = piezas.reduce((sum, p) => sum + (p.monto || 0), 0);
    
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();
    
    const registrosMes = piezas.filter(p => {
        const [y, m] = p.fecha.split('-');
        return parseInt(m) === mesActual && parseInt(y) === anioActual;
    }).length;

    document.getElementById('totalPiezas').textContent = total;
    document.getElementById('valorTotal').textContent = `$${valor.toFixed(2)}`;
    document.getElementById('registrosMes').textContent = registrosMes;
}

// Funciones helpers
function cargarUnidades() {
    // Llamado al inicio para que la BD esté lista
}

function cargarEmpleados() {
    // Llamado al inicio para que la BD esté lista
}