'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Cargar datos desde el archivo JSON
    const users = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/users.json'), 'utf-8'));

    // Insertar los datos en la tabla `user`
    await queryInterface.bulkInsert('user', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user', null, {});
  }
};
