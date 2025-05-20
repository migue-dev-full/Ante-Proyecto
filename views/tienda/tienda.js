

window.addEventListener('DOMContentLoaded', () => {
    // Cargar productos al cargar la página
    fullProductsList(); 
})

function fullProductsList () {  
    axios.get('/products/lista-products')
    .then(response => {
        mostrarProductos(response.data);
    })
    .catch(error => {
        console.error('Error al obtener los productos:', error);
        alert('Error al obtener los productos. Por favor, inténtelo de nuevo más tarde.');
    })
}

function mostrarProductos(productos) {   
    console.log(productos)
    const gridProductos = document.querySelector('.grid-productos');
    //todo: descomentar lo de abajo para que elimine el default de productos
    // gridProductos.innerHTML = ''; // Clear existing products
    productos.forEach(producto => {
        const newDiv = document.createElement('div');
        newDiv.innerHTML = `
        
        <div class="card bg-white/10 backdrop-blur-sm rounded-lg h-120 w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img src="${producto.imagen}" alt="Baraja de Tarot" class="img w-full h-48 object-cover">
                <div class="info-card p-4">
                    <h3 class="titulo text-xl font-semibold text-white">${producto.nombre.slice(0, 25)}</h3>
                    <p class="descripcion text-gray-300 mt-2 overflow-hidden">${producto.descripcion.slice(0, 25)}...}</p>
                    <div class="precio flex justify-between items-center mt-4">
                        <span class="text-yellow-400 font-bold">${producto.precio}</span>
                        <button data-id="${producto.id}" " class="agregar-carrito mb-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded">
                            <i class="fas fa-cart-plus mr-2"></i>Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>

        
            
        `; // Agregar el nuevo producto a la lista
            gridProductos.appendChild(newDiv); // Append the new div to the product grid
    
    })
}    


