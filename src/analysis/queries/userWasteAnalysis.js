// analysis/queries/userWasteAnalysis.js
const { QueryTypes } = require('sequelize');

// Obtener estadísticas de desechos reciclables y no reciclables por usuario (último mes)
exports.getRecyclableWasteStatsQuery = async (sequelize, userId) => {
    const query = `
        SELECT 
            COALESCE(SUM(CASE WHEN w.is_recyclable = TRUE THEN uw.weight ELSE 0 END), 0) AS recyclable_weight,
            COALESCE(SUM(CASE WHEN w.is_recyclable = FALSE THEN uw.weight ELSE 0 END), 0) AS non_recyclable_weight
        FROM user_waste uw
        JOIN waste w ON uw.waste_id = w.id
        WHERE uw.user_id = :userId
        AND uw.datetime >= NOW() - INTERVAL '1 MONTH';
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId }
    });

    return {
        recyclable_weight: result[0]?.recyclable_weight || 0,
        non_recyclable_weight: result[0]?.non_recyclable_weight || 0
    };
};

// Obtener el top 5 de ubicaciones con más cantidad de basura registrada por usuario (último mes)
exports.getTop5LocationsByWasteQuery = async (sequelize, userId) => {
    const query = `
        SELECT 
            l.name AS location_name,
            COALESCE(SUM(uw.weight), 0) AS total_weight
        FROM user_waste uw
        JOIN location l ON uw.location_id = l.id
        WHERE uw.user_id = :userId
        AND uw.datetime >= NOW() - INTERVAL '1 MONTH'
        GROUP BY l.name
        ORDER BY total_weight DESC
        LIMIT 5;
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId }
    });

    return result.length > 0 ? result : [{ location_name: 'N/A', total_weight: 0 }];
};

// Obtener el ahorro de agua para el usuario (último mes)
exports.getWaterSavingsQuery = async (sequelize, userId) => {
    const query = `
        SELECT 
            COALESCE(SUM(uw.weight * wt.water_savings_index), 0) AS total_water_savings
        FROM user_waste uw
        JOIN waste w ON uw.waste_id = w.id
        JOIN waste_type wt ON w.waste_type_id = wt.id
        WHERE uw.user_id = :userId
        AND uw.datetime >= NOW() - INTERVAL '1 MONTH';
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId }
    });

    return result[0]?.total_water_savings || 0;
};

// Obtener el ahorro de emisiones de CO2 para el usuario (último mes)
exports.getCO2SavingsQuery = async (sequelize, userId) => {
    const query = `
        SELECT 
            COALESCE(SUM(uw.weight * wt.co2_emission_index), 0) AS total_co2_savings
        FROM user_waste uw
        JOIN waste w ON uw.waste_id = w.id
        JOIN waste_type wt ON w.waste_type_id = wt.id
        WHERE uw.user_id = :userId
        AND uw.datetime >= NOW() - INTERVAL '1 MONTH';
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId }
    });

    return result[0]?.total_co2_savings || 0;
};

// Obtener el top 5 de tipos de desechos por peso (último mes)
exports.getTop5WasteTypesByWeightQuery = async (sequelize, userId) => {
    const query = `
        SELECT 
            wt.type_name AS waste_type,
            COALESCE(SUM(uw.weight), 0) AS total_weight
        FROM user_waste uw
        JOIN waste w ON uw.waste_id = w.id
        JOIN waste_type wt ON w.waste_type_id = wt.id
        WHERE uw.user_id = :userId
        AND uw.datetime >= NOW() - INTERVAL '1 MONTH'
        GROUP BY wt.type_name
        ORDER BY total_weight DESC
        LIMIT 5;
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId }
    });

    return result;
};

// Obtener la cantidad de basura ingresada en los últimos 7 días
exports.getWasteWeightLast7DaysQuery = async (sequelize, userId) => {
    const query = `
        SELECT 
            TO_CHAR(uw.datetime, 'DD/MM') AS day_month,
            COALESCE(SUM(uw.weight), 0) AS total_weight
        FROM user_waste uw
        WHERE uw.user_id = :userId
        AND uw.datetime >= NOW() - INTERVAL '7 DAYS'
        GROUP BY TO_CHAR(uw.datetime, 'DD/MM')
        ORDER BY TO_CHAR(uw.datetime, 'DD/MM');
    `;
    
    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId },
    });

    return result;
};

// Obtener el promedio diario de desechos del último mes
exports.getDailyAverageWasteLastMonthQuery = async (sequelize, userId) => {
    const query = `
        SELECT 
            COALESCE(SUM(uw.weight) / COUNT(DISTINCT TO_CHAR(uw.datetime, 'YYYY-MM-DD')), 0) AS daily_average
        FROM user_waste uw
        WHERE uw.user_id = :userId
        AND uw.datetime >= NOW() - INTERVAL '1 MONTH';
    `;
    
    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId },
    });

    return result[0]?.daily_average || 0;
};

// Obtener la cantidad de basura desechada hoy
exports.getWasteTodayQuery = async (sequelize, userId) => {
    const query = `
        SELECT 
            COALESCE(SUM(uw.weight), 0) AS total_today
        FROM user_waste uw
        WHERE uw.user_id = :userId
        AND DATE(uw.datetime) = CURRENT_DATE;
    `;
    
    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { userId },
    });

    return result[0]?.total_today || 0;
};

// Obtener estadísticas de desechos reciclables y no reciclables de todos los usuarios (último mes)
exports.getRecyclableWasteStatsQueryAll = async (sequelize) => {
    const query = `
        SELECT 
            COALESCE(SUM(CASE WHEN w.is_recyclable = TRUE THEN uw.weight ELSE 0 END), 0) AS recyclable_weight,
            COALESCE(SUM(CASE WHEN w.is_recyclable = FALSE THEN uw.weight ELSE 0 END), 0) AS non_recyclable_weight
        FROM user_waste uw
        JOIN waste w ON uw.waste_id = w.id
        WHERE uw.datetime >= NOW() - INTERVAL '1 MONTH';
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT
    });

    return {
        recyclable_weight: result[0]?.recyclable_weight || 0,
        non_recyclable_weight: result[0]?.non_recyclable_weight || 0
    };
};

// Obtener el top 5 de ubicaciones con más cantidad de basura registrada de todos los usuarios (último mes)
exports.getTop5LocationsByWasteQueryAll = async (sequelize) => {
    const query = `
        SELECT 
            l.name AS location_name,
            COALESCE(SUM(uw.weight), 0) AS total_weight
        FROM user_waste uw
        JOIN location l ON uw.location_id = l.id
        WHERE uw.datetime >= NOW() - INTERVAL '1 MONTH'
        GROUP BY l.name
        ORDER BY total_weight DESC
        LIMIT 5;
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT
    });

    return result.length > 0 ? result : [{ location_name: 'N/A', total_weight: 0 }];
};

// Obtener el ahorro de agua de todos los usuarios (último mes)
exports.getWaterSavingsQueryAll = async (sequelize) => {
    const query = `
        SELECT 
            COALESCE(SUM(uw.weight * wt.water_savings_index), 0) AS total_water_savings
        FROM user_waste uw
        JOIN waste w ON uw.waste_id = w.id
        JOIN waste_type wt ON w.waste_type_id = wt.id
        WHERE uw.datetime >= NOW() - INTERVAL '1 MONTH';
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT
    });

    return result[0]?.total_water_savings || 0;
};

// Obtener el ahorro de CO2 de todos los usuarios (último mes)
exports.getCO2SavingsQueryAll = async (sequelize) => {
    const query = `
        SELECT 
            COALESCE(SUM(uw.weight * wt.co2_emission_index), 0) AS total_co2_savings
        FROM user_waste uw
        JOIN waste w ON uw.waste_id = w.id
        JOIN waste_type wt ON w.waste_type_id = wt.id
        WHERE uw.datetime >= NOW() - INTERVAL '1 MONTH';
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT
    });

    return result[0]?.total_co2_savings || 0;
};

// Obtener el top 5 de tipos de desechos por peso de todos los usuarios (último mes)
exports.getTop5WasteTypesByWeightQueryAll = async (sequelize) => {
    const query = `
        SELECT 
            wt.type_name AS waste_type,
            COALESCE(SUM(uw.weight), 0) AS total_weight
        FROM user_waste uw
        JOIN waste w ON uw.waste_id = w.id
        JOIN waste_type wt ON w.waste_type_id = wt.id
        WHERE uw.datetime >= NOW() - INTERVAL '1 MONTH'
        GROUP BY wt.type_name
        ORDER BY total_weight DESC
        LIMIT 5;
    `;

    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT
    });

    return result;
};

// Obtener la cantidad de basura ingresada en los últimos 7 días de todos los usuarios
exports.getWasteWeightLast7DaysQueryAll = async (sequelize) => {
    const query = `
        SELECT 
            TO_CHAR(uw.datetime, 'DD/MM') AS day_month,
            COALESCE(SUM(uw.weight), 0) AS total_weight
        FROM user_waste uw
        WHERE uw.datetime >= NOW() - INTERVAL '7 DAYS'
        GROUP BY TO_CHAR(uw.datetime, 'DD/MM')
        ORDER BY TO_CHAR(uw.datetime, 'DD/MM');
    `;
    
    const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
    });

    return result;
};