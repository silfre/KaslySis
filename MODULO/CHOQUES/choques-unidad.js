let idChoqueEditando = null;
let fotosVisorActual = [];
let indiceFotoActual = 0;

document.addEventListener('DOMContentLoaded', () => {
    inicializarBD();

    if (!sistemaBD.choques) {
        sistemaBD.choques = [];
        guardarBD();
    }

    cargarUnidades();
    cargarEmpleados();
    establecerFecha();
    renderizar();
});

function establecerFecha() {
    const fecha = document.getElementById('fecha');

    if (fecha) {
        fecha.valueAsDate = new Date();
    }
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

function abrirModalChoque() {
    idChoqueEditando = null;

    const modal = document.getElementById('modalChoque');
    const form = document.getElementById('formChoque');
    const titulo = document.getElementById('tituloModalChoque');
    const btnGuardar = document.getElementById('btnGuardarChoque');

    if (form) form.reset();
    if (titulo) titulo.textContent = 'Nuevo Reporte de Choque';
    if (btnGuardar) btnGuardar.textContent = '💾 Guardar';

    establecerFecha();

    modal.classList.add('activo');
    document.querySelector('.modal-contenido').scrollTop = 0;
}

function cerrarModal() {
    const modal = document.getElementById('modalChoque');
    const form = document.getElementById('formChoque');
    const titulo = document.getElementById('tituloModalChoque');
    const btnGuardar = document.getElementById('btnGuardarChoque');

    idChoqueEditando = null;

    if (modal) modal.classList.remove('activo');
    if (form) form.reset();
    if (titulo) titulo.textContent = 'Nuevo Reporte de Choque';
    if (btnGuardar) btnGuardar.textContent = '💾 Guardar';

    limpiarTiposChoque();

const preview = document.getElementById('previewFotos');
const fotosInput = document.getElementById('fotosChoque');
const cantidadFotos = document.getElementById('cantidadFotos');

if (preview) preview.innerHTML = '';
if (fotosInput) fotosInput.value = '';
if (cantidadFotos) cantidadFotos.value = 0;
}

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

    let fotosGuardadas = [];

    if (archivos.length > 0) {
        fotosGuardadas = await convertirFotosABase64(archivos);
    } else if (idChoqueEditando) {
        const choqueActual = sistemaBD.choques.find(c => c.id === idChoqueEditando);
        fotosGuardadas = choqueActual?.fotos || [];
    }
 const puntosRestados = Number(document.getElementById('puntosRestados').value) || 0;

if (puntosRestados < 0) {
    alert('Los puntos restados no pueden ser negativos.');
    return;
}

    
    const choque = {
        id: idChoqueEditando || generarID(),
        fecha: document.getElementById('fecha').value,
        unidad: document.getElementById('unidad').value,
        chofer: document.getElementById('chofer').value,
        tipos: tiposSeleccionados,
        tipo: tiposSeleccionados.join(', '),
        severidad: document.getElementById('severidad').value,
          puntosRestados: puntosRestados,
        monto: parseFloat(document.getElementById('monto').value) || 0,
        descripcion: document.getElementById('descripcion').value.trim(),
        cantidadFotosPermitida: cantidadPermitida,
        fotos: fotosGuardadas
    };

    if (idChoqueEditando) {
        const index = sistemaBD.choques.findIndex(c => c.id === idChoqueEditando);

        if (index !== -1) {
            sistemaBD.choques[index] = choque;
        }

        alert('✓ Reporte actualizado');
    } else {
        sistemaBD.choques.unshift(choque);
        alert('✓ Reporte registrado');
    }

    guardarBD();
    cerrarModal();
    renderizar();
}
function renderizar() {
    const tbody = document.getElementById('tablaBody');
    const buscador = document.getElementById('buscador');

    if (!tbody) return;

    const filtro = buscador ? buscador.value.toLowerCase().trim() : '';

    let datos = sistemaBD.choques.filter(c => {
        const unidad = obtenerUnidad(c.unidad);
        const chofer = obtenerEmpleado(c.chofer);

        const texto = `
            ${unidad?.ficha || c.unidad || ''}
            ${obtenerTipoGuagua(unidad)}
            ${obtenerNombreChofer(chofer)}
            ${c.tipo || ''}
            ${c.severidad || ''}
            ${c.descripcion || ''}
        `.toLowerCase();

        return texto.includes(filtro);
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:20px;">
                    No hay reportes de choques registrados.
                </td>
            </tr>
        `;

        actualizarTarjetas(datos);
        return;
    }

    tbody.innerHTML = datos.map(c => {
        const unidad = obtenerUnidad(c.unidad);
        const chofer = obtenerEmpleado(c.chofer);

        return `
            <tr>
                <td>${formatearFecha(c.fecha)}</td>
                <td><strong>${unidad?.ficha || c.unidad || '-'}</strong></td>
                <td>${obtenerTipoGuagua(unidad)}</td>
                <td>${obtenerNombreChofer(chofer)}</td>
           <td>${mostrarTiposChoque(c)}</td>
                <td>
                    <span class="severidad ${String(c.severidad || '').toLowerCase()}">
                        ${c.severidad || '-'}
                    </span>
                </td>
                <td>${formatearMoneda(c.monto)}</td>
             <td>${c.descripcion || ''}</td>
             <td>
                <button class="btn-tabla btn-ver" onclick="verDetalleChoque('${c.id}')">Ver</button>
                <button class="btn-tabla btn-editar" onclick="editarChoque('${c.id}')">Editar</button>
                <button class="btn-tabla btn-borrar" onclick="eliminar('${c.id}')">Borrar</button>
             </td>
            </tr>
        `;
    }).join('');

    actualizarTarjetas(datos);
}

function editarChoque(id) {
    const choque = sistemaBD.choques.find(c => c.id === id);

    if (!choque) {
        alert('No se encontró el reporte.');
        return;
    }

    idChoqueEditando = id;

    document.getElementById('fecha').value = choque.fecha || '';
    document.getElementById('unidad').value = choque.unidad || '';
    document.getElementById('chofer').value = choque.chofer || '';
   marcarTiposChoque(choque.tipos || choque.tipo || []);
    document.getElementById('cantidadFotos').value = choque.cantidadFotosPermitida || 0;
    mostrarPreviewFotosGuardadas(choque.fotos || []);

    document.getElementById('severidad').value = choque.severidad || '';
    document.getElementById('monto').value = choque.monto || '';
    document.getElementById('descripcion').value = choque.descripcion || '';
  document.getElementById('puntosRestados').value = choque.puntosRestados || 0;

    const titulo = document.getElementById('tituloModalChoque');
    const btnGuardar = document.getElementById('btnGuardarChoque');

    if (titulo) titulo.textContent = 'Editar Reporte de Choque';
    if (btnGuardar) btnGuardar.textContent = 'Actualizar';

    document.getElementById('modalChoque').classList.add('activo');
}

function eliminar(id) {
    const confirmar = confirm('¿Seguro que deseas borrar este reporte de choque?');

    if (!confirmar) return;

    sistemaBD.choques = sistemaBD.choques.filter(c => c.id !== id);

    guardarBD();
    renderizar();

    if (idChoqueEditando === id) {
        cerrarModal();
    }

    alert('Reporte borrado correctamente.');
}

function limpiarDatos() {
    const confirmar = confirm('¿Seguro que deseas limpiar todos los reportes de choques?');

    if (!confirmar) return;

    sistemaBD.choques = [];
    guardarBD();
    renderizar();

    alert('Todos los reportes fueron eliminados.');
}

function filtrarDatos() {
    renderizar();
}

function actualizarTarjetas(datos) {
    const ahora = new Date();
    const esteAnio = datos.filter(c => new Date(c.fecha).getFullYear() === ahora.getFullYear());
    const unidadesSet = new Set(datos.map(c => c.unidad));
    const total = datos.reduce((sum, c) => sum + Number(c.monto || 0), 0);

    document.getElementById('cardTotal').textContent = datos.length;
    document.getElementById('cardAnio').textContent = esteAnio.length;
    document.getElementById('cardUnidades').textContent = unidadesSet.size;
    document.getElementById('cardMonto').textContent = formatearMoneda(total);
}

function obtenerTipoGuagua(unidad) {
    if (!unidad) return '-';

    return unidad.tipoGuagua ||
           unidad.tipo ||
           unidad.categoria ||
           unidad.marca ||
           '-';
}

function obtenerNombreChofer(chofer) {
    if (!chofer) return '-';

    const nombreCompleto = [
        chofer.nombre,
        chofer.apellido
    ].filter(Boolean).join(' ');

    return nombreCompleto || chofer.nombre || '-';
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

function obtenerTiposChoqueSeleccionados() {
    const checks = document.querySelectorAll('input[name="tipoChoque"]:checked');

    return Array.from(checks).map(check => check.value);
}

function marcarTiposChoque(tipos) {
    limpiarTiposChoque();

    let listaTipos = [];

    if (Array.isArray(tipos)) {
        listaTipos = tipos;
    } else {
        listaTipos = String(tipos || '').split(',').map(t => t.trim()).filter(Boolean);
    }

    listaTipos.forEach(tipo => {
        let check = Array.from(document.querySelectorAll('input[name="tipoChoque"]'))
            .find(item => item.value.toUpperCase() === tipo.toUpperCase());

        if (!check) {
            crearCheckTipoChoque(tipo, true);
        } else {
            check.checked = true;
        }
    });
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

    crearCheckTipoChoque(valor, true);
    input.value = '';
}

function crearCheckTipoChoque(valor, marcado) {
    const contenedor = document.querySelector('.checks-choques');

    const label = document.createElement('label');
    label.innerHTML = `
        <input type="checkbox" name="tipoChoque" value="${valor}" ${marcado ? 'checked' : ''}>
        ${valor}
    `;

    contenedor.appendChild(label);
}

function mostrarTiposChoque(choque) {
    if (Array.isArray(choque.tipos) && choque.tipos.length > 0) {
        return choque.tipos.join(', ');
    }

    return choque.tipo || '-';
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

function mostrarPreviewFotosGuardadas(fotos) {
    const preview = document.getElementById('previewFotos');

    if (!preview) return;

    preview.innerHTML = '';

    fotos.forEach(foto => {
        const img = document.createElement('img');
        img.src = foto.data;
        preview.appendChild(img);
    });
}

function verFotosChoque(id) {
    const choque = sistemaBD.choques.find(c => c.id === id);

    if (!choque || !choque.fotos || choque.fotos.length === 0) {
        alert('Este reporte no tiene fotos.');
        return;
    }

    const contenedor = document.getElementById('contenedorFotosVer');
    const modal = document.getElementById('modalVerFotos');

    contenedor.innerHTML = '';

    choque.fotos.forEach(foto => {
        const img = document.createElement('img');
        img.src = foto.data;
        img.alt = foto.nombre || 'Foto del choque';
        contenedor.appendChild(img);
    });

    modal.classList.add('activo');
}

function cerrarFotosChoque() {
    document.getElementById('modalVerFotos').classList.remove('activo');
}

/* ======================================================
   VER HISTORIAL COMPLETO DEL CHOQUE
====================================================== */

function verDetalleChoque(id) {
    const choque = sistemaBD.choques.find(c => c.id === id);

    if (!choque) {
        alert("No se encontró el reporte de choque.");
        return;
    }

    const unidad = obtenerUnidad(choque.unidad);
    const chofer = obtenerEmpleado(choque.chofer);

    const tipos = Array.isArray(choque.tipos) && choque.tipos.length > 0
        ? choque.tipos.join(", ")
        : choque.tipo || "-";

    const fotos = choque.fotos || [];

    fotosVisorActual = fotos;
    indiceFotoActual = 0;

    const contenido = document.getElementById("contenidoDetalleChoque");

    contenido.innerHTML = `
        <div class="detalle-grid">
            <div class="detalle-item">
                <span>Fecha</span>
                <strong>${formatearFecha(choque.fecha)}</strong>
            </div>

            <div class="detalle-item">
                <span>Ficha</span>
                <strong>${unidad?.ficha || choque.unidad || "-"}</strong>
            </div>

            <div class="detalle-item">
                <span>Tipo de guagua</span>
                <strong>${obtenerTipoGuagua(unidad)}</strong>
            </div>

            <div class="detalle-item">
                <span>Chofer</span>
                <strong>${obtenerNombreChofer(chofer)}</strong>
            </div>

            <div class="detalle-item">
                <span>Tipo de choque</span>
                <strong>${tipos}</strong>
            </div>

            <div class="detalle-item">
                <span>Severidad</span>
                <strong>${choque.severidad || "-"}</strong>
            </div>

            <div class="detalle-item">
                <span>Monto estimado</span>
                <strong>${formatearMoneda(choque.monto)}</strong>
            </div>

            <div class="detalle-item">
                <span>Cantidad de fotos</span>
                <strong>${fotos.length}</strong>
            </div>

            <div class="detalle-item">
                <span>Límite permitido</span>
                <strong>${choque.cantidadFotosPermitida || "Sin límite"}</strong>
            </div>

            <div class="detalle-item detalle-completo">
                <span>Comentario / descripción</span>
                <p>${choque.descripcion || "Sin comentario"}</p>
            </div>
        </div>

        <div class="fotos-detalle">
            <h3>Fotos del choque</h3>
            ${generarFotosDetalle(fotos)}
        </div>
    `;

    document.getElementById("modalDetalleChoque").classList.add("activo");
}

function cerrarDetalleChoque() {
    document.getElementById("modalDetalleChoque").classList.remove("activo");
}

function generarFotosDetalle(fotos) {
    if (!fotos || fotos.length === 0) {
        return `
            <div class="sin-fotos">
                Este reporte no tiene fotos registradas.
            </div>
        `;
    }

    return `
        <div class="grid-fotos-detalle">
            ${fotos.map((foto, index) => `
                <img 
                    class="foto-miniatura"
                    src="${foto.data}" 
                    alt="${foto.nombre || 'Foto del choque'}"
                    onclick="abrirFotoGrande(${index})"
                >
            `).join("")}
        </div>
    `;
}

/* ======================================================
   FOTO GRANDE CON FLECHAS
====================================================== */

function abrirFotoGrande(index) {
    if (!fotosVisorActual || fotosVisorActual.length === 0) {
        return;
    }

    indiceFotoActual = index;
    actualizarFotoGrande();

    document.getElementById("visorFotoGrande").classList.add("activo");
}

function cerrarFotoGrande() {
    document.getElementById("visorFotoGrande").classList.remove("activo");
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

    if (!foto) {
        return;
    }

    const img = document.getElementById("imagenFotoGrande");
    const contador = document.getElementById("contadorFotos");
    const flechaIzquierda = document.querySelector(".btn-flecha-foto.izquierda");
    const flechaDerecha = document.querySelector(".btn-flecha-foto.derecha");

    img.src = foto.data;
    img.alt = foto.nombre || "Foto del choque";

    contador.textContent = `${indiceFotoActual + 1} / ${fotosVisorActual.length}`;

    if (fotosVisorActual.length <= 1) {
        flechaIzquierda.classList.add("oculto");
        flechaDerecha.classList.add("oculto");
    } else {
        flechaIzquierda.classList.remove("oculto");
        flechaDerecha.classList.remove("oculto");
    }
}