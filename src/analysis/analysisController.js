// analysis/analysisController.js
const { 
    getRecyclableWasteStatsQuery, 
    getTop5LocationsByWasteQuery, 
    getWaterSavingsQuery, 
    getCO2SavingsQuery, 
    getTop5WasteTypesByWeightQuery,
    getWasteWeightLast7DaysQuery,
    getDailyAverageWasteLastMonthQuery, 
    getWasteTodayQuery,
    getRecyclableWasteStatsQueryAll, 
    getTop5LocationsByWasteQueryAll, 
    getWaterSavingsQueryAll, 
    getCO2SavingsQueryAll, 
    getTop5WasteTypesByWeightQueryAll,
    getWasteWeightLast7DaysQueryAll,
} = require('./queries/userWasteAnalysis');
const captureError = require('../middleware/captureError');  // Importar la función de captura de errores

// Obtener estadísticas de desechos reciclables y no reciclables por usuario (último mes)
exports.getRecyclableWasteStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const sequelize = req.app.locals.sequelize;
        const result = await getRecyclableWasteStatsQuery(sequelize, userId);

        const stats = {
            recyclable_weight: result.recyclable_weight || 0,
            non_recyclable_weight: result.non_recyclable_weight || 0,
        };

        res.status(200).json(stats);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener el top 5 de ubicaciones con más cantidad de basura registrada por usuario (último mes)
exports.getTop5LocationsByWaste = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const sequelize = req.app.locals.sequelize;
        const result = await getTop5LocationsByWasteQuery(sequelize, userId);

        const locations = result.length > 0 ? result : [{ location_name: 'N/A', total_weight: 0 }];

        res.status(200).json(locations);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener ahorro de agua por usuario (último mes)
exports.getWaterSavings = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const sequelize = req.app.locals.sequelize;
        const result = await getWaterSavingsQuery(sequelize, userId);

        const waterSavings = result || 0;

        res.status(200).json({ water_savings: waterSavings });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener ahorro de CO2 por usuario (último mes)
exports.getCO2Savings = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const sequelize = req.app.locals.sequelize;
        const result = await getCO2SavingsQuery(sequelize, userId);

        const co2Savings = result || 0;

        res.status(200).json({ co2_savings: co2Savings });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener el top 5 de tipos de desechos con mayor cantidad (por peso) por usuario (último mes)
exports.getTop5WasteTypes = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const sequelize = req.app.locals.sequelize;
        const result = await getTop5WasteTypesByWeightQuery(sequelize, userId);

        const wasteTypes = result.length > 0 ? result : [{ waste_type: 'N/A', total_weight: 0 }];

        res.status(200).json(wasteTypes);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener la cantidad de basura (en peso) ingresada en los últimos 7 días
exports.getWasteWeightLast7Days = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const sequelize = req.app.locals.sequelize;
        const result = await getWasteWeightLast7DaysQuery(sequelize, userId);

        const wasteData = result.length > 0 ? result : [{ day_month: 'N/A', total_weight: 0 }];

        res.status(200).json(wasteData);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener la comparación entre el promedio diario del último mes y la cantidad de basura desechada hoy
exports.compareWasteTodayWithMonthlyAverage = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const sequelize = req.app.locals.sequelize;
        const dailyAverage = await getDailyAverageWasteLastMonthQuery(sequelize, userId);
        const wasteToday = await getWasteTodayQuery(sequelize, userId);

        if (dailyAverage === 0) {
            return res.status(200).json({
                message: 'No data from last month to calculate the daily average.'
            });
        }

        const percentageDifference = ((dailyAverage - wasteToday) / dailyAverage) * 100;

        res.status(200).json({
            daily_average: dailyAverage,
            waste_today: wasteToday,
            percentage_difference: percentageDifference.toFixed(2)
        });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener la cantidad de basura desechada hoy
exports.getWasteToday = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const sequelize = req.app.locals.sequelize;
        const wasteToday = await getWasteTodayQuery(sequelize, userId);

        res.status(200).json({
            waste_today: wasteToday
        });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener estadísticas de desechos reciclables y no reciclables de todos los usuarios (último mes)
exports.getRecyclableWasteStatsAll = async (req, res) => {
    try {
        const sequelize = req.app.locals.sequelize;
        const result = await getRecyclableWasteStatsQueryAll(sequelize);

        res.status(200).json(result);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener el top 5 de ubicaciones con más cantidad de basura registrada de todos los usuarios (último mes)
exports.getTop5LocationsByWasteAll = async (req, res) => {
    try {
        const sequelize = req.app.locals.sequelize;
        const result = await getTop5LocationsByWasteQueryAll(sequelize);

        res.status(200).json(result);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener ahorro de agua de todos los usuarios (último mes)
exports.getWaterSavingsAll = async (req, res) => {
    try {
        const sequelize = req.app.locals.sequelize;
        const waterSavings = await getWaterSavingsQueryAll(sequelize);

        res.status(200).json({ water_savings: waterSavings });
    } catch (error) {
        console.log(error);
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener ahorro de CO2 de todos los usuarios (último mes)
exports.getCO2SavingsAll = async (req, res) => {
    try {
        const sequelize = req.app.locals.sequelize;
        const co2Savings = await getCO2SavingsQueryAll(sequelize);

        res.status(200).json({ co2_savings: co2Savings });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener el top 5 de tipos de desechos por peso de todos los usuarios (último mes)
exports.getTop5WasteTypesAll = async (req, res) => {
    try {
        const sequelize = req.app.locals.sequelize;
        const wasteTypes = await getTop5WasteTypesByWeightQueryAll(sequelize);

        res.status(200).json(wasteTypes);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Obtener la cantidad de basura ingresada en los últimos 7 días de todos los usuarios
exports.getWasteWeightLast7DaysAll = async (req, res) => {
    try {
        const sequelize = req.app.locals.sequelize;
        const wasteData = await getWasteWeightLast7DaysQueryAll(sequelize);

        res.status(200).json(wasteData);
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal Server Error' });
    }
};