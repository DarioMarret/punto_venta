import { Sequelize } from 'sequelize'

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    pool: {
        max: 5,
        min: 0,
        require: 30000,
        idle: 10000
    },
    logging: false,
});

db.authenticate().then(() => console.log("Conectado a la base de datos: "+process.env.DB_NAME))
    .catch((error) => console.log("No hay conexion a la base de datos: " + error)
);
export default db