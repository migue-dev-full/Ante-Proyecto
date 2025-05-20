const express = require('express');
const pedidoRouter = express.Router();

const Pedido = require('../models/pedido');
const User = require('../models/user'); // To populate user info
const { sendMail } = require('./sendEmail'); // Import sendMail function

//* Crear un pedido
pedidoRouter.post('/crear-pedido', async (request, response) => {
    try {
        const { user, productos, direccionEnvio, subtotal, envio, total, paypalId } = request.body;

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
            paypalId: '',
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

/* Endpoint to update paypalId and estado of a pedido */
pedidoRouter.put('/actualizar-paypal/:pedidoId', async (req, res) => {
    try {
        const pedidoId = req.params.pedidoId; // This is the pedido's own id
        const { paymentReference } = req.body;

        // Find pedido by its own _id field
        const pedido = await Pedido.findById(pedidoId);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Update paypalId and estado
        pedido.paypalId = paymentReference;
        pedido.estado = 'Pagado';

        await pedido.save();

        // Send email to client notifying payment success with order summary
        const subject = 'Pago exitoso - Resumen de su pedido';
        const productDetails = Array.isArray(pedido.products) ? pedido.products.map(prod => prod.id_producto?.nombre || prod.id_producto?.name || 'Nombre no disponible').join(', ') : 'No hay productos disponibles';
        const html = `
            <h2>Gracias por su compra, ${pedido.nombre}!</h2>
            <p>Su pago ha sido recibido exitosamente. Aquí está el resumen de su pedido:</p>
             <ul> <span class="text-purple-800">
            ${Array.isArray(pedido.products) ? pedido.products.map(prod => `<li>${prod.id_producto?.titulo} x${prod.cantidad}</li>`).join('') : '<li>No hay productos disponibles</li>'}
        </span></ul>
            <p><strong>Dirección de envío:</strong> ${pedido.address}</p>
            <p><strong>Código postal:</strong> ${pedido.postal_code}</p>
            <p><strong>Id de la orden:</strong> ${pedido.id}</p>

            <p><strong>Total:</strong> $${pedido.total}</p>
            <p>Fecha del pedido: ${pedido.fecha.toLocaleDateString()}</p>
        `;
        try {
            await sendMail(pedido.email, subject, '', html);
            console.log('Correo de confirmación enviado a', pedido.email);
        } catch (emailError) {
            console.error('Error enviando correo de confirmación:', emailError);
        }

        res.json({ message: 'Pedido actualizado correctamente', pedido });
    } catch (error) {
        console.error('Error updating pedido paypalId and estado:', error);
        res.status(500).json({ error: 'Error updating pedido' });
    }
});

module.exports = pedidoRouter;

