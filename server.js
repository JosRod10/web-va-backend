// Ejemplo usando Express.js 
const express = require ( 'express' );
// const cors = require('cors');
const bodyParser = require('body-parser');
const app = express ();
const sql = require('mssql');
var config = require ('./conexion_bd');
const nodemailer = require('nodemailer');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); // Para cargar el secreto desde variables de entorno

dotenv.config(); // Carga las variables de entorno

//Configuración de CORS
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Increase the limit for JSON payloads
app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.json()); // Middleware para analizar JSON
// Ejemplo que define una ruta en
 app.get ( '/' , ( req, res ) => { 
    res.send ( '<h1>Backend con Node js y Express js</h1>' ); 
});

// Obtén el secreto desde las variables de entorno ----------------------------------------------------------------------->
const JWT_SECRET = process.env.JWT_SECRET;

// Ruta para la generación de tokens (ej. inicio de sesión)
app.post('/login', async (req, res) => {
    // 1. Autenticar al usuario (verificar usuario y contraseña en la base de datos)
    const datosRecibidos = req.body;
    const user = datosRecibidos.user;
    const pass = datosRecibidos.pass;

    const result = await conectarYConsultar(user, pass);
    // console.log('Este es el resultado:', result);
    // Simulación de autenticación: reemplaza con tu lógica de verificación de usuario
    // if (user === result[0].Usuario && pass === result[0].Contraseña) {
     if (result.length != 0) {
        // 2. Crear el payload del token
        const payload = {
            user: {
                id: result[0].Clave, // ID del usuario
                username: result[0].Usuario
            },
            // Puedes agregar más datos al payload
        };

        // 3. Generar el token (JWT)
        // const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Expira en 1 hora
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10m' }); // Expira en 1 hora

        // 4. Enviar el token al cliente
        res.json({result, token});
    } else {
        res.json({result});
        // res.status(401).json({ message: 'Credenciales inválidas' });
    }
});
// ---------------------------------------------------------------------------------------------------------------->

app.post('/login-0', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const user = datosRecibidos.user;
    const pass = datosRecibidos.pass;
    const result = await conectarYConsultar(user, pass);
    // console.log(result);
    res.send(result);
});

async function enviarCorreo(nombre, dias, de, a, permiso1, permiso2, permiso3, permiso4, motivo, tipo_solicitud) {
 
  // Crear transportador
  // var tipoSolicitud = '';
  //  if(motivo.includes(': ')){
  //     tipoSolicitud = motivo.includes('Permiso:')? 'Permiso' : motivo.includes('Pago tiempo por tiempo:')? 'Pago tiempo por tiempo' : 'Vacaciones';
  //     // var tipoSiguiente = tipoSolicitud;
  //     motivo = tipoSolicitud == 'Vacaciones'? motivo.substring(12,500) : tipoSolicitud == 'Permiso'? motivo.substring(9,500) : tipoSolicitud == 'Pago tiempo por tiempo'? motivo.substring(24,500) : motivo;
  //  }else{
  //     // tipoSolicitud = tipoSiguiente;
  //     motivo = motivo;
  //  }

  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'jarodriguez@cinasa.com.mx',
      pass: 'G6ry3bjXVDCT39hW39SM'
    },

  });

  // Definir opciones del correo
  let mailOptions = {
    from: 'jarodriguez@cinasa.com.mx',
    to: 'jarodriguez@cinasa.com.mx',
    subject: 'Notificación Solicitud Vacaciones',
    text: 'Cuerpo del correo en texto plano',
    html: '<b>' + 'Tipo de solicitud: ' + tipo_solicitud + '</b><br><br>' + '<b>' + nombre + ' ' + 'a solicitado' + ' ' + dias + ' ' + 'día(s) a partir del' + ' ' + de + ' ' + 'al' + ' ' + a + ' ' + permiso1 + ' ' + permiso2 + ' ' + permiso3 + ' ' + permiso4 + '.' + '<b><br><br>' + 'Motivo: ' + motivo + '</b><br><br>' + '<b>' + 'Favor de ingresar a' + ' ' + 'http://localhost:4200/login' + ' ' + 'para realizar una acción.' + '</b>' + '<br><br><b>' + ' ' + 'Saludos!' + '</b>'
  };

  // Enviar correo
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Mensaje enviado: %s', info.messageId);
  } catch (error) {
    console.error(error);
  }
}

async function enviarCorreoAceptado() {
  // console.log('Email')
  // Crear transportador
  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'jarodriguez@cinasa.com.mx',
      pass: 'G6ry3bjXVDCT39hW39SM'
    },

    // tls: {
    //     ciphers:''
    // }
    //SSL V3, TLS V1.0, TLS V1.1, TLS V1.2, and TLS V1.3
  });

  // Definir opciones del correo
  let mailOptions = {
    from: 'jarodriguez@cinasa.com.mx',
    to: 'jarodriguez@cinasa.com.mx',
    subject: 'Notificación Solicitud Vacaciones',
    text: 'Cuerpo del correo en texto plano',
    html: '<b>' + 'Se ha Aceptado tu solicitud' + '</b>'
  };

  // Enviar correo
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Mensaje enviado: %s', info.messageId);
  } catch (error) {
    console.error(error);
  }
}

async function enviarCorreoRechazado() {
  // console.log('Email')
  // Crear transportador
  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'jarodriguez@cinasa.com.mx',
      pass: 'G6ry3bjXVDCT39hW39SM'
    },

    // tls: {
    //     ciphers:''
    // }
    //SSL V3, TLS V1.0, TLS V1.1, TLS V1.2, and TLS V1.3
  });

  // Definir opciones del correo
  let mailOptions = {
    from: 'jarodriguez@cinasa.com.mx',
    to: 'jarodriguez@cinasa.com.mx',
    subject: 'Notificación Solicitud Vacaciones',
    text: 'Cuerpo del correo en texto plano',
    html: '<b>' + 'Se ha Rechazado tu solicitud' + '</b>'
  };

  // Enviar correo
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Mensaje enviado: %s', info.messageId);
  } catch (error) {
    console.error(error);
  }
}

// ****************************************************************************************************************

// Paso 1: Mapear los meses en español a números
const meses = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

/**
 * Convierte una cadena de fecha en español a formato YYYY-MM-DD.
 * @param {string} fechaString - La cadena de fecha a convertir (ej. "06 de octubre de 2025").
 * @returns {string} La fecha formateada en YYYY-MM-DD.
 */
function convertirFechaASQL(fechaString) {
  // Expresión regular para extraer los componentes de la fecha
  const regex = /(\d{1,2}) de (\w+) de (\d{4})/;
  const coincidencias = fechaString.match(regex);

  if (!coincidencias) {
    throw new Error('Formato de fecha no reconocido.');
  }

  const [, dia, nombreMes, anio] = coincidencias;
  const mesNumero = meses[nombreMes.toLowerCase()];

  if (!mesNumero) {
    throw new Error('Nombre del mes no válido.');
  }

  // Asegurar que el día y el mes tengan dos dígitos
  const diaFormateado = String(dia).padStart(2, '0');
  const mesFormateado = String(mesNumero).padStart(2, '0');

  // Formatear la cadena final
  return `${anio}-${mesFormateado}-${diaFormateado}`;
}

// ****************************************************************************************************************

app.post('/form', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos del frontend:', datosRecibidos);
    const nombre = datosRecibidos.nombre;
    const fecha = datosRecibidos.fecha;
    const dias = datosRecibidos.cDias;
    const fechaA = convertirFechaASQL(datosRecibidos.fechaApartir);
    const fechaH = convertirFechaASQL(datosRecibidos.fechaHasta);
    const tpermiso1 = datosRecibidos.tPermiso1;
    const tpermiso2 = datosRecibidos.tPermiso2;
    const tpermiso3 = datosRecibidos.tPermiso3;
    const tpermiso4 = datosRecibidos.tPermiso4;
    const tipo_solicitud = datosRecibidos.tipo_solicitud;
    const motivo = datosRecibidos.motivo;
    const firmaInt = datosRecibidos.firma;
    const clave = datosRecibidos.clave;
    const dep = datosRecibidos.depto;
    // await enviarCorreo();
    const respuesta = await insertarSolicitud(nombre,fecha,dias,fechaA,fechaH,tpermiso1,motivo,firmaInt,clave,tpermiso2,tpermiso3,tpermiso4,tipo_solicitud,dep);
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

async function insertarSolicitud(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve, paramDiez, paramOnce, paramDoce, paramTrece, paramCatorce) {
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
        request.input('tipo_sol', sql.NVarChar, paramTrece);
        request.input('motivo', sql.NVarChar, paramSiete);
        request.input('firmaInt', sql.NVarChar, paramOcho);
        request.input('clave', sql.Int, paramNueve);
        request.input('dep', sql.NVarChar, paramCatorce);
        // 1. Crea un objeto de fecha.
        const tiempoEjecucion = new Date();
        // 2. Define las opciones para el formato de salida.
        const opcionesDeFormato = {
            // weekday: 'long', // Nombre completo del día de la semana
            year: 'numeric', // Año con 4 dígitos
            month: 'long', // Nombre completo del mes
            day: 'numeric', // Número del día
            hour: 'numeric', // Hora (ej. 13)
            minute: 'numeric', // Minuto (ej. 51)
            second: 'numeric', // Segundo (ej. 12)
            // timeZone: 'America/Mexico_City', // Establece la zona horaria a CST
            // timeZoneName: 'long' // Muestra el nombre completo de la zona horaria
        };

        // 3. Formatea la fecha usando el locale 'es-MX' para español de México.
        const formatoEnEspanol = new Intl.DateTimeFormat('es-MX', opcionesDeFormato).format(tiempoEjecucion);

        // 4. Imprime el resultado.
        console.log('La función se ejecutó el:' + formatoEnEspanol);
        request.input('date', sql.NVarChar, formatoEnEspanol);

        const result = await request.query("INSERT INTO solicitud_vacaciones (clave, nombre, fecha_solicitud, tipo_solicitud, cuantos_dias, fecha_apartir, fecha_hasta, con_sueldo, sin_sueldo, sindicalizado, no_sindicalizado, motivo, firma_interesado, firma_jefe_in, firms_gerente, status, libre_uno, libre_dos) VALUES (@clave, @nombre, @fecha, @tipo_sol, @dias, @fechaA, @fechaH, @permiso1, @permiso2, @permiso3, @permiso4, @motivo, @date, '', '', 'Interesado', @dep, '')");
        const resultUpdate = await request.query("UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Pendiente' WHERE Clave = @clave");
        
        var permiso1 = '', permiso2 = '', permiso3 = '', permiso4 = '';

        if(paramSeis == true){
          permiso1 = 'con goce de sueldo'
        }
        if(paramDiez == true){
          permiso2 = 'sin goce de sueldo'
        }
        if(paramOnce == true){
          permiso3 = 'sindicalizado'
        }
        if(paramDoce == true){
          permiso4 = 'no sindicalizado'
        }

        if(result){
          console.log("Insertado con exito");
          await enviarCorreo(paramUno, paramTres, paramCuatro, paramCinco, permiso1, permiso2, permiso3, permiso4, paramSiete, paramTrece);
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

app.post('/firma-jefe-inmediato', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos del frontend:', datosRecibidos);
    const nombre = datosRecibidos.nombre;
    const fecha = datosRecibidos.fecha_solicitud;
    const dias = datosRecibidos.cuantos_dias;
    const fechaA = datosRecibidos.fecha_apartir;
    const fechaH = datosRecibidos.fecha_hasta;
    const tpermiso1 = datosRecibidos.con_sueldo;
    const tpermiso2 = datosRecibidos.sin_sueldo;
    const tpermiso3 = datosRecibidos.sindicalizado;
    const tpermiso4 = datosRecibidos.no_sindicalizado;
    const tipo_solicitud= datosRecibidos.tipo_solicitud;
    const motivo = datosRecibidos.motivo;
    const firmaInt = datosRecibidos.firma_interesado;
    const clave = datosRecibidos.clave;
    const id = datosRecibidos.id;
  
    const respuesta = await updateJefeInmediato(nombre,fecha,dias,fechaA,fechaH,tpermiso1,motivo,firmaInt,clave,tpermiso2,tpermiso3,tpermiso4,id,tipo_solicitud);
    var resAlFrondend;
    if(respuesta.rowsAffected = 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
  
})

async function updateJefeInmediato(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve, paramDiez, paramOnce, paramDoce, paramTrece, paramCatorce) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('id', sql.Int, paramTrece);
        request.input('nombre', sql.NVarChar, paramUno);
        request.input('fecha', sql.NVarChar, paramDos);
        request.input('dias', sql.NVarChar, paramTres);
        request.input('fechaA', sql.NVarChar, paramCuatro);
        request.input('fechaH', sql.NVarChar, paramCinco);
        request.input('permiso1', sql.Bit, paramSeis);
        request.input('permiso2', sql.Bit, paramDiez);
        request.input('permiso3', sql.Bit, paramOnce);
        request.input('permiso4', sql.Bit, paramDoce);
        request.input('tipo_sol', sql.NVarChar, paramCatorce);
        request.input('motivo', sql.NVarChar, paramSiete);
        request.input('firmaInt', sql.NVarChar, paramOcho);
        request.input('clave', sql.Int, paramNueve);

        // 1. Crea un objeto de fecha.
        const tiempoEjecucion = new Date();
        // 2. Define las opciones para el formato de salida.
        const opcionesDeFormato = {
            // weekday: 'long', // Nombre completo del día de la semana
            year: 'numeric', // Año con 4 dígitos
            month: 'long', // Nombre completo del mes
            day: 'numeric', // Número del día
            hour: 'numeric', // Hora (ej. 13)
            minute: 'numeric', // Minuto (ej. 51)
            second: 'numeric', // Segundo (ej. 12)
            // timeZone: 'America/Mexico_City', // Establece la zona horaria a CST
            // timeZoneName: 'long' // Muestra el nombre completo de la zona horaria
        };

        // 3. Formatea la fecha usando el locale 'es-MX' para español de México.
        const formatoEnEspanol = new Intl.DateTimeFormat('es-MX', opcionesDeFormato).format(tiempoEjecucion);

        // 4. Imprime el resultado.
        console.log('La función se ejecutó el:' + formatoEnEspanol);
        request.input('date', sql.NVarChar, formatoEnEspanol);

        const query = "UPDATE solicitud_vacaciones SET firma_jefe_in = @date, status = 'Jefe Inmediato' WHERE id = @id"
        
        const result = await request.query(query);
        
        var permiso1 = '', permiso2 = '', permiso3 = '', permiso4 = '';

        if(paramSeis == true){
          permiso1 = 'con goce de sueldo'
        }
        if(paramDiez == true){
          permiso2 = 'sin goce de sueldo'
        }
        if(paramOnce == true){
          permiso3 = 'sindicalizado'
        }
        if(paramDoce == true){
          permiso4 = 'no sindicalizado'
        }
     
        if(result){
          console.log("Modificado con exito");
          await enviarCorreo(paramUno, paramTres, paramCuatro, paramCinco, permiso1, permiso2, permiso3, permiso4, paramSiete, paramCatorce);
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

app.post('/firma-gerente', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos del frontend:', datosRecibidos);
    const nombre = datosRecibidos.nombre;
    const fecha = datosRecibidos.fecha_solicitud;
    const dias = datosRecibidos.cuantos_dias;
    const fechaA = datosRecibidos.fecha_apartir;
    const fechaH = datosRecibidos.fecha_hasta;
    const tpermiso1 = datosRecibidos.con_sueldo;
    const tpermiso2 = datosRecibidos.sin_sueldo;
    const tpermiso3 = datosRecibidos.sindicalizado;
    const tpermiso4 = datosRecibidos.no_sindicalizado;
    const tipo_solicitud = datosRecibidos.tipo_solicitud;
    const motivo = datosRecibidos.motivo;
    const firmaInt = datosRecibidos.firma_interesado;
    const clave = datosRecibidos.clave;
    const id = datosRecibidos.id;
  
    const respuesta = await updateGerente(nombre,fecha,dias,fechaA,fechaH,tpermiso1,motivo,firmaInt,clave,tpermiso2,tpermiso3,tpermiso4,id,tipo_solicitud);
    var resAlFrondend;
    var resAlFrondend;
    if(respuesta.rowsAffected = 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
  
})

async function updateGerente(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve, paramDiez, paramOnce, paramDoce, paramTrece, paramCatorce) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('id', sql.Int, paramTrece);
        request.input('nombre', sql.NVarChar, paramUno);
        request.input('fecha', sql.NVarChar, paramDos);
        request.input('dias', sql.NVarChar, paramTres);
        request.input('fechaA', sql.NVarChar, paramCuatro);
        request.input('fechaH', sql.NVarChar, paramCinco);
        request.input('permiso1', sql.Bit, paramSeis);
        request.input('permiso2', sql.Bit, paramDiez);
        request.input('permiso3', sql.Bit, paramOnce);
        request.input('permiso4', sql.Bit, paramDoce);
        request.input('tipo_sol', sql.NVarChar, paramCatorce);
        request.input('motivo', sql.NVarChar, paramSiete);
        request.input('firmaInt', sql.NVarChar, paramOcho);
        request.input('clave', sql.Int, paramNueve);

        // 1. Crea un objeto de fecha.
        const tiempoEjecucion = new Date();
        // 2. Define las opciones para el formato de salida.
        const opcionesDeFormato = {
            // weekday: 'long', // Nombre completo del día de la semana
            year: 'numeric', // Año con 4 dígitos
            month: 'long', // Nombre completo del mes
            day: 'numeric', // Número del día
            hour: 'numeric', // Hora (ej. 13)
            minute: 'numeric', // Minuto (ej. 51)
            second: 'numeric', // Segundo (ej. 12)
            // timeZone: 'America/Mexico_City', // Establece la zona horaria a CST
            // timeZoneName: 'long' // Muestra el nombre completo de la zona horaria
        };

        // 3. Formatea la fecha usando el locale 'es-MX' para español de México.
        const formatoEnEspanol = new Intl.DateTimeFormat('es-MX', opcionesDeFormato).format(tiempoEjecucion);

        // 4. Imprime el resultado.
        console.log('La función se ejecutó el:' + formatoEnEspanol);
        request.input('date', sql.NVarChar, formatoEnEspanol);

        const query = "UPDATE solicitud_vacaciones SET firms_gerente = @date, status = 'Gerente' WHERE id = @id"
        
        const result = await request.query(query);

        var permiso1 = '', permiso2 = '', permiso3 = '', permiso4 = '';

        if(paramSeis == true){
          permiso1 = 'con goce de sueldo'
        }
        if(paramDiez == true){
          permiso2 = 'sin goce de sueldo'
        }
        if(paramOnce == true){
          permiso3 = 'sindicalizado'
        }
        if(paramDoce == true){
          permiso4 = 'no sindicalizado'
        }
        
     
        if(result){
          console.log("Modificado con exito");
          await enviarCorreo(paramUno, paramTres, paramCuatro, paramCinco, permiso1, permiso2, permiso3, permiso4, paramSiete, paramCatorce);

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

app.post('/aceptar-ri', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos del frontend:', datosRecibidos);
    const id = datosRecibidos.id;
  
    const respuesta = await aceptarRI(id);
    var resAlFrondend;
    if(respuesta.rowsAffected = 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
  
})

async function aceptarRI(paramUno) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('id', sql.Int, paramUno);

        const result = await request.query("UPDATE solicitud_vacaciones SET status = 'Aceptado' WHERE id = @id");
     
        if(result){
          console.log("Modificado con exito");
          // await enviarCorreo();
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
    // console.log('Datos del frontend:', datosRecibidos);
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
        // console.log(paramUno, paramDos, paramTres, paramCuatro, paramCinco);
        var queryUpdateUno = '';
        var queryUpdateDos = '';
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('clave', sql.NVarChar, paramCinco);
        request.input('id', sql.Int, paramUno);
        request.input('dias_d', sql.NVarChar, paramTres);
        request.input('dias_u', sql.NVarChar, paramCuatro);

        if(paramDos == 1){
          queryUpdateUno = "UPDATE solicitud_vacaciones SET status = 'Completado' WHERE id = @id"
          queryUpdateDos = "UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Disponible', Dias_disponibles = @dias_d, Dias_ocupados = @dias_u WHERE Clave = @clave"
          await enviarCorreoAceptado();
        }
        if(paramDos == 0){
          queryUpdateUno = "UPDATE solicitud_vacaciones SET status = 'Rechazado' WHERE id = @id"
          queryUpdateDos = "UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Disponible' WHERE Clave = @clave"
          await enviarCorreoRechazado();

        }

        
        const resultUno = await request.query(queryUpdateUno);
        const resultDos = await request.query(queryUpdateDos);
     
        if(resultUno){
          console.log("Modificado con exito");
          // await enviarCorreo();
        }
        if(resultDos){
          console.log("Modificado con exito");
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

        // const result = await request.query("SELECT * FROM colaboradores_julio_2025 WHERE Usuario = @user AND Contraseña = @pass");
        const result = await request.query("select Apellido_materno,Apellido_paterno,CURP,C_costos,Clave,Departamento,Dias_disponibles,Dias_ocupados,Dias_vacaciones,Estatus,Estatus_Solicitud,Fecha_de_alta,Fecha_de_baja,Fecha_de_nacimiento,Nombre,Nombre_completo,Puesto,RFC,Sexo,Tipo,Tipo_Dep from colaboradores_julio_2025 where Usuario = @user AND Contraseña = @pass");

        // console.log('Datos de la consulta:', result.recordset);
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

async function consultarSolicitudes(tipo) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        var consulta = '';
        var updateStatus = '';

        if(tipo == 'JI'){     
          consulta = "select u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.*from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and (s.libre_uno = 'SISTEMAS DE INFORMACION' or s.libre_uno = 'ALMACEN') and u.Clave != 300050 and s.status = 'Interesado' order by id desc";
        }
        if(tipo == 'G'){
          consulta = "select u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.*from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and (s.libre_uno = 'SISTEMAS DE INFORMACION' or s.libre_uno = 'ALMACEN') and s.status = 'Jefe Inmediato' order by id desc";
        }
        if(tipo == 'RI'){
          consulta = "select u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.*from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and s.status != 'Completado' and s.status != 'Rechazado' order by id desc";
        }
     
        // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
        const result = await request.query(consulta);
     
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

app.post('/reporteSolicitud', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const departamento =  datosRecibidos.departamento;
    const anio = datosRecibidos.anio;
    const mes = datosRecibidos.mes;
    const criterio = datosRecibidos.criterio.criterio;
    const tipoUsuario = datosRecibidos.tipo;
  
    const result = await reporteConsultar(departamento, anio, mes, criterio, tipoUsuario);
    // console.log(result);
    res.send(result);
});

async function reporteConsultar(paramDepto, paramAnio, paramMes, paramCriterio, tipoUsuario) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('depto', sql.NVarChar, paramDepto);
        request.input('anio', sql.NVarChar, `%${paramAnio}%`);
        request.input('mes', sql.NVarChar, `%${paramMes}%`);
        request.input('criterio', sql.NVarChar, paramCriterio);

        // Obtener la fecha y hora actuales
        const fechaActual = new Date();

        // Obtener el año, mes y día
        const año = fechaActual.getFullYear();
        const mes = fechaActual.getMonth() + 1; // Se suma 1 porque los meses van de 0 (enero) a 11 (diciembre)
        const dia = fechaActual.getDate();

        request.input('anioMes', sql.NVarChar, `%${año}%`);

        // Mostrar los componentes de la fecha
        // console.log(`Año: ${año}`);
        // console.log(`Mes: ${mes}`);
        // console.log(`Día: ${dia}`);

        // Para obtener la fecha completa en un formato legible
        // console.log(fechaActual.toDateString());

        var consulta = '';

        if(tipoUsuario == 'RI'){

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and a.Departamento = @depto order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = "select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and fecha_solicitud like @anio order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = "select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and fecha_solicitud like @mes and fecha_solicitud like @anioMes order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio order by id desc';
            }

            if(paramDepto != '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto != '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes order by id desc';
            }

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and u.Departamento = @depto order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio != ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes order by id desc';
            }
            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio != ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }
        }

        if(tipoUsuario == 'JI'){

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and a.Departamento = @depto order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = "select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and fecha_solicitud like @anio and (a.Departamento = 'MANTENIMIENTO' or a.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = "select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and fecha_solicitud like @mes and fecha_solicitud like @anioMes and (a.Departamento = 'MANTENIMIENTO' or a.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }

            if(paramDepto != '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto != '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes order by id desc';
            }

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and u.Departamento = @depto order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio != ''){
                consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and s.fecha_solicitud like @anio and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio != ''){
                consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio != ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }

        }

        if(tipoUsuario == 'G'){

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and a.Departamento = @depto order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = "select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and fecha_solicitud like @anio and (a.Departamento = 'MANTENIMIENTO' or a.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = "select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and fecha_solicitud like @mes and fecha_solicitud like @anioMes and (a.Departamento = 'MANTENIMIENTO' or a.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }

            if(paramDepto != '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto != '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes order by id desc';
            }

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and u.Departamento = @depto order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio != ''){
                consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and s.fecha_solicitud like @anio and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio != ''){
                consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
            }
            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio != ''){
                consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }

        }

        const result = await request.query(consulta);
     
        // console.log('Datos de la consulta:', result.recordset);
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
app.post('/solicitudes', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const tipo = datosRecibidos.tipo;
    const data = await consultarSolicitudes(tipo);
    res.send(data);
});

// Define una ruta
app.post('/colaboradores-asociados', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const tipo = datosRecibidos.tipo;
    const tipo_dep = datosRecibidos.tipo_dep;
    const data = await consultarColAsociados(tipo, tipo_dep);
    res.send(data);
});

async function consultarColAsociados(tipo, tipo_dep) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        var consulta = '';

        if(tipo == 'S' && tipo_dep == 'Ref'){
          
          consulta = "select * from colaboradores_julio_2025 where Tipo = 'C' and Tipo_Dep = 'Ref'";
        }
     
        // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
        const result = await request.query(consulta);
     
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Define una ruta
app.post('/colaboradorHistorial', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const clave = datosRecibidos.clave
    const data = await consultarHistorial(clave);
    res.send(data);
});

async function consultarHistorial(clave) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosaT');
  
        // Crear una solicitud (request)
        const request = new sql.Request();
        request.input('clave', sql.Int, clave);

        var consulta = "select * from solicitud_vacaciones where clave = @clave and (status = 'Completado' or status = 'Rechazado')";
        
        // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
        const result = await request.query(consulta);
     
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
app.post('/generar-inhabil', async (req, res) => {

    var datosRecibidos = req.body;
    // console.log(datosRecibidos.fecha);
    var respuesta;
    const colaboradores = await consultaGeneral();
    // console.log(colaboradores);
    
    for (const colaborador of colaboradores) {
      
      // console.log('Datos del frontend:', datosRecibidos);
      const nombre = colaborador.Nombre_completo;
      const fecha = datosRecibidos.fecha;
      const dias = datosRecibidos.cDias;
      const fechaA = datosRecibidos.fechaApartir;
      const fechaH = datosRecibidos.fechaHasta;
      const tpermiso1 = 'true';
      const tpermiso2 = '';
      const tpermiso3 = '';
      const tpermiso4 = 'true';
      const tipo_solicitud = 'Vacaciones';
      const motivo = datosRecibidos.motivo;
      const firmaInt = datosRecibidos.firma;
      const clave = colaborador.Clave;
      const dep = colaborador.Departamento;
      // await enviarCorreo();
      respuesta = await insertarSolicitudMasiva(nombre,fecha,dias,fechaA,fechaH,tpermiso1,motivo,firmaInt,clave,tpermiso2,tpermiso3,tpermiso4,tipo_solicitud, dep);
    }
    await sql.close();
    console.log('Conexión cerrada');

    var resAlFrondend;
    if(respuesta.rowsAffected = 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
});

async function consultaGeneral() {
  try {
    await sql.connect(config);
    console.log('Conexión a SQL Server exitosa');
    // Crear una solicitud (request)
    const request = new sql.Request();
    var consulta = "select * from colaboradores_julio_2025 where Estatus != 'Baja'"
    // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
    const result = await request.query(consulta);
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

async function insertarSolicitudMasiva(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve, paramDiez, paramOnce, paramDoce, paramTrece, paramCatorce) {
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
        request.input('tipo_sol', sql.NVarChar, paramTrece);
        request.input('motivo', sql.NVarChar, paramSiete);
        request.input('firmaInt', sql.NVarChar, paramOcho);
        request.input('clave', sql.Int, paramNueve);
        request.input('dep', sql.NVarChar, paramCatorce);

        // 1. Crea un objeto de fecha.
        const tiempoEjecucion = new Date();
        // 2. Define las opciones para el formato de salida.
        const opcionesDeFormato = {
            // weekday: 'long', // Nombre completo del día de la semana
            year: 'numeric', // Año con 4 dígitos
            month: 'long', // Nombre completo del mes
            day: 'numeric', // Número del día
            hour: 'numeric', // Hora (ej. 13)
            minute: 'numeric', // Minuto (ej. 51)
            second: 'numeric', // Segundo (ej. 12)
            // timeZone: 'America/Mexico_City', // Establece la zona horaria a CST
            // timeZoneName: 'long' // Muestra el nombre completo de la zona horaria
        };

        // 3. Formatea la fecha usando el locale 'es-MX' para español de México.
        const formatoEnEspanol = new Intl.DateTimeFormat('es-MX', opcionesDeFormato).format(tiempoEjecucion);

        // 4. Imprime el resultado.
        console.log('La función se ejecutó el:' + formatoEnEspanol);
        request.input('date', sql.NVarChar, formatoEnEspanol);

        const result = await request.query("INSERT INTO solicitud_vacaciones (clave, nombre, fecha_solicitud, tipo_solicitud, cuantos_dias, fecha_apartir, fecha_hasta, con_sueldo, sin_sueldo, sindicalizado, no_sindicalizado, motivo, firma_interesado, firma_jefe_in, firms_gerente, status, libre_uno, libre_dos) VALUES (@clave, @nombre, @fecha, @tipo_sol, @dias, @fechaA, @fechaH, @permiso1, @permiso2, @permiso3, @permiso4, @motivo, @date, '', '', 'Interesado', @dep, '')");
        const resultUpdate = await request.query("UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Pendiente' WHERE Clave = @clave");
        
        var permiso1 = '', permiso2 = '', permiso3 = '', permiso4 = '';

        if(paramSeis == true){
          permiso1 = 'con goce de sueldo'
        }
        if(paramDiez == true){
          permiso2 = 'sin goce de sueldo'
        }
        if(paramOnce == true){
          permiso3 = 'sindicalizado'
        }
        if(paramDoce == true){
          permiso4 = 'no sindicalizado'
        }

        if(result){
          console.log("Insertado con exito");
          // await enviarCorreo(paramUno, paramTres, paramCuatro, paramCinco, permiso1, permiso2, permiso3, permiso4, paramSiete, paramTrece);
        }
       
        // Cerrar la conexión
        // await sql.close();
        // console.log('Conexión cerrada');
        // console.log(data);
        return result;
                
        } catch (err) {
        console.error('Error al conectar o consultar:', err);
    }
}

app.post('/accion-todas', async (req, res) => {
    var datosRecibidos = req.body;
    var respuesta;
    if(datosRecibidos.accion == 1){
      for (const colaborador of datosRecibidos.claves) {
        // console.log('Datos del frontend:', datosRecibidos);
        const nombre = colaborador.Nombre_completo;
        const fecha = colaborador.fecha_solicitud;
        const dias = colaborador.cuantos_dias;
        const fechaA = colaborador.fecha_apartir;
        const fechaH = colaborador.fecha_hasta;
        const tpermiso1 = colaborador.con_sueldo;
        const tpermiso2 = colaborador.sin_sueldo;
        const tpermiso3 = colaborador.sindicalizado;
        const tpermiso4 = colaborador.no_sindicalizado;
        const tipo_solicitud= colaborador.tipo_solicitud;
        const motivo = colaborador.motivo;
        const firmaInt = colaborador.firma_interesado;
        const clave = colaborador.clave;
        const id = colaborador.id;
      
        respuesta = await updateJefeInmediatoTodas(nombre,fecha,dias,fechaA,fechaH,tpermiso1,motivo,firmaInt,clave,tpermiso2,tpermiso3,tpermiso4,id,tipo_solicitud);
      }
    }
    if(datosRecibidos.accion == 0){
        respuesta = await rechazarSolicitudesTodas(datosRecibidos);
    }
    // Cerrar la conexión
    // await sql.close();
    // console.log('Conexión cerrada');

    var resAlFrondend;
    if(respuesta.rowsAffected >= 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
  
})

async function updateJefeInmediatoTodas(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve, paramDiez, paramOnce, paramDoce, paramTrece, paramCatorce) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('id', sql.Int, paramTrece);
        request.input('nombre', sql.NVarChar, paramUno);
        request.input('fecha', sql.NVarChar, paramDos);
        request.input('dias', sql.NVarChar, paramTres);
        request.input('fechaA', sql.NVarChar, paramCuatro);
        request.input('fechaH', sql.NVarChar, paramCinco);
        request.input('permiso1', sql.Bit, paramSeis);
        request.input('permiso2', sql.Bit, paramDiez);
        request.input('permiso3', sql.Bit, paramOnce);
        request.input('permiso4', sql.Bit, paramDoce);
        request.input('tipo_sol', sql.NVarChar, paramCatorce);
        request.input('motivo', sql.NVarChar, paramSiete);
        request.input('firmaInt', sql.NVarChar, paramOcho);
        request.input('clave', sql.Int, paramNueve);

        // 1. Crea un objeto de fecha.
        const tiempoEjecucion = new Date();
        // 2. Define las opciones para el formato de salida.
        const opcionesDeFormato = {
            // weekday: 'long', // Nombre completo del día de la semana
            year: 'numeric', // Año con 4 dígitos
            month: 'long', // Nombre completo del mes
            day: 'numeric', // Número del día
            hour: 'numeric', // Hora (ej. 13)
            minute: 'numeric', // Minuto (ej. 51)
            second: 'numeric', // Segundo (ej. 12)
            // timeZone: 'America/Mexico_City', // Establece la zona horaria a CST
            // timeZoneName: 'long' // Muestra el nombre completo de la zona horaria
        };

        // 3. Formatea la fecha usando el locale 'es-MX' para español de México.
        const formatoEnEspanol = new Intl.DateTimeFormat('es-MX', opcionesDeFormato).format(tiempoEjecucion);

        // 4. Imprime el resultado.
        console.log('La función se ejecutó el:' + formatoEnEspanol);
        request.input('date', sql.NVarChar, formatoEnEspanol);

        const query = "UPDATE solicitud_vacaciones SET firma_jefe_in = @date, status = 'Jefe Inmediato' WHERE id = @id"
        
        const result = await request.query(query);
        
        var permiso1 = '', permiso2 = '', permiso3 = '', permiso4 = '';

        if(paramSeis == true){
          permiso1 = 'con goce de sueldo'
        }
        if(paramDiez == true){
          permiso2 = 'sin goce de sueldo'
        }
        if(paramOnce == true){
          permiso3 = 'sindicalizado'
        }
        if(paramDoce == true){
          permiso4 = 'no sindicalizado'
        }
     
        if(result){
          console.log("Modificado con exito");
          // await enviarCorreo(paramUno, paramTres, paramCuatro, paramCinco, permiso1, permiso2, permiso3, permiso4, paramSiete, paramCatorce);
        }
       
        // console.log(data);
        return result;
                
        } catch (err) {
        console.error('Error al conectar o consultar:', err);
    }
}

async function rechazarSolicitudesTodas(paramUno) {
  
    // try {
        await sql.connect(config);
    //     console.log('Conexión a SQL Server exitosa');
        
    //     var queryUpdateUno = '';
    //     var queryUpdateDos = '';
  
        // Asegúrate de que la conexión a la base de datos esté abierta antes del bucle.
        // Por ejemplo:
        // const pool = new sql.ConnectionPool(config);
        // await pool.connect();

        for (const colaborador of paramUno.claves) {
          // Crea una NUEVA instancia de request en cada iteración del bucle.
          const request = new sql.Request();

          const clave = colaborador.Clave;
          const id = colaborador.id;

          // Usa la nueva instancia para declarar los parámetros.
          request.input('clave', sql.Int, clave);
          request.input('id', sql.Int, id);

          const queryUpdateUno = "UPDATE solicitud_vacaciones SET status = 'Rechazado' WHERE id = @id";
          const queryUpdateDos = "UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Disponible' WHERE Clave = @clave";

          try {
            // Envía los correos y ejecuta las consultas.
            // await enviarCorreoRechazado();

            var resultUno = await request.query(queryUpdateUno);
            if (resultUno) {
              console.log(`Solicitud con id ${id} modificada con éxito.`);
              // await enviarCorreoRechazado();
            }

            var resultDos = await request.query(queryUpdateDos);
            if (resultDos) {
              console.log(`Colaborador con clave ${clave} modificado con éxito.`);
            }
          } catch (error) {
            console.error(`Error procesando colaborador ${clave}:`, error);
          }
        }

        // Cierra la conexión UNA SOLA VEZ después de que el bucle haya terminado.
        await sql.close();

        // console.log('Conexión cerrada');
        // console.log(data);
        return resultUno;
                
    //     } catch (err) {
    //     console.error('Error al conectar o consultar:', err);
    // }
}

app.post('/aceptar-todas', async (req, res) => {
    var datosRecibidos = req.body;
    var respuesta;
    console.log(datosRecibidos);
    for (const colaborador of datosRecibidos) {
      // console.log('Datos del frontend:', datosRecibidos);
      respuesta = await updateColaboradorTodasAceptar(colaborador.Clave);
    }
    // Cerrar la conexión
    await sql.close();
    console.log('Conexión cerrada');

    var resAlFrondend;
    if(respuesta.rowsAffected >= 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
  
})

async function updateColaboradorTodasAceptar(paramUno) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('clave', sql.Int, paramUno);

        // await enviarCorreoRechazado();

        const resultado = await request.query("UPDATE solicitud_vacaciones SET status = 'Aceptado' where clave = @clave");
     
        if(resultado){
          console.log("Modificado con exito");
          // await enviarCorreo();
        }
       
        // Cerrar la conexión
        // await sql.close();
        // console.log('Conexión cerrada');
        // console.log(data);
        return resultado;
                
        } catch (err) {
        console.error('Error al conectar o consultar:', err);
    }
}
// ------------------------------------------------------------------------------------------------------------------->

app.post('/firmar-todas-gerente', async (req, res) => {
    var solicitudes = req.body;
    var respuesta;
    
      for (const colaborador of solicitudes) {
        // console.log('Datos del frontend:', datosRecibidos);
        const nombre = colaborador.Nombre_completo;
        const fecha = colaborador.fecha_solicitud;
        const dias = colaborador.cuantos_dias;
        const fechaA = colaborador.fecha_apartir;
        const fechaH = colaborador.fecha_hasta;
        const tpermiso1 = colaborador.con_sueldo;
        const tpermiso2 = colaborador.sin_sueldo;
        const tpermiso3 = colaborador.sindicalizado;
        const tpermiso4 = colaborador.no_sindicalizado;
        const tipo_solicitud= colaborador.tipo_solicitud;
        const motivo = colaborador.motivo;
        const firmaInt = colaborador.firma_interesado;
        const clave = colaborador.clave;
        const id = colaborador.id;
      
        respuesta = await updateGerenteTodas(nombre,fecha,dias,fechaA,fechaH,tpermiso1,motivo,firmaInt,clave,tpermiso2,tpermiso3,tpermiso4,id,tipo_solicitud);
      }
    

    // Cerrar la conexión
    // await sql.close();
    // console.log('Conexión cerrada');

    var resAlFrondend;
    if(respuesta.rowsAffected >= 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
  
})

async function updateGerenteTodas(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve, paramDiez, paramOnce, paramDoce, paramTrece, paramCatorce) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('id', sql.Int, paramTrece);
        request.input('nombre', sql.NVarChar, paramUno);
        request.input('fecha', sql.NVarChar, paramDos);
        request.input('dias', sql.NVarChar, paramTres);
        request.input('fechaA', sql.NVarChar, paramCuatro);
        request.input('fechaH', sql.NVarChar, paramCinco);
        request.input('permiso1', sql.Bit, paramSeis);
        request.input('permiso2', sql.Bit, paramDiez);
        request.input('permiso3', sql.Bit, paramOnce);
        request.input('permiso4', sql.Bit, paramDoce);
        request.input('tipo_sol', sql.NVarChar, paramCatorce);
        request.input('motivo', sql.NVarChar, paramSiete);
        request.input('firmaInt', sql.NVarChar, paramOcho);
        request.input('clave', sql.Int, paramNueve);

        // 1. Crea un objeto de fecha.
        const tiempoEjecucion = new Date();
        // 2. Define las opciones para el formato de salida.
        const opcionesDeFormato = {
            // weekday: 'long', // Nombre completo del día de la semana
            year: 'numeric', // Año con 4 dígitos
            month: 'long', // Nombre completo del mes
            day: 'numeric', // Número del día
            hour: 'numeric', // Hora (ej. 13)
            minute: 'numeric', // Minuto (ej. 51)
            second: 'numeric', // Segundo (ej. 12)
            // timeZone: 'America/Mexico_City', // Establece la zona horaria a CST
            // timeZoneName: 'long' // Muestra el nombre completo de la zona horaria
        };

        // 3. Formatea la fecha usando el locale 'es-MX' para español de México.
        const formatoEnEspanol = new Intl.DateTimeFormat('es-MX', opcionesDeFormato).format(tiempoEjecucion);

        // 4. Imprime el resultado.
        console.log('La función se ejecutó el:' + formatoEnEspanol);
        request.input('date', sql.NVarChar, formatoEnEspanol);

        const query = "UPDATE solicitud_vacaciones SET firms_gerente = @date, status = 'Gerente' WHERE id = @id"
        
        const result = await request.query(query);
        
        var permiso1 = '', permiso2 = '', permiso3 = '', permiso4 = '';

        if(paramSeis == true){
          permiso1 = 'con goce de sueldo'
        }
        if(paramDiez == true){
          permiso2 = 'sin goce de sueldo'
        }
        if(paramOnce == true){
          permiso3 = 'sindicalizado'
        }
        if(paramDoce == true){
          permiso4 = 'no sindicalizado'
        }
     
        if(result){
          console.log("Modificado con exito");
          // await enviarCorreo(paramUno, paramTres, paramCuatro, paramCinco, permiso1, permiso2, permiso3, permiso4, paramSiete, paramCatorce);
        }
       
        // console.log(data);
        return result;
                
        } catch (err) {
        console.error('Error al conectar o consultar:', err);
    }
}

// ------------------------------------------------------------------------------------------------------------------>

app.post('/firmar-todas-ri', async (req, res) => {
    const solicitudes = req.body;
    // console.log('Datos del frontend:', datosRecibidos);
    var respuesta;
    for(let solicitud of solicitudes){

      const dias_disponibles = parseInt(solicitud.Dias_disponibles) - parseInt(solicitud.cuantos_dias);
      const dias_ocupados = parseInt(solicitud.Dias_ocupados) + parseInt(solicitud.cuantos_dias);

      const id = solicitud.id;
      const dias_d = dias_disponibles.toString();
      const dias_u = dias_ocupados.toString();
      const clave = solicitud.clave.toString();
    
      respuesta = await firmarTodoRI(id, dias_d, dias_u, clave);
    }

    // Cerrar la conexión
    await sql.close();
    console.log('Conexión cerrada');

    var resAlFrondend;
    if(respuesta.rowsAffected = 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
  
})

async function firmarTodoRI(paramUno, paramTres, paramCuatro, paramCinco) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        // console.log(paramUno, paramDos, paramTres, paramCuatro, paramCinco);
        var queryUpdateUno = '';
        var queryUpdateDos = '';
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('clave', sql.NVarChar, paramCinco);
        request.input('id', sql.Int, paramUno);
        request.input('dias_d', sql.NVarChar, paramTres);
        request.input('dias_u', sql.NVarChar, paramCuatro);

        queryUpdateUno = "UPDATE solicitud_vacaciones SET status = 'Completado' WHERE id = @id"
        queryUpdateDos = "UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Disponible', Dias_disponibles = @dias_d, Dias_ocupados = @dias_u WHERE Clave = @clave"
        // await enviarCorreoAceptado();
        
        const resultUno = await request.query(queryUpdateUno);
        const resultDos = await request.query(queryUpdateDos);
     
        if(resultUno){
          console.log("Modificado con exito");
          // await enviarCorreo();
        }
        if(resultDos){
          console.log("Modificado con exito");
        }
       
        // // Cerrar la conexión
        // await sql.close();
        // console.log('Conexión cerrada');
        // console.log(data);
        return resultUno;
                
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