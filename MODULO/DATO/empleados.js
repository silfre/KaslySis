let empleados = [
    {
        codigoEmpleado: "EMP-0001",
        nombre: "Carlos",
        apellido: "Pérez Gómez",
        telefono: "0987654321",
        correo: "carlos@empresa.com",
        cargo: "Supervisor de Flota",
        departamento: "Operaciones",
        estado: "Activo",
        comentario: ""
    },
    {
        codigoEmpleado: "EMP-0002",
        nombre: "María",
        apellido: "Fernández López",
        telefono: "0991234567",
        correo: "maria@empresa.com",
        cargo: "Analista de Datos",
        departamento: "Administración",
        estado: "Activo",
        comentario: ""
    },
    {
        codigoEmpleado: "EMP-0003",
        nombre: "Luis",
        apellido: "Rodríguez Torres",
        telefono: "0967890123",
        correo: "luis@empresa.com",
        cargo: "Chofer",
        departamento: "Operaciones",
        estado: "Activo",
        comentario: ""
    },
    {
        codigoEmpleado: "EMP-0004",
        nombre: "Ana",
        apellido: "Martínez Sánchez",
        telefono: "0976543210",
        correo: "ana@empresa.com",
        cargo: "Asistente Administrativo",
        departamento: "Administración",
        estado: "Inactivo",
        comentario: ""
    },
    {
        codigoEmpleado: "EMP-0005",
        nombre: "Jorge",
        apellido: "Vásquez Ramírez",
        telefono: "0954321098",
        correo: "jorge@empresa.com",
        cargo: "Mecánico",
        departamento: "Mantenimiento",
        estado: "Activo",
        comentario: ""
    }
];

document.addEventListener("DOMContentLoaded", function () {
    const btnMenu = document.getElementById("btnMenu");

    if (btnMenu) {
        btnMenu.addEventListener("click", function () {
            document.body.classList.toggle("menu-cerrado");
        });
    }

    renderTabla();
    actualizarResumen();
});

function guardarEmpleado(event) {
    event.preventDefault();

    const codigoEmpleado = document.getElementById("codigoEmpleado").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const cargo = document.getElementById("cargo").value.trim();
    const departamento = document.getElementById("departamento").value.trim();
    const estado = document.getElementById("estado").value.trim();
    const comentario = document.getElementById("comentario").value.trim();

    if (!codigoEmpleado || !nombre || !apellido || !cargo || !departamento || !estado) {
        alert("Debe completar los campos obligatorios: código, nombre, apellido, cargo, departamento y estado.");
        return;
    }

    const modoEdicion = document.getElementById("modoEdicion").value;
    const indiceEdicion = document.getElementById("indiceEdicion").value;

    const empleado = {
        codigoEmpleado,
        nombre,
        apellido,
        telefono,
        correo,
        cargo,
        departamento,
        estado,
        comentario
    };

    if (modoEdicion === "editar") {
        empleados[indiceEdicion] = empleado;
        alert("Empleado actualizado correctamente.");
    } else {
        const existe = empleados.some(e =>
            e.codigoEmpleado.toLowerCase() === codigoEmpleado.toLowerCase()
        );

        if (existe) {
            alert("Ya existe un empleado registrado con ese código.");
            return;
        }

        empleados.push(empleado);
        alert("Empleado guardado correctamente.");
    }

    limpiarFormulario();
    renderTabla();
    actualizarResumen();
}

function renderTabla() {
    const tbody = document.getElementById("tablaEmpleados");
    const buscarInput = document.getElementById("buscar");

    if (!tbody) return;

    const buscar = buscarInput ? buscarInput.value.toLowerCase() : "";

    tbody.innerHTML = "";

    const filtrados = empleados.filter(e =>
        e.codigoEmpleado.toLowerCase().includes(buscar) ||
        e.nombre.toLowerCase().includes(buscar) ||
        e.apellido.toLowerCase().includes(buscar) ||
        e.telefono.toLowerCase().includes(buscar) ||
        e.correo.toLowerCase().includes(buscar) ||
        e.cargo.toLowerCase().includes(buscar) ||
        e.departamento.toLowerCase().includes(buscar) ||
        e.estado.toLowerCase().includes(buscar)
    );

    if (filtrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">No hay empleados registrados.</td>
            </tr>
        `;
    }

    filtrados.forEach((e) => {
        const indiceReal = empleados.indexOf(e);

        tbody.innerHTML += `
            <tr>
                <td>${e.codigoEmpleado}</td>
                <td>${e.nombre}</td>
                <td>${e.apellido}</td>
                <td>${e.cargo}</td>
                <td>${e.departamento}</td>
                <td>${e.telefono || "-"}</td>
                <td>${estadoBadge(e.estado)}</td>
                <td>
                    <button class="action-btn action-edit" onclick="editarEmpleado(${indiceReal})" title="Editar">✏️</button>
                    <button class="action-btn action-delete" onclick="eliminarEmpleado(${indiceReal})" title="Eliminar">🗑</button>
                    <button class="action-btn action-view" onclick="verEmpleado(${indiceReal})" title="Ver">👁</button>
                </td>
            </tr>
        `;
    });

    const infoTabla = document.getElementById("infoTabla");

    if (infoTabla) {
        infoTabla.textContent = `Mostrando 1 a ${filtrados.length} de ${empleados.length} empleados`;
    }
}

function estadoBadge(estado) {
    if (estado === "Activo") {
        return `<span class="badge badge-activo">Activo</span>`;
    }

    if (estado === "Inactivo") {
        return `<span class="badge badge-inactivo">Inactivo</span>`;
    }

    return `<span class="badge">${estado}</span>`;
}

function actualizarResumen() {
    const totalEmpleados = document.getElementById("totalEmpleados");
    const totalActivos = document.getElementById("totalActivos");
    const totalInactivos = document.getElementById("totalInactivos");
    const totalDepartamentos = document.getElementById("totalDepartamentos");

    const activos = empleados.filter(e => e.estado === "Activo").length;
    const inactivos = empleados.filter(e => e.estado === "Inactivo").length;
    const departamentos = new Set(empleados.map(e => e.departamento)).size;

    if (totalEmpleados) totalEmpleados.textContent = empleados.length;
    if (totalActivos) totalActivos.textContent = activos;
    if (totalInactivos) totalInactivos.textContent = inactivos;
    if (totalDepartamentos) totalDepartamentos.textContent = departamentos;
}

function limpiarFormulario() {
    const formEmpleado = document.getElementById("formEmpleado");

    if (formEmpleado) {
        formEmpleado.reset();
    }

    document.getElementById("modoEdicion").value = "";
    document.getElementById("indiceEdicion").value = "";
    document.getElementById("btnGuardar").textContent = "Guardar empleado";
}

function limpiarTodo() {
    const buscar = document.getElementById("buscar");

    if (buscar) {
        buscar.value = "";
    }

    limpiarFormulario();
    renderTabla();
}

function editarEmpleado(index) {
    const e = empleados[index];

    document.getElementById("codigoEmpleado").value = e.codigoEmpleado;
    document.getElementById("nombre").value = e.nombre;
    document.getElementById("apellido").value = e.apellido;
    document.getElementById("telefono").value = e.telefono;
    document.getElementById("correo").value = e.correo;
    document.getElementById("cargo").value = e.cargo;
    document.getElementById("departamento").value = e.departamento;
    document.getElementById("estado").value = e.estado;
    document.getElementById("comentario").value = e.comentario;

    document.getElementById("modoEdicion").value = "editar";
    document.getElementById("indiceEdicion").value = index;
    document.getElementById("btnGuardar").textContent = "Actualizar empleado";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function eliminarEmpleado(index) {
    const confirmar = confirm("¿Seguro que deseas eliminar este empleado?");

    if (!confirmar) return;

    empleados.splice(index, 1);
    renderTabla();
    actualizarResumen();
}

function verEmpleado(index) {
    const e = empleados[index];

    alert(
        "DETALLE DEL EMPLEADO\n\n" +
        "Código: " + e.codigoEmpleado + "\n" +
        "Nombre: " + e.nombre + "\n" +
        "Apellido: " + e.apellido + "\n" +
        "Teléfono: " + (e.telefono || "-") + "\n" +
        "Correo: " + (e.correo || "-") + "\n" +
        "Cargo: " + e.cargo + "\n" +
        "Departamento: " + e.departamento + "\n" +
        "Estado: " + e.estado + "\n" +
        "Comentario: " + (e.comentario || "-")
    );
}

function verificarEmpleados() {
    const errores = [];

    empleados.forEach((e, i) => {
        if (!e.codigoEmpleado || !e.nombre || !e.apellido || !e.cargo || !e.departamento || !e.estado) {
            errores.push(`Fila ${i + 1}: campos obligatorios incompletos.`);
        }
    });

    const codigos = empleados.map(e => e.codigoEmpleado.toLowerCase());
    const duplicados = codigos.filter((c, i) => codigos.indexOf(c) !== i);

    if (duplicados.length > 0) {
        errores.push("Existen códigos de empleados duplicados: " + [...new Set(duplicados)].join(", "));
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

    if (columnas.includes("CODIGO_EMPLEADO")) ejemplo["CODIGO_EMPLEADO"] = "EMP-0001";
    if (columnas.includes("NOMBRE")) ejemplo["NOMBRE"] = "Carlos";
    if (columnas.includes("APELLIDO")) ejemplo["APELLIDO"] = "Pérez Gómez";
    if (columnas.includes("TELEFONO")) ejemplo["TELEFONO"] = "809-555-1234";
    if (columnas.includes("CORREO")) ejemplo["CORREO"] = "correo@empresa.com";
    if (columnas.includes("CARGO")) ejemplo["CARGO"] = "Chofer";
    if (columnas.includes("DEPARTAMENTO")) ejemplo["DEPARTAMENTO"] = "Operaciones";
    if (columnas.includes("ESTADO")) ejemplo["ESTADO"] = "Activo";
    if (columnas.includes("COMENTARIO")) ejemplo["COMENTARIO"] = "Comentario de ejemplo";

    const ws = XLSX.utils.json_to_sheet([ejemplo], {
        header: columnas
    });

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "EMPLEADOS");

    XLSX.writeFile(wb, "Plantilla_Empleados.xlsx");

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

        let importados = 0;
        let errores = [];

        filas.forEach((fila, index) => {
            const codigoEmpleado = String(
                fila.CODIGO_EMPLEADO ||
                fila["CÓDIGO EMPLEADO"] ||
                fila["CODIGO EMPLEADO"] ||
                fila.Codigo ||
                fila.CÓDIGO ||
                ""
            ).trim();

            const nombre = String(fila.NOMBRE || fila.Nombre || "").trim();
            const apellido = String(fila.APELLIDO || fila.Apellido || "").trim();
            const telefono = String(fila.TELEFONO || fila.TELÉFONO || fila.Telefono || fila.Teléfono || "").trim();
            const correo = String(fila.CORREO || fila.Correo || "").trim();
            const cargo = String(fila.CARGO || fila.Cargo || "").trim();
            const departamento = String(fila.DEPARTAMENTO || fila.Departamento || "").trim();
            const estado = String(fila.ESTADO || fila.Estado || "Activo").trim();
            const comentario = String(fila.COMENTARIO || fila.Comentario || "").trim();

            if (!codigoEmpleado || !nombre || !apellido || !cargo || !departamento) {
                errores.push(`Fila ${index + 2}: faltan campos obligatorios.`);
                return;
            }

            const existe = empleados.some(e =>
                e.codigoEmpleado.toLowerCase() === codigoEmpleado.toLowerCase()
            );

            if (existe) {
                errores.push(`Fila ${index + 2}: el código ${codigoEmpleado} ya existe.`);
                return;
            }

            empleados.push({
                codigoEmpleado,
                nombre,
                apellido,
                telefono,
                correo,
                cargo,
                departamento,
                estado: estado || "Activo",
                comentario
            });

            importados++;
        });

        renderTabla();
        actualizarResumen();

        let mensaje = `Importación completada.\n\nEmpleados importados: ${importados}`;

        if (errores.length > 0) {
            mensaje += "\n\nErrores encontrados:\n" + errores.join("\n");
        }

        alert(mensaje);

        event.target.value = "";
    };

    lector.readAsArrayBuffer(archivo);
}

function descargarListado() {
    const data = empleados.map(e => ({
        CODIGO_EMPLEADO: e.codigoEmpleado,
        NOMBRE: e.nombre,
        APELLIDO: e.apellido,
        TELEFONO: e.telefono,
        CORREO: e.correo,
        CARGO: e.cargo,
        DEPARTAMENTO: e.departamento,
        ESTADO: e.estado,
        COMENTARIO: e.comentario
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "LISTADO_EMPLEADOS");

    XLSX.writeFile(wb, "Listado_Empleados.xlsx");
}