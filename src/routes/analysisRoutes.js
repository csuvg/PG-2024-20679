// routes/analysisRoutes.js
const express = require('express');
const analysisController = require('../analysis/analysisController');

const router = express.Router();

// Rutas para los análisis
router.get('/recyclable-waste/:userId', analysisController.getRecyclableWasteStats);
router.get('/top5-locations/:userId', analysisController.getTop5LocationsByWaste);
router.get('/water-savings/:userId', analysisController.getWaterSavings);
router.get('/co2-savings/:userId', analysisController.getCO2Savings);
router.get('/top5-waste-types/:userId', analysisController.getTop5WasteTypes);
router.get('/waste-last7days/:userId', analysisController.getWasteWeightLast7Days);
router.get('/compare-waste-today/:userId', analysisController.compareWasteTodayWithMonthlyAverage);
router.get('/waste-today/:userId', analysisController.getWasteToday);

// Rutas para el análisis general de todos los usuarios
router.get('/all/recyclable-waste-stats', analysisController.getRecyclableWasteStatsAll);
router.get('/all/top5-locations', analysisController.getTop5LocationsByWasteAll);
router.get('/all/water-savings', analysisController.getWaterSavingsAll);
router.get('/all/co2-savings', analysisController.getCO2SavingsAll);
router.get('/all/top5-waste-types', analysisController.getTop5WasteTypesAll);
router.get('/all/waste-weight-last7days', analysisController.getWasteWeightLast7DaysAll);

module.exports = router;
