//Hacer el router. El router es lo que nos va a conectar el controlador con la base de datos
//router: registrar, consultar, eliminar
//POST, GET, DELETE, UPDATE

// filepath: c:\Users\Miguel\Documents\Codigos full stack\Codigos en proceso\OcultaTarot - Proyecto full stack\routes\user.js
const express = require('express');
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






module.exports = userRouter;

