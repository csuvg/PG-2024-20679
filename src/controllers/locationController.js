// controllers/locationController.js
const Location = require('../models/Location');
const User = require('../models/User');
const Area = require('../models/Area');
const { logAudit } = require('../utils/auditLogger');
const captureError = require('../middleware/captureError');  // Importar la función de captura de errores

// Guardar una nueva ubicación
exports.saveLocation = async (req, res) => {
    try {
        const { user_id, name, area_id, has_waste_collection } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!user_id || !name || !area_id || !has_waste_collection) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Verificar que el usuario y el área existan
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const area = await Area.findByPk(area_id);
        if (!area) {
            return res.status(404).json({ error: 'Area not found' });
        }

        // Crear la ubicación
        const location = await Location.create({
            user_id,
            name,
            area_id,
            has_waste_collection
        });

        // Registrar auditoría
        await logAudit('CREATE', 'location', location.id, null, location, req.user.id);

        res.status(201).json({ success: true, data: location });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Crear una nueva ubicación (similar a saveLocation)
exports.createLocation = async (req, res) => {
    try {
        const { user_id, name, area_id, has_waste_collection } = req.body;

        // Validar los campos
        if (!user_id || !name || !area_id || !has_waste_collection) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        const location = await Location.create(req.body);

        // Registrar auditoría
        await logAudit('CREATE', 'location', location.id, null, location, req.user.id);

        res.status(201).json({ success: true, data: location });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener una ubicación por su ID
exports.getLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.status(200).json({ success: true, data: location });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener todas las ubicaciones
exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.findAll();
        res.status(200).json({ success: true, data: locations });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Actualizar una ubicación por su ID
exports.updateLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        const oldValues = { ...location.dataValues }; // Clonamos los valores anteriores
        await location.update(req.body);

        // Registrar auditoría
        await logAudit('UPDATE', 'location', location.id, oldValues, location, req.user.id);

        res.status(200).json({ success: true, data: location });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Eliminar una ubicación por su ID
exports.deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        const oldValues = { ...location.dataValues };
        await location.destroy();

        // Registrar auditoría
        await logAudit('DELETE', 'location', location.id, oldValues, null, req.user.id);

        res.status(204).send();
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
