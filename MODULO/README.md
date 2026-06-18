# 🎯 SISTEMA ADMINISTRATIVO DE AUTOBUSES - GUÍA COMPLETA

## 📋 Descripción General

Sistema completo de administración para flotas de autobuses con gestión centralizada de:
- ✅ Mantenimiento unificado (con actualización automática de KM)
- ✅ Control de combustible
- ✅ Gestión de piezas y goma
- ✅ Rendimiento de aceite
- ✅ Reportes de choques
- ✅ Caja chica
- ✅ Chat grupal por departamento
- ✅ Tareas pendientes
- ✅ Búsqueda de artículos
- ✅ Pintura y artículos de utilidad
- ✅ Inventario
- ✅ Consultas con IA
- ✅ Y más...

---

## 🏗️ Arquitectura del Sistema

### Base de Datos Centralizada
**Archivo:** `BASE_DATOS/database.js`

Todos los módulos usan una base de datos unificada en `localStorage` con la siguiente estructura:

```javascript
sistemaBD = {
    unidades: [],              // Registro de vehículos
    empleados: [],             // Registro de choferes y personal
    combustible: [],           // Registros de combustible
    mantenimiento: [],         // Mantenimiento general
    piezas: [],                // Registro de piezas
    goma: [],                  // Registro de goma/llantas
    aceite: [],                // Registro de aceite
    caja_chica: [],            // Gastos menores
    choques: [],               // Reportes de choques
    pintura: [],               // Artículos de pintura
    inventario: [],            // Inventario general
    tareas_pendientes: [],     // Tareas individuales y generales
    chat: []                   // Mensajes por departamento
}
```

### Funciones Críticas

#### 1. **actualizarKmUnidad(idUnidad, kmNuevo)**
   - **Propósito:** Actualizar el KM de una unidad automáticamente
   - **Lógica:** Si `kmNuevo > kmActual`, entonces `kmActual = kmNuevo`
   - **Se ejecuta:** Cada vez que se registra cualquier mantenimiento
   - **Resultado:** Sincronización automática de KM en toda la flota

```javascript
// Ejemplo:
actualizarKmUnidad('T-001', 150500); // Actualiza solo si es mayor
```

#### 2. **registrarMantenimiento(datos)**
   - **Propósito:** Registro centralizado de cualquier tipo de mantenimiento
   - **Parámetros:** tipo, unidad, km, fecha, hora, empleado, descripción, monto
   - **Automático:** Actualiza KM y guarda en el tipo correspondiente

```javascript
// Ejemplo:
registrarMantenimiento({
    tipo: 'goma',
    unidad: 'T-001',
    km: 150500,
    fecha: '2026-06-04',
    hora: '14:30',
    descripcion: 'Cambio de goma delantera',
    monto: 150
});
```

#### 3. **CRUD Operaciones**
   - `crearUnidad()`, `actualizarUnidad()`, `eliminarUnidad()`
   - `crearEmpleado()`, `obtenerEmpleados()`
   - `crearTarea()`, `actualizarTarea()`
   - `enviarMensaje()`, `obtenerMensajesdepartamento()`

#### 4. **Búsqueda Inteligente**
   - `buscarArticulo(termino)` - Busca en piezas, goma, aceite e inventario

---

## 📂 Estructura de Carpetas

```
MODULO/
├── BASE_DATOS/
│   └── database.js              ← Base de datos centralizada
│
├── INICIO/
│   ├── index.html               ← Menú principal
│   ├── app.js                   ← Navegación
│   └── estilos.css
│
├── MANTENIMIENTO/               ← ⭐ Módulo central
│   ├── mantenimiento.html
│   ├── mantenimiento.js
│   └── mantenimiento.css
│
├── COMBUSTIBLE/
│   ├── modulo-combustible.html
│   ├── entrada-combustible.html
│   ├── reporte-combustible.html
│   └── (archivos JS y CSS)
│
├── PIEZAS/
│   ├── PIEZAS.HTML
│   ├── GOMA.HTML
│   └── (archivos JS y CSS)
│
├── CAJA_CHICA/
│   ├── caja-chica.html
│   ├── caja-chica.js
│   └── caja-chica.css
│
├── CHOQUES/
│   ├── choques-unidad.html
│   ├── choques-chofer.html
│   └── (archivos JS y CSS)
│
├── CHAT/
│   ├── chat.html
│   ├── chat.js
│   └── chat.css
│
├── TAREAS/
│   ├── tareas-pendientes.html
│   ├── tareas-pendientes.js
│   └── tareas.css
│
├── BUSQUEDA/
│   └── busqueda.html
│
├── PINTURA/
│   ├── pintura.html
│   ├── pintura.js
│   └── pintura.css
│
├── INVENTARIO/
│   └── inventario.html
│
├── ETIQUETAS/
│   └── etiquetas.html
│
├── ALQUILER/
│   └── unidades-alquiladas.html
│
├── LIMPIEZA/
│   └── limpieza-fumigacion.html
│
├── IA/
│   └── ia-consultas.html
│
├── RENDIMIENTO DE ACEITE/
│   └── (módulo existente)
│
├── DATO/
│   └── (módulo existente)
│
└── MENUS.CSS                    ← Estilos globales
```

---

## 🚀 CÓMO USAR EL SISTEMA

### 1️⃣ **Acceder al Menú Principal**
```
Abre: INICIO/index.html
```
Verás todos los módulos disponibles con iconos descriptivos.

### 2️⃣ **Registrar un Mantenimiento (IMPORTANTE)**

**El módulo MANTENIMIENTO es el central:**

1. Click en "Mantenimiento" desde el menú
2. Click en "➕ Nuevo Mantenimiento"
3. Completa:
   - **Unidad** (ej: T-001)
   - **Tipo** (Combustible, Piezas, Goma, Aceite, etc.)
   - **Fecha y Hora**
   - **KM Actual** ← 🔥 **CRÍTICO: Automáticamente actualiza el KM de la unidad**
   - **Descripción y Monto** (opcional)

**Resultado:** 
- ✅ Se registra el mantenimiento
- ✅ Se actualiza automáticamente el KM de la unidad
- ✅ Se sincroniza con todos los módulos

### 3️⃣ **Registrar Gasto en Caja Chica**

1. Click en "Caja Chica"
2. Click en "➕ Nuevo Gasto"
3. Completa los datos
4. Se suma automáticamente al total del mes

### 4️⃣ **Reportar un Choque**

Hay dos vistas:
- **Por Unidad:** Muestra choques de cada vehículo
- **Por Chofer:** Muestra histórico del conductor

1. Click en "Choques por Unidad" o "Choques por Chofer"
2. Registra el incidente
3. Se mantiene un histórico completo

### 5️⃣ **Chat Grupal**

1. Click en "Chat Grupal"
2. Selecciona departamento:
   - 🚌 Operación
   - 🔧 Mantenimiento
   - 📊 Administración
   - 👥 General
3. Escribe y envía mensaje

### 6️⃣ **Tareas Pendientes**

1. Click en "Tareas Pendientes"
2. Click en "➕ Nueva Tarea"
3. Selecciona:
   - Tipo: Individual o General
   - Prioridad: Baja, Normal, Alta
   - Próxima actualización: Semanal/Mensual/Trimestral
4. Cambia estado: Pendiente → En Progreso → Completada

### 7️⃣ **Buscar Artículos**

1. Click en "Búsqueda"
2. Escribe lo que buscas (nombre, referencia, código)
3. Busca automáticamente en:
   - Piezas
   - Goma
   - Aceite
   - Inventario

### 8️⃣ **Consultar con IA**

1. Click en "IA Consultas"
2. Haz una pregunta como:
   - "¿Cuáles son las unidades con más choques?"
   - "¿Qué unidad necesita mantenimiento?"
   - "¿Cuál es el gasto en combustible?"
3. El sistema analiza los datos y proporciona respuestas

---

## 🔄 **FLUJO CRÍTICO: ACTUALIZACIÓN DE KM**

### Escenario Completo

```
📍 INICIO: Unidad T-001 tiene 150,000 km registrados

1️⃣ Se MONTA GOMA en T-001 con 150,500 km
   └─ Sistema: "KM 150,500 > 150,000, ACTUALIZAR"
   └─ T-001 ahora = 150,500 km ✅

2️⃣ Se REGISTRA COMBUSTIBLE con 150,450 km (menos)
   └─ Sistema: "150,450 NO > 150,500, NO actualizar"
   └─ T-001 sigue = 150,500 km ✅

3️⃣ Se REGISTRA PIEZAS con 150,700 km
   └─ Sistema: "150,700 > 150,500, ACTUALIZAR"
   └─ T-001 ahora = 150,700 km ✅

✅ RESULTADO: T-001 siempre tiene el KM más alto registrado
```

---

## 💾 **PERSISTENCIA DE DATOS**

Todos los datos se guardan automáticamente en `localStorage`:

```javascript
// Guardado automático
guardarBD();  // Se ejecuta después de cada cambio

// Cargado al iniciar
inicializarBD();  // Se ejecuta al cargar cualquier módulo
```

**Ventaja:** Los datos persisten incluso si cierras el navegador.

---

## 🎨 **CARACTERÍSTICAS DE DISEÑO**

### Interfaz Consistente
- **Sidebar responsive** que se adapta a móvil
- **Color principal:** Gradiente púrpura (#667eea → #764ba2)
- **Botones con emojis** para fácil identificación
- **Tabla paginated** con búsqueda

### Elementos Interactivos
- ✏️ Editar registros
- 🗑️ Eliminar registros
- 📥 Descargar a Excel
- 📊 Gráficos (Chart.js)
- 📱 Responsive en móvil

---

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### 1. **Datos Locales**
Actualmente los datos se guardan en `localStorage` del navegador.
- **Ventaja:** No necesita servidor
- **Limitación:** Máximo ~5-10 MB
- **Recomendación:** Para producción, usar backend (Node.js, PHP, etc.)

### 2. **Respaldo de Datos**
Regularmente:
1. Click en "📥 Descargar" en los módulos
2. Guarda el Excel en tu computadora
3. Mantén respaldos en la nube

### 3. **Módulos en Desarrollo**
Estos módulos tienen interfaz pero funcionalidad parcial:
- Inventario
- Etiquetas (impresión a escala)
- Unidades Alquiladas
- Limpieza/Fumigación (parcial)

---

## 🔧 **EXTENSIONES FUTURAS**

### Próximos Pasos Recomendados

1. **Backend:**
   - Cambiar de localStorage a BD SQL (MySQL, PostgreSQL)
   - API REST con Node.js/Express o Laravel

2. **Reportes Avanzados:**
   - Análisis de rentabilidad por unidad
   - Predicción de mantenimiento
   - Gráficos de tendencias

3. **Integración Móvil:**
   - App Android/iOS nativa
   - Sincronización en tiempo real

4. **Notificaciones:**
   - Alertas de mantenimiento vencido
   - Recordatorios de tareas
   - Notificaciones push

5. **Usuario y Seguridad:**
   - Sistema de login
   - Permisos por rol
   - Auditoría de cambios

---

## 📞 **SOPORTE RÁPIDO**

| Problema | Solución |
|----------|----------|
| Datos no se guardan | Limpia localStorage: `localStorage.clear()` |
| El KM no se actualiza | Verifica que el módulo está cargando `database.js` |
| Búsqueda no encuentra items | Los items deben estar registrados primero |
| Chat vacío | Asegúrate de estar en el departamento correcto |
| Tabla lenta | Limpia datos antiguos (módulo no tiene límite) |

---

## 📊 **EJEMPLO DE FLUJO DIARIO**

```
🌅 MAÑANA:
1. Abre INICIO/index.html
2. Chequea "Tareas Pendientes" para el día
3. Revisa "Chat Grupal" de tu departamento

🌤️ DURANTE EL DÍA:
4. Registra "Mantenimiento" cuando se hace
   - Sistema automáticamente actualiza KM
5. Registra "Caja Chica" para gastos menores
6. Envía mensajes en "Chat Grupal"

🌙 FINAL DEL DÍA:
7. Actualiza estado de "Tareas Pendientes"
8. Revisa "Reportes" si es necesario
9. El sistema ya tiene todo sincronizado ✅

📋 FINAL DEL MES:
10. Descarga Excel de cada módulo
11. Genera reportes finales
12. Revisa "IA Consultas" para análisis
```

---

## ✨ **CONCLUSIÓN**

Este sistema proporciona una solución completa y moderna para la administración de flotas de autobuses, con:

✅ **Automatización:** KM se actualiza automáticamente
✅ **Centralización:** Una base de datos unificada
✅ **Modularidad:** Cada función en su módulo
✅ **Escalabilidad:** Fácil de extender
✅ **Usabilidad:** Interfaz intuitiva y responsive

🚀 **¡Listo para usar!**

---

**Última actualización:** 04 Junio 2026
**Versión:** 1.0
**Estado:** Funcional
