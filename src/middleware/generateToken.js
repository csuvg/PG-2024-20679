// middleware/generateToken.js
const jwt = require('jsonwebtoken');

// Función para manejar toda la lógica de autenticación y generación de token
exports.generateToken = (req, res) => {
    const { username, password } = req.body;

    // Validar credenciales
    if (username === process.env.API_USER && password === process.env.API_PASS) {
        // Generar el token JWT con un tiempo de expiración
        const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Devolver el token en la respuesta
        return res.json({ token });
    } else {
        // Si las credenciales no son válidas, devolver un error
        return res.status(401).json({ error: 'Invalid credentials' });
    }
};
