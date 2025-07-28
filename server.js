// Ejemplo usando Express.js 
const express = require ( 'express' );
// const cors = require('cors');
const app = express ();
const sql = require('mssql');
var config = require ('./conexion_bd');


//Configuración de CORS
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.json()); // Middleware para analizar JSON
// Ejemplo que define una ruta en
 app.get ( '/' , ( req, res ) => { 
    res.send ( '<h1>Backend con Node js y Express js</h1>' ); 
});

app.post('/login', async (req, res) => {
    const datosRecibidos = req.body;
    console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const user = datosRecibidos.user;
    const pass = datosRecibidos.pass;
    const result = await conectarYConsultar(user, pass);
    console.log(result);
    res.send(result);
});

async function conectarYConsultar(paramUser, paramPass) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('user', sql.NVarChar, paramUser);
        request.input('pass', sql.NVarChar, paramPass);

        const result = await request.query("SELECT * FROM Users WHERE Usuario = @user AND Contraseña = @pass");
     
        console.log('Datos de la consulta:', result.recordset);
        const data = result.recordset;
                
     
        // Cerrar la conexión
        await sql.close();
        console.log('Conexión cerrada');
        // console.log(data);
        return data;
                
        } catch (err) {
        console.error('Error al conectar o consultar:', err);
    }
}

// Incluir archivos de ruta 
const  usersRoute = require ( './routes/api/users' ); 

// Usar rutas app.user
 app.use ( '/users' , usersRoute);

// Ejemplo que especifica el puerto e inicia el servidor 
const port = process.env.PORT || 3000 ; // Puede usar variables de entorno para la configuración del puerto
app.listen (port, () => { 
    console.log ( `El servidor se está ejecutando en el puerto ${port} ` ); 
});