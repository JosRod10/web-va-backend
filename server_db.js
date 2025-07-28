   const express = require('express');
   const sql = require('mssql');

   const app = express();
   const port = 3000;

   // Configuración de la conexión a la base de datos
   const config = {
       user: 'admin',
       password: 'admin',
       server: 'TOLLT0100',
       database: 'cinasa_vacaciones',
       options: {
           encrypt: false, // Deshabilitar cifrado (opcional)
           trustServerCertificate: true // Confiar en el certificado del servidor (opcional)
       }
   };

   async function conectarYConsultar() {
       try {
           await sql.connect(config);
           console.log('Conexión a SQL Server exitosa');

           // Crear una solicitud (request)
           const request = new sql.Request();

           // Ejecutar una consulta (ejemplo: seleccionar todos los empleados)
           const result = await request.query('SELECT * FROM Users');

           console.log('Datos de la consulta:', result.recordset);

           // Cerrar la conexión
           await sql.close();
           console.log('Conexión cerrada');

       } catch (err) {
           console.error('Error al conectar o consultar:', err);
       }
   }

   // Ruta para la conexión y consulta
   app.get('/', async (req, res) => {
       await conectarYConsultar();
       res.send('Consulta realizada, verifica la consola');
   });

   app.listen(port, () => {
       console.log(`Servidor escuchando en el puerto ${port}`);
   });