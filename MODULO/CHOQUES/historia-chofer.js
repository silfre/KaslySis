/* ======================================================
   HISTORIA DE CHOFER - PÁGINA COMPLETA
====================================================== */

const PUNTOS_INICIALES_HISTORIA = 100;

const PUNTOS_POR_SEVERIDAD_HISTORIA = {
    "Leve": 5,
    "Moderado": 10,
    "Grave": 20
};

let choferActualHistoria = null;
let choquesChoferHistoria = [];
let galeriasHistoria = {};
let fotosVisorHistoria = [];
let indiceFotoHistoria = 0;

document.addEventListener("DOMContentLoaded", () => {
    inicializarBD();

    if (!sistemaBD.choques) {
        sistemaBD.choques = [];
        guardarBD();
    }

    cargarHistoriaChofer();
});

function cargarHistoriaChofer() {
    const params = new URLSearchParams(window.location.search);
    const choferId = params.get("chofer");

    if (!choferId) {
        alert("No se recibió el chofer.");
        window.location.href = "choques-chofer.html";
        return;
    }

    choferActualHistoria = obtenerEmpleados().find(e => String(e.id) === String(choferId));

    if (!choferActualHistoria) {
        alert("No se encontró el chofer.");
        window.location.href = "choques-chofer.html";
        return;
    }

    choquesChoferHistoria = sistemaBD.choques
        .filter(c => String(c.chofer) === String(choferId))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    pintarEncabezadoChofer();
    renderizarHistoriaChofer();
}

function pintarEncabezadoChofer() {
    const nombre = obtenerNombreChoferHistoria(choferActualHistoria);
    const puntosRestados = calcularPuntosRestadosHistoria(choquesChoferHistoria);
    const puntosQuedan = Math.max(0, PUNTOS_INICIALES_HISTORIA - puntosRestados);
    const severidadMayor = obtenerSeveridadMayorHistoria(choquesChoferHistoria);

    document.getElementById("nombreChoferPagina").textContent = nombre;
    document.getElementById("subtituloChoferPagina").textContent = `Historial completo de ${nombre}.`;

    document.getElementById("fotoChoferPagina").innerHTML = generarFotoChoferPagina(choferActualHistoria);

    document.getElementById("totalChoquesChofer").textContent = choquesChoferHistoria.length;
    document.getElementById("puntosInicialesChofer").textContent = PUNTOS_INICIALES_HISTORIA;
    document.getElementById("puntosRestadosChofer").textContent = `-${puntosRestados}`;

    const puntosQuedanElemento = document.getElementById("puntosQuedanChofer");
    puntosQuedanElemento.textContent = puntosQuedan;
    puntosQuedanElemento.className = puntosQuedan <= 40 ? "puntos-bajo" : "puntos-normal";

    document.getElementById("severidadMayorChofer").textContent = severidadMayor;
}

function renderizarHistoriaChofer() {
    const tbody = document.getElementById("tablaHistoriaChofer");
    const buscador = document.getElementById("buscadorHistoria");
    const filtro = buscador ? buscador.value.toLowerCase().trim() : "";

    galeriasHistoria = {};

    let datos = choquesChoferHistoria.filter(c => {
        const unidad = obtenerUnidad(c.unidad);

        const texto = `
            ${formatearFechaHistoria(c.fecha)}
            ${unidad?.ficha || c.unidad || ""}
            ${obtenerTipoGuaguaHistoria(unidad)}
            ${mostrarTiposChoqueHistoria(c)}
            ${c.severidad || ""}
            ${c.descripcion || ""}
        `.toLowerCase();

        return texto.includes(filtro);
    });

    if (datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:20px;">
                    Este chofer no tiene choques registrados.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = datos.map(c => {
        const unidad = obtenerUnidad(c.unidad);
        const puntos = obtenerPuntosDelChoqueHistoria(c);
        const fotos = c.fotos || [];

        if (fotos.length > 0) {
            galeriasHistoria[c.id] = fotos;
        }

        return `
            <tr>
                <td>${formatearFechaHistoria(c.fecha)}</td>

                <td>
                    <strong>${unidad?.ficha || c.unidad || "-"}</strong>
                </td>

                <td>${obtenerTipoGuaguaHistoria(unidad)}</td>

                <td>${mostrarTiposChoqueHistoria(c)}</td>

                <td>
                    <span class="severidad ${String(c.severidad || "").toLowerCase()}">
                        ${c.severidad || "-"}
                    </span>
                </td>

                <td>
                    <strong class="texto-puntos-restados">-${puntos}</strong>
                </td>

                <td>${formatearMonedaHistoria(c.monto)}</td>

                <td>${c.descripcion || ""}</td>

                <td>${generarMiniFotosHistoria(c.id, fotos)}</td>
            </tr>
        `;
    }).join("");
}

/* ======================================================
   FOTOS
====================================================== */

function generarMiniFotosHistoria(idChoque, fotos) {
    if (!fotos || fotos.length === 0) {
        return `<span class="sin-fotos-texto">Sin fotos</span>`;
    }

    return `
        <div class="mini-fotos-tabla">
            ${fotos.map((foto, index) => `
                <img 
                    src="${foto.data}" 
                    alt="${foto.nombre || "Foto del choque"}"
                    onclick="abrirFotoGrandeHistoria('${idChoque}', ${index})"
                >
            `).join("")}
        </div>
    `;
}

function abrirFotoGrandeHistoria(idChoque, index) {
    fotosVisorHistoria = galeriasHistoria[idChoque] || [];
    indiceFotoHistoria = index || 0;

    if (fotosVisorHistoria.length === 0) {
        return;
    }

    actualizarFotoGrandeHistoria();
    document.getElementById("visorFotoGrandeHistoria").classList.add("activo");
}

function cerrarFotoGrandeHistoria() {
    document.getElementById("visorFotoGrandeHistoria").classList.remove("activo");
}

function cambiarFotoGrandeHistoria(direccion) {
    if (!fotosVisorHistoria || fotosVisorHistoria.length === 0) {
        return;
    }

    indiceFotoHistoria += direccion;

    if (indiceFotoHistoria < 0) {
        indiceFotoHistoria = fotosVisorHistoria.length - 1;
    }

    if (indiceFotoHistoria >= fotosVisorHistoria.length) {
        indiceFotoHistoria = 0;
    }

    actualizarFotoGrandeHistoria();
}

function actualizarFotoGrandeHistoria() {
    const foto = fotosVisorHistoria[indiceFotoHistoria];

    if (!foto) return;

    const img = document.getElementById("imagenFotoGrandeHistoria");
    const contador = document.getElementById("contadorFotosHistoria");
    const flechaIzquierda = document.querySelector("#visorFotoGrandeHistoria .btn-flecha-foto.izquierda");
    const flechaDerecha = document.querySelector("#visorFotoGrandeHistoria .btn-flecha-foto.derecha");

    img.src = foto.data;
    img.alt = foto.nombre || "Foto del choque";

    contador.textContent = `${indiceFotoHistoria + 1} / ${fotosVisorHistoria.length}`;

    if (fotosVisorHistoria.length <= 1) {
        flechaIzquierda.classList.add("oculto");
        flechaDerecha.classList.add("oculto");
    } else {
        flechaIzquierda.classList.remove("oculto");
        flechaDerecha.classList.remove("oculto");
    }
}

/* ======================================================
   PUNTOS
====================================================== */

function obtenerPuntosDelChoqueHistoria(choque) {
    if (choque && choque.puntosRestados !== undefined && choque.puntosRestados !== null && choque.puntosRestados !== '') {
        return Number(choque.puntosRestados) || 0;
    }

    return 0;
}

function calcularPuntosRestadosHistoria(choques) {
    return choques.reduce((total, c) => {
        return total + obtenerPuntosDelChoqueHistoria(c);
    }, 0);
}

function obtenerSeveridadMayorHistoria(choques) {
    const orden = {
        "Leve": 1,
        "Moderado": 2,
        "Grave": 3
    };

    let mayor = "-";
    let valorMayor = 0;

    choques.forEach(c => {
        const valor = orden[c.severidad] || 0;

        if (valor > valorMayor) {
            valorMayor = valor;
            mayor = c.severidad;
        }
    });

    return mayor;
}

/* ======================================================
   FOTO DE CHOFER
====================================================== */

function generarFotoChoferPagina(chofer) {
    const foto = obtenerFotoChoferHistoria(chofer);

    if (foto) {
        return `
            <img 
                class="foto-chofer-pagina" 
                src="${foto}" 
                alt="${obtenerNombreChoferHistoria(chofer)}"
            >
        `;
    }

    return `
        <div class="foto-chofer-pagina-placeholder">
            ${obtenerInicialesChoferHistoria(chofer)}
        </div>
    `;
}

function obtenerFotoChoferHistoria(chofer) {
    return chofer.foto ||
           chofer.imagen ||
           chofer.avatar ||
           chofer.fotoBase64 ||
           chofer.fotoChofer ||
           "";
}

function obtenerInicialesChoferHistoria(chofer) {
    const nombre = obtenerNombreChoferHistoria(chofer);
    const partes = nombre.split(" ").filter(Boolean);

    if (partes.length === 0) return "?";
    if (partes.length === 1) return partes[0][0].toUpperCase();

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

/* ======================================================
   UTILIDADES
====================================================== */

function volverChoferes() {
    window.location.href = "choques-chofer.html";
}

function obtenerNombreChoferHistoria(chofer) {
    if (!chofer) return "-";

    const nombreCompleto = [
        chofer.nombre,
        chofer.apellido
    ].filter(Boolean).join(" ");

    return nombreCompleto || chofer.nombre || "-";
}

function obtenerTipoGuaguaHistoria(unidad) {
    if (!unidad) return "-";

    return unidad.tipoGuagua ||
           unidad.tipo ||
           unidad.categoria ||
           unidad.marca ||
           "-";
}

function mostrarTiposChoqueHistoria(choque) {
    if (Array.isArray(choque.tipos) && choque.tipos.length > 0) {
        return choque.tipos.join(", ");
    }

    return choque.tipo || "-";
}

function formatearFechaHistoria(fechaISO) {
    if (!fechaISO) return "";

    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearMonedaHistoria(valor) {
    return Number(valor || 0).toLocaleString("es-DO", {
        style: "currency",
        currency: "DOP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}