const user = JSON.parse(localStorage.getItem('user')) || null; //* Obtener el usuario del localStorage

console.log(user.nombre);


//*ajustar info a user 

 function ajustarInfoUser(user) {
    
    const noUser = document.querySelector('.no-user-info');
    const tabInfo = document.querySelector('.tab-info');
    if (user) {
        tabInfo.innerHTML = `
        <h2 class="text-xl font-semibold mb-4">Información Básica</h2>
        <p><strong>Nombre:</strong> ${user.nombre}</p>
        <p><strong>Correo:</strong> ${user.email}</p>
        `;

        noUser.classList.add('hidden'); // Ocultar el mensaje de "No hay información del usuario"
    }
    if (user.rol === 'Admin') {
        tabInfo.innerHTML = `
        <h2 class="text-xl font-semibold mb-4">Información Básica</h2>
        <p><strong>Nombre:</strong> ${user.nombre}</p>
        <p><strong>Correo:</strong> ${user.email}</p>
        <button  class="bg-purple-800 hover:bg-purple-600 text-white p-2 mt-4 rounded-lg"> <a href="/admin">Administrar Tienda</a> </button>`;
    } 

}



 //* Cambiar de tab
 function cambiarTab(tab) {
    const tabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.profile-tab-content');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('border-purple-700', 'purple-700'));
            tab.classList.add('border-purple-700', 'text-purple-700');

            tabContents.forEach(content => content.classList.add('hidden'));
            tabContents[index].classList.remove('hidden');
            // If Pedidos tab is clicked, fetch pedidos
            if (tab.textContent.trim() === 'Pedidos') {
                userPedidos();
            }
        });
    }) 
 }


 async function userPedidos() {
    

    console.log(user.id, user.email);


    const response = axios.get(`/pedidos/pedidos-por-usuario/${user.id}`)
    .then(response => {
        const pedidos = response.data;
        console.log('Pedidos recibidos:', pedidos); // Log pedidos data for debugging
        mostrarPedidosUser(pedidos);
    }).catch(error => {
        console.error('Error al obtener los pedidos:', error);
        alert('Error al obtener los pedidos. Por favor, inténtelo de nuevo más tarde.');
    });

}

function mostrarPedidosUser(pedidos) {
    const pedidosContainer = document.getElementById('pedidos-container');
    pedidosContainer.innerHTML = '';
    // Sort pedidos from newest to oldest by fecha
    pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    pedidos.forEach((pedido, index) =>
        pedidosContainer.innerHTML += `
        <tr class="border ${pedido.estado.toLowerCase() === 'pagado' ? 'bg-green-300' : 'bg-gray-100'} hover:bg-gray-300">
            <td class="border border-gray-300 px-4 py-2 text-center"> 
            <button data-index="${index}" class="ver-pedido-btn hover:bg-purple-400 hover:text-black bg-purple-700 mx-4 mt-2 px-1 pt-1 justify-center items-center rounded-full text-white flex-column"> <ion-icon name="filter-circle-outline"></ion-icon> </button>
             ${pedido._id} </td>
            <td class="border border-gray-300 px-4 py-2 text-center">${pedido.fecha}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">${pedido.estado}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">${pedido.total}</td>
        </tr>
    `
    );

    // Attach event listeners to the buttons after rendering
    const buttons = pedidosContainer.querySelectorAll('.ver-pedido-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = button.getAttribute('data-index');
            mostrarDetallePedido(pedidos[idx]);
        });
    });
}

// Function to show the order detail card with pay button
function mostrarDetallePedido(pedido) {
    console.log('Pedido detalle:', pedido); // Log pedido object for debugging

    // Check if detail card already exists and remove it
    let existingCard = document.getElementById('detalle-pedido-card');
    if (existingCard) {
        existingCard.remove();
    }

    const productDetails = Array.isArray(pedido.products) ? pedido.products.map(prod => prod.id_producto?.nombre || prod.id_producto?.name || 'Nombre no disponible').join(', ') : 'No hay productos disponibles';

    // Create card element
    const card = document.createElement('div');
    card.id = 'detalle-pedido-card';
    card.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-400 rounded-lg shadow-lg p-6 w-96 z-50';

    card.innerHTML = `
        <h3 class="text-lg font-semibold mb-4">Detalle del Pedido</h3>
        <p><strong>ID:</strong> <span class="text-blue-600"> ${pedido._id}  </span> </p>
        <p><strong>Fecha:</strong> <span class="text-blue-600"> ${pedido.fecha} </span> </p>
        <p><strong>Estado:</strong> <span class="text-black-800 font-bold"> (${pedido.estado}) </span> </p>
        <p><strong>Total:</strong> <span class="text-red-800 font-bold"> $${pedido.total} </span> </p>
        <p><strong>Productos:</strong></p>
        <ul class="list-disc list-inside mb-4 bg-[#E1DAD3] rounded-lg p-2"> <span class="text-purple-800">
            ${Array.isArray(pedido.products) ? pedido.products.map(prod => `<li>${prod.id_producto?.nombre || prod.id_producto?.name || 'Nombre no disponible'} x${prod.cantidad}</li>`).join('') : '<li>No hay productos disponibles</li>'}
        </span></ul>
        ${pedido.estado.toLowerCase() === 'pagado' ? '' : '<button id="pagar-btn" action="/pay" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Pagar</button>'}
        <button id="cerrar-detalle-btn" class="ml-4 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cerrar</button>
    `;

    document.body.appendChild(card);

    // Add event listener to pay button if it exists
    const pagarBtn = document.getElementById('pagar-btn');
    if (pagarBtn) {
        pagarBtn.addEventListener('click', () => {
            const notification = document.querySelector('.notification');
            notification.textContent = 'Redirigiendo a PayPal...';
            notification.style.color = 'white';
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
                
            // Save pedido ID to localStorage for later use
            localStorage.setItem('pedidoId', pedido._id);
            }, 3000);
            
           

            // Here you can add actual payment logic
            axios.post('/paypal/order', {
                
                articulosCarrito: {
                    total: pedido.total,
                    items: pedido.products
                }
            })
            .then(response => {
               console.log(response.data);
               
               
               // ;
                console.log('Pedido actualizado:', pedido);
                console.log('Orden de PayPal creada:', response.data);
                
                window.location.href = response.data.approval_url; // Redirect to PayPal approval URL
                
                
            })
            .catch(error => {
                console.error('Error creando orden de PayPal:', error);
                alert('Error al procesar el pago. Intente nuevamente.');
            });
            // Redirect to payment page or handle payment logic
            // window.location.href = '/pay';
            
        });
    }

    // Add event listener to close button
    const cerrarBtn = document.getElementById('cerrar-detalle-btn');
    cerrarBtn.addEventListener('click', () => {
        card.remove();
    });
}




document.addEventListener('DOMContentLoaded', () => {
    
    cambiarTab();
    validateLocalStorageUser();
    ajustarInfoUser(user); // Llamar a la función para ajustar la información del usuario al cargar la página
});
