/* ======================================================
   CONFIGURACIÓN DE PUNTOS
====================================================== */

const PUNTOS_INICIALES_CHOFER = 100;

const PUNTOS_POR_SEVERIDAD = {
    "Leve": 5,
    "Moderado": 10,
    "Grave": 20
};

let fotosVisorActual = [];
let indiceFotoActual = 0;

/* ======================================================
   INICIO
====================================================== */

document.addEventListener('DOMContentLoaded', () => {
    inicializarBD();

    if (!sistemaBD.choques) {
        sistemaBD.choques = [];
        guardarBD();
    }

    cargarEmpleados();
    cargarUnidades();
    establecerFecha();
    renderizar();
});

function establecerFecha() {
    const fecha = document.getElementById('fecha');

    if (fecha) {
        fecha.valueAsDate = new Date();
    }
}

/* ======================================================
   CARGAR SELECTS
====================================================== */

function cargarEmpleados() {
    const select = document.getElementById('chofer');

    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccionar --</option>';

    obtenerEmpleados().forEach(e => {
        const opt = document.createElement('option');

        opt.value = e.id;
        opt.text = obtenerNombreChofer(e);

        select.appendChild(opt);
    });
}

function cargarUnidades() {
    const select = document.getElementById('unidad');

    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccionar --</option>';

    obtenerUnidades().forEach(u => {
        const opt = document.createElement('option');

        opt.value = u.id;
        opt.text = `${u.ficha || u.id} - ${u.marca || u.categoria || 'SIN MARCA'}`;

        select.appendChild(opt);
    });
}

/* ======================================================
   MODAL NUEVO REPORTE
====================================================== */

function abrirModalChoque() {
    const modal = document.getElementById('modalChoque');
    const form = document.querySelector('#modalChoque form');

    if (form) {
        form.reset();
    }

    limpiarTiposChoque();

    const preview = document.getElementById('previewFotos');
    if (preview) preview.innerHTML = '';

    establecerFecha();

    modal.classList.add('activo');

    const cuerpo = document.querySelector('.modal-cuerpo-form');
    if (cuerpo) cuerpo.scrollTop = 0;
}

function cerrarModal() {
    const modal = document.getElementById('modalChoque');
    const form = document.querySelector('#modalChoque form');

    if (modal) {
        modal.classList.remove('activo');
    }

    if (form) {
        form.reset();
    }

    limpiarTiposChoque();

    const preview = document.getElementById('previewFotos');
    const fotosInput = document.getElementById('fotosChoque');
    const cantidadFotos = document.getElementById('cantidadFotos');

    if (preview) preview.innerHTML = '';
    if (fotosInput) fotosInput.value = '';
    if (cantidadFotos) cantidadFotos.value = 0;
}

/* ======================================================
   GUARDAR CHOQUE
====================================================== */

async function guardarChoque(e) {
    e.preventDefault();

    const tiposSeleccionados = obtenerTiposChoqueSeleccionados();

    if (tiposSeleccionados.length === 0) {
        alert('Debe seleccionar por lo menos un tipo de choque.');
        return;
    }

    const cantidadPermitida = Number(document.getElementById('cantidadFotos').value) || 0;
    const inputFotos = document.getElementById('fotosChoque');
    const archivos = Array.from(inputFotos.files || []);

    if (cantidadPermitida > 0 && archivos.length > cantidadPermitida) {
        alert(`Solo puedes subir ${cantidadPermitida} foto(s).`);
        return;
    }

    const fotosGuardadas = await convertirFotosABase64(archivos);

    const choque = {
        id: generarID(),
        fecha: document.getElementById('fecha').value,
        chofer: document.getElementById('chofer').value,
        unidad: document.getElementById('unidad').value,
        tipos: tiposSeleccionados,
        tipo: tiposSeleccionados.join(', '),
        severidad: document.getElementById('severidad').value,
        monto: parseFloat(document.getElementById('monto').value) || 0,
        descripcion: document.getElementById('descripcion').value.trim(),
        cantidadFotosPermitida: cantidadPermitida,
        fotos: fotosGuardadas
    };

    sistemaBD.choques.unshift(choque);

    guardarBD();
    cerrarModal();
    renderizar();

    alert('✓ Reporte registrado');
}

/* ======================================================
   RENDER TABLA PRINCIPAL
====================================================== */

function renderizar() {
    const tbody = document.getElementById('tablaBody');
    const buscador = document.getElementById('buscador');

    if (!tbody) return;

    const ahora = new Date();
    const hace12Meses = new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate());
    const filtro = buscador ? buscador.value.toLowerCase().trim() : '';

    const empleados = obtenerEmpleados();
    const porChofer = {};

    sistemaBD.choques.forEach(c => {
        if (!c.chofer) return;

        if (!porChofer[c.chofer]) {
            porChofer[c.chofer] = [];
        }

        porChofer[c.chofer].push(c);
    });

    let datos = [];

    Object.keys(porChofer).forEach(choferId => {
        const chofer = empleados.find(e => String(e.id) === String(choferId));
        const choques = porChofer[choferId];

        if (!chofer) return;

        const nombreChofer = obtenerNombreChofer(chofer);

        if (!nombreChofer.toLowerCase().includes(filtro)) {
            return;
        }

        const ultimos12 = choques.filter(c => new Date(c.fecha) >= hace12Meses);
        const severidadMayor = obtenerSeveridadMayor(choques);
        const puntosRestados = calcularPuntosRestados(choques);
        const puntosQuedan = Math.max(0, PUNTOS_INICIALES_CHOFER - puntosRestados);

        datos.push({
            chofer,
            total: choques.length,
            ultimos12: ultimos12.length,
            severidad: severidadMayor,
            puntosRestados,
            puntosQuedan
        });
    });

    datos.sort((a, b) => a.puntosQuedan - b.puntosQuedan);

    if (datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:20px;">
                    No hay choques registrados por chofer.
                </td>
            </tr>
        `;

        actualizarTarjetas([]);
        return;
    }

tbody.innerHTML = datos.map(d => `
    <tr>
        <td>
            <button class="link-chofer" onclick="abrirHistoriaChofer('${d.chofer.id}')">
                ${obtenerNombreChofer(d.chofer)}
            </button>
        </td>

        <td>${d.total}</td>
        <td>${d.ultimos12}</td>

        <td>
            <span class="severidad ${String(d.severidad).toLowerCase()}">
                ${d.severidad}
            </span>
        </td>

        <td>
            <strong class="texto-puntos-restados">-${d.puntosRestados}</strong>
        </td>

        <td>
            <span class="${d.puntosQuedan <= 40 ? 'puntos-bajo' : 'puntos-normal'}">
                ${d.puntosQuedan}
            </span>
        </td>

        <td>
            <button class="btn-tabla btn-ver" onclick="abrirHistoriaChofer('${d.chofer.id}')">Ver</button>
        </td>
    </tr>
`).join('');


    actualizarTarjetas(datos);
}

function filtrarDatos() {
    renderizar();
}

/* ======================================================
   TARJETAS
====================================================== */

function actualizarTarjetas(datos) {
    const totalChoques = sistemaBD.choques.length;
    const choferesConChoques = new Set(sistemaBD.choques.map(c => c.chofer).filter(Boolean));

    document.getElementById('cardTotal').textContent = totalChoques;
    document.getElementById('cardChoferes').textContent = choferesConChoques.size;
    document.getElementById('cardPromedio').textContent = (totalChoques / (choferesConChoques.size || 1)).toFixed(1);

    if (datos.length === 0) {
        document.getElementById('cardMenorPuntos').textContent = '0';
        return;
    }

    const menor = datos.reduce((min, item) => {
        return item.puntosQuedan < min.puntosQuedan ? item : min;
    }, datos[0]);

    document.getElementById('cardMenorPuntos').textContent = menor.puntosQuedan;
}

/* ======================================================
   VER HISTORIAL COMPLETO DEL CHOFER
====================================================== */



function cerrarDetalleChofer() {
    document.getElementById('modalDetalleChofer').classList.remove('activo');
}

function generarFilasHistorialChofer(choques) {
    if (choques.length === 0) {
        return `
            <tr>
                <td colspan="9" style="text-align:center; padding:20px;">
                    Este chofer no tiene choques registrados.
                </td>
            </tr>
        `;
    }

    return choques.map(c => {
        const unidad = obtenerUnidad(c.unidad);
        const puntos = obtenerPuntosPorSeveridad(c.severidad);
        const fotos = c.fotos || [];

        return `
            <tr>
                <td>${formatearFecha(c.fecha)}</td>
                <td><strong>${unidad?.ficha || c.unidad || '-'}</strong></td>
                <td>${obtenerTipoGuagua(unidad)}</td>
                <td>${mostrarTiposChoque(c)}</td>
                <td>
                    <span class="severidad ${String(c.severidad || '').toLowerCase()}">
                        ${c.severidad || '-'}
                    </span>
                </td>
                <td><strong class="texto-puntos-restados">-${puntos}</strong></td>
                <td>${formatearMoneda(c.monto)}</td>
                <td>${c.descripcion || ''}</td>
                <td>${generarMiniFotosChoque(fotos)}</td>
            </tr>
        `;
    }).join('');
}

/* ======================================================
   FOTOS DEL CHOQUE EN HISTORIAL
====================================================== */

function generarMiniFotosChoque(fotos) {
    if (!fotos || fotos.length === 0) {
        return '<span class="sin-fotos-texto">Sin fotos</span>';
    }

    return `
        <div class="mini-fotos-tabla">
            ${fotos.map((foto, index) => `
                <img 
                    src="${foto.data}" 
                    alt="${foto.nombre || 'Foto del choque'}"
                    onclick='abrirGaleriaDesdeLista(${JSON.stringify(fotos)}, ${index})'
                >
            `).join('')}
        </div>
    `;
}

function abrirGaleriaDesdeLista(fotos, index) {
    fotosVisorActual = fotos || [];
    indiceFotoActual = index || 0;

    if (fotosVisorActual.length === 0) {
        return;
    }

    actualizarFotoGrande();
    document.getElementById('visorFotoGrande').classList.add('activo');
}

function cerrarFotoGrande() {
    document.getElementById('visorFotoGrande').classList.remove('activo');
}

function cambiarFotoGrande(direccion) {
    if (!fotosVisorActual || fotosVisorActual.length === 0) {
        return;
    }

    indiceFotoActual += direccion;

    if (indiceFotoActual < 0) {
        indiceFotoActual = fotosVisorActual.length - 1;
    }

    if (indiceFotoActual >= fotosVisorActual.length) {
        indiceFotoActual = 0;
    }

    actualizarFotoGrande();
}

function actualizarFotoGrande() {
    const foto = fotosVisorActual[indiceFotoActual];

    if (!foto) return;

    const img = document.getElementById('imagenFotoGrande');
    const contador = document.getElementById('contadorFotos');
    const flechaIzquierda = document.querySelector('.btn-flecha-foto.izquierda');
    const flechaDerecha = document.querySelector('.btn-flecha-foto.derecha');

    img.src = foto.data;
    img.alt = foto.nombre || 'Foto del choque';

    contador.textContent = `${indiceFotoActual + 1} / ${fotosVisorActual.length}`;

    if (fotosVisorActual.length <= 1) {
        flechaIzquierda.classList.add('oculto');
        flechaDerecha.classList.add('oculto');
    } else {
        flechaIzquierda.classList.remove('oculto');
        flechaDerecha.classList.remove('oculto');
    }
}

/* ======================================================
   TIPOS DE CHOQUE
====================================================== */

function obtenerTiposChoqueSeleccionados() {
    const checks = document.querySelectorAll('input[name="tipoChoque"]:checked');

    return Array.from(checks).map(check => check.value);
}

function limpiarTiposChoque() {
    document.querySelectorAll('input[name="tipoChoque"]').forEach(check => {
        check.checked = false;
    });
}

function agregarTipoChoque() {
    const input = document.getElementById('nuevoTipoChoque');
    const valor = String(input.value || '').trim();

    if (valor === '') {
        alert('Escribe el tipo de choque que deseas agregar.');
        return;
    }

    const existe = Array.from(document.querySelectorAll('input[name="tipoChoque"]'))
        .some(check => check.value.toUpperCase() === valor.toUpperCase());

    if (existe) {
        alert('Ese tipo de choque ya existe.');
        return;
    }

    const contenedor = document.querySelector('.checks-choques');

    const label = document.createElement('label');
    label.innerHTML = `
        <input type="checkbox" name="tipoChoque" value="${valor}" checked>
        ${valor}
    `;

    contenedor.appendChild(label);

    input.value = '';
}

function mostrarTiposChoque(choque) {
    if (Array.isArray(choque.tipos) && choque.tipos.length > 0) {
        return choque.tipos.join(', ');
    }

    return choque.tipo || '-';
}

/* ======================================================
   PREVIEW Y GUARDAR FOTOS
====================================================== */

function mostrarPreviewFotos() {
    const preview = document.getElementById('previewFotos');
    const inputFotos = document.getElementById('fotosChoque');
    const cantidadPermitida = Number(document.getElementById('cantidadFotos').value) || 0;
    const archivos = Array.from(inputFotos.files || []);

    preview.innerHTML = '';

    if (cantidadPermitida > 0 && archivos.length > cantidadPermitida) {
        alert(`Seleccionaste ${archivos.length} fotos, pero solo permitiste ${cantidadPermitida}.`);
        inputFotos.value = '';
        return;
    }

    archivos.forEach(archivo => {
        const lector = new FileReader();

        lector.onload = () => {
            const img = document.createElement('img');
            img.src = lector.result;
            preview.appendChild(img);
        };

        lector.readAsDataURL(archivo);
    });
}

function convertirFotosABase64(archivos) {
    const promesas = archivos.map(archivo => {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();

            lector.onload = () => {
                resolve({
                    nombre: archivo.name,
                    tipo: archivo.type,
                    data: lector.result
                });
            };

            lector.onerror = () => reject('Error leyendo la foto');
            lector.readAsDataURL(archivo);
        });
    });

    return Promise.all(promesas);
}

/* ======================================================
   PUNTOS
====================================================== */

function obtenerPuntosPorSeveridad(severidad) {
    return PUNTOS_POR_SEVERIDAD[severidad] || 0;
}

function calcularPuntosRestados(choques) {
    return choques.reduce((total, c) => {
        return total + obtenerPuntosPorSeveridad(c.severidad);
    }, 0);
}

function obtenerSeveridadMayor(choques) {
    const orden = {
        "Leve": 1,
        "Moderado": 2,
        "Grave": 3
    };

    let mayor = '-';
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
   FOTO DEL CHOFER
====================================================== */

function generarFotoChofer(chofer) {
    const foto = obtenerFotoChofer(chofer);

    if (foto) {
        return `
            <img 
                class="foto-chofer-detalle" 
                src="${foto}" 
                alt="${obtenerNombreChofer(chofer)}"
            >
        `;
    }

    const iniciales = obtenerInicialesChofer(chofer);

    return `
        <div class="foto-chofer-placeholder">
            ${iniciales}
        </div>
    `;
}

function obtenerFotoChofer(chofer) {
    return chofer.foto ||
           chofer.imagen ||
           chofer.avatar ||
           chofer.fotoBase64 ||
           chofer.fotoChofer ||
           '';
}

function obtenerInicialesChofer(chofer) {
    const nombre = obtenerNombreChofer(chofer);
    const partes = nombre.split(' ').filter(Boolean);

    if (partes.length === 0) {
        return '?';
    }

    if (partes.length === 1) {
        return partes[0][0].toUpperCase();
    }

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

/* ======================================================
   UTILIDADES
====================================================== */

function obtenerNombreChofer(chofer) {
    if (!chofer) return '-';

    const nombreCompleto = [
        chofer.nombre,
        chofer.apellido
    ].filter(Boolean).join(' ');

    return nombreCompleto || chofer.nombre || '-';
}

function obtenerTipoGuagua(unidad) {
    if (!unidad) return '-';

    return unidad.tipoGuagua ||
           unidad.tipo ||
           unidad.categoria ||
           unidad.marca ||
           '-';
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '';

    const partes = fechaISO.split('-');

    if (partes.length !== 3) {
        return fechaISO;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearMoneda(valor) {
    return Number(valor || 0).toLocaleString('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/* ======================================================
   HISTORIAL COMPLETO DEL CHOFER
====================================================== */

window.PUNTOS_INICIALES_CHOFER = window.PUNTOS_INICIALES_CHOFER || 100;

window.PUNTOS_POR_SEVERIDAD = window.PUNTOS_POR_SEVERIDAD || {
    "Leve": 5,
    "Moderado": 10,
    "Grave": 20
};

let fotosVisorChofer = [];
let indiceFotoChofer = 0;
let galeriasChofer = {};

function verDetalleChofer(choferId) {
    const chofer = obtenerEmpleados().find(e => String(e.id) === String(choferId));

    if (!chofer) {
        alert("No se encontró el chofer.");
        return;
    }

    const choques = sistemaBD.choques
        .filter(c => String(c.chofer) === String(choferId))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const puntosRestados = calcularPuntosRestadosChofer(choques);
    const puntosQuedan = Math.max(0, window.PUNTOS_INICIALES_CHOFER - puntosRestados);
    const severidadMayor = obtenerSeveridadMayorChofer(choques);

    const contenido = document.getElementById("contenidoDetalleChofer");

    if (!contenido) {
        alert("Falta el modalDetalleChofer en el HTML.");
        return;
    }

    galeriasChofer = {};

    contenido.innerHTML = `
        <div class="perfil-chofer-detalle">
            ${generarFotoChoferDetalle(chofer)}

            <div>
                <h2>${obtenerNombreChoferSeguro(chofer)}</h2>
                <p>Historial completo de choques cometidos por este chofer.</p>

                <div class="resumen-puntos-chofer">
                    <div>
                        <span>Total choques</span>
                        <strong>${choques.length}</strong>
                    </div>

                    <div>
                        <span>Puntos iniciales</span>
                        <strong>${window.PUNTOS_INICIALES_CHOFER}</strong>
                    </div>

                    <div>
                        <span>Puntos restados</span>
                        <strong class="texto-puntos-restados">-${puntosRestados}</strong>
                    </div>

                    <div>
                        <span>Puntos que quedan</span>
                        <strong class="${puntosQuedan <= 40 ? 'puntos-bajo' : 'puntos-normal'}">${puntosQuedan}</strong>
                    </div>

                    <div>
                        <span>Severidad mayor</span>
                        <strong>${severidadMayor}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="tabla-contenedor tabla-historial-chofer">
            <table class="tabla-datos tabla-choques">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Ficha</th>
                        <th>Tipo de guagua</th>
                        <th>Tipo de choque</th>
                        <th>Severidad</th>
                        <th>Puntos restados</th>
                        <th>Monto</th>
                        <th>Comentario</th>
                        <th>Fotos</th>
                    </tr>
                </thead>

                <tbody>
                    ${generarFilasHistorialChofer(choques)}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById("modalDetalleChofer").classList.add("activo");
}

function cerrarDetalleChofer() {
    const modal = document.getElementById("modalDetalleChofer");

    if (modal) {
        modal.classList.remove("activo");
    }
}

function generarFilasHistorialChofer(choques) {
    if (!choques || choques.length === 0) {
        return `
            <tr>
                <td colspan="9" style="text-align:center; padding:20px;">
                    Este chofer no tiene choques registrados.
                </td>
            </tr>
        `;
    }

    return choques.map(c => {
        const unidad = obtenerUnidad(c.unidad);
       const puntos = obtenerPuntosDelChoque(c);
        const fotos = c.fotos || [];

        if (fotos.length > 0) {
            galeriasChofer[c.id] = fotos;
        }

        return `
            <tr>
                <td>${formatearFechaChofer(c.fecha)}</td>

                <td>
                    <strong>${unidad?.ficha || c.unidad || "-"}</strong>
                </td>

                <td>${obtenerTipoGuaguaChofer(unidad)}</td>

                <td>${mostrarTiposChoqueChofer(c)}</td>

                <td>
                    <span class="severidad ${String(c.severidad || '').toLowerCase()}">
                        ${c.severidad || "-"}
                    </span>
                </td>

                <td>
                    <strong class="texto-puntos-restados">-${puntos}</strong>
                </td>

                <td>${formatearMonedaChofer(c.monto)}</td>

                <td>${c.descripcion || ""}</td>

                <td>${generarMiniFotosChofer(c.id, fotos)}</td>
            </tr>
        `;
    }).join("");
}

function generarMiniFotosChofer(idChoque, fotos) {
    if (!fotos || fotos.length === 0) {
        return `<span class="sin-fotos-texto">Sin fotos</span>`;
    }

    return `
        <div class="mini-fotos-tabla">
            ${fotos.map((foto, index) => `
                <img 
                    src="${foto.data}" 
                    alt="${foto.nombre || 'Foto del choque'}"
                    onclick="abrirFotoGrandeChofer('${idChoque}', ${index})"
                >
            `).join("")}
        </div>
    `;
}

function abrirFotoGrandeChofer(idChoque, index) {
    fotosVisorChofer = galeriasChofer[idChoque] || [];
    indiceFotoChofer = index || 0;

    if (fotosVisorChofer.length === 0) {
        return;
    }

    actualizarFotoGrandeChofer();

    document.getElementById("visorFotoGrandeChofer").classList.add("activo");
}

function cerrarFotoGrandeChofer() {
    const visor = document.getElementById("visorFotoGrandeChofer");

    if (visor) {
        visor.classList.remove("activo");
    }
}

function cambiarFotoGrandeChofer(direccion) {
    if (!fotosVisorChofer || fotosVisorChofer.length === 0) {
        return;
    }

    indiceFotoChofer += direccion;

    if (indiceFotoChofer < 0) {
        indiceFotoChofer = fotosVisorChofer.length - 1;
    }

    if (indiceFotoChofer >= fotosVisorChofer.length) {
        indiceFotoChofer = 0;
    }

    actualizarFotoGrandeChofer();
}

function actualizarFotoGrandeChofer() {
    const foto = fotosVisorChofer[indiceFotoChofer];

    if (!foto) return;

    const img = document.getElementById("imagenFotoGrandeChofer");
    const contador = document.getElementById("contadorFotosChofer");
    const flechaIzquierda = document.querySelector("#visorFotoGrandeChofer .btn-flecha-foto.izquierda");
    const flechaDerecha = document.querySelector("#visorFotoGrandeChofer .btn-flecha-foto.derecha");

    img.src = foto.data;
    img.alt = foto.nombre || "Foto del choque";

    contador.textContent = `${indiceFotoChofer + 1} / ${fotosVisorChofer.length}`;

    if (fotosVisorChofer.length <= 1) {
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

function obtenerPuntosDelChoque(choque) {
    if (choque && choque.puntosRestados !== undefined && choque.puntosRestados !== null && choque.puntosRestados !== '') {
        return Number(choque.puntosRestados) || 0;
    }

    return 0;
}

function calcularPuntosRestadosChofer(choques) {
    return choques.reduce((total, c) => {
        return total + obtenerPuntosDelChoque(c);
    }, 0);
}

function obtenerSeveridadMayorChofer(choques) {
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
   FOTO Y DATOS DEL CHOFER
====================================================== */

function generarFotoChoferDetalle(chofer) {
    const foto = obtenerFotoChoferDetalle(chofer);

    if (foto) {
        return `
            <img 
                class="foto-chofer-detalle" 
                src="${foto}" 
                alt="${obtenerNombreChoferSeguro(chofer)}"
            >
        `;
    }

    return `
        <div class="foto-chofer-placeholder">
            ${obtenerInicialesChoferDetalle(chofer)}
        </div>
    `;
}

function obtenerFotoChoferDetalle(chofer) {
    return chofer.foto ||
           chofer.imagen ||
           chofer.avatar ||
           chofer.fotoBase64 ||
           chofer.fotoChofer ||
           "";
}

function obtenerInicialesChoferDetalle(chofer) {
    const nombre = obtenerNombreChoferSeguro(chofer);
    const partes = nombre.split(" ").filter(Boolean);

    if (partes.length === 0) return "?";
    if (partes.length === 1) return partes[0][0].toUpperCase();

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

/* ======================================================
   UTILIDADES SEGURAS
====================================================== */

function obtenerNombreChoferSeguro(chofer) {
    if (!chofer) return "-";

    const nombreCompleto = [
        chofer.nombre,
        chofer.apellido
    ].filter(Boolean).join(" ");

    return nombreCompleto || chofer.nombre || "-";
}

function obtenerTipoGuaguaChofer(unidad) {
    if (!unidad) return "-";

    return unidad.tipoGuagua ||
           unidad.tipo ||
           unidad.categoria ||
           unidad.marca ||
           "-";
}

function mostrarTiposChoqueChofer(choque) {
    if (Array.isArray(choque.tipos) && choque.tipos.length > 0) {
        return choque.tipos.join(", ");
    }

    return choque.tipo || "-";
}

function formatearFechaChofer(fechaISO) {
    if (!fechaISO) return "";

    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearMonedaChofer(valor) {
    return Number(valor || 0).toLocaleString("es-DO", {
        style: "currency",
        currency: "DOP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function abrirHistoriaChofer(choferId) {
    window.location.href = `historia-chofer.html?chofer=${encodeURIComponent(choferId)}`;
}