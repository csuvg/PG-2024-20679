// routes/wasteRoutes.js
const express = require('express');
const wasteController = require('../controllers/wasteController');

const router = express.Router();

// Ruta para crear un nuevo Waste y su relación con WasteType
router.post('/', wasteController.createWaste);

// Ruta para obtener un Waste y su WasteType relacionado
router.get('/:id', wasteController.getWaste);

// Ruta para actualizar un Waste y su relación con WasteType
router.put('/:id', wasteController.updateWaste);

// Ruta para eliminar un Waste y su relación con WasteType
router.delete('/:id', wasteController.deleteWaste);

module.exports = router;
