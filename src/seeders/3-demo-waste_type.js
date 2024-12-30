'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    const wasteTypes = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/waste_types.json'), 'utf-8'));
    await queryInterface.bulkInsert('waste_type', wasteTypes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('waste_type', null, {});
  }
};
