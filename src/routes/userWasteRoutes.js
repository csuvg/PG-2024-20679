// routes/userWasteRoutes.js
const express = require('express');
const userWasteController = require('../controllers/userWasteController');

const router = express.Router();

// Crear un registro de UserWaste
router.post('/', userWasteController.createUserWaste);

// Registrar un UserWaste con cálculos automáticos de peso si aplica
router.post('/makeregister', userWasteController.makeRegister);

// Obtener un UserWaste por su ID
router.get('/:id', userWasteController.getUserWaste);

// Obtener todos los UserWastes
router.get('/', userWasteController.getUserWastes);

// Actualizar un UserWaste por su ID
router.put('/:id', userWasteController.updateUserWaste);

// Eliminar un UserWaste por su ID
router.delete('/:id', userWasteController.deleteUserWaste);

module.exports = router;
