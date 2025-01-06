// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
    },
    lastname: {
        type: DataTypes.STRING,
    },
    birthdate: {
        type: DataTypes.DATE,
    },
    profile_photo: {
        type: DataTypes.TEXT,  // Almacenamos la imagen en formato base64 como un texto largo
        allowNull: true,        // Permitimos que sea nulo, en caso de que el usuario no suba ninguna imagen
    }
}, {
    tableName: 'user',
    freezeTableName: true  // Congelamos el nombre de la tabla para que no se pluralice automáticamente
});

module.exports = User;
