// Ejemplo usando Express.js 
const express = require ( 'express' );
// const cors = require('cors');
const bodyParser = require('body-parser');
const app = express ();
const sql = require('mssql');
var config = require ('./conexion_bd');
// var configure = require ('./conexion_bd');
const nodemailer = require('nodemailer');

const cron = require('node-cron');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); // Para cargar la variable de entorno secreta 

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

///************************************* AUSENTAR COLABORADORES ******************************************************* */

// La función que quieres ejecutar
async function ausentarColaboradores() {
  // console.log('¡Hoy 9:00 Consultando Vacaciones por vencer!');
      try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        const request = new sql.Request();
     
        const resultStatusAusente = await request.query("UPDATE [Vac.solicitud] SET status = 'Ausente' WHERE CAST(GETDATE() AS DATE) BETWEEN fecha_apartir AND fecha_hasta;");
        const reusltStatusCompletado =  await request.query("UPDATE [Vac.solicitud] SET status = 'Completado' WHERE GETDATE() > DATEADD(day, 1, fecha_hasta) AND status = 'Ausente';");
        
        if(resultStatusAusente){
          console.log('Registros modificados con exito');
        }
        if(reusltStatusCompletado){
          console.log('Registros modificados con exito');
        }

        // Cerrar la conexión
        await sql.close();
        console.log('Conexión cerrada');
        // console.log(data);
        // return result;
      } catch (err) {
        console.error('Error al conectar o consultar:', err);
      }
}

// **********************************************************************************************************************//


// ********************************** FUNCION CREAR NUEVOS PERIODOS **************************************** //

/**
 * Procesa los registros que tienen más de un año de antigüedad.
 */
async function generarPeriodo() {
  // console.log('¡Hoy 9:00 Consultando Vacaciones por vencer!');
      try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        const request = new sql.Request();

        var clave;
        var periodo_actual;

        var periodo_siguiente;
        var anios;
        var vacaciones;
        var sabados;
        var dias_disfrutar;

        const result = await request.query("SELECT * FROM [Vac.control_vacaciones] WHERE DATEPART(MONTH, Fecha_ingreso) = DATEPART(MONTH, GETDATE()) AND DATEPART(DAY, Fecha_ingreso) = DATEPART(DAY, GETDATE())");

        if(result){
          console.log(result.recordset);
          // await enviarCorreoInsertado(paramUno, paramTres, paramCuatro, paramCinco, permiso1, permiso2, permiso3, permiso4, paramSiete, paramTrece);
          for(let colaborador of result.recordset){

            clave =  colaborador.Clave;
            periodo_actual = colaborador.Periodo;
            const sumPeriodo = parseInt(colaborador.Periodo)+1

            periodo_siguiente = sumPeriodo.toString();
            anios = colaborador.Años + 1;
            vacaciones = anios == 1 ? 12 : anios == 2 ? 14 : anios == 3 ? 16 : anios == 4 ? 18 : anios == 5 ? 20 : anios == 6 ? 22 : anios == 7 ? 22 : anios == 8 ? 22 : anios == 9 ? 22 : anios == 10 ? 22 : anios == 11 ? 24 : anios == 12 ? 24 : anios == 13 ? 24 : anios == 14 ? 24 : anios == 15 ? 24 : anios == 16 ? 26 : anios == 17 ? 26 : anios == 18 ? 26 : anios == 19 ? 26 : anios == 20 ? 26 : anios == 21 ? 28 : anios == 22 ? 28 : anios == 23 ? 28 : anios == 24 ? 28 : anios == 25 ? 28 : anios == 26 ? 30 : anios == 27 ? 30 : anios == 28 ? 30 : anios == 29 ? 30 : anios == 30 ? 30 : anios == 31 ? 32 : anios == 32 ? 32 : anios == 33 ? 32 : anios == 34 ? 32 : anios == 35 ? 32 : anios == 36 ? 34 : anios == 37 ? 34 : anios == 38 ? 34 : anios == 39 ? 34 : anios == 40 ? 34 : anios == 41 ? 36 : anios == 42 ? 36 : anios == 43 ? 36 : anios == 44 ? 36 : anios == 45 ? 36 : anios == 46 ? 38 : anios == 47 ? 38 : anios == 48 ? 38 : anios == 49 ? 38 : anios == 50 ? 38 : anios == 51 ? 40 : anios == 52 ? 40 : anios == 53 ? 40 : anios == 54 ? 40 : anios == 55 ? 40 : anios == 56 ? 42 : anios == 57 ? 42 : anios == 58 ? 42 : anios == 59 ? 42 : 0;
            sabados = vacaciones < 18 ? 2 : (vacaciones >= 18 && vacaciones <= 22) ? 3 : (vacaciones >= 24 && vacaciones <= 28) ? 4 : (vacaciones >= 30 && vacaciones <= 36) ? 5 : (vacaciones >= 38 && vacaciones <= 40) ? 6 : vacaciones == 42 ? 7 : 0;
            dias_disfrutar = vacaciones - sabados;

            request.input('clv', sql.Int, clave);
            request.input('per_act', sql.NVarChar, periodo_actual);

            request.input('per', sql.NVarChar, periodo_siguiente);
            request.input('anios', sql.Int, anios);
            request.input('vac', sql.Int, vacaciones);
            request.input('sab', sql.Int, sabados);
            request.input('dis', sql.Int, dias_disfrutar);

            const resultUpdate = await request.query("update [Vac.control_vacaciones] set Periodo = @per, Años = @anios, Vacciones = @vac, Sabados = @sab, Dias_a_disfrutar = @dis, Vacaciones_tomadas = 0, Saldo = @dis where Clave = @clv and Periodo = @per_act");
            // console.log(colaborador.emp_mail);
            if(resultUpdate){
              console.log('Colaborador con nuevon periodo vacacional.');
            }
            if(!resultUpdate){
              console.log('Ocurrio un error.');
            }
            
          }

        }

        if(!result){
          console.log('No hay colaborador con periodo a vencer en este día.');
        }

        // Cerrar la conexión
        await sql.close();
        console.log('Conexión cerrada');
        // console.log(data);
        // return result;
      } catch (err) {
        console.error('Error al conectar o consultar:', err);
      }
}






// ******************************************************************************************************************* //

// La función que quieres ejecutar
async function consultaVacacionesVencer() {
  // console.log('¡Hoy 9:00 Consultando Vacaciones por vencer!');
      try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        const request = new sql.Request();
     
        // const result = await request.query("SELECT * FROM [Vac.control_vacaciones] as c, cin_emp as e WHERE Saldo != 0 AND DATEADD(month, -1, DATEADD(year, 1, Fecha_ingreso)) = CAST(GETDATE() AS DATE) and e.emp_cve =  TRY_CONVERT(nvarchar,c.Clave)");
          const result = await request.query("SELECT * FROM [Vac.control_vacaciones] as c, cin_emp as e WHERE e.emp_cve =  TRY_CONVERT(nvarchar,c.Clave) and DATEADD(MONTH, 1, CAST(GETDATE() AS DATE)) = CASE WHEN DATEFROMPARTS(YEAR(CAST(GETDATE() AS DATE)), MONTH(c.Fecha_ingreso), DAY(c.Fecha_ingreso)) >= CAST(GETDATE() AS DATE) THEN DATEFROMPARTS(YEAR(CAST(GETDATE() AS DATE)), MONTH(c.Fecha_ingreso), DAY(c.Fecha_ingreso)) ELSE DATEFROMPARTS(YEAR(CAST(GETDATE() AS DATE)) + 1, MONTH(c.Fecha_ingreso), DAY(c.Fecha_ingreso)) END;");
        if(result){
          // console.log(result.recordset);
          // await enviarCorreoInsertado(paramUno, paramTres, paramCuatro, paramCinco, permiso1, permiso2, permiso3, permiso4, paramSiete, paramTrece);
          for(let colaborador of result.recordset){
            await enviarCorreoVacacionesVencer(colaborador.emp_nom, colaborador.Saldo, colaborador.emp_mail);
            // console.log(colaborador.emp_mail);
            console.log('El colaborador fue notificado.');
          }
        if(!result)
          console.log('No hay colaborador con vacaciones a vencer este día.');
        }
        // Cerrar la conexión
        await sql.close();
        console.log('Conexión cerrada');
        // console.log(data);
        // return result;
      } catch (err) {
        console.error('Error al conectar o consultar:', err);
      }
}

// Programa la ejecución de la función
// "0 9 * * *" significa:
// 0: minuto 0
// 9: hora 9
// *: día del mes (todos)
// *: mes (todos)
// *: día de la semana (todos)

cron.schedule('0 9 * * *', consultaVacacionesVencer, {
  scheduled: true,
  timezone: "America/Mexico_City" // O la zona horaria de tu preferencia
});

cron.schedule('0 8 * * *', ausentarColaboradores, {
  scheduled: true,
  timezone: "America/Mexico_City" // O la zona horaria de tu preferencia
});

cron.schedule('0 7 * * *', generarPeriodo, {
  scheduled: true,
  timezone: "America/Mexico_City" // O la zona horaria de tu preferencia
});

// console.log('El programador de tareas ha sido iniciado.');

// Obtén el secreto desde las variables de entorno ----------------------------------------------------------------------->
const JWT_SECRET = process.env.JWT_SECRET;

//////////////*************************////////////LOGIN/////////////////************************************* */

app.post('/login', async (req, res) => {
    // 1. Autenticar al usuario (verificar usuario y contraseña en la base de datos)
    const datosRecibidos = req.body;
    const user = datosRecibidos.user;
    const pass = datosRecibidos.pass;

    const result = await loginConsulta(user, pass);
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

async function loginConsulta(paramUser, paramPass) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('user', sql.Char, paramUser);
        request.input('pass', sql.NText, paramPass);

        // const result = await request.query("SELECT * FROM colaboradores_julio_2025 WHERE Usuario = @user AND Contraseña = @pass");
        // const result = await request.query("select * from Us_Usuario where usu_clave = @user AND CAST(usu_passw AS NVARCHAR(MAX)) = @pass");
        const result = await request.query("select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_usu = @user and e.emp_pass = @pass and e.emp_cve = c.Clave");

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


//////////////************************************************************************************************ */


// Ruta para la generación de tokens (ej. inicio de sesión)
app.post('/logi', async (req, res) => {
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
 
  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'vacaciones@cinasa.com.mx',
      pass: 'mrmygNyhmyktUrqcJs7q'
    },

  });

  // Definir opciones del correo
  let mailOptions = {
    from: 'vacaciones@cinasa.com.mx',
    to: 'mchavez@cinasa.com.mx',
    // to: 'jarodriguez@cinasa.com.mx',
    subject: 'Notificación Solicitud',
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


  async function convertirFecha(fecha){
    const [year, month, day] = fecha.split('-');
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    // Crear un objeto Date a partir de la cadena original (se le pasa el año, mes, día)
    const fechaObjeto = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Obtener el día, mes y año del objeto Date
    const dia = fechaObjeto.getDate();
    const mes = meses[fechaObjeto.getMonth()];
    const anio = fechaObjeto.getFullYear();

    // Formatear la nueva cadena
    const fechaFormateada = `${dia.toString().padStart(2, '0')} de ${mes} de ${anio}`;
    return fechaFormateada
  }

async function enviarCorreoInsertado(nombre, dias, de, a, permiso1, permiso2, permiso3, permiso4, motivo, tipo_solicitud, jefe) {

  const fecha_a = await convertirFecha(de);
  const fecha_h = await convertirFecha(a);

  var correo;
 
  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'vacaciones@cinasa.com.mx',
      pass: 'mrmygNyhmyktUrqcJs7q'
    },

  });

  if(jefe == 'GLR'){
    correo = 'glechuga@cinasa.com.mx';
  }
  if(jefe == 'KAR'){
    correo = 'kalcantara@cinasa.com.mx';
  }
  if(jefe == 'JCJ'){
    correo = 'jcano@cinasa.com.mx';
  }
  if(jefe == 'FRV'){
    correo = 'frodriguez@cinasa.com.mx';
  }
  if(jefe == 'ORLS'){
    correo = 'orosalio@cinasa.com.mx';
  }
  if(jefe == 'BHTC'){
    correo = 'logistica@cinasa.com.mx';
  }
  if(jefe == 'MVHA'){
    correo = 'mvianey@cinasa.com.mx';
  }
  if(jefe == 'JJBP'){
    correo = 'jbernal@cinasa.com.mx';
  }
  if(jefe == 'JBG'){
    correo = 'jbustos@cinasa.com.mx';
  }
  if(jefe == 'SCMG'){
    correo = 'smanzo@cinasa.com.mx';
  }
  if(jefe == 'GHGS'){
    correo = 'hgutierrez@cinasa.com.mx';
  }
  if(jefe == 'CNVS'){
    correo = 'cvaldes@cinasa.com.mx';
  }
  if(jefe == 'AGE'){
    correo = 'agonzalez@cinasa.com.mx';
  }
  if(jefe == 'AOP'){
    correo = 'aordonez@cinasa.com.mx';
  }
  if(jefe == 'EMRP'){
    correo = 'erios@cinasa.com.mx';
  }
  if(jefe == 'FLG'){
    correo = 'flopez@cinasa.com.mx';
  }
  if(jefe == 'JGH'){
    correo = 'jgutierrez@cinasa.com.mx';
  }
  if(jefe == 'JFVE'){
    correo = 'fvillanueva@cinasa.com.mx';
  }
  if(jefe == 'YMGS'){
    correo = 'ygonzalez@cinasa.com.mx';
  }
  if(jefe == 'FJTR'){
    correo = 'tecnicoabrasivos@cinasa.com.mx';
  }
  if(jefe == 'TJRH'){
    correo = 'trodriguez@cinasa.com.mx';
  }


  // Definir opciones del correo
  let mailOptions = {
    from: 'vacaciones@cinasa.com.mx',
    to: correo,
    // to: 'jarodriguez@cinasa.com.mx',
    subject: 'Notificación Solicitud',
    text: 'Cuerpo del correo en texto plano',
    html: '<b>' + 'Tipo de solicitud: ' + tipo_solicitud + '</b><br><br>' + '<b>' + nombre + ' ' + 'a solicitado' + ' ' + dias + ' ' + 'día(s) a partir del' + ' ' + fecha_a + ' ' + 'al' + ' ' + fecha_h + ' ' + permiso1 + ' ' + permiso2 + ' ' + permiso3 + ' ' + permiso4 + '.' + '<b><br><br>' + 'Motivo: ' + motivo + '</b><br><br>' + '<b>' + 'Favor de ingresar a' + ' ' + 'http://localhost:4200/login' + ' ' + 'para realizar una acción.' + '</b>' + '<br><br><b>' + ' ' + 'Saludos!' + '</b>'
  };

  // Enviar correo
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Mensaje enviado: %s', info.messageId);
  } catch (error) {
    console.error(error);
  }
}

async function enviarCorreoAceptado(correo, nombre) {
  // console.log('Email')
  // Crear transportador
  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'vacaciones@cinasa.com.mx',
      pass: 'mrmygNyhmyktUrqcJs7q'
    },

    // tls: {
    //     ciphers:''
    // }
    //SSL V3, TLS V1.0, TLS V1.1, TLS V1.2, and TLS V1.3
  });

  // Definir opciones del correo
  let mailOptions = {
    from: 'vacaciones@cinasa.com.mx',
    to: correo,
    // to: 'jarodriguez@cinasa.com.mx',
    subject: 'Notificación Solicitud',
    text: 'Cuerpo del correo en texto plano',
    html: '<b>' + nombre + ' se ha ACEPTADO tu solicitud.' + '</b><br><br>' + '<b>' + ' Disfruta de tu tiempo.' +'</b><br><br>' + '<img src="cid:imagen_logo" alt="Logo">' +'</b><br><br>' + '<img src="cid:imagen_firma" alt="Firma">',
    attachments: [
      {
        filename: 'logo.png',
        path: 'attachments/cin.png', // Ruta local de tu imagen
        cid: 'imagen_logo'
      },
      {
        filename: 'firma.png',
        path: 'attachments/firma.png', // Ruta local de tu imagen
        cid: 'imagen_firma'
      },
    ]
  };

  // Enviar correo
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Mensaje enviado: %s', info.messageId);
  } catch (error) {
    console.error(error);
  }
}

async function enviarCorreoAceptadoMasivo(correo) {
  // console.log('Email')
  // Crear transportador
  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'vacaciones@cinasa.com.mx',
      pass: 'mrmygNyhmyktUrqcJs7q'
    },

    // tls: {
    //     ciphers:''
    // }
    //SSL V3, TLS V1.0, TLS V1.1, TLS V1.2, and TLS V1.3
  });

  // Definir opciones del correo
  let mailOptions = {
    from: 'vacaciones@cinasa.com.mx',
    to: correo,
    subject: 'Notificación Solicitud',
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

async function enviarCorreoRechazado(correo, nombre) {
  // console.log('Email')
  // Crear transportador
  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'vacaciones@cinasa.com.mx',
      pass: 'mrmygNyhmyktUrqcJs7q'
    },

    // tls: {
    //     ciphers:''
    // }
    //SSL V3, TLS V1.0, TLS V1.1, TLS V1.2, and TLS V1.3
  });

  // Definir opciones del correo
  let mailOptions = {
    from: 'vacaciones@cinasa.com.mx',
    to: correo,
    // to: 'jarodriguez@cinasa.com.mx',
    subject: 'Notificación Solicitud',
    text: 'Cuerpo del correo en texto plano',
    html: '<b>' + nombre + ' se ha RECHAZADO tu solicitud.' + '</b><br><br>' + '<b>' + ' Lo sentimos.' +'</b><br><br>' + '<b>' + ' Comunicate con RELACIONES INDUSTRIALES para cualquier duda.' +'</b><br><br>' + '<img src="cid:imagen_logo" alt="Logo">' +'</b><br><br>' + '<img src="cid:imagen_firma" alt="Firma">',
    attachments: [
      {
        filename: 'logo.png',
        path: 'attachments/cin_rech.png', // Ruta local de tu imagen
        cid: 'imagen_logo'
      },
      {
        filename: 'firma.png',
        path: 'attachments/firma.png', // Ruta local de tu imagen
        cid: 'imagen_firma'
      },
    ]
  };

  // Enviar correo
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Mensaje enviado: %s', info.messageId);
  } catch (error) {
    console.error(error);
  }
}

async function enviarCorreoVacacionesVencer(paramUno, paramDos, paramTres) {
  // console.log('Email')
  // Crear transportador
  var correo;
  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'vacaciones@cinasa.com.mx',
      pass: 'mrmygNyhmyktUrqcJs7q'
    },

    // tls: {
    //     ciphers:''
    // }
    //SSL V3, TLS V1.0, TLS V1.1, TLS V1.2, and TLS V1.3
  });

  if(paramTres == '' || paramTres == 'Sin Correo' || paramTres == 'SIN CORREO'){
    correo = 'mchavez@cinasa.com.mx'
  }else{
    correo = paramTres;
  }

  // Definir opciones del correo
  let mailOptions = {
    from: 'vacaciones@cinasa.com.mx',
    to: correo,
    subject: 'Notificación',
    text: 'Cuerpo del correo en texto plano',
    html: '<b>' + 'Hola '+paramUno+', excelente día. Te escribo para noitificarte que tus '+paramDos+' día(s) de vacaciones aún disponibles estan por vencer.' + '</b>'
  };

  // Enviar correo
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Mensaje enviado: %s', info.messageId);
  } catch (error) {
    console.error(error);
  }
}

//**************************************** CORREO CON USUARIOS Y CONTRASEÑAS *******************************/

async function enviarCorreoUsuarioContrasena(nombre, mail, usuario, contrasena, tipo){
  var tipo_usuario;
    // console.log('Email')
  // Crear transportador
  let transporter = nodemailer.createTransport({
    host: 'mail.cinasa.com.mx',
    port: 587,
    secure: false,
    auth: {
      user: 'vacaciones@cinasa.com.mx',
      pass: 'mrmygNyhmyktUrqcJs7q'
    },

    // tls: {
    //     ciphers:''
    // }
    //SSL V3, TLS V1.0, TLS V1.1, TLS V1.2, and TLS V1.3
  });
  
  tipo_usuario = tipo == 'C'? 'ADMINISTRATIVO' : tipo == 'S'? 'SUPERVISOR' : tipo == 'JI'? 'JEFE INMEDIATO' : tipo == 'RI'? 'RELACIONES INDUSTRIALES' : 'NO DEFINIDO';

  // Definir opciones del correo
  let mailOptions = {
    from: 'vacaciones@cinasa.com.mx',
    to: mail,
    // to: 'jarodriguez@cinasa.com.mx',
    subject: 'Notificación',
    text: 'Cuerpo del correo en texto plano',
    html: 'Buen día ' + '<b>' +  nombre + '</b>.<br>' + 'Comparto tu acceso como ' + '<b>' +  tipo_usuario + '</b>' + ' a la nueva ' + '<b>' + 'Plataforma de Vacaciones.' + '</b><br><br>' + '<b>Usuario: </b>' + usuario + '<br>' + '<b>Contraseña: </b>' + contrasena + '<br><br>' + 'Si deseas cambiar tu contraseña, los pasos a seguir los encuentras en el ' + '<b>Manual de Usuario</b>' + ' habilitado en la plataforma como se muestra a continuación.<br>' + '<img src="cid:imagen_login" alt="Login"><br>' + 'Adicional a lo anterior, informarte que, debido al proceso de transición, ' + '<b>los formatos físicos de vacaciones únicamente se recibirán hasta el día 10 de diciembre.</b>' + ' Posterior a esta fecha, todas las solicitudes deberán realizarse exclusivamente a través de la nueva plataforma.<br><br>' + 'Cualquier duda comunícate con el área de ' + '<b>Sistemas</b>' + ' o ' + '<b>Relaciones Industriales</b>.<br><br>' + 'Saludos.',
    attachments: [
      {
        filename: 'login.png',
        path: 'attachments/login.png', // Ruta local de tu imagen
        cid: 'imagen_login'
      },
    ]
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
    console.log('Datos del frontend:', datosRecibidos);
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
    // const clave = datosRecibidos.clave;
    const clave = datosRecibidos.noTarjeta;
    const dep = datosRecibidos.depto;

    const periodo = datosRecibidos.Periodo;
    const genera = datosRecibidos.Genera;

    const jefe_inmediato = datosRecibidos.Jefe;
    // await enviarCorreo();
    const respuesta = await insertarSolicitud(nombre,fecha,dias,fechaA,fechaH,tpermiso1,motivo,firmaInt,clave,tpermiso2,tpermiso3,tpermiso4,tipo_solicitud,dep,periodo,genera,jefe_inmediato);
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

async function insertarSolicitud(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve, paramDiez, paramOnce, paramDoce, paramTrece, paramCatorce, paramQuince, paramDiesyseis, paramVeite) {
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
        request.input('clave', sql.NVarChar, paramNueve);
        request.input('dep', sql.NVarChar, paramCatorce);

        request.input('periodo', sql.NVarChar, paramQuince);
        request.input('genera', sql.NVarChar, paramDiesyseis);
        request.input('relacion', sql.NVarChar, paramVeite);
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

        // const tiempoEjecucion = new Date(); 
        
        // // 1. Formatea la fecha en formato ISO estándar (YYYY-MM-DD HH:mm:ss)
        // // Este formato es universalmente entendido por SQL Server sin problemas de idioma.
        // // getTimezoneOffset() ajusta la hora para reflejar la hora local del servidor si es necesario, 
        // // pero usar toISOString().slice(0, 19).replace('T', ' ') es una forma rápida de obtener el formato estándar.
        
        // // Forma robusta de obtener formato SQL estándar local:
        // const fechaSQLStandard = tiempoEjecucion.toISOString().slice(0, 19).replace('T', ' ');

        // // 2. Imprime el resultado para depuración.
        // console.log('Fecha en formato SQL estándar:' + fechaSQLStandard);

        // // 3. Envía la CADENA formateada como NVarChar
        // // Cambia sql.DateTime2 de vuelta a sql.NVarChar
        // request.input('date', sql.NVarChar, fechaSQLStandard); 

        const result = await request.query("INSERT INTO [Vac.solicitud] (clave, nombre, departamento, fecha_solicitud, tipo_solicitud, cuantos_dias, fecha_apartir, fecha_hasta, con_sueldo, sin_sueldo, sindicalizado, no_sindicalizado, motivo, firma_interesado, firma_jefe_in, firma_gerente, status, periodo, genera, reldep) VALUES (@clave, @nombre, @dep, @fecha, @tipo_sol, @dias, @fechaA, @fechaH, @permiso1, @permiso2, @permiso3, @permiso4, @motivo, @date, '', '', 'Interesado', @periodo, @genera, @relacion)");
        const resultUpdate = await request.query("UPDATE cin_emp SET emp_estsol = 'Pendiente' WHERE emp_cve = @clave");
        
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
          await enviarCorreoInsertado(paramUno, paramTres, paramCuatro, paramCinco, permiso1, permiso2, permiso3, permiso4, paramSiete, paramTrece, paramVeite);
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

        const query = "UPDATE [Vac.solicitud] SET firma_jefe_in = @date, status = 'Jefe Inmediato' WHERE id = @id"
        
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

        const result = await request.query("UPDATE [Vac.solicitud] SET status = 'Aceptado' WHERE id = @id");
     
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
    console.log('Datos del frontend:', datosRecibidos);
    const id = datosRecibidos.id;
    const accion = datosRecibidos.accion;
    const dias_d = datosRecibidos.dias_d != null ? datosRecibidos.dias_d.toString() : '0';
    const dias_u = datosRecibidos.dias_u != null ? datosRecibidos.dias_u.toString() : '0';
    const clave = datosRecibidos.clave.toString();
    const periodo = datosRecibidos.periodo;
    const correo = datosRecibidos.correo;
    const nombre = datosRecibidos.nombre;
    const genera = datosRecibidos.genera;
  
    const respuesta = await aprobarSolicitud(id, accion, dias_d, dias_u, clave, periodo, correo, nombre, genera);
    var resAlFrondend;
    if(respuesta.rowsAffected = 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }
    
    res.send(resAlFrondend);
  
})

async function aprobarSolicitud(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        // console.log(paramUno, paramDos, paramTres, paramCuatro, paramCinco);
        var queryUpdateUno = '';
        var queryUpdateDos = '';
        var queryUpdateTres = '';

        var queryCuatro = '';
        var email_genera = '';
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('clave', sql.NVarChar, paramCinco);
        request.input('id', sql.Int, paramUno);
        request.input('dias_d', sql.NVarChar, paramTres);
        request.input('dias_u', sql.NVarChar, paramCuatro);

        request.input('periodo', sql.NVarChar, paramSeis);

        request.input('Clave_genera', sql.NVarChar, paramNueve);
        
        if(paramNueve){
          queryCuatro = "SELECT emp_mail from cin_emp where emp_cve = @Clave_genera";
          const result_mail = await request.query(queryCuatro);
          email_genera = result_mail.recordset[0].emp_mail
          console.log('Correo para enviar: ', email_genera);
        }
        if(paramDos == 1){
          queryUpdateUno = "UPDATE [Vac.solicitud] SET status = 'Completado' WHERE id = @id"
          queryUpdateDos = "UPDATE [Vac.control_vacaciones] SET Saldo = @dias_d, Vacaciones_tomadas = @dias_u WHERE Clave = @clave and Periodo = @periodo"
          queryUpdateTres = "UPDATE cin_emp SET emp_estsol = 'Disponible' WHERE emp_cve = @clave"
            
          await enviarCorreoAceptado(email_genera, paramOcho);
        }
        if(paramDos == 0){
          queryUpdateUno = "UPDATE [Vac.solicitud] SET status = 'Rechazado' WHERE id = @id"
          queryUpdateDos = "UPDATE cin_emp SET emp_estsol = 'Disponible' WHERE emp_cve = @clave"
          // console.log(email_genera);
          await enviarCorreoRechazado(email_genera, paramOcho);

        }

        
        const resultUno = await request.query(queryUpdateUno);
        const resultDos = await request.query(queryUpdateDos);
        const resultTres = await request.query(queryUpdateTres);
     
        if(resultUno){
          console.log("Modificado con exito");
          // await enviarCorreo();
        }
        if(resultDos){
          console.log("Modificado con exito");
        }
        if(resultTres){
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
        const result = await request.query("select Apellido_materno,Apellido_paterno,CURP,C_costos,Clave,Departamento,Dias_disponibles,Dias_ocupados,Dias_vacaciones,Estatus,Estatus_Solicitud,Fecha_de_alta,Fecha_de_baja,Fecha_de_nacimiento,Nombre,Nombre_completo,Puesto,RFC,Sexo,Tipo,Tipo_Dep, Dias_disponibles_p2, Dias_ocupados_p2 ,Dias_vacaciones_p2 from colaboradores_julio_2025 where Usuario = @user AND Contraseña = @pass");

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

async function consultarSolicitudes(tipo, relacion) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa solicitudes');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        var consulta = '';
        var updateStatus = '';

        if(tipo == 'JI' && relacion == 'ORLS'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'ORLS' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'FRV'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'FRV' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'JJBP'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'JJBP' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'CNVS' || tipo == 'JI' && relacion == 'EMRP'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'CNVS' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'SCMG'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'SCMG' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'KAR' || tipo == 'JI' && relacion == 'MVHA' || tipo == 'JI' && relacion == 'JFVE' || tipo == 'JI' && relacion == 'YMGS' || tipo == 'JI' && relacion == 'FJTR'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'SCMG' and s.departamento = 'TECNICO' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'GHGS' || tipo == 'JI' && relacion == 'AGE'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'GHGS' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'JBG' || tipo == 'JI' && relacion == 'GHGS'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'JBG' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'FLG'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'FLG' order by id desc";
        }
        // if(tipo == 'G'){
        //   consulta = "select u.*, s.* from cin_emp as u, [Vac.solicitud] as s where u.emp_cve = s.clave and (s.departamento = 'SISTEMAS DE INFORMACION' or s.departamento = 'ALMACEN') and s.status = 'Jefe Inmediato' order by id desc";
        // }
        if(tipo == 'RI'){
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status != 'Completado' and s.status != 'Rechazado' and s.status != 'Inhabil' order by id desc;";
        }

        if(tipo == 'JI' && relacion == 'TJRH'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'TJRH' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'JGH'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'MMM' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'GLR' || tipo == 'JI' && relacion == 'AOP'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'GLR' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'BHTC'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'GLR' and s.departamento = 'EMBARQUES Y EMPAQUES' order by id desc";
        }

        if(tipo == 'JI' && relacion == 'JCJ'){     
          consulta = "select s.*, c.*, e.emp_mail, e.emp_puesto from [Vac.solicitud] as s, [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = s.clave and e.emp_cve = s.clave and s.periodo = c.Periodo and s.status = 'Interesado' and s.reldep = 'GLR' and (s.departamento = 'ALMACEN' or s.departamento = 'CONTROL DE PRODUCCION')  order by id desc";
        }
     
        // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
        const result = await request.query(consulta);
     
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
    // console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const departamento =  datosRecibidos.departamento;
    const anio = datosRecibidos.anio;
    const mes = datosRecibidos.mes;
    const criterio = datosRecibidos.criterio.criterio;
    const tipoUsuario = datosRecibidos.tipo;
    const rel_dep = datosRecibidos.relacion;
  
    const result = await reporteConsultar(departamento, anio, mes, criterio, tipoUsuario, rel_dep);
    // console.log(result);
    res.send(result);
});

async function reporteConsultar(paramDepto, paramAnio, paramMes, paramCriterio, tipoUsuario, relacion) {
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
        request.input('relacion', sql.NVarChar, relacion);

        // Mostrar los componentes de la fecha
        // console.log(`Año: ${año}`);
        // console.log(`Mes: ${mes}`);
        // console.log(`Día: ${dia}`);

        // Para obtener la fecha completa en un formato legible
        // console.log(fechaActual.toDateString());

        var consulta = '';

        if(tipoUsuario == 'RI'){

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select a.*, s.* from [Vac.control_vacaciones] as a, [Vac.solicitud] as s where a.Clave = s.clave and a.Departamento = @depto and a.Periodo = s.periodo order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = "select a.*, s.* from [Vac.control_vacaciones] as a, [Vac.solicitud] as s where a.Clave = s.clave and a.Periodo = s.periodo and fecha_solicitud like @anio order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = "select a.*, s.* from [Vac.control_vacaciones] as a, [Vac.solicitud] as s where a.Clave = s.clave and a.Periodo = s.periodo and fecha_solicitud like @mes and fecha_solicitud like @anioMes order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo order by id desc';
            }

            if(paramDepto != '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = s.clave and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @anio order by id desc';
            }

            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = s.clave  and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = s.clave and u.Periodo = s.periodo and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto != '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = s.clave and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes order by id desc';
            }

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and u.Departamento = @depto order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes order by id desc';
            }
            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }

            if(paramDepto != '' && paramAnio == '' && paramMes != '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @mes order by id desc';
            }

            if(paramDepto != '' && paramAnio != '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @anio order by id desc';
            }
        }

        if(tipoUsuario == 'JI' && relacion){

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select a.*, s.* from [Vac.control_vacaciones] as a, [Vac.solicitud] as s where a.Clave = s.clave and a.Periodo = s.periodo and a.Departamento = @depto order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = "select a.*, s.* from [Vac.control_vacaciones] as a, [Vac.solicitud] as s where a.Clave = s.clave and a.Periodo = s.periodo and s.fecha_solicitud like @anio and s.reldep = @relacion order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = "select a.*, s.* from [Vac.control_vacaciones] as a, [Vac.solicitud] as s where a.Clave = s.clave and a.Periodo = s.periodo and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes and s.reldep = @relacion order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = "select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and s.reldep = @relacion order by id desc";
            }

            if(paramDepto != '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = s.clave and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = s.clave and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
                consulta = "select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = s.clave and u.Periodo = s.periodo and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio and s.reldep = @relacion order by id desc";
            }
            if(paramDepto != '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = s.clave and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes order by id desc';
            }

            if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and u.Departamento = @depto order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio != ''){
                consulta = "select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and s.fecha_solicitud like @anio and s.reldep = @relacion order by id desc";
            }
            if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio != ''){
                consulta = "select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes and s.reldep = @relacion order by id desc";
            }
            if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
            }

            if(paramDepto != '' && paramAnio == '' && paramMes != '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @mes order by id desc';
            }

            if(paramDepto != '' && paramAnio != '' && paramMes == '' && paramCriterio != ''){
                consulta = 'select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and u.Departamento = @depto and s.fecha_solicitud like @anio order by id desc';
            }
            if(paramDepto == '' && paramAnio != '' && paramMes != '' && paramCriterio != ''){
                consulta = "select u.*, s.* from [Vac.control_vacaciones] as u, [Vac.solicitud] as s where u.Clave = @criterio and s.clave = @criterio and u.Periodo = s.periodo and s.fecha_solicitud like @mes and s.reldep = @relacion and s.fecha_solicitud like @anio order by id desc";
            }


        }

        // if(tipoUsuario == 'G'){

        //     if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio == ''){
        //         consulta = 'select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and a.Departamento = @depto order by id desc';
        //     }
        //     if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
        //         consulta = "select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and fecha_solicitud like @anio and (a.Departamento = 'MANTENIMIENTO' or a.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
        //     }
        //     if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
        //         consulta = "select a.C_costos, a.Clave, a.Nombre_completo, a.Departamento, a.Puesto, a.Fecha_de_alta, a.Estatus, a.Dias_vacaciones, a.Dias_disponibles, a.Dias_ocupados, s.* from colaboradores_julio_2025 as a, solicitud_vacaciones as s where a.Clave = s.clave and fecha_solicitud like @mes and fecha_solicitud like @anioMes and (a.Departamento = 'MANTENIMIENTO' or a.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
        //     }
        //     if(paramDepto == '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
        //         consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
        //     }

        //     if(paramDepto != '' && paramAnio != '' && paramMes == '' && paramCriterio == ''){
        //         consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @anio order by id desc';
        //     }
        //     if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
        //         consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
        //     }
        //     if(paramDepto == '' && paramAnio != '' && paramMes != '' && paramCriterio == ''){
        //         consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
        //     }
        //     if(paramDepto != '' && paramAnio == '' && paramMes != '' && paramCriterio == ''){
        //         consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = s.clave and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes order by id desc';
        //     }

        //     if(paramDepto != '' && paramAnio == '' && paramMes == '' && paramCriterio != ''){
        //         consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and u.Departamento = @depto order by id desc';
        //     }
        //     if(paramDepto == '' && paramAnio != '' && paramMes == '' && paramCriterio != ''){
        //         consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and s.fecha_solicitud like @anio and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
        //     }
        //     if(paramDepto == '' && paramAnio == '' && paramMes != '' && paramCriterio != ''){
        //         consulta = "select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and s.fecha_solicitud like @mes and s.fecha_solicitud like @anioMes and (u.Departamento = 'MANTENIMIENTO' or u.Departamento = 'SISTEMAS DE INFORMACION') order by id desc";
        //     }
        //     if(paramDepto != '' && paramAnio != '' && paramMes != '' && paramCriterio != ''){
        //         consulta = 'select u.C_costos, u.Clave, u.Nombre_completo, u.Departamento, u.Puesto, u.Fecha_de_alta, u.Estatus, u.Dias_vacaciones, u.Dias_disponibles,u.Dias_ocupados, s.* from colaboradores_julio_2025 as u, solicitud_vacaciones as s where u.Clave = @criterio and s.clave = @criterio and u.Departamento = @depto and s.fecha_solicitud like @mes and s.fecha_solicitud like @anio order by id desc';
        //     }

        // }

        const result = await request.query(consulta);

        // Agrupar por la propiedad 'Clave'
        // const grupos = Object.groupBy(result.recordset, (objeto) => {
        //     return objeto.Clave;
        // });
        // var resultadoOrdenado = [];
        // // Iterar sobre los grupos y procesar solo el primer elemento de cada uno
        // for (const claveUno in grupos) {
        //     if (Object.hasOwnProperty.call(grupos, claveUno)) {
        //         const primerElemento = grupos[claveUno][0];
        //         resultadoOrdenado.push(primerElemento);
        //     }
        // } 
     
        // console.log('Datos de la consulta:', result.recordset);
        const data = result.recordset;
        // const data = resultadoOrdenado;
                
     
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
    const relacion = datosRecibidos.relacion;
    const data = await consultarSolicitudes(tipo, relacion);
    res.send(data);
});

// Define una ruta
app.post('/colaboradores-asociados', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const tipo = datosRecibidos.tipo;
    const tipo_dep = datosRecibidos.tipo_dep;
    const departamento = datosRecibidos.depto;
    const clave = datosRecibidos.clave;
    const data = await consultarColAsociados(clave, tipo, tipo_dep, departamento);
    res.send(data);
});

async function consultarColAsociados(clave, tipo, tipo_dep, departamento) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();
        request.input('depto', sql.NVarChar, departamento);

        var consulta = '';

        // ****************** CONSULTA (CERAMICA, HORNOS, TERMINADO)
        if(tipo == 'S' && tipo_dep == 'ORLS' && (clave != '200105' || clave != '200192')){
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and (e.emp_tipo = 'C' or e.emp_tipo = 'S') and e.emp_estatus != 'Baja' and e.emp_reldep = 'ORLS' and e.Descripcion = @depto;"
        }
        // ****************** CONSULTA (PUNTAS MONTADAS, SHELLACK)
        if(tipo == 'S' && tipo_dep == 'ORLS' && (clave == '200105' || clave == '200192')){
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and (e.emp_tipo = 'C' or e.emp_tipo = 'S') and e.emp_estatus != 'Baja' and e.emp_reldep = 'ORLS' and (e.Descripcion = 'PUNTAS MONTADAS' or e.Descripcion = 'SHELLACK')"
        }
        // ****************** CONSULTA (HORNEROS)
        if(tipo == 'S' && tipo_dep == 'FRV' && clave == '200178'){
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and (e.emp_tipo = 'C' or e.emp_tipo = 'S') and e.emp_estatus != 'Baja' and e.emp_reldep = 'FRV' and e.Descripcion = 'HORNEROS'"
        }
        // ****************** CONSULTA (ING.NVO.PROYECTOS REFRACTARIOS)
        if(tipo == 'S' && tipo_dep == 'FRV' && clave == '200022'){
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and (e.emp_tipo = 'C' or e.emp_tipo = 'S') and e.emp_estatus != 'Baja' and e.emp_reldep = 'FRV' and e.Descripcion = 'ING.NVO.PROYECTOS REFRACTARIOS'"
        }
        // ****************** CONSULTA (MANTENIMIENTO)
        if(tipo == 'S' && tipo_dep == 'FRV' && (clave == '200178' || clave == '200022' || clave == '200038' || clave == '200083' || clave == '200213' || clave == '200254')){
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and (e.emp_tipo = 'C' or e.emp_tipo = 'S') and e.emp_estatus != 'Baja' and e.emp_reldep = 'FRV' and e.Descripcion like 'MANTENIMIENTO%'"
        }
        // ****************** CONSULTA (REFRACTARIOS, ESPECIALIDADES REFRACTARIAS)
        if(tipo == 'S' && tipo_dep == 'JJBP' && clave == '200005'){
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and (e.emp_tipo = 'C' or e.emp_tipo = 'S') and e.emp_estatus != 'Baja' and e.emp_reldep = 'JJBP' and (e.Descripcion = 'REFRACTARIOS' or e.Descripcion = 'ESPECIALIDADES REFRACTARIAS')"
        }
        // ****************** CONSULTA (CONTROL DE CALIDAD)
        if(tipo == 'S' && tipo_dep == 'SCMG' && clave == '300043'){
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and (e.emp_tipo = 'C' or e.emp_tipo = 'S') and e.emp_estatus != 'Baja' and e.emp_reldep = 'SCMG' and e.Descripcion = 'CONTROL DE CALIDAD'"
        }

        // ****************** CONSULTA (EMBARQUES Y EMPAQUES)
        if(tipo == 'S' && tipo_dep == 'GLR' && clave == '0200267'){
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and (e.emp_tipo = 'C' or e.emp_tipo = 'S') and e.emp_estatus != 'Baja' and e.emp_reldep = 'GLR' and e.Descripcion = 'EMBARQUES Y EMPAQUES'"
        }

        // ****************** CONSULTA (ALMACEN)
        if(tipo == 'S' && tipo_dep == 'GLR' && clave == '300175'){
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and (e.emp_tipo = 'C' or e.emp_tipo = 'S') and e.emp_estatus != 'Baja' and e.emp_reldep = 'GLR' and (e.Descripcion = 'ALMACEN' or e.Descripcion = 'CONTROL DE PRODUCCION')"
        }

        if(tipo == 'RIA'){
          
            consulta = "select e.*, c.* from cin_emp as e, [Vac.control_vacaciones] as c where e.emp_cve = c.Clave and e.emp_status != 'B';"
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

        var consulta = "select * from [Vac.solicitud] where clave = @clave and (status = 'Completado' or status = 'Rechazado')";
        
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Define una ruta
app.post('/colaboradoresHistorial', async (req, res) => {
    const datosRecibidos = req.body;
    // console.log('Datos:', datosRecibidos);
    // res.status(200).send({ mensaje: 'Datos recibidos correctamente' });
    const clave = datosRecibidos.clave
    const data = await consultarHistorialColaboradores(clave);
    res.send(data);
});

async function consultarHistorialColaboradores(clave) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosaT');
  
        // Crear una solicitud (request)
        const request = new sql.Request();
        request.input('clave', sql.Int, clave);

        var consulta = "select * from [Vac.solicitud] where genera = @clave and (status = 'Completado' or status = 'Rechazado')";
        
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Define una ruta
app.post('/generar-inhabil', async (req, res) => {

    var datosRecibidos = req.body;
    // console.log(datosRecibidos.fecha);
    var respuesta;
    const colaboradores = await consultaGeneral();
    // console.log(colaboradores);
    var dias_oc;
    var dias_di;
    var periodo;

    // Agrupar por la propiedad 'Clave'
    const grupos = Object.groupBy(colaboradores, (objeto) => {
        return objeto.Clave;
    });

    // Iterar sobre los grupos y procesar solo el primer elemento de cada uno
    for (const claveUno in grupos) {
        if (Object.hasOwnProperty.call(grupos, claveUno)) {
            const primerElemento = grupos[claveUno][0];
            // Realiza tu acción con el primer elemento
            // console.log(`Procesando el primer elemento para la Clave ${clave}:`, primerElemento);
            // ... tu acción aquí ...

        dias_oc = primerElemento.Vacaciones_tomadas + parseInt(datosRecibidos.cDias);
        dias_di = primerElemento.Saldo - parseInt(datosRecibidos.cDias);
        periodo = primerElemento.Periodo;
        relacion = primerElemento.emp_reldep;

      // if(colaborador.Dias_disponibles_p2 != 0){
      //   dias_oc = parseInt(colaborador.Dias_ocupados_p2) + parseInt(datosRecibidos.cDias);
      //   dias_di = parseInt(colaborador.Dias_disponibles_p2) - parseInt(datosRecibidos.cDias);
      //   periodo = 'anterior';
      // }
      // if(colaborador.Dias_disponibles_p2 == 0){
      //   dias_oc = parseInt(colaborador.Dias_ocupados) + parseInt(datosRecibidos.cDias);
      //   dias_di = parseInt(colaborador.Dias_disponibles) - parseInt(datosRecibidos.cDias);
      //   periodo = 'actual';
      // }
      
      // const dias_oc = parseInt(colaborador.Dias_ocupados) + parseInt(datosRecibidos.cDias);
      // const dias_di = parseInt(colaborador.Dias_disponibles) - parseInt(datosRecibidos.cDias);
      
      const dias_o = dias_oc.toString();
      const dias_d = dias_di.toString();
      
      // console.log('Datos del frontend:', datosRecibidos);
      const nombre = primerElemento.Nombre;
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
      const clave = primerElemento.Clave.toString();
      const dep = primerElemento.Departamento;
      // await enviarCorreo();
      respuesta = await insertarSolicitudMasiva(nombre,fecha,dias,fechaA,fechaH,tpermiso1,motivo,firmaInt,clave,tpermiso2,tpermiso3,tpermiso4,tipo_solicitud, dep, dias_o, dias_d, periodo, relacion);
        }
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
    var consulta = "select e.emp_reldep, c.* from [Vac.control_vacaciones] as c, cin_emp as e where c.Clave = e.emp_cve";
    // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
    const result = await request.query(consulta);
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

async function insertarSolicitudMasiva(paramUno, paramDos, paramTres, paramCuatro, paramCinco, paramSeis, paramSiete, paramOcho, paramNueve, paramDiez, paramOnce, paramDoce, paramTrece, paramCatorce, paramQuince, paramDiesiseis, paramDiesisiete, paramDiesiocho) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        // Crear una solicitud (request)
        const request = new sql.Request();
        // console.log(paramNueve);
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
        request.input('clave', sql.NVarChar, paramNueve);
        request.input('dep', sql.NVarChar, paramCatorce);
        request.input('reldep', sql.NVarChar, paramDiesiocho);

        request.input('dias_o', sql.NVarChar, paramQuince);
        request.input('dias_d', sql.NVarChar, paramDiesiseis);
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
        request.input('periodo', sql.NVarChar, paramDiesisiete);

        const result = await request.query("INSERT INTO [Vac.solicitud] (clave, nombre, departamento, fecha_solicitud, tipo_solicitud, cuantos_dias, fecha_apartir, fecha_hasta, con_sueldo, sin_sueldo, sindicalizado, no_sindicalizado, motivo, firma_interesado, firma_jefe_in, firma_gerente, status, periodo, genera, reldep) VALUES (@clave, @nombre, @dep, @fecha, @tipo_sol, @dias, @fechaA, @fechaH, @permiso1, @permiso2, @permiso3, @permiso4, @motivo, @date, @date, @date, 'Completado', @periodo, @clave, @reldep)");
        // const resultUpdate = await request.query("UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Pendiente' WHERE Clave = @clave");
        // const resultUpdateColaborador = await request.query("UPDATE colaboradores_julio_2025 SET Estatus_Solicitud = 'Disponible', Dias_disponibles = @dias_d, Dias_ocupados = @dias_o WHERE Clave = @clave");
        const resultUpdateColaborador = await request.query("UPDATE cin_emp SET emp_estsol = 'Disponible' WHERE emp_cve = @clave");
        const resultUpdate= await request.query("UPDATE [Vac.control_vacaciones] SET Saldo = @dias_d, Vacaciones_tomadas = @dias_o WHERE Clave = @clave and Periodo = @periodo");
        


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
        request.input('clave', sql.NVarChar, paramNueve);

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

        const query = "UPDATE [Vac.solicitud] SET firma_jefe_in = @date, status = 'Jefe Inmediato' WHERE id = @id"
        
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

          const clave = colaborador.clave;
          const id = colaborador.id;

          // Usa la nueva instancia para declarar los parámetros.
          request.input('clave', sql.NVarChar, clave);
          request.input('id', sql.Int, id);

          const queryUpdateUno = "UPDATE [Vac.solicitud] SET status = 'Rechazado' WHERE id = @id";
          const queryUpdateDos = "UPDATE cin_emp SET emp_estsol = 'Disponible' WHERE emp_cve = @clave";

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
      respuesta = await updateColaboradorTodasAceptar(colaborador.id);
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

        request.input('id', sql.Int, paramUno);

        // await enviarCorreoRechazado();

        const resultado = await request.query("UPDATE [Vac.solicitud] SET status = 'Aceptado' where id = @id");
     
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
    console.log('Datos del frontend:', solicitudes);
    var respuesta;
    for(let solicitud of solicitudes){

      // const dias_disponibles = solicitud.Dias_disponibles - parseInt(solicitud.cuantos_dias);
      // const dias_ocupados = solicitud.Dias_ocupados + parseInt(solicitud.cuantos_dias);

      const id = solicitud.id;
      // const dias_d = solicitud.Dias_disponibles.toString();
      // const dias_u = solicitud.Dias_ocupados.toString();
      // const dias_d_p2 = solicitud.Dias_disponibles_p2.toString();
      // const dias_u_p2 = solicitud.Dias_ocupados_p2.toString();
      const dias_dis = solicitud.Saldo - parseInt(solicitud.cuantos_dias);
      const dias_utl = solicitud.Vacaciones_tomadas + parseInt(solicitud.cuantos_dias);
      const dias_d = dias_dis.toString();
      const dias_u = dias_utl.toString();
      const clave = solicitud.clave.toString();
      const periodo = solicitud.periodo;
      const correo = solicitud.emp_mail;
    
      respuesta = await firmarTodoRI(id, dias_d, dias_u, clave, periodo, correo);
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

async function firmarTodoRI(paramUno, paramDos, paramTres, paramSeis, paramSiete, paramOcho) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
        // console.log(paramUno, paramDos, paramTres, paramCuatro, paramCinco);
        var queryUpdateUno = '';
        var queryUpdateDos = '';
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('id', sql.Int, paramUno);
        request.input('dias_d', sql.NVarChar, paramDos);
        request.input('dias_u', sql.NVarChar, paramTres);
        // request.input('dias_d_p2', sql.NVarChar, paramCuatro);
        // request.input('dias_u_p2', sql.NVarChar, paramCinco);
        request.input('clave', sql.NVarChar, paramSeis);

        request.input('periodo', sql.NVarChar, paramSiete);

        queryUpdateUno = "UPDATE [Vac.solicitud] SET status = 'Completado' WHERE id = @id";
        queryUpdateDos = "UPDATE cin_emp SET emp_estsol = 'Disponible' WHERE emp_cve = @clave"; 
        queryUpdateTres = "UPDATE [Vac.control_vacaciones] SET Saldo = @dias_d, Vacaciones_tomadas = @dias_u WHERE Clave = @clave and Periodo = @periodo";
        // await enviarCorreoAceptado();
        
        const resultUno = await request.query(queryUpdateUno);
        const resultDos = await request.query(queryUpdateDos);
        const resultTres = await request.query(queryUpdateTres);
     
        if(resultUno){
          console.log("Modificado con exito");
          // await enviarCorreo();
        }
        if(resultDos){
          console.log("Modificado con exito");
        }
        if(resultTres){
          console.log("Modificado con exito");
          await enviarCorreoAceptadoMasivo(paramOcho);
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

// ******************* CAMBIAR CONTRASEÑA *********************************************************************------>
app.post('/editar-contrasena', async (req, res) => {
    var datosRecibidos = req.body;
    console.log('Datos del frontend:', datosRecibidos);
    const numero_empleado = datosRecibidos.no_emp;
    const contrasena_actual = datosRecibidos.cont_act;
    const nueva_contrasena = datosRecibidos.nu_cont;

    const respuesta = await updateContrasena(numero_empleado, contrasena_actual, nueva_contrasena);

    var resAlFrondend;
    if(respuesta.rowsAffected >= 1){
       resAlFrondend = true;
    }else{
       resAlFrondend = false;
    }

    res.send(resAlFrondend);
})

async function updateContrasena(paramUno, paramDos, paramTres) {
    try {
        await sql.connect(config);
        console.log('Conexión a SQL Server exitosa');
     
        // Crear una solicitud (request)
        const request = new sql.Request();

        request.input('clave', sql.NVarChar, paramUno);
        request.input('contrasena_actual', sql.NVarChar, paramDos);
        request.input('nueva_contrasena', sql.NVarChar, paramTres);

        // await enviarCorreoRechazado();

        const resultado = await request.query("UPDATE cin_emp SET emp_pass = @nueva_contrasena where emp_cve = @clave and emp_pass = @contrasena_actual");
     
        if(resultado){
          console.log("Contraseña modificada con exito");
          // await enviarCorreo();
        }
       
        // Cerrar la conexión
        await sql.close();
        // console.log('Conexión cerrada');
        // console.log(data);
        return resultado;
                
        } catch (err) {
        console.error('Error al conectar o consultar:', err);
    }
}
// *********************************************************************************************************************

//+++++++++++++++++++++++++++++++ ENVIAR CORREOS CON USUARIO Y CONTRASEÑA MASIVO +++++++++++++++++++++++++++++++++++++++
app.post('/enviar-correos', async (req, res) => {
    var senal = req.body;
    console.log('Datos del frontend:', senal);
    const colaboradores = await consultaUsuarios();
    var respuesta;
    for(let colaborador of colaboradores){
      respuesta = await enviarCorreoUsuarioContrasena(colaborador.emp_nom, colaborador.emp_mail, colaborador.emp_usu, colaborador.emp_pass, colaborador.emp_tipo);
    }
    console.log('Lista iterada por completo');

    res.send(true);
})

async function consultaUsuarios() {
  try {
    await sql.connect(config);
    console.log('Conexión a SQL Server exitosa');
    // Crear una solicitud (request)
    const request = new sql.Request();
    var consulta = "select emp_cve, emp_nom, emp_mail, emp_tipo, emp_reldep, emp_usu, emp_pass from cin_emp where emp_mail ! = ''";
    // var consulta = "select emp_cve, emp_nom, emp_mail, emp_tipo, emp_reldep, emp_usu, emp_pass from cin_emp where emp_cve = '300292'";
    // Ejecutar una consulta (ejemplo: seleccionar todos los colaboradores)
    const result = await request.query(consulta);
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
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Incluir archivos de ruta 
const  usersRoute = require ( './routes/api/users' ); 

// Usar rutas app.user
 app.use ( '/users' , usersRoute);

// Ejemplo que especifica el puerto e inicia el servidor 
const port = process.env.PORT || 3000 ; // Puede usar variables de entorno para la configuración del puerto
app.listen (port, () => { 
    console.log ( `El servidor se está ejecutando en el puerto ${port} ` ); 
});