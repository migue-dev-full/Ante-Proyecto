const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pedidoSchema = new mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'usuario' },
    nombre: String,
    email: String,
    address: String,
    postal_code: String,
    fecha: { type: Date, default: Date.now },
    paypalId: String,
    products: [
        {
            id_producto: { type: Schema.Types.ObjectId, ref: 'Producto' },
            cantidad: Number,
            precio: Number
        }
    ],
    total: Number,
    estado: String,
    paypalOrderId: String
});




const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido;
