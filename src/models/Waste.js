// models/Waste.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const WasteType = require('./WasteType');

const Waste = sequelize.define('Waste', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    waste_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: WasteType,
            key: 'id',
        }
    },
    is_recyclable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    average_weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
    }
}, {
    tableName: 'waste',
    freezeTableName: true,
});

module.exports = Waste;
