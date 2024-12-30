// controllers/areaController.js
const Area = require('../models/Area');
const { logAudit } = require('../utils/auditLogger');
const captureError = require('../middleware/captureError');  // Importar la función de captura de errores

// Crear un nuevo área
exports.createArea = async (req, res) => {
    try {
        const { city, area } = req.body;

        // Validación de campos requeridos
        if (!city || !area) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Crear el área
        const newArea = await Area.create({ city, area });

        // Registrar auditoría para la creación
        await logAudit('CREATE', 'area', newArea.id, null, newArea, req.user.id);

        res.status(201).json({ success: true, data: newArea });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener un área por su ID
exports.getArea = async (req, res) => {
    try {
        const area = await Area.findByPk(req.params.id);

        if (!area) {
            return res.status(404).json({ error: 'Area not found' });
        }

        res.status(200).json({ success: true, data: area });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener todas las áreas
exports.getAreas = async (req, res) => {
    try {
        const areas = await Area.findAll();
        res.status(200).json({ success: true, data: areas });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Actualizar un área por su ID
exports.updateArea = async (req, res) => {
    try {
        const area = await Area.findByPk(req.params.id);

        if (!area) {
            return res.status(404).json({ error: 'Area not found' });
        }

        const oldValues = { ...area.dataValues }; // Guardar los valores previos
        await area.update(req.body);

        // Registrar auditoría para la actualización
        await logAudit('UPDATE', 'area', area.id, oldValues, area, req.user.id);

        res.status(200).json({ success: true, data: area });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Eliminar un área por su ID
exports.deleteArea = async (req, res) => {
    try {
        const area = await Area.findByPk(req.params.id);

        if (!area) {
            return res.status(404).json({ error: 'Area not found' });
        }

        const oldValues = { ...area.dataValues }; // Guardar los valores previos
        await area.destroy();

        // Registrar auditoría para la eliminación
        await logAudit('DELETE', 'area', area.id, oldValues, null, req.user.id);

        res.status(204).send();
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
