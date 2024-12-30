// models/Location.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Area = require('./Area');

const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING,
    },
    area_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Area,
            key: 'id',
        },
    },
    has_waste_collection: {
        type: DataTypes.ENUM('Yes', 'No', 'Not sure'),
        allowNull: false,
        defaultValue: 'Not sure',
    },
}, {
    tableName: 'location',
    freezeTableName: true
});

module.exports = Location;
