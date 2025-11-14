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
    database: 'BdApps',
    user: 'admin',
    password: 'admin',
    options: {
        port: 2100,
        trustServerCertificate: true
    },
};

//CONEXIÓN INSTANCIA TOLLT0100\\MSSQLSERVER01
// const config = {
//     server: '199.5.83.245\\SRV01DAHQ', 
//     database: 'BdApps',
//     user: 'sa',
//     password: 'Cinas@2017',
//     options: {
//         port: 1433,
//         trustServerCertificate: true,
//         cryptoCredentialsDetails: {
//             minVersion: 'TLSv1' // Permite versiones de TLS más antiguas, como TLS 1.0
//         }
//     },

// };

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

// const poole = new sql.ConnectionPool(configure);
// const poolConnecter = poole.connect();
// module.exports = configure;//Exportamos config para usarlo en el archivo de rutas