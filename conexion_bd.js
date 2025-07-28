   const sql = require('mssql');

   const config = {
       user: 'admin',
       password: 'admin',
       server: 'TOLLT0100',
       database: 'cinasa_vacaciones',
       options: {
        //    encrypt: false, // Si es necesario, usa true para conexiones cifradas
           trustServerCertificate: true, //  Si es necesario, usa true para certificados autofirmados
           port: 1433
       }
   };

   const pool = new sql.ConnectionPool(config);
   const poolConnect = pool.connect();
   module.exports = config;