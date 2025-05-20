document.addEventListener('DOMContentLoaded', () => {
    async function loadRandomFeaturedProducts() {
        try {
            const response = await axios.get('/products/lista-products');
            const products = response.data;

            // Shuffle products array
            for (let i = products.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [products[i], products[j]] = [products[j], products[i]];
            }

            // Select up to 8 products
            const selectedProducts = products.slice(0, 6);

            const container = document.querySelector('.lista-destacados ');
            container.innerHTML = ''; // Clear existing content
            container.classList.add( 'gap-8', 'p-4', );

            selectedProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow ';

                productCard.innerHTML = `
                <div class="card bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img src="${product.imagen}" alt="Baraja de Tarot" class="img w-full h-48 object-cover">
                <div class="info-card p-4">
                    <h3 class="titulo text-xl font-semibold text-white">${product.nombre}</h3>
                    <p class="descripcion text-gray-300 mt-2">${product.descripcion}</p>
                    <div class="precio flex justify-between items-start mt-4">
                        <span class="text-yellow-400 font-bold">${product.precio}</span>
                        <button data-id="${product.id}" " class="agregar-carrito bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded">
                            <i class="fas fa-cart-plus mr-2"></i>Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
                `;

                container.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error loading featured products:', error);
        }
    }

    loadRandomFeaturedProducts();
});


        document.addEventListener('DOMContentLoaded', () => {
            validateLocalStorageUser();
        });