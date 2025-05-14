//1. Conectar a la base de datos mongoose.connect('ruta de conexion') 

//definir el esquema para el modelo usuario
const mongoose = require('mongoose')
const productRouter = require('../controllers/products'); // Importa el modelo de usuario
//quiero guardar el nombre del usuario


const productoSchema = new mongoose.Schema({
    nombre: String,
    descripcion: String,
    precio: Number,
    categoria: String,
    imagen: String

})

productoSchema.set('toJSON', {
    transform: (document, returnObject) => {
        returnObject.id = returnObject._id.toString() //antes de borrarla estoy haciendo una copia de este elemento en string
        delete returnObject._id;
        delete returnObject.__v;
    }
}) //JSON porque asi se guardara todo como arreglo

const Producto = mongoose.model('producto', productoSchema) //asi se va a llamar mi modelo para hacer los registros o consultas

//exportar
module.exports = Producto; //exporto el modelo para que lo pueda usar cualquier otro archivo de la