const passwordInput = document.querySelector('#password-reset');
const emailInput = document.querySelector('#email-reset');
const passwordCont = document.querySelector('.password-container');
const emailCont = document.querySelector('.email-container');
const resetBtn = document.querySelector('#reset-btn');
const notification = document.querySelector('.notification');

// Función auxiliar para mostrar notificaciones (asegúrate que esté definida y funcione como esperas)
// Puedes usar la que ya tienes en otros archivos o esta versión adaptada.
function showNotification(message, type = 'info', duration = 3000) {
    if (!notification) {
        console.warn('Elemento de notificación no encontrado.');
        alert(message); // Fallback si la notificación no existe
        return;
    }
    notification.textContent = message;
    // Aplicar estilos basados en el tipo (ejemplo con clases de Tailwind)
    notification.className = 'notification p-3 rounded-md text-white fixed top-5 right-5 z-50'; // Clases base
    if (type === 'error') {
        notification.classList.add('bg-red-600');
    } else if (type === 'success') {
        notification.classList.add('bg-green-600');
    } else {
        notification.classList.add('bg-blue-600'); // Info o por defecto
    }
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

// Validación de formato de email (similar a tus otros archivos)
const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

emailInput.addEventListener('input', () => {
    if (emailRegex.test(emailInput.value)) {
        emailInput.classList.remove('border-red-500');
        emailInput.classList.add('border-green-500');
    } else if (emailInput.value.length > 0) {
        emailInput.classList.add('border-red-500');
        emailInput.classList.remove('border-green-500');
    } else {
        emailInput.classList.remove('border-red-500', 'border-green-500');
    }
});

resetBtn.addEventListener('click', async () => {
    const emailValue = emailInput.value.trim();

    if (!emailValue) {
        showNotification('Por favor, ingrese su correo electrónico.', 'error');
        emailInput.focus();
        return;
    }

    if (!emailRegex.test(emailValue)) {
        showNotification('Por favor, ingrese un correo electrónico válido.', 'error');
        emailInput.focus();
        return;
    }

    const originalButtonText = resetBtn.textContent;
    resetBtn.textContent = 'Procesando...';
    resetBtn.disabled = true;

    try {
        // Llamamos a un endpoint en el backend para solicitar el envío del correo de restablecimiento.
        // Deberás crear este endpoint (ej. /user/request-password-reset).
        const response = await axios.post('/user/request-password-reset', { email: emailValue });

        if (response.data && response.data.success) {
            showNotification(response.data.message || 'Si su correo está registrado, recibirá un email con instrucciones para restablecer su contraseña.', 'success', 6000);
            // Opcional: Ocultar el formulario de email o redirigir.
            // Por ahora, solo limpiamos el campo y dejamos al usuario en la página.
            
            emailInput.value = '';
            emailInput.classList.remove('border-green-500', 'border-red-500');

        } else {
            // El backend podría enviar un mensaje específico si success es false.
            showNotification(response.data.message || 'No se pudo procesar su solicitud. Inténtelo más tarde.', 'error');
        }

    } catch (error) {
        console.error('Error al solicitar el restablecimiento de contraseña:', error.response ? error.response.data : error.message);
        // Es una buena práctica no revelar explícitamente si un email existe o no en errores genéricos.
        // El mensaje del backend (si success es false) podría ser más específico,
        // pero para el usuario final, un mensaje genérico puede ser mejor en caso de error.
        const errorMessage = error.response?.data?.message || 'Ocurrió un error al procesar su solicitud. Por favor, inténtelo de nuevo más tarde.';
        showNotification(errorMessage, 'error');
    } finally {
        // Restaurar el botón a su estado original
        resetBtn.textContent = originalButtonText;
        resetBtn.disabled = false;
    }
});