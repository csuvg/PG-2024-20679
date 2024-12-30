// routes/areaRoutes.js
const express = require('express');
const areaController = require('../controllers/areaController');

const router = express.Router();

// Crear un nuevo área
router.post('/', areaController.createArea);

// Obtener un área por su ID
router.get('/:id', areaController.getArea);

// Obtener todas las áreas
router.get('/', areaController.getAreas);

// Actualizar un área por su ID
router.put('/:id', areaController.updateArea);

// Eliminar un área por su ID
router.delete('/:id', areaController.deleteArea);

module.exports = router;
