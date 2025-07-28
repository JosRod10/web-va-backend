const sql = require('mssql');

const config = {
    user: 'admin',//Conexión con SQL Server (Nombre del usuario)
    password: 'admin',//Conexión con SQL Server (Contraseña)
    server: 'TOLLT0100',//Servidor Local (Nombre)
    database: 'cinasa_vacaciones',//Nombre de la base de datos
    options: {
        //encrypt: false, // Si es necesario, usa true para conexiones cifradas
        trustServerCertificate: true, //  Si es necesario, usa true para certificados autofirmados
        port: 1433//Puerto en donde se ejecuta SQL Server
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
module.exports = config;//Exportamos config para usarlo en el archivo de rutas