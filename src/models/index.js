// models/index.js
const sequelize = require('../config/database');  // Importa la configuración de la base de datos
const User = require('./User');                   // Importa el modelo de usuario
const Waste = require('./Waste');                 // Importa el modelo de desecho
const UserWaste = require('./UserWaste');         // Importa el modelo de registro de desecho de usuario
const Location = require('./Location');           // Importa el modelo de ubicación
const Area = require('./Area');                   // Importa el modelo de área
const WasteType = require('./WasteType');         // Importa el modelo de tipo de desecho

// Definir asociaciones entre los modelos

// Un usuario puede tener muchas ubicaciones (relación uno a muchos)
User.hasMany(Location, { foreignKey: 'user_id' });  // Relaciona usuario con ubicaciones
Location.belongsTo(User, { foreignKey: 'user_id' });  // Relaciona ubicación con su respectivo usuario

// Un usuario puede tener muchos registros de desecho (relación uno a muchos)
User.hasMany(UserWaste, { foreignKey: 'user_id' });  // Relaciona usuario con registros de desecho
UserWaste.belongsTo(User, { foreignKey: 'user_id' });  // Relaciona registro de desecho con su respectivo usuario

// Un desecho puede estar asociado con muchos registros de usuario (relación uno a muchos)
Waste.hasMany(UserWaste, { foreignKey: 'waste_id' });  // Relaciona desecho con registros de usuario
UserWaste.belongsTo(Waste, { foreignKey: 'waste_id' });  // Relaciona registro de desecho con su respectivo desecho

// Una ubicación puede tener muchos registros de desecho (relación uno a muchos)
Location.hasMany(UserWaste, { foreignKey: 'location_id' });  // Relaciona ubicación con registros de desecho
UserWaste.belongsTo(Location, { foreignKey: 'location_id' });  // Relaciona registro de desecho con su respectiva ubicación

// Un área puede tener muchas ubicaciones (relación uno a muchos)
Area.hasMany(Location, { foreignKey: 'area_id' });  // Relaciona área con ubicaciones
Location.belongsTo(Area, { foreignKey: 'area_id' });  // Relaciona ubicación con su respectiva área

// Exportar los modelos y la conexión a la base de datos
module.exports = {
    sequelize,  // Exporta la instancia de Sequelize para su uso en otras partes del proyecto
    User,       // Exporta el modelo User
    Waste,      // Exporta el modelo Waste
    UserWaste,  // Exporta el modelo UserWaste
    Location,   // Exporta el modelo Location
    Area,       // Exporta el modelo Area
    WasteType   // Exporta el modelo WasteType
};
