const express = require('express');
const pedidoRouter = express.Router();

const Pedido = require('../models/pedido');
const User = require('../models/user'); // To populate user info

//* Crear un pedido
pedidoRouter.post('/crear-pedido', async (request, response) => {
    try {
        const { user, productos, direccionEnvio, subtotal, envio, total } = request.body;

        console.log('Received direccionEnvio:', direccionEnvio);

        // Map incoming fields to pedido model schema fields
        const pedido = new Pedido({
            user_id: user._id || user.id || null,
            nombre: user.nombre || '',
            email: user.email || '',
            address: direccionEnvio ? `${direccionEnvio.calle}, ${direccionEnvio.ciudad}, ${direccionEnvio.pais}` : '',
            postal_code: direccionEnvio ? direccionEnvio.codigoPostal : '',
            products: productos.map(p => ({
                id_producto: p._id || p.id,
                cantidad: p.cantidad,
                precio: p.precio
            })),
            total: total,
            estado: 'Pendiente',
            fecha: new Date(),

        });

        await pedido.save();
        response.status(201).json(pedido);
        console.log('Pedido creado:', pedido);
    } catch (error) {
        console.error('Error creating pedido:', error);
        response.status(500).json({ error: 'Error creating pedido' });
    }
});

//* New route to get list of all pedidos with user info populated
pedidoRouter.get('/lista-pedidos', async (req, res) => {
    try {
        const pedidos = await Pedido.find()
            .populate('user_id', 'nombre') // populate user_id with nombre field
            .populate('products.id_producto', 'nombre', 'producto') // populate product id_producto with nombre, model 'producto'
            .exec();
        res.json(pedidos);
    } catch (error) {
        console.error('Error fetching pedidos:', error);
        res.status(500).json({ error: 'Error fetching pedidos' });
    }
});

// * get pedidos by user ID
pedidoRouter.get('/pedidos-por-usuario/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const pedidos = await Pedido.find({ user_id: userId })
            .populate('user_id', 'nombre')
            .populate('products.id_producto', 'nombre', 'producto')
            .exec();
        res.json(pedidos);
    } catch (error) {
        console.error('Error fetching pedidos by user:', error);
        console.error(error); // Add full error logging
        res.status(500).json({ error: 'Error fetching pedidos by user' });
    }
});

const mongoose = require('mongoose');

pedidoRouter.get('/pedidos-por-id/:pedidoId', async (req, res) => {
    try {
        const pedidoId = req.params.pedidoId;

        if (!mongoose.Types.ObjectId.isValid(pedidoId)) {
            return res.status(400).json({ error: 'Invalid pedidoId' });
        }

        const pedido = await Pedido.findById(pedidoId)
            .populate('user_id', 'nombre')
            .populate('products.id_producto', 'nombre', 'producto')
            .exec();
        res.json(pedido);
    } catch (error) {
        console.error('Error fetching pedido by ID:', error);
        res.status(500).json({ error: 'Error fetching pedido by ID' });
    }
});

//* cambiar estado de un pedido
pedidoRouter.put('/cambiar-estado/:pedidoId', async (req, res) => {
    try {
        const pedidoId = req.params.pedidoId;
        const { estado } = req.body;

        const pedido = await Pedido.findByIdAndUpdate(pedidoId, { estado }, { new: true });
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.json(pedido);
    } catch (error) {
        console.error('Error updating pedido estado:', error);
        res.status(500).json({ error: 'Error updating pedido estado' });
    }
});

module.exports = pedidoRouter;

