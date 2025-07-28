// rutas/usuarios.js 
const express = require ( 'express' );
const sql = require('mssql');
// const cors = require('cors');
// const app = express ();
// const bodyParser = require('body-parser');
const app = express.Router ( );
var config = require ('./../../conexion_bd');


// app.use(bodyParser.json()); // Middleware para analizar JSON
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
     
     app.use(express.json()); // Para analizar JSON
     app.use(express.urlencoded({ extended: true })); // Para analizar datos de formularios


     async function conectarYConsultar() {
            try {
                await sql.connect(config);
                console.log('Conexión a SQL Server exitosa');
     
                // Crear una solicitud (request)
                const request = new sql.Request();
     
                // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
                const result = await request.query('SELECT * FROM Users');
     
                console.log('Datos de la consulta:', result.recordset);
                const data = result.recordset;
                
     
                // Cerrar la conexión
                await sql.close();
                console.log('Conexión cerrada');
                return data;
                
            } catch (err) {
                console.error('Error al conectar o consultar:', err);
            }
        }
     
    //  app.post('/', (req, res) => {
    //    console.log(req.body); // Ahora debería tener los datos enviados
    //    // ...
    //  });

// Define una ruta
//  app.get ( '/' , ( req, res ) => {     res.send ( 'esta es la ruta del usuario GET' )}) ;

 app.get('/', async (req, res) => {
       const data = await conectarYConsultar();
       res.send(data);
   });

//  router.post ( '/' , ( req, res ) => {     res.send ( 'esta es la ruta del usuario POST' )}) ;

     app.post('/', (req, res) => {
        // console.log(req);
      const datosRecibidos = req.body;
      console.log('Datos recibidos:', datosRecibidos);
      // Aquí procesas los datos recibidos
      res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    });
    
//  router.post('/', cors(corsOptions), (req, res) => {
//    res.send ( 'esta es la ruta del usuario POST' )
//  });
// esto se ejecuta cuando el usuario visita http://localhost:3000/usuario }); router.get ( '/101' , ( req, res ) => {     res.send ( 'esta es la ruta del usuario 101' ) ; // esto se ejecuta cuando el usuario visita http://localhost:3000/usuario/101 }); router.get ( '/102' , ( req, res ) => {     res.send ( 'esta es la ruta del usuario 102' ) ; // esto se ejecuta cuando el usuario visita http://localhost:3000/usuario/102 } ); // exporta el módulo del enrutador para que el archivo server.js pueda usarlo module.exports = router;
// exporta el módulo del enrutador para que el archivo server.js pueda usarlo
module.exports = app;
//rutas de usuario