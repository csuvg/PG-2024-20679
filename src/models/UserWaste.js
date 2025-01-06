// models/UserWaste.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Waste = require('./Waste');
const Location = require('./Location');

const UserWaste = sequelize.define('UserWaste', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    waste_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Waste,
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    datetime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Location,
            key: 'id',
        },
    },
}, {
    tableName: 'user_waste',
    freezeTableName: true,
});

module.exports = UserWaste;
