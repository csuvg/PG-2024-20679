// models/AuditLog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    operation_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    table_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    record_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    old_values: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    new_values: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    performed_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'audit_log',
    freezeTableName: true
});

module.exports = AuditLog;
