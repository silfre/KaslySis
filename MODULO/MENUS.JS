document.addEventListener("DOMContentLoaded", function () {
    cargarMenuGlobal();
});

function cargarMenuGlobal() {
    const contenedor = document.getElementById("menuGlobal");

    if (!contenedor) return;

    contenedor.innerHTML = `
        <aside class="sidebar" id="sidebar">

            <button type="button" class="btn-menu" onclick="alternarMenu()" title="Abrir/Cerrar menú">
                ☰
            </button>

            <div class="logo">
                <div class="logo-icono">K</div>
                <div>
                    <div class="logo-texto">Kashly<span>Sys</span></div>
                    <div class="logo-subtitulo">Sistema Administrativo</div>
                </div>
            </div>

            <div class="menu-titulo">Menú Principal</div>

            <nav class="menu">

                <a href="../INICIO/index.html" class="menu-link" data-menu="inicio">
                    <span class="menu-icono">🏠</span>
                    <span class="menu-texto">Inicio</span>
                </a>

                <div class="menu-grupo" data-grupo="mantenimiento">
                    <div class="menu-padre">
                        <a href="../MANTENIMIENTO/mantenimiento.html" class="menu-link" data-menu="mantenimiento">
                            <span class="menu-icono">🛠️</span>
                            <span class="menu-texto">Mantenimiento</span>
                        </a>

                        <button type="button" class="btn-submenu" onclick="toggleSubmenu(this)">▾</button>
                    </div>

                    <div class="submenu">
                        <a href="../MANTENIMIENTO/mantenimiento.html">Mantenimiento General</a>
                        <a href="../MANTENIMIENTO/MantenimientoPendiente.html">Mantenimiento Pendiente</a>
                    </div>
                </div>

                <div class="menu-grupo" data-grupo="combustible">
                    <div class="menu-padre">
                        <a href="../COMBUSTIBLE/modulo-combustible.html" class="menu-link" data-menu="combustible">
                            <span class="menu-icono">⛽</span>
                            <span class="menu-texto">Combustible</span>
                        </a>

                        <button type="button" class="btn-submenu" onclick="toggleSubmenu(this)">▾</button>
                    </div>

                    <div class="submenu">
                        <a href="../COMBUSTIBLE/modulo-combustible.html">Rendimiento Combustible</a>
                        <a href="../COMBUSTIBLE/entrada-combustible.html">Entrada Combustible</a>
                        <a href="../COMBUSTIBLE/reporte-combustible.html">Reporte Combustible</a>
                    </div>
                </div>

                <div class="menu-grupo" data-grupo="piezas">
                    <div class="menu-padre">
                        <a href="../PIEZAS/PIEZAS.HTML" class="menu-link" data-menu="piezas">
                            <span class="menu-icono">⚙️</span>
                            <span class="menu-texto">Piezas</span>
                        </a>

                        <button type="button" class="btn-submenu" onclick="toggleSubmenu(this)">▾</button>
                    </div>

                    <div class="submenu">
                        <a href="../PIEZAS/PIEZAS.HTML">Inicio Piezas</a>
                        <a href="../PIEZAS/GOMA.HTML">Goma</a>
                    
                    </div>
                </div>


                <div class="menu-grupo" data-grupo="aceite">
                    <div class="menu-padre">
                        <a href="../RENDIMIENTO DE ACEITE/RENDIMIENTO_ACEITE.html" class="menu-link" data-menu="aceite">
                            <span class="menu-icono">A</span>
                            <span class="menu-texto">Aceite</span>
                        </a>

                        <button type="button" class="btn-submenu" onclick="toggleSubmenu(this)">▾</button>
                    </div>

                    <div class="submenu">
                           <a href="../RENDIMIENTO DE ACEITE/RENDIMIENTO_ACEITE.html">Aceite</a>
                            <a href="../RENDIMIENTO DE ACEITE/compra-tanque.html">Compra Tanque</a>
                            <a href="../RENDIMIENTO DE ACEITE/reporte-tanque.html">Reporte Tanque</a>
                    </div>
                </div>


                <div class="menu-grupo" data-grupo="operaciones">
                    <div class="menu-padre">
                        <a href="../PINTURA/pintura.html" class="menu-link" data-menu="operaciones">
                            <span class="menu-icono">🎨</span>
                            <span class="menu-texto">Operaciones</span>
                        </a>

                        <button type="button" class="btn-submenu" onclick="toggleSubmenu(this)">▾</button>
                    </div>

                    <div class="submenu">
                        <a href="../PINTURA/pintura.html">Pintura</a>
                        <a href="../CHOQUES/choques-unidad.html">Choques por Unidad</a>
                        <a href="../CHOQUES/choques-chofer.html">Choques por Chofer</a>
                        <a href="../ALQUILER/unidades-alquiladas.html">Unidades Alquiladas</a>
                        <a href="../LIMPIEZA/limpieza-fumigacion.html">Limpieza / Fumigación</a>
                        <a href="../CAJA_CHICA/caja-chica.html">Caja Chica</a>
                         <a href="../CHOQUES/seguro.html">Seguro</a>
                    </div>
                </div>

                <div class="menu-grupo" data-grupo="administracion">
                    <div class="menu-padre">
                        <a href="../DATO/modulo_unidades.html" class="menu-link" data-menu="administracion">
                            <span class="menu-icono">📁</span>
                            <span class="menu-texto">Administración</span>
                        </a>

                        <button type="button" class="btn-submenu" onclick="toggleSubmenu(this)">▾</button>
                    </div>

                    <div class="submenu">
                        <a href="../DATO/modulo_unidades.html">Unidades / Datos</a>
                        <a href="../DATO/modulo_empleados.html">Empleados</a>
                        
                    </div>
                </div>

                <div class="menu-grupo" data-grupo="herramientas">
                    <div class="menu-padre">
                        <a href="../BUSQUEDA/busqueda.html" class="menu-link" data-menu="herramientas">
                            <span class="menu-icono">🔎</span>
                            <span class="menu-texto">Herramientas</span>
                        </a>

                        <button type="button" class="btn-submenu" onclick="toggleSubmenu(this)">▾</button>
                    </div>

                    <div class="submenu">
                        <a href="../BUSQUEDA/busqueda.html">Búsqueda</a>
                        <a href="../ETIQUETAS/etiquetas.html">Etiquetas</a>
                        <a href="../CHAT/chat.html">Chat</a>
                        <a href="../IA/ia-consultas.html">IA Consultas</a>
                    </div>
                </div>

            </nav>

            <div class="usuario-box">
                <div class="usuario-avatar">👤</div>

                <div>
                    <strong id="usuarioMenu">Administrador</strong>
                    <small>Sesión activa</small>
                </div>

                <button type="button" class="btn-cerrar-sesion" onclick="cerrarSesion()" title="Cerrar sesión">
                    ⏻
                </button>
            </div>

        </aside>
    `;

    aplicarEstadoMenu();
    marcarMenuActivo();
    cargarUsuarioMenu();
}

function toggleSubmenu(boton) {
    const grupo = boton.closest(".menu-grupo");

    if (!grupo) return;

    grupo.classList.toggle("abierto");

    guardarSubmenusAbiertos();
}

function alternarMenu() {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    sidebar.classList.toggle("cerrado");
    document.body.classList.toggle("menu-cerrado");

    const cerrado = document.body.classList.contains("menu-cerrado");

    localStorage.setItem("kashly_menu_cerrado", cerrado ? "SI" : "NO");
}

function aplicarEstadoMenu() {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    const cerrado = localStorage.getItem("kashly_menu_cerrado");

    if (cerrado === "SI") {
        sidebar.classList.add("cerrado");
        document.body.classList.add("menu-cerrado");
    } else {
        sidebar.classList.remove("cerrado");
        document.body.classList.remove("menu-cerrado");
    }
}

function marcarMenuActivo() {
    const rutaActual = window.location.pathname.toLowerCase();

    document.querySelectorAll(".menu a").forEach(link => {
        const href = link.getAttribute("href");

        if (!href) return;

        const rutaLimpia = href
            .replace("../", "")
            .replace("./", "")
            .toLowerCase();

        if (rutaActual.includes(rutaLimpia)) {
            link.classList.add("activo");

            const grupo = link.closest(".menu-grupo");

            if (grupo) {
                grupo.classList.add("abierto");
            }
        }
    });

    abrirGrupoPorRuta(rutaActual);
    restaurarSubmenusAbiertos();
}

function abrirGrupoPorRuta(ruta) {
    const grupos = {
        mantenimiento: ["mantenimiento"],
        combustible: ["combustible"],
        piezas: ["piezas", "goma"],
        aceite: ["rendimiento de aceite", "compra-tanque", "reporte-tanque"],
        operaciones: ["pintura", "choques", "alquiler", "limpieza"],
        administracion: ["dato", "empleados", "caja_chica"],
        herramientas: ["busqueda", "etiquetas", "chat", "ia"]
    };

    Object.keys(grupos).forEach(nombreGrupo => {
        const coincide = grupos[nombreGrupo].some(valor => ruta.includes(valor));

        if (coincide) {
            const grupo = document.querySelector(`[data-grupo="${nombreGrupo}"]`);

            if (grupo) {
                grupo.classList.add("abierto");
            }
        }
    });
}

function guardarSubmenusAbiertos() {
    const abiertos = [];

    document.querySelectorAll(".menu-grupo.abierto").forEach(grupo => {
        const nombre = grupo.getAttribute("data-grupo");

        if (nombre) {
            abiertos.push(nombre);
        }
    });

    localStorage.setItem("kashly_submenus_abiertos", JSON.stringify(abiertos));
}

function restaurarSubmenusAbiertos() {
    const datos = localStorage.getItem("kashly_submenus_abiertos");

    if (!datos) return;

    try {
        const abiertos = JSON.parse(datos);

        abiertos.forEach(nombre => {
            const grupo = document.querySelector(`[data-grupo="${nombre}"]`);

            if (grupo) {
                grupo.classList.add("abierto");
            }
        });

    } catch (error) {
        localStorage.removeItem("kashly_submenus_abiertos");
    }
}

function cargarUsuarioMenu() {
    const nombre = localStorage.getItem("kashly_usuario") || 
                   localStorage.getItem("kashly_nombre") || 
                   "Administrador";

    const usuarioMenu = document.getElementById("usuarioMenu");

    if (usuarioMenu) {
        usuarioMenu.textContent = nombre;
    }
}

function cerrarSesion() {
    localStorage.removeItem("kashly_sesion_activa");
    localStorage.removeItem("kashly_usuario");
    localStorage.removeItem("kashly_nombre");
    localStorage.removeItem("kashly_rol");

    window.location.href = "../LOGIN/login.html";
}