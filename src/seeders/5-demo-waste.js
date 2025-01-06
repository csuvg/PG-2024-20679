'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    const wastes = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/wastes.json'), 'utf-8'));
    await queryInterface.bulkInsert('waste', wastes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('waste', null, {});
  }
};
