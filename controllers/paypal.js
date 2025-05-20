const axios = require ('axios');
const qs = require('querystring');


//* Funciones de PayPal *//


//?//?  Obtener Token de Acceso /?//
async function getPaypalToken() {

    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
        method: 'post',
        data: qs.stringify({
            grant_type: 'client_credentials'
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        }
    })

    console.log( response.data);
    return response.data.access_token;
}


//?//?  Crear una Orden de Paypal ?//?//
async function createPaypalOrderInternal(articulosCarrito) {
    if (!articulosCarrito) {
        throw new Error('articulosCarrito is missing');
    }
    if (!articulosCarrito.items || !articulosCarrito.items.length) {
        throw new Error('articulosCarrito.items is missing or empty');
    }
    console.log(articulosCarrito);
    const token = await getPaypalToken();
    console.log(token);

    // Convert amounts to string with two decimals for PayPal
    const formatAmount = (amount) => {
        let num = Number(amount);
        if (isNaN(num) || num < 0) num = 0;
        return num.toFixed(2);
    };

    // Calculate item total from items
    const itemTotal = formatAmount(articulosCarrito.items.reduce((acc, item) => acc + (item.precio || item.price || 0) * (item.cantidad || item.quantity || 1), 0));
    // Get shipping cost from articulosCarrito, default to 0 if not present
    const shippingCost = formatAmount(articulosCarrito.shipping || 10);
    // Calculate total value as item total + shipping
    const totalValue = formatAmount(parseFloat(itemTotal) + parseFloat(shippingCost));

    const payload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: totalValue,
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: itemTotal
                        },
                        shipping: {
                            currency_code: 'USD',
                            value: shippingCost
                        }
                    }
                },
                items: articulosCarrito.items.map(item => ({
                    name: item.nombre || item.name || 'Producto',
                    unit_amount: {
                        currency_code: 'USD',
                        value: formatAmount(item.precio || item.price || '0.00')
                    },
                    quantity: item.cantidad || item.quantity || 1
                }))
            }
        ],
        application_context: {
            return_url: process.env.BASE_URL + '/complete-order',
            cancel_url: process.env.BASE_URL + '/perfil',
            shipping_preference: 'NO_SHIPPING', // Set to 'NO_SHIPPING' if you don't want to collect shipping address
            user_action: 'PAY_NOW',
            brand_name: 'Oculta Web',
        }
    };

    //console.log('PayPal order payload:', JSON.stringify(payload, null, 2));

    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v2/checkout/orders',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: JSON.stringify(payload)
    });

    const approveUrl = response.data.links.find(link => link.rel === 'approve').href;
    console.log(approveUrl);
    return approveUrl;
}

async function createPaypalOrder(req, res) {
    try {
        const { articulosCarrito } = req.body;
        const approveUrl = await createPaypalOrderInternal(articulosCarrito);
        res.json({ approval_url: approveUrl });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ error: error.message || 'Error creating PayPal order' });
    }
}


async function capturePaypalOrder(orderId) {
    
        const token = await getPaypalToken();

        const response = await axios({
            url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
         console.log(response.data);
        return response.data;
       

        
 }

 

module.exports = {
    createPaypalOrder,
    capturePaypalOrder,
    createPaypalOrderInternal
}
