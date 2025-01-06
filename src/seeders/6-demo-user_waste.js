'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    const userWastes = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/user_wastes.json'), 'utf-8'));
    await queryInterface.bulkInsert('user_waste', userWastes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_waste', null, {});
  }
};
