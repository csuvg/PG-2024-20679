'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    const areas = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/areas.json'), 'utf-8'));
    await queryInterface.bulkInsert('area', areas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('area', null, {});
  }
};
