import mysql from 'mysql2'
var Pool = require('pg-pool')
// const pool = mysql.createPool({
//     host: "gestoresambientales.com.ec",
//     user: "gestore4",
//     password:"9NB#4JBv[ek72j",
//     database: "gestore4_plantilla",
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });
// pool.getConnection(function(err) {
//     if (err) {
//       console.error('error connecting: ' + err);
//       return;
//     }
//     console.log('connected as id ' + pool.id);
// });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  ssl: false
};
const pool = new Pool(config)
export { pool }