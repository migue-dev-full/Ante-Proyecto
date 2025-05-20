

//*definir las variables o selectores
const carrito = document.querySelector('.carrito');
const listaProductos = document.querySelector('.lista-productos');
const listaDestacados = document.querySelector('.lista-destacados');
const contenedorCarrito = document.querySelector('.lista-carrito tbody');
const eliminarItemBtn = document.querySelector('.eliminar-item-carrito');
const subtotal = document.querySelector('.subtotal')
const total = document.querySelector('.total')

let articulosCarrito = []

// Load cart from localStorage on script load
document.addEventListener('DOMContentLoaded', () => {
    const storedCart = localStorage.getItem('articulosCarrito');
    if (storedCart) {
        articulosCarrito = JSON.parse(storedCart);
        carritoHTML();
    }
});

cargarEventListener();
function cargarEventListener(){

     //click al boton agregar al carrito 
     if (listaProductos) {
         listaProductos.addEventListener('click', agregarProductos);
     }
     if (listaDestacados) {
         listaDestacados.addEventListener('click', agregarProductos);
     }

     carrito.addEventListener('click', eliminarProducto);

     // Add event listener for quantity buttons in cart
     carrito.addEventListener('click', function(e) {
         if (e.target.classList.contains('btn-increase')) {
             const id = e.target.getAttribute('data-id');
             aumentarCantidad(id);
         } else if (e.target.classList.contains('btn-decrease')) {
             const id = e.target.getAttribute('data-id');
             disminuirCantidad(id);
         }
     });

     // Add event listener for "Crear orden" button
     document.addEventListener('DOMContentLoaded', () => {
         const btnCrearOrden = document.getElementById('btn-crear-orden');
         if (btnCrearOrden) {
             btnCrearOrden.addEventListener('click', mostrarCrearOrden);
         }
     });

}




//*Agregar al carrito

function agregarProductos(e){
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user')) || null;
    if(!user){
        restrictAccess();
        return;
    }


    if(e.target.classList.contains('agregar-carrito')){
       console.log('Producto element:', e.target.parentElement.parentElement.parentElement);
       
        const producto = e.target.parentElement.parentElement.parentElement;
        console.log(producto)

        leerDatosProducto(producto);
        guardarCarritoLocalStorage();

        const notificacion = document.querySelector('.notification');
        notificacion.textContent = 'Producto agregado al carrito.';
        notificacion.style.color = 'white';
        notificacion.style.display = 'block';
        notificacion.classList.add('z-[1000]');
        setTimeout(() => {
            notificacion.style.display = 'none';
        }, 3000);

    }
}



//*Obtener los datos del producto
function leerDatosProducto(producto){
    console.log(producto)
    const infoProducto ={
        imagen: producto.querySelector('.img').src,
        titulo: producto.querySelector('.titulo').textContent,
        precio: producto.querySelector('.precio span').textContent,
        descripcion: producto.querySelector('.descripcion').textContent,
        id:producto.querySelector('button').getAttribute('data-id'),
        cantidad:1
    }
    
    console.log(infoProducto)

    const existe = articulosCarrito.some(producto => producto.id === infoProducto.id);

    if(existe){
        const productos = articulosCarrito.map(producto =>{
            if(producto.id === infoProducto.id){
                producto.cantidad++;
                return producto;
            }else{
                return producto;
            }         
        })

        articulosCarrito = [...productos]
    }else{
        articulosCarrito = [...articulosCarrito, infoProducto]
    }

    carritoHTML();
}

//* Crear rows del carrito con la info del los productos
function carritoHTML(){
    //sincronizarLS();

    // Clear previous content to avoid duplicates
    contenedorCarrito.innerHTML = '';

    articulosCarrito.forEach(producto => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><img class=" w-full border-3 border-white rounded-lg m-3 md:w-13 : md:h-20 object-cover" src="${producto.imagen}" alt></td>
            <td><h1 class="text-white m-3">${producto.titulo}</h1></td>
            <td><h1 class="text-white">${producto.precio}</h1></td>
            <td class="gap-2 text-white ml-2">
                <button class="btn-decrease bg-gray-600 mr-2 hover:bg-gray-700 text-white font-bold px-2 rounded" data-id="${producto.id}">-</button>
                <span class="mr-2">${producto.cantidad}</span>
                <button class="btn-increase bg-gray-600 hover:bg-gray-700 text-white font-bold px-2 rounded" data-id="${producto.id}">+</button>
            </td>
            <td><h1 class="text-white mr-2">${producto.precio * producto.cantidad}</h1></td>
            <td><button  data-id=${producto.id} class="eliminar-item-carrito bg-red-600 hover:bg-red-700 text-white font-bold p-1 w-6 h-6  rounded"><ion-icon name="close"></ion-icon></button></td>
        `;

        contenedorCarrito.appendChild(row);
    });

    calcularSubtotal();
    calcularTotal();
    guardarCarritoLocalStorage();
}
//* Calcular Subtotal
function calcularSubtotal(){
    if (articulosCarrito.length < 1){
        subtotal.innerHTML = 'Total: $0.00';
    }

    let suma = 0;
    articulosCarrito.forEach(producto => {
        // Convert precio to float for calculation, remove any currency symbols if needed
        let precioNum = parseFloat(producto.precio)  //.replace(/[^0-9.,]/g, ''))
        if (isNaN(precioNum)) precioNum = 0;
        suma += precioNum * producto.cantidad;
    });
    
    subtotal.innerHTML ='Subtotal: $' + suma;
    return suma;
}

//* Calcular Total
function calcularTotal(){
    if (articulosCarrito.length < 1){
        total.innerHTML = 'Total: $0.00';
    }


    const envio = 10;
    const subtotalValue = calcularSubtotal();
    let totalValue = 0;
    if(subtotalValue > 0){
        totalValue = subtotalValue + envio;
    }else{
        totalValue = 0;
    }
    total.innerHTML = 'Total: $' + totalValue;
}


function aumentarCantidad(id) {
    articulosCarrito = articulosCarrito.map(producto => {
        if (producto.id === id) {
            producto.cantidad++;
        }
        return producto;
    });
    carritoHTML();
}

function disminuirCantidad(id) {
    articulosCarrito = articulosCarrito.map(producto => {
            if(producto.id === id){
                if(producto.cantidad > 1){
                    producto.cantidad--;
                    return producto;
                } else {
                    return null; // Mark for removal
                }
            } else {
                return producto;
            }
        }).filter(producto => producto !== null);
    carritoHTML();
}

//* Eliminar Producto
function eliminarProducto(e){
    e.preventDefault();

    // Get the button element that was clicked (in case the icon inside the button was clicked)
    let target = e.target;
    while (target && !target.classList.contains('eliminar-item-carrito')) {
        target = target.parentElement.parentElement;
    }
    if (!target) return; // If no button found, exit

    const idProducto = target.getAttribute('data-id');
    console.log('Eliminar producto id:', idProducto);

    const existe = articulosCarrito.some(producto => producto.id === idProducto);

    if(existe){
        articulosCarrito = articulosCarrito.map(producto => {
            if(producto.id === idProducto){
                if(producto.cantidad > 1){
                    producto.cantidad--;
                    return producto;
                } else {
                    return null; // Mark for removal
                }
            } else {
                return producto;
            }
        }).filter(producto => producto !== null);
    }

    carritoHTML();
}

// Save cart to localStorage
function guardarCarritoLocalStorage() {
    localStorage.setItem('articulosCarrito', JSON.stringify(articulosCarrito));
}



//*crear orden
const crearOrden = document.querySelector('.crear-orden');

crearOrden.addEventListener('click', mostrarCrearOrden);


function mostrarCrearOrden(e){
    

    // Check if modal already exists, remove it
    const existingModal = document.querySelector('#orden-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};

    // Calculate subtotal and total with shipping
    const shippingCost = 10;
    let subtotalValue = 0;
    articulosCarrito.forEach(producto => {
        let precioNum = parseFloat(producto.precio);
        if (isNaN(precioNum)) precioNum = 0;
        subtotalValue += precioNum * producto.cantidad;
    });
    const totalValue = subtotalValue > 0 ? subtotalValue + shippingCost : 0;

    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'orden-modal';
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-70', 'flex', 'justify-center', 'items-center', 'z-50');

    // Modal content
    modal.innerHTML = `
        <div class="bg-white rounded-lg w-11/12 max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button id="close-modal" class="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold">&times;</button>
            <h2 class="text-2xl font-bold mb-4">Crear Orden</h2>
            
            <section class="mb-4">
                <h3 class="font-semibold mb-2">Datos del Usuario</h3>
                <p><strong>Nombre:</strong> ${user.nombre || ''}</p>
                <p><strong>Email:</strong> ${user.email || ''}</p>
               
            </section>

            <section class="mb-4">
                <h3 class="font-semibold mb-2">Descripción de la Orden</h3>
                <div class="overflow-auto max-h-40 border border-gray-300 rounded p-2">
                    <ul>
                        ${articulosCarrito.map(producto => `
                            <li class="mb-1">
                                ${producto.titulo} - Cantidad: ${producto.cantidad} - Precio unitario: $${producto.precio} - Total: $${(parseFloat(producto.precio) * producto.cantidad)}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </section>

            <section class="mb-4">
                <h3 class="font-semibold mb-2">Dirección de Envío</h3>
                <form id="direccion-envio-form" class="space-y-2">
                    <input type="text" id="calle" name="calle" placeholder="Calle y número" class="w-full border border-gray-300 rounded px-3 py-2" required />
                    <input type="text" id="ciudad" name="ciudad" placeholder="Ciudad" class="w-full border border-gray-300 rounded px-3 py-2" required />
                    <input type="text" id="codigo-postal" name="codigo-postal" placeholder="Código Postal" class="w-full border border-gray-300 rounded px-3 py-2" required />
                    <input type="text" id="pais" name="pais" placeholder="País" class="w-full border border-gray-300 rounded px-3 py-2" required />
                </form>
            </section>

            <section class="mb-4">
                <h3 class="font-semibold mb-2">Resumen de Pago</h3>
                <p>Subtotal: $${subtotalValue}</p>
                <p>Envío: $${shippingCost}</p>
                <p class="font-bold">Total a pagar: $${totalValue}</p>
            </section>

            <button id="guardar-orden-btn" class="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded w-full">Guardar Orden</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal event
    document.getElementById('close-modal').addEventListener('click', () => {
        modal.remove();
    });

    // Save order button event
    document.getElementById('guardar-orden-btn').addEventListener('click', () => {
        const form = document.getElementById('direccion-envio-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const direccionEnvio = {
            calle: form.calle.value,
            ciudad: form.ciudad.value,
            codigoPostal: form['codigo-postal'].value,
            pais: form.pais.value
        };

        // Prepare order data
        const orderData = {
            user: user,
            productos: articulosCarrito,
            direccionEnvio: direccionEnvio,
            subtotal: subtotalValue,
            envio: shippingCost,
            total: totalValue
        };

        console.log('Orden a guardar:', orderData);

        // Send orderData to backend via axios POST request
        axios.post('/pedidos/crear-pedido', orderData)
            .then(response => {
                
                const notificacion = document.querySelector('.notification');
                notificacion.textContent = 'Orden creada correctamente.';
                notificacion.style.color = 'white';
                notificacion.style.display = 'block';
                notificacion.style.zIndex = '1000';
                setTimeout(() =>
                    notificacion.style.display = 'none', 3000);
                form.reset();
                articulosCarrito = []; // Clear the cart
                contenedorCarrito.innerHTML = ''; // Clear the cart display
               
                calcularSubtotal();
                calcularTotal();
                modal.remove();
            })

            
            .catch(error => {
                console.error('Error al crear la orden:', error);
                notificacion.textContent = 'Error al crear la orden.';
                notificacion.style.color = 'red';   
                notificacion.style.display = 'block';
                notificacion.style.zIndex = '1000';
                setTimeout(() =>
                    notificacion.style.display = 'none', 3000);
            });
            

      

       
    });
}
            