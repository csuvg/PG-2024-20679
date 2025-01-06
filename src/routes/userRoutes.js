// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { 
    validateRegister, 
    validateLogin, 
    validateUpdateNameAndBirthdate, 
    validateUpdatePassword 
} = require('../middleware/validateUser');

const router = express.Router();

// Ruta para subir la foto de perfil en base64
// La URL tendrá el formato /user/:id/upload-photo-base64 donde :id es el ID del usuario
router.put('/:id/upload-photo', userController.uploadProfilePhoto);

// Registrar un nuevo usuario, con validación de datos
router.post('/register', validateRegister, userController.createUser);

// Actualizar nombre y fecha de nacimiento de un usuario
router.put('/:id/update-name-birthdate', validateUpdateNameAndBirthdate, userController.updateNameAndBirthdate);

// Actualizar la contraseña de un usuario, validando la contraseña anterior
router.put('/:id/update-password', validateUpdatePassword, userController.updatePassword);

// Iniciar sesión de un usuario, con validación de email y contraseña
router.post('/login', validateLogin, userController.loginUser);

// Obtener un usuario por su ID
router.get('/:id', userController.getUser);

// Obtener todos los usuarios
router.get('/', userController.getUsers);

// Actualizar un usuario por su ID
router.put('/:id', userController.updateUser);

// Eliminar un usuario por su ID
router.delete('/:id', userController.deleteUser);

module.exports = router;
