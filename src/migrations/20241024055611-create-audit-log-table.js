'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_log', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      operation_type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      table_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      record_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      old_values: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      new_values: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      performed_by: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      timestamp: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('audit_log');
  }
};
