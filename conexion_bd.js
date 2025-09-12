const sql = require('mssql');

const config = {
    user: 'admin',
    password: 'admin',
    server: 'TOLLT0100',
    database: 'cinasa_vacaciones',
    options: {
        //encrypt: false,
        trustServerCertificate: true,
        port: 1433
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
module.exports = config;//Exportamos config para usarlo en el archivo de rutas