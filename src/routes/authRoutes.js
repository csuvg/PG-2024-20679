// routes/authRoutes.js
const express = require('express');
const { generateToken } = require('../middleware/generateToken');

const router = express.Router();

// Ruta para generar el token
router.post('/token', generateToken);

module.exports = router;
