// controllers/wasteTypeController.js
const WasteType = require('../models/WasteType');
const { logAudit } = require('../utils/auditLogger');
const captureError = require('../middleware/captureError');  // Importar la función de captura de errores

// Crear un nuevo WasteType
exports.createWasteType = async (req, res) => {
    try {
        const { type_name, water_savings_index, co2_emission_index } = req.body;

        if (!type_name || water_savings_index === undefined || co2_emission_index === undefined) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Crear el WasteType
        const wasteType = await WasteType.create({
            type_name,
            water_savings_index,
            co2_emission_index
        });

        // Registrar auditoría para la creación
        await logAudit('CREATE', 'waste_type', wasteType.id, null, wasteType, req.user.id);

        res.status(201).json({ success: true, data: wasteType });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener un WasteType por su ID
exports.getWasteType = async (req, res) => {
    try {
        const wasteType = await WasteType.findByPk(req.params.id);

        if (!wasteType) {
            return res.status(404).json({ error: 'Waste Type not found' });
        }

        res.status(200).json({ success: true, data: wasteType });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Actualizar un WasteType por su ID
exports.updateWasteType = async (req, res) => {
    try {
        const wasteType = await WasteType.findByPk(req.params.id);
        if (!wasteType) {
            return res.status(404).json({ error: 'Waste Type not found' });
        }

        const oldValues = { ...wasteType.dataValues };

        const { type_name, water_savings_index, co2_emission_index } = req.body;

        // Actualizar los campos necesarios
        await wasteType.update({
            type_name: type_name || wasteType.type_name,
            water_savings_index: water_savings_index !== undefined ? water_savings_index : wasteType.water_savings_index,
            co2_emission_index: co2_emission_index !== undefined ? co2_emission_index : wasteType.co2_emission_index,
        });

        // Registrar auditoría para la actualización
        await logAudit('UPDATE', 'waste_type', wasteType.id, oldValues, wasteType, req.user.id);

        res.status(200).json({ success: true, data: wasteType });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Eliminar un WasteType por su ID
exports.deleteWasteType = async (req, res) => {
    try {
        const wasteType = await WasteType.findByPk(req.params.id);
        if (!wasteType) {
            return res.status(404).json({ error: 'Waste Type not found' });
        }

        const oldValues = { ...wasteType.dataValues };
        await wasteType.destroy();

        // Registrar auditoría para la eliminación
        await logAudit('DELETE', 'waste_type', wasteType.id, oldValues, null, req.user.id);

        res.status(204).send();
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
