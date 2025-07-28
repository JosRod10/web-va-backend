// Ejemplo usando Express.js 
const express = require ( 'express' );
const cors = require('cors');
const app = express ();


//Configuración de CORS
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


// Ejemplo que define una ruta en
 app.get ( '/' , ( req, res ) => { 
    res.send ( '<h1>Backend con Node js y Express js</h1>' ); 
});

// Incluir archivos de ruta 
const  usersRoute = require ( './routes/api/users' ); 

// Usar rutas app.user
 app.use ( '/users' , usersRoute);

// Ejemplo que especifica el puerto e inicia el servidor 
const port = process.env.PORT || 3000 ; // Puede usar variables de entorno para la configuración del puerto
app.listen (port, () => { 
    console.log ( `El servidor se está ejecutando en el puerto ${port} ` ); 
});