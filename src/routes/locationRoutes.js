// routes/locationRoutes.js
const express = require('express');
const locationController = require('../controllers/locationController');

const router = express.Router();

// Guardar una nueva ubicación, asociada a un usuario y área
router.post('/save', locationController.saveLocation);

// Crear una nueva ubicación directamente
router.post('/', locationController.createLocation);

// Obtener una ubicación por su ID
router.get('/:id', locationController.getLocation);

// Obtener todas las ubicaciones
router.get('/', locationController.getLocations);

// Actualizar una ubicación por su ID
router.put('/:id', locationController.updateLocation);

// Eliminar una ubicación por su ID
router.delete('/:id', locationController.deleteLocation);

module.exports = router;
