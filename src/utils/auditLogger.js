// utils/auditLogger.js
const AuditLog  = require('../models/AuditLog');

// Función para registrar las operaciones en la tabla audit_log
exports.logAudit = async (operation, table, recordId, oldValues, newValues, performedBy) => {
    try {
        await AuditLog.create({
            operation_type: operation,
            table_name: table,
            record_id: recordId,
            old_values: oldValues ? JSON.stringify(oldValues) : null,
            new_values: newValues ? JSON.stringify(newValues) : null,
            performed_by: performedBy
        });
    } catch (error) {
        console.error('Error logging audit:', error);
    }
};
