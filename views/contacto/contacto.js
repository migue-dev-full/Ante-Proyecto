const contactForm = document.getElementById('contact-form');
const contactName = document.getElementById('name');
const contactEmail = document.getElementById('email');
const contactPhone = document.getElementById('phone');
const service = document.getElementById('service');
const contactMessage = document.getElementById('message');
const contactSubmit = document.getElementById('submit');
const notificacion = document.querySelector('.notification')


contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: contactName.value,
        email: contactEmail.value,
        phone: contactPhone.value,
        service: service.value,
        message: contactMessage.value
    };

    try {
        const response = await fetch('/contacto/sendMail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            notificacion.textContent = 'Mensaje enviado correctamente.';
            notificacion.style.color = 'green';
            notificacion.classList.remove('hidden');
            contactForm.reset();
        } else {
            notificacion.textContent = 'Error al enviar el mensaje.';
            notificacion.style.color = 'red';
            notificacion.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error enviando el formulario:', error);
        notificacion.textContent = 'Error al enviar el mensaje.';
        notificacion.style.color = 'red';
        notificacion.classList.remove('hidden');
    }
});


        document.addEventListener('DOMContentLoaded', () => {
            validateLocalStorageUser();
        });