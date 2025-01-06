const UserWaste = require('../models/UserWaste');
const Waste = require('../models/Waste');
const User = require('../models/User');
const Location = require('../models/Location');
const { logAudit } = require('../utils/auditLogger');
const captureError = require('../middleware/captureError');  // Importar la función de captura de errores

// Función para convertir el peso a kilogramos
const convertToKg = (value, unit) => {
    switch (unit) {
        case 'kg':
            return value;  // Ya está en kilogramos
        case 'lb':
            return value * 0.453592;  // Convertir libras a kilogramos
        case 'qq':
            return value * 45.3592;  // Convertir quintales a kilogramos
        default:
            throw new Error('Invalid unit provided');  // Lanza un error si la unidad es inválida
    }
};

// Función makeRegister para registrar UserWaste con conversión
exports.makeRegister = async (req, res) => {
    try {
        const { user_id, waste_id, name, measure_unit, measure_type, weight_unit, datetime, location_id } = req.body;

        // Validar existencia de usuario, tipo de waste y ubicación
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const waste = await Waste.findByPk(waste_id);
        if (!waste) {
            return res.status(404).json({ success: false, error: 'Waste type not found' });
        }

        const location = await Location.findByPk(location_id);
        if (!location) {
            return res.status(404).json({ success: false, error: 'Location not found' });
        }

        // Determinar el valor a almacenar dependiendo de measure_type
        let finalWeight;
        if (measure_type === 'weight') {
            // Si es peso, convertir a kilogramos
            finalWeight = convertToKg(measure_unit, weight_unit);
        } else if (measure_type === 'unit') {
            // Si es en unidades, multiplicar por el peso promedio del waste
            if (waste.average_weight) {
                finalWeight = measure_unit * waste.average_weight;  // Convertir a kilogramos
            } else {
                return res.status(400).json({ error: 'Average weight not defined for this waste type' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid measure type' });
        }

        // Crear el registro de UserWaste
        const userWaste = await UserWaste.create({
            user_id,
            waste_id,
            name,
            weight: finalWeight,  // Almacenar el peso en kilogramos
            datetime,
            location_id,
        });

        // Registrar auditoría
        await logAudit('CREATE', 'user_waste', userWaste.id, null, userWaste, req.user.id);

        res.status(201).json({ success: true, data: userWaste });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Crear un UserWaste directamente
exports.createUserWaste = async (req, res) => {
    try {
        const { user_id, waste_id, name, measure_unit, measure_type, weight_unit, datetime, location_id } = req.body;

        // Validar existencia de usuario, tipo de waste y ubicación
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const waste = await Waste.findByPk(waste_id);
        if (!waste) {
            return res.status(404).json({ error: 'Waste type not found' });
        }

        const location = await Location.findByPk(location_id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        // Determinar el valor a almacenar dependiendo de measure_type
        let finalWeight;
        if (measure_type === 'weight') {
            finalWeight = convertToKg(measure_unit, weight_unit);  // Convertir a kilogramos
        } else if (measure_type === 'unit') {
            if (waste.average_weight) {
                finalWeight = measure_unit * waste.average_weight;  // Convertir a kilogramos
            } else {
                return res.status(400).json({ error: 'Average weight not defined for this waste type' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid measure type' });
        }

        // Crear registro de UserWaste
        const userWaste = await UserWaste.create({
            user_id,
            waste_id,
            name,
            weight: finalWeight,  // Almacenar en kilogramos
            datetime,
            location_id,
        });

        // Registrar auditoría
        await logAudit('CREATE', 'user_waste', userWaste.id, null, userWaste, req.user.id);

        res.status(201).json(userWaste);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener un UserWaste específico
exports.getUserWaste = async (req, res) => {
    try {
        const userWaste = await UserWaste.findByPk(req.params.id);
        if (!userWaste) {
            return res.status(404).json({ error: 'UserWaste not found' });
        }
        res.status(200).json(userWaste);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener todos los UserWastes
exports.getUserWastes = async (req, res) => {
    try {
        const userWastes = await UserWaste.findAll();
        res.status(200).json(userWastes);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Actualizar un UserWaste
exports.updateUserWaste = async (req, res) => {
    try {
        const userWaste = await UserWaste.findByPk(req.params.id);
        if (!userWaste) {
            return res.status(404).json({ error: 'UserWaste not found' });
        }

        const { measure_unit, measure_type, weight_unit } = req.body;
        const oldValues = { ...userWaste.dataValues };

        // Actualizar según el tipo de medida
        if (measure_type === 'weight') {
            userWaste.weight = convertToKg(measure_unit, weight_unit);  // Convertir a kilogramos
        } else if (measure_type === 'unit') {
            const waste = await Waste.findByPk(userWaste.waste_id);
            if (waste.average_weight) {
                userWaste.weight = measure_unit * waste.average_weight;  // Convertir a kilogramos
            } else {
                return res.status(400).json({ error: 'Average weight not defined for this waste type' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid measure type' });
        }

        await userWaste.save();

        // Registrar auditoría
        await logAudit('UPDATE', 'user_waste', userWaste.id, oldValues, userWaste, req.user.id);

        res.status(200).json(userWaste);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Eliminar un UserWaste
exports.deleteUserWaste = async (req, res) => {
    try {
        const userWaste = await UserWaste.findByPk(req.params.id);
        if (!userWaste) {
            return res.status(404).json({ error: 'UserWaste not found' });
        }

        const oldValues = { ...userWaste.dataValues };
        await userWaste.destroy();

        // Registrar auditoría
        await logAudit('DELETE', 'user_waste', userWaste.id, oldValues, null, req.user.id);

        res.status(204).send();
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
