// ============================================
// CONFIGURACIÓN DEL LOGO DE LA EMPRESA
// ============================================
// CAMBIA ESTA URL POR LA DE TU LOGO
const LOGO_EMPRESA_URL = "https://corsproxy.io/?https://res.cloudinary.com/ds7shn66t/image/upload/v1761819015/CATALYSISlogo_agz8kr.png";
// ============================================


// Datos iniciales de destinatarios
let destinatarios = [
    { id: 1, nombre: "COSDIET SL", direccion: "C/Hierro nº 2 Nave C", ciudad: "TORREJON DE ARDOZ", cp: "650707558", telefono: "916781479", nif: "B12345678", email: "info@cosdiet.com" },
    { id: 2, nombre: "EXXENTIA", direccion: "P.I. 12 Parcela 51, Cra. Villa de Don Fabrique Km.1", ciudad: "Lillo TOLEDO", cp: "45870", telefono: "", nif: "A87654321", email: "" },
    { id: 3, nombre: "INDUXTRA DE SUMINISTROS LLORELLA", direccion: "Mas Carreras", ciudad: "17834 USALL /PORQUERES, GIRONA", cp: "", telefono: "972 57 03 49 / 972 58 02 41", nif: "", email: "" },
    { id: 4, nombre: "PREVAL", direccion: "C/Estaño, 28", ciudad: "ARGANDA, MADRID", cp: "", telefono: "", nif: "", email: "" },
    { id: 5, nombre: "SINCROFARM", direccion: "c/Mercurio 10  P.I Almeda", ciudad: "CORNELLA DE LLOBREGAT", cp: "08940 BARCELONA", telefono: "", nif: "", email: "" },
    { id: 6, nombre: "NATAC BIOTECH, S.L.", direccion: "Polígono Industrial las Cañadas, s/n", ciudad: "Hérvas", cp: "10700 CACERES", telefono: "", nif: "", email: "" },
    { id: 7, nombre: "QUANTUM", direccion: "Passeig de Sant Gervasi 72, Entresuelo 2ª", ciudad: "BARCELONA", cp: "08022", telefono: "", nif: "", email: "" }
];

// Historial de albaranes
let historial = JSON.parse(localStorage.getItem('albaranHistorial')) || [
    { 
        id: 1, 
        numero: "ALB-2025-045", 
        destinatario: "COSDIET SL", 
        fecha: "2025-12-19", 
        productos: [
            { nombre: "PACTRON 40", peso: 5000, lote: "G20250301-2", cantidad: 1 }
        ]
    }
];

// Productos en el albarán actual
let productos = [];
let filtroActual = "";

// Variable para almacenar el logo en base64
let logoBase64 = null;

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const destinatarioSelect = document.getElementById('destinatario');
const fechaInput = document.getElementById('fecha');
const numeroInput = document.getElementById('numero');
const agregarProductoBtn = document.getElementById('agregar-producto');
const productosLista = document.getElementById('productos-lista');
const generarPdfBtn = document.getElementById('generar-pdf');
const limpiarFormularioBtn = document.getElementById('limpiar-formulario');
const listaDestinatarios = document.getElementById('lista-destinatarios');
const agregarDestinatarioBtn = document.getElementById('agregar-destinatario');
const importarExcelBtn = document.getElementById('importar-excel');
const listaHistorial = document.getElementById('lista-historial');
const limpiarHistorialBtn = document.getElementById('limpiar-historial');
const filtroClienteInput = document.getElementById('filtro-cliente');
const aplicarFiltroBtn = document.getElementById('aplicar-filtro');
const limpiarFiltroBtn = document.getElementById('limpiar-filtro');
const nifDestinatarioInput = document.getElementById('nif-destinatario');
const emailDestinatarioInput = document.getElementById('email-destinatario');
const datosEmpresaInput = document.getElementById('cabecera')

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Configurar fecha actual
    const today = new Date().toISOString().split('T')[0];
    fechaInput.value = today;
    
    // Cargar destinatarios
    cargarDestinatarios();
    
    // Cargar historial
    cargarHistorial();
    
    // Cargar datos iniciales del formulario
    cargarDatosIniciales();
    
    // Cargar el logo de la empresa
    cargarLogoEmpresa();
    
    // Actualizar destinatario al cambiar selección
    destinatarioSelect.addEventListener('change', function() {
        actualizarDatosDestinatario();
    });
    
    // Inicializar modo oscuro
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Configurar eventos de filtro
    aplicarFiltroBtn.addEventListener('click', aplicarFiltro);
    limpiarFiltroBtn.addEventListener('click', limpiarFiltro);
    
    // Permitir búsqueda al presionar Enter
    filtroClienteInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            aplicarFiltro();
        }
    });
});

// Función para cargar el logo de la empresa desde la URL
function cargarLogoEmpresa() {
    console.log("Intentando cargar logo desde:", LOGO_EMPRESA_URL);
    
    if (!LOGO_EMPRESA_URL) {
        console.log("No hay URL de logo definida");
        crearLogoPorDefecto();
        return;
    }
    
    // Intentar cargar como Data URL (base64)
    if (LOGO_EMPRESA_URL.startsWith('data:')) {
        console.log("Cargando como Data URL");
        logoBase64 = LOGO_EMPRESA_URL;
        return;
    }
    
    const img = new Image();
    img.crossOrigin = "Anonymous"; // IMPORTANTE para CORS
    
    img.onload = function() {
        console.log("Logo cargado correctamente, dimensiones:", img.width, "x", img.height);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        try {
            ctx.drawImage(img, 0, 0);
            logoBase64 = canvas.toDataURL('image/png');
            console.log("Logo convertido a base64 exitosamente");
        } catch (error) {
            console.error("Error al dibujar imagen en canvas:", error);
            crearLogoPorDefecto();
        }
    };
    
    img.onerror = function(err) {
        console.error("Error al cargar el logo:", err);
        console.log("URL que falló:", LOGO_EMPRESA_URL);
        crearLogoPorDefecto();
    };
    
    img.src = LOGO_EMPRESA_URL;
    
    // Si después de 3 segundos no se carga, usar logo por defecto
    setTimeout(() => {
        if (!logoBase64) {
            console.log("Timeout: Logo no se cargó en 3 segundos");
            crearLogoPorDefecto();
        }
    }, 3000);
}

// Función para crear un logo por defecto
/*function crearLogoPorDefecto() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Fondo azul
    ctx.fillStyle = '#4361ee';
    ctx.fillRect(0, 0, 200, 100);
    
    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CATALYSIS', 100, 50);
    
    logoBase64 = canvas.toDataURL('image/png');
}*/

// Cambiar modo oscuro/claro
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

// Cambiar pestañas
tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Cargar destinatarios
function cargarDestinatarios() {
    destinatarioSelect.innerHTML = '<option value="">Seleccionar destinatario</option>';
    
    destinatarios.forEach(dest => {
        const option = document.createElement('option');
        option.value = dest.id;
        option.textContent = dest.nombre;
        destinatarioSelect.appendChild(option);
    });
    
    listaDestinatarios.innerHTML = '';
    
    if (destinatarios.length === 0) {
        listaDestinatarios.innerHTML = '<div class="recipient-item"><p>No hay destinatarios registrados. Agrega el primero.</p></div>';
    } else {
        destinatarios.forEach(dest => {
            const item = document.createElement('div');
            item.className = 'recipient-item';
            item.innerHTML = `
                <div class="recipient-info">
                    <h4>${dest.nombre}</h4>
                    <p>${dest.direccion}, ${dest.ciudad} ${dest.cp ? `(${dest.cp})` : ''}</p>
                    <p>${dest.nif ? `NIF: ${dest.nif}` : ''} ${dest.telefono ? `- Tel: ${dest.telefono}` : ''}</p>
                </div>
                <div class="action-buttons">
                    <button class="action-btn btn-danger" onclick="eliminarDestinatario(${dest.id})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            listaDestinatarios.appendChild(item);
        });
    }
    
    localStorage.setItem('destinatarios', JSON.stringify(destinatarios));
}

// Actualizar datos del destinatario seleccionado
function actualizarDatosDestinatario() {
    const destId = parseInt(destinatarioSelect.value);
    if (destId) {
        const destinatario = destinatarios.find(d => d.id === destId);
        if (destinatario) {
            nifDestinatarioInput.value = destinatario.nif || '';
            emailDestinatarioInput.value = destinatario.email || '';
        }
    } else {
        nifDestinatarioInput.value = '';
        emailDestinatarioInput.value = '';
    }
}

// Cargar historial
function cargarHistorial() {
    listaHistorial.innerHTML = '';
    
    let historialFiltrado = historial;
    if (filtroActual) {
        const terminoBusqueda = filtroActual.toLowerCase();
        historialFiltrado = historial.filter(item => {
            if (item.destinatario.toLowerCase().includes(terminoBusqueda)) {
                return true;
            }
            
            for (const producto of item.productos) {
                if (producto.nombre.toLowerCase().includes(terminoBusqueda)) {
                    return true;
                }
            }
            
            if (item.numero.toLowerCase().includes(terminoBusqueda)) {
                return true;
            }
            
            return false;
        });
    }
    
    if (historialFiltrado.length === 0) {
        const mensaje = filtroActual 
            ? `<div class="no-results">No se encontraron albaranes para "${filtroActual}"</div>`
            : '<div class="no-results">No hay albaranes en el historial.</div>';
        listaHistorial.innerHTML = mensaje;
    } else {
        historialFiltrado.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const fechaFormateada = new Date(item.fecha).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            const productosHTML = item.productos.map(prod => 
                `<span class="product-tag">${prod.nombre} (${prod.peso} kg)</span>`
            ).join('');
            
            historyItem.innerHTML = `
                <div class="history-header">
                    <div class="history-info">
                        <h4>${item.numero} - ${item.destinatario}</h4>
                        <p>Fecha: ${fechaFormateada} | Productos: ${item.productos.length}</p>
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn btn-primary" onclick="descargarAlbaranHistorial(${item.id})"><i class="fas fa-download"></i> PDF</button>
                        <button class="action-btn btn-danger" onclick="eliminarDelHistorial(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="history-products">
                    <strong>Productos enviados:</strong><br>
                    ${productosHTML}
                </div>
            `;
            listaHistorial.appendChild(historyItem);
        });
    }
    
    // Actualizar contador
    const cardHeader = document.querySelector('#historial-tab .card-header');
    const existingCounter = document.querySelector('.result-counter');
    if (existingCounter) {
        existingCounter.remove();
    }
    
    const counter = document.createElement('div');
    counter.className = 'result-counter';
    counter.style.fontSize = '0.9rem';
    counter.style.color = 'var(--gray-color)';
    counter.style.marginTop = '5px';
    counter.innerHTML = `Mostrando ${historialFiltrado.length} de ${historial.length} albaranes`;
    
    if (filtroActual) {
        counter.innerHTML += ` (filtrado por: "${filtroActual}")`;
    }
    
    const cardTitle = cardHeader.querySelector('.card-title');
    cardHeader.insertBefore(counter, cardTitle.nextSibling);
    
    localStorage.setItem('albaranHistorial', JSON.stringify(historial));
}

// Aplicar filtro
function aplicarFiltro() {
    filtroActual = filtroClienteInput.value.trim();
    cargarHistorial();
}

// Limpiar filtro
function limpiarFiltro() {
    filtroClienteInput.value = '';
    filtroActual = '';
    cargarHistorial();
}

// Cargar datos iniciales
function cargarDatosIniciales() {
    const ultimoNumero = historial.length > 0 ? parseInt(historial[historial.length - 1].numero.split('-').pop()) : 44;
    numeroInput.value = `ALB-2025-${String(ultimoNumero + 1).padStart(3, '0')}`;
    
    if (destinatarios.length > 0) {
        destinatarioSelect.value = destinatarios[0].id;
        actualizarDatosDestinatario();
    }
    
    agregarProductoEjemplo();
}

// Agregar producto de ejemplo
function agregarProductoEjemplo() {
    productos.push({
        id: Date.now(),
        nombre: "PACTRON 40",
        peso: 5000,
        lote: "G20250301-2",
        cantidad: 1
    });
    
    actualizarListaProductos();
}

// Agregar nuevo producto
agregarProductoBtn.addEventListener('click', function() {
    const nombre = document.getElementById('producto-nombre').value.trim();
    const peso = parseFloat(document.getElementById('producto-peso').value.trim());
    const lote = document.getElementById('producto-lote').value.trim();
    const cantidad = parseInt(document.getElementById('producto-cantidad').value.trim()) || 1;
    
    if (!nombre || isNaN(peso)) {
        alert('Por favor, ingresa al menos el nombre y el peso del producto.');
        return;
    }
    
    productos.push({
        id: Date.now(),
        nombre: nombre,
        peso: peso,
        lote: lote || "N/A",
        cantidad: cantidad
    });
    
    // Limpiar campos
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-peso').value = '';
    document.getElementById('producto-lote').value = '';
    document.getElementById('producto-cantidad').value = '1';
    
    actualizarListaProductos();
});

// Actualizar lista de productos
function actualizarListaProductos() {
    productosLista.innerHTML = '';
    
    if (productos.length === 0) {
        productosLista.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay productos agregados.</td></tr>';
    } else {
        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.peso.toFixed(2)} kg</td>
                <td>${producto.lote}</td>
                <td>${producto.cantidad}</td>
                <td>
                    <button class="action-btn btn-danger" onclick="eliminarProducto(${producto.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            productosLista.appendChild(row);
        });
    }
}

// Eliminar producto
window.eliminarProducto = function(id) {
    productos = productos.filter(p => p.id !== id);
    actualizarListaProductos();
};

// Agregar nuevo destinatario
agregarDestinatarioBtn.addEventListener('click', function() {
    const nombre = document.getElementById('nuevo-nombre').value.trim();
    const direccion = document.getElementById('nuevo-direccion').value.trim();
    const ciudad = document.getElementById('nuevo-ciudad').value.trim();
    const cp = document.getElementById('nuevo-cp').value.trim();
    const nif = document.getElementById('nuevo-nif').value.trim();
    const telefono = document.getElementById('nuevo-telefono').value.trim();
    const email = document.getElementById('nuevo-email').value.trim();
    
    if (!nombre || !direccion || !ciudad) {
        alert('Por favor, completa al menos los campos de nombre, dirección y ciudad.');
        return;
    }
    
    const nuevoDestinatario = {
        id: Date.now(),
        nombre: nombre,
        direccion: direccion,
        ciudad: ciudad,
        cp: cp,
        nif: nif,
        telefono: telefono,
        email: email
    };
    
    destinatarios.push(nuevoDestinatario);
    
    // Limpiar campos
    document.getElementById('nuevo-nombre').value = '';
    document.getElementById('nuevo-direccion').value = '';
    document.getElementById('nuevo-ciudad').value = '';
    document.getElementById('nuevo-cp').value = '';
    document.getElementById('nuevo-nif').value = '';
    document.getElementById('nuevo-telefono').value = '';
    document.getElementById('nuevo-email').value = '';
    
    cargarDestinatarios();
    
    alert('Destinatario agregado correctamente.');
});

// Importar desde Excel (simulación)
importarExcelBtn.addEventListener('click', function() {
    const datosExcel = [
        { nombre: "DEMERQUISA", direccion: "C/Verano Ed. Azul P.I. Las Monjas", ciudad: "TORREJON DE ARDOZ", cp: "28850", telefono: "", nif: "", email: "" },
        { nombre: "RENY - PICOT", direccion: "Anleo s/n", ciudad: "33710 NAVIA, ASTURIAS", cp: "", telefono: "", nif: "", email: "" },
        { nombre: "SOTEAL", direccion: "C/Cabo de Tortosa 14-16 P.I. La Poveda", ciudad: "ARGANDA", cp: "28500", telefono: "", nif: "", email: "" },
        { nombre: "CENTRAL DE ENVASADOS", direccion: "C/Miguel Cervet 10 Póligono Industrial La Garena", ciudad: "ALCALA DE HENARES, MADRID", cp: "", telefono: "", nif: "", email: "" }
    ];
    
    datosExcel.forEach(dest => {
        destinatarios.push({
            id: Date.now() + Math.random(),
            ...dest
        });
    });
    
    cargarDestinatarios();
    alert(`Se importaron ${datosExcel.length} destinatarios desde el archivo Excel.`);
});

// Eliminar destinatario
window.eliminarDestinatario = function(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este destinatario?')) {
        destinatarios = destinatarios.filter(d => d.id !== id);
        cargarDestinatarios();
    }
};

// Generar PDF
generarPdfBtn.addEventListener('click', function() {
    if (!destinatarioSelect.value) {
        alert('Por favor, selecciona un destinatario.');
        return;
    }
    
    if (!numeroInput.value.trim()) {
        alert('Por favor, ingresa un número de albarán.');
        return;
    }
    
    if (productos.length === 0) {
        alert('Por favor, agrega al menos un producto al albarán.');
        return;
    }
    
    const destId = parseInt(destinatarioSelect.value);
    const destinatario = destinatarios.find(d => d.id === destId);
    
    if (!destinatario) {
        alert('Destinatario no encontrado.');
        return;
    }
    
    generarPDF({
        numero: numeroInput.value.trim(),
        fecha: fechaInput.value,
        destinatario: destinatario,
        nifDestinatario: nifDestinatarioInput.value.trim(),
        emailDestinatario: emailDestinatarioInput.value.trim(),
        cabecera: datosEmpresaInput.value, // Aquí también
        productos: productos
    });
    
    // Agregar al historial
    const nuevoAlbaran = {
        id: Date.now(),
        numero: numeroInput.value.trim(),
        destinatario: destinatario.nombre,
        fecha: fechaInput.value,
        productos: [...productos]
    };
    
    historial.push(nuevoAlbaran);
    cargarHistorial();
    
    alert(`Albarán ${numeroInput.value.trim()} generado correctamente. Se ha guardado en el historial.`);
});

// ============================================
// NUEVA FUNCIÓN PARA GENERAR PDF COMO LA IMAGEN
// ============================================
// ============================================
// NUEVA FUNCIÓN PARA GENERAR PDF MODERNO
// ============================================
function generarPDF(datos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Variables de configuración
    const marginLeft = 15;
    const marginRight = 15;
    const pageWidth = doc.internal.pageSize.width;
    const usableWidth = pageWidth - marginLeft - marginRight;
    let currentY = 15;
    
    // Color azul moderno
    const colorAzul = [67, 97, 238]; // RGB del azul
    const colorAzulOscuro = [52, 73, 194];
    
    // ========== CABECERA CON FONDO AZUL ==========
    // Fondo azul
    doc.setFillColor(...colorAzul);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo de la empresa a la izquierda
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, 'PNG', marginLeft, 8, 30, 22);
        } catch (error) {
            console.log("Error al agregar logo");
        }
    }
    
    // Datos de la empresa del usuario (dividir por saltos de línea)
    const lineasEmpresa = datos.cabecera.split('\n').filter(linea => linea.trim() !== '');
    
    // Primera línea: nombre de la empresa (negrita, más grande)
    if (lineasEmpresa.length > 0) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(lineasEmpresa[0].trim(), marginLeft + 35, 18);
    }
    
    // Resto de líneas: información de la empresa (normal)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    let yEmpresa = 27;
    for (let i = 1; i < lineasEmpresa.length; i++) {
        doc.text(lineasEmpresa[i].trim(), marginLeft + 35, yEmpresa);
        yEmpresa += 4;
    }
    
    currentY = 60;
    
    // ========== TÍTULO "ALBARÁN" ==========
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorAzulOscuro);
    doc.text("ALBARÁN", marginLeft, currentY);
    
    currentY += 15;
    
    // ========== SECCIÓN DESTINATARIO CON RECUADRO AZUL ==========
    // Línea azul divisoria
    doc.setDrawColor(...colorAzul);
    doc.setLineWidth(1);
    doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
    
    currentY += 10;
    
    // Título destinatario con fondo azul claro
    doc.setFillColor(240, 245, 255);
    doc.rect(marginLeft, currentY, usableWidth, 8, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorAzul);
    doc.text("DESTINATARIO", marginLeft + 3, currentY + 5.5);
    
    currentY += 12;
    
    // Nombre del destinatario (negrita y azul)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorAzulOscuro);
    doc.text(datos.destinatario.nombre, marginLeft, currentY);
    
    currentY += 7;
    
    // Información del destinatario (gris oscuro)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    
    if (datos.destinatario.direccion) {
        doc.text(datos.destinatario.direccion, marginLeft, currentY);
        currentY += 5;
    }
    
    if (datos.destinatario.ciudad) {
        const ciudadText = datos.destinatario.cp 
            ? `${datos.destinatario.ciudad} (${datos.destinatario.cp})`
            : datos.destinatario.ciudad;
        doc.text(ciudadText, marginLeft, currentY);
        currentY += 5;
    }
    
    if (datos.nifDestinatario) {
        doc.setTextColor(...colorAzul);
        doc.text(`NIF: ${datos.nifDestinatario}`, marginLeft, currentY);
        currentY += 5;
        doc.setTextColor(80, 80, 80);
    }
    
    if (datos.destinatario.telefono) {
        doc.text(`Tel: ${datos.destinatario.telefono}`, marginLeft, currentY);
        currentY += 5;
    }
    
    if (datos.emailDestinatario) {
        doc.text(`Email: ${datos.emailDestinatario}`, marginLeft, currentY);
        currentY += 5;
    }
    
    currentY += 5;
    
    // ========== TABLA DE PRODUCTOS CON ESTILO MODERNO ==========
    const colWidths = [usableWidth * 0.4, usableWidth * 0.2, usableWidth * 0.2, usableWidth * 0.2];
    let colX = marginLeft;
    
    // Cabecera de la tabla con fondo azul
    doc.setFillColor(...colorAzul);
    doc.rect(marginLeft, currentY, usableWidth, 10, 'F');
    
    // Bordes de la cabecera
    doc.setDrawColor(67, 97, 238);
    doc.setLineWidth(0.5);
    doc.rect(marginLeft, currentY, usableWidth, 10);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255); // Texto blanco en cabecera azul
    
    // Texto de cabecera
    const columnas = ["Producto", "Peso Neto", "Lote", "Cant."];
    columnas.forEach((nombre, index) => {
        doc.text(nombre, colX + (colWidths[index] / 2), currentY + 7, { align: "center" });
        
        // Separadores verticales
        if (index < columnas.length - 1) {
            doc.line(colX + colWidths[index], currentY, colX + colWidths[index], currentY + 10);
        }
        
        colX += colWidths[index];
    });
    
    currentY += 10;
    
    // ========== FILAS DE PRODUCTOS ==========
    doc.setFont("helvetica", "normal");
    datos.productos.forEach((prod, index) => {
        const rowHeight = 12;
        
        // Fondo alternado para filas (blanco y azul muy claro)
        if (index % 2 === 0) {
            doc.setFillColor(255, 255, 255);
        } else {
            doc.setFillColor(245, 250, 255);
        }
        
        doc.rect(marginLeft, currentY, usableWidth, rowHeight, 'F');
        
        // Bordes de la fila (azul claro)
        doc.setDrawColor(220, 230, 255);
        doc.rect(marginLeft, currentY, usableWidth, rowHeight);
        
        colX = marginLeft;
        
        // Producto
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.text(prod.nombre, colX + 5, currentY + 8);
        
        doc.line(colX + colWidths[0], currentY, colX + colWidths[0], currentY + rowHeight);
        
        // Peso Neto
        doc.text(`${prod.peso.toFixed(0)}`, colX + colWidths[0] + (colWidths[1] / 2), currentY + 8, { align: "center" });
        
        doc.line(colX + colWidths[0] + colWidths[1], currentY, colX + colWidths[0] + colWidths[1], currentY + rowHeight);
        
        // Lote
        doc.text(prod.lote, colX + colWidths[0] + colWidths[1] + (colWidths[2] / 2), currentY + 8, { align: "center" });
        
        doc.line(colX + colWidths[0] + colWidths[1] + colWidths[2], currentY, 
                 colX + colWidths[0] + colWidths[1] + colWidths[2], currentY + rowHeight);
        
        // Cantidad
        doc.text(prod.cantidad.toString(), colX + colWidths[0] + colWidths[1] + colWidths[2] + (colWidths[3] / 2), currentY + 8, { align: "center" });
        
        currentY += rowHeight;
    });
    
    currentY += 15;
    
    // ========== INFORMACIÓN DEL ALBARÁN CON FONDO AZUL ==========
    doc.setFillColor(240, 245, 255);
    doc.rect(marginLeft, currentY, usableWidth, 15, 'F');
    
    // Borde azul
    doc.setDrawColor(...colorAzul);
    doc.setLineWidth(1);
    doc.rect(marginLeft, currentY, usableWidth, 15);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorAzul);
    
    // Número de albarán
    doc.text(`Albarán Nº: ${datos.numero}`, marginLeft + 10, currentY + 10);
    
    // Fecha
    const fechaFormateada = new Date(datos.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    doc.text(`Fecha: ${fechaFormateada}`, pageWidth - marginRight - 60, currentY + 10, { align: "right" });
    
    // ========== PIE DE PÁGINA ==========
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Línea azul antes del pie
        doc.setDrawColor(...colorAzul);
        doc.setLineWidth(1);
        doc.line(marginLeft, 285, pageWidth - marginRight, 285);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text(`Documento generado electrónicamente - Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: "center" });
    }
    
    // Guardar PDF
    doc.save(`albaran-${datos.numero}.pdf`);
}
// Limpiar formulario
limpiarFormularioBtn.addEventListener('click', function() {
    if (confirm('¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos no guardados.')) {
        limpiarFormulario();
    }
});

function limpiarFormulario() {
    if (destinatarios.length > 0) {
        destinatarioSelect.value = destinatarios[0].id;
        actualizarDatosDestinatario();
    } else {
        destinatarioSelect.value = '';
        nifDestinatarioInput.value = '';
        emailDestinatarioInput.value = '';
    }
    
    const today = new Date().toISOString().split('T')[0];
    fechaInput.value = today;
    
    const ultimoNumero = historial.length > 0 ? parseInt(historial[historial.length - 1].numero.split('-').pop()) : 44;
    numeroInput.value = `ALB-2025-${String(ultimoNumero + 1).padStart(3, '0')}`;
    
    productos = [];
    actualizarListaProductos();
    
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-peso').value = '';
    document.getElementById('producto-lote').value = '';
    document.getElementById('producto-cantidad').value = '1';
}

// Limpiar historial
limpiarHistorialBtn.addEventListener('click', function() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial? Esta acción no se puede deshacer.')) {
        historial = [];
        cargarHistorial();
    }
});

// Eliminar del historial
window.eliminarDelHistorial = function(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este albarán del historial?')) {
        historial = historial.filter(h => h.id !== id);
        cargarHistorial();
    }
};

window.descargarAlbaranHistorial = function(id) {
    const albaran = historial.find(h => h.id === id);
    if (albaran) {
        const destinatario = destinatarios.find(d => d.nombre === albaran.destinatario) || {
            nombre: albaran.destinatario,
            direccion: "",
            ciudad: "",
            cp: "",
            telefono: "",
            nif: "",
            email: ""
        };
        
        generarPDF({
            numero: albaran.numero,
            fecha: albaran.fecha,
            destinatario: destinatario,
            nifDestinatario: destinatario.nif || "",
            emailDestinatario: destinatario.email || "",
            cabecera: datosEmpresaInput.value, // Aquí captura lo del textarea
            productos: albaran.productos
        });
    }
};