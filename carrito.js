let carrito = [];

// --- ABRIR/CERRAR CARRITO ---
function toggleCarrito() {
    const modal = document.getElementById('carrito-modal');
    const content = document.getElementById('carrito-content');
    
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            content.classList.remove('translate-x-full');
        }, 10);
    } else {
        content.classList.add('translate-x-full');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

// --- ACTUALIZAR CANTIDAD EN TARJETA (MENÚ) ---
function actualizarCantidad(btn, cambio) {
    const contenedor = btn.parentElement;
    const numeroElemento = contenedor.querySelector('.cantidad-numero');
    let cantidadActual = parseInt(numeroElemento.innerText);
    
    cantidadActual += cambio;
    if (cantidadActual < 1) cantidadActual = 1;
    
    numeroElemento.innerText = cantidadActual;
}

// --- AGREGAR PRODUCTO AL ARRAY ---
function agregarAlCarrito(btn) {
    // 1. Encontrar la tarjeta padre
    const tarjeta = btn.closest('.tarjeta-plato');
    
    // 2. Extraer info
    const nombre = tarjeta.querySelector('h4, h5').innerText;
    
    // Buscar precio
    let precioTexto = "";
    const elementos = tarjeta.getElementsByTagName('*');
    for (let el of elementos) {
        if (el.innerText.includes('S/') && el.children.length === 0) {
            precioTexto = el.innerText;
            break;
        }
    }
    const precio = parseFloat(precioTexto.replace('S/', '').replace(' ', ''));
    
    // Imagen
    let imagenSrc = '';
    const divImagen = tarjeta.querySelector('[style*="background-image"]');
    if (divImagen) {
        imagenSrc = divImagen.style.backgroundImage.slice(5, -2);
    } else {
        // Fallback para emojis
        const emoji = tarjeta.querySelector('.text-2xl');
        if(emoji) imagenSrc = 'emoji:' + emoji.innerText; 
    }

    const cantidadSeleccionada = parseInt(tarjeta.querySelector('.cantidad-numero').innerText);

    // 3. Añadir o Actualizar
    const productoExistente = carrito.find(item => item.nombre === nombre);

    if (productoExistente) {
        productoExistente.cantidad += cantidadSeleccionada;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precio,
            imagen: imagenSrc,
            cantidad: cantidadSeleccionada
        });
    }

    // 4. Reset y Vista
    tarjeta.querySelector('.cantidad-numero').innerText = "1";
    actualizarVistaCarrito();
    toggleCarrito(); 
}

// --- RENDERIZAR CARRITO EN HTML ---
function actualizarVistaCarrito() {
    const contenedorItems = document.getElementById('carrito-items');
    const totalElemento = document.getElementById('carrito-total');
    const contadorBurbuja = document.getElementById('cart-count');
    
    contenedorItems.innerHTML = '';
    let totalPrecio = 0;
    let totalItems = 0;

    if (carrito.length === 0) {
        contenedorItems.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        contadorBurbuja.classList.add('hidden');
    } else {
        carrito.forEach((producto, index) => {
            const subtotal = producto.precio * producto.cantidad;
            totalPrecio += subtotal;
            totalItems += producto.cantidad;

            let imgHTML = '';
            if(producto.imagen.startsWith('emoji:')) {
                imgHTML = `<div class="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-3xl shadow-sm">${producto.imagen.split(':')[1]}</div>`;
            } else {
                imgHTML = `<img src="${producto.imagen}" class="w-16 h-16 object-cover rounded-md shadow-sm">`;
            }

            const itemHTML = `
                <div class="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
                    <div class="flex items-center gap-3">
                        ${imgHTML}
                        <div>
                            <h4 class="text-sm font-bold text-negro line-clamp-1">${producto.nombre}</h4>
                            <p class="text-xs text-guinda font-bold">S/ ${producto.precio.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end gap-1">
                        <div class="flex items-center border border-gray-300 rounded-lg">
                            <button onclick="cambiarCantidadCarrito(${index}, -1)" class="px-2 text-gray-600 hover:bg-gray-100 font-bold text-xs py-1 rounded-l-lg">-</button>
                            <span class="px-2 text-xs font-bold w-4 text-center">${producto.cantidad}</span>
                            <button onclick="cambiarCantidadCarrito(${index}, 1)" class="px-2 text-guinda hover:bg-red-50 font-bold text-xs py-1 rounded-r-lg">+</button>
                        </div>
                        <button onclick="eliminarDelCarrito(${index})" class="text-xs text-red-500 hover:text-red-700 font-semibold">Eliminar</button>
                    </div>
                </div>
            `;
            contenedorItems.innerHTML += itemHTML;
        });

        contadorBurbuja.innerText = totalItems;
        contadorBurbuja.classList.remove('hidden');
    }

    totalElemento.innerText = `S/ ${totalPrecio.toFixed(2)}`;
}

// --- CAMBIAR CANTIDAD DESDE EL CARRITO ---
function cambiarCantidadCarrito(index, cambio) {
    const producto = carrito[index];
    producto.cantidad += cambio;

    if (producto.cantidad < 1) {
        carrito.splice(index, 1); 
    }

    actualizarVistaCarrito();
}

// --- ELIMINAR ITEM ---
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarVistaCarrito();
}

// --- WHATSAPP ---
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const numeroWhatsApp = "51956469567"; // Tu número

    // 1. Construimos el mensaje como texto normal (usando \n para saltos de línea)
    let mensaje = "Hola, Anticuchería Melchorita, quiero realizar este pedido:\n\n";

    let total = 0;
    carrito.forEach(prod => {
        const subtotal = prod.cantidad * prod.precio;
        total += subtotal;
        
        // Formato: * 2 Surtido #3 S/ 50.00
        mensaje += `* ${prod.cantidad} ${prod.nombre} --- S/ ${subtotal.toFixed(2)}\n`;
    });

    // Agregamos el total y la pregunta final
    mensaje += `\nSubTotal: S/ ${total.toFixed(2)}\n\n`;
    mensaje += "¿Cuánto tiempo tardará?";

    // 2. Codificamos TODO el mensaje para URL (esto arregla los símbolos raros)
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
}