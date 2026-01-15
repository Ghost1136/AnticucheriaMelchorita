function actualizarCantidad(boton, cambio) {
            // Buscamos el contenedor padre (tarjeta-plato o div inmediato)
            const contenedor = boton.closest('.flex'); 
            const inputCantidad = contenedor.querySelector('.cantidad-numero');
            
            if (inputCantidad) {
                let cantidadActual = parseInt(inputCantidad.innerText);
                let nuevaCantidad = cantidadActual + cambio;
                if (nuevaCantidad < 1) nuevaCantidad = 1;
                inputCantidad.innerText = nuevaCantidad;
            }
        }

        // 3. Lógica para "Agregar al Carrito" (Simulada)
        function agregarAlCarrito(boton) {
            const tarjeta = boton.closest('.tarjeta-plato');
            
            if (tarjeta) {
                const nombre = tarjeta.querySelector('h4, h5').innerText;
                const cantidadElement = tarjeta.querySelector('.cantidad-numero');
                const cantidad = cantidadElement ? cantidadElement.innerText : 1;
                
                alert(`¡Listo! Agregaste ${cantidad} unidad(es) de: ${nombre} al carrito.`);
            } else {
                console.error("No se encontró la tarjeta del plato");
            }
        }