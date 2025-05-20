const notification = document.querySelector('.notification');

//* Toggle mobile menu btn
document.getElementById('mobile-menu-button')?.addEventListener('click', function() {
    const nav = document.querySelector('nav');
    nav.classList.toggle('hidden');
    nav.classList.toggle('block');
});

//* Mostrar secciones
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    
    // Update active tab styling
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active-tab');
    });
    event.currentTarget.classList.add('active-tab');

    if (sectionId === 'orders') {
        loadOrders();
    }
}

//* Toggle ordenes
function toggleOrderDetails(button) {
    const row = button.closest('tr').nextElementSibling;
    if (row && row.classList.contains('order-details')) {
        row.classList.toggle('hidden');
    } else {
        const orderId = button.dataset.orderId;
        const order = loadedOrders.find(o => o._id === orderId);
        if (!order) return;

        const orderDetailsRow = document.createElement('tr');
        orderDetailsRow.classList.add('order-details');
        const orderDetailsCell = document.createElement('td');
        orderDetailsCell.colSpan = button.closest('tr').children.length;

        // Build product details string
        const productDetails = order.products.map(p => `${p.id_producto.nombre || p.id_producto} (${p.cantidad})`).join(', ');
        
        orderDetailsCell.innerHTML = `
            <div class="order-details-content bg-gray-700 p-4 rounded  border-blue-600 border-2">
                <p class="text-blue-400"><strong>Productos:</strong> <span class="text-white" >${productDetails}</span> </p>
                <p class="text-blue-400"><strong>Total:</strong> <span class="text-green-400" >(${order.total})</span>$</p>
                <p class="text-blue-400"><strong>Dirección de envío:  </strong><span class="text-white" >${order.address}</span> , Código Postal: <span class="text-white">${order.postal_code}</span> </p>
                <p class="text-blue-400" ><strong>Estado:</strong> <span class="${order.estado.toLowerCase() === 'pagado' ? 'text-green-400' : 'text-white'}" >${order.estado}</span></p>
            </div>
        `;
        orderDetailsRow.appendChild(orderDetailsCell);
        button.closest('tr').after(orderDetailsRow);
    }
}

//* Obtener lista de usuarios desde la base de datos
function fullUsersList () {  
    axios.get('/user/lista-users')
    .then(response => {
        mostrarUsuarios(response.data.data);
    })
    .catch(error => {
        console.error('Error al obtener los usuarios:', error);
    })
}


//* Mostrar usuarios en la tabla del admin */
function mostrarUsuarios(usuarios) {   
    const userList = document.querySelector('.lista-usuarios-admin');
    userList.innerHTML = '';
    usuarios.forEach(usuario => {
        const newRow = document.createElement('tr');
        newRow.dataset.userid = usuario.id; // Store user ID in data attribute
        newRow.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${usuario.nombre}</td>
        <td class="px-6 py-4 whitespace-nowrap">${usuario.email}</td>
        <td class="px-6 py-4 whitespace-nowrap">${usuario.rol}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <button onclick="toggleUserRole(this)" class="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
                Rol
            </button>
        </td>
        `; //* Agregar los usuarios de la base de datos a la tabla
        userList.appendChild(newRow); 
    });
}    


//* Toggle rol de usuario 
async function toggleUserRole(button) {
    const row = button.closest('tr');
    const roleCell = row.querySelector('td:nth-child(3)');
    const userId = row.dataset.userid;
    const newRole = roleCell.textContent === 'Cliente' ? 'Admin' : 'Cliente';

    try {
        const response = await axios.put(`/user/update-role/${userId}`, { rol: newRole });
        if (response.status === 200) {
            roleCell.textContent = newRole;
            if (newRole === 'Admin') {
                button.textContent = 'Hacer Cliente';
                button.classList.replace('bg-purple-600', 'bg-gray-600');

            } else {
                button.textContent = 'Hacer Admin';
                button.classList.replace('bg-gray-600', 'bg-purple-600');
            }
            
        } else {
            alert('Error al actualizar el rol. Por favor, inténtelo de nuevo.');
        }
    } catch (error) {
        console.error('Error al actualizar el rol:', error);
        alert('Error al actualizar el rol. Por favor, inténtelo de nuevo.');
    }
}

//* Modal para agregar o editar productos
let currentEditProductId = null;
let loadedProducts = [];

function openProductModal(mode = 'add', product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');

    if (mode === 'edit' && product) {
        document.getElementById('modal-title').textContent = 'Editar Producto';
        document.getElementById('product-submit').textContent = 'Actualizar Producto';

        // Do not set file input value programmatically
        // document.getElementById('productImage').value = product.imagen || '';
        document.getElementById('productName').value = product.nombre || '';
        document.getElementById('productDescription').value = product.descripcion || '';
        document.getElementById('productPrice').value = product.precio || '';
        document.getElementById('productCategory').value = product.categoria || '';

        currentEditProductId = product.id || product._id || null;

        // Remove createProduct submit handler and add editProduct submit handler
        form.removeEventListener('submit', createProductSubmitHandler);
        form.addEventListener('submit', editProductSubmitHandler);
    } else {
        document.getElementById('modal-title').textContent = 'Añadir Producto';
        document.getElementById('product-submit').textContent = 'Guardar Producto';
        form.reset();
        currentEditProductId = null;

        // Remove editProduct submit handler and add createProduct submit handler
        form.removeEventListener('submit', editProductSubmitHandler);
        form.addEventListener('submit', createProductSubmitHandler);
    }
    modal.classList.remove('hidden');
}

//* Cerrar modal
function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

let createProductSubmitHandler;
function createProduct() {
    const form = document.getElementById('product-form');

    if (createProductSubmitHandler) {
        form.removeEventListener('submit', createProductSubmitHandler);
    }

    createProductSubmitHandler = async function handleSubmit(e) {
        e.preventDefault();

        // Collect form values
        const nombre = document.getElementById('productName').value;
        const descripcion = document.getElementById('productDescription').value;
        const precio = document.getElementById('productPrice').value;
        const categoria = document.getElementById('productCategory').value;
        const imagenFile = document.getElementById('productImage').files[0];

        //* Validar campos 
        if (!nombre || !descripcion || !precio || !categoria) {
            alert('Por favor, complete todos los campos obligatorios.');
            return;
        }

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('precio', precio);
        formData.append('categoria', categoria);
        if (imagenFile) {
            formData.append('imagen', imagenFile);
        }

        try {
            const response = await axios.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Producto creado:', response.data);
            const notification = document.querySelector('.notification');
                notification.textContent = 'Producto creado exitosamente';
                 notification.style.color = 'white';   
                 notification.style.display = 'block';
                notification.style.zIndex = '1000';
                setTimeout(() => {
                    notification.style.display = 'none';
                }
                , 3000);
                
            
            //* Añadir el nuevo producto a la lista de productos
            const productList = document.getElementById('product-list');
            const productoCreado = response.data.producto;

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><img src="${productoCreado.imagen}" alt="${productoCreado.nombre}" class="w-16 h-16 object-cover"></td>
                <td class="px-6 py-4 whitespace-nowrap">${productoCreado.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap">${productoCreado.precio}</td>
                <td class="px-6 py-4 whitespace-nowrap">${productoCreado.descripcion}</td>
                <td class="px-6 py-4 whitespace-nowrap">${productoCreado.categoria}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="openProductModal('edit')" class="text-purple-600 hover:text-purple-900 mr-3">Editar</button>
                    <button  class="delete-btn text-red-600 hover:text-red-900">Eliminar</button>
                 </td>
            `;

            productList.appendChild(newRow); //* Agregar el nuevo producto a la lista

            form.reset(); //* Vaciar el formulario después de crear el producto
            closeModal(); //* Cerrar el modal
        } catch (error) {
            console.error('Error al crear el producto:', error);
            alert('Error al crear el producto. Por favor, inténtelo de nuevo más tarde.');
        }
    };

    form.addEventListener('submit', createProductSubmitHandler);
}

let editProductSubmitHandler;
function editProduct() {
    const form = document.getElementById('product-form');

    if (editProductSubmitHandler) {
        form.removeEventListener('submit', editProductSubmitHandler);
    }

    editProductSubmitHandler = async function handleEditSubmit(e) {
        e.preventDefault();

        // Collect form values
        const nombre = document.getElementById('productName').value;
        const descripcion = document.getElementById('productDescription').value;
        const precio = document.getElementById('productPrice').value;
        const categoria = document.getElementById('productCategory').value;
        const imagenFile = document.getElementById('productImage').files[0];

        if (!nombre || !descripcion || !precio || !categoria) {
            alert('Por favor, complete todos los campos obligatorios.');
            return;
        }

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('precio', precio);
        formData.append('categoria', categoria);
        if (imagenFile) {
            formData.append('imagen', imagenFile);
        }

        try {
           //* GUARDAR EN LA BASE DE DATOS
           const response = await axios.put(`/products/${currentEditProductId}`, formData, {
               headers: {
                   'Content-Type': 'multipart/form-data'
               }
           });
           if (response.status === 200) {
               console.log('Producto editado:', response.data);
               notification.textContent = 'Producto editado exitosamente';
               notification.style.color = 'white';
                notification.style.display = 'block';
                notification.style.zIndex = '1000';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 3000);
              
           } else {
               alert('Error al editar el producto. Por favor, inténtelo de nuevo.');
           }

            const productoActualizado = response.data.producto; // Assuming the response contains the updated product
            const productRow = document.querySelector(`tr[data-productid="${productoActualizado.id}"]`); // Find the row to update

            if (productRow) {
                productRow.querySelector('td:nth-child(2)').textContent = productoActualizado.nombre;
                productRow.querySelector('td:nth-child(3)').textContent = productoActualizado.precio;
                productRow.querySelector('td:nth-child(4)').textContent = productoActualizado.descripcion;
                productRow.querySelector('td:nth-child(5)').textContent = productoActualizado.categoria;
                productRow.querySelector('img').src = productoActualizado.imagen; // Update image source
            }
             
            
            form.reset(); //* Vaciar el formulario después de editar el producto
            closeModal(); //* Cerrar el modal
            currentEditProductId = null;
        } catch (error) {

            console.error('Error al editar el producto:', error);
            
            alert('Error al editar el producto. Por favor, inténtelo de nuevo más tarde.');
        }
        
    };

    form.addEventListener('submit', editProductSubmitHandler);
}



//* Obtener listado de productos desde la base de datos
function fullProductsList () {  
    axios.get('/products/lista-products')
    .then(response => {
        mostarProductos(response.data);
    })
    .catch(error => {
        console.error('Error al obtener los productos:', error);
        alert('Error al obtener los productos. Por favor, inténtelo de nuevo más tarde.');
    })
}

//* Mostrar productos en la tabla del admin */
function mostarProductos(productos) {   
    loadedProducts = productos; // Store loaded products globally
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Clear existing products
    
    productos.forEach(producto => {
        const newRow = document.createElement('tr');
        newRow.dataset.productid = producto.id || producto._id || ''; // Store product id in data attribute
        newRow.innerHTML = `
        <td><img src="${producto.imagen}" alt="${producto.nombre}" class="w-16 h-16 object-cover"></td>
        <td class="px-6 py-4 whitespace-nowrap">${producto.nombre}</td>
        <td class="px-6 py-4 whitespace-nowrap">${producto.precio}</td>
        <td class="px-6 py-4 whitespace-nowrap">${producto.descripcion}</td>
        <td class="px-6 py-4 whitespace-nowrap">${producto.categoria}</td>
        <td class="px-6 py-4 whitespace-nowrap">
        <button class="edit-btn text-purple-600 hover:text-purple-900 mr-3" data-id="${producto.id || producto._id}">Editar</button>
        <button class="delete-btn text-red-600 hover:text-red-900" data-id="${producto.id || producto._id}">Eliminar</button>
    
        `; //* Agregar los productos de la base de datos a la tabla
            productList.appendChild(newRow); 
    
    })
}    

const productList = document.getElementById('product-list');

//* Handle edit and delete buttons clicks
productList.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
        e.preventDefault();
        const id = editBtn.getAttribute('data-id');
        const productToEdit = loadedProducts.find(p => (p.id === id || p._id === id));
        if (productToEdit) {
            openProductModal('edit', productToEdit);
        } else {
            alert('Producto no encontrado para editar.');
        }
        return;
    }

    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        e.preventDefault(); 
        const id = deleteBtn.getAttribute('data-id'); 
        try {
           
            console.log(`Eliminando producto: ${id}`); 
            const response = await axios.delete(`/products/${id}`); 
            console.log('Producto eliminado:', response.data);
            notification.textContent = 'Producto eliminado exitosamente';
            notification.style.color = 'white';
            notification.style.display = 'block';
            notification.style.zIndex = '1000';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
           
            
            
            e.target.parentElement.parentElement.remove(); //* Remover el elemento seleccionado

            
        }
        catch (error) {
            console.error('Error al eliminar el producto:', error);
            alert('Error al eliminar el producto. Por favor, inténtelo de nuevo más tarde.');
        }
    }
})

//* cargar lista de productos 
let loadedOrders = [];
function loadOrders() {
    axios.get('/pedidos/lista-pedidos')
        .then(response => {
            loadedOrders = response.data;
            mostrarPedidos(loadedOrders);
        })
        .catch(error => {
            console.error('Error al obtener los pedidos:', error);
            alert('Error al obtener los pedidos. Por favor, inténtelo de nuevo más tarde.');
        });
}

//* mostrar lista de pedidos completa al admin
function mostrarPedidos(pedidos) {
    const ordersTableBody = document.querySelector('#orders-section tbody');
    ordersTableBody.innerHTML = '';
    pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    pedidos.forEach(pedido => {
        const newRow = document.createElement('tr');
        newRow.classList.add('border', pedido.estado.toLowerCase() === 'pagado' ? 'bg-green-300' : 'bg-gray-100', 'hover:bg-gray-300');
        newRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${pedido._id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${pedido.user_id?.nombre || pedido.nombre || 'Desconocido'}</td>
            <td class="px-6 py-4 whitespace-nowrap">$ ${pedido.total}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button data-order-id="${pedido._id}" onclick="toggleOrderDetails(this)" class="text-purple-600 hover:text-purple-900">Ver Detalles</button>
            </td>
        `;
        ordersTableBody.appendChild(newRow);
    });
}


function onlyAdmins () {
    const user = JSON.parse(localStorage.getItem('user')) || null; 
    if (!user || user.rol !== 'Admin') {
       
        
        const notificacion = document.querySelector('.notification');
        notificacion.textContent = 'No tienes permiso para acceder a esta sección.';
        notificacion.style.color = 'red';
        notificacion.style.display = 'block';
        notificacion.style.zIndex = '1000';
        
        setTimeout(() => {
            notificacion.style.display = 'none';
            window.location.href = '/tienda';
        }, 3000);
    }
}



window.addEventListener('load', () => {
    onlyAdmins();
})

document.addEventListener('DOMContentLoaded', () => {
    createProduct();
    editProduct();
    fullProductsList();
    fullUsersList();
    mostrarProductos();
    onlyAdmins();
    
    
});


