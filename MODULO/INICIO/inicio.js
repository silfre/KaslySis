document.addEventListener("DOMContentLoaded", function () {
    cargarDatosUsuario();
    actualizarFechaHora();
    marcarMenuActivo();

    setInterval(actualizarFechaHora, 1000);
});

function cargarDatosUsuario() {
    const nombre = localStorage.getItem("kashly_usuario") || "Administrador";

    const nombreUsuario = document.getElementById("nombreUsuario");

    if (nombreUsuario) {
        nombreUsuario.textContent = nombre;
    }
}

function actualizarFechaHora() {
    const ahora = new Date();

    const fecha = ahora.toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    const hora = ahora.toLocaleTimeString("es-DO", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const fechaActual = document.getElementById("fechaActual");
    const horaActual = document.getElementById("horaActual");

    if (fechaActual) fechaActual.textContent = fecha;
    if (horaActual) horaActual.textContent = hora;
}

function toggleSubmenu(boton) {
    const grupo = boton.closest(".menu-grupo");

    if (!grupo) return;

    grupo.classList.toggle("abierto");
}

function marcarMenuActivo() {
    const rutaActual = window.location.pathname.toLowerCase();

    document.querySelectorAll(".menu a").forEach(link => {
        const href = link.getAttribute("href");

        if (!href) return;

        const limpio = href
            .replace("../", "")
            .replace("./", "")
            .toLowerCase();

        if (rutaActual.includes(limpio)) {
            link.classList.add("activo");

            const grupo = link.closest(".menu-grupo");

            if (grupo) {
                grupo.classList.add("abierto");
            }
        }
    });
}

function alternarMenu() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");

    sidebar.classList.toggle("sidebar-cerrado");
    mainContent.classList.toggle("main-expandido");
}

function cerrarSesion() {
    localStorage.removeItem("kashly_sesion_activa");
    localStorage.removeItem("kashly_usuario");
    localStorage.removeItem("kashly_nombre");
    localStorage.removeItem("kashly_rol");

    window.location.href = "../LOGIN/index.html";
}