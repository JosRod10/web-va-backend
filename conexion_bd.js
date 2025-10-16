const sql = require('mssql');

//CONEXIÓN SIN INSTANCIA
// const config = {
//     user: 'admin',
//     password: 'admin',
//     server: 'TOLLT0100',
//     database: 'cinasa_vacaciones',
//     options: {
//         //encrypt: false,
//         trustServerCertificate: true,
//         port: 1433
//     }
// };

//CONEXIÓN INSTANCIA TOLLT0100\\MSSQLSERVER01
const config = {
    server: 'TOLLT0100\\MSSQLSERVER01', 
    database: 'cinasa',
    user: 'admin',
    password: 'admin',
    options: {
        port: 2100,
        trustServerCertificate: true
    },
};

//CONEXIÓN INSTANCIA TOLLT0100\\MSSQLSERVER03
// const config = {
//     server: 'TOLLT0100\\MSSQLSERVER03', 
//     database: 'cinasa_vac',
//     user: 'admin',
//     password: 'admin',
//     options: {
//         port: 2101,
//         trustServerCertificate: true
//     },
// };

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
module.exports = config;//Exportamos config para usarlo en el archivo de rutas