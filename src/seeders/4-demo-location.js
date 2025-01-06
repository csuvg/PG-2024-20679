'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    const locations = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/locations.json'), 'utf-8'));
    await queryInterface.bulkInsert('location', locations, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('location', null, {});
  }
};
