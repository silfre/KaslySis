let deptActual = 'general';

document.addEventListener('DOMContentLoaded', () => {
    inicializarBD();
    cargarMensajes();
});

function cambiarDept(dept) {
    deptActual = dept;
    cargarMensajes();
}

function enviarMensaje() {
    const input = document.getElementById('inputMensaje');
    const texto = input.value.trim();
    
    if (!texto) return;

    const mensaje = {
        id: generarID(),
        departamento: deptActual,
        empleado: 'Usuario', // En una versión real, obtener del sesión
        contenido: texto,
        fecha: new Date().toISOString(),
        leido: false
    };

    sistemaBD.chat.push(mensaje);
    guardarBD();
    input.value = '';
    cargarMensajes();
    
    // Auto-scroll al final
    setTimeout(() => {
        const container = document.getElementById('mensajesContainer');
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function enviarSiEnter(e) {
    if (e.key === 'Enter') enviarMensaje();
}

function cargarMensajes() {
    const container = document.getElementById('mensajesContainer');
    const mensajes = sistemaBD.chat.filter(m => m.departamento === deptActual)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    container.innerHTML = mensajes.map(m => {
        const fecha = new Date(m.fecha);
        const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="mensaje">
                <div class="msg-header">
                    <strong>${m.empleado}</strong>
                    <span class="msg-hora">${hora}</span>
                </div>
                <div class="msg-contenido">${m.contenido}</div>
            </div>
        `;
    }).join('');

    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 50);
}

function alternarMenu() {
    document.getElementById('sidebar').classList.toggle('cerrado');
    document.getElementById('mainContent').classList.toggle('expandido');
}
