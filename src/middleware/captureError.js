// midleware/captureError.js
const Sentry = require("@sentry/node");

// Función para capturar y manejar errores con Sentry
const captureError = (error) => {
    // Verificar si el entorno no es de pruebas
    if (process.env.NODE_ENV !== 'test') {
        // Capturar el error con Sentry solo si no es un entorno de pruebas
        Sentry.captureException(error);
    }
};

module.exports = captureError;