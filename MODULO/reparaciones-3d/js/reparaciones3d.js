import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ============================
   DATOS DE PRUEBA
============================ */

const unidadDemo = {
    ficha: "T01",
    tipo: "Mitsubishi Rosa",
    marca: "Mitsubishi",
    kilometrajeActual: 245000,
    estado: "Activa"
};

const piezasUnidad = {
    gomaDelanteraIzquierda: {
        nombre: "Goma delantera izquierda",
        subdivision: "Gomas",
        marca: "Bridgestone",
        modelo: "R268",
        posicion: "Delantera izquierda",
        kmInstalacion: 210000,
        kmActual: 245000,
        vidaUtilKm: 60000,
        estado: "En uso",
        observacion: "Goma en buen estado. Mantener revisión de presión y desgaste."
    },
    gomaDelanteraDerecha: {
        nombre: "Goma delantera derecha",
        subdivision: "Gomas",
        marca: "Michelin",
        modelo: "X Multi",
        posicion: "Delantera derecha",
        kmInstalacion: 215000,
        kmActual: 245000,
        vidaUtilKm: 60000,
        estado: "En uso",
        observacion: "Desgaste normal. No presenta alerta crítica."
    },
    gomaTraseraIzquierda: {
        nombre: "Goma trasera izquierda",
        subdivision: "Gomas",
        marca: "Goodyear",
        modelo: "Regional RHS",
        posicion: "Trasera izquierda",
        kmInstalacion: 200000,
        kmActual: 245000,
        vidaUtilKm: 60000,
        estado: "Pendiente de revisión",
        observacion: "Tiene alto kilometraje recorrido. Revisar desgaste lateral."
    },
    gomaTraseraDerecha: {
        nombre: "Goma trasera derecha",
        subdivision: "Gomas",
        marca: "Bridgestone",
        modelo: "R268",
        posicion: "Trasera derecha",
        kmInstalacion: 205000,
        kmActual: 245000,
        vidaUtilKm: 60000,
        estado: "En observación",
        observacion: "Revisar en el próximo mantenimiento preventivo."
    },
    alternador: {
        nombre: "Alternador principal",
        subdivision: "Alternador",
        marca: "Denso",
        modelo: "24V Heavy Duty",
        posicion: "Área del motor",
        kmInstalacion: 180000,
        kmActual: 245000,
        vidaUtilKm: 120000,
        estado: "En uso",
        observacion: "Carga estable. No presenta alerta por el momento."
    },
    amortiguacion: {
        nombre: "Amortiguación delantera",
        subdivision: "Amortiguación",
        marca: "KYB",
        modelo: "Bus Series",
        posicion: "Eje delantero",
        kmInstalacion: 190000,
        kmActual: 245000,
        vidaUtilKm: 80000,
        estado: "Pendiente de revisión",
        observacion: "Revisar por vibración o pérdida de estabilidad."
    },
    frenos: {
        nombre: "Sistema de freno delantero",
        subdivision: "Frenos",
        marca: "Bosch",
        modelo: "HD Brake Kit",
        posicion: "Eje delantero",
        kmInstalacion: 220000,
        kmActual: 245000,
        vidaUtilKm: 50000,
        estado: "En uso",
        observacion: "Pastillas dentro del rango normal."
    },
    bateria: {
        nombre: "Batería principal",
        subdivision: "Electricidad",
        marca: "ACDelco",
        modelo: "Heavy Duty 24V",
        posicion: "Compartimiento lateral",
        kmInstalacion: 225000,
        kmActual: 245000,
        vidaUtilKm: 70000,
        estado: "En uso",
        observacion: "Voltaje normal. Mantener bornes limpios."
    }
};

/* ============================
   VARIABLES THREE
============================ */

let scene;
let camera;
let renderer;
let controls;
let raycaster;
let pointer;

let objetosClickeables = [];
let objetoSeleccionado = null;
let puntosVisibles = true;

const visor = document.getElementById("visor3D");

/* ============================
   INICIAR
============================ */

iniciarModulo();

function iniciarModulo() {
    cargarDatosUnidad();
    crearEscena();
    crearLuces();
    crearPiso();
    crearGuaguaDemo();
    crearPuntosClickeables();
    crearEventos();
    animar();

    document.getElementById("lblMensaje3D").textContent =
        "Guagua 3D de prueba cargada. Toque una pieza marcada.";
}

/* ============================
   ESCENA
============================ */

function crearEscena() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f6f8);

    const ancho = visor.clientWidth;
    const alto = visor.clientHeight;

    camera = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 1000);
    camera.position.set(0, 4.5, 9);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setSize(ancho, alto);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    visor.innerHTML = "";
    visor.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1.1, 0);
    controls.minDistance = 4;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2.05;

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
}

function crearLuces() {
    const ambiente = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambiente);

    const principal = new THREE.DirectionalLight(0xffffff, 2.3);
    principal.position.set(5, 8, 6);
    principal.castShadow = true;
    scene.add(principal);

    const relleno = new THREE.DirectionalLight(0xffffff, 0.8);
    relleno.position.set(-5, 4, -5);
    scene.add(relleno);
}

function crearPiso() {
    const geometria = new THREE.CircleGeometry(8, 80);
    const material = new THREE.MeshStandardMaterial({
        color: 0xe3e8ec,
        roughness: 0.9
    });

    const piso = new THREE.Mesh(geometria, material);
    piso.rotation.x = -Math.PI / 2;
    piso.position.y = -0.04;
    piso.receiveShadow = true;

    scene.add(piso);
}

/* ============================
   GUAGUA DE PRUEBA
============================ */

function crearGuaguaDemo() {
    const grupo = new THREE.Group();

    const materialBlanco = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.55
    });

    const materialAzul = new THREE.MeshStandardMaterial({
        color: 0x011254,
        roughness: 0.45
    });

    const materialNegro = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.8
    });

    const materialCristal = new THREE.MeshStandardMaterial({
        color: 0x90a4ae,
        roughness: 0.25,
        metalness: 0.2
    });

    const cuerpo = new THREE.Mesh(
        new THREE.BoxGeometry(2.7, 1.45, 5.8),
        materialBlanco
    );
    cuerpo.position.y = 1.05;
    cuerpo.castShadow = true;
    grupo.add(cuerpo);

    const frente = new THREE.Mesh(
        new THREE.BoxGeometry(2.72, 1.25, 0.25),
        materialAzul
    );
    frente.position.set(0, 1.03, -2.98);
    frente.castShadow = true;
    grupo.add(frente);

    const techo = new THREE.Mesh(
        new THREE.BoxGeometry(2.45, 0.25, 5.4),
        materialAzul
    );
    techo.position.y = 1.92;
    techo.castShadow = true;
    grupo.add(techo);

    const parabrisas = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.6, 0.08),
        materialCristal
    );
    parabrisas.position.set(0, 1.35, -3.12);
    grupo.add(parabrisas);

    for (let i = 0; i < 5; i++) {
        const ventanaIzquierda = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.55, 0.55),
            materialCristal
        );
        ventanaIzquierda.position.set(-1.4, 1.35, -1.6 + i * 0.8);
        grupo.add(ventanaIzquierda);

        const ventanaDerecha = ventanaIzquierda.clone();
        ventanaDerecha.position.x = 1.4;
        grupo.add(ventanaDerecha);
    }

    crearGoma(grupo, -1.45, 0.42, -1.95, materialNegro);
    crearGoma(grupo, 1.45, 0.42, -1.95, materialNegro);
    crearGoma(grupo, -1.45, 0.42, 1.95, materialNegro);
    crearGoma(grupo, 1.45, 0.42, 1.95, materialNegro);

    const bumperFrontal = new THREE.Mesh(
        new THREE.BoxGeometry(2.75, 0.25, 0.22),
        materialNegro
    );
    bumperFrontal.position.set(0, 0.45, -3.15);
    grupo.add(bumperFrontal);

    const bumperTrasero = new THREE.Mesh(
        new THREE.BoxGeometry(2.75, 0.25, 0.22),
        materialNegro
    );
    bumperTrasero.position.set(0, 0.45, 3.05);
    grupo.add(bumperTrasero);

    scene.add(grupo);
}

function crearGoma(grupo, x, y, z, material) {
    const goma = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.34, 48),
        material
    );

    goma.rotation.z = Math.PI / 2;
    goma.position.set(x, y, z);
    goma.castShadow = true;

    grupo.add(goma);
}

/* ============================
   PUNTOS CLICKEABLES
============================ */

function crearPuntosClickeables() {
    crearPunto("gomaDelanteraIzquierda", "Goma DI", -1.8, 0.9, -2.0, 0x2e7d32);
    crearPunto("gomaDelanteraDerecha", "Goma DD", 1.8, 0.9, -2.0, 0x2e7d32);
    crearPunto("gomaTraseraIzquierda", "Goma TI", -1.8, 0.9, 2.0, 0xf9a825);
    crearPunto("gomaTraseraDerecha", "Goma TD", 1.8, 0.9, 2.0, 0xf9a825);
    crearPunto("alternador", "Alternador", 0, 1.45, -2.75, 0x1565c0);
    crearPunto("amortiguacion", "Amortiguación", 0, 0.9, -1.25, 0xb00020);
    crearPunto("frenos", "Frenos", 0, 0.75, -2.2, 0x6a1b9a);
    crearPunto("bateria", "Batería", -1.55, 1.3, 0.5, 0x00838f);
}

function crearPunto(id, texto, x, y, z, color) {
    const grupo = new THREE.Group();

    const esfera = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 32, 32),
        new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.2
        })
    );

    esfera.userData.idPieza = id;
    esfera.castShadow = true;

    const aro = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.018, 16, 64),
        new THREE.MeshBasicMaterial({
            color: color
        })
    );

    aro.rotation.x = Math.PI / 2;

    const etiqueta = crearEtiqueta(texto);
    etiqueta.position.set(0, 0.42, 0);

    grupo.add(esfera);
    grupo.add(aro);
    grupo.add(etiqueta);

    grupo.position.set(x, y, z);
    scene.add(grupo);

    objetosClickeables.push(esfera);
}

function crearEtiqueta(texto) {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 90;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(1, 18, 84, 0.95)";
    ctx.beginPath();
    ctx.roundRect(10, 10, 300, 60, 18);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, 160, 40);

    const textura = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
        map: textura,
        transparent: true
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.25, 0.36, 1);

    return sprite;
}

/* ============================
   EVENTOS
============================ */

function crearEventos() {
    window.addEventListener("resize", ajustarPantalla);

    renderer.domElement.addEventListener("pointerdown", detectarClick);
    renderer.domElement.addEventListener("pointermove", detectarHover);

    document.getElementById("btnBuscarFicha").addEventListener("click", buscarFicha);
    document.getElementById("btnCentrarCamara").addEventListener("click", centrarCamara);
    document.getElementById("btnMostrarPuntos").addEventListener("click", alternarPuntos);

    document.getElementById("btnVerHistorial").addEventListener("click", () => {
        alert("Historial de prueba de la pieza seleccionada.");
    });

    document.getElementById("btnRegistrarCambio").addEventListener("click", () => {
        alert("Formulario de cambio de pieza en modo prueba.");
    });

    document.getElementById("btnRegistrarReparacion").addEventListener("click", () => {
        alert("Formulario de reparación en modo prueba.");
    });
}

function detectarClick(evento) {
    const interseccion = obtenerInterseccion(evento);

    if (!interseccion) return;

    const objeto = interseccion.object;
    const idPieza = objeto.userData.idPieza;

    seleccionarPieza(idPieza, objeto);
}

function detectarHover(evento) {
    const interseccion = obtenerInterseccion(evento);
    renderer.domElement.style.cursor = interseccion ? "pointer" : "grab";
}

function obtenerInterseccion(evento) {
    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x = ((evento.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((evento.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersecciones = raycaster.intersectObjects(objetosClickeables, false);

    return intersecciones.length > 0 ? intersecciones[0] : null;
}

/* ============================
   MOSTRAR PIEZA
============================ */

function seleccionarPieza(idPieza, objeto3D) {
    const pieza = piezasUnidad[idPieza];

    if (!pieza) return;

    if (objetoSeleccionado) {
        objetoSeleccionado.scale.set(1, 1, 1);
    }

    objetoSeleccionado = objeto3D;
    objetoSeleccionado.scale.set(1.45, 1.45, 1.45);

    mostrarDetallePieza(pieza);
}

function mostrarDetallePieza(pieza) {
    const kmRecorrido = pieza.kmActual - pieza.kmInstalacion;
    const porcentaje = Math.min(Math.round((kmRecorrido / pieza.vidaUtilKm) * 100), 100);

    document.getElementById("lblSubdivision").textContent = pieza.subdivision;
    document.getElementById("lblNombrePieza").textContent = pieza.nombre;
    document.getElementById("lblMarcaPieza").textContent = pieza.marca;
    document.getElementById("lblModeloPieza").textContent = pieza.modelo;
    document.getElementById("lblPosicionPieza").textContent = pieza.posicion;
    document.getElementById("lblKmInstalacion").textContent = formato(pieza.kmInstalacion) + " KM";
    document.getElementById("lblKmActual").textContent = formato(pieza.kmActual) + " KM";
    document.getElementById("lblKmRecorrido").textContent = formato(kmRecorrido) + " KM";
    document.getElementById("lblVidaUtil").textContent = formato(pieza.vidaUtilKm) + " KM";
    document.getElementById("lblPorcentajeVida").textContent = porcentaje + "%";
    document.getElementById("lblObservacion").textContent = pieza.observacion;

    const barra = document.getElementById("barraVidaInterna");
    barra.style.width = porcentaje + "%";

    const estado = document.getElementById("lblEstadoPieza");
    estado.className = "estado-pieza";
    estado.textContent = pieza.estado;

    if (porcentaje < 60) {
        estado.classList.add("bueno");
        barra.style.background = "#2E7D32";
    } else if (porcentaje < 85) {
        estado.classList.add("alerta");
        barra.style.background = "#F9A825";
    } else {
        estado.classList.add("critico");
        barra.style.background = "#B00020";
    }
}

/* ============================
   UNIDAD
============================ */

function cargarDatosUnidad() {
    document.getElementById("lblFicha").textContent = unidadDemo.ficha;
    document.getElementById("lblTipo").textContent = unidadDemo.tipo;
    document.getElementById("lblMarcaUnidad").textContent = unidadDemo.marca;
    document.getElementById("lblKmUnidad").textContent = formato(unidadDemo.kilometrajeActual) + " KM";
    document.getElementById("lblEstadoUnidad").textContent = unidadDemo.estado;
}

function buscarFicha() {
    const ficha = document.getElementById("txtFicha").value.trim();

    if (ficha === "") {
        alert("Ingrese una ficha válida.");
        return;
    }

    unidadDemo.ficha = ficha;
    cargarDatosUnidad();

    document.getElementById("lblMensaje3D").textContent =
        "Ficha " + ficha + " cargada en modo prueba.";
}

/* ============================
   BOTONES
============================ */

function centrarCamara() {
    camera.position.set(0, 4.5, 9);
    controls.target.set(0, 1.1, 0);
    controls.update();
}

function alternarPuntos() {
    puntosVisibles = !puntosVisibles;

    objetosClickeables.forEach(objeto => {
        if (objeto.parent) {
            objeto.parent.visible = puntosVisibles;
        }
    });

    document.getElementById("btnMostrarPuntos").textContent =
        puntosVisibles ? "Ocultar puntos" : "Mostrar puntos";
}

/* ============================
   RESPONSIVE
============================ */

function ajustarPantalla() {
    const ancho = visor.clientWidth;
    const alto = visor.clientHeight;

    camera.aspect = ancho / alto;
    camera.updateProjectionMatrix();

    renderer.setSize(ancho, alto);
}

/* ============================
   ANIMACIÓN
============================ */

function animar() {
    requestAnimationFrame(animar);

    controls.update();

    objetosClickeables.forEach(objeto => {
        if (objeto.parent && puntosVisibles) {
            objeto.parent.rotation.y += 0.01;
        }
    });

    renderer.render(scene, camera);
}

/* ============================
   UTILIDAD
============================ */

function formato(valor) {
    return Number(valor).toLocaleString("en-US");
}