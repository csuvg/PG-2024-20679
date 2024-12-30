// Importar el archivo `instrument.js` para configurar Sentry
require("./middleware/instrument.js");

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const userWasteRoutes = require('./routes/userWasteRoutes');
const locationRoutes = require('./routes/locationRoutes');
const areaRoutes = require('./routes/areaRoutes');
const wasteTypeRoutes = require('./routes/wasteTypeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const authRoutes = require('./routes/authRoutes');
const jwtAuth = require('./middleware/jwtAuth');
const Sentry = require("@sentry/node");

const app = express();
app.disable('x-powered-by');

// Configurar puerto para ser desplegado
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(bodyParser.json());

// Guardar la instancia de sequelize en app.locals para que esté disponible globalmente
app.locals.sequelize = sequelize;

// Sincronizar la base de datos
sequelize.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.log('Error: ' + err));

// Aplicar el middleware de autenticación JWT a las rutas protegidas
// Solo se aplicará en producción debido al middleware configurado
app.use(jwtAuth);

// Usar las rutas
app.use('/user', userRoutes);
app.use('/waste', wasteRoutes);
app.use('/userwaste', userWasteRoutes);
app.use('/location', locationRoutes);
app.use('/area', areaRoutes);
app.use('/wastetype', wasteTypeRoutes);
app.use('/analysis', analysisRoutes);
app.use('/auth', authRoutes);

// Configurar Sentry
Sentry.setupExpressErrorHandler(app);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
