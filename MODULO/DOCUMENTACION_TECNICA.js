// ================================================
// DOCUMENTACIÓN TÉCNICA SISTEMA ADMINISTRATIVO
// Para desarrolladores y mantenedores
// ================================================

/**
 * ================================
 * ESTRUCTURA DE LA BASE DE DATOS
 * ================================
 */

// UNIDADES
{
    id: "T-001",                    // ID único
    ficha: "T-001",                 // Número de ficha
    categoria: "Autobús",           // Categoría
    marca: "Hyundai",               // Marca
    anio: "2021",                   // Año
    modelo: "County",               // Modelo
    estado: "Activa",               // Activa, En mantenimiento, Inactiva
    kmActual: 150000,               // KM ACTUAL - SE ACTUALIZA AUTOMÁTICAMENTE
    comentario: ""                  // Comentarios
}

// EMPLEADOS
{
    id: "1001",                     // ID único
    codigo: "1001",                 // Código de empleado
    nombre: "Juan Pérez",           // Nombre
    departamento: "Operación",      // Departamento
    estado: "Activo",               // Estado
    telefonoContacto: "555-1234",   // Teléfono
    email: "juan@empresa.com"       // Email
}

// MANTENIMIENTO (y Combustible, Piezas, Goma, Aceite)
{
    id: "abc123",                   // ID único
    tipo: "mantenimiento",          // Tipo: combustible, piezas, goma, aceite, mantenimiento
    unidad: "T-001",                // ID de unidad
    km: 150500,                     // KM ACTUAL - Dispara actualización de KM en unidad
    fecha: "2026-06-04",            // Fecha
    hora: "14:30",                  // Hora
    empleado: "1001",               // ID de empleado
    descripcion: "Cambio de goma",  // Descripción
    monto: 150.00,                  // Monto si aplica
    ...otrosCampos                  // Campos adicionales según tipo
}

// CHOQUES
{
    id: "choque123",
    fecha: "2026-06-04",
    unidad: "T-001",                // ID de unidad
    chofer: "1001",                 // ID de empleado
    tipo: "Choque Frontal",
    severidad: "Grave",             // Leve, Moderado, Grave
    monto: 5000.00,                 // Monto del daño estimado
    descripcion: "Choque con muro"
}

// CAJA CHICA
{
    id: "gasto123",
    fecha: "2026-06-04",
    descripcion: "Compra de útiles",
    categoria: "Útiles",            // Transporte, Alimentos, Útiles, Mantenimiento, Otro
    monto: 50.00,
    empleado: "1001"
}

// TAREAS PENDIENTES
{
    id: "tarea123",
    titulo: "Revisar sistema de frenos",
    descripcion: "Inspección completa",
    tipo: "individual",             // individual, general
    asignado: "1001",               // ID empleado
    estado: "pendiente",            // pendiente, en_progreso, completada
    prioridad: "alta",              // baja, normal, alta
    fechaVencimiento: "2026-06-10",
    fechaCreacion: "2026-06-04",
    proximaActualizacion: "mensual",// semanal, mensual, trimestral
    comentarios: []
}

// CHAT
{
    id: "msg123",
    departamento: "operacion",      // operacion, mantenimiento, administracion, general
    empleado: "Juan Pérez",
    contenido: "¿Cuándo se revisa T-001?",
    fecha: "2026-06-04T14:30:00Z",
    leido: false
}

/**
 * ================================
 * FUNCIONES CRÍTICAS - IMPORT
 * ================================
 */

// Incluir en TODOS los módulos:
// <script src="../BASE_DATOS/database.js"></script>

/**
 * ================================
 * PATRONES DE CÓDIGO
 * ================================
 */

// PATRÓN 1: Inicializar módulo
document.addEventListener('DOMContentLoaded', () => {
    inicializarBD();           // SIEMPRE primero
    cargarUnidades();          // Cargar datos en selectores
    cargarEmpleados();
    renderizar();              // Renderizar tabla/contenido
});

// PATRÓN 2: Registrar mantenimiento
const registro = registrarMantenimiento({
    tipo: 'goma',
    unidad: 'T-001',           // REQUERIDO
    km: 150500,                // REQUERIDO - dispara actualización
    fecha: '2026-06-04',       // REQUERIDO
    hora: '14:30',
    empleado: '1001',
    descripcion: 'Cambio de goma',
    monto: 150
});
// ✅ AUTOMÁTICO: Se actualizará KM de T-001 si 150500 > kmActual

// PATRÓN 3: Actualizar unidad
actualizarUnidad('T-001', {
    kmActual: 150700,
    estado: 'Activa',
    comentario: 'Revision realizada'
});

// PATRÓN 4: Búsqueda
const resultados = buscarArticulo('goma 15x8');
// resultados = {
//     piezas: [...],
//     goma: [...],
//     aceite: [...],
//     inventario: [...]
// }

// PATRÓN 5: Crear tarea
const tarea = crearTarea({
    titulo: 'Mantener T-001',
    descripcion: 'Mantenimiento mensual',
    tipo: 'general',
    asignado: '1001',
    prioridad: 'alta',
    fechaVencimiento: '2026-06-10',
    proximaActualizacion: 'mensual'
});

// PATRÓN 6: Enviar mensaje
enviarMensaje({
    departamento: 'operacion',
    empleado: 'Juan Pérez',
    contenido: 'T-001 necesita mantenimiento'
});

/**
 * ================================
 * FLUJO: ACTUALIZACIÓN KM (CRÍTICO)
 * ================================
 */

// PASO 1: Usuario registra mantenimiento
// En modal: selecciona unidad "T-001", KM "150500"

// PASO 2: guardarRegistro() es llamado
function guardarRegistro(event) {
    event.preventDefault();
    
    const unidad = document.getElementById('selectUnidad').value;  // T-001
    const km = document.getElementById('inputKm').value;           // 150500
    
    // PASO 3: registrarMantenimiento() se ejecuta
    const registro = registrarMantenimiento({
        tipo: 'mantenimiento',
        unidad: unidad,       // T-001
        km: km,               // 150500
        // ... otros datos
    });
}

// DENTRO DE registrarMantenimiento():
function registrarMantenimiento(datos) {
    // ... validaciones ...
    
    const registro = { id, tipo, unidad, km, ... };
    
    // 🔥 MOMENTO CRÍTICO: Actualizar KM
    actualizarKmUnidad(unidad, registro.km);
    
    sistemaBD.mantenimiento.push(registro);
    guardarBD();
    
    return registro;
}

// DENTRO DE actualizarKmUnidad():
function actualizarKmUnidad(idUnidad, kmNuevo) {
    const unidad = sistemaBD.unidades.find(u => u.id === idUnidad);
    
    kmNuevo = convertirNumero(kmNuevo);
    const kmActual = convertirNumero(unidad.kmActual || 0);
    
    // LÓGICA CRÍTICA:
    if (kmNuevo > kmActual) {
        unidad.kmActual = kmNuevo;  // ✅ ACTUALIZAR
        guardarBD();
        console.log(`✓ KM de ${idUnidad} actualizado: ${kmActual} → ${kmNuevo}`);
        return true;
    }
    
    return false;  // No se actualiza si es menor o igual
}

/**
 * ================================
 * VALIDACIONES IMPORTANTES
 * ================================
 */

// VALIDACIÓN 1: Unidad debe existir
const unidad = obtenerUnidad(idUnidad);
if (!unidad) throw new Error(`Unidad ${idUnidad} no existe`);

// VALIDACIÓN 2: Empleado debe existir
const empleado = obtenerEmpleado(idEmpleado);
if (!empleado && idEmpleado) throw new Error(`Empleado ${idEmpleado} no existe`);

// VALIDACIÓN 3: KM debe ser número
const kmNumero = convertirNumero(kmString);
if (isNaN(kmNumero)) throw new Error('KM inválido');

// VALIDACIÓN 4: Fecha formato correcto
const fecha = new Date(fechaString);
if (isNaN(fecha.getTime())) throw new Error('Fecha inválida');

/**
 * ================================
 * UTILIDADES IMPORTANTES
 * ================================
 */

// Generar ID único
const id = generarID();  // Ej: "1717516200000xyz123"

// Convertir a número
const num = convertirNumero("150,500.00");  // 150500

// Formatear número
const formateado = formatoNumero(150500);  // "150.500"

// Formatear fecha
const fecha = formatoFecha("2026-06-04");  // "4/6/2026"

// Guardar BD
guardarBD();  // localStorage.setItem('sistemaBD', JSON.stringify(sistemaBD))

// Obtener datos
const unidades = obtenerUnidades();
const empleados = obtenerEmpleados();
const tareasPendientes = obtenerTareasPendientes();

/**
 * ================================
 * ESTRUCTURA HTML RECOMENDADA
 * ================================
 */

// Cada módulo debe tener:
// 1. SIDEBAR (Navegación)
<aside class="sidebar" id="sidebar">
    <button class="btn-menu" onclick="alternarMenu()">☰</button>
    <div class="logo">
        <div class="logo-icono">K</div>
        <div class="logo-texto">KashlySys</div>
    </div>
    <nav class="menu">
        <a href="../INICIO/index.html" class="menu-item">Inicio</a>
        <a href="modulo.html" class="menu-item activo">Módulo Actual</a>
    </nav>
</aside>

// 2. MAIN CONTENT
<main class="main-content" id="mainContent">
    <!-- TOPBAR -->
    <section class="topbar">
        <div><h1>Título</h1><p>Descripción</p></div>
        <button class="btn btn-azul">Acción</button>
    </section>
    
    <!-- CARDS RESUMEN -->
    <section class="cards">
        <div class="card"><span>Métrica</span><strong id="metrica">0</strong></div>
    </section>
    
    <!-- TABLA -->
    <section class="table-panel">
        <table class="tabla-datos">
            <thead><tr><th>Col1</th><th>Col2</th></tr></thead>
            <tbody id="tablaBody"></tbody>
        </table>
    </section>
</main>

// 3. MODAL
<div id="modal" class="modal">
    <div class="modal-contenido">
        <div class="modal-header">
            <h2>Título</h2>
            <button class="btn-cerrar" onclick="cerrarModal()">✕</button>
        </div>
        <form onsubmit="guardarDatos(event)">
            <!-- FORMULARIO -->
        </form>
    </div>
</div>

/**
 * ================================
 * MEJORAS FUTURAS RECOMENDADAS
 * ================================
 */

// 1. BACKEND
// - Cambiar localStorage → MySQL/PostgreSQL
// - Crear API REST
// - Autenticación de usuarios

// 2. VALIDACIÓN
// - Validación en cliente más estricta
// - Validación en servidor (backend)
// - Manejo de errores más robusto

// 3. REPORTES
// - Reportes en PDF
// - Gráficos más avanzados
// - Análisis de tendencias

// 4. NOTIFICACIONES
// - Sistema de alertas
// - Emails automáticos
// - Notificaciones push

// 5. AUDITORÍA
// - Registro de cambios
// - Historial de modificaciones
// - Permisos por rol

/**
 * ================================
 * COMANDOS ÚTILES
 * ================================
 */

// En consola del navegador (F12):

// Ver todos los datos
console.table(sistemaBD.unidades);
console.table(sistemaBD.mantenimiento);

// Limpiar datos (CUIDADO!)
localStorage.clear();

// Exportar datos
JSON.stringify(sistemaBD);

// Buscar unidad específica
sistemaBD.unidades.find(u => u.ficha === 'T-001');

// Contar registros de mantenimiento de una unidad
sistemaBD.mantenimiento.filter(m => m.unidad === 'T-001').length;

// Total gastado en una categoría
sistemaBD.caja_chica
    .filter(g => g.categoria === 'Combustible')
    .reduce((sum, g) => sum + g.monto, 0);

/**
 * ================================
 * CHECKLISTS PARA NUEVO MÓDULO
 * ================================
 */

// Para crear un nuevo módulo, sigue estos pasos:

// ✅ 1. Crear carpeta: MODULO/
// ✅ 2. Crear archivo HTML
// ✅ 3. Incluir: <script src="../BASE_DATOS/database.js"></script>
// ✅ 4. Incluir: <link rel="stylesheet" href="../MENUS.CSS">
// ✅ 5. Crear archivo JS con initializarBD() en DOMContentLoaded
// ✅ 6. Crear archivo CSS (opcional pero recomendado)
// ✅ 7. Agregar ruta en INICIO/app.js
// ✅ 8. Agregar botón en INICIO/index.html
// ✅ 9. Probar que cargan los datos correctamente
// ✅ 10. Probar que se guarda correctamente

// Ejemplo:
// NUEVO MÓDULO → BASE_DATOS/database.js → INICIO/app.js → INICIO/index.html

/**
 * ================================
 * DEBUGGING
 * ================================
 */

// PROBLEMA: No se actualiza el KM
// SOLUCIÓN: Verifica que:
// 1. módulo carga database.js
// 2. registrarMantenimiento() se ejecuta
// 3. El KM es más alto que el actual
// 4. guardarBD() se ejecuta

// PROBLEMA: Búsqueda no encuentra nada
// SOLUCIÓN: Los artículos deben estar en sistemaBD primero
// Verifica: sistemaBD.piezas, sistemaBD.goma, etc.

// PROBLEMA: localStorage lleno
// SOLUCIÓN: Limpiar datos viejos o aumentar límite
// localStorage.clear();  // ⚠️ CUIDADO!

// PROBLEMA: Datos se pierden al cerrar navegador
// SOLUCIÓN: Backup regular a Excel o backend

/**
 * ================================
 * TESTING
 * ================================
 */

// Crear datos de prueba:
function cargarDatosPrueba() {
    sistemaBD.unidades.push({
        id: "TEST-001",
        ficha: "TEST-001",
        marca: "Test",
        estado: "Activa",
        kmActual: 10000
    });
    
    registrarMantenimiento({
        tipo: 'mantenimiento',
        unidad: 'TEST-001',
        km: 10500,
        fecha: new Date().toISOString().split('T')[0],
        hora: '12:00'
    });
    
    console.log("Datos de prueba cargados");
    console.log(sistemaBD);
}

// Ejecutar en consola:
// cargarDatosPrueba();

/**
 * ================================
 * CONCLUSIÓN
 * ================================
 */

// Este documento proporciona toda la información técnica
// necesaria para entender, mantener y extender el sistema.
//
// Puntos clave:
// 1. Base de datos centralizada en localStorage
// 2. Actualización automática de KM
// 3. Arquitectura modular y escalable
// 4. Funciones CRUD estandarizadas
//
// Para preguntas o actualizaciones, revisar README.md

// Versión: 1.0
// Última actualización: 04 Junio 2026
