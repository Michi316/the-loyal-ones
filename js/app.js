// --- 1. MEMORIA Y ESTADO INICIAL (Guardado permanente en Celular y Laptop) ---
let productos = JSON.parse(localStorage.getItem('inventarioTheLoyalOnes')) || [];
let pedidos = JSON.parse(localStorage.getItem('historialPedidosTheLoyalOnes')) || [];
let pedidosNoVistos = parseInt(localStorage.getItem('pedidosNoVistosTheLoyalOnes')) || 0;

// Elementos del DOM
const productGrid = document.getElementById('productGrid');
const dashboardBtn = document.getElementById('dashboardBtn');
const panelModal = document.getElementById('panelModal');
const closePanel = document.getElementById('closePanel');
const formProducto = document.getElementById('formProducto');
const formEliminar = document.getElementById('formEliminar');

// Modales y Botones de Navegación
const btnHacerPedido = document.getElementById('btnHacerPedido');
const pedidoModal = document.getElementById('pedidoModal');
const closePedido = document.getElementById('closePedido');

const btnVerHistorial = document.getElementById('btnVerHistorial');
const historialModal = document.getElementById('historialModal');
const closeHistorial = document.getElementById('closeHistorial');
const listaPedidos = document.getElementById('listaPedidos');
const historialBadge = document.getElementById('historialBadge');

// Elementos de la Vista Previa
const prevImg = document.getElementById('prevImg');
const prevNombre = document.getElementById('prevNombre');
const prevPrecio = document.getElementById('prevPrecio');
const prevCodigo = document.getElementById('prevCodigo');

// Elementos del Resumen de Ventas
const btnResumen = document.getElementById('btnResumen');
const resumenModal = document.getElementById('resumenModal');
const closeResumen = document.getElementById('closeResumen');
const totalVentasUSD = document.getElementById('totalVentasUSD');
const totalVentasVES = document.getElementById('totalVentasVES');
const tasaBCV = document.getElementById('tasaBCV');

// Logo Interactivo
const logoPatita = document.getElementById('logoPatita');

// --- FUNCIONES DE GUARDADO SEGURO ---
function guardarEnMemoria() {
    try {
        localStorage.setItem('inventarioTheLoyalOnes', JSON.stringify(productos));
    } catch (e) {
        alert("La memoria está llena. Intenta usar imágenes con menor resolución.");
    }
}

function guardarPedidosEnMemoria() {
    localStorage.setItem('historialPedidosTheLoyalOnes', JSON.stringify(pedidos));
    localStorage.setItem('pedidosNoVistosTheLoyalOnes', pedidosNoVistos.toString());
}

// --- COMPRESIÓN DE IMÁGENES (Evita que el navegador colapse por fotos pesadas) ---
function comprimirImagen(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 300;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            callback(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- 2. DISPLAY DEL CATÁLOGO ---
function cargarProductos() {
    if (!productGrid) return;
    productGrid.innerHTML = ""; 
    
    if (productos.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; font-weight: bold; margin-top: 2rem;">No hay productos registrados en el catálogo.</p>';
        return;
    }

    productos.forEach(prod => {
        const esAgotado = prod.agotado || false;
        const card = document.createElement('div');
        card.className = `card ${esAgotado ? 'card-agotada' : ''}`;
        
        const badgeTexto = esAgotado ? 'Agotado ❌' : 'Disponible ✓';
        const badgeClase = esAgotado ? 'stock-agotado' : 'stock-disponible';
        const btnTexto = esAgotado ? 'Marcar como Disponible' : 'Marcar como Agotado';
        const btnClase = esAgotado ? 'marcar-disponible' : 'marcar-agotado';

        card.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}" onerror="this.src='https://via.placeholder.com/200?text=Sin+Imagen'">
            <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 0.5rem;">Código: <b>${prod.codigo}</b></p>
            <h3>${prod.nombre}</h3>
            <p style="font-size: 1.2rem; font-weight: bold; color: var(--azul-medio);">$${prod.precio.toFixed(2)}</p>
            
            <div>
                <span class="stock-badge ${badgeClase}">${badgeTexto}</span>
            </div>

            <button onclick="cambiarEstadoStock(${prod.id})" class="btn-toggle-stock ${btnClase}">
                <i class="fa-solid fa-arrows-rotate"></i> ${btnTexto}
            </button>
        `;
        productGrid.appendChild(card);
    });
}

window.cambiarEstadoStock = function(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        producto.agotado = !producto.agotado;
        guardarEnMemoria();
        cargarProductos();
    }
};

// --- 3. CONTROL DE MODALES ---
if (dashboardBtn) dashboardBtn.addEventListener('click', () => { panelModal.style.display = 'flex'; });
if (closePanel) closePanel.addEventListener('click', () => { panelModal.style.display = 'none'; });

if (btnHacerPedido) {
    btnHacerPedido.addEventListener('click', (e) => {
        e.preventDefault();
        pedidoModal.style.display = 'flex';
    });
}
if (closePedido) closePedido.addEventListener('click', () => { pedidoModal.style.display = 'none'; });

if (btnVerHistorial) {
    btnVerHistorial.addEventListener('click', (e) => {
        e.preventDefault();
        cargarHistorialPedidos();
        historialModal.style.display = 'flex';
        pedidosNoVistos = 0;
        guardarPedidosEnMemoria();
        actualizarBadgeHistorial();
    });
}
if (closeHistorial) closeHistorial.addEventListener('click', () => { historialModal.style.display = 'none'; });

if (btnResumen) {
    btnResumen.addEventListener('click', (e) => {
        e.preventDefault();
        calcularResumenVentas();
        resumenModal.style.display = 'flex';
    });
}
if (closeResumen) closeResumen.addEventListener('click', () => { resumenModal.style.display = 'none'; });

window.addEventListener('click', (e) => {
    if (e.target === panelModal) panelModal.style.display = 'none';
    if (e.target === pedidoModal) pedidoModal.style.display = 'none';
    if (e.target === historialModal) historialModal.style.display = 'none';
    if (e.target === resumenModal) resumenModal.style.display = 'none';
});

// --- 4. RESUMEN DE VENTAS (SOLO LO COBRADO) ---
function calcularResumenVentas() {
    let sumaTotalUSD = 0;
    pedidos.forEach(pedido => {
        if (pedido.tipoPago === 'cuotas') {
            let montoCuota = pedido.total / 2;
            if (pedido.estadoCuota1 === 'Pagado') sumaTotalUSD += montoCuota;
            if (pedido.estadoCuota2 === 'Pagado') sumaTotalUSD += montoCuota;
        } else {
            if (pedido.estadoPago === 'Pagado') sumaTotalUSD += pedido.total;
        }
    });
    if (totalVentasUSD) totalVentasUSD.textContent = sumaTotalUSD.toFixed(2);
    calcularBolivares(sumaTotalUSD);
}

function calcularBolivares(dolares) {
    let tasa = parseFloat(tasaBCV ? tasaBCV.value : 0) || 0;
    let bolivares = dolares * tasa;
    if (totalVentasVES) {
        totalVentasVES.textContent = bolivares.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}

if (tasaBCV) {
    tasaBCV.addEventListener('input', () => {
        let dolares = parseFloat(totalVentasUSD ? totalVentasUSD.textContent : 0) || 0;
        calcularBolivares(dolares);
    });
}

// --- 5. HISTORIAL DE PEDIDOS Y ACCIONES ---
function cargarHistorialPedidos() {
    if (!listaPedidos) return;
    listaPedidos.innerHTML = '';
    
    if (pedidos.length === 0) {
        listaPedidos.innerHTML = '<p style="color: #64748b; text-align: center;">Aún no hay pedidos registrados.</p>';
        return;
    }
    
    let pedidosInvertidos = [...pedidos].reverse();
    
    pedidosInvertidos.forEach(pedido => {
        if (!pedido.estadoPago) pedido.estadoPago = "No pagado";
        if (!pedido.estadoCuota1) pedido.estadoCuota1 = "No pagado";
        if (!pedido.estadoCuota2) pedido.estadoCuota2 = "No pagado";

        const div = document.createElement('div');
        div.style.background = '#f8fafc';
        div.style.padding = '1rem';
        div.style.border = '1px solid #e2e8f0';
        div.style.borderRadius = '8px';

        let listaItems = (pedido.items || []).map(i => `- ${i.nombre} ($${i.precio.toFixed(2)})`).join('<br>');
        let infoPago = pedido.tipoPago === 'cuotas' ? `En Cuotas (2 x $${(pedido.total/2).toFixed(2)})` : 'Pago Completo';

        let seccionBotones = "";
        if (pedido.tipoPago === 'cuotas') {
            let colorC1 = pedido.estadoCuota1 === 'Pagado' ? '#22c55e' : '#ef4444';
            let textoC1 = pedido.estadoCuota1 === 'Pagado' ? '✓ C1 Pagada' : '✗ C1 Pendiente';
            
            let colorC2 = pedido.estadoCuota2 === 'Pagado' ? '#22c55e' : '#ef4444';
            let textoC2 = pedido.estadoCuota2 === 'Pagado' ? '✓ C2 Pagada' : '✗ C2 Pendiente';

            seccionBotones = `
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button onclick="cambiarEstadoCuota(${pedido.id}, 1)" style="background: ${colorC1}; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">
                        ${textoC1}
                    </button>
                    <button onclick="cambiarEstadoCuota(${pedido.id}, 2)" style="background: ${colorC2}; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">
                        ${textoC2}
                    </button>
                </div>
            `;
        } else {
            let esPagado = pedido.estadoPago === 'Pagado';
            let colorBoton = esPagado ? '#22c55e' : '#ef4444';
            let textoBoton = esPagado ? '✓ Pagado' : '✗ No ha pagado';

            seccionBotones = `
                <button onclick="cambiarEstadoPago(${pedido.id})" style="background: ${colorBoton}; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: bold; cursor: pointer;">
                    ${textoBoton}
                </button>
            `;
        }

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                <span style="font-size: 0.85rem; color: #64748b; font-weight: bold;">${pedido.fecha}</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="enviarWhatsAppDesdeHistorial(${pedido.id})" style="background: #25D366; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer;" title="Enviar WhatsApp">
                        <i class="fa-brands fa-whatsapp"></i>
                    </button>
                    <button onclick="eliminarPedido(${pedido.id})" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer;" title="Eliminar Pedido">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            <p><b>Cliente:</b> ${pedido.nombre} ${pedido.apellido}</p>
            <p><b>Teléfono:</b> ${pedido.telefono}</p>
            <p style="margin-top: 0.5rem;"><b>Productos llevados:</b><br>${listaItems}</p>
            <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <p style="font-size: 1.1rem; color: var(--azul-oscuro); margin: 0;">
                    <b>Total:</b> $${pedido.total.toFixed(2)} <span style="font-size: 0.85rem; color: #64748b;">(${infoPago})</span>
                </p>
                ${seccionBotones}
            </div>
        `;
        listaPedidos.appendChild(div);
    });
}

window.cambiarEstadoPago = function(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
        pedido.estadoPago = (pedido.estadoPago === 'Pagado') ? 'No pagado' : 'Pagado';
        guardarPedidosEnMemoria();
        cargarHistorialPedidos();
    }
};

window.cambiarEstadoCuota = function(id, numCuota) {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
        if (numCuota === 1) pedido.estadoCuota1 = (pedido.estadoCuota1 === 'Pagado') ? 'No pagado' : 'Pagado';
        if (numCuota === 2) pedido.estadoCuota2 = (pedido.estadoCuota2 === 'Pagado') ? 'No pagado' : 'Pagado';
        guardarPedidosEnMemoria();
        cargarHistorialPedidos();
    }
};

window.eliminarPedido = function(id) {
    if(confirm("¿Estás segura de que deseas eliminar este pedido del historial?")) {
        pedidos = pedidos.filter(p => p.id !== id);
        guardarPedidosEnMemoria();
        cargarHistorialPedidos();
    }
};

window.enviarWhatsAppDesdeHistorial = function(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;

    const listaProductos = (pedido.items || []).map(item => item.nombre).join(', ');
    let estadoTexto = pedido.tipoPago === 'cuotas' 
        ? `Cuota 1: ${pedido.estadoCuota1}, Cuota 2: ${pedido.estadoCuota2}` 
        : `Estado: ${pedido.estadoPago}`;
        
    const mensaje = `Hola ${pedido.nombre} ${pedido.apellido}, te escribimos de The Loyal Ones para dar seguimiento a tu pedido de: ${listaProductos}. Total: $${pedido.total.toFixed(2)} (${estadoTexto}).`;

    let tel = pedido.telefono.replace(/\D/g, '');
    if (tel.startsWith('0')) tel = '58' + tel.slice(1);
    else if (tel.length === 10 && !tel.startsWith('58')) tel = '58' + tel;

    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, '_blank');
};

// --- 6. AGREGAR Y ELIMINAR PRODUCTOS AL CATÁLOGO ---
const inputCodigoProd = document.getElementById('codigoProd');
const inputNombreProd = document.getElementById('nombreProd');
const inputPrecioProd = document.getElementById('precioProd');
const inputImagenProd = document.getElementById('imagenProd');

if (inputCodigoProd) inputCodigoProd.addEventListener('input', e => prevCodigo.textContent = "Código: " + (e.target.value.toUpperCase() || "---"));
if (inputNombreProd) inputNombreProd.addEventListener('input', e => prevNombre.textContent = e.target.value || "Nombre del producto");
if (inputPrecioProd) {
    inputPrecioProd.addEventListener('input', e => {
        const val = parseFloat(e.target.value);
        prevPrecio.textContent = isNaN(val) ? "$0.00" : "$" + val.toFixed(2);
    });
}

if (inputImagenProd) {
    inputImagenProd.addEventListener('change', function(e) {
        if (this.files[0]) {
            comprimirImagen(this.files[0], (urlComprimida) => {
                if (prevImg) prevImg.src = urlComprimida;
            });
        }
    });
}

if (formProducto) {
    formProducto.addEventListener('submit', function(e) {
        e.preventDefault();
        const codigo = inputCodigoProd.value.trim().toUpperCase();
        const nombre = inputNombreProd.value.trim();
        const precio = parseFloat(inputPrecioProd.value);

        if (productos.some(p => p.codigo === codigo)) {
            alert("Ese código ya existe. Por favor usa uno distinto.");
            return;
        }

        const guardarProductoNuevo = (imagenUrl) => {
            productos.push({
                id: Date.now(),
                codigo: codigo,
                nombre: nombre,
                precio: precio,
                imagen: imagenUrl,
                agotado: false
            });
            guardarEnMemoria();
            cargarProductos();
            formProducto.reset();
            if (prevImg) prevImg.src = "https://via.placeholder.com/200?text=Sube+tu+foto";
            if (prevCodigo) prevCodigo.textContent = "Código: ---";
            if (prevNombre) prevNombre.textContent = "Nombre del producto";
            if (prevPrecio) prevPrecio.textContent = "$0.00";
            alert("¡Producto guardado exitosamente!");
        };

        if (inputImagenProd.files[0]) {
            comprimirImagen(inputImagenProd.files[0], guardarProductoNuevo);
        } else {
            guardarProductoNuevo("https://via.placeholder.com/200?text=Sin+Foto");
        }
    });
}

if (formEliminar) {
    formEliminar.addEventListener('submit', function(e) {
        e.preventDefault();
        const codigoBuscado = document.getElementById('codigoEliminar').value.trim().toUpperCase();
        const productoEncontrado = productos.find(p => p.codigo === codigoBuscado);
        if (productoEncontrado) {
            if (confirm(`¿Segura de borrar el producto: ${productoEncontrado.nombre}?`)) {
                productos = productos.filter(p => p.codigo !== codigoBuscado);
                guardarEnMemoria();
                cargarProductos();
                formEliminar.reset();
                alert("¡Producto eliminado!");
            }
        } else {
            alert("No se encontró ningún producto con el código: " + codigoBuscado);
        }
    });
}

// --- 7. REGISTRO DE PEDIDOS Y NOTIFICACIONES ---
const buscadorProducto = document.getElementById('buscadorProducto');
const resultadosBusqueda = document.getElementById('resultadosBusqueda');
const productosSeleccionados = document.getElementById('productosSeleccionados');
const totalPedidoSpan = document.getElementById('totalPedido');
const infoCuotas = document.getElementById('infoCuotas');
const montoCuotaSpan = document.getElementById('montoCuota');
const radiosPago = document.getElementsByName('tipoPago');
const formHacerPedido = document.getElementById('formHacerPedido');

let pedidoTemporal = []; 

if (buscadorProducto) {
    buscadorProducto.addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase().trim();
        if (!resultadosBusqueda) return;
        resultadosBusqueda.innerHTML = '';
        if (termino === '') return;
        
        const resultados = productos.filter(p => 
            (p.nombre && p.nombre.toLowerCase().includes(termino)) || 
            (p.codigo && p.codigo.toLowerCase().includes(termino))
        );
        
        resultados.forEach(prod => {
            const miniCard = document.createElement('div');
            miniCard.className = 'card';
            miniCard.style.padding = '1rem'; 
            
            const esAgotado = prod.agotado || false;
            const btnBuscador = esAgotado 
                ? `<button type="button" disabled style="padding: 0.4rem; margin-top: 0.5rem; font-size: 0.8rem; background: #94a3b8; border: none; border-radius: 4px; color: white; width: 100%;">Agotado</button>`
                : `<button type="button" onclick="agregarAlPedidoModal(${prod.id})" style="padding: 0.4rem; margin-top: 0.5rem; font-size: 0.8rem; background: var(--azul-claro); border: none; border-radius: 4px; color: white; cursor: pointer; width: 100%;">Añadir</button>`;

            miniCard.innerHTML = `
                <img src="${prod.imagen}" alt="${prod.nombre}" style="height: 80px; margin-bottom: 0.5rem; object-fit: cover; border-radius: 4px;">
                <h4 style="font-size: 0.9rem; color: var(--azul-oscuro);">${prod.nombre}</h4>
                <p style="font-size: 0.9rem; font-weight: bold;">$${prod.precio.toFixed(2)}</p>
                ${btnBuscador}
            `;
            resultadosBusqueda.appendChild(miniCard);
        });
    });
}

window.agregarAlPedidoModal = function(id) {
    const producto = productos.find(p => p.id === id);
    if (producto.agotado) {
        alert("Este producto está agotado.");
        return;
    }
    pedidoTemporal.push(producto);
    actualizarTotalesPedido();
    if (buscadorProducto) buscadorProducto.value = '';
    if (resultadosBusqueda) resultadosBusqueda.innerHTML = ''; 
};

window.quitarDelPedidoModal = function(index) {
    pedidoTemporal.splice(index, 1);
    actualizarTotalesPedido();
};

function actualizarTotalesPedido() {
    if (!productosSeleccionados) return;
    productosSeleccionados.innerHTML = '';
    let total = 0;

    pedidoTemporal.forEach((prod, index) => {
        total += prod.precio;
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; background: #f1f5f9; padding: 0.4rem 0.8rem; border-radius: 4px;';
        item.innerHTML = `
            <span><b>${prod.nombre}</b> ($${prod.precio.toFixed(2)})</span>
            <button type="button" onclick="quitarDelPedidoModal(${index})" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer;">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        productosSeleccionados.appendChild(item);
    });

    if (totalPedidoSpan) totalPedidoSpan.textContent = total.toFixed(2);
    revisarCuotas(total);
}

function revisarCuotas(total) {
    const radioCuotas = document.querySelector('input[name="tipoPago"]:checked');
    let esCuotas = radioCuotas ? radioCuotas.value === 'cuotas' : false;
    if (infoCuotas) {
        if (esCuotas && total > 0) {
            infoCuotas.style.display = 'block';
            if (montoCuotaSpan) montoCuotaSpan.textContent = (total / 2).toFixed(2);
        } else {
            infoCuotas.style.display = 'none';
        }
    }
}

radiosPago.forEach(radio => {
    radio.addEventListener('change', () => {
        revisarCuotas(parseFloat(totalPedidoSpan ? totalPedidoSpan.textContent : 0));
    });
});

function actualizarBadgeHistorial() {
    if (!historialBadge) return;
    if (pedidosNoVistos > 0) {
        historialBadge.textContent = pedidosNoVistos;
        historialBadge.style.display = 'inline-block';
    } else {
        historialBadge.style.display = 'none';
    }
}

if (formHacerPedido) {
    formHacerPedido.addEventListener('submit', (e) => {
        e.preventDefault();
        if (pedidoTemporal.length === 0) {
            alert("Debes añadir al menos un producto al pedido.");
            return;
        }
        
        const nombre = document.getElementById('clienteNombre').value.trim();
        const apellido = document.getElementById('clienteApellido').value.trim();
        const telefono = document.getElementById('clienteTelefono').value.trim();
        const total = parseFloat(totalPedidoSpan.textContent);
        const tipoPago = document.querySelector('input[name="tipoPago"]:checked').value;
        
        const nuevoPedido = {
            id: Date.now(),
            fecha: new Date().toLocaleString('es-VE'),
            nombre: nombre,
            apellido: apellido,
            telefono: telefono,
            items: [...pedidoTemporal],
            total: total,
            tipoPago: tipoPago,
            estadoPago: 'No pagado',
            estadoCuota1: 'No pagado', 
            estadoCuota2: 'No pagado'
        };
        
        pedidos.push(nuevoPedido);
        pedidosNoVistos++;
        guardarPedidosEnMemoria();
        actualizarBadgeHistorial();

        const listaNombres = pedidoTemporal.map(item => item.nombre).join(', ');
        let textoPago = tipoPago === 'cuotas' 
            ? `en 2 cuotas de $${(total / 2).toFixed(2)} cada una (Total: $${total.toFixed(2)})` 
            : `completo por $${total.toFixed(2)}`;

        const mensajeWhatsApp = `Yo ${nombre} ${apellido} quite ${listaNombres} lo cual pagare ${textoPago}, ESTAR PENDIENTE si?`;

        let tel = telefono.replace(/\D/g, '');
        if (tel.startsWith('0')) tel = '58' + tel.slice(1);
        else if (tel.length === 10 && !tel.startsWith('58')) tel = '58' + tel;

        window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensajeWhatsApp)}`, '_blank');

        pedidoTemporal = [];
        actualizarTotalesPedido();
        formHacerPedido.reset();
        if (pedidoModal) pedidoModal.style.display = 'none';
        if (infoCuotas) infoCuotas.style.display = 'none';
        
        alert("¡Pedido registrado exitosamente!");
    });
}

// --- 8. ANIMACIONES (PATITAS AZULES Y GATO MIAU) ---
if (logoPatita) {
    logoPatita.addEventListener('click', () => {
        lanzarPatitasAzules();
        mostrarGatoMiau();
    });
}

function lanzarPatitasAzules() {
    for (let i = 0; i < 25; i++) {
        const patita = document.createElement('i');
        patita.className = 'fa-solid fa-paw patita-animada';
        
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * (window.innerHeight * 0.8);
        
        const tx = (Math.random() - 0.5) * 350 + 'px';
        const ty = (Math.random() - 1) * 350 + 'px';
        const rot = (Math.random() - 0.5) * 360 + 'deg';
        const size = (Math.random() * 24 + 18) + 'px';

        patita.style.left = startX + 'px';
        patita.style.top = startY + 'px';
        patita.style.fontSize = size;
        patita.style.setProperty('--tx', tx);
        patita.style.setProperty('--ty', ty);
        patita.style.setProperty('--rot', rot);

        document.body.appendChild(patita);
        setTimeout(() => patita.remove(), 2000);
    }
}

function mostrarGatoMiau() {
    if (document.querySelector('.gato-contenedor')) return;

    const contenedor = document.createElement('div');
    contenedor.className = 'gato-contenedor';
    contenedor.innerHTML = `
        <div class="globo-miau">¡Miau! 🐾</div>
        <i class="fa-solid fa-cat gato-icono"></i>
    `;

    document.body.appendChild(contenedor);
    setTimeout(() => contenedor.remove(), 3000);
}

// --- INICIALIZACIÓN ---
cargarProductos();
actualizarBadgeHistorial();
