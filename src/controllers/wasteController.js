// controllers/wasteController.js
const Waste = require('../models/Waste');
const WasteType = require('../models/WasteType');
const { logAudit } = require('../utils/auditLogger');
const captureError = require('../middleware/captureError');  // Importar la función de captura de errores

// Crear un Waste con su relación a WasteType
exports.createWaste = async (req, res) => {
    try {
        const { waste_type_id, is_recyclable, average_weight } = req.body;

        if (!waste_type_id || is_recyclable === undefined) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        const wasteType = await WasteType.findByPk(waste_type_id);
        if (!wasteType) {
            return res.status(404).json({ error: 'WasteType not found' });
        }

        const waste = await Waste.create({
            waste_type_id,
            is_recyclable,
            average_weight: average_weight || null
        });

        await logAudit('CREATE', 'waste', waste.id, null, waste, req.user.id);

        return res.status(201).json({ success: true, data: waste });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener un Waste con su WasteType relacionado
exports.getWaste = async (req, res) => {
    try {
        const waste = await Waste.findByPk(req.params.id, {
            include: WasteType
        });
        if (!waste) {
            return res.status(404).json({ error: 'Waste not found' });
        }
        return res.status(200).json({ success: true, data: waste });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Actualizar un Waste y su relación con WasteType
exports.updateWaste = async (req, res) => {
    try {
        const { waste_type_id, is_recyclable, average_weight } = req.body;

        const waste = await Waste.findByPk(req.params.id);
        if (!waste) {
            return res.status(404).json({ error: 'Waste not found' });
        }

        const oldValues = { ...waste.dataValues };

        const wasteType = await WasteType.findByPk(waste_type_id);
        if (!wasteType) {
            return res.status(404).json({ error: 'WasteType not found' });
        }

        await waste.update({
            waste_type_id: waste_type_id !== undefined ? waste_type_id : waste.waste_type_id,
            is_recyclable: is_recyclable !== undefined ? is_recyclable : waste.is_recyclable,
            average_weight: average_weight || null
        });

        await logAudit('UPDATE', 'waste', waste.id, oldValues, waste, req.user.id);

        return res.status(200).json({ success: true, data: waste });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Eliminar un Waste y su relación con WasteType
exports.deleteWaste = async (req, res) => {
    try {
        const waste = await Waste.findByPk(req.params.id);
        if (!waste) {
            return res.status(404).json({ error: 'Waste not found' });
        }

        const oldValues = { ...waste.dataValues };
        await waste.destroy();

        await logAudit('DELETE', 'waste', waste.id, oldValues, null, req.user.id);

        return res.status(204).send();
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
