// config/config.js
require('dotenv').config(); // Cargar variables de entorno desde el archivo .env

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  development: {
    username: process.env.RDS_USERNAME || process.env.DB_USER || 'postgres',
    password: process.env.RDS_PASSWORD || process.env.DB_PASS || 'password',
    database: process.env.RDS_DB_NAME || process.env.DB_NAME || 'database_development',
    host: process.env.RDS_HOSTNAME || process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'postgres'
  },
  test: {
    username: process.env.RDS_USERNAME || process.env.DB_USER || 'postgres',
    password: process.env.RDS_PASSWORD || process.env.DB_PASS || 'password',
    database: process.env.RDS_DB_NAME || process.env.DB_NAME || 'database_test',
    host: process.env.RDS_HOSTNAME || process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'postgres'
  },
  production: {
    username: process.env.RDS_USERNAME || process.env.DB_USER || 'postgres',
    password: process.env.RDS_PASSWORD || process.env.DB_PASS || 'password',
    database: process.env.RDS_DB_NAME || process.env.DB_NAME || 'database_production',
    host: process.env.RDS_HOSTNAME || process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {}
  }
};
