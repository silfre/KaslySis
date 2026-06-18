/**
 * ========================================
 * SISTEMA DE BASE DE DATOS CENTRALIZADO
 * Controla toda la lógica de datos del sistema
 * ========================================
 */

// ==========================================
// ESTRUCTURA GLOBAL DE DATOS
// ==========================================
const sistemaBD = {
    unidades: [],
    empleados: [],
    combustible: [],
    mantenimiento: [],
    piezas: [],
    goma: [],
    aceite: [],
    caja_chica: [],
    choques: [],
    pintura: [],
    inventario: [],
    tareas_pendientes: [],
    chat: []
};

// ==========================================
// INICIALIZACIÓN Y PERSISTENCIA
// ==========================================
function inicializarBD() {
    const datosGuardados = localStorage.getItem('sistemaBD');
    
    if (datosGuardados) {
        try {
            Object.assign(sistemaBD, JSON.parse(datosGuardados));
        } catch (e) {
            console.error("Error al cargar BD:", e);
        }
    } else {
        cargarDatosIniciales();
    }
}

function guardarBD() {
    localStorage.setItem('sistemaBD', JSON.stringify(sistemaBD));
}

function cargarDatosIniciales() {
    // Cargar catálogos iniciales
    sistemaBD.unidades = [
        { id: "T-001", ficha: "T-001", categoria: "Autobús", marca: "Hyundai", anio: "2021", modelo: "County", estado: "Activa", kmActual: 150000, comentario: "" },
        { id: "T-002", ficha: "T-002", categoria: "Minibús", marca: "Toyota", anio: "2019", modelo: "Coaster", estado: "Activa", kmActual: 200000, comentario: "" },
        { id: "T-003", ficha: "T-003", categoria: "Camioneta", marca: "Nissan", anio: "2020", modelo: "Urvan", estado: "Activa", kmActual: 175000, comentario: "" }
    ];

    sistemaBD.empleados = [
        { id: "1001", codigo: "1001", nombre: "Juan Pérez", departamento: "Operación", estado: "Activo" },
        { id: "1002", codigo: "1002", nombre: "Carlos Gómez", departamento: "Operación", estado: "Activo" },
        { id: "1003", codigo: "1003", nombre: "Miguel Santana", departamento: "Operación", estado: "Activo" },
        { id: "1004", codigo: "1004", nombre: "Pedro Jiménez", departamento: "Mantenimiento", estado: "Activo" }
    ];

    guardarBD();
}

// ==========================================
// LÓGICA CRÍTICA: ACTUALIZAR KM DE UNIDAD
// ==========================================
/**
 * Actualiza el KM de una unidad si el nuevo valor es más alto
 * Se ejecuta cada vez que se registra cualquier mantenimiento
 * @param {string} idUnidad - ID de la unidad (ej: "T-001")
 * @param {number} kmNuevo - KM actual del registro
 * @returns {boolean} - true si fue actualizado
 */
function actualizarKmUnidad(idUnidad, kmNuevo) {
    const unidad = sistemaBD.unidades.find(u => u.id === idUnidad || u.ficha === idUnidad);
    
    if (!unidad) {
        console.warn(`Unidad ${idUnidad} no encontrada`);
        return false;
    }

    kmNuevo = convertirNumero(kmNuevo);
    const kmActual = convertirNumero(unidad.kmActual || 0);

    if (kmNuevo > kmActual) {
        unidad.kmActual = kmNuevo;
        guardarBD();
        console.log(`✓ KM de ${idUnidad} actualizado: ${kmActual} → ${kmNuevo}`);
        return true;
    }

    return false;
}

/**
 * Obtiene el KM actual de una unidad
 */
function obtenerKmActual(idUnidad) {
    const unidad = sistemaBD.unidades.find(u => u.id === idUnidad || u.ficha === idUnidad);
    return unidad ? convertirNumero(unidad.kmActual || 0) : 0;
}

// ==========================================
// REGISTRAR MANTENIMIENTO (Función Central)
// ==========================================
/**
 * Registra cualquier tipo de mantenimiento y actualiza KM automáticamente
 * @param {Object} datos - { tipo, unidad, km, fecha, empleado, descripcion, etc }
 * @returns {Object} - Registro guardado
 */
function registrarMantenimiento(datos) {
    // Validar unidad
    const unidad = sistemaBD.unidades.find(u => u.id === datos.unidad || u.ficha === datos.unidad);
    if (!unidad) {
        throw new Error(`Unidad ${datos.unidad} no existe`);
    }

    // Crear registro base
    const registro = {
        id: generarID(),
        tipo: datos.tipo, // 'combustible', 'piezas', 'goma', 'aceite', 'mantenimiento'
        unidad: unidad.id,
        km: convertirNumero(datos.km || 0),
        fecha: datos.fecha || new Date().toISOString().split('T')[0],
        hora: datos.hora || new Date().toTimeString().split(' ')[0],
        empleado: datos.empleado || "",
        descripcion: datos.descripcion || "",
        monto: convertirNumero(datos.monto || 0),
        ...datos // Incluir cualquier campo adicional
    };

    // **ACTUALIZAR KM DE LA UNIDAD**
    actualizarKmUnidad(unidad.id, registro.km);

    // Guardar en el módulo correspondiente
    switch(datos.tipo) {
        case 'combustible':
            sistemaBD.combustible.push(registro);
            break;
        case 'piezas':
            sistemaBD.piezas.push(registro);
            break;
        case 'goma':
            sistemaBD.goma.push(registro);
            break;
        case 'aceite':
            sistemaBD.aceite.push(registro);
            break;
        case 'mantenimiento':
        default:
            sistemaBD.mantenimiento.push(registro);
    }

    guardarBD();
    return registro;
}

// ==========================================
// CRUD UNIDADES
// ==========================================
function crearUnidad(datos) {
    const unidad = {
        id: `T-${String(sistemaBD.unidades.length + 1).padStart(3, '0')}`,
        ficha: datos.ficha || `T-${String(sistemaBD.unidades.length + 1).padStart(3, '0')}`,
        categoria: datos.categoria,
        marca: datos.marca,
        anio: datos.anio,
        modelo: datos.modelo,
        estado: datos.estado || "Activa",
        kmActual: convertirNumero(datos.kmActual || 0),
        comentario: datos.comentario || ""
    };

    sistemaBD.unidades.push(unidad);
    guardarBD();
    return unidad;
}

function actualizarUnidad(idUnidad, datos) {
    const unidad = sistemaBD.unidades.find(u => u.id === idUnidad);
    if (!unidad) throw new Error(`Unidad ${idUnidad} no existe`);

    Object.assign(unidad, datos);
    guardarBD();
    return unidad;
}

function eliminarUnidad(idUnidad) {
    const index = sistemaBD.unidades.findIndex(u => u.id === idUnidad);
    if (index === -1) throw new Error(`Unidad ${idUnidad} no existe`);

    sistemaBD.unidades.splice(index, 1);
    guardarBD();
}

function obtenerUnidades() {
    return sistemaBD.unidades;
}

function obtenerUnidad(idUnidad) {
    return sistemaBD.unidades.find(u => u.id === idUnidad || u.ficha === idUnidad);
}

// ==========================================
// CRUD EMPLEADOS
// ==========================================
function crearEmpleado(datos) {
    const empleado = {
        id: generarID(),
        codigo: datos.codigo,
        nombre: datos.nombre,
        departamento: datos.departamento || "Operación",
        estado: datos.estado || "Activo",
        telefonoContacto: datos.telefonoContacto || "",
        email: datos.email || ""
    };

    sistemaBD.empleados.push(empleado);
    guardarBD();
    return empleado;
}

function actualizarEmpleado(idEmpleado, datos) {
    const empleado = sistemaBD.empleados.find(e => e.id === idEmpleado);
    if (!empleado) throw new Error(`Empleado ${idEmpleado} no existe`);

    Object.assign(empleado, datos);
    guardarBD();
    return empleado;
}

function obtenerEmpleados() {
    return sistemaBD.empleados;
}

function obtenerEmpleado(idEmpleado) {
    return sistemaBD.empleados.find(e => e.id === idEmpleado || e.codigo === idEmpleado);
}

// ==========================================
// TAREAS PENDIENTES
// ==========================================
function crearTarea(datos) {
    const tarea = {
        id: generarID(),
        titulo: datos.titulo,
        descripcion: datos.descripcion || "",
        tipo: datos.tipo || "general", // 'individual' o 'general'
        asignado: datos.asignado || "", // ID del empleado
        estado: datos.estado || "pendiente", // pendiente, en_progreso, completada
        prioridad: datos.prioridad || "normal", // baja, normal, alta
        fechaVencimiento: datos.fechaVencimiento || "",
        fechaCreacion: new Date().toISOString().split('T')[0],
        proximaActualizacion: datos.proximaActualizacion || "mensual",
        comentarios: []
    };

    sistemaBD.tareas_pendientes.push(tarea);
    guardarBD();
    return tarea;
}

function actualizarTarea(idTarea, datos) {
    const tarea = sistemaBD.tareas_pendientes.find(t => t.id === idTarea);
    if (!tarea) throw new Error(`Tarea ${idTarea} no existe`);

    Object.assign(tarea, datos);
    guardarBD();
    return tarea;
}

function obtenerTareasPendientes() {
    return sistemaBD.tareas_pendientes.filter(t => t.estado !== "completada");
}

// ==========================================
// CHAT GRUPAL
// ==========================================
function enviarMensaje(datos) {
    const mensaje = {
        id: generarID(),
        departamento: datos.departamento,
        empleado: datos.empleado,
        contenido: datos.contenido,
        fecha: new Date().toISOString(),
        leido: false
    };

    sistemaBD.chat.push(mensaje);
    guardarBD();
    return mensaje;
}

function obtenerMensajesdepartamento(departamento) {
    return sistemaBD.chat.filter(m => m.departamento === departamento)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// ==========================================
// BÚSQUEDA Y FILTRADO
// ==========================================
function buscarArticulo(termino) {
    const termino_lower = termino.toLowerCase();
    const resultados = {
        piezas: [],
        goma: [],
        aceite: [],
        inventario: []
    };

    resultados.piezas = sistemaBD.piezas.filter(p =>
        (p.descripcion || "").toLowerCase().includes(termino_lower) ||
        (p.referencia || "").toLowerCase().includes(termino_lower)
    );

    resultados.goma = sistemaBD.goma.filter(g =>
        (g.descripcion || "").toLowerCase().includes(termino_lower) ||
        (g.referencia || "").toLowerCase().includes(termino_lower)
    );

    resultados.aceite = sistemaBD.aceite.filter(a =>
        (a.descripcion || "").toLowerCase().includes(termino_lower) ||
        (a.tipo || "").toLowerCase().includes(termino_lower)
    );

    resultados.inventario = sistemaBD.inventario.filter(i =>
        (i.nombre || "").toLowerCase().includes(termino_lower) ||
        (i.referencia || "").toLowerCase().includes(termino_lower)
    );

    return resultados;
}

// ==========================================
// UTILIDADES
// ==========================================
function generarID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function convertirNumero(valor) {
    if (typeof valor === 'number') return valor;
    const num = parseFloat(String(valor || 0).replace(/,/g, '.'));
    return isNaN(num) ? 0 : num;
}

function formatoNumero(num) {
    return Math.round(convertirNumero(num)).toLocaleString('es-ES');
}

function formatoFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES');
}

// Inicializar BD cuando carga la página
document.addEventListener('DOMContentLoaded', inicializarBD);
