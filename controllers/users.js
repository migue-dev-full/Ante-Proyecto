//Hacer el router. El router es lo que nos va a conectar el controlador con la base de datos
//router: registrar, consultar, eliminar
//POST, GET, DELETE, UPDATE

// filepath: c:\Users\Miguel\Documents\Codigos full stack\Codigos en proceso\OcultaTarot - Proyecto full stack\routes\user.js
const express = require('express');
const crypto = require('crypto');
const userRouter = express.Router();
const Usuario = require('../models/user'); // Importa el modelo de usuario
const { sendMail } = require('./sendEmail'); // Ensure sendMail is imported correctly

//* Crear un nuevo usuario
userRouter.post('/', async (request, response) => { // cual es la ruta que va a tener a nivel de backend para que me llegue la informacion
    //si desde el front me llaman ejm con un fetch llamo / fetch metoh POST a la ruta / para hacer el registro
    //parametros que es el request y el response. Cuando llamo a esa ruta recivo y luego devuelvo esa informacion al front, ejm si lo registro o error

    //request va a recibir todos los campos que hayamos llenado desde el front
    let { nombre, email, password } = request.body //recibiendo del front
    email = email.trim().toLowerCase();
    console.log(nombre, email, password) //aqui pruebo si esta llegando el dato al backend
    //este console log va a aparecer en la terminal

    if (!nombre || !email || !password) {
        //respuesta al front
        return response.status(400).json({ error: 'todos los campos son obligatorios' })
    } else {
    try {
            console.log('Intentando crear usuario en MongoDB...');
            console.log('Datos recibidos:', {nombre, email, password});
            const usuarioGuardado = await Usuario.create({
                nombre,
                email,
                password,
                verified: true
            });
            
            console.log('Usuario guardado correctamente en MongoDB:', usuarioGuardado);
            console.log('ID asignado:', usuarioGuardado._id);
            await new Usuario(usuarioGuardado).save(); // Guardar el nuevo usuario en la base de datos
            alert = `Usuario ${nombre} creado exitosamente`;
            sendMail(email,"Bienvenido a nuetro E-commerce", `Hola ${nombre} Gracias por registrarte.`)

            return response.status(201).json({ 
                msg: "Usuario creado exitosamente",
                usuario: usuarioGuardado 
            });


            
            
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            return response.status(500).json({ 
                error: 'Error interno al guardar el usuario',
                detalles: error.message 
            });
        }
        
    }
});

//*obtener lista de usuarios. Para un login

userRouter.get('/lista-users', async (request, response) => {
    try {
        //declarar constante, await para conectarme

        // revisar si deja registrar, el axious no es el problema

    const usuarios = await Usuario.find()
        console.log(usuarios); // Corrected line
        //return response
        return response.status(200).json({ textOk: true, data: usuarios })
    } catch (error) {

        return response.status(400).json({ error: 'Ha ocurrido un error' })

    }
})

//* Endpoint para login
userRouter.post('/login', async (request, response) => {
    let { email, password } = request.body;
    email = email.trim().toLowerCase();
    
    if (!email || !password) {
        return response.status(400).json({ 
            error: 'Email y contraseña son requeridos' 
        });
    }
     

    try {
        console.log('Intentando iniciar sesión con email:', email);
        const usuario = await Usuario.findOne({ email });
        console.log('Resultado de la búsqueda de usuario:', usuario);

        if (!usuario) {
            console.log('Usuario no encontrado:', { email });
            return response.status(401).json({
                error: 'Credenciales inválidas'
            });
        }
        
        if (usuario.password !== password) {

            console.log('Credenciales inválidas:', { email, password });
            // Si el usuario no existe o la contraseña no coincide, devolver un error
            return response.status(401).json({ 
                error: 'Credenciales inválidas'
    
            });
        }


        return response.status(200).json({ 
            success: true,
            user: usuario,
            msg: "Inicio de sesión exitoso"
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return response.status(500).json({
            error: 'Error interno al iniciar sesión',
            detalles: error.message
        });
    }
})


//* Endpoint para actualizar el rol de un usuario
userRouter.put('/update-role/:id', async (request, response) => {
    const userId = request.params.id;
    const { rol } = request.body;

    if (!rol) {
        return response.status(400).json({ error: 'El campo rol es obligatorio' });
    }

    try {
        const usuario = await Usuario.findById(userId);
        if (!usuario) {
            return response.status(404).json({ error: 'Usuario no encontrado' });
        }

        usuario.rol = rol;
        await usuario.save();

        return response.status(200).json({ msg: 'Rol actualizado correctamente', usuario });
    } catch (error) {
        console.error('Error al actualizar el rol:', error);
        return response.status(500).json({ error: 'Error interno al actualizar el rol', detalles: error.message });
    }
});



//* Endpoint para solicitar restablecimiento de contraseña
userRouter.post('/request-password-reset', async (request, response) => {
    const { email } = request.body;
    if (!email) {
        return response.status(400).json({ success: false, message: 'El campo email es obligatorio' });
    }

    try {
        const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() });

        if (!usuario) {
            // Por seguridad, no reveles si el email existe o no.
            // Simplemente envía una respuesta genérica.
            console.log(`Intento de restablecimiento para email no registrado: ${email}`);
            return response.status(200).json({ success: true, message: 'Si su correo está registrado, recibirá un email con instrucciones para restablecer su contraseña.' });
        }

        // Generar token
        const token = crypto.randomBytes(20).toString('hex');
        usuario.resetPasswordToken = token;
        usuario.resetPasswordExpires = Date.now() + 3600000; // Token válido por 1 hora (3600000 ms)

        await usuario.save();

        // Construir el enlace de restablecimiento
        // Asegúrate de que la URL base y la ruta a tu página de restablecimiento sean correctas.
        // El frontend (reset.js) espera el token como parámetro en la URL.
const resetURL = `${process.env.BASE_URL || 'http://localhost:6002'}/reset-password/setNew.html?token=${token}`;
        
        // Enviar correo
        const subject = 'Restablecimiento de contraseña - Oculta Tarot';
        const textBody = `Hola ${usuario.nombre},\n\nHas solicitado restablecer tu contraseña para Oculta Tarot.\n\nPor favor, haz clic en el siguiente enlace o cópialo y pégalo en tu navegador para completar el proceso:\n\n${resetURL}\n\nSi no solicitaste esto, por favor ignora este correo y tu contraseña permanecerá sin cambios.\nEl enlace expirará en 1 hora.\n\nSaludos,\nEl equipo de Oculta Tarot`;
        const htmlBody = `
            <p>Hola ${usuario.nombre},</p>
            <p>Has solicitado restablecer tu contraseña para Oculta Tarot.</p>
            <p>Por favor, haz clic en el siguiente enlace para completar el proceso:</p>
            <p><a href="${resetURL}">${resetURL}</a></p>
            <p>Si no solicitaste esto, por favor ignora este correo y tu contraseña permanecerá sin cambios.</p>
            <p>El enlace expirará en 1 hora.</p>
            <p>Saludos,<br>El equipo de Oculta Tarot</p>
        `;

        await sendMail(usuario.email, subject, textBody, htmlBody);

        return response.status(200).json({ success: true, message: 'Se ha enviado un correo con instrucciones para restablecer su contraseña.' });

    } catch (error) {
        console.error('Error en /request-password-reset:', error);
        // En caso de error, también envía una respuesta genérica para no revelar información.
        return response.status(500).json({ success: false, message: 'Ocurrió un error al procesar su solicitud. Inténtelo más tarde.' });
    }
});


// Debes crear este endpoint para manejar el cambio de contraseña efectivo
// cuando el usuario hace clic en el enlace del correo y envía la nueva contraseña.
userRouter.post('/reset-password', async (request, response) => {
    const { token, newPassword } = request.body;

    if (!token || !newPassword) {
        return response.status(400).json({ success: false, message: 'Token y nueva contraseña son requeridos.' });
    }

    // Aquí deberías añadir validación para la fortaleza de newPassword,
    // similar a como lo haces en el registro.
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
    if (!passwordRegex.test(newPassword)) {
        return response.status(400).json({ success: false, message: 'La nueva contraseña no cumple los requisitos de seguridad (mínimo 8 caracteres, una mayúscula, una minúscula y un número).' });
    }

    try {
        const usuario = await Usuario.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Verificar que el token no haya expirado
        });

        if (!usuario) {
            return response.status(400).json({ success: false, message: 'El token de restablecimiento es inválido o ha expirado.' });
        }

        // Hashear la nueva contraseña antes de guardarla (¡MUY IMPORTANTE!)
        // Ejemplo usando bcrypt (debes instalarlo: npm install bcrypt)
        // const bcrypt = require('bcrypt');
        // const saltRounds = 10;
        // usuario.password = await bcrypt.hash(newPassword, saltRounds);

        // **PELIGRO**: Estás guardando la contraseña en texto plano. DEBES hashearla.
        // Por ahora, para que funcione con tu lógica actual de login, la dejo así,
        // pero esto es una vulnerabilidad de seguridad crítica.
        usuario.password = newPassword; 
        
        usuario.resetPasswordToken = undefined; // Invalidar el token
        usuario.resetPasswordExpires = undefined; // Invalidar la expiración

        await usuario.save();

        // Opcional: Enviar un correo de confirmación de cambio de contraseña
        await sendMail(
            usuario.email,
            'Tu contraseña ha sido actualizada - Oculta Tarot',
            `Hola ${usuario.nombre},\n\nTu contraseña para Oculta Tarot ha sido actualizada exitosamente.\n\nSi no realizaste este cambio, por favor contacta a nuestro soporte inmediatamente.\n\nSaludos,\nEl equipo de Oculta Tarot`
        );

        return response.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente.' });

    } catch (error) {
        console.error('Error en /reset-password:', error);
        return response.status(500).json({ success: false, message: 'Error interno al actualizar la contraseña.' });
    }
});








module.exports = userRouter;

