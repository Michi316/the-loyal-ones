// Memoria de Productos
let productos = JSON.parse(localStorage.getItem('inventarioTheLoyalOnes')) || [];

// Memoria para el Historial de Pedidos y Notificaciones
let pedidos = JSON.parse(localStorage.getItem('historialPedidosTheLoyalOnes')) || [];
let pedidosNoVistos = 0;

if (productos.length === 0) {
    productos = [
        { id: 1, codigo: "PER-01", nombre: "Perfume Elegance", precio: 25.00, imagen: "https://via.placeholder.com/200?text=Perfume", agotado: false },
        { id: 2, codigo: "SAB-01", nombre: "Sábana Matrimonial", precio: 15.00, imagen: "https://via.placeholder.com/200?text=Sabana", agotado: false }
    ];
    guardarEnMemoria();
}

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

// --- 1. MOSTRAR CATÁLOGO ---
function cargarProductos() {
    productGrid.innerHTML = ""; 
    productos.forEach(prod => {
        const esAgotado = prod.agotado || false;
        const card = document.createElement('div');
        card.className = `card ${esAgotado ? 'card-agotada' : ''}`;
        
        const badgeTexto = esAgotado ? 'Agotado ❌' : 'Disponible ✓';
        const badgeClase = esAgotado ? 'stock-agotado' : 'stock-disponible';
        const btnTexto = esAgotado ? 'Marcar como Disponible' : 'Marcar como Agotado';
        const btnClase = esAgotado ? 'marcar-disponible' : 'marcar-agotado';

        card.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}">
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

function guardarEnMemoria() { localStorage.setItem('inventarioTheLoyalOnes', JSON.stringify(productos)); }
function guardarPedidosEnMemoria() { localStorage.setItem('historialPedidosTheLoyalOnes', JSON.stringify(pedidos)); }

// Cambiar estado de stock (Disponible <-> Agotado)
window.cambiarEstadoStock = function(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        producto.agotado = !producto.agotado;
        guardarEnMemoria();
        cargarProductos();
    }
}

// --- 2. ABRIR Y CERRAR MODALES ---
dashboardBtn.addEventListener('click', () => { panelModal.style.display = 'flex'; });
closePanel.addEventListener('click', () => { panelModal.style.display = 'none'; });

btnHacerPedido.addEventListener('click', (e) => {
    e.preventDefault();
    pedidoModal.style.display = 'flex';
});
closePedido.addEventListener('click', () => { pedidoModal.style.display = 'none'; });

// Abrir Historial y limpiar el contador de notificaciones no leídas
btnVerHistorial.addEventListener('click', (e) => {
    e.preventDefault();
    cargarHistorialPedidos();
    historialModal.style.display = 'flex';
    pedidosNoVistos = 0;
    actualizarBadgeHistorial();
});
closeHistorial.addEventListener('click', () => { historialModal.style.display = 'none'; });

// Abrir Resumen de Ventas
btnResumen.addEventListener('click', (e) => {
    e.preventDefault();
    calcularResumenVentas();
    resumenModal.style.display = 'flex';
});
closeResumen.addEventListener('click', () => { resumenModal.style.display = 'none'; });

window.addEventListener('click', (e) => {
    if (e.target === panelModal) panelModal.style.display = 'none';
    if (e.target === pedidoModal) pedidoModal.style.display = 'none';
    if (e.target === historialModal) historialModal.style.display = 'none';
    if (e.target === resumenModal) resumenModal.style.display = 'none';
});

// --- 3. LÓGICA DE RESUMEN DE VENTAS (SOLO LO PAGADO) ---
function calcularResumenVentas() {
    let sumaTotalUSD = 0;
    
    pedidos.forEach(pedido => {
        if (pedido.tipoPago === 'cuotas') {
            let montoCuota = pedido.total / 2;
            if (pedido.estadoCuota1 === 'Pagado') sumaTotalUSD += montoCuota;
            if (pedido.estadoCuota2 === 'Pagado') sumaTotalUSD += montoCuota;
        } else {
            if (pedido.estadoPago === 'Pagado') {
                sumaTotalUSD += pedido.total;
            }
        }
    });
    
    totalVentasUSD.textContent = sumaTotalUSD.toFixed(2);
    calcularBolivares(sumaTotalUSD);
}

function calcularBolivares(dolares) {
    let tasa = parseFloat(tasaBCV.value) || 0;
    let bolivares = dolares * tasa;
    totalVentasVES.textContent = bolivares.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

tasaBCV.addEventListener('input', () => {
    let dolares = parseFloat(totalVentasUSD.textContent) || 0;
    calcularBolivares(dolares);
});

// --- 4. CARGAR, CAMBIAR ESTADO Y ELIMINAR EN HISTORIAL ---
function cargarHistorialPedidos() {
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

        let listaItems = pedido.items.map(i => `- ${i.nombre} ($${i.precio})`).join('<br>');
        let infoPago = pedido.tipoPago === 'cuotas' ? `En Cuotas (2 x $${(pedido.total/2).toFixed(2)})` : 'Pago Completo';

        let seccionBotones = "";
        
        if (pedido.tipoPago === 'cuotas') {
            let colorC1 = pedido.estadoCuota1 === 'Pagado' ? '#22c55e' : '#ef4444';
            let textoC1 = pedido.estadoCuota1 === 'Pagado' ? '✓ C1 Pagada' : '✗ C1 Pendiente';
            
            let colorC2 = pedido.estadoCuota2 === 'Pagado' ? '#22c55e' : '#ef4444';
            let textoC2 = pedido.estadoCuota2 === 'Pagado' ? '✓ C2 Pagada' : '✗ C2 Pendiente';

            seccionBotones = `
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button onclick="cambiarEstadoCuota(${pedido.id}, 1)" style="background: ${colorC1}; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 0.8rem; transition: background 0.3s;">
                        ${textoC1}
                    </button>
                    <button onclick="cambiarEstadoCuota(${pedido.id}, 2)" style="background: ${colorC2}; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 0.8rem; transition: background 0.3s;">
                        ${textoC2}
                    </button>
                </div>
            `;
        } else {
            let esPagado = pedido.estadoPago === 'Pagado';
            let colorBoton = esPagado ? '#22c55e' : '#ef4444';
            let textoBoton = esPagado ? '✓ Pagado' : '✗ No ha pagado';

            seccionBotones = `
                <button onclick="cambiarEstadoPago(${pedido.id})" style="background: ${colorBoton}; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 20px; font-weight: bold; cursor: pointer; transition: background 0.3s;">
                    ${textoBoton}
                </button>
            `;
        }

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                <span style="font-size: 0.85rem; color: #64748b; font-weight: bold;">${pedido.fecha}</span>
                <button onclick="eliminarPedido(${pedido.id})" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; transition: all 0.3s;" title="Eliminar Pedido">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <p><b>Cliente:</b> ${pedido.nombre} ${pedido.apellido}</p>
            <p><b>Teléfono:</b> ${pedido.telefono}</p>
            <p style="margin-top: 0.5rem;"><b>Productos llevados:</b><br>${listaItems}</p>
            <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <p style="font-size: 1.1rem; color: var(--azul-oscuro); margin: 0;">
                    <b>Total a cobrar:</b> $${pedido.total.toFixed(2)} <span style="font-size: 0.85rem; color: #64748b;">(${infoPago})</span>
                </p>
                ${seccionBotones}
            </div>
        `;
        listaPedidos.appendChild(div);
    });
}

// Cambiar estado de pago completo
window.cambiarEstadoPago = function(id) {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
        pedido.estadoPago = (pedido.estadoPago === 'Pagado') ? 'No pagado' : 'Pagado';
        guardarPedidosEnMemoria();
        cargarHistorialPedidos();
    }
}

// Cambiar estado de cuotas individuales
window.cambiarEstadoCuota = function(id, numCuota) {
    const pedido = pedidos.find(p => p.id === id);
    if (pedido) {
        if (numCuota === 1) {
            pedido.estadoCuota1 = (pedido.estadoCuota1 === 'Pagado') ? 'No pagado' : 'Pagado';
        } else if (numCuota === 2) {
            pedido.estadoCuota2 = (pedido.estadoCuota2 === 'Pagado') ? 'No pagado' : 'Pagado';
        }
        guardarPedidosEnMemoria();
        cargarHistorialPedidos();
    }
}

// Eliminar un pedido del historial
window.eliminarPedido = function(id) {
    if(confirm("¿Estás segura de que deseas eliminar este pedido del historial?")) {
        pedidos = pedidos.filter(p => p.id !== id);
        guardarPedidosEnMemoria();
        cargarHistorialPedidos();
    }
}

// --- 5. PANEL DE CONTROL: AGREGAR Y ELIMINAR PRODUCTOS ---
document.getElementById('codigoProd').addEventListener('input', e => prevCodigo.textContent = "Código: " + (e.target.value.toUpperCase() || "---"));
document.getElementById('nombreProd').addEventListener('input', e => prevNombre.textContent = e.target.value || "Nombre del producto");
document.getElementById('precioProd').addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    prevPrecio.textContent = isNaN(val) ? "$0.00" : "$" + val.toFixed(2);
});
document.getElementById('imagenProd').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = evento => prevImg.src = evento.target.result;
    if (this.files[0]) reader.readAsDataURL(this.files[0]);
});

formProducto.addEventListener('submit', function(e) {
    e.preventDefault();
    const codigo = document.getElementById('codigoProd').value.toUpperCase();
    const nombre = document.getElementById('nombreProd').value;
    const precio = parseFloat(document.getElementById('precioProd').value);
    const inputImagen = document.getElementById('imagenProd');

    if (productos.some(p => p.codigo === codigo)) return alert("Ese código ya existe.");

    const reader = new FileReader();
    reader.onload = function(evento) {
        productos.push({ id: Date.now(), codigo: codigo, nombre: nombre, precio: precio, imagen: evento.target.result, agotado: false });
        guardarEnMemoria();
        cargarProductos();
        formProducto.reset();
        prevImg.src = "https://via.placeholder.com/200?text=Sube+tu+foto";
        prevCodigo.textContent = "Código: ---"; prevNombre.textContent = "Nombre del producto"; prevPrecio.textContent = "$0.00";
    };
    if (inputImagen.files[0]) reader.readAsDataURL(inputImagen.files[0]);
});

formEliminar.addEventListener('submit', function(e) {
    e.preventDefault();
    const codigoBuscado = document.getElementById('codigoEliminar').value.toUpperCase();
    const productoEncontrado = productos.find(p => p.codigo === codigoBuscado);
    if (productoEncontrado) {
        if(confirm(`¿Borrar: ${productoEncontrado.nombre}?`)) {
            productos = productos.filter(p => p.codigo !== codigoBuscado);
            guardarEnMemoria(); cargarProductos(); formEliminar.reset(); alert("¡Eliminado!");
        }
    } else alert("No se encontró el código: " + codigoBuscado);
});

// --- 6. LÓGICA DE "HACER PEDIDO", NOTIFICACIONES Y ENVÍO A WHATSAPP ---
const buscadorProducto = document.getElementById('buscadorProducto');
const resultadosBusqueda = document.getElementById('resultadosBusqueda');
const productosSeleccionados = document.getElementById('productosSeleccionados');
const totalPedidoSpan = document.getElementById('totalPedido');
const infoCuotas = document.getElementById('infoCuotas');
const montoCuotaSpan = document.getElementById('montoCuota');
const radiosPago = document.getElementsByName('tipoPago');
const formHacerPedido = document.getElementById('formHacerPedido');

let pedidoTemporal = []; 

buscadorProducto.addEventListener('input', (e) => {
    const termino = e.target.value.toLowerCase();
    resultadosBusqueda.innerHTML = '';
    if(termino === '') return;
    
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
            ? `<button type="button" disabled style="padding: 0.4rem; margin-top: 0.5rem; font-size: 0.8rem; background: #94a3b8; border: none; border-radius: 4px; color: white; cursor: not-allowed; width: 100%;">Agotado</button>`
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

window.agregarAlPedidoModal = function(id) {
    const producto = productos.find(p => p.id === id);
    if (producto.agotado) {
        alert("Este producto está agotado.");
        return;
    }
    pedidoTemporal.push(producto);
    actualizarTotalesPedido();
    buscadorProducto.value = '';
    resultadosBusqueda.innerHTML = ''; 
}

window.quitarDelPedidoModal = function(index) {
    pedidoTemporal.splice(index, 1);
    actualizarTotalesPedido();
}

function actualizarTotalesPedido() {
    productosSeleccionados.innerHTML = '';
    let total = 0;

    pedidoTemporal.forEach((prod, index) => {
        total += prod.precio;
        const item = document.createElement('div');
        item.className = 'inventory-item';
        item.style.marginBottom = '0.5rem';
        item.innerHTML = `
            <span><b>${prod.nombre}</b> ($${prod.precio.toFixed(2)})</span>
            <button type="button" onclick="quitarDelPedidoModal(${index})" class="btn-eliminar-small" style="padding: 0.2rem 0.5rem;"><i class="fa-solid fa-xmark"></i></button>
        `;
        productosSeleccionados.appendChild(item);
    });

    totalPedidoSpan.textContent = total.toFixed(2);
    revisarCuotas(total);
}

function revisarCuotas(total) {
    let esCuotas = document.querySelector('input[name="tipoPago"]:checked').value === 'cuotas';
    if (esCuotas && total > 0) {
        infoCuotas.style.display = 'block';
        montoCuotaSpan.textContent = (total / 2).toFixed(2);
    } else {
        infoCuotas.style.display = 'none';
    }
}

radiosPago.forEach(radio => {
    radio.addEventListener('change', () => {
        revisarCuotas(parseFloat(totalPedidoSpan.textContent));
    });
});

function actualizarBadgeHistorial() {
    if (pedidosNoVistos > 0) {
        historialBadge.textContent = pedidosNoVistos;
        historialBadge.style.display = 'inline-block';
    } else {
        historialBadge.style.display = 'none';
    }
}

// --- REGISTRO Y ENVÍO AUTOMÁTICO A WHATSAPP ---
formHacerPedido.addEventListener('submit', (e) => {
    e.preventDefault();
    if(pedidoTemporal.length === 0) {
        alert("Debes añadir al menos un producto al pedido.");
        return;
    }
    
    const nombre = document.getElementById('clienteNombre').value.trim();
    const apellido = document.getElementById('clienteApellido').value.trim();
    const telefono = document.getElementById('clienteTelefono').value.trim();
    const total = parseFloat(totalPedidoSpan.textContent);
    const tipoPago = document.querySelector('input[name="tipoPago"]:checked').value;
    
    // Guardar el pedido en el historial interno
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
    guardarPedidosEnMemoria();
    
    pedidosNoVistos++;
    actualizarBadgeHistorial();

    // --- CONSTRUCCIÓN DEL MENSAJE DE WHATSAPP ---
    const listaProductos = pedidoTemporal.map(item => item.nombre).join(', ');
    
    let textoPago = "";
    if (tipoPago === 'cuotas') {
        const cuotaIndividual = (total / 2).toFixed(2);
        textoPago = `en 2 cuotas de $${cuotaIndividual} cada una (Total: $${total.toFixed(2)})`;
    } else {
        textoPago = `completo por $${total.toFixed(2)}`;
    }

    const mensajeWhatsApp = `Yo ${nombre} ${apellido} quite ${listaProductos} lo cual pagare ${textoPago}, ESTAR PENDIENTE si?`;

    // --- CORRECCIÓN AUTOMÁTICA DEL NÚMERO DE TELÉFONO ---
    let telefonoLimpio = telefono.replace(/\D/g, ''); // Deja solo los dígitos

    // Si empieza con 0 (ej: 04121234567), le quita el 0 y le añade el 58
    if (telefonoLimpio.startsWith('0')) {
        telefonoLimpio = '58' + telefonoLimpio.slice(1);
    } 
    // Si meten el número directo sin el 0 y tiene 10 dígitos (ej: 4121234567)
    else if (telefonoLimpio.length === 10 && !telefonoLimpio.startsWith('58')) {
        telefonoLimpio = '58' + telefonoLimpio;
    }

    // Creación de la URL usando el protocolo universal wa.me
    const urlWhatsApp = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensajeWhatsApp)}`;
    
    // Abre el chat directo con el mensaje listo
    window.open(urlWhatsApp, '_blank');

    // Resetear formulario y cerrar modal
    pedidoTemporal = [];
    actualizarTotalesPedido();
    formHacerPedido.reset();
    pedidoModal.style.display = 'none';
    infoCuotas.style.display = 'none';
    
    alert("¡Pedido registrado exitosamente!");
});

// --- 7. ANIMACIÓN AL HACER CLIC EN EL LOGO ---
if (logoPatita) {
    logoPatita.addEventListener('click', () => {
        lanzarPatitasAzules();
        mostrarGatoMiau();
    });
}

function lanzarPatitasAzules() {
    const cantidad = 25;
    for (let i = 0; i < cantidad; i++) {
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

// Iniciar app
cargarProductos();