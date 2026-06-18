 /*
        ===========================
        CATÁLOGO DE UNIDADES
        Aquí agregas tus unidades reales.
        La marca nace automáticamente de la unidad.
        ===========================
    */
    const unidadesMarca = {
        "T81": "Toyota/COASTER",
        "T80": "Toyota/COASTER",
        "T13": "Toyota/COASTER",
        "T23": "Toyota/COASTER",
        "T26": "Toyota/COASTER",
        "T34": "Toyota/COASTER",
        "T40": "Toyota/COASTER",

        "T61": "Toyota/HIACE",
        "T29": "Toyota/HIACE",
        "T43": "Toyota/HIACE",
        "T05": "Toyota/HIACE",
        "T07": "Toyota/HIACE",
        "T100": "Toyota/HIACE",
        "T11": "Toyota/HIACE",
        "T12": "Toyota/HIACE",
        "T15": "Toyota/HIACE",
        "T16": "Toyota/HIACE",
        "T17": "Toyota/HIACE",
        "T18": "Toyota/HIACE",
        "T22": "Toyota/HIACE",
        "T25": "Toyota/HIACE",
        "T27": "Toyota/HIACE",
        "T33": "Toyota/HIACE",
        "T35": "Toyota/HIACE",
        "T36": "Toyota/COASTER",
        "T47": "Toyota/HIACE",

        "T67": "Mitsubishi/Fuso"
    };

    /*
        ===========================
        CATÁLOGO DE EMPLEADOS
        El conductor nace del código empleado.
        ===========================
    */
    const empleados = {
        "1001": "Juan Pérez",
        "1002": "Carlos Gómez",
        "1003": "Miguel Santana",
        "1004": "Pedro Jiménez"
    };

    /*
        ===========================
        RANGOS DE RENDIMIENTO
        Ajusta estos rangos según tu empresa.
        ===========================
    */
    const rangos = {
    "TOYOTA COASTER": { min: 16, max: 22 },
    "TOYOTA/COASTER": { min: 16, max: 22 },

    "TOYOTA HIACE": { min: 30, max: 45 },
    "TOYOTA/HIACE": { min: 30, max: 45 },

    "MITSUBISHI FUSO": { min: 16, max: 22 },
    "MITSUBISHI/FUSO": { min: 16, max: 22 },

    "MERCEDES BENZ": { min: 6, max: 12 },
    "HYUNDAI H1": { min: 30, max: 40 }
};

        let paginaActual = 1;
        let registrosPorPagina = 80;
      let chartRendimientoUnidad = null;
        let chartEvolucion = null;
        let datosGraficoActual = [];


    let registros = [
         {
    fecha: "2026-05-01",
    hora: "14:06",
    unidad: "T98",
    codigoEmpleado: "1001",
    kmInicial: 312375,
    kmActual: 312477,
    combPorFuera: 0,
    combMismoDia: 0,
    combInicial: 6.55
        }
        
        
    ];
if (typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
}


    renderizarTabla();

   function renderizarTabla() {
    calcularTodo();

    const tbody = document.getElementById("tablaBody");
    tbody.innerHTML = "";

    const filtrados = obtenerRegistrosFiltrados();

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;

    const visibles = filtrados.slice(inicio, fin);

    visibles.forEach(item => {
        const fila = item.fila;
        const index = item.index;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <input class="input-tabla" type="date" value="${escapar(fila.fecha)}"
                onchange="actualizarDato(${index}, 'fecha', this.value)">
            </td>

            <td>
                <input class="input-tabla" type="time" value="${escapar(fila.hora)}"
                onchange="actualizarDato(${index}, 'hora', this.value)">
            </td>

            <td>
                <input class="input-tabla" value="${escapar(fila.unidad)}"
                onchange="actualizarDato(${index}, 'unidad', this.value)">
            </td>

            <td class="auto">${escapar(fila.marca)}</td>

            <td>
                <input class="input-tabla" value="${escapar(fila.codigoEmpleado)}"
                onchange="actualizarDato(${index}, 'codigoEmpleado', this.value)">
            </td>

            <td class="auto">${escapar(fila.conductor)}</td>

            <td>
                <input class="input-tabla" value="${escapar(fila.kmActual)}"
                onchange="actualizarDato(${index}, 'kmActual', this.value)">
            </td>

            <td class="auto">${formatoNumero(fila.ultimoKm)}</td>

            <td>
                <input class="input-tabla" value="${escapar(fila.combPorFuera)}"
                onchange="actualizarDato(${index}, 'combPorFuera', this.value)">
            </td>

            <td class="auto">${formatoGalon(fila.combMismoDia)}</td>

            <td>
                <input class="input-tabla" value="${escapar(fila.combInicial)}"
                onchange="actualizarDato(${index}, 'combInicial', this.value)">
            </td>

            <td class="auto">${formatoGalon(fila.combTotal)}</td>

          

            <td class="auto">${formatoNumero(fila.kmRecorrido)}</td>

            <td class="auto">${formatoNumero(fila.rendimiento)}</td>

            <td>${crearEstado(fila.estadoRango)}</td>

            <td>${crearComentario(fila.comentario)}</td>

            <td>
                <div class="acciones">
                    <button class="accion accion-editar" onclick="duplicarFila(${index})">Duplicar</button>
                    <button class="accion accion-borrar" onclick="eliminarFila(${index})">Eliminar</button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    actualizarCards();
 actualizarPaginacion(filtrados.length);
 setTimeout(actualizarScrollHorizontalVisible, 50);
}




function obtenerRegistrosFiltrados() {
    const buscador = document.getElementById("buscador");
    const filtro = buscador ? normalizarTexto(buscador.value) : "";

    return registros
        .map((fila, index) => ({ fila, index }))
        .filter(item => {
            const fila = item.fila;

            const textoFila = normalizarTexto(
                fila.fecha + " " +
                fila.hora + " " +
                fila.unidad + " " +
                fila.marca + " " +
                fila.codigoEmpleado + " " +
                fila.conductor + " " +
                fila.estadoRango + " " +
                fila.comentario
            );

            return !filtro || textoFila.includes(filtro);
        });
}

function buscarEnTabla() {
    paginaActual = 1;
    renderizarTabla();
}

function cambiarRegistrosPorPagina(valor) {
    registrosPorPagina = parseInt(valor, 10) || 80;
    paginaActual = 1;
    renderizarTabla();
}

function actualizarPaginacion(totalFiltrado) {
    const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / registrosPorPagina));

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    const inicio = totalFiltrado === 0 ? 0 : ((paginaActual - 1) * registrosPorPagina) + 1;
    const fin = Math.min(paginaActual * registrosPorPagina, totalFiltrado);

    const texto = document.getElementById("textoPaginacion");

    if (texto) {
        texto.textContent = inicio + "-" + fin + " / " + totalFiltrado;
    }

    const btnPrimera = document.getElementById("btnPrimeraPagina");
    const btnAnterior = document.getElementById("btnPaginaAnterior");
    const btnSiguiente = document.getElementById("btnPaginaSiguiente");
    const btnUltima = document.getElementById("btnUltimaPagina");

    if (btnPrimera) btnPrimera.disabled = paginaActual <= 1;
    if (btnAnterior) btnAnterior.disabled = paginaActual <= 1;
    if (btnSiguiente) btnSiguiente.disabled = paginaActual >= totalPaginas;
    if (btnUltima) btnUltima.disabled = paginaActual >= totalPaginas;
}

function irPrimeraPagina() {
    paginaActual = 1;
    renderizarTabla();
}

function irPaginaAnterior() {
    if (paginaActual > 1) {
        paginaActual--;
        renderizarTabla();
    }
}

function irPaginaSiguiente() {
    const filtrados = obtenerRegistrosFiltrados();
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));

    if (paginaActual < totalPaginas) {
        paginaActual++;
        renderizarTabla();
    }
}

function irUltimaPagina() {
    const filtrados = obtenerRegistrosFiltrados();
    paginaActual = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));
    renderizarTabla();
}


   function calcularTodo() {

    // 1. Normalizar datos principales
    registros.forEach((fila, index) => {
        fila._indexOriginal = index;

        fila.unidad = String(fila.unidad || "").trim().toUpperCase();
        fila.codigoEmpleado = String(fila.codigoEmpleado || "").trim();

        fila.kmInicial = convertirNumero(fila.kmInicial);
        fila.kmActual = convertirNumero(fila.kmActual);
        fila.combPorFuera = convertirNumero(fila.combPorFuera);
        fila.combInicial = convertirNumero(fila.combInicial);

        // Esta columna ahora será automática
        fila.combMismoDia = 0;

        fila.marca = obtenerMarca(fila.unidad);
        fila.conductor = obtenerConductor(fila.codigoEmpleado);

        // Galonaje propio de la fila
        fila.galonajePropio = fila.combPorFuera + fila.combInicial;

        fila.comentario = "Mantener";
    });

    // 2. Aplicar lógica de misma unidad y misma fecha
    aplicarLogicaMismoDia();

    // 3. Calcular combustible total después de sumar combustible del mismo día
    registros.forEach(fila => {
        fila.combTotal = fila.combPorFuera + fila.combInicial + fila.combMismoDia;
    });

    // 4. Calcular último KM, recorrido, rendimiento y rango
    registros.forEach((fila, index) => {
        const anterior = buscarRegistroAnterior(index);

        if (anterior) {
            fila.ultimoKm = convertirNumero(anterior.kmActual);
            fila.ultimoCombustible = convertirNumero(anterior.combTotal);
        } else {
            fila.ultimoKm = fila.kmInicial;
            fila.ultimoCombustible = 0;
        }

        fila.kmRecorrido = fila.kmActual - fila.ultimoKm;

        if (fila.combTotal > 0) {
            fila.rendimiento = fila.kmRecorrido / fila.combTotal;
        } else {
            fila.rendimiento = 0;
        }

        if (fila.comentario === "Borrar") {
              fila.estadoRango = "Inactivo";
        } else if (!anterior) {
                fila.estadoRango = "Dentro del rango";
        } else {
             fila.estadoRango = calcularEstadoRango(fila.marca, fila.rendimiento);
}
    });
}
function aplicarLogicaMismoDia() {
    const grupos = {};

    registros.forEach((fila, index) => {
        const clave = fila.unidad + "|" + fila.fecha;

        if (!grupos[clave]) {
            grupos[clave] = [];
        }

        grupos[clave].push({
            fila: fila,
            index: index
        });
    });

    Object.keys(grupos).forEach(clave => {
        const grupo = grupos[clave];

        if (grupo.length === 1) {
            grupo[0].fila.comentario = "Mantener";
            grupo[0].fila.combMismoDia = 0;
            return;
        }

        // Orden:
        // 1. KM más alto
        // 2. Si el KM es igual, mayor galonaje
        // 3. Si sigue igual, hora más reciente
        grupo.sort((a, b) => {
            const kmA = convertirNumero(a.fila.kmActual);
            const kmB = convertirNumero(b.fila.kmActual);

            if (kmB !== kmA) {
                return kmB - kmA;
            }

            const galA = convertirNumero(a.fila.galonajePropio);
            const galB = convertirNumero(b.fila.galonajePropio);

            if (galB !== galA) {
                return galB - galA;
            }

            const horaA = convertirHoraAMinutos(a.fila.hora);
            const horaB = convertirHoraAMinutos(b.fila.hora);

            return horaB - horaA;
        });

        const ganador = grupo[0];
        let combustibleMismoDia = 0;

        grupo.forEach((item, posicion) => {
            if (posicion === 0) {
                item.fila.comentario = "Mantener";
            } else {
                item.fila.comentario = "Borrar";

                // Se suma el galonaje de los registros que se van a borrar
                combustibleMismoDia += convertirNumero(item.fila.galonajePropio);
            }
        });

        ganador.fila.combMismoDia = combustibleMismoDia;
    });
}


   function buscarRegistroAnterior(indexActual) {
    const actual = registros[indexActual];

    const unidadActual = String(actual.unidad || "").trim().toUpperCase();
    const kmActual = convertirNumero(actual.kmActual);
    const fechaHoraActual = obtenerFechaHoraValor(actual.fecha, actual.hora);

    let candidatos = [];

    registros.forEach((fila, index) => {
        if (index === indexActual) return;

        const mismaUnidad = String(fila.unidad || "").trim().toUpperCase() === unidadActual;

        if (!mismaUnidad) return;

        // Regla importante:
        // Si dice Borrar, ese KM nunca se toma como último KM
        if (fila.comentario !== "Mantener") return;

        const kmFila = convertirNumero(fila.kmActual);
        const fechaHoraFila = obtenerFechaHoraValor(fila.fecha, fila.hora);

        if (fechaHoraFila >= fechaHoraActual) return;

        if (kmFila >= kmActual) return;

        candidatos.push(fila);
    });

    if (candidatos.length === 0) {
        return null;
    }

    // Toma el KM anterior más cercano
    candidatos.sort((a, b) => convertirNumero(b.kmActual) - convertirNumero(a.kmActual));

    return candidatos[0];
}
    function obtenerMarca(unidad) {
        if (!unidad) return "#N/D";

        if (unidadesMarca[unidad]) {
            return unidadesMarca[unidad];
        }

        return "#N/D";
    }

    function obtenerConductor(codigo) {
        if (!codigo) return "#N/D";

        if (empleados[codigo]) {
            return empleados[codigo];
        }

        return "#N/D";
    }

   function calcularEstadoRango(marca, rendimiento) {
    const marcaNormal = normalizarMarca(marca);
    const rango = rangos[marcaNormal];

    if (!rango) {
        return "Sin rango";
    }

    if (rendimiento < rango.min) {
        return "Debajo del rango";
    }

    if (rendimiento > rango.max) {
        return "Sobre el rango";
    }

    return "Dentro del rango";
}

function normalizarMarca(marca) {
    return String(marca || "")
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
}

function obtenerFechaHoraValor(fecha, hora) {
    if (!fecha) {
        return 0;
    }

    const horaFinal = hora || "00:00";

    const fechaHora = new Date(fecha + "T" + horaFinal);

    if (isNaN(fechaHora.getTime())) {
        return valorFecha(fecha);
    }

    return fechaHora.getTime();
}

function convertirHoraAMinutos(hora) {
    if (!hora) {
        return 0;
    }

    const texto = String(hora).trim();

    if (texto.includes(":")) {
        const partes = texto.split(":");
        const h = parseInt(partes[0], 10) || 0;
        const m = parseInt(partes[1], 10) || 0;

        return h * 60 + m;
    }

    return 0;
}


    function actualizarDato(index, campo, valor) {
        registros[index][campo] = valor;
        renderizarTabla();
        mostrarMensaje("Registro actualizado automáticamente.");
    }

   function agregarFila() {
    registros.push({
        fecha: "",
        hora: "",
        unidad: "",
        codigoEmpleado: "",
        kmInicial: 0,
        kmActual: 0,
        combPorFuera: 0,
        combMismoDia: 0,
        combInicial: 0
    });

    renderizarTabla();
    mostrarMensaje("Nuevo registro agregado.");
}

    function duplicarFila(index) {
        const copia = {...registros[index]};
        registros.push(copia);
        renderizarTabla();
        mostrarMensaje("Registro duplicado correctamente.");
    }

    function eliminarFila(index) {
        registros.splice(index, 1);
        renderizarTabla();
        mostrarMensaje("Registro eliminado.");
    }

    function limpiarTabla() {
        registros = [];
        renderizarTabla();
        mostrarMensaje("Tabla limpiada correctamente.");
    }

    function verificarDatos() {
        let errores = 0;

        registros.forEach(fila => {
            if (!fila.unidad) errores++;
            if (!fila.kmActual) errores++;
            if (!fila.fecha) errores++;
            if (fila.marca === "#N/D") errores++;
        });

        if (errores > 0) {
            mostrarMensaje("Verificación: hay " + errores + " campos o datos pendientes de revisar.");
        } else {
            mostrarMensaje("Verificación correcta. Todo está listo.");
        }
    }

   function actualizarCards() {
    let dentro = 0;
    let sobre = 0;
    let debajo = 0;
    let inactivo = 0;

    registros.forEach(fila => {

        if (fila.comentario === "Borrar") {
            inactivo++;
            return;
        }

        if (fila.estadoRango === "Dentro del rango") {
            dentro++;
        }

        if (fila.estadoRango === "Sobre el rango") {
            sobre++;
        }

        if (fila.estadoRango === "Debajo del rango") {
            debajo++;
        }
    });

    document.getElementById("cardTotal").textContent = registros.length;
    document.getElementById("cardDentro").textContent = dentro;
    document.getElementById("cardSobre").textContent = sobre;
    document.getElementById("cardDebajo").textContent = debajo;
    document.getElementById("cardInactivo").textContent = inactivo;
}

    function descargarExcel() {
        calcularTodo();

      const datos = registros.map(fila => ({
    "Fecha": fila.fecha,
    "Hora": fila.hora,
    "# Unidad": fila.unidad,
    "Marca": fila.marca,
    "Código empleado": fila.codigoEmpleado,
    "Conductor": fila.conductor,
    "Kilometraje actual": fila.kmActual,
    "Último kilometraje": fila.ultimoKm,
    "Combustible por fuera": fila.combPorFuera,
    "Combustible el mismo día": fila.combMismoDia,
    "Combustible inicial": fila.combInicial,
    "Combustible total": fila.combTotal,
    "Kilometraje recorrido": fila.kmRecorrido,
    "Rendimiento (km/gal)": fila.rendimiento,
    "Estado del rango": fila.estadoRango,
    "Comentario": fila.comentario
}));

        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(libro, hoja, "Combustible");
        XLSX.writeFile(libro, "modulo_combustible.xlsx");

        mostrarMensaje("Archivo Excel descargado.");
    }

   function leerExcel(event) {
    const archivo = event.target.files[0];

    if (!archivo) return;

    if (typeof XLSX === "undefined") {
        alert("Error: la librería XLSX no cargó. Revisa tu conexión a internet.");
        event.target.value = "";
        return;
    }

    const lector = new FileReader();

    lector.onload = function(e) {
        const datos = new Uint8Array(e.target.result);
        const libro = XLSX.read(datos, { type: "array" });
        const hoja = libro.Sheets[libro.SheetNames[0]];

        const matriz = XLSX.utils.sheet_to_json(hoja, {
            header: 1,
            defval: ""
        });

        const escaneo = escanearPlantillaSubida(matriz);

        if (!escaneo.correcto) {
            mostrarMensaje("Error: " + escaneo.mensaje);
            alert("No se puede subir el archivo.\n\n" + escaneo.mensaje);
            event.target.value = "";
            return;
        }

        const filasDatos = matriz
            .slice(escaneo.filaEncabezado + 1)
            .filter(fila => fila.some(celda => String(celda).trim() !== ""));

        registros = filasDatos.map(fila => {
            const kmActual = buscarCeldaPorIndice(fila, escaneo.indices.kmActual);

            return {
                fecha: convertirFechaExcel(buscarCeldaPorIndice(fila, escaneo.indices.fecha)),
                hora: convertirHoraExcel(buscarCeldaPorIndice(fila, escaneo.indices.hora)),
                codigoEmpleado: buscarCeldaPorIndice(fila, escaneo.indices.codigoEmpleado),
                kmActual: kmActual,
                unidad: buscarCeldaPorIndice(fila, escaneo.indices.unidad),

                combInicial: buscarCeldaPorIndice(fila, escaneo.indices.combInicial),
                combPorFuera: buscarCeldaPorIndice(fila, escaneo.indices.combPorFuera),
                combMismoDia: buscarCeldaPorIndice(fila, escaneo.indices.combMismoDia),

                kmInicial: buscarCeldaPorIndice(fila, escaneo.indices.kmInicial) || kmActual
            };
        });

        renderizarTabla();

        mostrarMensaje("Archivo escaneado y cargado correctamente. Registros cargados: " + registros.length);
        alert("Archivo correcto.\n\nColumnas verificadas y data cargada correctamente.");

        event.target.value = "";
    };

    lector.readAsArrayBuffer(archivo);
}

    function buscarValor(objeto, nombres) {
        const claves = Object.keys(objeto);

        for (let nombre of nombres) {
            const nombreNormal = normalizarTexto(nombre);

            const clave = claves.find(c => normalizarTexto(c).includes(nombreNormal));

            if (clave) {
                return objeto[clave];
            }
        }

        return "";
    }

function abrirGrafico() {
    calcularTodo();

    document.getElementById("modalGrafico").style.display = "flex";

    cargarFiltrosGrafico();
    aplicarFiltrosGrafico();
}

function cerrarGrafico() {
    document.getElementById("modalGrafico").style.display = "none";
}

    function cerrarGrafico() {
        document.getElementById("modalGrafico").style.display = "none";
    }

  function crearEstado(estado) {
    if (estado === "Dentro del rango") {
        return `<span class="tag tag-verde">Dentro del rango</span>`;
    }

    if (estado === "Sobre el rango") {
        return `<span class="tag tag-amarillo">Sobre el rango</span>`;
    }

    if (estado === "Debajo del rango") {
        return `<span class="tag tag-rojo">Debajo del rango</span>`;
    }

    if (estado === "Inactivo") {
        return `<span class="tag tag-gris">Inactivo</span>`;
    }

    return `<span class="tag tag-rojo">Sin rango</span>`;
}
    function crearComentario(comentario) {
    if (comentario === "Mantener") {
        return `<span class="tag tag-azul">Mantener</span>`;
    }

    return `<span class="tag tag-rojo">Borrar</span>`;
}

    function convertirNumero(valor) {
        if (valor === null || valor === undefined || valor === "") return 0;

        const limpio = String(valor)
            .replace("KM", "")
            .replace("km", "")
            .replace("Gal", "")
            .replace("gal", "")
            .replace(/[^0-9,.\-eE]/g, "")
            .replace(",", ".");

        const numero = parseFloat(limpio);

        return isNaN(numero) ? 0 : numero;
    }

    function formatoNumero(valor) {
        const numero = convertirNumero(valor);

        return numero.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    function formatoGalon(valor) {
        const numero = convertirNumero(valor);

        return numero.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " Gal";
    }

    function valorFecha(fecha) {
        if (!fecha) return 0;
        return new Date(fecha + "T00:00:00").getTime();
    }

    function convertirFechaExcel(valor) {
        if (!valor) return "";

        if (typeof valor === "number") {
            const fecha = XLSX.SSF.parse_date_code(valor);
            if (!fecha) return "";

            const mes = String(fecha.m).padStart(2, "0");
            const dia = String(fecha.d).padStart(2, "0");

            return `${fecha.y}-${mes}-${dia}`;
        }

        const texto = String(valor).trim();

        if (texto.includes("/")) {
            const partes = texto.split("/");

            if (partes.length === 3) {
                const dia = partes[0].padStart(2, "0");
                const mes = partes[1].padStart(2, "0");
                const anio = partes[2];

                return `${anio}-${mes}-${dia}`;
            }
        }

        return texto;
    }

    function normalizarTexto(texto) {
        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function escapar(valor) {
        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll('"', "&quot;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }

    function mostrarMensaje(texto) {
        document.getElementById("mensaje").textContent = texto;
    }
function abrirModalPlantilla() {
    document.getElementById("modalPlantilla").style.display = "flex";
}

function cerrarModalPlantilla() {
    document.getElementById("modalPlantilla").style.display = "none";
}

function descargarPlantillaSubida() {
    if (typeof XLSX === "undefined") {
        alert("Error: la librería XLSX no cargó. Revisa tu conexión a internet.");
        return;
    }

    const camposDisponibles = {
        fecha: "FECHA",
        hora: "HORA",
        codigoEmpleado: "NÚMERO REG.",
        kmActual: "CUENTAKILÓMETROS",
        unidad: "CONDUCTOR",
        combInicial: "CANTIDAD (Gal)",
        combPorFuera: "COMBUSTIBLE POR FUERA",
        combMismoDia: "COMBUSTIBLE MISMO DÍA",
        kmInicial: "KILÓMETRO INICIAL"
    };

    const ordenCorrecto = [
        "fecha",
        "hora",
        "codigoEmpleado",
        "kmActual",
        "unidad",
        "combInicial",
        "combPorFuera",
        "combMismoDia",
        "kmInicial"
    ];

    const seleccionados = Array.from(document.querySelectorAll(".campo-plantilla"))
        .filter(check => check.checked)
        .map(check => check.value);

    const camposFinales = ordenCorrecto.filter(campo => seleccionados.includes(campo));

    const encabezados = camposFinales.map(campo => camposDisponibles[campo]);

    const datosHoja = [
        encabezados,
        []
    ];

    const hoja = XLSX.utils.aoa_to_sheet(datosHoja);
    const libro = XLSX.utils.book_new();

    hoja["!cols"] = encabezados.map(() => ({ wch: 24 }));

    XLSX.utils.book_append_sheet(libro, hoja, "Plantilla");

    XLSX.writeFile(libro, "plantilla_subida_combustible.xlsx");

    cerrarModalPlantilla();
    mostrarMensaje("Plantilla descargada correctamente.");
}

function escanearPlantillaSubida(matriz) {
    const camposObligatorios = [
        {
            clave: "fecha",
            nombre: "FECHA",
            alias: ["fecha"]
        },
        {
            clave: "hora",
            nombre: "HORA",
            alias: ["hora"]
        },
        {
            clave: "codigoEmpleado",
            nombre: "NÚMERO REG.",
            alias: [
                "codigo empleado",
                "código empleado",
                "numero reg",
                "número reg",
                "numero reg.",
                "número reg.",
                "num reg",
                "codigo",
                "código"
            ]
        },
        {
            clave: "kmActual",
            nombre: "CUENTAKILÓMETROS",
            alias: [
                "cuentakilometros",
                "cuentakilómetros",
                "km actual",
                "kilometraje actual",
                "kilometraje"
            ]
        },
        {
            clave: "unidad",
            nombre: "CONDUCTOR / UNIDAD",
            alias: [
                "conductor",
                "unidad",
                "# unidad",
                "ficha"
            ]
        },
        {
            clave: "combInicial",
            nombre: "CANTIDAD (Gal)",
            alias: [
                "cantidad gal",
                "cantidad",
                "combustible inicial",
                "combustible iniciar"
            ]
        }
    ];

    const camposOpcionales = [
        {
            clave: "combPorFuera",
            alias: [
                "combustible por fuera",
                "por fuera"
            ]
        },
        {
            clave: "combMismoDia",
            alias: [
                "combustible mismo dia",
                "combustible mismo día",
                "combustible el mismo dia",
                "combustible el mismo día",
                "mismo dia",
                "mismo día"
            ]
        },
        {
            clave: "kmInicial",
            alias: [
                "kilometro inicial",
                "kilómetro inicial",
                "km inicial"
            ]
        }
    ];

    let filaEncabezado = -1;
    let indices = {};

    for (let i = 0; i < matriz.length; i++) {
        const fila = matriz[i];

        if (!fila || fila.length === 0) {
            continue;
        }

        let encontrados = 0;
        let indicesTemporales = {};

        camposObligatorios.forEach(campo => {
            const indice = buscarIndiceEncabezado(fila, campo.alias);

            if (indice !== -1) {
                encontrados++;
                indicesTemporales[campo.clave] = indice;
            }
        });

        if (encontrados >= 4) {
            filaEncabezado = i;
            indices = indicesTemporales;
            break;
        }
    }

    if (filaEncabezado === -1) {
        return {
            correcto: false,
            mensaje: "No se encontró la fila de encabezados. Debe tener columnas como FECHA, HORA, NÚMERO REG., CUENTAKILÓMETROS, CONDUCTOR y CANTIDAD (Gal)."
        };
    }

    const filaHeader = matriz[filaEncabezado];
    const faltantes = [];

    camposObligatorios.forEach(campo => {
        const indice = buscarIndiceEncabezado(filaHeader, campo.alias);

        if (indice === -1) {
            faltantes.push(campo.nombre);
        } else {
            indices[campo.clave] = indice;
        }
    });

    if (faltantes.length > 0) {
        return {
            correcto: false,
            mensaje: "Faltan estas columnas obligatorias: " + faltantes.join(", ")
        };
    }

    camposOpcionales.forEach(campo => {
        indices[campo.clave] = buscarIndiceEncabezado(filaHeader, campo.alias);
    });

    const ordenCorrecto = [
        "fecha",
        "hora",
        "codigoEmpleado",
        "kmActual",
        "unidad",
        "combInicial"
    ];

    const posiciones = ordenCorrecto.map(campo => indices[campo]);

    for (let i = 1; i < posiciones.length; i++) {
        if (posiciones[i] < posiciones[i - 1]) {
            return {
                correcto: false,
                mensaje: "Las columnas no están en el orden correcto. Deben estar así: FECHA → HORA → NÚMERO REG. → CUENTAKILÓMETROS → CONDUCTOR → CANTIDAD (Gal)."
            };
        }
    }

    return {
        correcto: true,
        filaEncabezado: filaEncabezado,
        indices: indices,
        mensaje: "Plantilla correcta."
    };
}

function buscarIndiceEncabezado(fila, alias) {
    for (let i = 0; i < fila.length; i++) {
        const textoCelda = normalizarTextoAvanzado(fila[i]);

        for (let j = 0; j < alias.length; j++) {
            const textoAlias = normalizarTextoAvanzado(alias[j]);

            if (textoCelda === textoAlias || textoCelda.includes(textoAlias)) {
                return i;
            }
        }
    }

    return -1;
}

function buscarCeldaPorIndice(fila, indice) {
    if (indice === undefined || indice === null || indice === -1) {
        return "";
    }

    return fila[indice] ?? "";
}

function normalizarTextoAvanzado(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[().:#]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function convertirHoraExcel(valor) {
    if (!valor) return "";

    if (typeof valor === "number") {
        const totalMinutos = Math.round(valor * 24 * 60);
        const horas = Math.floor(totalMinutos / 60) % 24;
        const minutos = totalMinutos % 60;

        return String(horas).padStart(2, "0") + ":" + String(minutos).padStart(2, "0");
    }


    const texto = String(valor).trim();

   if (texto.toUpperCase().includes("AM") || texto.toUpperCase().includes("PM")) {
        const fechaTemporal = new Date("2000-01-01 " + texto);

        if (!isNaN(fechaTemporal.getTime())) {
            const h = String(fechaTemporal.getHours()).padStart(2, "0");
            const m = String(fechaTemporal.getMinutes()).padStart(2, "0");

            return h + ":" + m;
        }
    }

    return texto;

    



}

document.addEventListener("DOMContentLoaded", function () {
    iniciarColumnasRedimensionables();
    conectarScrollHorizontal();
    setTimeout(actualizarScrollHorizontalVisible, 100);
});



function iniciarColumnasRedimensionables() {
    const tabla = document.querySelector(".table-wrapper table");

    if (!tabla) return;

    const ths = tabla.querySelectorAll("thead th");

    let colgroup = tabla.querySelector("colgroup");

    if (!colgroup) {
        colgroup = document.createElement("colgroup");
        tabla.insertBefore(colgroup, tabla.firstChild);
    }

    colgroup.innerHTML = "";

    ths.forEach((th, index) => {
        const col = document.createElement("col");

        const anchoGuardado = localStorage.getItem("comb_col_" + index);
        const anchoInicial = anchoGuardado || obtenerAnchoInicialColumna(index);

        col.style.width = anchoInicial;
        colgroup.appendChild(col);

        th.classList.add("th-resizable");

        let handle = th.querySelector(".resize-handle");

        if (!handle) {
            handle = document.createElement("span");
            handle.className = "resize-handle";
            th.appendChild(handle);
        }

        handle.onmousedown = function (e) {
            e.preventDefault();
            e.stopPropagation();

            const inicioX = e.pageX;
            const anchoInicio = parseInt(col.style.width, 10) || th.offsetWidth;

            document.body.classList.add("resizing-column");

            function moverColumna(evento) {
                const nuevoAncho = Math.max(80, anchoInicio + (evento.pageX - inicioX));

                col.style.width = nuevoAncho + "px";
                localStorage.setItem("comb_col_" + index, nuevoAncho + "px");
            }

            function soltarColumna() {
                document.body.classList.remove("resizing-column");

                document.removeEventListener("mousemove", moverColumna);
                document.removeEventListener("mouseup", soltarColumna);
            }

            document.addEventListener("mousemove", moverColumna);
            document.addEventListener("mouseup", soltarColumna);
        };
    });
}

function obtenerAnchoInicialColumna(index) {
    const anchos = [
        "120px", // Fecha
        "95px",  // Hora
        "110px", // Unidad
        "140px", // Marca
        "145px", // Código empleado
        "150px", // Conductor
        "150px", // Km actual
        "150px", // Último km
        "170px", // Combustible por fuera
        "185px", // Combustible mismo día
        "150px", // Combustible inicial
        "150px", // Combustible total
        "170px", // Km recorrido
        "155px", // Rendimiento
        "165px", // Estado
        "135px", // Comentario
        "150px"  // Acciones
    ];

    return anchos[index] || "140px";
}

function cargarFiltrosGrafico() {
    const categorias = obtenerCategoriasUnicas();
    const unidades = obtenerUnidadesUnicas();

    llenarSelect("graficoCategoria", categorias, "Todas las categorías");
    llenarSelect("graficoUnidad", unidades, "Todas las unidades");
    llenarSelect("pdfCategoria", categorias, "Selecciona una categoría");
}

function llenarSelect(id, datos, textoInicial) {
    const select = document.getElementById(id);

    if (!select) return;

    const valorAnterior = select.value;

    select.innerHTML = "";

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = textoInicial;
    select.appendChild(opcionInicial);

    datos.forEach(valor => {
        const option = document.createElement("option");
        option.value = valor;
        option.textContent = valor;
        select.appendChild(option);
    });

    if (valorAnterior) {
        select.value = valorAnterior;
    }
}

function obtenerCategoriasUnicas() {
    calcularTodo();

    const categorias = registros
        .map(fila => fila.marca)
        .filter(valor => valor && valor !== "#N/D");

    return [...new Set(categorias)].sort();
}

function obtenerUnidadesUnicas() {
    calcularTodo();

    const unidades = registros
        .map(fila => fila.unidad)
        .filter(valor => valor);

    return [...new Set(unidades)].sort();
}

function aplicarFiltrosGrafico() {
    const datos = obtenerDatosFiltradosGrafico();

    actualizarCardsGrafico(datos);
    crearGraficoBarras(datos);
    crearGraficoLinea(datos);
    crearTablaResumenCategoria(datos);
}

function obtenerDatosFiltradosGrafico() {
    calcularTodo();

    const fechaDesde = document.getElementById("graficoFechaDesde")?.value || "";
    const fechaHasta = document.getElementById("graficoFechaHasta")?.value || "";
    const categoria = document.getElementById("graficoCategoria")?.value || "";
    const unidad = document.getElementById("graficoUnidad")?.value || "";
    const comentario = document.getElementById("graficoComentario")?.value || "Mantener";

    return registros.filter(fila => {
        if (!fila.unidad) return false;

        if (fechaDesde && valorFecha(fila.fecha) < valorFecha(fechaDesde)) {
            return false;
        }

        if (fechaHasta && valorFecha(fila.fecha) > valorFecha(fechaHasta)) {
            return false;
        }

        if (categoria && fila.marca !== categoria) {
            return false;
        }

        if (unidad && fila.unidad !== unidad) {
            return false;
        }

        if (comentario !== "Todos" && fila.comentario !== comentario) {
            return false;
        }

        return true;
    });
}

function actualizarCardsGrafico(datos) {
    let dentro = 0;
    let sobre = 0;
    let debajo = 0;
    let inactivo = 0;
    let sumaRendimiento = 0;
    let cantidadRendimiento = 0;

    datos.forEach(fila => {
        if (fila.comentario === "Borrar" || fila.estadoRango === "Inactivo") {
            inactivo++;
            return;
        }

        if (fila.estadoRango === "Dentro del rango") dentro++;
        if (fila.estadoRango === "Sobre el rango") sobre++;
        if (fila.estadoRango === "Debajo del rango") debajo++;

        if (convertirNumero(fila.rendimiento) > 0) {
            sumaRendimiento += convertirNumero(fila.rendimiento);
            cantidadRendimiento++;
        }
    });

    const promedio = cantidadRendimiento > 0 ? sumaRendimiento / cantidadRendimiento : 0;

    document.getElementById("graficoPromedio").textContent = formatoNumero(promedio) + " km/gal";
    document.getElementById("graficoDentro").textContent = dentro;
    document.getElementById("graficoSobre").textContent = sobre;
    document.getElementById("graficoDebajo").textContent = debajo;
    document.getElementById("graficoInactivos").textContent = inactivo;
}

function crearGraficoBarras(datos) {
    const ctx = document.getElementById("chartRendimientoUnidad");

    if (!ctx) return;

    const resumen = {};

    datos.forEach(fila => {
        if (fila.comentario === "Borrar") return;

        const unidad = fila.unidad || "Sin unidad";
        const rendimiento = convertirNumero(fila.rendimiento);

        if (!resumen[unidad]) {
            resumen[unidad] = {
                suma: 0,
                cantidad: 0
            };
        }

        if (rendimiento > 0) {
            resumen[unidad].suma += rendimiento;
            resumen[unidad].cantidad++;
        }
    });

    const etiquetas = Object.keys(resumen).sort();

    const valores = etiquetas.map(unidad => {
        const item = resumen[unidad];

        if (item.cantidad === 0) return 0;

        return Number((item.suma / item.cantidad).toFixed(2));
    });

    if (chartRendimientoUnidad) {
        chartRendimientoUnidad.destroy();
    }

    chartRendimientoUnidad = new Chart(ctx, {
        type: "bar",
        data: {
            labels: etiquetas,
            datasets: [{
                label: "Promedio km/gal",
                data: valores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + " km/gal";
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "km/gal"
                    }
                }
            }
        }
    });
}

function crearGraficoLinea(datos) {
    const ctx = document.getElementById("chartEvolucion");

    if (!ctx) return;

    const unidades = [...new Set(
        datos
            .filter(fila => fila.comentario !== "Borrar")
            .map(fila => fila.unidad)
    )].slice(0, 3);

    const fechas = [...new Set(
        datos
            .filter(fila => fila.comentario !== "Borrar")
            .map(fila => fila.fecha)
            .filter(Boolean)
    )].sort();

    const datasets = unidades.map(unidad => {
        const valores = fechas.map(fecha => {
            const filas = datos.filter(fila =>
                fila.unidad === unidad &&
                fila.fecha === fecha &&
                fila.comentario !== "Borrar"
            );

            if (filas.length === 0) return null;

            const suma = filas.reduce((acc, fila) => acc + convertirNumero(fila.rendimiento), 0);

            return Number((suma / filas.length).toFixed(2));
        });

        return {
            label: unidad,
            data: valores,
            borderWidth: 2,
            tension: 0.35,
            spanGaps: true
        };
    });

    if (chartEvolucion) {
        chartEvolucion.destroy();
    }

    chartEvolucion = new Chart(ctx, {
        type: "line",
        data: {
            labels: fechas,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "km/gal"
                    }
                }
            }
        }
    });
}

function crearTablaResumenCategoria(datos) {
    const tbody = document.getElementById("tablaResumenCategoria");

    if (!tbody) return;

    tbody.innerHTML = "";

    const resumen = {};

    datos.forEach(fila => {
        if (fila.comentario === "Borrar") return;

        const categoria = fila.marca || "Sin categoría";
        const rendimiento = convertirNumero(fila.rendimiento);

        if (!resumen[categoria]) {
            resumen[categoria] = {
                unidades: new Set(),
                rendimientos: []
            };
        }

        resumen[categoria].unidades.add(fila.unidad);

        if (rendimiento > 0) {
            resumen[categoria].rendimientos.push(rendimiento);
        }
    });

    Object.keys(resumen).sort().forEach(categoria => {
        const item = resumen[categoria];
        const lista = item.rendimientos;

        const promedio = lista.length > 0
            ? lista.reduce((a, b) => a + b, 0) / lista.length
            : 0;

        const minimo = lista.length > 0 ? Math.min(...lista) : 0;
        const maximo = lista.length > 0 ? Math.max(...lista) : 0;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapar(categoria)}</td>
            <td>${item.unidades.size}</td>
            <td>${formatoNumero(promedio)}</td>
            <td>${formatoNumero(minimo)}</td>
            <td>${formatoNumero(maximo)}</td>
        `;

        tbody.appendChild(tr);
    });
}



function exportarDatosGrafico() {
    const datos = obtenerDatosFiltradosGrafico();

    const salida = datos.map(fila => ({
        "Fecha": fila.fecha,
        "Unidad": fila.unidad,
        "Categoría": fila.marca,
        "Rendimiento": fila.rendimiento,
        "Estado": fila.estadoRango,
        "Comentario": fila.comentario
    }));

    const hoja = XLSX.utils.json_to_sheet(salida);
    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, "Reporte");
    XLSX.writeFile(libro, "reporte_grafico_combustible.xlsx");
}

function cargarFiltrosGrafico() {
    calcularTodo();

    const categorias = obtenerCategoriasUnicas();
    llenarSelectGrafico("graficoCategoria", categorias, "Todas las categorías");

    if (!document.getElementById("graficoFechaDesde").value) {
        const fechas = registros
            .map(fila => fila.fecha)
            .filter(Boolean)
            .sort();

        if (fechas.length > 0) {
            document.getElementById("graficoFechaDesde").value = fechas[0];
            document.getElementById("graficoFechaHasta").value = fechas[fechas.length - 1];
        }
    }
}

function llenarSelectGrafico(id, datos, textoInicial) {
    const select = document.getElementById(id);

    if (!select) return;

    const valorAnterior = select.value;

    select.innerHTML = "";

    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = textoInicial;
    select.appendChild(optionDefault);

    datos.forEach(valor => {
        const option = document.createElement("option");
        option.value = valor;
        option.textContent = valor;
        select.appendChild(option);
    });

    if (valorAnterior) {
        select.value = valorAnterior;
    }
}

function obtenerCategoriasUnicas() {
    const categorias = registros
        .map(fila => fila.marca)
        .filter(valor => valor && valor !== "#N/D");

    return [...new Set(categorias)].sort();
}

function aplicarFiltrosGrafico() {
    calcularTodo();

    const datosCategoria = obtenerDatosCategoriaGrafico();

    datosGraficoActual = datosCategoria;

    actualizarCardsGrafico(datosCategoria);
    cargarUnidadesDetalle(datosCategoria);
    crearGraficoBarrasCategoria(datosCategoria);
    crearTablaResumenCategoria(datosCategoria);
    aplicarFiltroUnidadDetalle();
}

function obtenerDatosCategoriaGrafico() {
    const fechaDesde = document.getElementById("graficoFechaDesde").value;
    const fechaHasta = document.getElementById("graficoFechaHasta").value;
    const categoria = document.getElementById("graficoCategoria").value;
    const comentario = document.getElementById("graficoComentario").value;

    return registros.filter(fila => {
        if (!fila.unidad) return false;

        if (fechaDesde && valorFecha(fila.fecha) < valorFecha(fechaDesde)) {
            return false;
        }

        if (fechaHasta && valorFecha(fila.fecha) > valorFecha(fechaHasta)) {
            return false;
        }

        if (categoria && fila.marca !== categoria) {
            return false;
        }

        if (comentario !== "Todos" && fila.comentario !== comentario) {
            return false;
        }

        return true;
    });
}

function cargarUnidadesDetalle(datos) {
    const unidades = [...new Set(
        datos
            .filter(fila => fila.comentario !== "Borrar")
            .map(fila => fila.unidad)
            .filter(Boolean)
    )].sort();

    const select = document.getElementById("graficoUnidadDetalle");

    if (!select) return;

    const valorAnterior = select.value;

    select.innerHTML = "";

    unidades.forEach(unidad => {
        const option = document.createElement("option");
        option.value = unidad;
        option.textContent = unidad;
        select.appendChild(option);
    });

    if (valorAnterior && unidades.includes(valorAnterior)) {
        select.value = valorAnterior;
    } else if (unidades.length > 0) {
        select.value = unidades[0];
    }
}

function actualizarCardsGrafico(datos) {
    let dentro = 0;
    let sobre = 0;
    let debajo = 0;
    let inactivos = 0;
    let suma = 0;
    let cantidad = 0;

    datos.forEach(fila => {
        if (fila.comentario === "Borrar" || fila.estadoRango === "Inactivo") {
            inactivos++;
            return;
        }

        if (fila.estadoRango === "Dentro del rango") dentro++;
        if (fila.estadoRango === "Sobre el rango") sobre++;
        if (fila.estadoRango === "Debajo del rango") debajo++;

        const rendimiento = convertirNumero(fila.rendimiento);

        if (rendimiento > 0) {
            suma += rendimiento;
            cantidad++;
        }
    });

    const promedio = cantidad > 0 ? suma / cantidad : 0;

    document.getElementById("graficoPromedio").textContent = formatoNumero(promedio) + " km/gal";
    document.getElementById("graficoDentro").textContent = dentro;
    document.getElementById("graficoSobre").textContent = sobre;
    document.getElementById("graficoDebajo").textContent = debajo;
    document.getElementById("graficoInactivos").textContent = inactivos;
}

function crearGraficoBarrasCategoria(datos) {
    const canvas = document.getElementById("chartRendimientoUnidad");

    if (!canvas) return;

    const resumen = {};

    datos.forEach(fila => {
        if (fila.comentario === "Borrar") return;

        const unidad = fila.unidad;
        const rendimiento = convertirNumero(fila.rendimiento);

        if (!resumen[unidad]) {
            resumen[unidad] = {
                suma: 0,
                cantidad: 0
            };
        }

        if (rendimiento > 0) {
            resumen[unidad].suma += rendimiento;
            resumen[unidad].cantidad++;
        }
    });

    const etiquetas = Object.keys(resumen).sort();

    const valores = etiquetas.map(unidad => {
        const item = resumen[unidad];

        if (item.cantidad === 0) return 0;

        return Number((item.suma / item.cantidad).toFixed(2));
    });

    if (chartRendimientoUnidad) {
        chartRendimientoUnidad.destroy();
    }

    chartRendimientoUnidad = new Chart(canvas, {
        type: "bar",
        data: {
            labels: etiquetas,
            datasets: [{
                label: "Promedio km/gal",
                data: valores,
                borderWidth: 1,
                backgroundColor: "rgba(59, 130, 246, 0.65)",
                borderColor: "rgba(37, 99, 235, 1)"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: {
                padding: {
                    top: 30
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                datalabels: {
                    display: true,
                    anchor: "end",
                    align: "top",
                    offset: 4,
                    color: "#0f172a",
                    font: {
                        weight: "bold",
                        size: 12
                    },
                    formatter: function(value) {
                        return value > 0 ? value : "";
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + " km/gal";
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(...valores, 10) + 8,
                    title: {
                        display: true,
                        text: "km/gal"
                    }
                }
            }
        }
    });
}

function aplicarFiltroUnidadDetalle() {
    const unidad = document.getElementById("graficoUnidadDetalle").value;
    const tipoVista = document.getElementById("tipoVistaDetalle").value;

    const datosUnidad = datosGraficoActual.filter(fila => {
        return fila.unidad === unidad && fila.comentario !== "Borrar";
    });

    crearGraficoDetalleUnidad(datosUnidad, tipoVista);
}

function crearGraficoDetalleUnidad(datosUnidad, tipoVista) {
    const canvas = document.getElementById("chartEvolucion");

    if (!canvas) return;

    const datosOrdenados = [...datosUnidad].sort((a, b) => {
        return obtenerFechaHoraValor(a.fecha, a.hora) - obtenerFechaHoraValor(b.fecha, b.hora);
    });

    const etiquetas = datosOrdenados.map(fila => {
        return fila.fecha + " " + (fila.hora || "");
    });

    const valores = datosOrdenados.map(fila => {
        return Number(convertirNumero(fila.rendimiento).toFixed(2));
    });

    if (chartEvolucion) {
        chartEvolucion.destroy();
    }

    chartEvolucion = new Chart(canvas, {
        type: tipoVista === "barra" ? "bar" : "line",
        data: {
            labels: etiquetas,
            datasets: [{
                label: datosOrdenados.length > 0 ? datosOrdenados[0].unidad : "Unidad",
                data: valores,
                borderWidth: 2,
                tension: 0.35,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                backgroundColor: "rgba(59, 130, 246, 0.65)",
                borderColor: "rgba(37, 99, 235, 1)"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: {
                padding: {
                    top: 35
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                datalabels: {
                    display: true,
                    anchor: "end",
                    align: "top",
                    offset: 6,
                    color: "#0f172a",
                    font: {
                        weight: "bold",
                        size: 12
                    },
                    formatter: function(value) {
                        return value > 0 ? value : "";
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + " km/gal";
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(...valores, 10) + 8,
                    title: {
                        display: true,
                        text: "km/gal"
                    }
                }
            }
        }
    });
}

function crearTablaResumenCategoria(datos) {
    const tbody = document.getElementById("tablaResumenCategoria");

    if (!tbody) return;

    tbody.innerHTML = "";

    const resumen = {};

    datos.forEach(fila => {
        if (fila.comentario === "Borrar") return;

        const categoria = fila.marca || "Sin categoría";
        const rendimiento = convertirNumero(fila.rendimiento);

        if (!resumen[categoria]) {
            resumen[categoria] = {
                unidades: new Set(),
                valores: []
            };
        }

        resumen[categoria].unidades.add(fila.unidad);

        if (rendimiento > 0) {
            resumen[categoria].valores.push(rendimiento);
        }
    });

    Object.keys(resumen).sort().forEach(categoria => {
        const item = resumen[categoria];
        const valores = item.valores;

        const promedio = valores.length > 0
            ? valores.reduce((a, b) => a + b, 0) / valores.length
            : 0;

        const minimo = valores.length > 0 ? Math.min(...valores) : 0;
        const maximo = valores.length > 0 ? Math.max(...valores) : 0;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapar(categoria)}</td>
            <td>${item.unidades.size}</td>
            <td>${formatoNumero(promedio)}</td>
            <td>${formatoNumero(minimo)}</td>
            <td>${formatoNumero(maximo)}</td>
        `;

        tbody.appendChild(tr);
    });
}

function generarPDFGrafico() {
    const elemento = document.getElementById("reporteGraficoPDF");

    if (!elemento) {
        alert("No se encontró el contenido del reporte.");
        return;
    }

    if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
        alert("Faltan las librerías para generar PDF. Revisa html2canvas y jsPDF en el HTML.");
        return;
    }

    const categoria = document.getElementById("graficoCategoria").value || "Todas_las_categorias";
    const unidad = document.getElementById("graficoUnidadDetalle").value || "Todas_las_unidades";

    elemento.classList.add("modo-pdf");

    const scrollAnterior = document.querySelector(".modal-grafico-contenido").scrollTop;
    document.querySelector(".modal-grafico-contenido").scrollTop = 0;

    setTimeout(() => {
        html2canvas(elemento, {
            scale: 4,
            backgroundColor: "#ffffff",
            useCORS: true,
            logging: false,
            windowWidth: elemento.scrollWidth,
            windowHeight: elemento.scrollHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL("image/png", 1.0);

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("l", "mm", "a4", true);

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 6;
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = margin;

            pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight, undefined, "FAST");

            heightLeft -= pageHeight - margin * 2;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + margin;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight, undefined, "FAST");
                heightLeft -= pageHeight - margin * 2;
            }

            const nombre = "Reporte_Combustible_" +
                categoria.replaceAll("/", "_").replaceAll(" ", "_") +
                "_" +
                unidad.replaceAll("/", "_").replaceAll(" ", "_") +
                ".pdf";

            pdf.save(nombre);

            elemento.classList.remove("modo-pdf");
            document.querySelector(".modal-grafico-contenido").scrollTop = scrollAnterior;

        }).catch(error => {
            elemento.classList.remove("modo-pdf");
            document.querySelector(".modal-grafico-contenido").scrollTop = scrollAnterior;

            console.error(error);
            alert("Ocurrió un error generando el PDF.");
        });
    }, 700);
}

function exportarDatosGrafico() {
    const datos = datosGraficoActual.length > 0 ? datosGraficoActual : obtenerDatosCategoriaGrafico();

    const salida = datos.map(fila => ({
        "Fecha": fila.fecha,
        "Hora": fila.hora,
        "Unidad": fila.unidad,
        "Categoría": fila.marca,
        "Rendimiento": fila.rendimiento,
        "Estado": fila.estadoRango,
        "Comentario": fila.comentario
    }));

    const hoja = XLSX.utils.json_to_sheet(salida);
    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, "Reporte");
    XLSX.writeFile(libro, "reporte_grafico_combustible.xlsx");
}

function conectarScrollHorizontal() {
    const tableWrapper = document.getElementById("tableWrapper");
    const scrollHorizontal = document.getElementById("scrollHorizontal");
    const scrollContent = document.getElementById("scrollHorizontalContent");
    const tabla = document.getElementById("tablaCombustible");

    if (!tableWrapper || !scrollHorizontal || !scrollContent || !tabla) {
        return;
    }

    function actualizarAnchoScroll() {
        scrollContent.style.width = tabla.scrollWidth + "px";
        scrollHorizontal.scrollLeft = tableWrapper.scrollLeft;
    }

    let sincronizando = false;

    tableWrapper.addEventListener("scroll", function () {
        if (sincronizando) return;

        sincronizando = true;
        scrollHorizontal.scrollLeft = tableWrapper.scrollLeft;
        sincronizando = false;
    });

    scrollHorizontal.addEventListener("scroll", function () {
        if (sincronizando) return;

        sincronizando = true;
        tableWrapper.scrollLeft = scrollHorizontal.scrollLeft;
        sincronizando = false;
    });

    window.addEventListener("resize", actualizarAnchoScroll);

    setTimeout(actualizarAnchoScroll, 100);
}

function actualizarScrollHorizontalVisible() {
    const tableWrapper = document.getElementById("tableWrapper");
    const scrollHorizontal = document.getElementById("scrollHorizontal");
    const scrollContent = document.getElementById("scrollHorizontalContent");
    const tabla = document.getElementById("tablaCombustible");

    if (!tableWrapper || !scrollHorizontal || !scrollContent || !tabla) {
        return;
    }

    scrollContent.style.width = tabla.scrollWidth + "px";
    scrollHorizontal.scrollLeft = tableWrapper.scrollLeft;
}

function abrirEntradaCombustible() {
    window.location.href = "entrada-combustible.html";
}

function abrirReporteCombustible() {
    window.location.href = "reporte-combustible.html";
}