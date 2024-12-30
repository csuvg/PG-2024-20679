// middleware/jwtAuth.js
const jwt = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
    // Definir las rutas que deseas excluir del middleware de autenticación
    const excludedPaths = ['/auth/token', '/user/login', '/user/register'];

    // Verificar si la ruta actual está en la lista de rutas excluidas o si el entorno no es producción
    if (excludedPaths.includes(req.path) || process.env.NODE_ENV !== 'production') {
        return next(); // Omitir autenticación para estas rutas
    }

    // Obtener el encabezado de autorización
    const authHeader = req.header('Authorization');

    // Verificar si el encabezado existe y tiene el formato adecuado
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    // Extraer el token del encabezado
    const token = authHeader.replace('Bearer ', '');

    // Verificar el token JWT
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Agregar los datos decodificados del usuario a la solicitud
        next(); // Pasar al siguiente middleware o ruta
    } catch (error) {
        // Manejar errores específicos de JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Otro tipo de error
        return res.status(500).json({ error: 'Failed to authenticate token' });
    }
};

module.exports = jwtAuth;
