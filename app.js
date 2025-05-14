require("dotenv").config();
const express = require("express");
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const mongoose = require("mongoose");
const userRouter = require('./controllers/users');

const productRouter = require('./controllers/products');
const { sendContactEmail } = require('./controllers/sendEmail');
const pedidoRouter = require('./controllers/pedidos');
const paypal = require('./controllers/paypal');

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
    console.log(captureResponse);
    res.redirect('/complete-order/index.html');
  } catch (error) {
    console.error('Error in /complete-order route:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al procesar el pago' });
    }
  }
})

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
