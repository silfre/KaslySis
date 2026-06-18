const usuariosSistema = [
    {
        usuario: "admin",
        clave: "admin123",
        nombre: "Administrador",
        rol: "ADMINISTRADOR"
    },
    {
        usuario: "almacen",
        clave: "1234",
        nombre: "Encargado de Almacén",
        rol: "ALMACEN"
    }
];

document.addEventListener("DOMContentLoaded", function () {
    verificarSesionExistente();
    cargarUsuarioRecordado();

    const formLogin = document.getElementById("formLogin");

    formLogin.addEventListener("submit", function (event) {
        event.preventDefault();
        iniciarSesion();
    });
});

function verificarSesionExistente() {
    const sesion = localStorage.getItem("kashly_sesion_activa");

    if (sesion === "SI") {
        window.location.href = "../INICIO/inicio.html";
    }
}

function cargarUsuarioRecordado() {
    const usuarioRecordado = localStorage.getItem("kashly_usuario_recordado");

    if (usuarioRecordado) {
        document.getElementById("usuario").value = usuarioRecordado;
        document.getElementById("recordarUsuario").checked = true;
    }
}

function iniciarSesion() {
    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value.trim();
    const mensaje = document.getElementById("mensajeLogin");

    if (usuario === "admin" && clave === "admin123") {
        localStorage.setItem("kashly_sesion_activa", "SI");
        localStorage.setItem("kashly_usuario", "Administrador");

        mensaje.textContent = "Inicio de sesión correcto...";
        mensaje.classList.add("ok");

        setTimeout(() => {
            window.location.href = "../INICIO/inicio.html";
        }, 600);

    } else {
        mensaje.textContent = "Usuario o contraseña incorrectos.";
        mensaje.classList.add("error");
    }
}

function mostrarClave() {
    const inputClave = document.getElementById("clave");

    if (inputClave.type === "password") {
        inputClave.type = "text";
    } else {
        inputClave.type = "password";
    }
}