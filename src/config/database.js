// config/database.js
const { Sequelize } = require('sequelize');
const config = require('./config.js'); // Importa el archivo config.js
const env = process.env.NODE_ENV || 'development'; // Usa el entorno actual
const dbConfig = config[env]; // Carga la configuración para el entorno actual

// Inicializa Sequelize con los datos del archivo config.js
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        dialectOptions: dbConfig.dialectOptions || {},
        define: {
            timestamps: false,
        },
    }
);

module.exports = sequelize;
