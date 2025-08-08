// Ejemplo usando Express.js 
const express = require ( 'express' );
// const cors = require('cors');
const app = express ();
const sql = require('mssql');
var config = require ('./conexion_bd');
const nodemailer = require('nodemailer');


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

async function enviarCorreo() {
  console.log('ENTRAAAAAA')
  // Crear transportador
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: true,
    auth: {
      user: 'jarodriguez@cinasa.com.mx',
      pass: 'G6ry3bjXVDCT39hW39SM'
    },
    tls: {
        ciphers:'SSLv3'
    }
    //SSL V3, TLS V1.0, TLS V1.1, TLS V1.2, and TLS V1.3
  });

  // Definir opciones del correo
  let mailOptions = {
    from: 'jarodriguez@cinasa.com.mx',
    to: 'jarodriguez@cinasa.com.mx',
    subject: 'Notificación Solicitud Vacaciones',
    text: 'Cuerpo del correo en texto plano',
    html: '<b>Cuerpo del correo en HTML</b>'
  };

  // Enviar correo
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Mensaje enviado: %s', info.messageId);
  } catch (error) {
    console.error(error);
  }
}

app.post('/form', async (req, res) => {
    const datosRecibidos = req.body;
    console.log('Datos del frontend:', datosRecibidos);
    const nombre = datosRecibidos.nombre;
    const fecha = datosRecibidos.fecha;
    const dias = datosRecibidos.cDias;
    const fechaA = datosRecibidos.fechaApartir;
    const fechaH = datosRecibidos.fechaHasta;
    const tpermiso1 = datosRecibidos.tPermiso1;
    const tpermiso2 = datosRecibidos.tPermiso2;
    const tpermiso3 = datosRecibidos.tPermiso3;
    const tpermiso4 = datosRecibidos.tPermiso4;
    const motivo = datosRecibidos.motivo;
    const firmaInt = datosRecibidos.firma;
    const clave = datosRecibidos.clave;
    // await enviarCorreo();
    const respuesta = await insertarSolicitud(nombre,fecha,dias,fechaA,fechaH,tpermiso1,motivo,firmaInt,clave,tpermiso2,tpermiso3,tpermiso4);
    var resAlFrondend;
    if(respuesta.rowsAffected = 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
    // const enviarMail = datosRecibidos[0].Estatus;
    // if(enviarMail == 'Alta'){
    //     enviarCorreo();
    //     res.send('Correo enviado con exito');
    // }else{
    //     res.send('Correo no enviado');
    // }
})

async function insertarSolicitud(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve, paramDiez, paramOnce, paramDoce,) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('nombre', sql.NVarChar, paramUno);
        request.input('fecha', sql.NVarChar, paramDos);
        request.input('dias', sql.NVarChar, paramTres);
        request.input('fechaA', sql.NVarChar, paramCuatro);
        request.input('fechaH', sql.NVarChar, paramCinco);
        request.input('permiso1', sql.Bit, paramSeis);
        request.input('permiso2', sql.Bit, paramDiez);
        request.input('permiso3', sql.Bit, paramOnce);
        request.input('permiso4', sql.Bit, paramDoce);
        request.input('motivo', sql.NVarChar, paramSiete);
        request.input('firmaInt', sql.NVarChar, paramOcho);
         request.input('clave', sql.Int, paramNueve);

        const result = await request.query("INSERT INTO solicitud_vacaciones (clave, nombre, fecha_solicitud, cuantos_dias, fecha_apartir, fecha_hasta, con_sueldo, sin_sueldo, sindicalizado, no_sindicalizado, motivo, firma_interesado, firma_jefe_in, firms_gerente, status, libre_uno, libre_dos) VALUES (@clave, @nombre, @fecha, @dias, @fechaA, @fechaH, @permiso1, @permiso2, @permiso3, @permiso4, @motivo, @firmaInt, '', '', 'Pendiente', '', '')");
        const resultUpdate = await request.query("UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Pendiente' WHERE Clave = @clave");
     
        if(result){
          console.log("Insertado con exito");
          await enviarCorreo();
        }
       
        // Cerrar la conexión
        await sql.close();
        console.log('Conexión cerrada');
        // console.log(data);
        return result;
                
        } catch (err) {
        console.error('Error al conectar o consultar:', err);
    }
}

app.post('/aprobar', async (req, res) => {
    const datosRecibidos = req.body;
    console.log('Datos del frontend:', datosRecibidos);
    const id = datosRecibidos.id;
    const accion = datosRecibidos.accion;
    const dias_d = datosRecibidos.dias_d.toString();
    const dias_u = datosRecibidos.dias_u.toString();
    const clave = datosRecibidos.clave.toString();
  
    const respuesta = await aprobarSolicitud(id, accion, dias_d, dias_u, clave);
    var resAlFrondend;
    if(respuesta.rowsAffected = 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
  
})

async function aprobarSolicitud(paramUno, paramDos, paramTres, paramCuatro, paramCinco) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        var queryUpdateUno = '';
        var queryUpdateDos = '';
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('clave', sql.NVarChar, paramCinco);
        request.input('id', sql.Int, paramUno);
        request.input('dias_d', sql.NVarChar, paramTres);
        request.input('dias_u', sql.NVarChar, paramCuatro);

        if(paramDos == 1){
          queryUpdateUno = "UPDATE solicitud_vacaciones SET status = 'Ausente' WHERE id = @id"
          queryUpdateDos = "UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Disponible', Dias_disponibles = @dias_d, Dias_ocupados = @dias_u WHERE Clave = @clave"
        }
        if(paramDos == 0){
          queryUpdateUno = "UPDATE solicitud_vacaciones SET status = 'Rechazado' WHERE id = @id"
          queryUpdateDos = "UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Disponible' WHERE Clave = @clave"

        }

        
        const resultUno = await request.query(queryUpdateUno);
        const resultDos = await request.query(queryUpdateDos);
     
        if(resultUno && resultDos){
          console.log("Modificado con exito");
          // await enviarCorreo();
        }
       
        // Cerrar la conexión
        await sql.close();
        console.log('Conexión cerrada');
        // console.log(data);
        return resultUno;
                
        } catch (err) {
        console.error('Error al conectar o consultar:', err);
    }
}

async function conectarYConsultar(paramUser, paramPass) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('user', sql.NVarChar, paramUser);
        request.input('pass', sql.NVarChar, paramPass);

        const result = await request.query("SELECT * FROM colaboradores_julio_2025 WHERE Usuario = @user AND Contraseña = @pass");
     
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

async function consultarSolicitudes() {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();
     
        // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
        const result = await request.query("select u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.*from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave");
     
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

app.post('/reporteSolicitud', async (req, res) => {
    const datosRecibidos = req.body;
    console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const criterio = datosRecibidos.criterio;
  
    const result = await reporteConsultar(criterio);
    console.log(result);
    res.send(result);
});

async function reporteConsultar(paramCriterio) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('criterio', sql.NVarChar, paramCriterio);

        const result = await request.query("SELECT * FROM solicitud_vacaciones WHERE clave = @criterio");
     
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
     
// Define una ruta
app.get('/solicitudes', async (req, res) => {
    const data = await consultarSolicitudes();
    res.send(data);
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