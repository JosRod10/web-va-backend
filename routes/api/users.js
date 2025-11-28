// rutas/usuarios.js 
const express = require ( 'express' );
const sql = require('mssql');
const app = express.Router ( );
var config = require ('./../../conexion_bd');

app.use(express.json()); // Middleware para analizar JSON
app.use(express.urlencoded({ extended: true })); // Para analizar datos de formularios

async function conectarYConsultar() {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();
     
        // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
        const result = await request.query('SELECT * FROM Users');
     
        // console.log('Datos de la consulta:', result.recordset);
        const data = result.recordset;
                
     
        // Cerrar la conexión
        await sql.close();
        console.log('Conexión cerrada');
        return data;
                
        } catch (err) {
        console.error('Error al conectar o consultar:', err);
    }
}
     
// Define una ruta
app.get('/', async (req, res) => {
    const data = await conectarYConsultar();
    res.send(data);
});

// app.post('/login', (req, res) => {
//     console.log(req);
//     const datosRecibidos = req.body;
//     console.log('Datos recibidos:', datosRecibidos);
//     // Aquí procesas los datos recibidos
//     res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
// });

// exporta el módulo del enrutador para que el archivo server.js pueda usarlo
module.exports = app;
