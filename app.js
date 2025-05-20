require("dotenv").config();
const express = require("express");
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const app = express();
const mongoose = require("mongoose");
const userRouter = require('./controllers/users');

const productRouter = require('./controllers/products');
const { sendContactEmail } = require('./controllers/sendEmail');
const pedidoRouter = require('./controllers/pedidos');
const paypal = require('./controllers/paypal');
const Pedido = require('./models/pedido');

const path = require("path");



  


app.use(cors()); // Enable CORS for all origins


//IMPORTANTE debo decir que van como json
app.use(express.json())


//?/  Rutas de PAYPAL /?//
app.post('/paypal/order', paypal.createPaypalOrder);

app.post('/pay', async (req, res) => {
  try {
    const url = await paypal.createPaypalOrder();
   
    res.redirect(url.approval_url);
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

app.get('/complete-order', async (req, res) => {
  try {
    const captureResponse = await paypal.capturePaypalOrder(req.query.token);
    const paymentReference = captureResponse.id;
    console.log('Referencia de pago:', paymentReference);
    console.log('Estado de la transacción:', captureResponse.status);
    console.log('Detalles de la transacción:', captureResponse.purchase_units[0].payments.captures[0]);
    console.log('Detalles de la transacción:', captureResponse.purchase_units[0].payments.captures[0].status);
    console.log('Detalles de la transacción:', captureResponse.purchase_units[0].payments.captures[0].amount.value);
    console.log('Detalles de la transacción:', captureResponse.purchase_units[0].payments.captures[0].amount.currency_code);

    // Redirect with token as query parameter so frontend can access it
    res.redirect(`/complete-order/index.html?token=${req.query.token}`);
    
  } catch (error) {
    console.error('Error in /complete-order route:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al procesar el pago' });
    }
  }
})

// New API endpoint to get latest PayPal transaction data for an order
app.get('/api/paypal/transaction/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  try {
    // Fetch the pedido from database by orderId
    const pedido = await Pedido.findById(orderId);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Assuming you store PayPal transaction data in pedido.paypalTransaction
    if (!pedido.paypalTransaction) {
      return res.status(404).json({ error: 'Datos de transacción PayPal no encontrados' });
    }

    res.json(pedido.paypalTransaction);
  } catch (error) {
    console.error('Error fetching PayPal transaction data:', error);
    res.status(500).json({ error: 'Error al obtener datos de transacción PayPal' });
  }
});

app.post('/api/pedidos/update-status', async (req, res) => {
  const { _id, estado } = req.body;
  if (!_id || !estado) {
    return res.status(400).json({ error: 'orderId and status are required' });
  }
  try {
    // Find the pedido by its _id field
    const pedido = await Pedido.findOne({ _id: _id });
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Update the estado field
    pedido.estado = estado;
    await pedido.save();

    res.json({ message: 'Estado del pedido actualizado', pedido });
  } catch (error) {
    console.error('Error updating pedido status:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del pedido' });
  }
});

//?/  Fin rutas de PAYPAL /?//

app.use("/", express.static(path.resolve("views", "home"))); 
app.use("/login", express.static(path.resolve("views", "login")));
app.use("/registro", express.static(path.resolve("views", "registro")));
app.use("/components", express.static(path.resolve("views", "components")));
app.use('/imagenes', express.static(path.resolve('imagenes')));
app.use("/tienda", express.static(path.resolve("views", "tienda")));
app.use("/admin", express.static(path.resolve("views", "admin")));
app.use("/perfil", express.static(path.resolve("views", "perfil")));
app.use("/contacto", express.static(path.resolve("views", "contacto")));
app.use("/complete-order", express.static(path.resolve("views", "complete-order")));
app.use("/reset-password", express.static(path.resolve("views", "reset-password")));



//RUTAS BACKEND

app.use('/user', userRouter)
app.use('/products', productRouter)
app.use('/pedidos', pedidoRouter)

// New route for contact form submission
app.post('/contacto/sendMail', async (req, res) => {
  try {
    await sendContactEmail(req.body);
    res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error enviando correo de contacto:', error);
    res.status(500).json({ message: 'Error enviando correo' });
  }
});

mongoose.connect(`mongodb+srv://oculta:2626@cluster0.dzg9qwz.mongodb.net/oculta?retryWrites=true&w=majority&appName=Cluster0`, {
  serverSelectionTimeoutMS: 30000, // 30 segundos
  socketTimeoutMS: 45000 // 45 segundos
})
  .then(() => console.log("Conectado a MongoDB exitosamente"))
  .catch(err => {
    console.error("Error de conexión a MongoDB:", err);
    process.exit(1);
  });

module.exports = app; 

// Proxy route
app.use('/api', createProxyMiddleware({
    target: 'https://dlnk.one',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding to the target
    },
}));
