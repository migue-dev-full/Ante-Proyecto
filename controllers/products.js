const express = require('express');
const productRouter = express.Router();
const Producto = require('../models/product'); // Importa el modelo de producto
const upload = require('../libs/storage'); // Import multer upload middleware

productRouter.post('/', upload.single('imagen'), async (request, response) => {
    const { nombre, descripcion, precio, categoria } = request.body;
    let imagen = '';

    if (request.file) {
        imagen = `/imagenes/${request.file.filename}`;
    }

    if (!nombre || !descripcion || !precio || !categoria) {
        return response.status(400).json({ error: 'todos los campos son obligatorios' });
    } else {
        try {
            console.log('Intentando crear producto en MongoDB...');
            console.log('Datos recibidos:', { nombre, descripcion, precio, categoria, imagen });
            const productoGuardado = await Producto.create({
                nombre,
                descripcion,
                precio,
                categoria,
                imagen
            });

            console.log('Producto guardado correctamente en MongoDB:', productoGuardado);
            await productoGuardado.save(); // Guardar el producto en la base de datos

            console.log('Producto guardado en la base de datos:', productoGuardado);
            return response.status(201).json({
                msg: "Producto creado exitosamente",
                producto: productoGuardado
            });

        } catch (error) {
            console.error('Error al guardar producto:', error);
            return response.status(500).json({
                error: 'Error interno al guardar el producto',
                detalles: error.message
            });
        }
    }
});

productRouter.get('/lista-products', async (request, response) => {
    try {
        const listadoProductos = await Producto.find();
        console.log(listadoProductos); // Corrected line
        return response.status(200).json(listadoProductos);
    } catch (error) {
        console.error('Error al obtener la lista de productos:', error);
        return response.status(500).json({ error: 'Error interno al obtener la lista de productos' });
    }
});

productRouter.get('/categoria/:categoria', async (request, response) => {
    const categoria = request.params.categoria;
    try {
        const productosPorCategoria = await Producto.find({ categoria: categoria });
        return response.status(200).json(productosPorCategoria);
    } catch (error) {
        console.error('Error al obtener productos por categoria:', error);
        return response.status(500).json({ error: 'Error interno al obtener productos por categoria' });
    }
});

productRouter.delete('/:_id', async (request, response) => {
    
    try {
    const productoEliminado = await Producto.findByIdAndDelete(request.params._id);

        notification.textContent = 'Producto eliminado exitosamente';
        notification.style.color = 'white';
        notification.style.display = 'block';
        notification.style.zIndex = '1000';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        return response.status(500).json({ error: 'Error interno al eliminar el producto' });
    }
});

productRouter.put('/:_id', upload.single('imagen'), async (request, response) => {
    const productId = request.params._id;
    const { nombre, descripcion, precio, categoria } = request.body;
    let imagen = '';

    if (request.file) {
        imagen = `/imagenes/${request.file.filename}`;
    }

    try {
        const producto = await Producto.findById(productId);
        if (!producto) {
            return response.status(404).json({ error: 'Producto no encontrado' });
        }

        producto.nombre = nombre;
        producto.descripcion = descripcion;
        producto.precio = precio;
        producto.categoria = categoria;
        if (imagen) {
            producto.imagen = imagen;
        }

        await producto.save();

        return response.status(200).json({
            msg: 'Producto actualizado exitosamente',
            producto
        });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        return response.status(500).json({
            error: 'Error interno al actualizar el producto',
            detalles: error.message
        });
    }
});

module.exports = productRouter;
