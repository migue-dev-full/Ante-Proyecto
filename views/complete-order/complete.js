async function capturePaypalOrder() {
    // Get the token from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        console.error('No se encontró el token en la URL');
        return;
    }

    try {
        console.log('Token de la orden PayPal:', token);

        // Get pedidoId from localStorage
        const pedidoId = localStorage.getItem('pedidoId');
        if (!pedidoId) {
            console.error('No se encontró el ID del pedido en localStorage');
            return;
        }

        // Call backend API to update pedido status to "pagado" using pedidoId
        const response = await fetch(`/pedidos/actualizar-paypal/${pedidoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentReference: token })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Pedido status updated:', result);

        // Optionally update UI to reflect payment success

    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
    }
}

capturePaypalOrder();

document.getElementById('downloadReceiptBtn').addEventListener('click', async () => {
    console.log('window.jspdf:', window.jspdf);
    const jsPDF = window.jspdf?.jsPDF || window.jspdf?.default || window.jspdf;
    if (!jsPDF) {
        alert('Error: jsPDF no está disponible.');
        return;
    }

    const pedidoId = localStorage.getItem('pedidoId');
    if (!pedidoId) {
        alert('No se encontró el ID del pedido para generar el recibo.');
        return;
    }

    try {
        const response = await fetch(`/pedidos/pedidos-por-id/${pedidoId}`);
        if (!response.ok) {
            throw new Error('Error al obtener los detalles del pedido');
        }
        const pedido = await response.json();

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Recibo de Compra', 14, 22);

        // Draw "N° de Referencia de Paypal:" in black
        doc.setTextColor(0, 0, 0); // black
        const label = 'N° de Referencia de Paypal: ';
        doc.text(label, 14, 30);

        // Draw the paypalId value in blue, positioned after the label
        doc.setTextColor(0, 0, 255); // blue
        const labelWidth = doc.getTextWidth(label);
        doc.text(`${pedido.paypalId}`, 14 + labelWidth, 30);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // black
        doc.text(`Nombre: ${pedido.nombre}`, 14, 40);
        doc.text(`Email: ${pedido.email}`, 14, 50);
        doc.text(`Dirección: ${pedido.address}`, 14, 60);
        doc.text(`Código Postal: ${pedido.postal_code}`, 14, 70);
        doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleDateString()}`, 14, 80);
        doc.text(`Estado: ${pedido.estado}`, 14, 90);
        doc.text(`Total: $${pedido.total}`, 14, 100);

        doc.text('Productos:', 14, 110);
        let y = 120;
        if (pedido.products && pedido.products.length > 0) {
            pedido.products.forEach(product => {
                const productName = product.id_producto?.nombre || 'Producto';
                const quantity = product.cantidad || 1;
                const price = product.precio || 0;
                doc.text(`- ${productName} x${quantity} - $${price}`, 14, y);
                y += 10;
            });
        } else {
            doc.text('No hay productos disponibles', 14, y);
        }

        doc.save(`recibo_pedido_${pedidoId}.pdf`);
    } catch (error) {
        console.error('Error generando el recibo:', error);
        alert('Hubo un error al generar el recibo. Por favor, inténtelo de nuevo.');
    }
});
