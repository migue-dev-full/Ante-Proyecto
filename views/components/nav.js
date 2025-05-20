const navLinks = document.querySelectorAll('.nav-links');
const navLinksShop = document.querySelectorAll('.nav-links-shop');
const btnCarrito = document.querySelector('.btn-carrito');
const tarot = document.querySelector('.tarot');
const velas = document.querySelector('.velas');
const amuletos = document.querySelector('.amuletos');
const altares = document.querySelector('.altares');
const todo = document.querySelector('.todo');
const gridProductos = document.querySelector('.grid-productos');

// Attach event listener for menu toggle button
const menuToggleButton = document.querySelector('button > svg[name="menu"]');
if (menuToggleButton) {
    menuToggleButton.addEventListener('click', () => {
        onToggleMenu();
    });
}

// Attach event listener for logout button
const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        logout();
    });
}

// Attach event listener for profile link to restrict access if not logged in
const perfilLink = document.querySelector('a[href="/perfil"]');
if (perfilLink) {
    perfilLink.addEventListener('click', (e) => {
        const user = JSON.parse(localStorage.getItem('user')) || null;
        if (!user) {
            e.preventDefault();
            const notificacion = document.querySelector('.notification');
            notificacion.textContent = 'Debes iniciar sesión para acceder a esta sección.';
            notificacion.style.color = 'red';
            notificacion.style.display = 'block';
            notificacion.style.zIndex = '1000';
            setTimeout(() => {
            notificacion.style.display = 'none';
            window.location.href = '/login';
            }, 3000);
        }
    });
}


//* Mostrar el menu de la nav bar al hacer click en el icono de hamburguesa
function onToggleMenu(e) {
    navLinks.forEach(link => {
        link.classList.toggle('top-[6.5%]');
        link.classList.toggle('z-[1000]');
    });
}

//* Mostrar Carrito
btnCarrito.addEventListener('click', mostrarCarrito);
function mostrarCarrito(e) {
    const carrito = document.querySelector('.seccion-carrito');
    const btnCarrito = document.querySelector('.finalizar-compra');
    carrito.classList.toggle('hidden');
}

//* Mostrar productos por categoria
tarot.addEventListener('click', mostrarTarot);
async function mostrarTarot(e) {
    try {
        const response = await axios.get('/products/categoria/Tarot');
        if (response.data.length > 0) {
            const gridProductos = document.querySelector('.grid-productos'); // Seleccionar el contenedor de productos
            gridProductos.innerHTML = ''; // Limpiar productos anteriores
            mostrarProductos(response.data);
        } else {
            console.error('No se encontraron productos en la categoría Tarot');
        }
    } catch (error) {
        console.error('Error al obtener los productos de la categoría Tarot', error);
    }
}

//* Mostrar productos en el frontend
function mostrarProductos(productos) {
    const gridProductos = document.querySelector('.grid-productos'); // Seleccionar el contenedor de productos
    gridProductos.innerHTML = ''; // Limpiar productos anteriores
    productos.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto-item');
        productoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen" />
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-descripcion">${producto.descripcion}</p>
            <p class="producto-precio">$${producto.precio}</p>
        `;
        gridProductos.appendChild(productoDiv);
    });
}

//filtrar por categoria
velas.addEventListener('click', mostrarVelas);
async function mostrarVelas(e) {
    try {
        const response = await axios.get('/products/categoria/Velas');
        if (response.data.length > 0) {
            const gridProductos = document.querySelector('.grid-productos'); // Seleccionar el contenedor de productos
            gridProductos.innerHTML = ''; // Limpiar productos anteriores
            mostrarProductos(response.data);
        } else {
            console.error('No se encontraron productos en la categoría Velas');
        }
    }
    catch (error) {
        console.error('Error al obtener los productos de la categoría Velas', error);
    }
}

//* Mostrar productos por categoria
amuletos.addEventListener('click', mostrarAmuletos);
async function mostrarAmuletos(e) {
    try {
        const response = await axios.get('/products/categoria/Amuletos');
        if (response.data.length > 0) {
            const gridProductos = document.querySelector('.grid-productos'); // Seleccionar el contenedor de productos
            gridProductos.innerHTML = ''; // Limpiar productos anteriores
            mostrarProductos(response.data);
        } else {
            console.error('No se encontraron productos en la categoría Amuletos');
        }
    }
    catch (error) {
        console.error('Error al obtener los productos de la categoría Amuletos', error);
    }
}

//* Mostrar todos los productos
altares.addEventListener('click', mostrarAltares);
async function mostrarAltares(e) {
    try {
        const response = await axios.get('/products/categoria/Altares');
        if (response.data.length > 0) {
            const gridProductos = document.querySelector('.grid-productos'); // Seleccionar el contenedor de productos
            gridProductos.innerHTML = ''; // Limpiar productos anteriores
            mostrarProductos(response.data);
        } else {
            console.error('No se encontraron productos en la categoría Altares');
        }
    }
    catch (error) {
        console.error('Error al obtener los productos de la categoría Altares', error);
    }
}

todo.addEventListener('click', fullProductsList);
function fullProductsList () {  
    axios.get('/products/lista-products')
    .then(response => {
        const gridProductos = document.querySelector('.grid-productos'); // Seleccionar el contenedor de productos
        gridProductos.innerHTML = ''; // Limpiar productos anteriores
        mostrarProductos(response.data);
    })
    .catch(error => {
        console.error('Error al obtener los productos:', error);
        alert('Error al obtener los productos. Por favor, inténtelo de nuevo más tarde.');
    })
}

//* Logout
async function logout() {
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('articulosCarrito');
    window.sessionStorage.removeItem('user');
    window.location.href = '/login';
}

function validateLocalStorageUser() {
    const loginBtns = document.querySelectorAll('.login-btn');
    const logoutBtns = document.querySelectorAll('.logout-btn');
    const user = JSON.parse(localStorage.getItem('user')) || null; 
    console.log('validateLocalStorageUser called. User:', user, 'loginBtns:', loginBtns, 'logoutBtns:', logoutBtns);
    if (user) {
        loginBtns.forEach(btn => btn.classList.add('hidden'));
        logoutBtns.forEach(btn => btn.classList.remove('hidden'));
    } else {
        loginBtns.forEach(btn => btn.classList.remove('hidden'));
        logoutBtns.forEach(btn => btn.classList.add('hidden'));
    }
    if (user.expiration && Date.now() > user.expiration) {
        localStorage.removeItem('user');
        localStorage.removeItem('articulosCarrito');
        notificacion.textContent = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        notificacion.style.color = 'red';
        notificacion.style.display = 'block';
        notificacion.style.zIndex = '1000';
        setTimeout(() => {
            notificacion.style.display = 'none';
             window.sessionStorage.removeItem('user');
            window.location.href = '/login';
        }, 3000);
       
    }
}

function restrictAccess() {

    const user = JSON.parse(localStorage.getItem('user')) || null; 
    const notificacion = document.querySelector('.notification');
    console.log('restrictAccess called. User:', user);
    if (!user) {
        notificacion.textContent = 'Debes iniciar sesión para acceder a esta sección.';
        notificacion.style.color = 'red';
        notificacion.style.display = 'block';
        notificacion.style.zIndex = '1000';
        setTimeout(() => {
            notificacion.style.display = 'none';
            window.location.href = '/login';
        }, 3000);
       
    }
}



        document.addEventListener('DOMContentLoaded', () => {
            validateLocalStorageUser();

            

            
        });





