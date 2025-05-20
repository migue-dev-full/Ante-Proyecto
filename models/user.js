//1. Conectar a la base de datos mongoose.connect('ruta de conexion') 

//definir el esquema para el modelo usuario
const mongoose = require('mongoose')
const userRouter = require('../controllers/users'); // Importa el modelo de usuario
//quiero guardar el nombre del usuario

const usuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    address: String,
    verified: {
        //por que por defecto false. Cuando el usuario llene el
        //  formulario el campo verified por defecto false para luego api y que verifique el correo. Como si coincide el usuario y el password
        type: Boolean,
        default: false
    },
    //aqui definimos cliente, rol cliente
     rol: {
         type: String,
         default: "Cliente"
     },
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

//configurar la respuesta del usuario en el esquema

usuarioSchema.set('toJSON', {
    transform: (document, returnObject) => {
        returnObject.id = returnObject._id.toString() //antes de borrarla estoy haciendo una copia de este elemento en string
        delete returnObject._id;
        delete returnObject.__v;
        delete returnObject.password;

    }
}) //JSON porque asi se guardara todo como arreglo

//seleccionar un nombre para registrar ese modelo

const Usuario = mongoose.model('usuario', usuarioSchema) //asi se va a llamar mi modelo para hacer los registros o consultas

//exportar

module.exports = Usuario //ejm user.nombre user.cedula