import mysql from 'mysql2'

const pool = mysql.createPool({
    host: "gestoresambientales.com.ec",
    user: "gestore4",
    password:"9NB#4JBv[ek72j",
    database: "gestore4_plantilla",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
pool.getConnection(function(err) {
    if (err) {
      console.error('error connecting: ' + err);
      return;
    }
    console.log('connected as id ' + pool.id);
});
export { pool }