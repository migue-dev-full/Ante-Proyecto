document.addEventListener('DOMContentLoaded', () => {
    const setNewPasswordForm = document.querySelector('#set-new-password-form');
    const newPasswordInput = document.querySelector('#new-password');
    const confirmPasswordInput = document.querySelector('#confirm-password');
    const submitBtn = document.querySelector('#submit-new-password-btn');
    const notificationArea = document.querySelector('.notification');

    // Obtener el token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Función para mostrar notificaciones
    function showNotification(message, type = 'info', duration = 4000) {
        if (!notificationArea) {
            console.warn('Elemento de notificación no encontrado.');
            alert(message); // Fallback
            return;
        }
        notificationArea.textContent = message;
        notificationArea.className = 'notification p-3 mb-4 rounded-md text-center text-white'; // Clases base
        if (type === 'error') {
            notificationArea.classList.add('bg-red-600');
        } else if (type === 'success') {
            notificationArea.classList.add('bg-green-600');
        } else {
            notificationArea.classList.add('bg-blue-600'); // Info
        }
        notificationArea.classList.remove('hidden');
        setTimeout(() => {
            notificationArea.classList.add('hidden');
        }, duration);
    }

    // Verificar si el token existe
    if (!token) {
        showNotification('Token de restablecimiento no encontrado o inválido. Por favor, solicita un nuevo enlace.', 'error', 6000);
        if (setNewPasswordForm) {
            // Deshabilitar el formulario si no hay token
            newPasswordInput.disabled = true;
            confirmPasswordInput.disabled = true;
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        return; // Detener la ejecución si no hay token
    }

    // Expresión regular para la validación de la contraseña
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

    // Event listener para el envío del formulario
    if (setNewPasswordForm) {
        setNewPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evitar el envío tradicional del formulario

            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Validaciones
            if (!newPassword || !confirmPassword) {
                showNotification('Ambos campos de contraseña son obligatorios.', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                showNotification('Las contraseñas no coinciden.', 'error');
                confirmPasswordInput.focus();
                return;
            }
            if (!passwordRegex.test(newPassword)) {
                showNotification('La contraseña no cumple los requisitos: mínimo 8 caracteres, una mayúscula, una minúscula y un número.', 'error', 6000);
                newPasswordInput.focus();
                return;
            }

            const originalButtonText = submitBtn.textContent;
            submitBtn.textContent = 'Guardando...';
            submitBtn.disabled = true;

            let response;
            try {
                response = await axios.post('/user/reset-password', {
                    token: token,
                    newPassword: newPassword
                });

                if (response.data && response.data.success) {
                    showNotification(response.data.message || 'Contraseña actualizada exitosamente. Serás redirigido al login.', 'success');
                    setNewPasswordForm.reset(); // Limpiar el formulario
                    setTimeout(() => {
                        window.location.href = '/login'; // Redirigir a la página de login
                    }, 4000);
                } else {
                    showNotification(response.data.message || 'No se pudo actualizar la contraseña. Inténtalo de nuevo.', 'error');
                }
            } catch (error) {
                console.error('Error al actualizar la contraseña:', error.response ? error.response.data : error.message);
                const errorMessage = error.response?.data?.message || 'Ocurrió un error al intentar actualizar la contraseña. Por favor, inténtalo más tarde.';
                showNotification(errorMessage, 'error');
            } finally {
                if (!(response && response.data && response.data.success)) { // Solo re-habilitar si no fue exitoso y redirigido
                    submitBtn.textContent = originalButtonText;
                    submitBtn.disabled = false;
                }
            }
        });
    } else {
        console.error('El formulario #set-new-password-form no fue encontrado en el DOM.');
    }
});
