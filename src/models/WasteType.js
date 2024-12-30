// models/WasteType.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WasteType = sequelize.define('WasteType', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type_name: {
        type: DataTypes.STRING,  // Nombre general del tipo de desecho, como 'Plástico', 'Vidrio', etc.
        allowNull: false,
    },
    water_savings_index: {
        type: DataTypes.FLOAT,  // Índice de ahorro de agua en litros por kg de desecho reciclado
        allowNull: false,
    },
    co2_emission_index: {
        type: DataTypes.FLOAT,  // Índice de emisión de CO2 en kg por kg de desecho producido
        allowNull: false,
    }
}, {
    tableName: 'waste_type',
    freezeTableName: true
});

module.exports = WasteType;
