// 🔥 USAR BD CENTRALIZADA - No necesitamos array local
// let unidades = [ ... ] ← REMOVIDO, ahora usamos sistemaBD.unidades

// Función helper para acceder a unidades
function getUnidades() {
  return sistemaBD.unidades || [];
}

document.addEventListener("DOMContentLoaded", function () {
    inicializarBD();  // 🔥 INICIALIZAR BD CENTRALIZADA
    
    const btnMenu = document.getElementById("btnMenu");

    if (btnMenu) {
        btnMenu.addEventListener("click", function () {
            document.body.classList.toggle("menu-cerrado");
        });
    }

    renderTabla();
    actualizarResumen();
});

function guardarUnidad(event) {
    event.preventDefault();

    const ficha = document.getElementById("ficha").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const marca = document.getElementById("marca").value.trim();
    const anio = document.getElementById("anio").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const estado = document.getElementById("estado").value.trim();
    const comentario = document.getElementById("comentario").value.trim();

    if (!ficha || !categoria || !marca || !anio || !estado) {
        alert("Debe completar los campos obligatorios: ficha, categoría, marca, año y estado.");
        return;
    }

    const modoEdicion = document.getElementById("modoEdicion").value;
    const indiceEdicion = document.getElementById("indiceEdicion").value;

    const unidad = {
        id: ficha,  // Usar ficha como ID
        ficha,
        categoria,
        marca,
        anio,
        modelo,
        estado,
        comentario,
        kmActual: 0  // 🔥 Inicializar KM en 0
    };

    if (modoEdicion === "editar") {
        // 🔥 USAR DATABASE.JS
        actualizarUnidad(ficha, unidad);
        alert("Unidad actualizada correctamente.");
    } else {
        const unidades = getUnidades();
        const existe = unidades.some(u => u.ficha.toLowerCase() === ficha.toLowerCase());

        if (existe) {
            alert("Ya existe una unidad registrada con ese número de ficha.");
            return;
        }

        // 🔥 USAR DATABASE.JS - crearUnidad es una función que existe en database.js
        crearUnidad(unidad);
        alert("Unidad guardada correctamente.");
    }

    limpiarFormulario();
    renderTabla();
    actualizarResumen();
}

function renderTabla() {
    const tbody = document.getElementById("tablaUnidades");
    const buscarInput = document.getElementById("buscar");

    if (!tbody) return;

    const buscar = buscarInput ? buscarInput.value.toLowerCase() : "";
    const unidades = getUnidades();  // 🔥 USAR FUNCIÓN HELPER

    tbody.innerHTML = "";

    const filtradas = unidades.filter(u =>
        u.ficha.toLowerCase().includes(buscar) ||
        u.categoria.toLowerCase().includes(buscar) ||
        u.marca.toLowerCase().includes(buscar) ||
        u.anio.toString().includes(buscar) ||
        u.modelo.toLowerCase().includes(buscar) ||
        u.estado.toLowerCase().includes(buscar)
    );

    if (filtradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">No hay unidades registradas.</td>
            </tr>
        `;
    }

    filtradas.forEach((u, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${u.ficha}</td>
                <td>${u.categoria}</td>
                <td>${u.marca}</td>
                <td>${u.anio}</td>
                <td>${u.modelo || "-"}</td>
                <td>${u.kmActual || 0} km</td>
                <td>${estadoBadge(u.estado)}</td>
                <td>
                    <button class="action-btn action-edit" onclick="editarUnidad('${u.ficha}')" title="Editar">✏️</button>
                    <button class="action-btn action-delete" onclick="eliminarUnidad('${u.ficha}')" title="Eliminar">🗑</button>
                    <button class="action-btn action-view" onclick="verUnidad('${u.ficha}')" title="Ver">👁</button>
                </td>
            </tr>
        `;
    });

    const infoTabla = document.getElementById("infoTabla");

    if (infoTabla) {
        infoTabla.textContent = `Mostrando 1 a ${filtradas.length} de ${unidades.length} unidades`;
    }
}

function estadoBadge(estado) {
    if (estado === "Activa") {
        return `<span class="badge badge-activa">Activa</span>`;
    }

    if (estado === "En mantenimiento") {
        return `<span class="badge badge-mantenimiento">En mantenimiento</span>`;
    }

    if (estado === "Inactiva") {
        return `<span class="badge badge-inactiva">Inactiva</span>`;
    }

    return `<span class="badge">${estado}</span>`;
}

function actualizarResumen() {
    const totalUnidades = document.getElementById("totalUnidades");
    const totalActivas = document.getElementById("totalActivas");
    const totalMantenimiento = document.getElementById("totalMantenimiento");
    const totalCategorias = document.getElementById("totalCategorias");

    const unidades = getUnidades();  // 🔥 USAR FUNCIÓN HELPER
    const activas = unidades.filter(u => u.estado === "Activa").length;
    const mantenimiento = unidades.filter(u => u.estado === "En mantenimiento").length;
    const categorias = new Set(unidades.map(u => u.categoria)).size;

    if (totalUnidades) totalUnidades.textContent = unidades.length;
    if (totalActivas) totalActivas.textContent = activas;
    if (totalMantenimiento) totalMantenimiento.textContent = mantenimiento;
    if (totalCategorias) totalCategorias.textContent = categorias;
}

function limpiarFormulario() {
    const formUnidad = document.getElementById("formUnidad");

    if (formUnidad) {
        formUnidad.reset();
    }

    document.getElementById("modoEdicion").value = "";
    document.getElementById("indiceEdicion").value = "";
    document.getElementById("btnGuardar").textContent = "Guardar unidad";
}

function limpiarTodo() {
    const buscar = document.getElementById("buscar");

    if (buscar) {
        buscar.value = "";
    }

    limpiarFormulario();
    renderTabla();
}

function editarUnidad(ficha) {
    const unidades = getUnidades();  // 🔥 USAR FUNCIÓN HELPER
    const u = unidades.find(unit => unit.ficha === ficha);

    if (!u) {
        alert("Unidad no encontrada");
        return;
    }

    document.getElementById("ficha").value = u.ficha;
    document.getElementById("categoria").value = u.categoria;
    document.getElementById("marca").value = u.marca;
    document.getElementById("anio").value = u.anio;
    document.getElementById("modelo").value = u.modelo;
    document.getElementById("estado").value = u.estado;
    document.getElementById("comentario").value = u.comentario;

    document.getElementById("modoEdicion").value = "editar";
    document.getElementById("indiceEdicion").value = ficha;
    document.getElementById("btnGuardar").textContent = "Actualizar unidad";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function eliminarUnidad(ficha) {
    const confirmar = confirm("¿Seguro que deseas eliminar esta unidad?");

    if (!confirmar) return;

    // 🔥 USAR DATABASE.JS
    const unidades = getUnidades();
    const index = unidades.findIndex(u => u.ficha === ficha);
    if (index > -1) {
        unidades.splice(index, 1);
        guardarBD();  // 🔥 GUARDAR EN BD CENTRALIZADA
    }
    
    renderTabla();
    actualizarResumen();
}

function verUnidad(ficha) {
    const unidades = getUnidades();  // 🔥 USAR FUNCIÓN HELPER
    const u = unidades.find(unit => unit.ficha === ficha);

    if (!u) {
        alert("Unidad no encontrada");
        return;
    }

    alert(
        "DETALLE DE LA UNIDAD\n\n" +
        "Ficha: " + u.ficha + "\n" +
        "Categoría: " + u.categoria + "\n" +
        "Marca: " + u.marca + "\n" +
        "Año: " + u.anio + "\n" +
        "Modelo: " + (u.modelo || "-") + "\n" +
        "Estado: " + u.estado + "\n" +
        "KM Actual: " + (u.kmActual || 0) + "\n" +
        "Comentario: " + (u.comentario || "-")
    );
}

function verificarUnidades() {
    const errores = [];
    const unidades = getUnidades();  // 🔥 USAR FUNCIÓN HELPER

    unidades.forEach((u, i) => {
        if (!u.ficha || !u.categoria || !u.marca || !u.anio || !u.estado) {
            errores.push(`Fila ${i + 1}: campos obligatorios incompletos.`);
        }
    });

    const fichas = unidades.map(u => u.ficha.toLowerCase());
    const duplicadas = fichas.filter((f, i) => fichas.indexOf(f) !== i);

    if (duplicadas.length > 0) {
        errores.push("Existen fichas duplicadas: " + [...new Set(duplicadas)].join(", "));
    }

    if (errores.length > 0) {
        alert("Se encontraron errores:\n\n" + errores.join("\n"));
    } else {
        alert("Verificación completada. No se encontraron errores.");
    }
}

function abrirModalPlantilla() {
    document.getElementById("modalPlantilla").classList.add("show");
}

function cerrarModalPlantilla() {
    document.getElementById("modalPlantilla").classList.remove("show");
}

function generarPlantilla() {
    const checks = document.querySelectorAll(".check-item input:checked");
    const columnas = Array.from(checks).map(ch => ch.value);

    if (columnas.length === 0) {
        alert("Debe seleccionar al menos una columna.");
        return;
    }

    const ejemplo = {};

    columnas.forEach(col => {
        ejemplo[col] = "";
    });

    if (columnas.includes("FICHA")) ejemplo["FICHA"] = "T-001";
    if (columnas.includes("CATEGORIA")) ejemplo["CATEGORIA"] = "Autobús";
    if (columnas.includes("MARCA")) ejemplo["MARCA"] = "Hyundai";
    if (columnas.includes("ANIO")) ejemplo["ANIO"] = "2022";
    if (columnas.includes("MODELO")) ejemplo["MODELO"] = "County";
    if (columnas.includes("ESTADO")) ejemplo["ESTADO"] = "Activa";
    if (columnas.includes("COMENTARIO")) ejemplo["COMENTARIO"] = "Comentario de ejemplo";

    const ws = XLSX.utils.json_to_sheet([ejemplo], {
        header: columnas
    });

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "UNIDADES");

    XLSX.writeFile(wb, "Plantilla_Unidades.xlsx");

    cerrarModalPlantilla();
}

function subirExcel(event) {
    const archivo = event.target.files[0];

    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {
            type: "array"
        });

        const hoja = workbook.Sheets[workbook.SheetNames[0]];

        const filas = XLSX.utils.sheet_to_json(hoja, {
            defval: ""
        });

        if (filas.length === 0) {
            alert("El archivo está vacío.");
            return;
        }

        let importadas = 0;
        let errores = [];

        filas.forEach((fila, index) => {
            const ficha = String(fila.FICHA || fila.Ficha || "").trim();
            const categoria = String(fila.CATEGORIA || fila.Categoría || fila.Categoria || "").trim();
            const marca = String(fila.MARCA || fila.Marca || "").trim();
            const anio = String(fila.ANIO || fila.AÑO || fila.Año || "").trim();
            const modelo = String(fila.MODELO || fila.Modelo || "").trim();
            const estado = String(fila.ESTADO || fila.Estado || "Activa").trim();
            const comentario = String(fila.COMENTARIO || fila.Comentario || "").trim();

            if (!ficha || !categoria || !marca || !anio) {
                errores.push(`Fila ${index + 2}: faltan campos obligatorios.`);
                return;
            }

            const existe = unidades.some(u => u.ficha.toLowerCase() === ficha.toLowerCase());

            if (existe) {
                errores.push(`Fila ${index + 2}: la ficha ${ficha} ya existe.`);
                return;
            }

            unidades.push({
                ficha,
                categoria,
                marca,
                anio,
                modelo,
                estado: estado || "Activa",
                comentario
            });

            importadas++;
        });

        renderTabla();
        actualizarResumen();

        let mensaje = `Importación completada.\n\nUnidades importadas: ${importadas}`;

        if (errores.length > 0) {
            mensaje += "\n\nErrores encontrados:\n" + errores.join("\n");
        }

        alert(mensaje);

        event.target.value = "";
    };

    lector.readAsArrayBuffer(archivo);
}

function descargarListado() {
    const data = unidades.map(u => ({
        FICHA: u.ficha,
        CATEGORIA: u.categoria,
        MARCA: u.marca,
        ANIO: u.anio,
        MODELO: u.modelo,
        ESTADO: u.estado,
        COMENTARIO: u.comentario
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "LISTADO_UNIDADES");

    XLSX.writeFile(wb, "Listado_Unidades.xlsx");
}