// routes/wasteTypeRoutes.js
const express = require('express');
const wasteTypeController = require('../controllers/wasteTypeController');

const router = express.Router();

// Ruta para crear un nuevo WasteType
router.post('/', wasteTypeController.createWasteType);

// Ruta para obtener un WasteType por su ID
router.get('/:id', wasteTypeController.getWasteType);

// Ruta para actualizar un WasteType por su ID
router.put('/:id', wasteTypeController.updateWasteType);

// Ruta para eliminar un WasteType por su ID
router.delete('/:id', wasteTypeController.deleteWasteType);

module.exports = router;
